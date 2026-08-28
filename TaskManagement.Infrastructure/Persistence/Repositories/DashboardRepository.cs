using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.DashboardDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    private IQueryable<TaskItem> getTaskQuery(Guid? userId)
    {
        var query = _context.TaskItems.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(t => t.UserId == userId.Value);
        }
        return query;
    }

    public async Task<int> GetTotalTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(cancellationToken);
    }

    public async Task<int> GetPendingTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(t => t.Status == TaskItemStatus.Pending, cancellationToken);
    }

    public async Task<int> GetInProgressTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(t => t.Status == TaskItemStatus.InProgress, cancellationToken);
    }

    public async Task<int> GetCompletedTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(t => t.Status == TaskItemStatus.Completed, cancellationToken);
    }

    public async Task<int> GetOverdueTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && t.Status != TaskItemStatus.Completed, cancellationToken);
    }

    public async Task<int> GetDueSoonTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        var now = DateTime.UtcNow;
        var soon = now.AddDays(7);
        return await getTaskQuery(userId).CountAsync(t => t.DueDate.HasValue && t.DueDate.Value >= now && t.DueDate.Value <= soon && t.Status != TaskItemStatus.Completed, cancellationToken);  
    }

    public async Task<int> GetHighPriorityTasksAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId).CountAsync(t => t.Priority == TaskPriority.High && t.Status != TaskItemStatus.Completed, cancellationToken);
    }

    public async Task<IEnumerable<TaskStatusSummaryDto>> GetTaskStatusSummaryAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId)
            .GroupBy(t => t.Status)
            .Select(g => new TaskStatusSummaryDto
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskPrioritySummaryDto>> GetTaskPrioritySummaryAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));
        return await getTaskQuery(userId)
            .GroupBy(t => t.Priority)
            .Select(g => new TaskPrioritySummaryDto
            {
                Priority = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetTotalUsersAsync(CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(cancellationToken));
        return await _context.Users.CountAsync(cancellationToken);
    }

    public async Task<int> GetActiveAssigneesAsync(CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(cancellationToken));
        return await _context.TaskItems
            .Select(t => t.UserId)
            .Distinct()
            .CountAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskAssigneeSummaryDto>> GetTaskAssigneeSummaryAsync(Guid? userId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrEmpty(nameof(userId));

        return await _context.TaskItems
            .Include(t => t.Users)
            .GroupBy(t => new
            {
                t.UserId,
                t.Users.Name
            })
            .Select(g => new TaskAssigneeSummaryDto
            {
                UserId = g.Key.UserId,
                UserName = g.Key.Name,
                TaskCount = g.Count()
            })
            .OrderByDescending(x => x.TaskCount)
            .ToListAsync(cancellationToken);
    }
}
