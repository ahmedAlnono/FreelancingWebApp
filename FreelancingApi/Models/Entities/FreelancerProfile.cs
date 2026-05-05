namespace FreelancingApi.Models.Entities;

public class FreelancerProfile : BaseEntity
{
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public decimal HourlyRate { get; set; }
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public int CompletedProjects { get; set; }
    public int HoursWorked { get; set; }
    public int ResponseRate { get; set; } // Percentage
    public decimal TotalEarnings { get; set; }
    public bool IsOnline { get; set; }
    public string Availability { get; set; } = "available"; // available, busy, unavailable
    public string Level { get; set; } = "intermediate"; // beginner, intermediate, expert
    public string? CoverImage { get; set; }
    
    // Navigation properties
    public virtual ICollection<UserSkill> Skills { get; set; } = [];
    public virtual ICollection<Language> Languages { get; set; } = [];
    public virtual ICollection<Portfolio> Portfolios { get; set; } = [];
    public virtual ICollection<WorkHistory> WorkHistory { get; set; } = [];
}