﻿using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class LoginController : Controller
    {
        private readonly AppDbContext _context;

        public LoginController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            bool isSuccess = false;
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(users => users.Login == loginModel.Login);

                if (user == null)
                {
                    return Ok(new { message = "Incorrect login!", isSuccess });
                }

                if (!VerifyPassword(loginModel.Password, user.Password))
                {
                    return Ok(new { message = "Incorrect password!", isSuccess });
                }

                isSuccess = true;
                return Ok(new { message = "You are now logged in!", isSuccess, password = user.Password });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, isSuccess });
            }
        }

        [HttpPost("checkLogin")]
        public async Task<IActionResult> CheckLogin([FromBody] PlainLoginModel login)
        {
            bool isSuccess = false;
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(users => users.Login == login.Login);

                if (user == null)
                {
                    isSuccess = true;
                    return Ok(new { message = "Login is available!", isSuccess });
                }
                else
                    return Ok(new { message = "Selected login is already taken!", isSuccess });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, isSuccess });
            }
        }

        [HttpPost("checkTypePassword")]
        public async Task<IActionResult> CheckTypePassword([FromBody] TypeModel typeModel)
        {
            bool isSuccess = false;
            try
            {
                var type = await _context.user_types.FirstOrDefaultAsync(type => type.TypeID == typeModel.TypeID);

                if (type == null)
                    return Ok(new { message = "No described user type found!", isSuccess });

                if (type.TypePassword != null && VerifyPassword(typeModel.Password, type.TypePassword))
                {
                    isSuccess = true;
                    return Ok(new { message = "User type password is correct!", isSuccess });
                }
                else
                    return Ok(new { message = "Wrong user type password!", isSuccess });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, isSuccess });
            }
        }

        public static bool VerifyPassword(string inputPassword, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, hashedPassword);
        }

        [HttpPost("registerUser")]
        public async Task<IActionResult> Register([FromBody] LoginModelExtended loginModel)
        {
            try
            {
                var hashedPassword = HashPassword(loginModel.Password);
                var userType = await _context.user_types.FirstOrDefaultAsync(u => u.TypeID == loginModel.Type);
                var user = new User
                {
                    Login = loginModel.Login,
                    Password = hashedPassword,
                    Type = loginModel.Type,
                    Name = loginModel.Name,
                    Surname = loginModel.Surname,
                    UserType = userType
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("checkUserDetails")]
        public async Task<IActionResult> CheckUserDetails([FromBody] LoginModel loginModel)
        {
            try
            {
                var userWithRole = await _context.Users.Include(u => u.UserType)
                    .FirstOrDefaultAsync(users => users.Login == loginModel.Login && users.Password == loginModel.Password);

                if (userWithRole != null)
                {
                    var role = userWithRole.UserType.TypeName;
                    var isAdminOrTeacher = role.Equals("Administrator", StringComparison.OrdinalIgnoreCase) ||
                                            role.Equals("Teacher", StringComparison.OrdinalIgnoreCase);

                    var isAdmin = role.Equals("Administrator", StringComparison.OrdinalIgnoreCase);


                    string fullname = null;
                    if (!string.IsNullOrEmpty(userWithRole.Name) && !string.IsNullOrEmpty(userWithRole.Surname))
                        fullname = userWithRole.Name + " " + userWithRole.Surname;

                    return Ok(new { isAdminOrTeacher, role, fullname, isAdmin, isSuccess = true });
                }
                else
                {
                    return Ok(new { message = "User data are not correct.", isSuccess = false });
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
}
