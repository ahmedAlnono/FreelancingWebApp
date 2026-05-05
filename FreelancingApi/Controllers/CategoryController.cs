using AutoMapper;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class CategoriesController(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    ICacheService cacheService
) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAllCategories()
    {
        var categories = await cacheService.GetOrCreateAsync("all_categories", async () =>
        {
            var cats = await unitOfWork.Categories.GetAllAsync();
            return mapper.Map<List<CategoryDto>>(cats);
        }, TimeSpan.FromHours(1));
        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryById(int id)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id);

        if (category == null)
            return NotFound(ApiResponse<CategoryDto>.Fail($"Category {id} not found"));

        return Ok(ApiResponse<CategoryDto>.Ok(mapper.Map<CategoryDto>(category)));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug)
    {
        var categories = await unitOfWork.Categories
            .GetAsync(c => c.Slug == slug);
        var category = categories.FirstOrDefault();

        if (category == null)
            return NotFound(ApiResponse<CategoryDto>.Fail($"Category '{slug}' not found"));

        return Ok(ApiResponse<CategoryDto>.Ok(mapper.Map<CategoryDto>(category)));
    }
}