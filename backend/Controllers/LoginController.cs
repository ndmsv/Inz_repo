using backend.Models;
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
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(users => users.Login == loginModel.Login);

                if (user == null)
                {
                    return BadRequest(new { message = "Incorrect login!" });
                }

                var password = HashPassword(loginModel.Password);

                if (!VerifyPassword(loginModel.Password, user.Password))
                {
                    return BadRequest(new { message = "Incorrect password!" });
                }

                return Ok(new { message = "You are now logged in!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private bool VerifyPassword(string inputPassword, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, hashedPassword);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] LoginModel loginModel)
        {
            var hashedPassword = HashPassword(loginModel.Password);
            var user = new User { Login = loginModel.Login, Password = hashedPassword };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully!" });
        }

        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}

public class LoginModel
{
    public string Login { get; set; }
    public string Password { get; set; }
}
