using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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

        [HttpGet("getForumPosts")]
        public async Task<IActionResult> GetForumPosts([FromQuery] string login, [FromQuery] PostType type, [FromQuery] Timeframe? timeframe)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });

                DateTime timeframeLimit = DateTime.Now;
                if (type == PostType.Top && timeframe.HasValue)
                {
                    timeframeLimit = timeframe switch
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

                if (type == PostType.Hot)
                {
                    var postsHot = _context.forum_posts
                        .Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted)
                        .AsEnumerable()
                        .OrderByDescending(post =>
                        {
                            var hoursSinceCreation = Math.Max((DateTime.Now - post.CreatedOn).TotalHours, 1);
                            return post.VotesCount >= 0
                                ? (double)post.VotesCount / hoursSinceCreation
                                : (double)post.VotesCount * hoursSinceCreation;
                        })
                        .ThenByDescending(post => post.CreatedOn)
                        .Take(100)
                        .Select(post => new ForumPostModelExtended
                        {
                            Id = post.ID,
                            PostTitle = post.PostTitle,
                            PostDescription = post.PostDescription,
                            CreatedOn = DateTime.SpecifyKind(post.CreatedOn, DateTimeKind.Utc),
                            EditedOn = post.EditedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(post.EditedOn), DateTimeKind.Utc) : null,
                            IsDeleted = post.IsDeleted,
                            VotesCount = post.VotesCount,
                            IsEditible = post.UserID == user.ID || user.UserType.TypeName == "Administrator",
                            Voted = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted),
                            Liked = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted && vote.IsLiked),
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
                        .ToList();
                    return Ok(postsHot);
                }

                IQueryable<ForumPosts> query = _context.forum_posts;

                if (type == PostType.Top)
                {
                    query = query
                        .Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted && post.CreatedOn >= timeframeLimit)
                        .OrderByDescending(post => post.VotesCount);
                }
                else if (type == PostType.New)
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
                        EditedOn = post.EditedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(post.EditedOn), DateTimeKind.Utc) : null,
                        IsDeleted = post.IsDeleted,
                        VotesCount = post.VotesCount,
                        IsEditible = post.UserID == user.ID || user.UserType.TypeName == "Administrator",
                        Voted = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted),
                        Liked = _context.forum_votes.Any(vote => vote.PostID == post.ID && vote.UserID == user.ID && !vote.IsDeleted && vote.IsLiked),
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
                    post.EditedOn = DateTime.UtcNow;

                    if (post.PostAttachments != null)
                    {
                        var baseDirectory = AppContext.BaseDirectory;
                        var projectRoot = FindProjectRoot(baseDirectory);
                        var encryptedFilesDirectory = Path.Combine(projectRoot, "encrypted_files");

                        foreach (var attachment in post.PostAttachments)
                        {
                            var filePath = Path.Combine(encryptedFilesDirectory, attachment.FilePath);
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
                            var filePathName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                            var encryptedFilePath = Path.Combine(encryptedFilesDirectory, filePathName);

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
                                FilePath = filePathName
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

            var baseDirectory = AppContext.BaseDirectory;
            var projectRoot = FindProjectRoot(baseDirectory);
            var encryptedFilesDirectory = Path.Combine(projectRoot, "encrypted_files");
            var encryptedFilePath = Path.Combine(encryptedFilesDirectory, attachment.FilePath);

            byte[] encryptionKey = Encoding.UTF8.GetBytes("12345678901234567890123456789012");
            byte[] encryptionIV = Encoding.UTF8.GetBytes("1234567890123456");

            byte[] fileContents = System.IO.File.ReadAllBytes(encryptedFilePath);
            byte[] decryptedContents = DecryptFileContents(fileContents, encryptionKey, encryptionIV);

            return File(decryptedContents, "application/octet-stream", attachment.FileName);
        }

        [HttpPost("voteOnPost")]
        public async Task<IActionResult> VoteOnPost([FromBody] VoteModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var post = await _context.forum_posts.FirstOrDefaultAsync(u => u.ID == model.PostID);
                if (post == null)
                {
                    return NotFound(new { message = "Post was not found." });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null)
                {
                    return NotFound(new { message = "User was not found." });
                }

                var vote = await _context.forum_votes.FirstOrDefaultAsync(u => u.User == user && u.Post == post);
                if (vote != null)
                {
                    if (!model.Voted && !vote.IsDeleted) // Vote cancellation
                    {
                        post.VotesCount += vote.IsLiked ? -1 : 1;
                    }
                    else if (model.Voted && !vote.IsDeleted) // Opposite vote
                    {
                        if (vote.IsLiked && !model.Liked)
                        {
                            post.VotesCount -= 2;
                        }
                        else if (!vote.IsLiked && model.Liked)
                        {
                            post.VotesCount += 2;
                        }
                    }
                    else if (model.Voted && vote.IsDeleted) // Revote
                    {
                        post.VotesCount += model.Liked ? 1 : -1;
                    }

                    vote.IsDeleted = !model.Voted;
                    vote.IsLiked = model.Voted && model.Liked;
                }
                else
                {
                    var newVote = new ForumVotes
                    {
                        PostID = post.ID,
                        UserID = user.ID,
                        IsLiked = model.Liked,
                        IsDeleted = !model.Voted
                    };
                    _context.forum_votes.Add(newVote);

                    if (!newVote.IsDeleted)
                    {
                        post.VotesCount += newVote.IsLiked ? 1 : -1;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Vote saved successfully" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("getUserPosts")]
        public async Task<IActionResult> GetUserPosts([FromQuery] string login)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });

                var query = _context.forum_posts.Include(s => s.PostAttachments)
                        .Where(post => !post.IsDeleted && post.UserID == user.ID)
                        .OrderByDescending(post => post.CreatedOn);

                var posts = await query
                    .Select(post => new ForumPostModelExtended
                    {
                        Id = post.ID,
                        PostTitle = post.PostTitle,
                        PostDescription = post.PostDescription,
                        CreatedOn = DateTime.SpecifyKind(post.CreatedOn, DateTimeKind.Utc),
                        EditedOn = post.EditedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(post.EditedOn), DateTimeKind.Utc) : null,
                        IsDeleted = post.IsDeleted,
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

        [HttpGet("getSelectedPost")]
        public async Task<IActionResult> GetSelectedPost([FromQuery] int postID, [FromQuery] string login)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });

                var post = await _context.forum_posts
                    .Include(p => p.PostAttachments)
                    .Where(p => !p.IsDeleted && p.ID == postID)
                    .Select(p => new ForumPostModelExtended
                    {
                        Id = p.ID,
                        PostTitle = p.PostTitle,
                        PostDescription = p.PostDescription,
                        CreatedOn = DateTime.SpecifyKind(p.CreatedOn, DateTimeKind.Utc),
                        EditedOn = p.EditedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(p.EditedOn), DateTimeKind.Utc) : null,
                        IsDeleted = p.IsDeleted,
                        VotesCount = p.VotesCount,
                        IsEditible = p.UserID == user.ID || user.UserType.TypeName == "Administrator",
                        CreatedBy = _context.Users
                                .Where(u => u.ID == p.UserID)
                                .Select(u => (u.Name != null && u.Surname != null) ? (u.Name + " " + u.Surname) : u.Login)
                                .FirstOrDefault(),
                        Attachments = p.PostAttachments != null ? p.PostAttachments.Select(a => new AttachmentDto
                        {
                            AttachmentID = a.ID,
                            FileName = a.FileName,
                            FilePath = Url.Action("DownloadFile", new { attachmentId = a.ID }),
                            AddedOn = a.AddedOn
                        }).ToList() : null,
                        CommentsCount = _context.posts_comments.Count(comment => comment.PostID == p.ID && !comment.IsDeleted)
                    })
                    .FirstOrDefaultAsync();

                if (post == null) return NotFound(new { message = "Post not found" });

                return Ok(post);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("deletePost")]
        public async Task<IActionResult> DeletePost([FromBody] SelectedPostModel model)
        {
            try
            {
                var post = await _context.forum_posts
                                       .Include(s => s.PostAttachments)
                                       .Include(t => t.ForumVotes)
                                       .Include(u => u.PostsComments)
                                       .Include(v => v.ForumReports)
                                       .FirstOrDefaultAsync(s => s.ID == model.PostID);

                if (post == null)
                {
                    return NotFound(new { message = "Course with said ID doesn't exist!" });
                }
                else if (post.IsDeleted)
                {
                    return BadRequest(new { message = "Course with said ID is already deleted!" });
                }
                else
                {
                    if (post.ForumVotes != null)
                    {
                        foreach (var vote in post.ForumVotes)
                        {
                            vote.IsDeleted = true;
                        }
                    }

                    if (post.PostAttachments != null)
                    {
                        var baseDirectory = AppContext.BaseDirectory;
                        var projectRoot = FindProjectRoot(baseDirectory);
                        var encryptedFilesDirectory = Path.Combine(projectRoot, "encrypted_files");

                        foreach (var attachment in post.PostAttachments)
                        {
                            var filePath = Path.Combine(encryptedFilesDirectory, attachment.FilePath);
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }

                        _context.posts_attachments.RemoveRange(post.PostAttachments);
                    }

                    if (post.PostsComments != null)
                    {
                        foreach (var comment in post.PostsComments)
                        {
                            comment.IsDeleted = true;
                        }
                    }

                    if (post.ForumReports != null)
                    {
                        foreach (var report in post.ForumReports)
                        {
                            if (!report.IsDeleted && !report.IsResolved)
                            {
                                report.IsResolved = true;
                                report.ResolvedOn = DateTime.UtcNow;
                                report.ResolveComment = "Resolved automatically due to post delete";
                            }
                            report.IsDeleted = true;
                        }
                    }

                    post.IsDeleted = true;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "You have successfully deleted the post!" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("savePostComment")]
        public async Task<IActionResult> SavePostComment([FromBody] PostCommentModel model)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null) return NotFound(new { message = "User not found" });

                var comment = await _context.posts_comments.FirstOrDefaultAsync(c => c.ID == model.CommentID);
                if (comment == null)
                {
                    comment = new PostsComments
                    {
                        PostID = model.PostID,
                        UserID = user.ID,
                        CreatedOn = DateTime.UtcNow,
                        PostContent = model.PostContent,
                        IsDeleted = false
                    };

                    _context.posts_comments.Add(comment);
                }
                else
                {
                    comment.PostContent = model.PostContent;
                    comment.UpdatedOn = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Comment saved" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("getSelectedPostComments")]
        public async Task<IActionResult> GetSelectedPostComments([FromQuery] int postID, [FromQuery] string login)
        {
            try
            {
                var user = await _context.Users.Include(s => s.UserType).FirstOrDefaultAsync(u => u.Login == login);
                if (user == null) return NotFound(new { message = "User not found" });

                var post = await _context.forum_posts.FirstOrDefaultAsync(post => !post.IsDeleted && post.ID == postID);

                if (post == null)
                {
                    return NotFound(new { message = "Post not found" });
                }
                else
                {
                    var comments = await _context.posts_comments
                        .Where(p => !p.IsDeleted && p.ForumPost == post)
                        .Select(s => new PostCommentModelExtended
                        {
                            ID = s.ID,
                            PostID = s.PostID,
                            UserDisplayName = _context.Users
                                .Where(u => u.ID == s.UserID)
                                .Select(u => (u.Name != null && u.Surname != null) ? (u.Name + " " + u.Surname) : u.Login)
                                .FirstOrDefault(),
                            CreatedOn = DateTime.SpecifyKind(s.CreatedOn, DateTimeKind.Utc),
                            UpdatedOn = s.UpdatedOn != null ? DateTime.SpecifyKind(Convert.ToDateTime(s.UpdatedOn), DateTimeKind.Utc) : null,
                            PostContent = s.PostContent,
                            IsDeleted = s.IsDeleted,
                            IsEditible = s.UserID == user.ID || user.UserType.TypeName == "Administrator",
                        })
                        .ToListAsync();

                    return Ok(comments);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("deletePostComment")]
        public async Task<IActionResult> DeletePostComment([FromBody] SimpleCommentModel model)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null) return NotFound(new { message = "User not found" });

                var comment = await _context.posts_comments.Include(a => a.ForumReports).FirstOrDefaultAsync(c => c.ID == model.CommentID);
                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }
                else
                {
                    comment.IsDeleted = true;

                    if (comment.ForumReports != null)
                    {
                        foreach (var report in comment.ForumReports)
                        {
                            if (!report.IsDeleted && !report.IsResolved)
                            {
                                report.IsResolved = true;
                                report.ResolvedOn = DateTime.UtcNow;
                                report.ResolveComment = "Resolved automatically due to comment delete";
                            }
                            report.IsDeleted = true;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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
}
