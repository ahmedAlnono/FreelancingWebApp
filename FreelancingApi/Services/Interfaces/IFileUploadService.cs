// Services/IFileUploadService.cs
namespace FreelancingApi.Services.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string folder, int userId);
    Task<bool> DeleteFileAsync(string fileUrl);
    Task<string> UploadProfileImageAsync(IFormFile file, int userId);
    Task<string> UploadCoverImageAsync(IFormFile file, int userId);
}

