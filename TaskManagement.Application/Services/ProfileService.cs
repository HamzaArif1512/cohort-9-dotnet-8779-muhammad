using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs.ProfileDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IMapper _mapper;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(
        IMapper mapper,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        ILogger<ProfileService> logger)
    {
        _mapper = mapper;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<ProfileDto> GetProfileAsync(CancellationToken cancellationToken)
    {
        if(_currentUserService.UserId is not Guid userId)
        {
            _logger.LogWarning("Attempt to access profile without authentication.");

            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var user = await _userRepository.GetByIdWithRoleAsync(userId, cancellationToken);

        if(user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found.", userId);

            throw new KeyNotFoundException("User not found.");
        }

        _logger.LogInformation("Successfully retrieved profile for user ID {UserId}.", userId);

        return _mapper.Map<ProfileDto>(user);
    }
}
