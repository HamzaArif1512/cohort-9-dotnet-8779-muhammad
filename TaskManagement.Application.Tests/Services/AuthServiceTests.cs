using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.Exceptions;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using Xunit;


namespace TaskManagement.Application.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _tokenServiceMock = new Mock<ITokenService>();
        _passwordHasherMock = new Mock<IPasswordHasher>();

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _tokenServiceMock.Object,
            _passwordHasherMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_WithValidRequest_ShouldRegisterUserAndReturnTokens()
    {
        // Arrange
        var request = new RegisterUserDto
        {
            FullName = "Test User",
            Email = "TEST@Example.com",
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        var expectedResponse = new AuthResponseDto
        {
            AccessToken = "access_token",
            RefreshToken = "refresh_token"
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com"))
            .ReturnsAsync((User?)null);

        _passwordHasherMock
            .Setup(x => x.HashPassword(It.IsAny<User>(), request.Password))
            .Returns("hashed-password");

        _tokenServiceMock
            .Setup(x => x.GenerateTokensAsync(
                It.IsAny<User>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _authService.RegisterAsync(request);

        result.Should().BeSameAs(expectedResponse);

        _passwordHasherMock.Verify(
            x => x.HashPassword(
                It.Is<User>(u =>
                    u.Name == "Test User" &&
                    u.Email == "test@example.com" &&
                    u.Role == UserRole.RegularUser),
                "Password123"),
            Times.Once);

        _userRepositoryMock.Verify(
            x => x.AddAsync(It.Is<User>(u =>
                u.Name == "Test User" &&
                u.Email == "test@example.com" &&
                u.Role == UserRole.RegularUser &&
                u.PasswordHash == "hashed-password")),
            Times.Once);

        _userRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);

        _tokenServiceMock.Verify(
            x => x.GenerateTokensAsync(
                It.Is<User>(u =>
                u.Email == "test@example.com"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowDuplicateEmailException()
    {
        var request = new RegisterUserDto
        {
            FullName = "Test User",
            Email = "test@example.com",
            Password = "Password123",
            ConfirmPassword = "Password123"
        };

        var existingUser = new User(
            "test",
            "test@example.com",
            UserRole.RegularUser);

        existingUser.SetPasswordHash("hashed-password");

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com"))
            .ReturnsAsync(existingUser);

        var act = () => _authService.RegisterAsync(request);

        await act.Should()
            .ThrowAsync<DuplicateEmailException>();

        _passwordHasherMock.Verify(
            x => x.HashPassword(
                It.IsAny<User>(),
                It.IsAny<string>()), Times.Never);

        _userRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<User>()), Times.Never);

        _tokenServiceMock.Verify(
            x => x.GenerateTokensAsync(
                It.IsAny<User>(),
                It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnTokens()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "TEST@example.com",
            Password = "Password123"
        };

        var user = new User(
            "Test User",
            "test@example.com",
            UserRole.RegularUser);

        user.SetPasswordHash("hashed-password");

        var expectedResponse = new AuthResponseDto
        {
            AccessToken = "access_token",
            RefreshToken = "refresh_token"
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com"))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword(
                user,
                "hashed-password",
                "Password123"))
            .Returns(true);

        _tokenServiceMock
            .Setup(x => x.GenerateTokensAsync(
                user,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().BeSameAs(expectedResponse);

        _passwordHasherMock.Verify(
            x => x.VerifyPassword(
                user,
                "hashed-password",
                "Password123"),
            Times.Once);

        _tokenServiceMock.Verify(
            x => x.GenerateTokensAsync(
                user,
                It.IsAny<CancellationToken>()),
            Times.Once);

        _userRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }


    [Fact]
    public async Task LoginAsync_WithNonexistentUser_ShouldReturnNull()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "unknown@example.com",
            Password = "Password123"
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync("unknown@example.com"))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().BeNull();

        _passwordHasherMock.Verify(
            x => x.VerifyPassword(
                It.IsAny<User>(),
                It.IsAny<string>(),
                It.IsAny<string>()),
            Times.Never);

        _tokenServiceMock.Verify(
            x => x.GenerateTokensAsync(
                It.IsAny<User>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task LoginAsync_WithIncorrectPassword_ShouldReturnNull()
    {
        // Arrange
        var dto = new LoginUserDto
        {
            Email = "test@example.com",
            Password = "WrongPassword123"
        };

        var user = new User(
            "Test User",
            "test@example.com",
            UserRole.RegularUser);

        user.SetPasswordHash("hashed-password");

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync("test@example.com"))
            .ReturnsAsync(user);

        _passwordHasherMock
            .Setup(x => x.VerifyPassword(
                user,
                user.PasswordHash,
                dto.Password))
            .Returns(false);

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().BeNull();

        _tokenServiceMock.Verify(
            x => x.GenerateTokensAsync(
                It.IsAny<User>(),
                It.IsAny<CancellationToken>()),
            Times.Never);

        _userRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task RefreshTokensAsync_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "refresh-token"
        };

        var expectedResponse = new AuthResponseDto
        {
            AccessToken = "new-access-token",
            RefreshToken = "new-refresh-token"
        };

        _tokenServiceMock
            .Setup(x => x.RefreshTokensAsync("refresh-token"))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _authService.RefreshTokensAsync(dto);

        // Assert
        result.Should().BeSameAs(expectedResponse);

        _tokenServiceMock.Verify(
            x => x.RefreshTokensAsync("refresh-token"),
            Times.Once);
    }

    [Fact]
    public async Task LogoutAsync_WithValidToken_ShouldRevokeToken()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "refresh-token"
        };

        _tokenServiceMock
            .Setup(x => x.RevokeRefreshTokenAsync("refresh-token"))
            .ReturnsAsync(true);

        // Act
        var result = await _authService.LogoutAsync(dto);

        // Assert
        result.Should().BeTrue();

        _tokenServiceMock.Verify(
            x => x.RevokeRefreshTokenAsync("refresh-token"),
            Times.Once);
    }
}
