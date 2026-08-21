using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Configurations;
using TaskManagement.Infrastructure.Persistence;
using Xunit;

namespace TaskManagement.Application.Tests.Services;

public class TokenServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly ApplicationDbContext _context;
    private readonly TokenService _tokenService;

    private readonly JwtSettings _jwtSettings = new()
    {
        Key = "this-is-a-test-secret-key-that-is-at-least-32-characters-long",
        Issuer = "TaskManagement.API",
        Audience = "TaskManagement.Client",
        AccessTokenExpirationMinutes = 15,
        AccessTokenExpirationSeconds = 900,
        RefreshTokenExpirationDays = 7
    };

    public TokenServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();

        _tokenService = new TokenService(
            _context,
            Options.Create(_jwtSettings));
    }

    [Fact]
    public async Task GenerateTokensAsync_WithValidUser_ShouldReturnTokens()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var before = DateTime.UtcNow;

        // Act
        var result = await _tokenService.GenerateTokensAsync(user);

        var after = DateTime.UtcNow;

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.RefreshToken.Should().NotBeNullOrWhiteSpace();

        result.AccessTokenExpiresAt
            .Should()
            .BeAfter(before.AddMinutes(14));

        result.AccessTokenExpiresAt
            .Should()
            .BeBefore(after.AddMinutes(16));

        result.RefreshTokenExpiresAt
            .Should()
            .BeAfter(before.AddDays(6));

        result.RefreshTokenExpiresAt
            .Should()
            .BeBefore(after.AddDays(8));
    }

    [Fact]
    public async Task GenerateTokensAsync_ShouldPersistHashedRefreshToken()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        // Act
        var result = await _tokenService.GenerateTokensAsync(user);

        // Assert
        var storedToken = await _context.RefreshTokens
            .SingleAsync();

        storedToken.UserId.Should().Be(user.Id);
        storedToken.TokenHash.Should().NotBe(result.RefreshToken);
        storedToken.TokenHash.Should().HaveLength(64);
        storedToken.ExpiresAt.Should().BeCloseTo(
            result.RefreshTokenExpiresAt,
            TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GenerateTokensAsync_WithNullUser_ShouldThrow()
    {
        // Act
        var act = () => _tokenService.GenerateTokensAsync(null!);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task RefreshTokensAsync_WithValidToken_ShouldGenerateNewTokens()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var originalResponse =
            await _tokenService.GenerateTokensAsync(user);

        var originalToken = await _context.RefreshTokens
            .SingleAsync();

        // Act
        var refreshedResponse =
            await _tokenService.RefreshTokensAsync(
                originalResponse.RefreshToken);

        // Assert
        refreshedResponse.Should().NotBeNull();
        refreshedResponse!.AccessToken.Should().NotBeNullOrWhiteSpace();
        refreshedResponse.RefreshToken.Should().NotBeNullOrWhiteSpace();

        refreshedResponse.RefreshToken
            .Should()
            .NotBe(originalResponse.RefreshToken);

        _context.ChangeTracker.Clear();

        var tokens = await _context.RefreshTokens
            .AsNoTracking()
            .OrderBy(x => x.ExpiresAt)
            .ToListAsync();
        tokens.Should().HaveCount(2);

        var oldToken = tokens.Single(x => x.Id == originalToken.Id);
        var newToken = tokens.Single(x => x.Id != originalToken.Id);

        oldToken.RevokedAt.Should().NotBeNull();

        oldToken.ReplacedByTokenHash
            .Should()
            .Be(newToken.TokenHash);

        newToken.RevokedAt.Should().BeNull();
        newToken.UserId.Should().Be(user.Id);
    }

    [Fact]
    public async Task RefreshTokensAsync_WithInvalidToken_ShouldReturnNull()
    {
        // Act
        var result = await _tokenService.RefreshTokensAsync(
            "invalid-refresh-token");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RefreshTokensAsync_WithExpiredToken_ShouldReturnNull()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var expiredToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken("expired-token"),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1)
        };

        _context.RefreshTokens.Add(expiredToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _tokenService.RefreshTokensAsync(
            "expired-token");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RefreshTokensAsync_WithRevokedToken_ShouldReturnNull()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var revokedToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken("revoked-token"),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            RevokedAt = DateTime.UtcNow.AddMinutes(-1)
        };

        _context.RefreshTokens.Add(revokedToken);
        await _context.SaveChangesAsync();

        // Act
        var result = await _tokenService.RefreshTokensAsync(
            "revoked-token");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_WithValidToken_ShouldReturnTrue()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var response =
            await _tokenService.GenerateTokensAsync(user);

        // Act
        var result =
            await _tokenService.RevokeRefreshTokenAsync(
                response.RefreshToken);

        // Assert
        result.Should().BeTrue();

        var storedToken = await _context.RefreshTokens
            .SingleAsync();

        storedToken.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_WithInvalidToken_ShouldReturnFalse()
    {
        // Act
        var result =
            await _tokenService.RevokeRefreshTokenAsync(
                "invalid-refresh-token");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_WithEmptyToken_ShouldReturnFalse()
    {
        // Act
        var result =
            await _tokenService.RevokeRefreshTokenAsync(
                string.Empty);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_WithAlreadyRevokedToken_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateUser();
        await AddUserAsync(user);

        var response =
            await _tokenService.GenerateTokensAsync(user);

        await _tokenService.RevokeRefreshTokenAsync(
            response.RefreshToken);

        // Act
        var result =
            await _tokenService.RevokeRefreshTokenAsync(
                response.RefreshToken);

        // Assert
        result.Should().BeFalse();
    }

    private User CreateUser()
    {
        var user = new User(
            "Test User",
            $"test-{Guid.NewGuid()}@example.com",
            UserRole.RegularUser);

        user.SetPasswordHash("hashed-password");

        return user;
    }

    private async Task AddUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    private static string HashToken(string token)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();

        var bytes = System.Text.Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
}
