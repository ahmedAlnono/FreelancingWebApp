using AutoMapper;
using FreelancingApi.Data;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelancingApi.Services.Implementaions;

public class StatisticService
(AppDbContext context,
    ILogger<StatisticService> logger,
    IMapper mapper,
    ICacheService cacheService
) : IStatisticService
{
    public async Task<HomeStatisticDto> GetHomeStatisticsAsync()
    {
        try
        {
            logger.LogInformation("Get home page statistics");

            var categories = await cacheService.GetOrCreateAsync("all_categories", async () =>
            {
                var cats = await context.Categories
                .Take(10)
                .ToListAsync();
                return mapper.Map<List<CategoryDto>>(cats);
            }, TimeSpan.FromHours(1));

            var jobs = await cacheService.GetOrCreateAsync("all_jobs", async () =>
            {
                var AllJobs = await context.Jobs
                .OrderByDescending(j => j.CreatedAt)
                .Take(10)
                .ToListAsync();
                return mapper.Map<List<JobDto>>(AllJobs);

            }, TimeSpan.FromHours(1));

            var freelancers = await cacheService.GetOrCreateAsync("all_freelancers", async () =>
            {
                var AllFreelancers = await context
            .Users
            .OrderByDescending(u => u.Rating)
            .Take(10)
            .ToListAsync();
                return mapper.Map<List<FreelancerDto>>(AllFreelancers);
            });

            return new HomeStatisticDto
            {
                Categories = categories,
                Jobs = jobs,
                Freelancers = freelancers
            };
        }
        catch (System.Exception ex)
        {
            logger.LogError(ex.Message);
            throw;
        }
    }
}