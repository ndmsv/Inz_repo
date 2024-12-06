using System.Text.Json.Serialization;

namespace backend.Models
{
    #region LoginController
    public class PlainLoginModel
    {
        public string Login { get; set; }
    }

    public class TypeModel
    {
        public int TypeID { get; set; }
        public string Password { get; set; }
    }

    public class LoginModel
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }

    public class LoginModelExtended
    {
        public string Login { get; set; }
        public string Password { get; set; }
        public int Type { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
    }
    #endregion LoginController

    #region CourseController
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
    #endregion CourseController

    #region TaskController
    public class LeaveTaskModel
    {
        public required string Login { get; set; }
        public int TaskID { get; set; }
    }

    public class FullTaskModel
    {
        public required int CourseID { get; set; }
        public required string TaskName { get; set; }
        public string? TaskDescription { get; set; }
        public required DateTime OpeningDate { get; set; }
        public required DateTime ClosingDate { get; set; }
        public required bool LimitedAttachments { get; set; }
        public int? AttachmentsNumber { get; set; }
        public required bool LimitedAttachmentTypes { get; set; }
        public string? AttachmentTypes { get; set; }
        public int? TaskID { get; set; }
    }
    #endregion TaskController

    #region SubmissionController
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
    #endregion CourseController

    #region ForumController
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
        public DateTime? EditedOn { get; set; }
        public bool IsDeleted { get; set; }
        public int VotesCount { get; set; }
        public bool IsEditible { get; set; }
        public bool Voted { get; set; }
        public bool Liked { get; set; }
        public required string CreatedBy { get; set; }
        public int CommentsCount { get; set; }
        public List<AttachmentDto>? Attachments { get; set; }
    }

    public class PostSubmissionModel
    {
        public int? PostID { get; set; }
        public required string Login { get; set; }
        public required string PostTitle { get; set; }
        public string? PostDescription { get; set; }
        public List<IFormFile>? Files { get; set; }
    }

    public class VoteModel
    {
        public int PostID { get; set; }
        public required string Login { get; set; }
        public bool Voted { get; set; }
        public bool Liked { get; set; }
    }

    public class SelectedPostModel
    {
        public int PostID { get; set; }
        public required string Login { get; set; }
    }

    public class PostCommentModel
    {
        public int? CommentID { get; set; }
        public int PostID { get; set; }
        public required string Login { get; set; }
        public required string PostContent { get; set; }
    }

    public class PostCommentModelExtended
    {
        public int ID { get; set; }
        public int PostID { get; set; }
        public string UserDisplayName { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public required string PostContent { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsEditible { get; set; }
    }

    public class SimpleCommentModel
    {
        public int CommentID { get; set; }
        public required string Login { get; set; }
    }
    #endregion ForumController

    #region ReportController

    public class ReportModel
    {
        public int PostID { get; set; }
        public int? CommentID { get; set; }
        public required string ReportingUserLogin { get; set; }
        public required string ReportReason { get; set; }
    }

    public class ForumReportResponse
    {
        public int Id { get; set; }
        public string ReportingUser { get; set; } = default!;
        public string ReportReason { get; set; } = default!;
        public DateTime CreatedOn { get; set; }
        public bool IsResolved { get; set; }
        public string? ResolvingUser { get; set; }
        public DateTime? ResolvedOn { get; set; }
        public string? ResolveComment { get; set; }
    }

    #endregion
}
