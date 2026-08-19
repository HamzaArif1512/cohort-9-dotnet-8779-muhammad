using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.DashboardDtos;

public class TaskStatusSummaryDto
{
    public TaskItemStatus Status { get; set; }
    public int Count { get; set; }
}
