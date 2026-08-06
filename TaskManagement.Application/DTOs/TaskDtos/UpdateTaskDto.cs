using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int AssigneeId { get; set; }
}
