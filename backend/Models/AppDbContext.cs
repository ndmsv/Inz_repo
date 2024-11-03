using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using MySql.EntityFrameworkCore.Extensions;

namespace backend.Models
{
    using Microsoft.EntityFrameworkCore;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }
        public DbSet<User> Users { get; set; }
        public DbSet<Type> user_types { get; set; }
        public DbSet<Course> courses { get; set; }
        public DbSet<UsersInCourse> users_in_course { get; set; }
        public DbSet<CourseTasks> course_tasks { get; set; }
        public DbSet<TaskSubmissions> task_submissions { get; set; }
        public DbSet<SubmissionAttachments> submission_attachments { get; set; }
        public DbSet<ForumPosts> forum_posts { get; set; }
        public DbSet<ForumVotes> forum_votes { get; set; }
        public DbSet<PostsAttachments> posts_attachments { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=127.0.0.1;port=3306;database=engeneegingproject;user=root;password=abc");
        }
    }

    public class User
    {
        [Key]
        public int ID { get; set; }

        [Column("USER_LOGIN")]
        public required string Login { get; set; }

        [Column("USER_PASSWORD")]
        public required string Password { get; set; }

        [ForeignKey("UserType")]
        [Column("USER_TYPE")]
        public int Type { get; set; }

        [Column("NAME")]
        public string? Name { get; set; }

        [Column("SURNAME")]
        public string? Surname { get; set; }

        public Type? UserType { get; set; }

        public ICollection<Course>? Courses { get; set; }
        public ICollection<UsersInCourse>? UsersInCourse { get; set; }
        public ICollection<TaskSubmissions>? TaskSubmissions { get; set; }
        public ICollection<ForumVotes>? ForumVotes { get; set; }
    }

    public class Type
    {
        public int ID { get; set; }

        [Key]
        [Column("TYPE_ID")]
        public int TypeID { get; set; }

        [Column("TYPE_NAME")]
        public required string TypeName { get; set; }

        [Column("TYPE_PASSWORD")]
        public string? TypePassword { get; set; }

        public ICollection<User>? Users { get; set; }
    }

    public class Course
    {
        [Key]
        public int ID { get; set; }

        [Column("COURSE_NAME")]
        public required string Name { get; set; }

        [Column("COURSE_DESC")]
        public string? Description { get; set; }

        [ForeignKey("User")]
        [Column("COURSE_OWNER_ID")]
        public required int OwnerID { get; set; }

        [Column("COURSE_PASSWORD")]
        public string? Password { get; set; }

        [Column("IS_DELETED")]
        public required bool IsDeleted { get; set; }

        public User? User { get; set; }

        public ICollection<UsersInCourse>? UsersInCourse { get; set; }

        public ICollection<CourseTasks>? CourseTasks { get; set; }
    }

    public class UsersInCourse
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("User")]
        [Column("USER_ID")]
        public required int UserID { get; set; }

        [ForeignKey("Course")]
        [Column("COURSE_ID")]
        public required int CourseID { get; set; }

        [Column("IS_OWNER")]
        public required bool IsOwner { get; set; }

        [Column("IS_DELETED")]
        public required bool IsDeleted { get; set; }

        public User? User { get; set; }

        public Course? Course { get; set; }
    }

    public class CourseTasks
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("Course")]
        [Column("COURSE_ID")]
        public required int CourseID { get; set; }

        [Column("TASK_NAME")]
        public required string TaskName { get; set; }

        [Column("TASK_DESCRIPTION")]
        public string? TaskDescription { get; set; }

        [Column("CREATION_DATE")]
        public required DateTime CreationDate { get; set; }

        [Column("OPENING_DATE")]
        public required DateTime OpeningDate { get; set; }

        [Column("CLOSING_DATE")]
        public required DateTime ClosingDate { get; set; }

        [Column("LIMITED_ATTACHMENTS")]
        public required bool LimitedAttachments { get; set; }

        [Column("ATTACHMENTS_NUMBER")]
        public int? AttachmentsNumber { get; set; }

        [Column("LIMITED_ATTACHMENT_TYPES")]
        public required bool LimitedAttachmentTypes { get; set; }

        [Column("ATTACHMENT_TYPES")]
        public string? AttachmentTypes { get; set; }

        [Column("IS_DELETED")]
        public required bool IsDeleted { get; set; }

        public Course? Course { get; set; }
        public ICollection<TaskSubmissions>? TaskSubmissions { get; set; }

    }

    public class TaskSubmissions
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("CourseTask")]
        [Column("TASK_ID")]
        public int TaskID { get; set; }

        [ForeignKey("User")]
        [Column("USER_ID")]
        public int UserID { get; set; }

        [Column("ADDED_ON")]
        public DateTime AddedOn { get; set; }

        [Column("SUBMISSION_NOTE")]
        public string? SubmissionNote { get; set; }

        [Column("IS_DELETED")]
        public bool IsDeleted { get; set; }

        public virtual User? User { get; set; }
        public virtual CourseTasks? CourseTask { get; set; }
        public ICollection<SubmissionAttachments>? SubmissionAttachments { get; set; }
    }

    public class SubmissionAttachments
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("TaskSubmission")]
        [Column("SUBMISSION_ID")]
        public int SubmissionID { get; set; }

        [Column("ADDED_ON")]
        public DateTime AddedOn { get; set; }

        [Column("FILE_NAME")]
        public required string FileName { get; set; }

        [Column("FILE_PATH")]
        public required string FilePath { get; set; }

        public virtual TaskSubmissions? TaskSubmission { get; set; }
    }

    public class ForumPosts
    {
        [Key]
        public int ID { get; set; }

        [Column("POST_TITLE")]
        public required string PostTitle { get; set; }

        [Column("POST_DESCRIPTION")]
        public string? PostDescription { get; set; }

        [Column("CREATED_ON")]
        public required DateTime CreatedOn { get; set; }

        [Column("USER_ID")]
        public required int UserID { get; set; }

        [Column("IS_DELETED")]
        public required bool IsDeleted { get; set; }

        [Column("VOTES_COUNT")]
        public required int VotesCount { get; set; }

        public ICollection<ForumVotes>? ForumVotes { get; set; }
        public ICollection<PostsAttachments>? PostAttachments { get; set; }
    }

    public class ForumVotes
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("Post")]
        [Column("POST_ID")]
        public required int PostID { get; set; }

        [ForeignKey("User")]
        [Column("USER_ID")]
        public required int UserID { get; set; }

        [Column("IS_LIKED")]
        public required bool IsLiked { get; set; }

        [Column("IS_DELETED")]
        public required bool IsDeleted { get; set; }

        public User? User { get; set; }

        public ForumPosts? Post { get; set; }
    }

    public class PostsAttachments
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey("ForumPost")]
        [Column("POST_ID")]
        public int PostID { get; set; }

        [Column("ADDED_ON")]
        public DateTime AddedOn { get; set; }

        [Column("FILE_NAME")]
        public required string FileName { get; set; }

        [Column("FILE_PATH")]
        public required string FilePath { get; set; }

        public virtual ForumPosts? ForumPost { get; set; }
    }
}
