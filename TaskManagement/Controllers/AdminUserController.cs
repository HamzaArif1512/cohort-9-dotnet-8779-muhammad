using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Application.Interfaces.Services;


namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;
    public AdminUserController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AdminUserListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _adminUserService.GetUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(AdminUserDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUser(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _adminUserService.GetRegularUserDetailsAsync(userId, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AdminUserListDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto dto, CancellationToken cancellationToken)
    {
        var user = await _adminUserService.CreateUserAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetUser), new { userId = user.Id }, user);
    }


    [HttpGet("{userId:guid}/tasks")]
    [ProducesResponseType(
        typeof(IEnumerable<AdminUserTaskDto>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUserTasks(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var tasks = await _adminUserService.GetUserTasksAsync(
            userId,
            cancellationToken);

        return Ok(tasks);
    }
}
