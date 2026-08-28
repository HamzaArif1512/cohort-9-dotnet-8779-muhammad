using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.DashboardDtos;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.API.Tests.Controllers;

public class DashboardControllerTests
{
    private readonly Mock<IDashboardService> _dashboardServiceMock;
    private readonly DashboardController _controller;

    public DashboardControllerTests()
    {
        _dashboardServiceMock = new Mock<IDashboardService>();

        _controller = new DashboardController(
            _dashboardServiceMock.Object);
    }

    [Fact]
    public async Task GetUserDashboard_ReturnsOkWithDashboard()
    {
        // Arrange
        var dashboard = new UserDashboardDto();

        _dashboardServiceMock
            .Setup(x => x.GetUserDashboardAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dashboard);

        // Act
        var result = await _controller.GetUserDashboard(
            CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = result.Result as OkObjectResult;

        okResult!.Value.Should().BeSameAs(dashboard);
    }

    [Fact]
    public async Task GetUserDashboard_CallsDashboardService()
    {
        // Arrange
        var dashboard = new UserDashboardDto();

        _dashboardServiceMock
            .Setup(x => x.GetUserDashboardAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dashboard);

        // Act
        await _controller.GetUserDashboard(
            CancellationToken.None);

        // Assert
        _dashboardServiceMock.Verify(
            x => x.GetUserDashboardAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetAdminDashboard_ReturnsOkWithDashboard()
    {
        // Arrange
        var dashboard = new AdminDashboardDto();

        _dashboardServiceMock
            .Setup(x => x.GetAdminDashboardAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dashboard);

        // Act
        var result = await _controller.GetAdminDashboard(
            CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();

        var okResult = result.Result as OkObjectResult;

        okResult!.Value.Should().BeSameAs(dashboard);
    }

    [Fact]
    public async Task GetAdminDashboard_CallsDashboardService()
    {
        // Arrange
        var dashboard = new AdminDashboardDto();

        _dashboardServiceMock
            .Setup(x => x.GetAdminDashboardAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(dashboard);

        // Act
        await _controller.GetAdminDashboard(
            CancellationToken.None);

        // Assert
        _dashboardServiceMock.Verify(
            x => x.GetAdminDashboardAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
