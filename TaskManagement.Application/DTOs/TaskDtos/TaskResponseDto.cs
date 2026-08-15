using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class TaskResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } 
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public TaskPriority Priority { get; set; }
    public TaskItemStatus Status { get; set; } 
    public string CategoryName { get; set; } = string.Empty;
    public string AssigneeName { get; set; } = string.Empty;
}
