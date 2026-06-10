namespace FreelancingApi.Models.Entities;

public class Payment : BaseEntity
{
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public string StripeTransferId { get; set; } = string.Empty;
    public int JobId { get; set; }
    public virtual Job Job { get; set; } = null!;
    public int ClientId { get; set; }
    public virtual User Client { get; set; } = null!;
    public int FreelancerId { get; set; }
    public virtual User Freelancer { get; set; } = null!;
    public int? MilestoneId { get; set; }
    public virtual Milestone? Milestone { get; set; }
    public decimal Amount { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal FreelancerAmount { get; set; }
    public string Status { get; set; } = "pending";
    public string PaymentMethod { get; set; } = "card";
    public DateTime? PaidAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? RefundReason { get; set; }
}

// Entities/Escrow.cs
public class Escrow : BaseEntity
{
    public int JobId { get; set; }
    public virtual Job Job { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal ReleasedAmount { get; set; }
    public decimal HeldAmount { get; set; }
    public string Status { get; set; } = "active";
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public DateTime? DisputeDeadline { get; set; }
    public string? DisputeReason { get; set; }
    public string? DisputeResolution { get; set; }
    public virtual ICollection<EscrowRelease> Releases { get; set; } = new List<EscrowRelease>();
}

// Entities/EscrowRelease.cs
public class EscrowRelease : BaseEntity
{
    public int EscrowId { get; set; }
    public virtual Escrow Escrow { get; set; } = null!;
    public int MilestoneId { get; set; }
    public virtual Milestone Milestone { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime ReleasedAt { get; set; }
    public string StripeTransferId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
}

// Entities/ConnectedAccount.cs
public class ConnectedAccount : BaseEntity
{
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;
    public string StripeAccountId { get; set; } = string.Empty;
    public bool IsOnboarded { get; set; }
    public string? AccountStatus { get; set; }
    public bool ChargesEnabled { get; set; }
    public bool PayoutsEnabled { get; set; }
    public DateTime? OnboardedAt { get; set; }
    public string? Country { get; set; }
    public string? DefaultCurrency { get; set; } = "usd";
}