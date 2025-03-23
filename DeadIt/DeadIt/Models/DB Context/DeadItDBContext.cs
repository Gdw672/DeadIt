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

        public DeadItDBContext()
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=mssql,1433; Database = DeadIt; User Id = sa; Password = Lord3009!; TrustServerCertificate = True;");
        }
    }
    public interface IDeadItDBContext
    {
        public DbSet<DBText> _textDBs { get; set; }
        public DbSet<DBImages> _images { get; set; }
        public DbSet<DBChoices> _choices { get; set; }
    }
}
