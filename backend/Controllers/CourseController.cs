using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CourseController : Controller
    {
        private readonly AppDbContext _context;

        public CourseController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("registerCourse")]
        public async Task<IActionResult> RegisterCourse([FromBody] CourseModel courseModel)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                string? hashedPassword = null;

                if (courseModel.Password != null)
                    hashedPassword = HashPassword(courseModel.Password);

                var user = await _context.Users.FirstOrDefaultAsync(users => users.Login == courseModel.OwnerName);

                if (user != null)
                {
                    var ownerID = user.ID;

                    var course = new Course
                    {
                        Name = courseModel.Name,
                        Description = courseModel.Description,
                        OwnerID = ownerID,
                        Password = hashedPassword,
                        IsDeleted = false
                    };
                    _context.courses.Add(course);
                    await _context.SaveChangesAsync();

                    var usersInCourse = new UsersInCourse
                    {
                        UserID = ownerID,
                        CourseID = course.ID,
                        IsOwner = true,
                        IsDeleted = false
                    };
                    _context.users_in_course.Add(usersInCourse);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return Ok(new { message = "Course registered successfully!" });
                }
                else
                {
                    return NotFound(new { message = "User was not found!" });
                }

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("getCourses")]
        public async Task<IActionResult> GetCourses([FromBody] PlainLoginModel username)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == username.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var courses = await _context.courses
                    .Where(course => !course.IsDeleted)
                    .Select(course => new CourseModelExtended
                    {
                        Id = course.ID,
                        Name = course.Name,
                        Description = course.Description == null ? "" : course.Description,
                        IsOwner = _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted && uic.IsOwner),
                        IsInGroup = _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted),
                        IsPasswordProtected = course.Password != null,
                        OwnersCount = _context.users_in_course.Count(uic => uic.CourseID == course.ID && uic.IsOwner)
                    })
                    .ToListAsync();

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }

    public class CourseModel
    {
        public required string Name { get; set; }

        public string? Description { get; set; }

        public string? OwnerName { get; set; }

        public string? Password { get; set; }

    }

    public class CourseModelExtended
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool IsOwner { get; set; }
        public bool IsInGroup { get; set; }
        public bool IsPasswordProtected { get; set; }
        public int OwnersCount { get; set; }
    }
}
