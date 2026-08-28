using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories;

public interface ITaskRepository : IGenericRepository<TaskItem, Guid>
{
  public Task<TaskItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken);

    public Task<IEnumerable<TaskItem>> GetAllWithDetailsAsync(CancellationToken cancellationToken);

    public Task<IEnumerable<TaskItem>> GetAllByUserIdWithDetailsAsync(Guid userId, CancellationToken cancellationToken);

    public Task<IEnumerable<TaskItem>> SearchAsync(TaskSearchDto filters, Guid? userId,  CancellationToken cancellationToken);
}
