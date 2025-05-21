using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeatIt_CreationContentService.Migrations
{
    /// <inheritdoc />
    public partial class removeTypeFieldFromSpeech : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "textDB");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "textDB",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
