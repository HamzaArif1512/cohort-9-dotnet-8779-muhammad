using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string Priority { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Guid AssigneeId { get; set; }

}
