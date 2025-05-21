using DeatIt_CreationContentService.Models.DatabaseModel;
using Microsoft.EntityFrameworkCore;

namespace DeatIt_CreationContentService.Models.DB__Context
{
    public class ContentCreationDBContext : DbContext, IContentCreationDBContext
    {
        public DbSet<DBSpeech> textDB { get; set; }
        public DbSet<DBChoice> choiceDB { get; set; }

        public ContentCreationDBContext(DbContextOptions options) : base(options)
        {
        }

        public ContentCreationDBContext()
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=localhost,1434; Database = DeadItContentCreation; User Id = sa; Password = Lord3009!; TrustServerCertificate = True;");
        }

        void IContentCreationDBContext.SaveChanges()
        {
            base.SaveChanges();
        }
    }
    public interface IContentCreationDBContext
    {
        public DbSet<DBSpeech> textDB { get; set; }
        public DbSet<DBChoice> choiceDB { get; set; }

        public void SaveChanges();

    }
}
