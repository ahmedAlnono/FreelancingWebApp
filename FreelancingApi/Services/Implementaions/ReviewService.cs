using AutoMapper;
using FreelancingApi.Data;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using FreelancingApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelancingApi.Services.Implementaions;

public class ReviewService
(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    AppDbContext context) : IReviewService
{
    public async Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto, int userId, string userType)
    {
        try
        {
            var user = await unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new UnauthorizedAccessException("user not found");

            dto.ReviewerId = user.Id;
            dto.ReviewerType = user.UserType;
            var newReview = mapper.Map<Review>(dto);
            var review = await unitOfWork.Reviews.AddAsync(newReview);
            return mapper.Map<ReviewDto>(review);
        }
        catch (System.Exception)
        {
            
            throw;
        }
    }

    public async Task<bool> DeleteReviewDto(int clientId, int reviewId)
    {
        try
        {
            var user = await unitOfWork.Users.GetByIdAsync(clientId)
            ?? throw new UnauthorizedAccessException("user not found");

            var review = await unitOfWork.Reviews.GetByIdAsync(reviewId)
            ?? throw new KeyNotFoundException("review not found");
            if (review.ReviewerId !=  user.Id)
                throw new UnauthorizedAccessException("you cann't delete ahters review");
            
            await unitOfWork.Reviews.DeleteAsync(review);
            return true;
        }
        catch (System.Exception)
        {
            return false;
        }
    }

    public async Task<List<ReviewDto>> GetJobReviewsAsync(int jobId)
    {
        try
        {
            var reviews = await context.Reviews
            .Where(r=>r.JobId == jobId)
            .OrderByDescending(r=>r.CreatedAt)
            .ToListAsync();
            return mapper.Map<List<ReviewDto>>(reviews);
        }
        catch (System.Exception)
        {
            
            throw;
        }
    }
}