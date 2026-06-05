using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Services;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/otps")]
    [ApiController]
    [Authorize(Roles = "User,Admin")]
    [Tags("Xác thực OTP")]
    public class OtpsController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IAccountService _accountService;

        public OtpsController(IOtpService otpService, IAccountService accountService)
        {
            _otpService = otpService;
            _accountService = accountService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateOtp([FromQuery] string soTaiKhoan)
        {
            if (string.IsNullOrWhiteSpace(soTaiKhoan))
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Vui lòng cung cấp số tài khoản."));
            }

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            // Verify account ownership
            var account = await _accountService.GetAccountByNumberAsync(soTaiKhoan);
            if (account == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, "Tài khoản nguồn không tồn tại."));
            }

            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            // Restrict OTP generation to account owner, unless Admin
            if (currentUserRoleClaim != "Admin" && account.MaKH.ToString() != currentUserIdClaim)
            {
                return Forbid();
            }

            try
            {
                var code = await _otpService.GenerateOtpAsync(soTaiKhoan);
                var data = new
                {
                    otp = code,
                    hetHanSauPhut = 3
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "Tạo mã OTP thành công. Vui lòng kiểm tra tin nhắn."));
            }
            catch (System.Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(ApiResponse<object>.ErrorResult(400, errorMessage));
            }
        }
    }
}
