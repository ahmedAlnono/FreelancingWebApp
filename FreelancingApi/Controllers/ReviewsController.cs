using System.Security.Claims;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController(
    // ILogger<ReviewsController> logger,
    IReviewService reviewService
):ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        try
        {
            var Id = GetUserId();
            var userType = GetUserType();
            return Ok(await reviewService.CreateReviewAsync(dto,Id, userType));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException();

        return int.Parse(userIdClaim);
    }
    private string GetUserType()
    {
        var userType = User.FindFirst(ClaimTypes.Role)?.Value
        ?? User.FindFirst("role")?.Value;
        if(string.IsNullOrEmpty(userType))
            throw new UnauthorizedAccessException("user role not found");
        return userType;
    }
}