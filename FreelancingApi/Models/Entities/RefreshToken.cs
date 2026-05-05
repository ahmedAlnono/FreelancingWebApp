using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FreelancingApi.Models.Entities;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Token { get; set; } = string.Empty;
    
    [Required]
    public string JwtId { get; set; } = string.Empty;
    
    public DateTime ExpiryDate { get; set; }
    public bool IsRevoked { get; set; } = false;
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key
    public int UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}