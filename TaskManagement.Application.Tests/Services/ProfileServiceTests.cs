using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using TaskManagement.Application.DTOs.ProfileDtos;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tests.Services;

public class ProfileServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly ProfileService _profileService;
    private readonly Mock<ILogger<ProfileService>> _loggerMock;

    public ProfileServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<ProfileService>>();
        _profileService = new ProfileService(
            _mapperMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _loggerMock.Object);
    }

    //return profile details test
    [Fact]
    public async Task GetProfileAsync_ReturnsCurrentUserProfile()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new User(
            "Hamza Arif",
            "hamza@example.com",
            UserRole.Admin)
        {
            Id = userId
        };

        var expectedProfile = new ProfileDto
        {
            Id = userId,
            FullName = "Hamza Arif",
            Email = "hamza@example.com"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _userRepositoryMock
            .Setup(x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _mapperMock
            .Setup(x => x.Map<ProfileDto>(user))
            .Returns(expectedProfile);

        // Act
        var result = await _profileService.GetProfileAsync(
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedProfile);
    }


    [Fact]
    public async Task GetProfileAsync_UsesCurrentUserId()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new User(
            "Hamza Arif",
            "hamza@example.com",
            UserRole.Admin)
        {
            Id = userId
        };

        var profile = new ProfileDto
        {
            Id = userId,
            FullName = "Hamza Arif",
            Email = "hamza@example.com"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _userRepositoryMock
            .Setup(x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _mapperMock
            .Setup(x => x.Map<ProfileDto>(user))
            .Returns(profile);

        // Act
        await _profileService.GetProfileAsync(
            CancellationToken.None);

        // Assert
        _userRepositoryMock.Verify(
            x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //negative tests for null user details
    [Fact]
    public async Task GetProfileAsync_WhenUserIdIsNull_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns((Guid?)null);

        // Act
        Func<Task> act = async () =>
            await _profileService.GetProfileAsync(
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>();

        _userRepositoryMock.Verify(
            x => x.GetByIdWithRoleAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    //test non-existing user negative test
    [Fact]
    public async Task GetProfileAsync_WhenUserDoesNotExist_ThrowsKeyNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _userRepositoryMock
            .Setup(x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = async () =>
            await _profileService.GetProfileAsync(
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<KeyNotFoundException>();
    }

    //each user should see own profile details and not others
    [Fact]
    public async Task GetProfileAsync_MapsUserToProfileDto()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new User(
            "Hamza Arif",
            "hamza@example.com",
            UserRole.Admin)
        {
            Id = userId
        };

        var expectedProfile = new ProfileDto
        {
            Id = userId,
            FullName = "Hamza Arif",
            Email = "hamza@example.com"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _userRepositoryMock
            .Setup(x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _mapperMock
            .Setup(x => x.Map<ProfileDto>(user))
            .Returns(expectedProfile);

        // Act
        await _profileService.GetProfileAsync(
            CancellationToken.None);

        // Assert
        _mapperMock.Verify(
            x => x.Map<ProfileDto>(user),
            Times.Once);
    }

    //Logging test for successful profile retrieval
    [Fact]
    public async Task GetProfileAsync_WhenUserDoesNotExist_LogsWarning()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _userRepositoryMock
            .Setup(x => x.GetByIdWithRoleAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        Func<Task> act = async () =>
            await _profileService.GetProfileAsync(
                CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((value, type) =>
                    value.ToString()!.Contains("not found")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
