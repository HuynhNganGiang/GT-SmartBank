using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

using GTSmartBank.Data;
using GTSmartBank.DTOs;
using GTSmartBank.Helpers;
using GTSmartBank.Models;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/auth")]
    [ApiController]
    [Tags("Xác thực")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [AllowAnonymous]
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDTO model)
{
    if (model == null ||
        string.IsNullOrWhiteSpace(model.HoTen) ||
        string.IsNullOrWhiteSpace(model.SoDienThoai) ||
        string.IsNullOrWhiteSpace(model.MatKhau))
    {
        return BadRequest(ApiResponse<object>.ErrorResult(400, "Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu."));
    }

    var existedPhone = await _context.KhachHang
        .AnyAsync(x => x.SoDienThoai == model.SoDienThoai);

    if (existedPhone)
    {
        return BadRequest(ApiResponse<object>.ErrorResult(400, "Số điện thoại đã tồn tại."));
    }

    var khachHang = new KhachHang
    {
        HoTen = model.HoTen.Trim(),
        SoDienThoai = model.SoDienThoai.Trim(),
        CCCD = Guid.NewGuid().ToString("N").Substring(0, 12),
        Email = string.IsNullOrWhiteSpace(model.Email)
            ? model.SoDienThoai.Trim() + "@gtsmartbank.com.vn"
            : model.Email.Trim(),
        DiaChi = model.DiaChi ?? "",
        MatKhauHash = PasswordHasher.HashPassword(model.MatKhau),
        TrangThai = true,
        Role = "User"
    };

    _context.KhachHang.Add(khachHang);
    await _context.SaveChangesAsync();

    var result = new
    {
        khachHang.MaKH,
        khachHang.HoTen,
        khachHang.SoDienThoai,
        khachHang.Email,
        khachHang.Role
    };

    return Ok(ApiResponse<object>.SuccessResult(result, "Đăng ký tài khoản thành công."));
}
         [HttpPost("login")]
          public async Task<IActionResult> Login([FromBody] LoginDTO model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.SoDienThoai) || string.IsNullOrWhiteSpace(model.MatKhau))
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Số điện thoại và mật khẩu không được để trống."));
            }

            var user = await _context.KhachHang
                .FirstOrDefaultAsync(x => x.SoDienThoai == model.SoDienThoai);

            if (user == null || !PasswordHasher.VerifyPassword(model.MatKhau, user.MatKhauHash))
            {
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Sai số điện thoại hoặc mật khẩu."));
            }

            if (!user.TrangThai)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Tài khoản của bạn đã bị khóa."));
            }

            var accessToken = CreateJwtToken(user);

            var refreshToken = new RefreshToken
            {
                UserId = user.MaKH,
                Token = Guid.NewGuid().ToString(),
                ExpiryDate = DateTime.Now.AddDays(7),
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            var authData = new
            {
                accessToken,
                refreshToken = refreshToken.Token,
                expiresInMinutes = 15,
                user = new CustomerDTO
                {
                    MaKH = user.MaKH,
                    HoTen = user.HoTen,
                    SoDienThoai = user.SoDienThoai,
                    Email = user.Email,
                    DiaChi = user.DiaChi,
                    Role = user.Role,
                    TrangThai = user.TrangThai
                }
            };

            return Ok(ApiResponse<object>.SuccessResult(authData, "Đăng nhập thành công."));
        }

        [AllowAnonymous]
         [HttpPost("refresh")]
         public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Refresh token không được để trống."));
            }

            var tokenInDb = await _context.RefreshTokens
                .FirstOrDefaultAsync(x => x.Token == refreshToken);

            if (tokenInDb == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Refresh token không hợp lệ."));
            }

            // PHÁT HIỆN TẤN CÔNG PHÁT LẠI (Replay Attack Detection)
            if (tokenInDb.IsRevoked)
            {
                // Thu hồi toàn bộ các Refresh Token đang hoạt động của người dùng này để vô hiệu hóa tất cả các phiên làm việc
                var allActiveTokens = await _context.RefreshTokens
                    .Where(x => x.UserId == tokenInDb.UserId && !x.IsRevoked)
                    .ToListAsync();

                foreach (var t in allActiveTokens)
                {
                    t.IsRevoked = true;
                }
                await _context.SaveChangesAsync();

                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Cảnh báo an toàn: Hệ thống phát hiện nỗ lực sử dụng lại mã token cũ. Vì lý do bảo mật, tất cả các phiên làm việc của tài khoản này trên mọi thiết bị đã bị vô hiệu hóa. Vui lòng đăng nhập lại."));
            }

            if (tokenInDb.ExpiryDate < DateTime.Now)
            {
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Refresh token đã hết hạn."));
            }

            var user = await _context.KhachHang
                .FirstOrDefaultAsync(x => x.MaKH == tokenInDb.UserId);

            if (user == null || !user.TrangThai)
            {
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Người dùng không tồn tại hoặc tài khoản đã bị khóa."));
            }

            // Revoke current refresh token
            tokenInDb.IsRevoked = true;

            var newAccessToken = CreateJwtToken(user);

            var newRefreshToken = new RefreshToken
            {
                UserId = user.MaKH,
                Token = Guid.NewGuid().ToString(),
                ExpiryDate = DateTime.Now.AddDays(7),
                IsRevoked = false
            };

            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            var authData = new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken.Token,
                expiresInMinutes = 15
            };

            return Ok(ApiResponse<object>.SuccessResult(authData, "Làm mới token thành công."));
        }

        private string CreateJwtToken(KhachHang user)
        {
            var role = string.IsNullOrWhiteSpace(user.Role) ? "User" : user.Role;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.MaKH.ToString()),
                new Claim(ClaimTypes.Name, user.HoTen),
                new Claim("SoDienThoai", user.SoDienThoai),
                new Claim(ClaimTypes.Role, role)
            };

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new Exception("Thiếu cấu hình Jwt:Key trong appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}