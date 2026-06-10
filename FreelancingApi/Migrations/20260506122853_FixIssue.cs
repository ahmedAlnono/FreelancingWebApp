using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FreelancingApi.Migrations
{
    /// <inheritdoc />
    public partial class FixIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClientProfiles_Users_UserId",
                table: "ClientProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_FreelancerProfiles_Users_UserId",
                table: "FreelancerProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Languages_FreelancerProfiles_FreelancerProfileId",
                table: "Languages");

            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_FreelancerProfiles_FreelancerProfileId",
                table: "Portfolios");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_FreelancerProfiles_FreelancerProfileId",
                table: "UserSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkHistory_FreelancerProfiles_FreelancerProfileId",
                table: "WorkHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FreelancerProfiles",
                table: "FreelancerProfiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClientProfiles",
                table: "ClientProfiles");

            migrationBuilder.RenameTable(
                name: "FreelancerProfiles",
                newName: "FreelancerProfile");

            migrationBuilder.RenameTable(
                name: "ClientProfiles",
                newName: "ClientProfile");

            migrationBuilder.RenameIndex(
                name: "IX_FreelancerProfiles_UserId",
                table: "FreelancerProfile",
                newName: "IX_FreelancerProfile_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ClientProfiles_UserId",
                table: "ClientProfile",
                newName: "IX_ClientProfile_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FreelancerProfile",
                table: "FreelancerProfile",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClientProfile",
                table: "ClientProfile",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Withdrawals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FreelancerId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    StripeTransferId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailureReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Withdrawals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Withdrawals_Users_FreelancerId",
                        column: x => x.FreelancerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_FreelancerId",
                table: "Withdrawals",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_StripeTransferId",
                table: "Withdrawals",
                column: "StripeTransferId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ClientProfile_Users_UserId",
                table: "ClientProfile",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FreelancerProfile_Users_UserId",
                table: "FreelancerProfile",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Languages_FreelancerProfile_FreelancerProfileId",
                table: "Languages",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfile",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_FreelancerProfile_FreelancerProfileId",
                table: "Portfolios",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfile",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_FreelancerProfile_FreelancerProfileId",
                table: "UserSkills",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfile",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkHistory_FreelancerProfile_FreelancerProfileId",
                table: "WorkHistory",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfile",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClientProfile_Users_UserId",
                table: "ClientProfile");

            migrationBuilder.DropForeignKey(
                name: "FK_FreelancerProfile_Users_UserId",
                table: "FreelancerProfile");

            migrationBuilder.DropForeignKey(
                name: "FK_Languages_FreelancerProfile_FreelancerProfileId",
                table: "Languages");

            migrationBuilder.DropForeignKey(
                name: "FK_Portfolios_FreelancerProfile_FreelancerProfileId",
                table: "Portfolios");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_FreelancerProfile_FreelancerProfileId",
                table: "UserSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkHistory_FreelancerProfile_FreelancerProfileId",
                table: "WorkHistory");

            migrationBuilder.DropTable(
                name: "Withdrawals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FreelancerProfile",
                table: "FreelancerProfile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClientProfile",
                table: "ClientProfile");

            migrationBuilder.RenameTable(
                name: "FreelancerProfile",
                newName: "FreelancerProfiles");

            migrationBuilder.RenameTable(
                name: "ClientProfile",
                newName: "ClientProfiles");

            migrationBuilder.RenameIndex(
                name: "IX_FreelancerProfile_UserId",
                table: "FreelancerProfiles",
                newName: "IX_FreelancerProfiles_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ClientProfile_UserId",
                table: "ClientProfiles",
                newName: "IX_ClientProfiles_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FreelancerProfiles",
                table: "FreelancerProfiles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClientProfiles",
                table: "ClientProfiles",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ClientProfiles_Users_UserId",
                table: "ClientProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FreelancerProfiles_Users_UserId",
                table: "FreelancerProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Languages_FreelancerProfiles_FreelancerProfileId",
                table: "Languages",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Portfolios_FreelancerProfiles_FreelancerProfileId",
                table: "Portfolios",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_FreelancerProfiles_FreelancerProfileId",
                table: "UserSkills",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfiles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkHistory_FreelancerProfiles_FreelancerProfileId",
                table: "WorkHistory",
                column: "FreelancerProfileId",
                principalTable: "FreelancerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
