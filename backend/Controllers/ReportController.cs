using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("reportViolation")]
        public async Task<IActionResult> ReportViolation([FromBody] ReportModel model)
        {
            try
            {
                var reportingUser = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == model.ReportingUserLogin);
                if (reportingUser == null) return NotFound(new { message = "User not found" });

                var report = new ForumReports
                {
                    PostID = model.PostID,
                    CommentID = model.CommentID,
                    ReportingUserID = reportingUser.ID,
                    CreatedOn = DateTime.UtcNow,
                    ReportReason = model.ReportReason,
                    IsResolved = false,
                    IsDeleted = false
                };

                _context.forum_reports.Add(report);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Report sent to administration" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("getReportPosts")]
        public async Task<IActionResult> GetUserPosts([FromBody] PlainLoginModel model)
        {
            try
            {
                // TODO: Ogarnąć całą warstwe związaną z wyświetlaniem jako jakiś popup listy wszystkich zgłoszeń do danego posta
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null) return NotFound(new { message = "User not found" });
                if (user.UserType.TypeName != "Administrator") return BadRequest(new { message = "User not with administrative permission" });

                var query = _context.forum_posts.Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted && _context.forum_reports.Any(report => report.PostID == post.ID && !report.IsDeleted && !report.IsResolved))
                        .OrderByDescending(post => post.CreatedOn);

                var posts = await query
                    .Select(post => new ForumPostModelExtended
                    {
                        Id = post.ID,
                        PostTitle = post.PostTitle,
                        PostDescription = post.PostDescription,
                        CreatedOn = DateTime.SpecifyKind(post.CreatedOn, DateTimeKind.Utc),
                        EditedOn = post.EditedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(post.EditedOn), DateTimeKind.Utc) : null,
                        VotesCount = post.VotesCount,
                        IsEditible = post.UserID == user.ID || user.UserType.TypeName == "Administrator",
                        CreatedBy = _context.Users
                                .Where(u => u.ID == post.UserID)
                                .Select(u => (u.Name != null && u.Surname != null) ? (u.Name + " " + u.Surname) : u.Login)
                                .FirstOrDefault(),
                        Attachments = post.PostAttachments != null ? post.PostAttachments.Select(a => new AttachmentDto
                        {
                            AttachmentID = a.ID,
                            FileName = a.FileName,
                            FilePath = Url.Action("DownloadFile", new { attachmentId = a.ID }),
                            AddedOn = a.AddedOn
                        }).ToList() : null,
                        CommentsCount = _context.posts_comments.Count(comment => comment.PostID == post.ID && !comment.IsDeleted)
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
}
