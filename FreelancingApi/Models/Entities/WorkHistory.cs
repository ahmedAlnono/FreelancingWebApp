namespace FreelancingApi.Models.Entities;
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