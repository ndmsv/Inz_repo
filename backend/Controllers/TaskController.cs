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
        public async Task<IActionResult> GetCourseTasks([FromBody] CourseJoinModel model)
        {
            try
            {
                var courseExists = await _context.courses.AnyAsync(c => c.ID == model.CourseID);
                if (!courseExists)
                {
                    return NotFound(new { message = $"No course found with ID {model.CourseID}" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var tasks = await _context.course_tasks
                    .Where(t => t.CourseID == model.CourseID)
                    .Select(t => new
                    {
                        TaskId = t.ID,
                        t.TaskName,
                        t.TaskDescription,
                        t.CreationDate,
                        t.OpeningDate,
                        t.ClosingDate,
                        t.LimitedAttachments,
                        t.AttachmentsNumber,
                        t.LimitedAttachmentTypes,
                        t.AttachmentTypes,
                        t.IsDeleted,
                        Submissions = _context.task_submissions
                            .Where(s => s.TaskID == t.ID && s.UserID == user.ID && !s.IsDeleted)
                            .Select(s => new {
                                s.AddedOn
                            }).ToList()
                    })
                    .Where(t => !t.IsDeleted)
                    .OrderBy(t => t.OpeningDate)
                    .ToListAsync();

                var result = tasks.Select(t => new {
                    t.TaskId,
                    t.TaskName,
                    t.TaskDescription,
                    CreationDate = DateTime.SpecifyKind(t.CreationDate, DateTimeKind.Utc),
                    OpeningDate = DateTime.SpecifyKind(t.OpeningDate, DateTimeKind.Utc),
                    ClosingDate = DateTime.SpecifyKind(t.ClosingDate, DateTimeKind.Utc),
                    t.LimitedAttachments,
                    t.AttachmentsNumber,
                    t.LimitedAttachmentTypes,
                    t.AttachmentTypes,
                    t.IsDeleted,
                    IsSubmission = t.Submissions.Any(),
                    IsSubmissionTimeCorrect = t.Submissions.Any(s => s.AddedOn <= t.ClosingDate),
                    SubmissionTimeDifference = t.Submissions.Any() ? FormatTimeDifference(t.ClosingDate, t.Submissions.First().AddedOn) : null,
                    IsOpened = DateTime.UtcNow >= t.OpeningDate,
                    AddedOn = t.Submissions.Any() ? t.Submissions.First().AddedOn : (DateTime?)null
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private string FormatTimeDifference(DateTime closingDate, DateTime submissionDate)
        {
            var timeSpan = closingDate - submissionDate;
            return $"{Math.Abs(timeSpan.Days)} days, {Math.Abs(timeSpan.Hours)} hours, {Math.Abs(timeSpan.Minutes)} minutes, {Math.Abs(timeSpan.Seconds)} seconds";
        }

        [HttpPost("checkIfOwnerOrAdmin")]
        public async Task<IActionResult> CheckIfOwnerOrAdmin([FromBody] CourseJoinModel loginWithCourseID)
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
                    AttachmentTypes = newTask.LimitedAttachmentTypes ? newTask.AttachmentTypes : null,
                    IsDeleted = false
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

        [HttpPost("updateCourseTask")]
        public async Task<IActionResult> UpdateCourseTask([FromBody] FullTaskModel updatedTask)
        {
            try
            {
                var courseExists = await _context.courses.AnyAsync(c => c.ID == updatedTask.CourseID);
                if (!courseExists)
                {
                    return NotFound(new { message = $"No course found with ID {updatedTask.CourseID}" });
                }

                if (updatedTask.OpeningDate >= updatedTask.ClosingDate)
                {
                    return BadRequest(new { message = "Closing date must come after opening date!" });
                }

                var task = await _context.course_tasks.FirstOrDefaultAsync(t => t.ID == updatedTask.TaskID);
                if (task == null)
                {
                    return NotFound(new { message = $"No task found with ID {updatedTask.TaskID}" });
                }

                task.TaskName = updatedTask.TaskName;
                task.TaskDescription = updatedTask.TaskDescription;
                task.OpeningDate = DateTime.SpecifyKind(updatedTask.OpeningDate, DateTimeKind.Utc);
                task.ClosingDate = DateTime.SpecifyKind(updatedTask.ClosingDate, DateTimeKind.Utc);
                task.LimitedAttachments = updatedTask.LimitedAttachments;
                task.AttachmentsNumber = updatedTask.LimitedAttachments ? updatedTask.AttachmentsNumber : null;
                task.LimitedAttachmentTypes = updatedTask.LimitedAttachmentTypes;
                task.AttachmentTypes = updatedTask.LimitedAttachmentTypes ? updatedTask.AttachmentTypes : null;

                _context.course_tasks.Update(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Task updated successfully", taskId = task.ID });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("deleteTask")]
        public async Task<IActionResult> DeleteTask([FromBody] LeaveTaskModel leaveTaskModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == leaveTaskModel.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var task = await _context.course_tasks.FirstOrDefaultAsync(ct => ct.ID == leaveTaskModel.TaskID);

                if (task == null)
                {
                    return NotFound(new { message = "Task with said ID doesn't exist!" });
                }
                else
                {
                    if (task.IsDeleted)
                    {
                        return BadRequest(new { message = "Task with said ID is already deleted!" });
                    }
                    else
                    {
                        task.IsDeleted = true;
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "You have successfully deleted the task!" });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("checkSubmissionsInCourse")]
        public async Task<IActionResult> CheckSubmissionsInCourse([FromBody] CourseWithTaskModel courseWithTaskModel)
        {
            try
            {
                var courseUsers = await _context.users_in_course
                    .Where(uic => uic.CourseID == courseWithTaskModel.CourseID && !uic.IsDeleted)
                    .Select(uic => new {
                        uic.UserID,
                        uic.User.Login,
                        FullName = uic.User.Name + " " + uic.User.Surname,
                        TypeName = uic.User.UserType.TypeName
                    })
                    .ToListAsync();

                var taskSubmissions = await _context.task_submissions
                    .Include(ts => ts.CourseTask)
                    .Where(ts => ts.CourseTask.CourseID == courseWithTaskModel.CourseID 
                        && ts.CourseTask.ID == courseWithTaskModel.TaskID 
                        && !ts.IsDeleted)
                    .ToListAsync();

                var usersWithSubmissions = courseUsers.Select(u => new {
                    u.UserID,
                    u.Login,
                    u.FullName,
                    u.TypeName,
                    IsSubmitted = taskSubmissions.Any(ts => ts.UserID == u.UserID),
                    IsSubmissionTimeCorrect = taskSubmissions.Where(ts => ts.UserID == u.UserID).Any(ts => ts.AddedOn <= ts.CourseTask.ClosingDate)
                }).ToList();

                return Ok(usersWithSubmissions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}