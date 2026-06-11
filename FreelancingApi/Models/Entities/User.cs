using System.ComponentModel.DataAnnotations;

namespace FreelancingApi.Models.Entities;

public class User : BaseEntity
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Freelancer";
    public string? Avatar { get; set; }
    public string? Location { get; set; }
    public string? Country { get; set; }
    public string? Bio { get; set; } = "";
    public string UserType { get; set; } = "freelancer"; // "freelancer" or "client"
    public bool IsVerified { get; set; } = false;
    public bool IsTopRated { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }
    public DateTime MemberSince { get; set; } = DateTime.UtcNow;
    public decimal Rating { get; set; } = 0;
    public int Reviews { get; set; } = 0;
    public decimal HireRate { get; set; }
    public int Bids {get;set;}

    // Navigation properties
    public virtual FreelancerProfile? FreelancerProfile { get; set; }
    public virtual ClientProfile? ClientProfile { get; set; }
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public virtual ICollection<Job> PostedJobs { get; set; } = [];
    public virtual ICollection<Proposal> Proposals { get; set; } = [];
    public virtual ICollection<Message> SentMessages { get; set; } = [];
    public virtual ICollection<Message> ReceivedMessages { get; set; } = [];
    public virtual ICollection<Review> GivenReviews { get; set; } = [];
    public virtual ICollection<Review> ReceivedReviews { get; set; } = [];
}
