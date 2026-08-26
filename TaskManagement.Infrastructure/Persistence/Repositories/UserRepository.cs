using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;


namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class UserRepository : GenericRepository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        ArgumentException.ThrowIfNullOrEmpty(email, nameof(email));
        return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdWithRoleAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<AdminUserListDto>> GetRegularUsersAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Users
            .Where(u => u.Role == UserRole.RegularUser)
            .Select(u => new AdminUserListDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                CreatedAt = u.CreatedAt,
                TaskCount = _context.TaskItems.Count(t => t.UserId == u.Id)
            })
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminUserDetailsDto?> GetRegularUserDetailsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _context.Users
            .Where(u =>
                u.Id == userId &&
                u.Role == UserRole.RegularUser)
            .Select(u => new AdminUserDetailsDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                CreatedAt = u.CreatedAt,

                TaskCount = _context.TaskItems.Count(
                    t => t.UserId == u.Id),

                PendingTasks = _context.TaskItems.Count(
                    t => t.UserId == u.Id &&
                         t.Status == TaskItemStatus.Pending),

                InProgressTasks = _context.TaskItems.Count(
                    t => t.UserId == u.Id &&
                         t.Status == TaskItemStatus.InProgress),

                CompletedTasks = _context.TaskItems.Count(
                    t => t.UserId == u.Id &&
                         t.Status == TaskItemStatus.Completed),

                OverdueTasks = _context.TaskItems.Count(
                    t => t.UserId == u.Id &&
                         t.DueDate.HasValue &&
                         t.DueDate.Value < DateTime.UtcNow &&
                         t.Status != TaskItemStatus.Completed)
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<AdminUserTaskDto>> GetUserTasksAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.TaskItems
            .Where(t => t.UserId == userId)
            .Select(t => new AdminUserTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                DueDate = t.DueDate,
                CategoryId = t.CategoryId,
                CategoryName = t.Category != null ? t.Category.Name : null
            })
            .OrderBy(t => t.DueDate)
            .ToListAsync(cancellationToken);
    }
}
