using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.DTOs.DashboardDtos;


namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("user")]
    [Authorize(Roles = "RegularUser,Admin")]
    public async Task<ActionResult<UserDashboardDto>> GetUserDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetUserDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminDashboardDto>> GetAdminDashboard(CancellationToken cancellationToken)
    {
        var dashboard = await _dashboardService.GetAdminDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }
}
