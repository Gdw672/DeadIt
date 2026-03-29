using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeatIt_CreationContentService.Migrations
{
    /// <inheritdoc />
    public partial class AddNodeCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "X",
                table: "textDB",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "Y",
                table: "textDB",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "X",
                table: "choiceDB",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "Y",
                table: "choiceDB",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "X",
                table: "textDB");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "textDB");

            migrationBuilder.DropColumn(
                name: "X",
                table: "choiceDB");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "choiceDB");
        }
    }
}
