using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Http;

namespace GTSmartBank.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Tags("Kiểm tra phân quyền")]
    public class TestRoleController : ControllerBase
    {
        [Authorize]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            return Ok(new
            {
                message = "Bạn đã đăng nhập thành công",
                user = User.Identity?.Name,
                role = User.Claims.FirstOrDefault(x => x.Type.Contains("role"))?.Value
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult AdminOnly()
        {
            return Ok(new
            {
                message = "Chỉ Admin mới xem được API này"
            });
        }

       [Authorize(Roles = "User,Admin")]
       [HttpGet("user")]
        public IActionResult UserOnly()
          {
            return Ok(new
           {
        message = "User và Admin đều xem được API này"
        });
    }
    }
}