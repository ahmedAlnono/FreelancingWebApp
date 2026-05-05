namespace FreelancingApi.Models.Dtos;

public class ReviewDto
{
    public int Id { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewerAvatar { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    public int ReviewerId { get; set; }
    public int RevieweeId { get; set; }
    public int JobId { get; set; }
    public int Rating { get; set; }
    public string Feedback { get; set; } = "";
    public string ReviewerType {get;set;}= "";
}