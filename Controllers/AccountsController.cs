using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Models;
using GTSmartBank.Services;

namespace GTSmartBank.Controllers
{
    [Route("api/accounts")]
    [ApiController]
    [Authorize(Roles = "User,Admin,Staff")]
    [Tags("Tài khoản")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            var list = await _accountService.GetAllAccountsAsync();

            if (currentUserRoleClaim != "Admin" && currentUserRoleClaim != "Staff")
            {
                int maKH = int.Parse(currentUserIdClaim);
                list = list.Where(x => x.MaKH == maKH);
            }

            return Ok(ApiResponse<IEnumerable<AccountDTO>>.SuccessResult(list, "Lấy danh sách tài khoản thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByNumber(string id)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            var account = await _accountService.GetAccountDetailsAsync(id);

            if (account == null)
                return NotFound(ApiResponse<object>.ErrorResult(404, "Tài khoản không tồn tại."));

            if (currentUserRoleClaim != "Admin" &&
                currentUserRoleClaim != "Staff" &&
                account.MaKH.ToString() != currentUserIdClaim)
            {
                return Forbid();
            }

            return Ok(ApiResponse<AccountDTO>.SuccessResult(account, "Lấy thông tin tài khoản thành công."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] TaiKhoan account)
        {
            if (account == null)
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));

            try
            {
                var created = await _accountService.CreateAccountAsync(account);
                return CreatedAtAction(nameof(GetByNumber), new { id = created.SoTaiKhoan },
                    ApiResponse<AccountDTO>.SuccessResult(created, "Mở tài khoản thành công."));
            }
            catch (System.Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(ApiResponse<object>.ErrorResult(400, errorMessage));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(string id, [FromBody] TaiKhoan account)
        {
            if (account == null || id != account.SoTaiKhoan)
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));

            try
            {
                await _accountService.UpdateAccountAsync(id, account);
                return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật tài khoản thành công."));
            }
            catch (System.Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _accountService.DeleteAccountAsync(id);
                return Ok(ApiResponse<object>.SuccessResult(null, "Xóa tài khoản thành công."));
            }
            catch (System.Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
        }
    }
}