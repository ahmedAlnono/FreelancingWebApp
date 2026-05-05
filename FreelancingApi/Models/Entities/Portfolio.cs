namespace FreelancingApi.Models.Entities;

public class Portfolio : BaseEntity
{
    public int FreelancerProfileId { get; set; }
    public virtual FreelancerProfile FreelancerProfile { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? ProjectUrl { get; set; }
    public int Order { get; set; }
    
    public virtual ICollection<Skill> Tags { get; set; } = [];
}

// Entities/WorkHistory.cs
public class WorkHistory : BaseEntity
{
    public int FreelancerProfileId { get; set; }
    public virtual FreelancerProfile FreelancerProfile { get; set; } = null!;
    
    public string JobTitle { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public int? ClientId { get; set; }
    public int Rating { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Amount { get; set; }
}