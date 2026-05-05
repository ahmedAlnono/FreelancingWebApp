namespace FreelancingApi.Models.Dtos;

public class JobDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CategoryDto Category { get; set; } = null!;
    public ClientInfoDto Client { get; set; } = null!;
    public string BudgetType { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? BudgetFixed { get; set; }
    public string ProjectLength { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; }
    public int ProposalsCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool NdaRequired { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> RequiredSkills { get; set; } = [];
    public List<string> Questions { get; set; } = [];
}

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string BudgetType { get; set; } = "hourly";
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? BudgetFixed { get; set; }
    public string ProjectLength { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = "intermediate";
    public DateTime? Deadline { get; set; }
    public bool NdaRequired { get; set; }
    public List<string> RequiredSkills { get; set; } = [];
    public List<string> Questions { get; set; } = [];
}

public class UpdateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BudgetType { get; set; } = "hourly";
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? BudgetFixed { get; set; }
    public DateTime? Deadline { get; set; }
}