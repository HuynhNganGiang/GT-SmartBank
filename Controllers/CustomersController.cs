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
    [Route("api/customers")]
    [ApiController]
    [Authorize(Roles = "User,Admin")]
    [Tags("Khách hàng")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _customerService.GetAllCustomersAsync();
            return Ok(ApiResponse<IEnumerable<CustomerDTO>>.SuccessResult(list, "Lấy danh sách khách hàng thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(currentUserIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult(401, "Không lấy được thông tin người dùng từ token."));

            // Check if current user is Admin OR is fetching their own profile
            if (currentUserRoleClaim != "Admin" && currentUserIdClaim != id.ToString())
            {
                return Forbid();
            }

            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, "Không tìm thấy khách hàng."));
            }

            return Ok(ApiResponse<CustomerDTO>.SuccessResult(customer, "Lấy thông tin khách hàng thành công."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] KhachHang customer)
        {
            if (customer == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));
            }

            try
            {
                var created = await _customerService.CreateCustomerAsync(customer);
                return CreatedAtAction(nameof(GetById), new { id = created.MaKH }, ApiResponse<CustomerDTO>.SuccessResult(created, "Thêm khách hàng thành công."));
            }
            catch (System.Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(ApiResponse<object>.ErrorResult(400, errorMessage));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] KhachHang customer)
        {
            if (customer == null || id != customer.MaKH)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));
            }

            try
            {
                await _customerService.UpdateCustomerAsync(id, customer);
                return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật khách hàng thành công."));
            }
            catch (System.Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _customerService.DeleteCustomerAsync(id);
                return Ok(ApiResponse<object>.SuccessResult(null, "Xóa khách hàng thành công."));
            }
            catch (System.Exception ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, ex.Message));
            }
        }
    }
}
