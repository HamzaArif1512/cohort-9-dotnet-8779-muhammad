using Microsoft.Extensions.Logging;
using AutoMapper;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Services;

public class TaskService : ITaskService
{
    private readonly IMapper _mapper;
    private readonly ILogger<TaskService> _logger;
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUserService _currentUserService;

    public TaskService(
        ITaskRepository taskrepository,
        IMapper mapper,
        ICurrentUserService currentUserService,
        ILogger<TaskService> logger )
    {
        _taskRepository = taskrepository;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _logger = logger;
    }


    //Create
    public async Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken)
    {
        var task = _mapper.Map<TaskItem>(dto);

        task.UserId = dto.AssigneeId;

        task.Status = TaskItemStatus.Pending;
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.AddAsync(task);

        await _taskRepository.SaveChangesAsync(cancellationToken);

        var createdTask = await _taskRepository.GetByIdWithDetailsAsync(task.Id, cancellationToken);

        if(createdTask is null)
        {
            _logger.LogError(
                "Task creation failed for task with title {TaskTitle}.",
                dto.Title);

            throw new InvalidOperationException("Task creation failed.");
        }

        return _mapper.Map<TaskResponseDto>(createdTask);
    }

    //Retrieve all tasks
    public async Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync(CancellationToken cancellationToken)
    {
        IEnumerable<TaskItem> tasks;

        if(_currentUserService.IsAdmin)
        {
            tasks = await _taskRepository.GetAllWithDetailsAsync(cancellationToken);
        }
        else
        {
            var userId = _currentUserService.UserId;

            if(userId is null)
            {
                _logger.LogWarning(
                    "User {UserId} does not exist.",
                    userId);

                throw new UnauthorizedAccessException("Unable to determine the current user.");
            }

         

            tasks = await _taskRepository.GetAllByUserIdWithDetailsAsync(userId.Value, cancellationToken);
        }

        return _mapper.Map<IEnumerable<TaskResponseDto>>(tasks);
    }


    //Retrieve task by id
    public async Task<TaskResponseDto?> GetTaskByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (task == null)
        {
            _logger.LogWarning(
                "Task with ID {TaskId} not found.",
                id);

            return null;
        }

        if(!_currentUserService.IsAdmin && task.UserId != _currentUserService.UserId)
        {
            _logger.LogWarning(
                "User {UserId} attempted to access task {TaskId} without authorization.",
                _currentUserService.UserId,
                id);

            throw new UnauthorizedAccessException("You are not authorized to access this task.");
        }

        return _mapper.Map<TaskResponseDto>(task);
    }

    //Update task
    public async Task<TaskResponseDto?> UpdateTaskAsync(
        Guid id,
        UpdateTaskDto dto,
        CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(
            id,
            cancellationToken);

        if (task == null)
        {
            return null;
        }

        var currentUserId = _currentUserService.UserId;

        if (currentUserId is null) 
        {
            _logger.LogWarning(
                "User {UserId} does not exist.",
                currentUserId);

            throw new UnauthorizedAccessException("Unable to determine the current user.");
        }

        if (_currentUserService.IsAdmin)
        {
            _mapper.Map(dto, task);
        }
        else
        {
            if(task.UserId != currentUserId.Value)
            {
                _logger.LogWarning(
                    "User {UserId} attempted to update task {TaskId} without authorization.",
                    currentUserId,
                    id);

                throw new UnauthorizedAccessException("You are not authorized to update this task.");
            }
            task.Status = dto.Status;
        }


        task.UpdatedAt = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync(cancellationToken);

        var updatedTask = await _taskRepository.GetByIdWithDetailsAsync(
            id,
            cancellationToken);

        return _mapper.Map<TaskResponseDto>(updatedTask);
    }

    //Update task status only
    public async Task<TaskResponseDto?> UpdateTaskStatusAsync(
        Guid id,
        UpdateTaskStatusDto dto,
        CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(
            id,
            cancellationToken);

        if (task == null)
        {
            return null;
        }

        var currentUserId = _currentUserService.UserId;

        if (currentUserId is null)
        {
            _logger.LogWarning(
                "Unable to determine the current authenticated user.");

            throw new UnauthorizedAccessException(
                "Unable to determine the current user.");
        }

        if (!_currentUserService.IsAdmin &&
            task.UserId != currentUserId.Value)
        {
            _logger.LogWarning(
                "User {UserId} attempted to update status of task {TaskId} without authorization.",
                currentUserId,
                id);

            throw new UnauthorizedAccessException(
                "You are not authorized to update this task.");
        }

        task.Status = dto.Status;
        task.UpdatedAt = DateTime.UtcNow;

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync(cancellationToken);

        var updatedTask = await _taskRepository.GetByIdWithDetailsAsync(
            id,
            cancellationToken);

        return _mapper.Map<TaskResponseDto>(updatedTask);
    }

    //Apply custom filter to retrieve tasks
    public async Task<IEnumerable<TaskResponseDto>> SearchTasksAsync(TaskSearchDto filters, CancellationToken cancellationToken)
    {
        if (filters == null)
        {
            throw new ArgumentNullException(nameof(filters));
        }

        Guid? userId = null;

        if(!_currentUserService.IsAdmin)
        {
            userId = _currentUserService.UserId;
            if (userId is null)
            {
                _logger.LogWarning(
                    "User {UserId} does not exist.",
                    userId);
                throw new UnauthorizedAccessException("Unable to determine the current user.");
            }
        }

        var tasks = await _taskRepository.SearchAsync(filters, userId, cancellationToken);

        return _mapper.Map<IEnumerable<TaskResponseDto>>(tasks);
    }

    //Delete task
    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null)
        {
            return false;
        }
        _taskRepository.Remove(task);
        await _taskRepository.SaveChangesAsync();
        return true;
    }
}
