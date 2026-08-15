using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Services;

public interface ITokenService
{
    public Task<AuthResponseDto> GenerateTokensAsync(User user, CancellationToken cancellationToken = default);
    public Task<AuthResponseDto?> RefreshTokensAsync(string refreshToken);
    public Task<bool> RevokeRefreshTokenAsync(string refreshToken);


}
