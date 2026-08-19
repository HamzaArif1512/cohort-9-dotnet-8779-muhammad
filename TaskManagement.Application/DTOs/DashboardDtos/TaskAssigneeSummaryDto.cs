namespace TaskManagement.Application.DTOs.DashboardDtos;

public class TaskAssigneeSummaryDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int TaskCount { get; set; }
}
