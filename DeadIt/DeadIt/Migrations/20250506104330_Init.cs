using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeadIt.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "_textsDB");

            migrationBuilder.CreateTable(
                name: "_choices",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChoiceID = table.Column<int>(type: "int", nullable: false),
                    NextChoiceID = table.Column<int>(type: "int", nullable: false),
                    CharacterName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__choices", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "_images",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    _ImageName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    _ImageData = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__images", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "_textDBs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    _CharacterName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    _Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    _NextChoiceID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__textDBs", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "_choices");

            migrationBuilder.DropTable(
                name: "_images");

            migrationBuilder.DropTable(
                name: "_textDBs");

            migrationBuilder.CreateTable(
                name: "_textsDB",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    _CharacterName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__textsDB", x => x.ID);
                });
        }
    }
}
