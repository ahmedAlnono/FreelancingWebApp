namespace FreelancingApi.Models.Dtos;

public class HomeStatisticDto
{
    public List<CategoryDto> Categories { get; set; } = [];
    public List<JobDto> Jobs { get; set; } = [];
    public List<FreelancerDto> Freelancers { get; set; } = [];
}