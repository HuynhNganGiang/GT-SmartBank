using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GTSmartBank.Data;
using GTSmartBank.Models;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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
            var maKhClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(maKhClaim))
                return Unauthorized("Không lấy được MaKH từ token");

            int maKH = int.Parse(maKhClaim);

            var code = Random.Shared.Next(100000, 999999).ToString();

            var otp = new LichSuOTP
            {
                MaGD = null,
                MaCode = code,
                ThoiGianTao = DateTime.Now,
                ThoiGianHetHan = DateTime.Now.AddMinutes(3),
                TrangThaiXacNhan = false
            };

            _context.LichSuOTP.Add(otp);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo OTP thành công",
                otp = code,
                hetHanSauPhut = 3
            });
        }
    }
}