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
            .Include(t => t.Users)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetAllWithDetailsAsync(CancellationToken cancellationToken)
    {
        return await _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.Users)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetAllByUserIdWithDetailsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.Users)
            .Where(t => t.UserId == userId)
            .ToListAsync(cancellationToken);
    }
}
