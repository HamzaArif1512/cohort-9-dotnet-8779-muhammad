using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Services;

internal class TaskService : ITaskService
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
    public async Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto dto)
    {
        var task = _mapper.Map<TaskItem>(dto);

        await _taskRepository.AddAsync(task);

        await _taskRepository.SaveChangesAsync();

        return _mapper.Map<TaskResponseDto>(task);
    }

    //Retrieve all tasks
    public async Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync()
    {
        var tasks = await _taskRepository.GetAllAsync();

        return _mapper.Map<IEnumerable<TaskResponseDto>>(tasks);
    }

    //Retrieve task by id
    public async Task<IEnumerable<TaskResponseDto>> GetTaskByIdAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null)
        {
            return null;
        }
        return _mapper.Map<IEnumerable<TaskResponseDto>>(task);
    }

    //Update task
    public async Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto dto)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null)
        {
            return null;
        }
        _mapper.Map(dto, task);
        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync();
        return _mapper.Map<TaskResponseDto>(task);
    }

    //Delete task
    public async Task<bool> DeleteTaskAsync(int id)
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
