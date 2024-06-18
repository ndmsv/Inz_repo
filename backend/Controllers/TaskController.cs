using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

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

                var result = tasks.Select(t => new {
                    t.TaskId,
                    t.TaskName,
                    t.TaskDescription,
                    CreationDate = DateTime.SpecifyKind(t.CreationDate, DateTimeKind.Utc),
                    OpeningDate = DateTime.SpecifyKind(t.OpeningDate, DateTimeKind.Utc),
                    ClosingDate = DateTime.SpecifyKind(t.ClosingDate, DateTimeKind.Utc)
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("checkIfOwnerOrAdmin")]
        public async Task<IActionResult> CheckIfOwnerOrAdmin([FromBody] LoginWithCourseID loginWithCourseID)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserType)
                    .Include(u => u.UsersInCourse)
                    .Where(u => u.Login == loginWithCourseID.Login)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                bool isAdmin = user.UserType != null && user.UserType.TypeName == "Administrator";

                bool isOwner = user.UsersInCourse != null && user.UsersInCourse.Any(uic => uic.CourseID == loginWithCourseID.CourseID && uic.IsOwner);

                return Ok(new { IsOwnerOrAdmin = isAdmin || isOwner });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("saveCourseTask")]
        public async Task<IActionResult> SaveCourseTask([FromBody] FullTaskModel newTask)
        {
            try
            {
                var courseExists = await _context.courses.AnyAsync(c => c.ID == newTask.CourseID);
                if (!courseExists)
                {
                    return NotFound(new { message = $"No course found with ID {newTask.CourseID}" });
                }

                if (newTask.OpeningDate >= newTask.ClosingDate)
                {
                    return BadRequest(new { message = "Closing date must come after opening date!" });
                }

                DateTime openingDate = DateTime.SpecifyKind(newTask.OpeningDate, DateTimeKind.Utc);
                DateTime closingDate = DateTime.SpecifyKind(newTask.ClosingDate, DateTimeKind.Utc);

                var task = new CourseTasks
                {
                    CourseID = newTask.CourseID,
                    TaskName = newTask.TaskName,
                    TaskDescription = newTask.TaskDescription,
                    CreationDate = DateTime.UtcNow,
                    OpeningDate = openingDate,
                    ClosingDate = closingDate,
                    LimitedAttachments = newTask.LimitedAttachments,
                    AttachmentsNumber = newTask.LimitedAttachments ? newTask.AttachmentsNumber : null,
                    LimitedAttachmentTypes = newTask.LimitedAttachmentTypes,
                    AttachmentTypes = newTask.LimitedAttachmentTypes ? newTask.AttachmentTypes : null
                };

                _context.course_tasks.Add(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Task created successfully", taskId = task.ID });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class LoginWithCourseID
    {
        public required string Login { get; set; }
        public int CourseID { get; set; }
    }

    public class FullTaskModel
    {
        public required int CourseID { get; set; }
        public required string TaskName { get; set; }
        public string? TaskDescription { get; set; }
        public required DateTime OpeningDate { get; set; }
        public required DateTime ClosingDate { get; set; }
        public required bool LimitedAttachments { get; set; }
        public int? AttachmentsNumber { get; set; }
        public required bool LimitedAttachmentTypes { get; set; }
        public string? AttachmentTypes { get; set; }
    }
}