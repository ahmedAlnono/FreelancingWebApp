using FreelancingApi.Models.Dtos;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController(
    IFileUploadService fileUploadService,
    IUnitOfWork unitOfWork
    ) : ControllerBase
{
    [HttpPost("profile-image")]
    public async Task<ActionResult<ApiResponse<string>>> UploadProfileImage(IFormFile file)
    {
        var userId = GetUserId();

        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file provided"));

        // Max file size: 5MB
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<string>.Fail("File size exceeds 5MB"));

        var imageUrl = await fileUploadService.UploadProfileImageAsync(file, userId);

        // Update user avatar in database
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        if (user != null)
        {
            user.Avatar = imageUrl;
            await unitOfWork.Users.UpdateAsync(user);
            await unitOfWork.CompleteAsync();
        }

        return Ok(ApiResponse<string>.Ok(imageUrl, "Profile image uploaded successfully"));
    }

    [HttpPost("portfolio")]
    public async Task<ActionResult<ApiResponse<string>>> UploadPortfolioImage(IFormFile file, int portfolioId)
    {
        var userId = GetUserId();

        var imageUrl = await fileUploadService.UploadPortfolioImageAsync(file, portfolioId);

        // Update portfolio image in database
        var portfolio = await unitOfWork.Portfolios.GetByIdAsync(portfolioId);
        if (portfolio != null && portfolio.FreelancerProfile.UserId == userId)
        {
            portfolio.ImageUrl = imageUrl;
            await unitOfWork.Portfolios.UpdateAsync(portfolio);
            await unitOfWork.CompleteAsync();
        }

        return Ok(ApiResponse<string>.Ok(imageUrl, "Portfolio image uploaded successfully"));
    }

    [HttpPost("resume")]
    public async Task<ActionResult<ApiResponse<string>>> UploadResume(IFormFile file)
    {
        var userId = GetUserId();

        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<string>.Fail("No file provided"));

        // Allow PDF, DOC, DOCX
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(extension))
            return BadRequest(ApiResponse<string>.Fail("Only PDF, DOC, and DOCX files are allowed"));

        var fileUrl = await fileUploadService.UploadFileAsync(file, "resumes", userId);

        return Ok(ApiResponse<string>.Ok(fileUrl, "Resume uploaded successfully"));
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        return int.Parse(userIdClaim ?? "0");
    }
}