using Microsoft.Extensions.Logging;
using AutoMapper;
using FluentAssertions;
using Moq;
using Serilog;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly TaskService _taskService;
    private readonly Mock<ILogger<TaskService>> _loggerMock;

    public TaskServiceTests()
    {
        _taskRepositoryMock = new Mock<ITaskRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<TaskService>>();
        _taskService = new TaskService(
            _taskRepositoryMock.Object,
            _mapperMock.Object,
            _currentUserServiceMock.Object,
            _loggerMock.Object);
    }


    //Regular user only sees own tasks
    [Fact]
    public async Task GetAllTasks_RegularUser_ReturnsOnlyOwnTasks()
    {

        var userId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        var tasks = new List<TaskItem>
    {
        new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = "My Task"
        }
    };

        _taskRepositoryMock
            .Setup(x => x.GetAllByUserIdWithDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks);

        _mapperMock
            .Setup(x => x.Map<IEnumerable<TaskResponseDto>>(tasks))
            .Returns(new List<TaskResponseDto>());


        var result = await _taskService.GetAllTasksAsync(
            CancellationToken.None);

        _taskRepositoryMock.Verify(
            x => x.GetAllByUserIdWithDetailsAsync(
                userId,
                It.IsAny<CancellationToken>()),
            Times.Once);

        _taskRepositoryMock.Verify(
            x => x.GetAllWithDetailsAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    //Admin should see all tasks
    [Fact]
    public async Task GetAllTasks_Admin_ReturnsAllTasks()
    {
        // Arrange
        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(true);

        var tasks = new List<TaskItem>
    {
        new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "User 1 Task"
        },
        new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "User 2 Task"
        }
    };

        _taskRepositoryMock
            .Setup(x => x.GetAllWithDetailsAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(tasks);

        _mapperMock
            .Setup(x => x.Map<IEnumerable<TaskResponseDto>>(tasks))
            .Returns(new List<TaskResponseDto>());

        // Act
        await _taskService.GetAllTasksAsync(
            CancellationToken.None);

        // Assert
        _taskRepositoryMock.Verify(
            x => x.GetAllWithDetailsAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);

        _taskRepositoryMock.Verify(
            x => x.GetAllByUserIdWithDetailsAsync(
                It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    //Users can access their own tasks
    [Fact]
    public async Task GetTaskById_RegularUser_CanAccessOwnTask()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var taskId = Guid.NewGuid();

        var task = new TaskItem
        {
            Id = taskId,
            UserId = userId,
            Title = "My Task"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                taskId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        var expectedResponse = new TaskResponseDto();

        _mapperMock
            .Setup(x => x.Map<TaskResponseDto>(task))
            .Returns(expectedResponse);

        // Act
        var result = await _taskService.GetTaskByIdAsync(
            taskId,
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedResponse);
    }

    //Users can update their own task statuses
    [Fact]
    public async Task UpdateTask_RegularUser_CanUpdateOwnTask()
    {
        var userId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(userId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = TaskItemStatus.Pending
        };

        var dto = new UpdateTaskDto
        {
            Status = TaskItemStatus.Completed
        };

        _taskRepositoryMock
        .Setup(x => x.GetByIdWithDetailsAsync(
            task.Id,
            It.IsAny<CancellationToken>()))
        .ReturnsAsync(task);

        await _taskService.UpdateTaskAsync(
        task.Id,
        dto,
        CancellationToken.None);

        task.Status.Should().Be(TaskItemStatus.Completed);

        _taskRepositoryMock.Verify(
        x => x.SaveChangesAsync(
            It.IsAny<CancellationToken>()),
        Times.Once);
    }

    //Users cannot access another user's task
    [Fact]
    public async Task GetTaskById_RegularUser_CannotAccessOtherUsersTask()
    {
        // Arrange
        var currentUserId = Guid.NewGuid();
        var taskOwnerId = Guid.NewGuid();
        var taskId = Guid.NewGuid();

        var task = new TaskItem
        {
            Id = taskId,
            UserId = taskOwnerId,
            Title = "Another User's Task"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(currentUserId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                taskId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        // Act
        Func<Task> act = async () =>
            await _taskService.GetTaskByIdAsync(
                taskId,
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>();

        _mapperMock.Verify(
            x => x.Map<TaskResponseDto>(
                It.IsAny<TaskItem>()),
            Times.Never);
    }

    //Users cannot update other users' tasks
    [Fact]
    public async Task UpdateTask_RegularUser_CannotUpdateOtherUsersTask()
    {
        // Arrange
        var currentUserId = Guid.NewGuid();
        var taskOwnerId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(currentUserId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = taskOwnerId,
            Status = TaskItemStatus.Pending
        };

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                task.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        var dto = new UpdateTaskDto
        {
            Status = TaskItemStatus.Completed
        };

        // Act
        Func<Task> act = async () =>
            await _taskService.UpdateTaskAsync(
                task.Id,
                dto,
                CancellationToken.None);

        // Assert
        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>();

        task.Status.Should().Be(TaskItemStatus.Pending);

        _taskRepositoryMock.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    //Admin can access any task
    [Fact]
    public async Task GetTaskById_Admin_CanAccessOtherUsersTask()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var taskOwnerId = Guid.NewGuid();
        var taskId = Guid.NewGuid();

        var task = new TaskItem
        {
            Id = taskId,
            UserId = taskOwnerId,
            Title = "Regular User Task"
        };

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(adminId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(true);

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                taskId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        var expectedResponse = new TaskResponseDto();

        _mapperMock
            .Setup(x => x.Map<TaskResponseDto>(task))
            .Returns(expectedResponse);

        // Act
        var result = await _taskService.GetTaskByIdAsync(
            taskId,
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedResponse);
    }

    //Admins can update any task
    [Fact]
    public async Task UpdateTask_Admin_CanUpdateFullTask()
    {


        var adminId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(adminId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(true);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Old title",
            Status = TaskItemStatus.Pending
        };

        var dto = new UpdateTaskDto
        {
            Title = "Updated title",
            Status = TaskItemStatus.Completed,
            Priority = TaskPriority.High
        };

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                task.Id,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        _mapperMock
            .Setup(x => x.Map(dto, task))
            .Callback<UpdateTaskDto, TaskItem>((source, destination) =>
            {
                destination.Title = source.Title;
                destination.Status = source.Status;
                destination.Priority = source.Priority;
            });


        await _taskService.UpdateTaskAsync(
            task.Id,
            dto,
            CancellationToken.None);


        task.Title.Should().Be("Updated title");
        task.Status.Should().Be(TaskItemStatus.Completed);
        task.Priority.Should().Be(TaskPriority.High);
    }

    //Warning Serilog Test
    [Fact]
    public async Task UnauthorizedTaskUpdate_ShouldWriteWarningLog()
    {
        var currentUserId = Guid.NewGuid();
        var taskOwnerId = Guid.NewGuid();
        var taskId = Guid.NewGuid();

        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(currentUserId);

        _currentUserServiceMock
            .Setup(x => x.IsAdmin)
            .Returns(false);

        var task = new TaskItem
        {
            Id = taskId,
            UserId = taskOwnerId,
            Title = "Another user's task",
            Status = TaskItemStatus.Pending
        };

        _taskRepositoryMock
            .Setup(x => x.GetByIdWithDetailsAsync(
                taskId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        var dto = new UpdateTaskDto
        {
            Status = TaskItemStatus.Completed
        };

        Func<Task> act = async () =>
            await _taskService.UpdateTaskAsync(
                taskId,
                dto,
                CancellationToken.None);

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>();

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>(
                    (state, type) =>
                        state.ToString()!.Contains(
                            "attempted to update task")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
