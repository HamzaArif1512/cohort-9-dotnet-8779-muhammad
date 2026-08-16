using System;
using System.Collections.Generic;
using System.Text;
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
    private readonly ITaskRepository _taskRepository;

    public TaskService(
        ITaskRepository taskrepository,
        IMapper mapper)
    {
        _taskRepository = taskrepository;
        _mapper = mapper;
    }


    //Create
    public async Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken)
    {
        var task = _mapper.Map<TaskItem>(dto);

        task.Status = TaskItemStatus.Pending;
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.AddAsync(task);

        await _taskRepository.SaveChangesAsync();

        var createdTask = await _taskRepository.GetByIdWithDetailsAsync(task.Id, cancellationToken);

        if(createdTask is null)
        {
            throw new InvalidOperationException("Task creation failed.");
        }

        return _mapper.Map<TaskResponseDto>(createdTask);
    }

    //Retrieve all tasks
    public async Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync(CancellationToken cancellationToken)
    {
        var tasks = await _taskRepository.GetAllWithDetailsAsync(cancellationToken);

        return _mapper.Map<IEnumerable<TaskResponseDto>>(tasks);
    }


    //Retrieve task by id
    public async Task<TaskResponseDto?> GetTaskByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (task == null)
        {
            return null;
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

        _mapper.Map(dto, task);

        _taskRepository.Update(task);

        await _taskRepository.SaveChangesAsync(cancellationToken);

        var updatedTask = await _taskRepository.GetByIdWithDetailsAsync(
            id,
            cancellationToken);

        return _mapper.Map<TaskResponseDto>(updatedTask);
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
