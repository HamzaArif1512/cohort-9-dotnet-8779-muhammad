using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskManagement.Infrastructure.Configurations;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Application.DTOs.Auth;
using System.Diagnostics;


namespace TaskManagement.Application.Services;

public class TokenService : ITokenService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public TokenService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponseDto> GenerateTokensAsync(
        User user,
        CancellationToken cancellationToken = default)
    {

        ArgumentNullException.ThrowIfNull(user);

        var accessTokenExpiresAt =
            DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        var refreshTokenExpiresAt =
            DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        var accessToken = GenerateAccessToken(user, accessTokenExpiresAt);
        var rawRefreshToken = GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken(rawRefreshToken),
            ExpiresAt = refreshTokenExpiresAt
        };

        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            AccessTokenExpiresAt = accessTokenExpiresAt,
            RefreshTokenExpiresAt = refreshTokenExpiresAt,
        };
    }

    public async Task<AuthResponseDto?> RefreshTokensAsync(string refreshToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(refreshToken);

        var tokenHash = HashToken(refreshToken);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var storedRefreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt =>
                rt.TokenHash == tokenHash &&
                rt.ExpiresAt > DateTime.UtcNow &&
                rt.RevokedAt == null);

        if (storedRefreshToken is null)
        {
            return null;
        }

        var response = await GenerateTokensAsync(storedRefreshToken.User);
        var newTokenHash = HashToken(response.RefreshToken);

        var rowsAffected = await _context.RefreshTokens
            .Where(rt =>
                rt.Id == storedRefreshToken.Id &&
                rt.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(
                    rt => rt.RevokedAt,
                    DateTime.UtcNow)
                .SetProperty(
                    rt => rt.ReplacedByTokenHash,
                    newTokenHash));

        if (rowsAffected != 1)
        {
            await transaction.RollbackAsync();
            return null;
        }

        await transaction.CommitAsync();

        return response;
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return false;
        }

        var tokenHash = HashToken(refreshToken);

        var storedRefreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.ExpiresAt > DateTime.UtcNow);

        if (storedRefreshToken == null || !storedRefreshToken.IsActive)
        {
            return false; // Token not found or already revoked/expired
        }

        storedRefreshToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true; // Token successfully revoked
    }

    private string GenerateAccessToken(User user, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashToken(string token)
    {
      var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
      return Convert.ToHexString(hash);
    }

}
