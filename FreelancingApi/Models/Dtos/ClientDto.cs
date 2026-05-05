namespace FreelancingApi.Models.Dtos;

public class ClientInfoDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public decimal TotalSpent { get; set; }
    public string MemberSince { get; set; } = string.Empty;
    public int JobsPosted { get; set; }
    public int HireRate { get; set; }
    public bool IsVerified { get; set; }
}