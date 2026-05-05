using FreelancingApi.Models.Dtos;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Services.Interfaces;
using FreelancingApi.Services.Implementaions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobsController(
    IJobService jobService) : ControllerBase
{

    /// <summary>
    /// Get all jobs with filtering and pagination
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PagedResult<JobDto>>>> GetJobs(
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] string? budgetType,
        [FromQuery] decimal? minBudget,
        [FromQuery] decimal? maxBudget,
        [FromQuery] string? experienceLevel,
        [FromQuery] string? skills,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var filters = new JobFilterParams
        {
            CategoryId = categoryId,
            SearchTerm = search,
            BudgetType = budgetType,
            MinBudget = minBudget,
            MaxBudget = maxBudget,
            ExperienceLevel = experienceLevel,
            Skills = skills?.Split(',').ToList(),
            SortBy = sortBy,
            PageNumber = page,
            PageSize = pageSize > 50 ? 50 : pageSize
        };
        
        var result = await jobService.GetJobsAsync(filters);
        return Ok(ApiResponse<PagedResult<JobDto>>.Ok(result));
    }
    
    /// <summary>
    /// Get job by ID with full details
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<JobDto>>> GetJobById(int id)
    {
        var job = await jobService.GetJobByIdAsync(id);
        
        if (job == null)
            return NotFound(ApiResponse<JobDto>.Fail($"Job {id} not found"));
        
        return Ok(ApiResponse<JobDto>.Ok(job));
    }
    
    /// <summary>
    /// Create a new job posting
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<JobDto>>> CreateJob([FromBody] CreateJobDto createDto)
    {
        var userId = GetUserId();
        var job = await jobService.CreateJobAsync(userId, createDto);
        
        return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, 
            ApiResponse<JobDto>.Ok(job, "Job created successfully"));
    }
    
    /// <summary>
    /// Update an existing job
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<JobDto>>> UpdateJob(int id, [FromBody] UpdateJobDto updateDto)
    {
        var userId = GetUserId();
        var job = await jobService.UpdateJobAsync(id, userId, updateDto);
        
        return Ok(ApiResponse<JobDto>.Ok(job, "Job updated successfully"));
    }
    
    /// <summary>
    /// Delete a job
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteJob(int id)
    {
        var userId = GetUserId();
        var result = await jobService.DeleteJobAsync(id, userId);
        
        if (!result)
            return NotFound(ApiResponse<bool>.Fail($"Job {id} not found"));
        
        return Ok(ApiResponse<bool>.Ok(true, "Job deleted successfully"));
    }
    
    /// <summary>
    /// Get jobs count (for dashboard)
    /// </summary>
    [HttpGet("count")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<int>>> GetJobsCount()
    {
        var count = await jobService.GetJobsCountAsync();
        return Ok(ApiResponse<int>.Ok(count));
    }
    
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? User.FindFirst("sub")?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        
        return int.Parse(userIdClaim);
    }
}