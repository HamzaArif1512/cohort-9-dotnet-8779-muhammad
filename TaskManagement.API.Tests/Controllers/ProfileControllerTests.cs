using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.ProfileDtos;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.API.Tests.Controllers;

public class ProfileControllerTests
{
    private readonly Mock<IProfileService> _profileServiceMock;
    private readonly ProfileController _controller;

    public ProfileControllerTests()
    {
        _profileServiceMock = new Mock<IProfileService>();
        _controller = new ProfileController(
            _profileServiceMock.Object);
    }

    [Fact]
    public async Task GetProfile_ReturnsOkWithProfile()
    {
        // Arrange
        var profile = new ProfileDto
        {
            Id = Guid.NewGuid(),
            FullName = "Hamza Arif",
            Email = "hamza@example.com",
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        _profileServiceMock
            .Setup(x => x.GetProfileAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);

        // Act
        var result = await _controller.GetProfile(
            CancellationToken.None);

        // Assert
        result.Should().BeOfType<OkObjectResult>();

        var okResult = result
            .Should()
            .BeOfType<OkObjectResult>()
            .Subject;

        okResult.Value.Should().BeEquivalentTo(profile);
    }

    [Fact]
    public async Task GetProfile_CallsProfileServiceOnce()
    {
        // Arrange
        var profile = new ProfileDto
        {
            Id = Guid.NewGuid(),
            FullName = "Hamza Arif",
            Email = "hamza@example.com",
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        _profileServiceMock
            .Setup(x => x.GetProfileAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);

        // Act
        await _controller.GetProfile(
            CancellationToken.None);

        // Assert
        _profileServiceMock.Verify(
            x => x.GetProfileAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }


    [Fact]
    public async Task GetProfile_PassesCancellationTokenToService()
    {
        // Arrange
        var cancellationTokenSource =
            new CancellationTokenSource();

        var cancellationToken =
            cancellationTokenSource.Token;

        var profile = new ProfileDto
        {
            Id = Guid.NewGuid(),
            FullName = "Hamza Arif",
            Email = "hamza@example.com",
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        _profileServiceMock
            .Setup(x => x.GetProfileAsync(cancellationToken))
            .ReturnsAsync(profile);

        // Act
        await _controller.GetProfile(cancellationToken);

        // Assert
        _profileServiceMock.Verify(
            x => x.GetProfileAsync(cancellationToken),
            Times.Once);
    }

    [Fact]
    public async Task GetProfile_ReturnsProfileDataUnchanged()
    {
        // Arrange
        var profile = new ProfileDto
        {
            Id = Guid.NewGuid(),
            FullName = "Admin User",
            Email = "admin@example.com",
            Role = "Admin",
            CreatedAt = new DateTime(
                2026,
                1,
                15,
                10,
                30,
                0,
                DateTimeKind.Utc)
        };

        _profileServiceMock
            .Setup(x => x.GetProfileAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);

        // Act
        var result = await _controller.GetProfile(
            CancellationToken.None);

        // Assert
        var okResult = result
            .Should()
            .BeOfType<OkObjectResult>()
            .Subject;

        var returnedProfile = okResult.Value
            .Should()
            .BeOfType<ProfileDto>()
            .Subject;

        returnedProfile.Should().BeEquivalentTo(profile);
    }
}
