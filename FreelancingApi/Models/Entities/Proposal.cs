// Entities/Proposal.cs
namespace FreelancingApi.Models.Entities;

public class Proposal : BaseEntity
{
    public int JobId { get; set; }
    public virtual Job Job { get; set; } = null!;

    public int FreelancerId { get; set; }
    public virtual User Freelancer { get; set; } = null!;
    public string? CoverLetter { get; set; }
    public int EstimatedDays { get; set; }
    public string Status { get; set; } = "pending"; // pending, approved, rejected, withdrawn, interview
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public decimal BidAmount { get; set; }

    // For milestone-based projects
    public virtual ICollection<Milestone> Milestones { get; set; } = [];
}

public class Milestone : BaseEntity
{
    public int ProposalId { get; set; }
    public virtual Proposal Proposal { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = "pending"; // pending, in-progress, completed, approved
}