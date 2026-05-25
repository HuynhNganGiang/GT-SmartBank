using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using GTSmartBank.DTOs;
using GTSmartBank.Models;
using GTSmartBank.Services;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/transactions")]
    [ApiController]
    [Authorize]
    [Tags("Giao dịch")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpPost("transfer")]
        [Tags("Chuyển tiền")]
        public async Task<IActionResult> Transfer([FromBody] ChuyenTienDTO model)
        {
            if (model == null)
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu giao dịch không hợp lệ."));

            if (string.IsNullOrWhiteSpace(model.TK_Nguon) || string.IsNullOrWhiteSpace(model.TK_Dich))
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Tài khoản nguồn và đích không được để trống."));

            if (model.SoTien <= 0)
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Số tiền chuyển phải lớn hơn 0."));

            if (string.IsNullOrWhiteSpace(model.MaOTP))
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Vui lòng nhập mã xác thực OTP."));

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            try
            {
                var gd = await _transactionService.TransferAsync(
                    model.TK_Nguon, 
                    model.TK_Dich, 
                    model.SoTien, 
                    model.NoiDung, 
                    model.MaOTP
                );

                var responseData = new
                {
                    maGD = gd.MaGD,
                    taiKhoanNguon = gd.TK_Nguon,
                    taiKhoanDich = gd.TK_Dich,
                    soTien = gd.SoTien,
                    thoiGian = gd.ThoiGianGD,
                    loaiGD = gd.LoaiGD,
                    noiDung = gd.NoiDung,
                    trangThai = gd.TrangThai
                };

                return Ok(ApiResponse<object>.SuccessResult(responseData, "Chuyển tiền thành công."));
            }
            catch (System.Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _transactionService.GetAllTransactionsAsync();
            return Ok(ApiResponse<IEnumerable<TransactionDTO>>.SuccessResult(list, "Lấy danh sách giao dịch thành công."));
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            int maKH = int.Parse(currentUserIdClaim);
            var list = await _transactionService.GetTransactionsByCustomerAsync(maKH);
            return Ok(ApiResponse<IEnumerable<TransactionDTO>>.SuccessResult(list, "Lấy lịch sử giao dịch cá nhân thành công."));
        }
    }
}
