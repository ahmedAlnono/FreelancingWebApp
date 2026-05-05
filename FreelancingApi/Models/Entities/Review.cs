// Entities/Review.cs
using System.Text.Json.Serialization;

namespace FreelancingApi.Models.Entities;

public class Review : BaseEntity
{
    public int ReviewerId { get; set; }
    public virtual User Reviewer { get; set; } = null!;
    
    public int RevieweeId { get; set; }
    public virtual User Reviewee { get; set; } = null!;
    
    public int JobId { get; set; }
    [JsonIgnore]
    public virtual Job Job { get; set; } = null!;
    
    public int Rating { get; set; } // 1-5
    public string Feedback { get; set; } = string.Empty;
    public string? ReviewerType { get; set; } // client, freelancer
}