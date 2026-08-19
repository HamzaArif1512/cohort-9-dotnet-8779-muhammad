using TaskManagement.Application.DTOs.DashboardDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface IDashboardService
{
    public Task<UserDashboardDto> GetUserDashboardAsync(CancellationToken cancellationToken);

    public Task<AdminDashboardDto> GetAdminDashboardAsync(CancellationToken cancellationToken);
}
