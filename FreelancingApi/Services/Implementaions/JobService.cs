using AutoMapper;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Services.Interfaces;

namespace FreelancingApi.Services.Implementaions;

public class JobService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ILogger<JobService> logger
  ) : IJobService
{

    public async Task<JobDto?> GetJobByIdAsync(int id)
    {
        var job = await unitOfWork.Jobs.GetJobWithDetailsAsync(id);

        if (job == null)
            return null;

        return mapper.Map<JobDto>(job);
    }

    public async Task<PagedResult<JobDto>> GetJobsAsync(JobFilterParams filters)
    {
        var jobs = await unitOfWork.Jobs.GetJobsWithFiltersAsync(filters);
        var totalCount = await unitOfWork.Jobs.CountAsync();

        return new PagedResult<JobDto>
        {
            Items = mapper.Map<List<JobDto>>(jobs),
            TotalCount = totalCount,
            PageNumber = filters.PageNumber,
            PageSize = filters.PageSize
        };
    }

    public async Task<JobDto> CreateJobAsync(int clientId, CreateJobDto createDto)
    {
        var client = await unitOfWork.Users.GetByIdAsync(clientId);
        if (client == null || client.UserType != "client")
            throw new UnauthorizedAccessException("Only clients can post jobs");

        var job = mapper.Map<Job>(createDto);
        job.ClientId = clientId;
        job.PostedAt = DateTime.UtcNow;
        job.Status = "open";


        if (createDto.RequiredSkills.Count != 0)
        {
            var skills = await unitOfWork.Skills
                .GetAsync(s => createDto.RequiredSkills.Contains(s.Name));
            job.RequiredSkills = [.. skills];
        }

        if (createDto.Questions.Count != 0)
        {
            job.Questions = [.. createDto.Questions.Select((q, index) => new JobQuestion
            {
                Question = q,
                Order = index
            })];
        }

        await unitOfWork.Jobs.AddAsync(job);
        await unitOfWork.CompleteAsync();


        var category = await unitOfWork.Categories.GetByIdAsync(job.CategoryId);
        if (category != null)
        {
            category.JobCount++;
            await unitOfWork.Categories.UpdateAsync(category);
            await unitOfWork.CompleteAsync();
        }

        logger.LogInformation("Job {JobId} created by client {ClientId}", job.Id, clientId);

        return mapper.Map<JobDto>(job);
    }

    public async Task<JobDto> UpdateJobAsync(int jobId, int clientId, UpdateJobDto updateDto)
    {
        var job = await unitOfWork.Jobs.GetByIdAsync(jobId) 
        ?? throw new KeyNotFoundException($"Job {jobId} not found");

        if (job.ClientId != clientId)
            throw new UnauthorizedAccessException("You can only update your own jobs");

        mapper.Map(updateDto, job);
        job.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.Jobs.UpdateAsync(job);
        await unitOfWork.CompleteAsync();

        return mapper.Map<JobDto>(job);
    }

    public async Task<bool> DeleteJobAsync(int jobId, int clientId)
    {
        var job = await unitOfWork.Jobs.GetByIdAsync(jobId);

        if (job == null)
            return false;

        if (job.ClientId != clientId)
            throw new UnauthorizedAccessException("You can only delete your own jobs");

        await unitOfWork.Jobs.DeleteAsync(job);
        await unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<int> GetJobsCountAsync()
    {
        return await unitOfWork.Jobs.CountAsync();
    }

    public async Task<bool> AcceptProposal(int clientId, AcceptProposalDto dto)
    {
        var client = await unitOfWork.Users.GetByIdAsync(clientId)
        ?? throw new Exception("client not found");

        if(client.Role == "freelancer")
            throw new Exception("you are not authorize to accept job proposal");
        
        var freelancer = await unitOfWork.Users.GetAsync(
            u=> u.Id == dto.FreelancerId&&u.Role == "freelancer"
        ) ?? throw new Exception("freelancer not found");

        var job = await unitOfWork.Jobs.GetByIdAsync(dto.JobId)
        ?? throw new Exception("job not found");

        job.FreeLancerId = dto.FreelancerId;
        job.Status = "in-progress";
        await unitOfWork.CompleteAsync();

        return true;
    }
}