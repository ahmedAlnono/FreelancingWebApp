namespace FreelancingApi.Models.Entities;

public class Withdrawal : BaseEntity
{
    public int FreelancerId { get; set; }
    public virtual User Freelancer { get; set; } = null!;

    public decimal Amount { get; set; }

    public string StripeTransferId { get; set; } = string.Empty;

    // pending | completed | failed
    public string Status { get; set; } = "pending";

    public DateTime? ProcessedAt { get; set; }
    public string? FailureReason { get; set; }
}

