using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FreelancingApi.Data;
using FreelancingApi.Services.Interfaces;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using System.Security.Claims;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AppDbContext context,
    ITokenService tokenService,
    ILogger<AuthController> logger,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            // Check if user exists
            if (await context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(ApiResponseDto<object>.Fail("Email already exists"));
            }

            if (await context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(ApiResponseDto<object>.Fail("Username already exists"));
            }

            // Create new user
            var user = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                Role = request.UserType == "client" ? "Client" : "Freelancer",
                UserType = request.UserType,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Create Profile based on UserType
            if (user.UserType == "client")
            {
                var clientProfile = new ClientProfile
                {
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow
                };
                context.ClientProfiles.Add(clientProfile);
            }
            else
            {
                var freelancerProfile = new FreelancerProfile
                {
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow
                };
                context.FreelancerProfiles.Add(freelancerProfile);
            }
            await context.SaveChangesAsync();

            // Generate tokens
            var (accessToken, expiry) = await tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await GenerateAndStoreRefreshToken(user);

            return Ok(ApiResponseDto<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiry = expiry,
                User = MapToUserInfo(user)
            }, "Registration successful"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Registration error");
            return StatusCode(500, ApiResponseDto<object>.Fail("An error occurred during registration"));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            // Find user
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(ApiResponseDto<object>.Fail("Invalid email or password"));
            }

            if (!user.IsActive)
            {
                return Unauthorized(ApiResponseDto<object>.Fail("Account is disabled"));
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            // Generate tokens
            var (accessToken, expiry) = await tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await GenerateAndStoreRefreshToken(user);

            return Ok(ApiResponseDto<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiry = expiry,
                User = MapToUserInfo(user)
            }, "Login successful"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Login error");
            return StatusCode(500, ApiResponseDto<object>.Fail("An error occurred during login"));
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            // Validate expired access token
            var principal = await tokenService.GetPrincipalFromExpiredTokenAsync(request.AccessToken);

            if (principal == null)
            {
                return BadRequest(ApiResponseDto<object>.Fail("Invalid access token"));
            }

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? principal.FindFirst("sub")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return BadRequest(ApiResponseDto<object>.Fail("Invalid user ID in token"));
            }

            // Find user
            var user = await context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.IsActive)
            {
                return Unauthorized(ApiResponseDto<object>.Fail("User not found or inactive"));
            }

            // Find refresh token
            var storedRefreshToken = user.RefreshTokens
                .FirstOrDefault(rt => rt.Token == request.RefreshToken
                                      && !rt.IsRevoked
                                      && !rt.IsUsed);

            if (storedRefreshToken == null)
            {
                return BadRequest(ApiResponseDto<object>.Fail("Invalid refresh token"));
            }

            if (storedRefreshToken.ExpiryDate < DateTime.UtcNow)
            {
                storedRefreshToken.IsRevoked = true;
                await context.SaveChangesAsync();
                return BadRequest(ApiResponseDto<object>.Fail("Refresh token expired"));
            }

            // Mark token as used
            storedRefreshToken.IsUsed = true;
            await context.SaveChangesAsync();

            // Generate new tokens
            var (newAccessToken, newExpiry) = await tokenService.GenerateAccessTokenAsync(user);
            var newRefreshToken = await GenerateAndStoreRefreshToken(user);

            return Ok(ApiResponseDto<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                AccessTokenExpiry = newExpiry,
                User = MapToUserInfo(user)
            }, "Token refreshed successfully"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Refresh token error");
            return StatusCode(500, ApiResponseDto<object>.Fail("An error occurred during token refresh"));
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RevokeTokenRequestDto? request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user != null && request?.RefreshToken != null)
            {
                var refreshToken = user.RefreshTokens
                    .FirstOrDefault(rt => rt.Token == request.RefreshToken && !rt.IsRevoked);

                if (refreshToken != null)
                {
                    refreshToken.IsRevoked = true;
                    await context.SaveChangesAsync();
                }
            }

            // Also revoke all tokens for this user (optional)
            if (request == null)
            {
                foreach (var token in user?.RefreshTokens ?? [])
                {
                    token.IsRevoked = true;
                }
                if (user != null) await context.SaveChangesAsync();
            }

            return Ok(ApiResponseDto<object>.Ok(null, "Logged out successfully"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Logout error");
            return Ok(ApiResponseDto<object>.Ok(null, "Logged out")); // Still return success
        }
    }

    [Authorize]
    [HttpPost("revoke-all")]
    public async Task<IActionResult> RevokeAllTokens()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user != null)
        {
            foreach (var token in user.RefreshTokens)
            {
                token.IsRevoked = true;
            }
            await context.SaveChangesAsync();
        }

        return Ok(ApiResponseDto<object>.Ok(null, "All tokens revoked"));
    }

    // Helper methods
    private async Task<string> GenerateAndStoreRefreshToken(User user)
    {
        var refreshToken = await tokenService.GenerateRefreshTokenAsync();
        var jwtId = Guid.NewGuid().ToString();

        var tokenEntity = new RefreshToken
        {
            Token = refreshToken,
            JwtId = jwtId,
            UserId = user.Id,
            ExpiryDate = DateTime.UtcNow.AddDays(double.Parse(configuration["JwtSettings:RefreshTokenExpirationDays"]!)),
            IsRevoked = false,
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        context.RefreshTokens.Add(tokenEntity);
        await context.SaveChangesAsync();

        return refreshToken;
    }

    private UserInfoDto MapToUserInfo(User user)
    {
        return new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            Avatar= user.Avatar
        };
    }
}
