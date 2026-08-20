using TaskManagement.Application.DTOs.AdminUserDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface IAdminUserService
{
    public Task<IEnumerable<AdminUserListDto>> GetUsersAsync(CancellationToken cancellationToken);
    public Task<AdminUserDetailsDto?> GetRegularUserDetailsAsync(Guid userId, CancellationToken cancellationToken);
    public Task<IEnumerable<AdminUserTaskDto>> GetUserTasksAsync(Guid userId, CancellationToken cancellationToken);
    public Task<AdminUserListDto> CreateUserAsync(CreateAdminUserDto dto, CancellationToken cancellationToken);
}
