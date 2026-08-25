using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Infrastructure.Persistence.Repositories;

namespace TaskManagement.Infrastructure.Tests.Repositories;

public class TaskRepositoryTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private static async Task SeedTasksAsync(ApplicationDbContext context)
    {
        var user1 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Hamza",
            Email = "hamza@test.com",
            Role = UserRole.RegularUser
        };

        var user2 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@test.com",
            Role = UserRole.Admin
        };

        var category = new Category
        {
            Id = 100,
            Name = "Development"
        };

        context.Users.AddRange(user1, user2);
        context.Categories.Add(category);

        var task1 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Build API",
            Description = "Build the task API",
            UserId = user1.Id,
            CategoryId = category.Id,
            Status = TaskItemStatus.Pending,
            Priority = TaskPriority.High,
            DueDate = DateTime.UtcNow.AddDays(5)
        };

        var task2 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Write Tests",
            Description = "Write repository tests",
            UserId = user1.Id,
            CategoryId = category.Id,
            Status = TaskItemStatus.Completed,
            Priority = TaskPriority.Medium,
            DueDate = DateTime.UtcNow.AddDays(3)
        };

        var task3 = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = "Documentation",
            Description = "Write documentation",
            UserId = user2.Id,
            CategoryId = category.Id,
            Status = TaskItemStatus.Pending,
            Priority = TaskPriority.Low,
            DueDate = DateTime.UtcNow.AddDays(10)
        };

        context.TaskItems.AddRange(task1, task2, task3);

        await context.SaveChangesAsync();
    }




    [Fact]
    public async Task SearchAsync_WithNoFilters_ReturnsAllTasks()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        // Check what the context itself sees
        var directTasks = await context.TaskItems.ToListAsync();

        directTasks.Should().HaveCount(3);

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto();

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
    }


    [Fact]
    public async Task SeedTasks_ShouldCreateExpectedData()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        // Act
        var tasks = await context.TaskItems
            .OrderBy(t => t.Title)
            .ToListAsync();

        // Assert
        tasks.Should().HaveCount(3);

        tasks.Should().ContainSingle(t =>
            t.Title == "Build API" &&
            t.Description == "Build the task API" &&
            t.CategoryId == 100 &&
            t.Status == TaskItemStatus.Pending &&
            t.Priority == TaskPriority.High);

        tasks.Should().ContainSingle(t =>
            t.Title == "Write Tests" &&
            t.Description == "Write repository tests" &&
            t.CategoryId == 100 &&
            t.Status == TaskItemStatus.Completed &&
            t.Priority == TaskPriority.Medium);

        tasks.Should().ContainSingle(t =>
            t.Title == "Documentation" &&
            t.Description == "Write documentation" &&
            t.CategoryId == 100 &&
            t.Status == TaskItemStatus.Pending &&
            t.Priority == TaskPriority.Low);
    }

    //keyword test
    [Fact]
    public async Task SearchAsync_WithKeyword_ReturnsMatchingTasks()
    {
        // Arrange
        await using var context = CreateDbContext();
        await SeedTasksAsync(context);

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            Keyword = "Write"
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    // Status filtering
    [Fact]
    public async Task SearchAsync_WithStatus_ReturnsOnlyMatchingStatus()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            Statuses = new[] { TaskItemStatus.Completed }
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);

        result.Should().OnlyContain(task =>
            task.Status == TaskItemStatus.Completed);
    }

    // Priority filtering
    [Fact]
    public async Task SearchAsync_WithPriority_ReturnsOnlyMatchingPriority()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            Priorities = new[] { TaskPriority.High }
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);

        result.Should().OnlyContain(task =>
            task.Priority == TaskPriority.High);
    }

    // Assignee filtering
    [Fact]
    public async Task SearchAsync_WithAssignee_ReturnsOnlyAssignedTasks()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var user1 = await context.Users
            .FirstAsync(u => u.Email == "hamza@test.com");

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            AssigneeIds = new[] { user1.Id }
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);

        result.Should().OnlyContain(task =>
            task.UserId == user1.Id);
    }

    // Category filtering
    [Fact]
    public async Task SearchAsync_WithCategory_ReturnsOnlyMatchingCategory()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var category = await context.Categories
            .FirstAsync(c => c.Name == "Development");

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            CategoryIds = new[] { category.Id }
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);

        result.Should().OnlyContain(task =>
            task.CategoryId == category.Id);
    }

    //test due date range
    [Fact]
    public async Task SearchAsync_WithDueDateRange_ReturnsTasksWithinRange()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var targetTask = await context.TaskItems
            .FirstAsync(t => t.Title == "Build API");

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            DateDueFrom = targetTask.DueDate!.Value.AddMinutes(-1),
            DateDueTo = targetTask.DueDate!.Value.AddMinutes(1)
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().ContainSingle();

        result.Should().OnlyContain(task =>
            task.Id == targetTask.Id);
    }

    //regular user restriction filter
    [Fact]
    public async Task SearchAsync_WithUserId_ReturnsOnlyUsersTasks()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var user = await context.Users
            .FirstAsync(u => u.Email == "hamza@test.com");

        var repository = new TaskRepository(context);

        // Act
        var result = await repository.SearchAsync(
            new TaskSearchDto(),
            user.Id,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);

        result.Should().OnlyContain(task =>
            task.UserId == user.Id);
    }

    //admin filter
    [Fact]
    public async Task SearchAsync_WithoutUserId_ReturnsTasksForAllUsers()
    {
        // Arrange
        await using var context = CreateDbContext();
        await SeedTasksAsync(context);

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto();

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
    }

    // multiple filters
    [Fact]
    public async Task SearchAsync_WithMultipleFilters_ReturnsOnlyMatchingTasks()
    {
        // Arrange
        await using var context = CreateDbContext();

        await SeedTasksAsync(context);

        var targetTask = await context.TaskItems
            .FirstAsync(t => t.Title == "Build API");

        var repository = new TaskRepository(context);

        var filters = new TaskSearchDto
        {
            Keyword = "API",
            Statuses = new[] { targetTask.Status },
            Priorities = new[] { targetTask.Priority },
            CategoryIds = new[] { targetTask.CategoryId },
            AssigneeIds = new[] { targetTask.UserId }
        };

        // Act
        var result = await repository.SearchAsync(
            filters,
            null,
            CancellationToken.None);

        // Assert
        result.Should().ContainSingle();

        result.Should().OnlyContain(task =>
            task.Id == targetTask.Id);
    }
}
