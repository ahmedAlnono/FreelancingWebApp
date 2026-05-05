using FreelancingApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FreelancingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController(
    IStatisticService statisticService
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetMainPageData()
    {
        try
        {
            return Ok(await statisticService.GetHomeStatisticsAsync());
        }
        catch (System.Exception ex)
        {
            return BadRequest(ex.Message);
            throw;
        }
    }
}