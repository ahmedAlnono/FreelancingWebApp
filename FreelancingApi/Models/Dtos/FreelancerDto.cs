using FreelancingApi.Models.Entities;

namespace FreelancingApi.Models.Dtos;

public class FreelancerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal HourlyRate { get; set; }
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }
    public int CompletedProjects { get; set; }
    public int HoursWorked { get; set; }
    public int ResponseRate { get; set; }
    public bool IsOnline { get; set; }
    public string Availability { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public bool IsTopRated { get; set; }
    public string MemberSince { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = [];
}

public class FreelnacerFilterParams
{
    public string? Search { get; set; }
    public string? Skills { get; set; }
    public decimal? MinRate { get; set; }
    public decimal? MaxRate { get; set; }
    public string? Availability { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class FreelancerDetailDto : FreelancerDto
{
    public string Bio { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public decimal TotalEarnings { get; set; }
    public List<ReviewDto> Reviews { get; set; } = [];
    public List<WorkHistoryDto> WorkHistory { get; set; } = [];
}

public class LanguageDto
{
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}

public class WorkHistoryDto
{
    public string JobTitle { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Amount { get; set; }
}

public class UpdateFreelancerDto
{
    public string? Bio { get; set; }
    public IEnumerable<SkillDto>? Skills { get; set; }
    public string? Location { get; set; }
}
public class SkillDto
{
    public int UserId { get; set; }
    public int SkillId {get;set;}
    public string Name { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
}
