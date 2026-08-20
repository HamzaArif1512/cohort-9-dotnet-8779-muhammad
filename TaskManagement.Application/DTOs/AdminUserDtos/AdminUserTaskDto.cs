using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.AdminUserDtos;

public class AdminUserTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; } = null;
    public TaskItemStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; } = null;
}
