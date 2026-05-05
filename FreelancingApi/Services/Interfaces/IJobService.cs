using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;

namespace FreelancingApi.Services.Interfaces;

public interface IJobService
{
    Task<JobDto?> GetJobByIdAsync(int id);
    Task<PagedResult<JobDto>> GetJobsAsync(JobFilterParams filterParams);
    Task<JobDto> CreateJobAsync(int clientId,CreateJobDto dto);
    Task<JobDto> UpdateJobAsync(int jobId, int clientId ,UpdateJobDto dto);
    Task<bool> DeleteJobAsync(int jobId,int clientId);
    Task<int> GetJobsCountAsync();
}