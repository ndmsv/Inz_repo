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

    }
}
