using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using TaskManagement.Application.DTOs.DashboardDtos;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IDashboardRepository> _dashboardRepositoryMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
   
    private readonly DashboardService _service;


    public DashboardServiceTests()
    {
        _dashboardRepositoryMock = new Mock<IDashboardRepository>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();

        _service = new DashboardService(
            _dashboardRepositoryMock.Object,
            _currentUserServiceMock.Object
        );
    }

    //use a fixed userId for these tests
    private readonly Guid _userId = Guid.NewGuid();

    //verify user dashboard returns correct metrics based on mocked repository data
    [Fact]
    public async Task GetUserDashboardAsync_ReturnsCorrectUserMetrics()
    {
        // Arrange
        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(_userId);

        _dashboardRepositoryMock
            .Setup(x => x.GetTotalTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(4);

        _dashboardRepositoryMock
            .Setup(x => x.GetPendingTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _dashboardRepositoryMock
            .Setup(x => x.GetInProgressTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetCompletedTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetOverdueTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetDueSoonTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetHighPriorityTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskStatusSummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskStatusSummaryDto>());

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskPrioritySummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskPrioritySummaryDto>());

        // Act
        var result = await _service.GetUserDashboardAsync(
            CancellationToken.None);

        // Assert
        result.Should().NotBeNull();

        result.TotalTasks.Should().Be(4);
        result.PendingTasks.Should().Be(2);
        result.InProgressTasks.Should().Be(1);
        result.CompletedTasks.Should().Be(1);
        result.OverdueTasks.Should().Be(1);
        result.DueSoonTasks.Should().Be(1);
        result.HighPriorityTasks.Should().Be(2);

        result.CompletionRate.Should().Be(25);
    }


    //service uses the correct user
    [Fact]
    public async Task GetUserDashboardAsync_UsesCurrentUserId()
    {
        // Arrange
        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(_userId);

        _dashboardRepositoryMock
            .Setup(x => x.GetTotalTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetCompletedTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetPendingTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetInProgressTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetOverdueTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetDueSoonTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetHighPriorityTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskStatusSummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskStatusSummaryDto>());

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskPrioritySummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskPrioritySummaryDto>());

        // Act
        await _service.GetUserDashboardAsync(CancellationToken.None);

        // Assert
        _dashboardRepositoryMock.Verify(
            x => x.GetTotalTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //correct completion rate calcuation check
    [Fact]
    public async Task GetUserDashboardAsync_CalculatesCompletionRateCorrectly()
    {
        // Arrange
        _currentUserServiceMock
            .Setup(x => x.UserId)
            .Returns(_userId);

        SetupUserDashboardDefaults(
            totalTasks: 10,
            completedTasks: 7);

        // Act
        var result = await _service.GetUserDashboardAsync(
            CancellationToken.None);

        // Assert
        result.CompletionRate.Should().Be(70);
    }

    //admin-dashboard system wide check
    [Fact]
    public async Task GetAdminDashboardAsync_ReturnsSystemWideMetrics()
    {
        // Arrange
        _dashboardRepositoryMock
            .Setup(x => x.GetTotalUsersAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _dashboardRepositoryMock
            .Setup(x => x.GetActiveAssigneesAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _dashboardRepositoryMock
            .Setup(x => x.GetTotalTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        _dashboardRepositoryMock
            .Setup(x => x.GetPendingTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(3);

        _dashboardRepositoryMock
            .Setup(x => x.GetInProgressTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetCompletedTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetOverdueTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetDueSoonTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _dashboardRepositoryMock
            .Setup(x => x.GetHighPriorityTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskStatusSummaryAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskStatusSummaryDto>());

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskPrioritySummaryAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskPrioritySummaryDto>());

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskAssigneeSummaryAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskAssigneeSummaryDto>());

        // Act
        var result = await _service.GetAdminDashboardAsync(
            CancellationToken.None);

        // Assert
        result.TotalUsers.Should().Be(2);
        result.ActiveAssignees.Should().Be(2);
        result.TotalTasks.Should().Be(5);
        result.PendingTasks.Should().Be(3);
        result.InProgressTasks.Should().Be(1);
        result.CompletedTasks.Should().Be(1);
        result.OverdueTasks.Should().Be(1);
        result.DueSoonTasks.Should().Be(1);
        result.HighPriorityTasks.Should().Be(2);

        result.CompletionRate.Should().Be(20);
    }

    //verify admin uses system-wide queries
    [Fact]
    public async Task GetAdminDashboardAsync_UsesSystemWideMetrics()
    {
        // Arrange
        SetupAdminDashboardDefaults();

        // Act
        await _service.GetAdminDashboardAsync(
            CancellationToken.None);

        // Assert
        _dashboardRepositoryMock.Verify(
            x => x.GetTotalTasksAsync(
                null,
                It.IsAny<CancellationToken>()),
            Times.Once);

        _dashboardRepositoryMock.Verify(
            x => x.GetPendingTasksAsync(
                null,
                It.IsAny<CancellationToken>()),
            Times.Once);

        _dashboardRepositoryMock.Verify(
            x => x.GetCompletedTasksAsync(
                null,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    //helper function for calculation
    private void SetupUserDashboardDefaults(
   int totalTasks,
   int completedTasks)
    {
        _dashboardRepositoryMock
            .Setup(x => x.GetTotalTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(totalTasks);

        _dashboardRepositoryMock
            .Setup(x => x.GetCompletedTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(completedTasks);

        _dashboardRepositoryMock
            .Setup(x => x.GetPendingTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetInProgressTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetOverdueTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetDueSoonTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetHighPriorityTasksAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskStatusSummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskStatusSummaryDto>());

        _dashboardRepositoryMock
            .Setup(x => x.GetTaskPrioritySummaryAsync(
                _userId,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskPrioritySummaryDto>());
    }

    private void SetupAdminDashboardDefaults()
    {
        _dashboardRepositoryMock
            .Setup(x => x.GetTotalTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _dashboardRepositoryMock
            .Setup(x => x.GetPendingTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        _dashboardRepositoryMock
            .Setup(x => x.GetCompletedTasksAsync(
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
    }


}
