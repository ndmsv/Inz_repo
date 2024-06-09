using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TaskController : Controller
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("getCourseTasks")]
        public async Task<IActionResult> GetCourseTasks([FromBody] CourseIDModel courseIDModel)
        {
            try
            {
                var courseExists = await _context.courses.AnyAsync(c => c.ID == courseIDModel.CourseID);
                if (!courseExists)
                {
                    return NotFound(new { message = $"No course found with ID {courseIDModel.CourseID}" });
                }

                var tasks = await _context.course_tasks
                    .Where(t => t.CourseID == courseIDModel.CourseID)
                    .Select(t => new
                    {
                        TaskId = t.ID,
                        TaskName = t.TaskName,
                        TaskDescription = t.TaskDescription,
                        CreationDate = t.CreationDate,
                        OpeningDate = t.OpeningDate,
                        ClosingDate = t.ClosingDate
                    })
                    .OrderBy(t => t.OpeningDate)
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}