using TaskManagement.Application.DTOs.DashboardDtos;

namespace TaskManagement.Application.Interfaces.Repositories;

public interface IDashboardRepository
{
    public Task<int> GetTotalTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetPendingTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetInProgressTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetCompletedTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetOverdueTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetDueSoonTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetHighPriorityTasksAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<int> GetTotalUsersAsync(CancellationToken cancellationToken);
    public Task<int> GetActiveAssigneesAsync(CancellationToken cancellationToken);
    public Task<IEnumerable<TaskStatusSummaryDto>> GetTaskStatusSummaryAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<IEnumerable<TaskPrioritySummaryDto>> GetTaskPrioritySummaryAsync(Guid? userId, CancellationToken cancellationToken);
    public Task<IEnumerable<TaskAssigneeSummaryDto>> GetTaskAssigneeSummaryAsync(Guid? userId, CancellationToken cancellationToken);
}


