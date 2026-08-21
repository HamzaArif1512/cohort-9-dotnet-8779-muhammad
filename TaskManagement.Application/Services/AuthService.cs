using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.AuthDtos;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Application.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;





namespace TaskManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto request)
    {
        ArgumentNullException.ThrowIfNull(request);


        ArgumentException.ThrowIfNullOrEmpty(request.Email);
        ArgumentException.ThrowIfNullOrEmpty(request.FullName);
        ArgumentException.ThrowIfNullOrEmpty(request.Password);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail);

        if (existingUser != null)
        {
            throw new DuplicateEmailException("User with this email already exists.");
        }

        var user = new User(
            request.FullName,
            normalizedEmail,
            UserRole.RegularUser);

        var passwordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        user.SetPasswordHash(passwordHash);

        await _userRepository.AddAsync(user);

        try
        {
            await _userRepository.SaveChangesAsync();
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            throw new DuplicateEmailException(
                "User with this email already exists.");
        }

        return await _tokenService.GenerateTokensAsync(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginUserDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);
        ArgumentException.ThrowIfNullOrWhiteSpace(dto.Email);
        ArgumentException.ThrowIfNullOrWhiteSpace(dto.Password);

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(normalizedEmail);

        if(user == null) { return null;}

        var passwordValid = _passwordHasher.VerifyPassword(user, user.PasswordHash, dto.Password);

        if(!passwordValid)
        {
            return null;
        }

        var tokens = await _tokenService.GenerateTokensAsync(user);

        await _userRepository.SaveChangesAsync();

        return tokens;
    }

    public async Task<AuthResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);
        ArgumentException.ThrowIfNullOrEmpty(dto.RefreshToken);

        return await _tokenService.RefreshTokensAsync(dto.RefreshToken);
    }

    public async Task<bool> LogoutAsync(
    RefreshTokenRequestDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        return await _tokenService.RevokeRefreshTokenAsync(
            dto.RefreshToken);
    }

}
