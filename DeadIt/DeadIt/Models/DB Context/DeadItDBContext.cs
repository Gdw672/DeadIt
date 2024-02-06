using DeadIt.Models.DatabaseModel;
using Microsoft.EntityFrameworkCore;

namespace DeadIt.Models
{
    public class DeadItDBContext : DbContext, IDeadItDBContext
    {
        public DbSet<DBText> _textDBs {  get; set; }
        public DbSet<DBImages> _images {  get; set; }
        public DbSet<DBChoices> _choices { get; set; }

        public DeadItDBContext(DbContextOptions options) : base(options) 
        {
        }
        
        public DeadItDBContext() { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server = NANOMACHINE; Database = DeadIt; Trusted_Connection=True; TrustServerCertificate=true;");
        }
    }
    public interface IDeadItDBContext
    {
        public DbSet<DBText> _textDBs { get; set; }
        public DbSet<DBImages> _images { get; set; }
        public DbSet<DBChoices> _choices { get; set; }

        public int SaveChanges();
    }
}
