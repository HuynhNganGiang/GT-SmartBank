using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using GTSmartBank.Data;
using GTSmartBank.DTOs;
using GTSmartBank.Models;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/branches")]
    [ApiController]
    [Tags("Chi nhánh")]
    public class BranchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BranchesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.ChiNhanh.ToListAsync();
            return Ok(ApiResponse<IEnumerable<ChiNhanh>>.SuccessResult(list, "Lấy danh sách chi nhánh thành công."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cn = await _context.ChiNhanh.FindAsync(id);
            if (cn == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, "Không tìm thấy chi nhánh."));
            }
            return Ok(ApiResponse<ChiNhanh>.SuccessResult(cn, "Lấy chi nhánh thành công."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] ChiNhanh chiNhanh)
        {
            if (chiNhanh == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));
            }

            _context.ChiNhanh.Add(chiNhanh);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = chiNhanh.MaCN }, ApiResponse<ChiNhanh>.SuccessResult(chiNhanh, "Tạo chi nhánh thành công."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ChiNhanh chiNhanh)
        {
            if (chiNhanh == null || id != chiNhanh.MaCN)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(400, "Dữ liệu không hợp lệ."));
            }

            var exists = await _context.ChiNhanh.AnyAsync(x => x.MaCN == id);
            if (!exists)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, "Chi nhánh không tồn tại."));
            }

            _context.Entry(chiNhanh).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật chi nhánh thành công."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var cn = await _context.ChiNhanh.FindAsync(id);
            if (cn == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult(404, "Chi nhánh không tồn tại."));
            }

            _context.ChiNhanh.Remove(cn);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.SuccessResult(null, "Xóa chi nhánh thành công."));
        }
    }
}
