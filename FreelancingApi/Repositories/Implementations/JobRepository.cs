using FreelancingApi.Data;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelancingApi.Repositories.Implementations;

public class JobRepository(AppDbContext context) : GenericRepository<Job>(context), IJobRepository
{
    protected readonly DbSet<Job> JobsDb = context.Jobs;

    public async Task<IReadOnlyList<Job>> GetJobsWithFiltersAsync(JobFilterParams filters)
    {
        var query = JobsDb
            .Include(j => j.Category)
            .Include(j => j.Client)
                .ThenInclude(c => c.ClientProfile)
            .Include(j => j.RequiredSkills)
            .Where(j => j.IsActive && !j.IsDeleted && j.Status == "open");
        
        // Apply filters
        if (filters.CategoryId.HasValue)
            query = query.Where(j => j.CategoryId == filters.CategoryId.Value);
        
        if (!string.IsNullOrEmpty(filters.SearchTerm))
        {
            query = query.Where(j => 
                j.Title.Contains(filters.SearchTerm) || 
                j.Description.Contains(filters.SearchTerm));
        }
        
        if (!string.IsNullOrEmpty(filters.BudgetType))
            query = query.Where(j => j.BudgetType == filters.BudgetType);
        
        if (filters.MinBudget.HasValue && filters.BudgetType == "hourly")
            query = query.Where(j => j.BudgetMin >= filters.MinBudget.Value);
        
        if (filters.MaxBudget.HasValue && filters.BudgetType == "hourly")
            query = query.Where(j => j.BudgetMax <= filters.MaxBudget.Value);
        
        if (!string.IsNullOrEmpty(filters.ExperienceLevel))
            query = query.Where(j => j.ExperienceLevel == filters.ExperienceLevel);
        
        if (filters.Skills != null && filters.Skills.Count != 0)
        {
            query = query.Where(j => j.RequiredSkills.Any(s => 
                filters.Skills.Contains(s.Name)));
        }
        
        // Apply sorting
        query = filters.SortBy?.ToLower() switch
        {
            "newest" => query.OrderByDescending(j => j.PostedAt),
            "budget_high" => query.OrderByDescending(j => j.BudgetMax),
            "budget_low" => query.OrderBy(j => j.BudgetMin),
            _ => query.OrderByDescending(j => j.IsFeatured)
                      .ThenByDescending(j => j.PostedAt)
        };
        
        // Apply pagination
        return await query
            .Skip((filters.PageNumber - 1) * filters.PageSize)
            .Take(filters.PageSize)
            .ToListAsync();
    }
    
    public async Task<Job?> GetJobWithDetailsAsync(int id)
    {
        return await JobsDb
            .Include(j => j.Category)
            .Include(j => j.Client)
                .ThenInclude(c => c.ClientProfile)
            .Include(j => j.RequiredSkills)
            .Include(j => j.Questions)
            .Include(j => j.Proposals)
                .ThenInclude(p => p.Freelancer)
                .ThenInclude(f => f.FreelancerProfile)
            .FirstOrDefaultAsync(j => j.Id == id);
    }
    
    public async Task<int> GetJobsCountByCategoryAsync(int categoryId)
    {
        return await JobsDb.CountAsync(j => j.CategoryId == categoryId && j.Status == "open");
    }
}