using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
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

                if (request.Type == PostType.Hot)
                {
                    var postsHot = _context.forum_posts
                        .Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted)
                        .AsEnumerable()
                        .OrderByDescending(post => (double)post.VotesCount / Math.Max((DateTime.Now - post.CreatedOn).TotalHours, 1))
                        .Take(100)
                        .Select(post => new ForumPostModelExtended
                        {
                            Id = post.ID,
                            PostTitle = post.PostTitle,
                            PostDescription = post.PostDescription,
                            CreatedOn = DateTime.SpecifyKind(post.CreatedOn, DateTimeKind.Utc),
                            IsDeleted = post.IsDeleted,
                            VotesCount = post.VotesCount,
                            IsPostedByUser = post.UserID == user.ID,
                            Voted = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted),
                            Liked = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted && vote.IsLiked),
                            Attachments = post.PostAttachments != null ? post.PostAttachments.Select(a => new AttachmentDto
                            {
                                AttachmentID = a.ID,
                                FileName = a.FileName,
                                FilePath = Url.Action("DownloadFile", new { attachmentId = a.ID }),
                                AddedOn = a.AddedOn
                            }).ToList() : null
                        })
                        .ToList();
                    return Ok(postsHot);
                }

                IQueryable<ForumPosts> query = _context.forum_posts;

                if (request.Type == PostType.Top)
                {
                    query = query
                        .Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted && post.CreatedOn >= timeframeLimit)
                        .OrderByDescending(post => post.VotesCount);
                }
                else if (request.Type == PostType.New)
                {
                    query = query
                        .Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted)
                        .OrderByDescending(post => post.CreatedOn);
                }
                else
                {
                    return BadRequest(new { message = "Invalid post type." });
                }

                var posts = await query.Take(100)
                    .Select(post => new ForumPostModelExtended
                    {
                        Id = post.ID,
                        PostTitle = post.PostTitle,
                        PostDescription = post.PostDescription,
                        CreatedOn = DateTime.SpecifyKind(post.CreatedOn, DateTimeKind.Utc),
                        IsDeleted = post.IsDeleted,
                        VotesCount = post.VotesCount,
                        IsPostedByUser = post.UserID == user.ID,
                        Voted = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted),
                        Liked = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted && vote.IsLiked),
                        Attachments = post.PostAttachments != null ? post.PostAttachments.Select(a => new AttachmentDto
                        {
                            AttachmentID = a.ID,
                            FileName = a.FileName,
                            FilePath = Url.Action("DownloadFile", new { attachmentId = a.ID }),
                            AddedOn = a.AddedOn
                        }).ToList() : null
                    })
                    .ToListAsync();

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("savePostSubmission")]
        public async Task<IActionResult> SavePostSubmission([FromForm] PostSubmissionModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            byte[] encryptionKey = Encoding.UTF8.GetBytes("12345678901234567890123456789012");
            byte[] encryptionIV = Encoding.UTF8.GetBytes("1234567890123456");

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null)
                {
                    return NotFound(new { message = "User was not found." });
                }

                var post = await _context.forum_posts
                                       .Include(s => s.PostAttachments)
                                       .FirstOrDefaultAsync(s => s.ID == model.PostID);

                if (post != null)
                {
                    post.PostTitle = model.PostTitle;
                    post.PostDescription = model.PostDescription;
                    //post.EditedOn = DateTime.UtcNow; TODO: EditedOn column

                    if (post.PostAttachments != null)
                    {
                        foreach (var attachment in post.PostAttachments)
                        {
                            var filePath = attachment.FilePath;
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }

                        _context.posts_attachments.RemoveRange(post.PostAttachments);
                    }
                }
                else
                {
                    post = new ForumPosts
                    {
                        PostTitle = model.PostTitle,
                        PostDescription = model.PostDescription,
                        CreatedOn = DateTime.UtcNow,
                        UserID = user.ID,
                        IsDeleted = false,
                        VotesCount = 0
                    };
                    _context.forum_posts.Add(post);
                }
                await _context.SaveChangesAsync();

                if (model.Files != null)
                {
                    var currentDirectory = AppContext.BaseDirectory;
                    var projectRoot = FindProjectRoot(currentDirectory);
                    var encryptedFilesDirectory = Path.Combine(projectRoot, "encrypted_files");

                    foreach (var file in model.Files)
                    {
                        if (file.Length > 0)
                        {
                            var encryptedFilePath = Path.Combine(encryptedFilesDirectory, Guid.NewGuid().ToString() + Path.GetExtension(file.FileName));

                            using (var fileStream = new FileStream(encryptedFilePath, FileMode.Create))
                            {
                                using var aes = Aes.Create();
                                aes.Key = encryptionKey;
                                aes.IV = encryptionIV;
                                using var cryptoStream = new CryptoStream(fileStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
                                await file.CopyToAsync(cryptoStream);
                            }

                            var attachment = new PostsAttachments
                            {
                                PostID = post.ID,
                                AddedOn = DateTime.UtcNow,
                                FileName = file.FileName,
                                FilePath = encryptedFilePath
                            };

                            _context.posts_attachments.Add(attachment);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Post saved successfully", postId = post.ID });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("downloadPostFile")]
        public async Task<IActionResult> DownloadPostFile([FromBody] AttachmentIDModel model)
        {
            var attachment = await _context.posts_attachments
                .FirstOrDefaultAsync(a => a.ID == model.AttachmentID);
            if (attachment == null)
            {
                return NotFound();
            }

            var encryptedFilePath = attachment.FilePath;
            byte[] encryptionKey = Encoding.UTF8.GetBytes("12345678901234567890123456789012");
            byte[] encryptionIV = Encoding.UTF8.GetBytes("1234567890123456");

            byte[] fileContents = System.IO.File.ReadAllBytes(encryptedFilePath);
            byte[] decryptedContents = DecryptFileContents(fileContents, encryptionKey, encryptionIV);

            return File(decryptedContents, "application/octet-stream", attachment.FileName);
        }

        private byte[] DecryptFileContents(byte[] encryptedContents, byte[] key, byte[] iv)
        {
            using var aesAlg = Aes.Create();
            aesAlg.Key = key;
            aesAlg.IV = iv;

            ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
            using var msDecrypt = new MemoryStream(encryptedContents);
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new MemoryStream();
            csDecrypt.CopyTo(srDecrypt);
            return srDecrypt.ToArray();
        }

        private string FindProjectRoot(string startDirectory)
        {
            var directoryInfo = new DirectoryInfo(startDirectory);

            while (directoryInfo != null && !Directory.Exists(Path.Combine(directoryInfo.FullName, ".git")))
            {
                directoryInfo = directoryInfo.Parent;
            }

            if (directoryInfo == null)
            {
                throw new InvalidOperationException("Project root not found.");
            }

            return directoryInfo.FullName;
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
        public bool Voted { get; set; }
        public bool Liked { get; set; }
        public List<AttachmentDto>? Attachments { get; set; }
    }

    public class PostSubmissionModel
    {
        public int PostID { get; set; }
        public required string Login { get; set; }
        public required string PostTitle { get; set; }
        public string? PostDescription { get; set; }
        public List<IFormFile>? Files { get; set; }
    }
}
