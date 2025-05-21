using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeatIt_CreationContentService.Migrations
{
    /// <inheritdoc />
    public partial class removeId2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextID2",
                table: "textDB");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NextID2",
                table: "textDB",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
