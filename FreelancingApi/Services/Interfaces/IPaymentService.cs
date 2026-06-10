// Services/IPaymentService.cs
namespace FreelancingApi.Services.Interfaces;

public interface IPaymentService
{
    // Stripe Connect Onboarding
    Task<ConnectedAccountDto> CreateConnectedAccountAsync(int userId);
    Task<string> GetOnboardingLinkAsync(int userId);
    Task<bool> CheckOnboardingStatusAsync(int userId);
    
    // Payment Processing
    Task<PaymentIntentResult> CreatePaymentIntentAsync(CreatePaymentIntentDto dto);
    Task<PaymentResult> ProcessMilestonePaymentAsync(int milestoneId, int clientId);
    Task<PaymentResult> ProcessJobPaymentAsync(int jobId, int clientId);
    
    // Escrow Management
    Task<EscrowDto> CreateEscrowAsync(int jobId);
    Task<EscrowDto> ReleaseMilestonePaymentAsync(int milestoneId, int clientId);
    Task<EscrowDto> ReleaseFullEscrowAsync(int jobId, int clientId);
    Task<EscrowDto> DisputeEscrowAsync(int jobId, int clientId, string reason);
    Task<EscrowDto> ResolveDisputeAsync(int jobId, decimal freelancerAmount, int resolverId);
    
    // Payouts
    Task<WithdrawalDto> RequestWithdrawalAsync(int freelancerId, decimal amount);
    Task<decimal> GetAvailableBalanceAsync(int freelancerId);
}