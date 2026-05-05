// Repositories/IJobRepository.cs
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Repositories.Interfaces;

public interface IJobRepository : IGenericRepository<Job>
{
    Task<IReadOnlyList<Job>> GetJobsWithFiltersAsync(JobFilterParams filters);
    Task<Job?> GetJobWithDetailsAsync(int id);
    Task<int> GetJobsCountByCategoryAsync(int categoryId);
}

public class JobFilterParams
{
    public int? CategoryId { get; set; }
    public string? SearchTerm { get; set; }
    public string? BudgetType { get; set; }
    public decimal? MinBudget { get; set; }
    public decimal? MaxBudget { get; set; }
    public string? ExperienceLevel { get; set; }
    public List<string>? Skills { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}