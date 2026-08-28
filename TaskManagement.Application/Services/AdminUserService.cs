using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs.AdminUserDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(
        IUserRepository userRepository,
        IPasswordHasher<User> passwordHasher,
        ILogger<AdminUserService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<IEnumerable<AdminUserListDto>> GetUsersAsync(
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fetching regular users for admin user management.");

        return await _userRepository.GetRegularUsersAsync(
            cancellationToken);
    }

    public async Task<AdminUserDetailsDto?> GetRegularUserDetailsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fetching details for regular user {UserId}.",
            userId);

        var user = await _userRepository.GetRegularUserDetailsAsync(
            userId,
            cancellationToken);

        if (user is null)
        {
            _logger.LogWarning(
                "Regular user {UserId} was not found.",
                userId);
        }

        return user;
    }

    public async Task<IEnumerable<AdminUserTaskDto>> GetUserTasksAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Fetching tasks for regular user {UserId}.",
            userId);

        return await _userRepository.GetUserTasksAsync(
            userId,
            cancellationToken);
    }

    public async Task<AdminUserListDto> CreateUserAsync(
        CreateAdminUserDto dto,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Admin is creating a new regular user with email {Email}.",
            dto.Email);

        // Check whether email already exists.
        var existingUser = await _userRepository
            .GetByEmailAsync(dto.Email);

        if (existingUser is not null)
        {
            _logger.LogWarning(
                "Admin attempted to create a user with existing email {Email}.",
                dto.Email);

            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var user = new User(
            dto.Name,
            dto.Email,
            UserRole.RegularUser);

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            dto.Password);

        user.SetPasswordHash(user.PasswordHash);

        await _userRepository.AddAsync(
            user);

        var changes = await _userRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created user {UserId}. Database changes saved: {Changes}",
            user.Id,
            changes);

        _logger.LogInformation(
            "Regular user {UserId} created successfully.",
            user.Id);

        return new AdminUserListDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            TaskCount = 0
        };
    }
}
