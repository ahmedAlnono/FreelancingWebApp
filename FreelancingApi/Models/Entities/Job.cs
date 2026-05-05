using System.Text.Json.Serialization;

namespace FreelancingApi.Models.Entities;

public class Job : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public int CategoryId { get; set; }
    public virtual Category Category { get; set; } = null!;
    
    public int ClientId { get; set; }
    public virtual User Client { get; set; } = null!;
    
    public string BudgetType { get; set; } = "hourly"; // hourly, fixed
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? BudgetFixed { get; set; }
    
    public string ProjectLength { get; set; } = string.Empty; // less-than-1-month, 1-to-3-months, 3-to-6-months, more-than-6-months
    public string ExperienceLevel { get; set; } = "intermediate"; // beginner, intermediate, expert
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public DateTime? Deadline { get; set; }
    public int ProposalsCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsUrgent { get; set; }
    public bool NdaRequired { get; set; }
    public string Status { get; set; } = "open"; // open, in-progress, completed, cancelled
    public string? AttachmentUrl { get; set; }
    
    // Navigation properties
    [JsonIgnore]
    public virtual ICollection<Skill> RequiredSkills { get; set; } = [];
    [JsonIgnore]
    public virtual ICollection<Proposal> Proposals { get; set; } = [];
    [JsonIgnore]
    public virtual ICollection<JobQuestion> Questions { get; set; } = [];
}

public class JobQuestion : BaseEntity
{
    public int JobId { get; set; }
    public virtual Job Job { get; set; } = null!;
    public string Question { get; set; } = string.Empty;
    public int Order { get; set; }
}