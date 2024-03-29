using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using MySql.EntityFrameworkCore.Extensions;

namespace backend.Models
{
    using Microsoft.EntityFrameworkCore;
    using System.ComponentModel.DataAnnotations.Schema;

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=127.0.0.1;port=3306;database=engeneegingproject;user=root;password=abc");
        }
    }

    public class User
    {
        public int Id { get; set; }

        [Column("USER_NAME")]
        public string Login { get; set; } // This property is mapped to the "USER_NAME" column

        [Column("USER_PASSWORD")]
        public string Password { get; set; } // This property is mapped to the "USER_PASSWORD" column
    }
}
