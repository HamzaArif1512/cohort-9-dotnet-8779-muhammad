using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.Exceptions;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto? dto)
    {
        if (dto is null)
        {
            return BadRequest(new
            {
                Message = "Registration data is required."
            });
        }
        try
        {
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }
        catch (DuplicateEmailException)
        {
            return Conflict(new
            {
                Message = "A user with this email already exists."
            });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginUserDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        if (response == null)
        {
            return Unauthorized(new
            {
                Message = "Invalid email or password."
            });
        }
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken(RefreshTokenRequestDto dto)
    {
        var response = await _authService.RefreshTokensAsync(dto);
        if (response == null)
        {
            return Unauthorized(new
            {
                Message = "Invalid refresh token."
            });
        }
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenRequestDto dto)
    {
        var result = await _authService.LogoutAsync(dto);
        if (!result)
        {
            return BadRequest(new
            {
                Message = "Invalid refresh token."
            });
        }
        return Ok(new
        {
            Message = "Logged out successfully."
        });
    }
}
