using TaskManagement.Application.DTOs.DashboardDtos;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Interfaces.Repositories;
using System.Security.Cryptography.X509Certificates;

namespace TaskManagement.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly ICurrentUserService _currentUserService;

    public DashboardService(IDashboardRepository dashboardRepository, ICurrentUserService currentUserService)
    {
        _dashboardRepository = dashboardRepository;
        _currentUserService = currentUserService;
    }


    //User Dashboard method
    public async Task<UserDashboardDto> GetUserDashboardAsync(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        var totalTasks = await _dashboardRepository.GetTotalTasksAsync(userId, cancellationToken);

        var completedTasks = await _dashboardRepository.GetCompletedTasksAsync(userId, cancellationToken);

        var completionRate = totalTasks == 0 ? 0 : (double)completedTasks / totalTasks * 100;

        return new UserDashboardDto
        {
            TotalTasks = totalTasks,
            PendingTasks = await _dashboardRepository.GetPendingTasksAsync(userId, cancellationToken),
            InProgressTasks = await _dashboardRepository.GetInProgressTasksAsync(userId, cancellationToken),
            CompletedTasks = completedTasks,
            OverdueTasks = await _dashboardRepository.GetOverdueTasksAsync(userId, cancellationToken),
            DueSoonTasks = await _dashboardRepository.GetDueSoonTasksAsync(userId, cancellationToken),
            HighPriorityTasks = await _dashboardRepository.GetHighPriorityTasksAsync(userId, cancellationToken),
            CompletionRate = completionRate,
            TaskByStatus = await _dashboardRepository.GetTaskStatusSummaryAsync(userId, cancellationToken),
            TaskByPriority = await _dashboardRepository.GetTaskPrioritySummaryAsync(userId, cancellationToken)
        };
    }

    //Admin Dashboard method
    public async Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken cancellationToken)
    {
        var totalUsers = await _dashboardRepository.GetTotalUsersAsync(cancellationToken);
        var activeAssignees = await _dashboardRepository.GetActiveAssigneesAsync(cancellationToken);
        var totalTasks = await _dashboardRepository.GetTotalTasksAsync(null, cancellationToken);
        var completedTasks = await _dashboardRepository.GetCompletedTasksAsync(null, cancellationToken);
        var completionRate = totalTasks == 0 ? 0 : (double)completedTasks / totalTasks * 100;
        return new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            ActiveAssignees = activeAssignees,
            TotalTasks = totalTasks,
            PendingTasks = await _dashboardRepository.GetPendingTasksAsync(null, cancellationToken),
            InProgressTasks = await _dashboardRepository.GetInProgressTasksAsync(null, cancellationToken),
            CompletedTasks = completedTasks,
            OverdueTasks = await _dashboardRepository.GetOverdueTasksAsync(null, cancellationToken),
            DueSoonTasks = await _dashboardRepository.GetDueSoonTasksAsync(null, cancellationToken),
            HighPriorityTasks = await _dashboardRepository.GetHighPriorityTasksAsync(null, cancellationToken),
            CompletionRate = completionRate,
            TaskByStatus = await _dashboardRepository.GetTaskStatusSummaryAsync(null, cancellationToken),
            TaskByPriority = await _dashboardRepository.GetTaskPrioritySummaryAsync(null, cancellationToken),
            TaskByAssignee = await _dashboardRepository.GetTaskAssigneeSummaryAsync(null, cancellationToken)
        };
    }
}
