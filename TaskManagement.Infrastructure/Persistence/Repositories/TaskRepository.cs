using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class TaskRepository : GenericRepository<TaskItem, Guid>, ITaskRepository
{
    public TaskRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<TaskItem?> GetByIdWithDetailsAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.UserId)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }
}
