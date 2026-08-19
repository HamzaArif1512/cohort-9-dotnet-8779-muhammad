using TaskManagement.Domain.Enums;
namespace TaskManagement.Application.DTOs.DashboardDtos;


public class TaskPrioritySummaryDto
{
    public TaskPriority Priority { get; set; }
    public int Count { get; set; }
}
