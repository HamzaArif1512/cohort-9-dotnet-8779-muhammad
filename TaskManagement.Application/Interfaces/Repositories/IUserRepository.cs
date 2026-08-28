using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User, Guid>
{
    public Task<User?> GetByEmailAsync(string email);

    public Task<User?> GetByIdWithRoleAsync(Guid id, CancellationToken cancellationToken);

    public Task<IEnumerable<AdminUserListDto>> GetRegularUsersAsync(CancellationToken cancellationToken);

    public Task<AdminUserDetailsDto?> GetRegularUserDetailsAsync(Guid userId, CancellationToken cancellationToken);

    public Task<IEnumerable<AdminUserTaskDto>> GetUserTasksAsync(Guid userId, CancellationToken cancellationToken);
}
