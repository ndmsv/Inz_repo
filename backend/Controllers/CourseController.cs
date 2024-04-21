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
        public async Task<IActionResult> RegisterCourse([FromBody] CourseModelExtended courseModel)
        {
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

                    return Ok(new { message = "Course registered successfully!" });
                }
                else
                {
                    return NotFound(new { message = "User was not found!" });
                }

            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }

    public class CourseModelExtended
    {

        public required string Name { get; set; }

        public string? Description { get; set; }

        public string? OwnerName { get; set; }

        public string? Password { get; set; }

    }
}
