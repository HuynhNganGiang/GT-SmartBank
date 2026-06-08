using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GTSmartBank.Data;
using GTSmartBank.Models;

namespace GTSmartBank.Controllers
{
    [Route("api/otps")]
    [ApiController]
    [Authorize(Roles = "User,Admin,Staff")]
    [Tags("Xác thực OTP")]
    public class OtpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OtpController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("tao-otp")]
        public async Task<IActionResult> TaoOTP()
        {
            try
            {
                var maKhClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(maKhClaim))
                    return Unauthorized("Không lấy được MaKH từ token");

                int maKH = int.Parse(maKhClaim);

                var taiKhoan = await _context.TaiKhoan
                    .FirstOrDefaultAsync(x => x.MaKH == maKH);

                if (taiKhoan == null)
                    return BadRequest("Không tìm thấy tài khoản.");

                var code = Random.Shared.Next(100000, 999999).ToString();

                var otp = new LichSuOTP
                {
                    MaGD = null,
                    MaCode = code,
                    ThoiGianTao = DateTime.Now,
                    ThoiGianHetHan = DateTime.Now.AddMinutes(3),
                    TrangThaiXacNhan = false,
                    SoTaiKhoan = taiKhoan.SoTaiKhoan
                };

                _context.LichSuOTP.Add(otp);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Tạo OTP thành công",
                    otp = code,
                    maKH = maKH,
                    hetHanSauPhut = 3
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi khi tạo OTP",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromQuery] string soTaiKhoan)
        {
            var maKhClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(maKhClaim))
                return Unauthorized("Không lấy được MaKH từ token");

            var taiKhoan = await _context.TaiKhoan
                .FirstOrDefaultAsync(x => x.SoTaiKhoan == soTaiKhoan);

            if (taiKhoan == null)
                return BadRequest("Không tìm thấy tài khoản.");

            if (roleClaim != "Admin" &&
                roleClaim != "Staff" &&
                taiKhoan.MaKH.ToString() != maKhClaim)
            {
                return Forbid();
            }

            var code = Random.Shared.Next(100000, 999999).ToString();

            var otp = new LichSuOTP
            {
                MaGD = null,
                MaCode = code,
                ThoiGianTao = DateTime.Now,
                ThoiGianHetHan = DateTime.Now.AddMinutes(3),
                TrangThaiXacNhan = false,
                SoTaiKhoan = taiKhoan.SoTaiKhoan
            };

            _context.LichSuOTP.Add(otp);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Tạo OTP thành công",
                data = new
                {
                    otp = code,
                    soTaiKhoan = taiKhoan.SoTaiKhoan,
                    hetHanSauPhut = 3
                }
            });
        }
    }
}