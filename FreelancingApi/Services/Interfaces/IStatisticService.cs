using FreelancingApi.Models.Dtos;

namespace FreelancingApi.Services.Interfaces;

public interface IStatisticService
{
    Task<HomeStatisticDto> GetHomeStatisticsAsync();
}