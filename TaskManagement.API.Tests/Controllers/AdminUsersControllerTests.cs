using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;

namespace TaskManagement.API.Tests.Controllers;

public class AdminUsersControllerTests
{
    private readonly Mock<IAdminUserService> _serviceMock;
    private readonly AdminUserController _controller;

    public AdminUsersControllerTests()
    {
        _serviceMock = new Mock<IAdminUserService>();

        _controller = new AdminUserController(
            _serviceMock.Object);
    }

    //get all users
    [Fact]
    public async Task GetUsers_ReturnsOkWithUsers()
    {
        // Arrange
        var users = new List<AdminUserListDto>
    {
        new()
        {
            Id = Guid.NewGuid(),
            Name = "User One",
            Email = "user1@example.com",
            CreatedAt = DateTime.UtcNow,
            TaskCount = 3
        },
        new()
        {
            Id = Guid.NewGuid(),
            Name = "User Two",
            Email = "user2@example.com",
            CreatedAt = DateTime.UtcNow,
            TaskCount = 5
        }
    };

        _serviceMock
            .Setup(x => x.GetUsersAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        // Act
        var result = await _controller.GetUsers(
            CancellationToken.None);

        // Assert
        var okResult = result.Should()
            .BeOfType<OkObjectResult>()
            .Subject;

        okResult.Value.Should()
            .BeEquivalentTo(users);

        _serviceMock.Verify(
            x => x.GetUsersAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //get details of a specific user
    [Fact]
    public async Task GetUserDetails_WhenUserExists_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new AdminUserDetailsDto
        {
            Id = userId,
            Name = "Test User",
            Email = "test@example.com",
            CreatedAt = DateTime.UtcNow,
            TaskCount = 10,
            PendingTasks = 3,
            InProgressTasks = 2,
            CompletedTasks = 4,
            OverdueTasks = 1
        };

        _serviceMock
            .Setup(x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(
            userId,
            CancellationToken.None);

        // Assert
        var okResult = result.Should()
            .BeOfType<OkObjectResult>()
            .Subject;

        okResult.Value.Should()
            .BeEquivalentTo(user);

        _serviceMock.Verify(
            x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //negative test - get specific user
    [Fact]
    public async Task GetUserDetails_WhenUserDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _serviceMock
            .Setup(x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((AdminUserDetailsDto?)null);

        // Act
        var result = await _controller.GetUser(
            userId,
            CancellationToken.None);

        // Assert
        result.Should().BeOfType<NotFoundResult>();

        _serviceMock.Verify(
            x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //create a user from admin portal
    [Fact]
    public async Task CreateUser_ReturnsCreatedAtAction()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var dto = new CreateAdminUserDto
        {
            Name = "New User",
            Email = "newuser@example.com",
            Password = "Password123!"
        };

        var createdUser = new AdminUserListDto
        {
            Id = userId,
            Name = dto.Name,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow,
            TaskCount = 0
        };

        _serviceMock
            .Setup(x => x.CreateUserAsync(
                dto,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _controller.CreateUser(
            dto,
            CancellationToken.None);

        // Assert
        var createdResult = result.Should()
            .BeOfType<CreatedAtActionResult>()
            .Subject;

        createdResult.ActionName.Should()
            .Be(nameof(AdminUserController.GetUser));

        createdResult.RouteValues.Should()
            .ContainKey("userId");

        createdResult.RouteValues!["userId"]
            .Should()
            .Be(userId);

        createdResult.Value.Should()
            .BeEquivalentTo(createdUser);

        _serviceMock.Verify(
            x => x.CreateUserAsync(
                dto,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //test middleware
    [Fact]
    public async Task CreateUser_WhenServiceThrows_PropagatesException()
    {
        // Arrange
        var dto = new CreateAdminUserDto
        {
            Name = "Existing User",
            Email = "existing@example.com",
            Password = "Password123!"
        };

        _serviceMock
            .Setup(x => x.CreateUserAsync(
                dto,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(
                new InvalidOperationException(
                    "A user with this email already exists."));

        // Act
        var act = () => _controller.CreateUser(
            dto,
            CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<InvalidOperationException>();
    }

    //check admin authorization
    [Fact]
    public void Controller_HasAdminAuthorization()
    {
        var attribute = typeof(AdminUserController)
            .GetCustomAttributes(
                typeof(AuthorizeAttribute),
                inherit: true)
            .OfType<AuthorizeAttribute>()
            .Single();

        attribute.Roles.Should().Be("Admin");
    }
}
