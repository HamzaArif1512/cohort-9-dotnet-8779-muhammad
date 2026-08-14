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

    public AuthResponseDto GenerateTokens(User user)
    {
       var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        var accessToken = GenerateAccessToken(user, accessTokenExpiresAt);
        var rawRefreshToken = GenerateRefreshToken();
        // Save the refresh token to the database
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken(rawRefreshToken),
            ExpiresAt = refreshTokenExpiresAt
        };
        _context.RefreshTokens.Add(refreshToken);
        _context.SaveChanges();

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
       var tokenHash = HashToken(refreshToken);

        var storedRefreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.ExpiresAt > DateTime.UtcNow);

        if (storedRefreshToken == null || !storedRefreshToken.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        storedRefreshToken.RevokedAt = DateTime.UtcNow;

        var response = GenerateTokens(storedRefreshToken.User);
        var newTokenHash = HashToken(response.RefreshToken);

        storedRefreshToken.ReplacedByTokenHash = newTokenHash;

        await _context.SaveChangesAsync();

        return response;
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
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
