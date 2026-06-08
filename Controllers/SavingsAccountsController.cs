using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Services;

namespace GTSmartBank.Controllers
{
    [Route("api/savings-accounts")]
    [ApiController]
    [Authorize(Roles = "User,Admin,Staff")]
    [Tags("Sổ tiết kiệm")]
    public class SavingsAccountsController : ControllerBase
    {
        private readonly ISavingsAccountService _savingsAccountService;
        private readonly IAccountService _accountService;

        public SavingsAccountsController(ISavingsAccountService savingsAccountService, IAccountService accountService)
        {
            _savingsAccountService = savingsAccountService;
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            if (currentUserRoleClaim == "Admin" || currentUserRoleClaim == "Staff")
            {
                var all = await _savingsAccountService.GetAllSavingsAccountsAsync();
                return Ok(ApiResponse<IEnumerable<SavingsAccountDTO>>.SuccessResult(all, "Lấy danh sách tất cả sổ tiết kiệm thành công."));
            }

            int customerId = int.Parse(currentUserIdClaim);
            var userSavings = await _savingsAccountService.GetSavingsAccountsByCustomerAsync(customerId);
            return Ok(ApiResponse<IEnumerable<SavingsAccountDTO>>.SuccessResult(userSavings, "Lấy danh sách sổ tiết kiệm của bạn thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            var stk = await _savingsAccountService.GetSavingsAccountDetailsAsync(id);

            if (stk == null)
                return NotFound(ApiResponse<object>.ErrorResult(404, "Không tìm thấy sổ tiết kiệm."));

            if (currentUserRoleClaim != "Admin" && currentUserRoleClaim != "Staff")
            {
                var account = await _accountService.GetAccountDetailsAsync(stk.SoTaiKhoan);

                if (account == null || account.MaKH.ToString() != currentUserIdClaim)
                    return Forbid();
            }

            return Ok(ApiResponse<SavingsAccountDTO>.SuccessResult(stk, "Lấy thông tin sổ tiết kiệm thành công."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Open([FromBody] CreateSavingsAccountDTO request)
        {
            if (request == null)
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu yêu cầu không hợp lệ."));

            try
            {
                var created = await _savingsAccountService.OpenSavingsAccountAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.MaSo },
                    ApiResponse<SavingsAccountDTO>.SuccessResult(created, "Mở sổ tiết kiệm thành công."));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, ex.Message));
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, ApiResponse<object>.ErrorResult(500, "Đã xảy ra lỗi hệ thống: " + errorMessage));
            }
        }

        [HttpPost("{id}/settle")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Settle(string id)
        {
            var stk = await _savingsAccountService.GetSavingsAccountDetailsAsync(id);

            if (stk == null)
                return NotFound(ApiResponse<object>.ErrorResult(404, "Không tìm thấy sổ tiết kiệm."));

            try
            {
                var settled = await _savingsAccountService.SettleSavingsAccountAsync(id);
                return Ok(ApiResponse<SavingsAccountDTO>.SuccessResult(settled, "Tất toán sổ tiết kiệm thành công."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, ex.Message));
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, ApiResponse<object>.ErrorResult(500, "Đã xảy ra lỗi hệ thống: " + errorMessage));
            }
        }
    }
}