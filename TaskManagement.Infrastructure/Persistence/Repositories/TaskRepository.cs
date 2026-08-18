using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class TaskRepository : GenericRepository<TaskItem, Guid>, ITaskRepository
{

    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
        _context = dbContext;
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


    public async Task<IEnumerable<TaskItem>> SearchAsync(TaskSearchDto filters, Guid? userId, CancellationToken cancellationToken)
    {
        var query = _context.TaskItems
            .Include(t => t.Category)
            .Include(t => t.Users)
            .AsQueryable();


        if (userId.HasValue)
        {
            query = query.Where(t => t.UserId == userId.Value);
        }


        if (!string.IsNullOrWhiteSpace(filters.Keyword))
        {
            var keyword = filters.Keyword.Trim();
            query = query.Where(t => t.Title.Contains(keyword) || (t.Description != null && t.Description.Contains(keyword) || t.Users.Name.Contains(keyword)));
        }

        if (filters.AssigneeId.HasValue)
        {
            query = query.Where(t => t.UserId == filters.AssigneeId.Value);
        }

        if (filters.Status.HasValue)
        {
            query = query.Where(t => t.Status == filters.Status.Value);
        }

        if (filters.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == filters.Priority.Value);
        }

        if (filters.CategoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == filters.CategoryId.Value);
        }

        if (filters.DateDueFrom.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value >= filters.DateDueFrom.Value);
        }

        if (filters.DateDueTo.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value <= filters.DateDueTo.Value);
        }
        return await query.OrderBy(t => t.DueDate).ToListAsync(cancellationToken);
    }
}
