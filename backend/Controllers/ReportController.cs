using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReportController : Controller
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("getForumPosts")]
        public async Task<IActionResult> ReportViolation([FromBody] GetForumPostsModel request)
        {
            return Ok();
        }
    }
}
