using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Infrastructure.Persistence.Repositories;

namespace TaskManagement.Infrastructure.Tests.Repositories;

public class DashboardRepositoryTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private static async Task SeedDashboardDataAsync(
    ApplicationDbContext context)
    {
        var user1 = new User(
            "Hamza",
            "hamza@test.com",
            UserRole.RegularUser);

        var user2 = new User(
            "Ahmed",
            "ahmed@test.com",
            UserRole.RegularUser);

        var category = new Category
        {
            Id = 100,
            Name = "Development"
        };

        context.Users.AddRange(user1, user2);
        context.Categories.Add(category);

        var now = DateTime.UtcNow;

        context.TaskItems.AddRange(

            // User 1 - Pending, High
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Pending High Task",
                UserId = user1.Id,
                CategoryId = category.Id,
                Status = TaskItemStatus.Pending,
                Priority = TaskPriority.High,
                DueDate = now.AddDays(10)
            },

            // User 1 - In Progress, Medium
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "In Progress Task",
                UserId = user1.Id,
                CategoryId = category.Id,
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.Medium,
                DueDate = now.AddDays(5)
            },

            // User 1 - Completed
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Completed Task",
                UserId = user1.Id,
                CategoryId = category.Id,
                Status = TaskItemStatus.Completed,
                Priority = TaskPriority.Low,
                DueDate = now.AddDays(-2)
            },

            // User 1 - Overdue
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Overdue Task",
                UserId = user1.Id,
                CategoryId = category.Id,
                Status = TaskItemStatus.Pending,
                Priority = TaskPriority.High,
                DueDate = now.AddDays(-3)
            },

            // User 2 - Pending
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "User 2 Task",
                UserId = user2.Id,
                CategoryId = category.Id,
                Status = TaskItemStatus.Pending,
                Priority = TaskPriority.Medium,
                DueDate = now.AddDays(15)
            });

        await context.SaveChangesAsync();
    }

    //Get total tasks
    [Fact]
    public async Task GetTotalTasksAsync_WithUserId_ReturnsUsersTaskCount()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetTotalTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(4);
    }

    //get total tasks without user id
    [Fact]
    public async Task GetTotalTasksAsync_WithoutUserId_ReturnsAllTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var repository = new DashboardRepository(context);

        var result = await repository.GetTotalTasksAsync(
            null,
            CancellationToken.None);

        result.Should().Be(5);
    }

    //get pending tasks
    [Fact]
    public async Task GetPendingTasksAsync_WithUserId_ReturnsUsersPendingTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetPendingTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(2);
    }

    //get in progress tasks
    [Fact]
    public async Task GetInProgressTasksAsync_WithUserId_ReturnsUsersInProgressTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetInProgressTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(1);
    }

    //get completed tasks
    [Fact]
    public async Task GetCompletedTasksAsync_WithUserId_ReturnsUsersCompletedTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetCompletedTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(1);
    }

    //get overdue tasks
    [Fact]
    public async Task GetOverdueTasksAsync_WithUserId_ReturnsOnlyActiveOverdueTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetOverdueTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(1);
    }

    //get tasks due soon
    [Fact]
    public async Task GetDueSoonTasksAsync_WithUserId_ReturnsTasksDueWithinSevenDays()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetDueSoonTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(1);
    }

    //get high priority tasks
    [Fact]
    public async Task GetHighPriorityTasksAsync_WithUserId_ReturnsUsersHighPriorityTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = await repository.GetHighPriorityTasksAsync(
            user.Id,
            CancellationToken.None);

        result.Should().Be(2);
    }

    //get tasks by status
    [Fact]
    public async Task GetTasksByStatusAsync_WithUserId_ReturnsCorrectStatusBreakdown()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = (await repository.GetTaskStatusSummaryAsync(
            user.Id,
            CancellationToken.None)).ToList();

        result.Should().HaveCount(3);

        result.Single(x => x.Status == TaskItemStatus.Pending)
            .Count.Should().Be(2);

        result.Single(x => x.Status == TaskItemStatus.InProgress)
            .Count.Should().Be(1);

        result.Single(x => x.Status == TaskItemStatus.Completed)
            .Count.Should().Be(1);
    }

    //get tasks by priority
    [Fact]
    public async Task GetTasksByPriorityAsync_WithUserId_ReturnsCorrectPriorityBreakdown()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var user = await context.Users
            .SingleAsync(u => u.Email == "hamza@test.com");

        var repository = new DashboardRepository(context);

        var result = (await repository.GetTaskPrioritySummaryAsync(
            user.Id,
            CancellationToken.None)).ToList();

        result.Should().HaveCount(3);

        result.Single(x => x.Priority == TaskPriority.High)
            .Count.Should().Be(2);

        result.Single(x => x.Priority == TaskPriority.Medium)
            .Count.Should().Be(1);

        result.Single(x => x.Priority == TaskPriority.Low)
            .Count.Should().Be(1);
    }

    //get total users
    [Fact]
    public async Task GetTotalUsersAsync_ReturnsAllUsers()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var repository = new DashboardRepository(context);

        var result = await repository.GetTotalUsersAsync(
            CancellationToken.None);

        result.Should().Be(2);
    }

    //get active assignees
    [Fact]
    public async Task GetActiveAssigneesAsync_ReturnsUsersWithAssignedTasks()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var repository = new DashboardRepository(context);

        var result = await repository.GetActiveAssigneesAsync(
            CancellationToken.None);

        result.Should().Be(2);
    }

    //get all tasks by assignee
    [Fact]
    public async Task GetTasksByAssigneeAsync_ReturnsCorrectTaskCounts()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var repository = new DashboardRepository(context);

        var result = (await repository.GetTaskAssigneeSummaryAsync(
            null,
            CancellationToken.None)).ToList();

        result.Should().HaveCount(2);

        result.Single(x => x.UserName == "Hamza")
            .TaskCount.Should().Be(4);

        result.Single(x => x.UserName == "Ahmed")
            .TaskCount.Should().Be(1);
    }

    //system wide breakdown for admins
    [Fact]
    public async Task GetTasksByStatusAsync_WithoutUserId_ReturnsSystemWideBreakdown()
    {
        await using var context = CreateDbContext();

        await SeedDashboardDataAsync(context);

        var repository = new DashboardRepository(context);

        var result = (await repository.GetTaskStatusSummaryAsync(
            null,
            CancellationToken.None)).ToList();

        result.Should().HaveCount(3);

        result.Single(x => x.Status == TaskItemStatus.Pending)
            .Count.Should().Be(3);

        result.Single(x => x.Status == TaskItemStatus.InProgress)
            .Count.Should().Be(1);

        result.Single(x => x.Status == TaskItemStatus.Completed)
            .Count.Should().Be(1);
    }
}
