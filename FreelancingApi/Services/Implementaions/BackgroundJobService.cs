// using FreelancingApi.Data;
// using FreelancingApi.Services.Interfaces;
// using Hangfire;

// namespace FreelancingApi.Services.Implementaions
// {
//     public class BackgroundJobService : IBackgroundJobService
//     {
//         private readonly ILogger<BackgroundJobService> _logger;
//         private readonly IServiceScopeFactory _scopeFactory;

//         public BackgroundJobService(ILogger<BackgroundJobService> logger, IServiceScopeFactory scopeFactory)
//         {
//             _logger = logger;
//             _scopeFactory = scopeFactory;
//         }

//         [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 600 })]
//         public void SendWelcomeEmail(int userId)
//         {
//             using var scope = _scopeFactory.CreateScope();
//             var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//             var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

//             var user = context.Users.Find(userId);
//             if (user != null)
//             {
//                 emailService.SendEmailAsync(user.Email, "Welcome to FreelanceHub!",
//                     "Thank you for joining...").Wait();
//                 _logger.LogInformation("Welcome email sent to user {UserId}", userId);
//             }
//         }

//         // [RecurringJob("0 */6 * * *")] // Every 6 hours
//         public void UpdateJobStatistics()
//         {
//             using var scope = _scopeFactory.CreateScope();
//             var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

//             // Update job counts by category
//             var categories = context.Categories.ToList();
//             foreach (var category in categories)
//             {
//                 category.JobCount = context.Jobs.Count(j => j.CategoryId == category.Id && j.Status == "open");
//             }

//             context.SaveChanges();
//             _logger.LogInformation("Job statistics updated");
//         }

//         // [RecurringJob("0 0 * * *")] // Daily at midnight
//         public void CleanupExpiredTokens()
//         {
//             using var scope = _scopeFactory.CreateScope();
//             var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

//             var expiredTokens = context.RefreshTokens
//                 .Where(t => t.ExpiryDate < DateTime.UtcNow && !t.IsRevoked);

//             var count = expiredTokens.Count();
//             context.RefreshTokens.RemoveRange(expiredTokens);
//             context.SaveChanges();

//             _logger.LogInformation("Removed {Count} expired refresh tokens", count);
//         }
//     }
// }