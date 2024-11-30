using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SubmissionController : Controller
    {
        private readonly AppDbContext _context;

        public SubmissionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("saveTaskSubmission")]
        public async Task<IActionResult> SaveTaskSubmission([FromForm] SubmissionModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            byte[] encryptionKey = Encoding.UTF8.GetBytes("12345678901234567890123456789012");
            byte[] encryptionIV = Encoding.UTF8.GetBytes("1234567890123456");

            try
            {
                var taskExists = await _context.course_tasks.AnyAsync(t => t.ID == model.TaskID);
                if (!taskExists)
                {
                    return NotFound(new { message = $"No task found with ID {model.TaskID}" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var submission = await _context.task_submissions
                                       .Include(s => s.SubmissionAttachments)
                                       .FirstOrDefaultAsync(s => s.TaskID == model.TaskID && s.UserID == user.ID);

                if (submission != null)
                {
                    submission.SubmissionNote = model.SubmissionNote;
                    submission.AddedOn = DateTime.UtcNow;

                    if (submission.SubmissionAttachments != null)
                    {
                        var baseDirectory = AppContext.BaseDirectory;
                        var projectRoot = FindProjectRoot(baseDirectory);
                        var encryptedFilesDirectory = Path.Combine(projectRoot, "encrypted_files");

                        foreach (var attachment in submission.SubmissionAttachments)
                        {
                            var filePath = Path.Combine(encryptedFilesDirectory, attachment.FilePath);
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }
                        }

                        _context.submission_attachments.RemoveRange(submission.SubmissionAttachments);
                    }
                }
                else
                {
                    submission = new TaskSubmissions
                    {
                        TaskID = model.TaskID,
                        UserID = user.ID,
                        AddedOn = DateTime.UtcNow,
                        SubmissionNote = model.SubmissionNote,
                        IsDeleted = false
                    };
                    _context.task_submissions.Add(submission);
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

                            var attachment = new SubmissionAttachments
                            {
                                SubmissionID = submission.ID,
                                AddedOn = DateTime.UtcNow,
                                FileName = file.FileName,
                                FilePath = filePathName
                            };

                            _context.submission_attachments.Add(attachment);
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Submission saved successfully", submissionId = submission.ID });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("getTaskSubmissions")]
        public async Task<IActionResult> GetTaskSubmissions([FromBody] LeaveTaskModel model)
        {
            try
            {
                var taskExists = await _context.course_tasks.AnyAsync(t => t.ID == model.TaskID);
                if (!taskExists)
                {
                    return NotFound(new { message = $"No task found with ID {model.TaskID}" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == model.Login);
                if (user == null)
                {
                    return NotFound(new { message = "User was not found!" });
                }

                var submissions = await _context.task_submissions
                    .Where(s => s.TaskID == model.TaskID && s.UserID == user.ID && !s.IsDeleted)
                    .Include(s => s.SubmissionAttachments)
                    .Select(s => new SubmissionDto
                    {
                        SubmissionID = s.ID,
                        SubmissionNote = s.SubmissionNote ?? "",
                        AddedOn = s.AddedOn,
                        Attachments = s.SubmissionAttachments.Select(a => new AttachmentDto
                        {
                            AttachmentID = a.ID,
                            FileName = a.FileName,
                            FilePath = Url.Action("DownloadFile", new { attachmentId = a.ID }),
                            AddedOn = a.AddedOn
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(submissions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("downloadFile")]
        public async Task<IActionResult> DownloadFile([FromBody] AttachmentIDModel model)
        {
            var attachment = await _context.submission_attachments
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
    public class SubmissionModel
    {
        public int TaskID { get; set; }
        public required string Login { get; set; }
        public string? SubmissionNote { get; set; }
        public List<IFormFile>? Files { get; set; }
    }

    public class SubmissionDto
    {
        public int SubmissionID { get; set; }
        public string SubmissionNote { get; set; }
        public DateTime AddedOn { get; set; }
        public List<AttachmentDto> Attachments { get; set; }
    }

    public class AttachmentDto
    {
        public int AttachmentID { get; set; }
        public string FileName { get; set; }
        public DateTime AddedOn { get; set; }
        public string FilePath { get; set; }
    }

    public class AttachmentIDModel
    {
        public int AttachmentID { get; set; }
    }
}
