// Controllers/PaymentsController.cs
using FreelancingApi.Models.Dtos;
using FreelancingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    // Stripe Connect
    [HttpPost("connect/create-account")]
    public async Task<ActionResult<ApiResponse<ConnectedAccountDto>>> CreateConnectedAccount()
    {
        var userId = GetUserId();
        var result = await _paymentService.CreateConnectedAccountAsync(userId);
        return Ok(ApiResponse<ConnectedAccountDto>.Ok(result));
    }

    [HttpGet("connect/onboarding-link")]
    public async Task<ActionResult<ApiResponse<string>>> GetOnboardingLink()
    {
        var userId = GetUserId();
        var link = await _paymentService.GetOnboardingLinkAsync(userId);
        return Ok(ApiResponse<string>.Ok(link));
    }

    [HttpGet("connect/status")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckOnboardingStatus()
    {
        var userId = GetUserId();
        var isOnboarded = await _paymentService.CheckOnboardingStatusAsync(userId);
        return Ok(ApiResponse<bool>.Ok(isOnboarded));
    }

    // Job Payments
    [HttpPost("job/{jobId}/fund")]
    public async Task<ActionResult<ApiResponse<PaymentIntentResult>>> FundJob(int jobId)
    {
        var userId = GetUserId();
        var result = await _paymentService.ProcessJobPaymentAsync(jobId, userId);

        if (!result.Success)
            return BadRequest(ApiResponse<PaymentIntentResult>.Fail(result.Message));

        return Ok(ApiResponse<PaymentIntentResult>.Ok(new PaymentIntentResult
        {
            PaymentIntentId = result.PaymentIntentId
        }));
    }

    [HttpPost("milestone/{milestoneId}/release")]
    public async Task<ActionResult<ApiResponse<EscrowDto>>> ReleaseMilestone(int milestoneId)
    {
        var userId = GetUserId();
        var escrow = await _paymentService.ReleaseMilestonePaymentAsync(milestoneId, userId);
        return Ok(ApiResponse<EscrowDto>.Ok(escrow));
    }

    [HttpPost("job/{jobId}/release-full")]
    public async Task<ActionResult<ApiResponse<EscrowDto>>> ReleaseFullEscrow(int jobId)
    {
        var userId = GetUserId();
        var escrow = await _paymentService.ReleaseFullEscrowAsync(jobId, userId);
        return Ok(ApiResponse<EscrowDto>.Ok(escrow));
    }

    [HttpPost("job/{jobId}/dispute")]
    public async Task<ActionResult<ApiResponse<EscrowDto>>> DisputeJob(int jobId, [FromBody] DisputeRequest request)
    {
        var userId = GetUserId();
        var escrow = await _paymentService.DisputeEscrowAsync(jobId, userId, request.Reason);
        return Ok(ApiResponse<EscrowDto>.Ok(escrow));
    }

    [HttpGet("balance")]
    public async Task<ActionResult<ApiResponse<BalanceDto>>> GetBalance()
    {
        var userId = GetUserId();
        var balance = await _paymentService.GetAvailableBalanceAsync(userId);
        return Ok(ApiResponse<BalanceDto>.Ok(new BalanceDto
        {
            AvailableBalance = balance,
            Currency = "USD"
        }));
    }

    [HttpPost("withdraw")]
    public async Task<ActionResult<ApiResponse<WithdrawalDto>>> Withdraw([FromBody] WithdrawalRequest request)
    {
        var userId = GetUserId();
        var withdrawal = await _paymentService.RequestWithdrawalAsync(userId, request.Amount);
        return Ok(ApiResponse<WithdrawalDto>.Ok(withdrawal));
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
        return int.Parse(claim ?? "0");
    }
}

