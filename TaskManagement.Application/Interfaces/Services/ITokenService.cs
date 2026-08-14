using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Services;

public interface ITokenService
{
    public AuthResponseDto GenerateTokens(User user);
    public Task<AuthResponseDto?> RefreshTokensAsync(string refreshToken);
    public Task<bool> RevokeRefreshTokenAsync(string refreshToken);


}
