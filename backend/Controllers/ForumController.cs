using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ForumController : Controller
    {
        private readonly AppDbContext _context;

        public ForumController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("getForumPosts")]
        public async Task<IActionResult> GetForumPosts([FromBody] GetForumPostsModel request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == request.Login);
                if (user == null) return NotFound(new { message = "User not found" });

                DateTime timeframeLimit = DateTime.Now;
                if (request.Type == PostType.Top && request.Timeframe.HasValue)
                {
                    timeframeLimit = request.Timeframe switch
                    {
                        Timeframe.TwoHours => DateTime.Now.AddHours(-2),
                        Timeframe.SixHours => DateTime.Now.AddHours(-6),
                        Timeframe.TwelveHours => DateTime.Now.AddHours(-12),
                        Timeframe.Day => DateTime.Now.AddDays(-1),
                        Timeframe.Week => DateTime.Now.AddDays(-7),
                        Timeframe.Month => DateTime.Now.AddMonths(-1),
                        Timeframe.Year => DateTime.Now.AddYears(-1),
                        _ => DateTime.MinValue
                    };
                }

                var query = _context.forum_posts.AsQueryable();

                switch (request.Type)
                {
                    case PostType.Hot:
                        query = query
                            .Where(post => !post.IsDeleted)
                            .OrderByDescending(post => (double)post.VotesCount / Math.Max((DateTime.Now - post.CreatedOn).TotalHours, 1));
                        break;

                    case PostType.Top:
                        query = query
                            .Where(post => !post.IsDeleted && post.CreatedOn >= timeframeLimit)
                            .OrderByDescending(post => post.VotesCount);
                        break;

                    case PostType.New:
                        query = query
                            .Where(post => !post.IsDeleted)
                            .OrderByDescending(post => post.CreatedOn);
                        break;

                    default:
                        return BadRequest(new { message = "Invalid post type." });
                }

                var posts = await query.Take(100)
                    .Select(post => new ForumPostModelExtended
                    {
                        Id = post.ID,
                        PostTitle = post.PostTitle,
                        PostDescription = post.PostDescription,
                        CreatedOn = post.CreatedOn,
                        IsDeleted = post.IsDeleted,
                        VotesCount = post.VotesCount,
                        IsPostedByUser = post.UserID == user.ID
                    })
                    .ToListAsync();

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public enum PostType
    {
        Hot,
        Top,
        New
    }

    public enum Timeframe
    {
        TwoHours,
        SixHours,
        TwelveHours,
        Day,
        Week,
        Month,
        Year,
        AllTime
    }

    public class GetForumPostsModel
    {
        public required string Login { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public required PostType Type { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Timeframe? Timeframe { get; set; }
    }

    public class ForumPostModelExtended
    {
        public int Id { get; set; }
        public required string PostTitle { get; set; }
        public string? PostDescription { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsDeleted { get; set; }
        public int VotesCount { get; set; }
        public bool IsPostedByUser { get; set; }
    }
}
