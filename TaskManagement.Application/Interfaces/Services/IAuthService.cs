using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.DTOs.UserDtos;


namespace TaskManagement.Application.Interfaces.Services;

public interface IAuthService
{
    public  Task<AuthResponseDto> RegisterAsync(RegisterUserDto request);
    public Task<AuthResponseDto?> LoginAsync(LoginUserDto request);
    public Task<AuthResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto dto);
    public Task<bool> LogoutAsync(RefreshTokenRequestDto request);
}
