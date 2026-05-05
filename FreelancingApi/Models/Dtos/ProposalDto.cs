namespace FreelancingApi.Models.Dtos;

public class ProposalDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public decimal BidAmount { get; set; }
    public string? CoverLetter { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public int EstimatedDays { get; set; }
}

public class CreateProposalDto
{
    public int JobId { get; set; }
    public decimal BidAmount { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public int EstimatedDays { get; set; }
    public List<MilestoneDto>? Milestones { get; set; }
}

public class MilestoneDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
}