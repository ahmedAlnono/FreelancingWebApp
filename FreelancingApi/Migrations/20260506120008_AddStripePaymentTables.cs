using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FreelancingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddStripePaymentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "ConnectedAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    StripeAccountId = table.Column<string>(type: "text", nullable: false),
                    IsOnboarded = table.Column<bool>(type: "boolean", nullable: false),
                    AccountStatus = table.Column<string>(type: "text", nullable: true),
                    ChargesEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    PayoutsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    OnboardedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    DefaultCurrency = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConnectedAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConnectedAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Escrows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JobId = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    ReleasedAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    HeldAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StripePaymentIntentId = table.Column<string>(type: "text", nullable: false),
                    DisputeDeadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DisputeReason = table.Column<string>(type: "text", nullable: true),
                    DisputeResolution = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Escrows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Escrows_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StripePaymentIntentId = table.Column<string>(type: "text", nullable: false),
                    StripeTransferId = table.Column<string>(type: "text", nullable: false),
                    JobId = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    FreelancerId = table.Column<int>(type: "integer", nullable: false),
                    MilestoneId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PlatformFee = table.Column<decimal>(type: "numeric", nullable: false),
                    FreelancerAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReleasedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefundedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefundReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Milestones_MilestoneId",
                        column: x => x.MilestoneId,
                        principalTable: "Milestones",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Users_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Users_FreelancerId",
                        column: x => x.FreelancerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EscrowReleases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EscrowId = table.Column<int>(type: "integer", nullable: false),
                    MilestoneId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    ReleasedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StripeTransferId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EscrowReleases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EscrowReleases_Escrows_EscrowId",
                        column: x => x.EscrowId,
                        principalTable: "Escrows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EscrowReleases_Milestones_MilestoneId",
                        column: x => x.MilestoneId,
                        principalTable: "Milestones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConnectedAccounts_StripeAccountId",
                table: "ConnectedAccounts",
                column: "StripeAccountId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConnectedAccounts_UserId",
                table: "ConnectedAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowReleases_EscrowId",
                table: "EscrowReleases",
                column: "EscrowId");

            migrationBuilder.CreateIndex(
                name: "IX_EscrowReleases_MilestoneId",
                table: "EscrowReleases",
                column: "MilestoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Escrows_JobId",
                table: "Escrows",
                column: "JobId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ClientId",
                table: "Payments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_FreelancerId",
                table: "Payments",
                column: "FreelancerId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_JobId",
                table: "Payments",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_MilestoneId",
                table: "Payments",
                column: "MilestoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StripePaymentIntentId",
                table: "Payments",
                column: "StripePaymentIntentId",
                unique: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropTable(
                name: "ConnectedAccounts");

            migrationBuilder.DropTable(
                name: "EscrowReleases");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Escrows");

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
    }
}
