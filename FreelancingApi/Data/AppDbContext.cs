using Microsoft.EntityFrameworkCore;
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Job> Jobs { get; set; } = null!;
    public DbSet<Proposal> Proposals { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<Skill> Skills { get; set; } = null!;
    public DbSet<UserSkill> UserSkills { get; set; } = null!;
    public DbSet<Language> Languages { get; set; } = null!;
    public DbSet<Portfolio> Portfolios { get; set; } = null!;
    public DbSet<WorkHistory> WorkHistory { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Milestone> Milestones { get; set; } = null!;
    public DbSet<JobQuestion> JobQuestions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
        
        // User - FreelancerProfile (1:1)
        modelBuilder.Entity<User>()
            .HasOne(u => u.FreelancerProfile)
            .WithOne(fp => fp.User)
            .HasForeignKey<FreelancerProfile>(fp => fp.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // User - ClientProfile (1:1)
        modelBuilder.Entity<User>()
            .HasOne(u => u.ClientProfile)
            .WithOne(cp => cp.User)
            .HasForeignKey<ClientProfile>(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Job - Category relationship
        modelBuilder.Entity<Job>()
            .HasOne(j => j.Category)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CategoryId);
        
        // Job - Client relationship
        modelBuilder.Entity<Job>()
            .HasOne(j => j.Client)
            .WithMany(u => u.PostedJobs)
            .HasForeignKey(j => j.ClientId);
        
        // Job - Skills (many-to-many)
        modelBuilder.Entity<Job>()
            .HasMany(j => j.RequiredSkills)
            .WithMany(s => s.Jobs)
            .UsingEntity(j => j.ToTable("JobSkills"));
        
        // Proposal relationships
        modelBuilder.Entity<Proposal>()
            .HasOne(p => p.Job)
            .WithMany(j => j.Proposals)
            .HasForeignKey(p => p.JobId);
        
        modelBuilder.Entity<Proposal>()
            .HasOne(p => p.Freelancer)
            .WithMany(u => u.Proposals)
            .HasForeignKey(p => p.FreelancerId);
        
        // Message relationships
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Review relationships
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany(u => u.GivenReviews)
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewee)
            .WithMany(u => u.ReceivedReviews)
            .HasForeignKey(r => r.RevieweeId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // UserSkill composite key
        modelBuilder.Entity<UserSkill>()
            .HasKey(us => new { us.UserId, us.SkillId }); 
    }


}
