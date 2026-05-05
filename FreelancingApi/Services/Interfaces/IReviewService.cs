using FreelancingApi.Models.Dtos;

namespace FreelancingApi.Services.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto,int userId, string userType);
    Task<bool> DeleteReviewDto(int clientId, int reviewId);
    Task<List<ReviewDto>> GetJobReviewsAsync(int jobId);
}