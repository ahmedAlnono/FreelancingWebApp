// Services/PaymentService.cs
using Stripe;
using Microsoft.EntityFrameworkCore;
using FreelancingApi.Services.Interfaces;
using FreelancingApi.Data;
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Services.Implementaions;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly ILogger<PaymentService> _logger;
    private readonly decimal _platformFeePercentage;
    
    public PaymentService(
        IConfiguration configuration,
        AppDbContext context,
        ILogger<PaymentService> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
        _platformFeePercentage = decimal.Parse(configuration["Stripe:PlatformFeePercentage"] ?? "10");
    }
    
    #region Stripe Connect Onboarding
    
    public async Task<ConnectedAccountDto> CreateConnectedAccountAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new KeyNotFoundException("User not found");
        
        // Check existing account
        var existing = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == userId);
        
        if (existing?.IsOnboarded == true)
            return MapToConnectedAccountDto(existing);
        
        // Create Stripe Connect account
        var accountOptions = new AccountCreateOptions
        {
            Type = "express",
            Country = user.Country ?? "US",
            Email = user.Email,
            BusinessType = "individual",
            Individual = new AccountIndividualOptions
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email
            },
            Capabilities = new AccountCapabilitiesOptions
            {
                CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                Transfers = new AccountCapabilitiesTransfersOptions { Requested = true }
            }
        };
        
        var accountService = new AccountService();
        var account = await accountService.CreateAsync(accountOptions);
        
        var connectedAccount = new ConnectedAccount
        {
            UserId = userId,
            StripeAccountId = account.Id,
            IsOnboarded = false,
            AccountStatus = "pending",
            Country = user.Country
        };
        
        _context.ConnectedAccounts.Add(connectedAccount);
        await _context.SaveChangesAsync();
        
        return MapToConnectedAccountDto(connectedAccount);
    }
    
    public async Task<string> GetOnboardingLinkAsync(int userId)
    {
        var account = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == userId);
        
        if (account == null)
            throw new InvalidOperationException("No connected account found");
        
        var linkOptions = new AccountLinkCreateOptions
        {
            Account = account.StripeAccountId,
            RefreshUrl = $"{_configuration["AppUrl"]}/dashboard/settings?refresh=true",
            ReturnUrl = $"{_configuration["AppUrl"]}/dashboard/settings?onboarded=true",
            Type = "account_onboarding"
        };
        
        var linkService = new AccountLinkService();
        var link = await linkService.CreateAsync(linkOptions);
        
        return link.Url;
    }
    
    public async Task<bool> CheckOnboardingStatusAsync(int userId)
    {
        var account = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == userId);
        
        if (account == null)
            return false;
        
        var accountService = new AccountService();
        var stripeAccount = await accountService.GetAsync(account.StripeAccountId);
        
        var isOnboarded = stripeAccount.ChargesEnabled && stripeAccount.PayoutsEnabled;
        
        if (isOnboarded && !account.IsOnboarded)
        {
            account.IsOnboarded = true;
            account.AccountStatus = "active";
            account.ChargesEnabled = stripeAccount.ChargesEnabled;
            account.PayoutsEnabled = stripeAccount.PayoutsEnabled;
            account.OnboardedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        
        return isOnboarded;
    }
    
    #endregion
    
    #region Payment Processing
    
    public async Task<PaymentIntentResult> CreatePaymentIntentAsync(CreatePaymentIntentDto dto)
    {
        var job = await _context.Jobs.FindAsync(dto.JobId);
        if (job == null)
            throw new KeyNotFoundException("Job not found");
        
        var platformFee = (dto.Amount * _platformFeePercentage) / 100;
        var freelancerAmount = dto.Amount - platformFee;
        
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(dto.Amount * 100),
            Currency = "usd",
            PaymentMethodTypes = new List<string> { "card" },
            Metadata = new Dictionary<string, string>
            {
                ["job_id"] = job.Id.ToString(),
                ["client_id"] = job.ClientId.ToString(),
                ["platform_fee"] = platformFee.ToString()
            },
            ApplicationFeeAmount = (long)(platformFee * 100)
        };
        
        // Transfer to freelancer if they have connected account
        var freelancerAccount = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == dto.FreelancerId && ca.IsOnboarded);
        
        if (freelancerAccount != null && dto.TransferToFreelancer)
        {
            options.TransferData = new PaymentIntentTransferDataOptions
            {
                Destination = freelancerAccount.StripeAccountId
            };
        }
        
        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);
        
        // Store payment record
        var payment = new Payment
        {
            StripePaymentIntentId = paymentIntent.Id,
            JobId = job.Id,
            ClientId = job.ClientId,
            FreelancerId = dto.FreelancerId,
            MilestoneId = dto.MilestoneId,
            Amount = dto.Amount,
            PlatformFee = platformFee,
            FreelancerAmount = freelancerAmount,
            Status = "pending"
        };
        
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        
        return new PaymentIntentResult
        {
            ClientSecret = paymentIntent.ClientSecret,
            PaymentIntentId = paymentIntent.Id
        };
    }
    
    public async Task<PaymentResult> ProcessMilestonePaymentAsync(int milestoneId, int clientId)
    {
        var milestone = await _context.Milestones
            .Include(m => m.Proposal)
            .ThenInclude(p => p.Job)
            .FirstOrDefaultAsync(m => m.Id == milestoneId);
        
        if (milestone == null)
            throw new KeyNotFoundException("Milestone not found");
        
        var job = milestone.Proposal.Job;
        
        if (job.ClientId != clientId)
            throw new UnauthorizedAccessException("Only the client can process milestone payments");
        
        if (milestone.Status != "approved")
            throw new InvalidOperationException("Milestone must be approved before payment");
        
        // Create payment intent
        var intent = await CreatePaymentIntentAsync(new CreatePaymentIntentDto
        {
            JobId = job.Id,
            FreelancerId = milestone.Proposal.FreelancerId,
            MilestoneId = milestoneId,
            Amount = milestone.Amount,
            TransferToFreelancer = true
        });
        
        // Confirm payment
        var service = new PaymentIntentService();
        var paymentIntent = await service.ConfirmAsync(intent.PaymentIntentId,
            new PaymentIntentConfirmOptions
            {
                PaymentMethod = "pm_card_visa"
            });
        
        if (paymentIntent.Status == "succeeded")
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntent.Id);
            
            if (payment != null)
            {
                payment.Status = "succeeded";
                payment.PaidAt = DateTime.UtcNow;
            }
            
            milestone.Status = "paid";
            await _context.SaveChangesAsync();
            
            return new PaymentResult
            {
                Success = true,
                PaymentIntentId = paymentIntent.Id,
                Amount = paymentIntent.Amount / 100m,
                Message = "Milestone payment processed successfully"
            };
        }
        
        return new PaymentResult
        {
            Success = false,
            Message = paymentIntent.LastPaymentError?.Message ?? "Payment failed"
        };
    }
    
    public async Task<PaymentResult> ProcessJobPaymentAsync(int jobId, int clientId)
    {
        var job = await _context.Jobs
            .Include(j => j.Proposals)
            .FirstOrDefaultAsync(j => j.Id == jobId);
        
        if (job == null)
            throw new KeyNotFoundException("Job not found");
        
        if (job.ClientId != clientId)
            throw new UnauthorizedAccessException("Only the client can process job payments");
        
        var acceptedProposal = job.Proposals.FirstOrDefault(p => p.Status == "approved");
        if (acceptedProposal == null)
            throw new InvalidOperationException("No accepted proposal found");
        
        // Create escrow
        var escrow = await CreateEscrowAsync(jobId);
        
        // Create payment intent
        var intent = await CreatePaymentIntentAsync(new CreatePaymentIntentDto
        {
            JobId = jobId,
            FreelancerId = acceptedProposal.FreelancerId,
            Amount = acceptedProposal.BidAmount,
            TransferToFreelancer = false
        });
        
        // Confirm payment
        var service = new PaymentIntentService();
        var paymentIntent = await service.ConfirmAsync(intent.PaymentIntentId,
            new PaymentIntentConfirmOptions
            {
                PaymentMethod = "pm_card_visa"
            });
        
        if (paymentIntent.Status == "succeeded")
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntent.Id);
            
            if (payment != null)
            {
                payment.Status = "succeeded";
                payment.PaidAt = DateTime.UtcNow;
            }
            
            var escrowEntity = await _context.Escrows
                .FirstOrDefaultAsync(e => e.JobId == jobId);

            if (escrowEntity == null)
                throw new InvalidOperationException("Escrow record not found");

            escrowEntity.StripePaymentIntentId = paymentIntent.Id;
            escrowEntity.HeldAmount = acceptedProposal.BidAmount;
            job.Status = "in-progress";
            
            await _context.SaveChangesAsync();
            
            return new PaymentResult
            {
                Success = true,
                PaymentIntentId = paymentIntent.Id,
                Amount = paymentIntent.Amount / 100m,
                Message = "Job payment escrowed successfully"
            };
        }
        
        return new PaymentResult
        {
            Success = false,
            Message = paymentIntent.LastPaymentError?.Message ?? "Payment failed"
        };
    }
    
    #endregion
    
    #region Escrow Management
    
    public async Task<EscrowDto> CreateEscrowAsync(int jobId)
    {
        var job = await _context.Jobs
            .Include(j => j.Proposals)
            .FirstOrDefaultAsync(j => j.Id == jobId);
        
        var acceptedProposal = job?.Proposals.FirstOrDefault(p => p.Status == "approved");
        if (acceptedProposal == null)
            throw new InvalidOperationException("No accepted proposal found");
        
        var escrow = new Escrow
        {
            JobId = jobId,
            TotalAmount = acceptedProposal.BidAmount,
            ReleasedAmount = 0,
            HeldAmount = acceptedProposal.BidAmount,
            Status = "active",
            DisputeDeadline = DateTime.UtcNow.AddDays(14)
        };
        
        _context.Escrows.Add(escrow);
        await _context.SaveChangesAsync();
        
        return MapToEscrowDto(escrow);
    }
    
    public async Task<EscrowDto> ReleaseMilestonePaymentAsync(int milestoneId, int clientId)
    {
        // Process payment first
        var result = await ProcessMilestonePaymentAsync(milestoneId, clientId);
        
        if (!result.Success)
            throw new Exception(result.Message);
        
        var milestone = await _context.Milestones.FindAsync(milestoneId);
        var escrow = await _context.Escrows
            .FirstOrDefaultAsync(e => e.JobId == milestone!.Proposal.JobId);
        
        if (escrow != null)
        {
            var release = new EscrowRelease
            {
                EscrowId = escrow.Id,
                MilestoneId = milestoneId,
                Amount = milestone!.Amount,
                ReleasedAt = DateTime.UtcNow,
                Status = "completed"
            };
            
            _context.EscrowReleases.Add(release);
            
            escrow.ReleasedAmount += milestone.Amount;
            escrow.HeldAmount -= milestone.Amount;
            
            if (escrow.ReleasedAmount >= escrow.TotalAmount)
                escrow.Status = "released";
            
            await _context.SaveChangesAsync();
        }
        
        return MapToEscrowDto(escrow!);
    }
    
    public async Task<EscrowDto> ReleaseFullEscrowAsync(int jobId, int clientId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        
        if (job?.ClientId != clientId)
            throw new UnauthorizedAccessException("Only the client can release escrow");
        
        var escrow = await _context.Escrows
            .FirstOrDefaultAsync(e => e.JobId == jobId);
        
        if (escrow == null)
            throw new InvalidOperationException("No escrow found");
        
        var acceptedProposal = await _context.Proposals
            .FirstOrDefaultAsync(p => p.JobId == jobId && p.Status == "approved");
        
        var freelancerAccount = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == acceptedProposal!.FreelancerId);
        
        if (freelancerAccount == null || !freelancerAccount.IsOnboarded)
            throw new InvalidOperationException("Freelancer must onboard first");
        
        var platformFee = (escrow.TotalAmount * _platformFeePercentage) / 100;
        var freelancerAmount = escrow.TotalAmount - platformFee;
        
        // Create transfer to freelancer
        var transferOptions = new TransferCreateOptions
        {
            Amount = (long)(freelancerAmount * 100),
            Currency = "usd",
            Destination = freelancerAccount.StripeAccountId,
            TransferGroup = $"job_{jobId}_completion"
        };
        
        var transferService = new TransferService();
        var transfer = await transferService.CreateAsync(transferOptions);
        
        // Record release
        var release = new EscrowRelease
        {
            EscrowId = escrow.Id,
            MilestoneId = 0,
            Amount = freelancerAmount,
            ReleasedAt = DateTime.UtcNow,
            StripeTransferId = transfer.Id,
            Status = "completed"
        };
        
        _context.EscrowReleases.Add(release);
        
        escrow.ReleasedAmount = freelancerAmount;
        escrow.HeldAmount = 0;
        escrow.Status = "released";
        job.Status = "completed";
        
        await _context.SaveChangesAsync();
        
        return MapToEscrowDto(escrow);
    }
    
    public async Task<EscrowDto> DisputeEscrowAsync(int jobId, int clientId, string reason)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        
        if (job?.ClientId != clientId)
            throw new UnauthorizedAccessException("Only the client can dispute escrow");
        
        var escrow = await _context.Escrows
            .FirstOrDefaultAsync(e => e.JobId == jobId);
        
        if (escrow == null)
            throw new InvalidOperationException("No escrow found");
        
        escrow.Status = "disputed";
        escrow.DisputeReason = reason;
        job.Status = "disputed";
        
        await _context.SaveChangesAsync();
        
        return MapToEscrowDto(escrow);
    }
    
    public async Task<EscrowDto> ResolveDisputeAsync(int jobId, decimal freelancerAmount, int resolverId)
    {
        var admin = await _context.Users.FindAsync(resolverId);
        
        if (admin?.UserType != "admin")
            throw new UnauthorizedAccessException("Only admins can resolve disputes");
        
        var escrow = await _context.Escrows
            .FirstOrDefaultAsync(e => e.JobId == jobId);
        
        if (escrow?.Status != "disputed")
            throw new InvalidOperationException("Escrow not in dispute");
        
        var clientRefund = escrow.TotalAmount - freelancerAmount;
        var platformFee = (freelancerAmount * _platformFeePercentage) / 100;
        var finalFreelancerAmount = freelancerAmount - platformFee;
        
        // Transfer to freelancer
        if (finalFreelancerAmount > 0)
        {
            var proposal = await _context.Proposals
                .FirstOrDefaultAsync(p => p.JobId == jobId && p.Status == "approved");
            
            var freelancerAccount = await _context.ConnectedAccounts
                .FirstOrDefaultAsync(ca => ca.UserId == proposal!.FreelancerId);
            
            if (freelancerAccount?.IsOnboarded == true)
            {
                var transferOptions = new TransferCreateOptions
                {
                    Amount = (long)(finalFreelancerAmount * 100),
                    Currency = "usd",
                    Destination = freelancerAccount.StripeAccountId
                };
                
                var transferService = new TransferService();
                await transferService.CreateAsync(transferOptions);
            }
        }
        
        // Refund client
        if (clientRefund > 0)
        {
            var refundOptions = new RefundCreateOptions
            {
                PaymentIntent = escrow.StripePaymentIntentId,
                Amount = (long)(clientRefund * 100),
                Reason = RefundReasons.RequestedByCustomer
            };
            
            var refundService = new RefundService();
            await refundService.CreateAsync(refundOptions);
        }
        
        escrow.Status = "refunded";
        escrow.DisputeResolution = $"Resolved: Freelancer receives ${freelancerAmount}, Client refunded ${clientRefund}";
        
        var job = await _context.Jobs.FindAsync(jobId);
        if (job != null) job.Status = "cancelled";
        
        await _context.SaveChangesAsync();
        
        return MapToEscrowDto(escrow);
    }
    
    #endregion
    
    #region Payouts
    
    public async Task<WithdrawalDto> RequestWithdrawalAsync(int freelancerId, decimal amount)
    {
        var account = await _context.ConnectedAccounts
            .FirstOrDefaultAsync(ca => ca.UserId == freelancerId && ca.IsOnboarded);
        
        if (account == null)
            throw new InvalidOperationException("You must connect your Stripe account first");
        
        var balance = await GetAvailableBalanceAsync(freelancerId);
        
        if (amount > balance)
            throw new InvalidOperationException($"Insufficient balance. Available: ${balance}");
        
        var minWithdrawal = decimal.Parse(_configuration["Stripe:MinimumWithdrawalAmount"] ?? "50");
        if (amount < minWithdrawal)
            throw new InvalidOperationException($"Minimum withdrawal is ${minWithdrawal}");
        
        // Create transfer
        var transferOptions = new TransferCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = "usd",
            Destination = account.StripeAccountId,
            Description = $"Freelancer withdrawal #{freelancerId}"
        };
        
        var transferService = new TransferService();
        var transfer = await transferService.CreateAsync(transferOptions);
        
        var withdrawal = new Withdrawal
        {
            FreelancerId = freelancerId,
            Amount = amount,
            StripeTransferId = transfer.Id,
            Status = "completed",
            ProcessedAt = DateTime.UtcNow
        };
        
        _context.Withdrawals.Add(withdrawal);
        await _context.SaveChangesAsync();
        
        return MapToWithdrawalDto(withdrawal);
    }
    
    public async Task<decimal> GetAvailableBalanceAsync(int freelancerId)
    {
        var completedPayments = await _context.Payments
            .Where(p => p.FreelancerId == freelancerId 
                        && p.Status == "succeeded"
                        && p.ReleasedAt != null)
            .SumAsync(p => p.FreelancerAmount);
        
        var withdrawn = await _context.Withdrawals
            .Where(w => w.FreelancerId == freelancerId && w.Status == "completed")
            .SumAsync(w => w.Amount);
        
        return completedPayments - withdrawn;
    }
    
    #endregion
    
    #region Mapping
    
    private ConnectedAccountDto MapToConnectedAccountDto(ConnectedAccount account)
    {
        return new ConnectedAccountDto
        {
            Id = account.Id,
            StripeAccountId = account.StripeAccountId,
            IsOnboarded = account.IsOnboarded,
            AccountStatus = account.AccountStatus ?? "pending",
            ChargesEnabled = account.ChargesEnabled,
            PayoutsEnabled = account.PayoutsEnabled,
            OnboardedAt = account.OnboardedAt
        };
    }
    
    private EscrowDto MapToEscrowDto(Escrow escrow)
    {
        return new EscrowDto
        {
            Id = escrow.Id,
            JobId = escrow.JobId,
            TotalAmount = escrow.TotalAmount,
            ReleasedAmount = escrow.ReleasedAmount,
            HeldAmount = escrow.HeldAmount,
            Status = escrow.Status,
            DisputeDeadline = escrow.DisputeDeadline,
            DisputeReason = escrow.DisputeReason,
            Releases = escrow.Releases?.Select(r => new EscrowReleaseDto
            {
                Id = r.Id,
                MilestoneId = r.MilestoneId,
                Amount = r.Amount,
                ReleasedAt = r.ReleasedAt,
                Status = r.Status
            }).ToList()
        };
    }
    
    private WithdrawalDto MapToWithdrawalDto(Withdrawal withdrawal)
    {
        return new WithdrawalDto
        {
            Id = withdrawal.Id,
            Amount = withdrawal.Amount,
            Status = withdrawal.Status,
            CreatedAt = withdrawal.CreatedAt,
            ProcessedAt = withdrawal.ProcessedAt,
            FailureReason = withdrawal.FailureReason
        };
    }
    
    #endregion
}
