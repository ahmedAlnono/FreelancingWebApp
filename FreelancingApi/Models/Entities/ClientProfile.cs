namespace FreelancingApi.Models.Entities;

public class ClientProfile : BaseEntity
{
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public string CompanyName { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public decimal TotalSpent { get; set; }
    public int JobsPosted { get; set; }
    public int HireRate { get; set; } // Percentage
    public bool IsVerified { get; set; }
    public string? CompanyLogo { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanyDescription { get; set; }
}