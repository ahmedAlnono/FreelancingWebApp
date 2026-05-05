namespace FreelancingApi.Models.Dtos;

public class MessageDto
{
    public int Id { get; set; }
    public string FromName { get; set; } = string.Empty;
    public string FromAvatar { get; set; } = string.Empty;
    public string Preview { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public bool Unread { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SendMessageDto
{
    public int ReceiverId { get; set; }
    public int? JobId { get; set; }
    public string Content { get; set; } = string.Empty;
}