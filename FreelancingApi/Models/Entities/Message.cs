namespace FreelancingApi.Models.Entities;

public class Message : BaseEntity
{
    public int SenderId { get; set; }
    public virtual User Sender { get; set; } = null!;
    
    public int ReceiverId { get; set; }
    public virtual User Receiver { get; set; } = null!;
    
    public int? JobId { get; set; }
    public virtual Job? Job { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? AttachmentUrl { get; set; }
}