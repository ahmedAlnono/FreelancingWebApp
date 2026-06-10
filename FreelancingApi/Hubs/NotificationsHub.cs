using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FreelancingApi.Hubs;

[Authorize]
public class NotificationHub(ILogger<NotificationHub> logger) : Hub
{
    private static readonly Dictionary<string, string> userConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            userConnections[userId] = Context.ConnectionId;
            logger.LogInformation("User {UserId} connected with connection {ConnectionId}", 
                userId, Context.ConnectionId);
        }
        
        await base.OnConnectedAsync();
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = userConnections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
        if (userId != null)
            userConnections.Remove(userId);
        
        await base.OnDisconnectedAsync(exception);
    }
    
    // Send notification to specific user
    public async Task SendToUser(string userId, string message, string type = "info")
    {
        if (userConnections.TryGetValue(userId, out var connectionId))
        {
            await Clients.Client(connectionId).SendAsync("ReceiveNotification", new
            {
                Id = Guid.NewGuid().ToString(),
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            });
        }
    }
    
    // Join job room for real-time updates
    public async Task JoinJobRoom(int jobId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"job-{jobId}");
        logger.LogInformation("User joined job room {JobId}", jobId);
    }
    
    // Broadcast new proposal to client
    public async Task NotifyNewProposal(int jobId, string freelancerName)
    {
        await Clients.Group($"job-{jobId}").SendAsync("NewProposal", new
        {
            JobId = jobId,
            FreelancerName = freelancerName,
            Timestamp = DateTime.UtcNow
        });
    }
}