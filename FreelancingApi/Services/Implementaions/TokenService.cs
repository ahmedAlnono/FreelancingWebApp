using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FreelancingApi.Models.Entities;
using FreelancingApi.Services.Interfaces;

namespace FreelancingApi.Services.Implementaions;

public class TokenService(IConfiguration configuration) : ITokenService
{

    public async Task<(string AccessToken, DateTime Expiry)> GenerateAccessTokenAsync(User user)
    {
        var claims = new List<Claim>
        {
            new("Sub", user.Id.ToString()),
            new("Email", user.Email),
            new("UniqueName", user.Username),
            new("Jti", Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, user.UserType ?? "Freelancer"),
            new("role", user.UserType ?? "Freelancer")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(int.Parse(configuration["JwtSettings:AccessTokenExpirationMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: configuration["JwtSettings:Issuer"],
            audience: configuration["JwtSettings:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: credentials
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        return await Task.FromResult((accessToken, expiry));
    }

    public async Task<string> GenerateRefreshTokenAsync()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);

        return await Task.FromResult(Convert.ToBase64String(randomNumber));
    }

    public async Task<ClaimsPrincipal?> GetPrincipalFromExpiredTokenAsync(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false, // Don't validate expiry for refresh
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["JwtSettings:Issuer"],
            ValidAudience = configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!)),
            ClockSkew = TimeSpan.Zero
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return await Task.FromResult(principal);
        }
        catch
        {
            return null;
        }
    }
}