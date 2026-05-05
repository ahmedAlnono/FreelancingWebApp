using AutoMapper;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProposalsController(
    IUnitOfWork unitOfWork,
     IMapper mapper,
      ILogger<ProposalsController> logger
    ) : ControllerBase
{
    private readonly ILogger<ProposalsController> _logger = logger;

    [HttpGet("my-proposals")]
    public async Task<ActionResult<ApiResponse<List<ProposalDto>>>> GetMyProposals()
    {
        var userId = GetUserId();
        var proposals = await unitOfWork.Proposals
            .GetAsync(p => p.FreelancerId == userId);

        var proposalDtos = mapper.Map<List<ProposalDto>>(proposals);

        return Ok(ApiResponse<List<ProposalDto>>.Ok(proposalDtos));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProposalDto>>> CreateProposal([FromBody] CreateProposalDto createDto)
    {
        var userId = GetUserId();

        // Check if job exists and is open
        var job = await unitOfWork.Jobs.GetByIdAsync(createDto.JobId);
        if (job == null)
            return NotFound(ApiResponse<ProposalDto>.Fail("Job not found"));

        if (job.Status != "open")
            return BadRequest(ApiResponse<ProposalDto>.Fail("This job is no longer accepting proposals"));

        // Check if already proposed
        var existingProposals = await unitOfWork.Proposals
            .GetAsync(p => p.JobId == createDto.JobId && p.FreelancerId == userId);

        if (existingProposals.Any())
            return BadRequest(ApiResponse<ProposalDto>.Fail("You have already submitted a proposal for this job"));

        var proposal = mapper.Map<Proposal>(createDto);
        proposal.FreelancerId = userId;
        proposal.SubmittedAt = DateTime.UtcNow;
        proposal.Status = "pending";

        await unitOfWork.Proposals.AddAsync(proposal);

        // Increment proposals count on job
        job.ProposalsCount++;
        await unitOfWork.Jobs.UpdateAsync(job);

        await unitOfWork.CompleteAsync();

        _logger.LogInformation("Proposal {ProposalId} created for job {JobId}", proposal.Id, job.Id);

        return Ok(ApiResponse<ProposalDto>.Ok(mapper.Map<ProposalDto>(proposal), "Proposal submitted successfully"));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateProposalStatus(int id, [FromBody] UpdateProposalStatusDto statusDto)
    {
        var userId = GetUserId();
        var proposal = await unitOfWork.Proposals.GetByIdAsync(id);

        if (proposal == null)
            return NotFound(ApiResponse<bool>.Fail("Proposal not found"));

        // Only client who posted the job can change status
        var job = await unitOfWork.Jobs.GetByIdAsync(proposal.JobId);
        if (job == null || job.ClientId != userId)
            return Unauthorized(ApiResponse<bool>.Fail("Only the client can change proposal status"));

        proposal.Status = statusDto.Status;
        proposal.ReviewedAt = DateTime.UtcNow;

        await unitOfWork.Proposals.UpdateAsync(proposal);
        await unitOfWork.CompleteAsync();

        return Ok(ApiResponse<bool>.Ok(true, $"Proposal {statusDto.Status}"));
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException();

        return int.Parse(userIdClaim);
    }
}

public class UpdateProposalStatusDto
{
    public string Status { get; set; } = string.Empty; // approved, rejected, interview
}