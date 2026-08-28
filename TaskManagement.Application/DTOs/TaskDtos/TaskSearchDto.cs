using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs.TaskDtos;

public class TaskSearchDto
{
    public string? Keyword { get; set; }
    public Guid[]? AssigneeIds { get; set; }
    public TaskItemStatus[]? Statuses { get; set; }
    public TaskPriority[]? Priorities { get; set; }
    public int[]? CategoryIds { get; set; }
    public DateTime? DateDueFrom { get; set; }
    public DateTime? DateDueTo { get; set; }
}
