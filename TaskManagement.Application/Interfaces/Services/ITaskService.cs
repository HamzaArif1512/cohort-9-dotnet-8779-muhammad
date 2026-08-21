using TaskManagement.Application.DTOs.TaskDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface ITaskService
{
    public Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken);

    public Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync(CancellationToken cancellationToken);

    public Task<TaskResponseDto?> GetTaskByIdAsync(Guid id, CancellationToken cancellationToken);
    public Task<TaskResponseDto?> UpdateTaskAsync(
        Guid id,
        UpdateTaskDto dto,
        Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken);
    public Task<bool> DeleteTaskAsync(Guid id);
}
