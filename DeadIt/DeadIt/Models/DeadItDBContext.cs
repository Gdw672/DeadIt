using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace DeadIt.Models
{
    public class DeadItDBContext : DbContext, IDeadItDBContext
    {
        public DbSet<DBText> _textDBs {  get; set; }
        public DbSet<DBImages> _images {  get; set; }

        public DeadItDBContext(DbContextOptions options) : base(options) 
        {
        }
        public DeadItDBContext() { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server = NANOMACHINE; Database = DeadIt; Trusted_Connection=True; TrustServerCertificate=true;");
        }
    }

    public class DBText
    {
        public string _CharacterName { get; set; } = "";
        public string _Text { get; set; } = "";
        public int ID { get; set; }
    }

    public class DBImages
    {
        [Key]
        public int ID { get; set; }
        public string _ImageName { get; set; } = "";
        public byte[] _ImageData { get; set; }
    }

    public interface IDeadItDBContext
    {
        public DbSet<DBText> _textDBs { get; set; }
        public DbSet<DBImages> _images { get; set; }

        public int SaveChanges();
    }
}
