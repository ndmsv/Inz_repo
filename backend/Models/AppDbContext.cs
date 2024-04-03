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
        public DbSet<Type> user_types { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySQL("server=127.0.0.1;port=3306;database=engeneegingproject;user=root;password=abc");
        }
    }

    public class User
    {
        public int ID { get; set; }

        [Column("USER_LOGIN")]
        public string Login { get; set; }

        [Column("USER_PASSWORD")]
        public string Password { get; set; }

        [Column("USER_TYPE")]
        public int Type { get; set; }

        [Column("NAME")]
        public string? Name { get; set; }

        [Column("SURNAME")]
        public string? Surname { get; set; }
    }

    public class Type
    {
        public int ID { get; set; }

        [Column("TYPE_ID")]
        public int TypeID { get; set; }

        [Column("TYPE_NAME")]
        public string TypeName { get; set; }

        [Column("TYPE_PASSWORD")]
        public string TypePassword { get; set; }
    }
}
