using TaskManagement.Application.DTOs.ProfileDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface IProfileService
{
    public Task<ProfileDto> GetProfileAsync(CancellationToken cancellationToken);
}
