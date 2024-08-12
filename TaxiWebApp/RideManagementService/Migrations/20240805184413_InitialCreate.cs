using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RideManagementService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DriverUsername = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AproximatedTime = table.Column<double>(type: "float", nullable: false),
                    AproximatedCost = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DriveStatus = table.Column<int>(type: "int", nullable: false),
                    StartingAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EndingAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drives", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Drives");
        }
    }
}
