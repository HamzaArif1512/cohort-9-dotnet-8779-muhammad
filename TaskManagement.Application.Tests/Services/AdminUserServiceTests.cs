using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Tests.Services;

public class AdminUserServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ILogger<AdminUserService>> _loggerMock;
    private readonly Mock<IPasswordHasher<User>> _passwordHasherMock;

    private readonly AdminUserService _service;

    public AdminUserServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _loggerMock = new Mock<ILogger<AdminUserService>>();
        _passwordHasherMock = new Mock<IPasswordHasher<User>>();

        _service = new AdminUserService(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _loggerMock.Object);
    }

    //get list of registered users
    [Fact]
    public async Task GetUsersAsync_ReturnsRegularUsers()
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

        _userRepositoryMock
            .Setup(x => x.GetRegularUsersAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        // Act
        var result = await _service.GetUsersAsync(
            CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(users);

        _userRepositoryMock.Verify(
            x => x.GetRegularUsersAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //get details for each user
    [Fact]
    public async Task GetUserDetailsAsync_WhenUserExists_ReturnsDetails()
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

        _userRepositoryMock
            .Setup(x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _service.GetRegularUserDetailsAsync(
            userId,
            CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(user);
    }

    //negative check for non-existing user
    [Fact]
    public async Task GetUserDetailsAsync_WhenUserDoesNotExist_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepositoryMock
            .Setup(x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((AdminUserDetailsDto?)null);

        // Act
        var result = await _service.GetRegularUserDetailsAsync(
            userId,
            CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    //get each user's tasks
    [Fact]
    public async Task GetUserTasksAsync_ReturnsUserTasks()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var tasks = new List<AdminUserTaskDto>
    {
        new()
        {
            Id = Guid.NewGuid(),
            Title = "Build API",
            Description = "Build the task API",
            DueDate = DateTime.UtcNow.AddDays(2)
        },
        new()
        {
            Id = Guid.NewGuid(),
            Title = "Write Tests",
            Description = "Write repository tests",
            DueDate = DateTime.UtcNow.AddDays(4)
        }
    };

        _userRepositoryMock
            .Setup(x => x.GetUserTasksAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks);

        // Act
        var result = await _service.GetUserTasksAsync(
            userId,
            CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(tasks);
    }

    //create a new user as admin
    [Fact]
    public async Task CreateUserAsync_WithValidData_CreatesRegularUser()
    {
        // Arrange
        var dto = new CreateAdminUserDto
        {
            Name = "New User",
            Email = "newuser@example.com",
            Password = "Password123!"
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _passwordHasherMock
            .Setup(x => x.HashPassword(
                It.IsAny<User>(),
                dto.Password))
            .Returns("hashed-password");

        // Act
        var result = await _service.CreateUserAsync(
            dto,
            CancellationToken.None);

        // Assert
        result.Name.Should().Be(dto.Name);
        result.Email.Should().Be(dto.Email);
        result.TaskCount.Should().Be(0);

        _userRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<User>(u =>
                    u.Name == dto.Name &&
                    u.Email == dto.Email &&
                    u.PasswordHash == "hashed-password")),
            Times.Once);
    }

    //make sure duplicate emails are not entered
    [Fact]
    public async Task CreateUserAsync_WhenEmailAlreadyExists_ThrowsException()
    {
        // Arrange
        var dto = new CreateAdminUserDto
        {
            Name = "Existing User",
            Email = "existing@example.com",
            Password = "Password123!"
        };

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Existing User",
            Email = dto.Email
        };

        _userRepositoryMock
            .Setup(x => x.GetByEmailAsync(dto.Email))
            .ReturnsAsync(existingUser);

        // Act
        var act = () => _service.CreateUserAsync(
            dto,
            CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("A user with this email already exists.");

        _userRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<User>()),
            Times.Never);
    }

    //serilog test
    [Fact]
    public async Task GetUserDetailsAsync_WhenUserDoesNotExist_LogsWarning()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepositoryMock
            .Setup(x => x.GetRegularUserDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((AdminUserDetailsDto?)null);

        // Act
        await _service.GetRegularUserDetailsAsync(
            userId,
            CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>(
                    (value, type) =>
                        value.ToString()!.Contains(
                            "was not found")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
