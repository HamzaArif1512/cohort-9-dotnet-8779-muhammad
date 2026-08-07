using TaskManagement.Application.DTOs.TaskDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface ITaskService
{
    public Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto);

    public Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync();

    public Task<TaskResponseDto?> GetTaskByIdAsync(int id);
    public Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto dto);
    public Task<bool> DeleteTaskAsync(int id);
}
