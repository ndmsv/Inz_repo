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

        [HttpGet("getReportPosts")]
        public async Task<IActionResult> GetReportPosts([FromQuery] string login)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });
                if (user.UserType.TypeName != "Administrator") return BadRequest(new { message = "User not with administrative permission" });

                var query = _context.forum_posts.Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted && _context.forum_reports.Any(report => report.PostID == post.ID && !report.IsDeleted && !report.IsResolved))
                        .OrderBy(post => post.CreatedOn);

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

        [HttpGet("getReportsByPost")]
        public async Task<IActionResult> GetReportsByPost([FromQuery] string login, [FromQuery] int postId)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });
                if (user.UserType.TypeName != "Administrator")
                    return BadRequest(new { message = "User does not have administrative permissions" });

                var reports = await _context.forum_reports
                    .Where(report => report.PostID == postId && !report.IsDeleted)
                    .Select(report => new ForumReportResponse
                    {
                        Id = report.ID,
                        ReportingUser = _context.Users
                            .Where(u => u.ID == report.ReportingUserID)
                            .Select(u => (u.Name != null && u.Surname != null) ? (u.Name + " " + u.Surname) : u.Login)
                            .FirstOrDefault(),
                        ReportReason = report.ReportReason,
                        CreatedOn = DateTime.SpecifyKind(report.CreatedOn, DateTimeKind.Utc),
                        IsResolved = report.IsResolved,
                        ResolvingUser = report.IsResolved ? _context.Users
                            .Where(u => u.ID == report.ResolvingUserID)
                            .Select(u => (u.Name != null && u.Surname != null) ? (u.Name + " " + u.Surname) : u.Login)
                            .FirstOrDefault() : null,
                        ResolvedOn = report.ResolvedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(report.ResolvedOn), DateTimeKind.Utc) : null,
                        ResolveComment = report.ResolveComment
                    })
                    .ToListAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resolveReport")]
        public async Task<IActionResult> ResolveReport([FromBody] ResolveReportModel model)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == model.ResolvingUser);
                if (user == null) return NotFound(new { message = "User not found" });
                if (user.UserType.TypeName != "Administrator")
                    return BadRequest(new { message = "User does not have administrative permissions" });

                var report = await _context.forum_reports.FirstOrDefaultAsync(r => r.ID == model.ReportID && !r.IsDeleted);
                if (report == null)
                {
                    return NotFound(new { message = "Report with said ID does not exist" });
                }
                else
                {
                    report.IsResolved = true;
                    report.ResolvingUserID = user.ID;
                    report.ResolveComment = model.ResolveComment;
                    report.ResolvedOn = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Report resolved." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resolveAllReports")]
        public async Task<IActionResult> ResolveAllReports([FromBody] ResolveAllReportsModel model)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == model.ResolvingUser);
                if (user == null) return NotFound(new { message = "User not found" });
                if (user.UserType.TypeName != "Administrator")
                    return BadRequest(new { message = "User does not have administrative permissions" });


                var post = await _context.forum_posts
                                       .Include(v => v.ForumReports)
                                       .FirstOrDefaultAsync(s => s.ID == model.PostID && !s.IsDeleted);
                if (post == null)
                {
                    return NotFound(new { message = "Post with said ID does not exist" });
                }
                else
                {
                    if (post.ForumReports != null)
                    {
                        foreach (var report in post.ForumReports)
                        {
                            if (!report.IsDeleted && !report.IsResolved)
                            {
                                report.IsResolved = true;
                                report.ResolvingUserID = user.ID;
                                report.ResolveComment = model.ResolveComment;
                                report.ResolvedOn = DateTime.UtcNow;
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Reports resolved." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
