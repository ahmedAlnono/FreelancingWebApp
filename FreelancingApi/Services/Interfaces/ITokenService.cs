using System.Security.Claims;
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Services.Interfaces;

public interface ITokenService
{
    Task<(string AccessToken, DateTime Expiry)> GenerateAccessTokenAsync(User user);
    Task<string> GenerateRefreshTokenAsync();
    Task<ClaimsPrincipal?> GetPrincipalFromExpiredTokenAsync(string token);
}