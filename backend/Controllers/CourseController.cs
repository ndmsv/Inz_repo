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
                    hashedPassword = LoginController.HashPassword(courseModel.Password);

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

        [HttpPost("getJoinCourses")]
        public async Task<IActionResult> GetJoinCourses([FromBody] PlainLoginModel username)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == username.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var courses = await _context.courses
                    .Where(course => !course.IsDeleted && !_context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted))
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

        [HttpPost("getMyCourses")]
        public async Task<IActionResult> GetMyCourses([FromBody] PlainLoginModel username)
        {
            try
            {
                var user = await _context.Users.Include(u => u.UserType).FirstOrDefaultAsync(u => u.Login == username.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var courses = await _context.courses
                    .Where(course => !course.IsDeleted && _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted))
                    .Select(course => new CourseModelExtended
                    {
                        Id = course.ID,
                        Name = course.Name,
                        Description = course.Description == null ? "" : course.Description,
                        IsOwner = _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted && uic.IsOwner),
                        IsInGroup = _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted),
                        IsPasswordProtected = course.Password != null,
                        OwnersCount = _context.users_in_course.Count(uic => uic.CourseID == course.ID && uic.IsOwner),
                        CanAddOwners = _context.users_in_course.Any(uic => uic.CourseID == course.ID && uic.UserID == user.ID && !uic.IsDeleted && (uic.IsOwner || (user.UserType != null && user.UserType.TypeName == "Administrator")))
                    })
                    .ToListAsync();

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("joinCourse")]
        public async Task<IActionResult> JoinCourse([FromBody] CourseJoinModel courseJoinModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == courseJoinModel.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var existingLink = await _context.users_in_course
                    .FirstOrDefaultAsync(uc => uc.UserID == user.ID && uc.CourseID == courseJoinModel.CourseID);

                if (existingLink != null)
                {
                    if (!existingLink.IsDeleted)
                    {
                        return BadRequest(new { message = "You are already registered to that course!" });
                    }
                    else
                    {
                        existingLink.IsDeleted = false;
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "You have been re-registered to the course!" });
                    }
                }

                var usersInCourse = new UsersInCourse
                {
                    UserID = user.ID,
                    CourseID = courseJoinModel.CourseID,
                    IsOwner = false,
                    IsDeleted = false
                };
                _context.users_in_course.Add(usersInCourse);
                await _context.SaveChangesAsync();

                return Ok(new { message = "You are registered to the course!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("checkJoinPassword")]
        public async Task<IActionResult> CheckJoinPassword([FromBody] CoursePasswordJoinModel coursePasswordJoinModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == coursePasswordJoinModel.Login);

                if (user == null)
                {
                    return NotFound(new { isSuccess = false, message = "User was not found!" });
                }

                var course = await _context.courses.FirstOrDefaultAsync(c => c.ID == coursePasswordJoinModel.CourseID);

                if (course == null)
                {
                    return NotFound(new { isSuccess = false, message = "Course was not found!" });
                }

                if (course.Password != null && !LoginController.VerifyPassword(coursePasswordJoinModel.Password, course.Password))
                {
                    return Ok(new { isSuccess = false, message = "Wrong password!" });
                }

                var existingLink = await _context.users_in_course
                    .FirstOrDefaultAsync(uc => uc.UserID == user.ID && uc.CourseID == coursePasswordJoinModel.CourseID);

                if (existingLink != null)
                {
                    if (!existingLink.IsDeleted)
                    {
                        return BadRequest(new { isSuccess = false, message = "You are already registered to that course!" });
                    }
                    else
                    {
                        existingLink.IsDeleted = false;
                        await _context.SaveChangesAsync();
                        return Ok(new { isSuccess = true, message = "You have been re-registered to the course!" });
                    }
                }

                var usersInCourse = new UsersInCourse
                {
                    UserID = user.ID,
                    CourseID = coursePasswordJoinModel.CourseID,
                    IsOwner = false,
                    IsDeleted = false
                };
                _context.users_in_course.Add(usersInCourse);
                await _context.SaveChangesAsync();

                return Ok(new { isSuccess = true, message = "You are registered to the course!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("leaveCourse")]
        public async Task<IActionResult> LeaveCourse([FromBody] CourseJoinModel courseJoinModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == courseJoinModel.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var link = await _context.users_in_course
                    .FirstOrDefaultAsync(uc => uc.UserID == user.ID && uc.CourseID == courseJoinModel.CourseID);

                if (link == null)
                {
                    return NotFound(new { message = "You are not registered in this course!" });
                }
                else
                {
                    if (link.IsDeleted)
                    {
                        return BadRequest(new { message = "You have already left this course!" });
                    }
                    else
                    {
                        link.IsDeleted = true;
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "You have successfully left the course!" });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("getEligibleUsers")]
        public async Task<IActionResult> GetEligibleUsers([FromBody] CourseIDModel courseIDModel)
        {
            try
            {
                var courseUsers = _context.users_in_course
                    .Where(uic => uic.CourseID == courseIDModel.CourseID && !uic.IsDeleted && !uic.IsOwner)
                    .Select(uic => uic.UserID);

                var eligibleUsers = await _context.Users
                    .Where(u => courseUsers.Contains(u.ID) 
                        && u.UserType != null && (u.UserType.TypeName == "Teacher" || u.UserType.TypeName == "Administrator"))
                    .Select(u => new { u.ID, u.Login, Name = u.Name + " " + u.Surname, TypeName = u.UserType.TypeName })
                    .ToListAsync();

                return Ok(eligibleUsers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("addNewOwners")]
        public async Task<IActionResult> AddNewOwners([FromBody] AddOwnerModel model)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    var usersInCourse = await _context.users_in_course
                        .Where(uic => model.UserIds.Contains(uic.UserID) && uic.CourseID == model.CourseId)
                        .ToListAsync();

                    if (!usersInCourse.Any())
                    {
                        return NotFound("No eligible users or course found.");
                    }

                    foreach (var userInCourse in usersInCourse)
                    {
                        userInCourse.IsOwner = true;
                    }

                    _context.UpdateRange(usersInCourse);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok("Owners added successfully.");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = ex.Message });
                }
            }
        }

        [HttpPost("stopOwnership")]
        public async Task<IActionResult> StopOwnership([FromBody] CourseJoinModel courseJoinModel)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == courseJoinModel.Login);

                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var link = await _context.users_in_course
                    .FirstOrDefaultAsync(uc => uc.UserID == user.ID && uc.CourseID == courseJoinModel.CourseID);

                if (link == null)
                {
                    return NotFound(new { message = "You are not registered in this course!" });
                }
                else
                {
                    if (!link.IsOwner)
                    {
                        return BadRequest(new { message = "You are not an owner of this course!" });
                    }
                    else
                    {
                        link.IsOwner = false;
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "You have stopped being an owner of the course!" });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("deleteCourse")]
        public async Task<IActionResult> DeleteCourse([FromBody] CourseIDModel courseIDModel)
        {
            try
            {
                var course = await _context.courses.FirstOrDefaultAsync(ct => ct.ID == courseIDModel.CourseID);

                if (course == null)
                {
                    return NotFound(new { message = "Course with said ID doesn't exist!" });
                }
                else
                {
                    if (course.IsDeleted)
                    {
                        return BadRequest(new { message = "Course with said ID is already deleted!" });
                    }
                    else
                    {
                        course.IsDeleted = true;
                        await _context.SaveChangesAsync();
                        return Ok(new { message = "You have successfully deleted the course!" });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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
        public bool CanAddOwners { get; set; }
    }

    public class CourseJoinModel
    {
        public int CourseID { get; set; }
        public required string Login { get; set; }
    }

    public class CoursePasswordJoinModel
    {
        public int CourseID { get; set; }
        public required string Login { get; set; }
        public required string Password { get; set; }
    }

    public class CourseIDModel
    {
        public int CourseID { get; set; }
    }

    public class AddOwnerModel
    {
        public int CourseId { get; set; }
        public required List<int> UserIds { get; set; }
    }
}
