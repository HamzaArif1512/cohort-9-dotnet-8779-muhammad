using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class UpdateTaskStatusDto
{
    public TaskItemStatus Status { get; set; }
}
