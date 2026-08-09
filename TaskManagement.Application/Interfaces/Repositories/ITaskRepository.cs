using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories;

public interface ITaskRepository : IGenericRepository<TaskItem, Guid>
{

}
