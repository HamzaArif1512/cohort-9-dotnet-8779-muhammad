using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class TaskSearchDto
{
    public string? Keyword { get; set; }
    public Guid? AssigneeId { get; set;  }
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public int? CategoryId { get; set;  }
    public DateTime? DateDueFrom { get; set; }
    public DateTime? DateDueTo { get; set; }
}
