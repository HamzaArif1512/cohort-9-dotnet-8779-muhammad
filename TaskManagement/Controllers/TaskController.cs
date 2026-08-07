using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }


    //Create task endpoint
    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        var task = await _taskService.CreateTaskAsync(dto);
        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
    }

    //Get all tasks endpoint
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTasks()
    {
        var tasks = await _taskService.GetAllTasksAsync();
        return Ok(tasks);
    }

    //Get task by id endpoint
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);

    }

    //Update task endpoint
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _taskService.UpdateTaskAsync(id, dto);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);
    }

    //Delete task endpoint
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var result = await _taskService.DeleteTaskAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

}
