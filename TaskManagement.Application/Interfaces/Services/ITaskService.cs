using TaskManagement.Application.DTOs.TaskDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface ITaskService
{
    public Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken);

    public Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync();

    public Task<TaskResponseDto?> GetTaskByIdAsync(Guid id);
    public Task<TaskResponseDto?> UpdateTaskAsync(Guid id, UpdateTaskDto dto);
    public Task<bool> DeleteTaskAsync(Guid id);
}
