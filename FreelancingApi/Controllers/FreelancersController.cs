using AutoMapper;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class FreelancersController(IUnitOfWork unitOfWork, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<FreelancerDto>>>> GetFreelancers(
        [FromQuery] string? search,
        [FromQuery] string? skills,
        [FromQuery] decimal? minRate,
        [FromQuery] decimal? maxRate,
        [FromQuery] decimal? minRating,
        [FromQuery] string? availability,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = unitOfWork.Users
            .GetAsync(u => u.UserType == "freelancer" && u.IsActive && !u.IsDeleted);
        
        // Apply filters (simplified - you'd implement this properly)
        var freelancers = (await query).ToList();
        var freelancerDtos = mapper.Map<List<FreelancerDto>>(freelancers);
        
        var result = new PagedResult<FreelancerDto>
        {
            Items = [.. freelancerDtos.Skip((page - 1) * pageSize).Take(pageSize)],
            TotalCount = freelancerDtos.Count,
            PageNumber = page,
            PageSize = pageSize
        };
        
        return Ok(ApiResponse<PagedResult<FreelancerDto>>.Ok(result));
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<FreelancerDetailDto>>> GetFreelancerById(int id)
    {
        var user = await unitOfWork.Users
            .GetByIdAsync(id);
        
        if (user == null || user.UserType != "freelancer")
            return NotFound(ApiResponse<FreelancerDetailDto>.Fail($"Freelancer {id} not found"));
        
        // Load detailed data
        var freelancer = await unitOfWork.Users
            .GetAsync(u => u.Id == id);
        var detail = mapper.Map<FreelancerDetailDto>(freelancer.FirstOrDefault());
        
        return Ok(ApiResponse<FreelancerDetailDto>.Ok(detail));
    }
}