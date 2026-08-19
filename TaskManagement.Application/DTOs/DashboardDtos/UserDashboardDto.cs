namespace TaskManagement.Application.DTOs.DashboardDtos;

public class UserDashboardDto
{
    public int TotalTasks { get; set; }
    public int PendingTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int DueSoonTasks { get; set; }
    public int HighPriorityTasks { get; set; }
    public double CompletionRate { get; set; }
    public IEnumerable<TaskStatusSummaryDto> TaskByStatus { get; set; } = [];
    public IEnumerable<TaskPrioritySummaryDto> TaskByPriority { get; set; } = [];
}
