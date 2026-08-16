using Microsoft.AspNetCore.Identity;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Services;

public class PasswordHasherService : IPasswordHasher
{
    private readonly Microsoft.AspNetCore.Identity.IPasswordHasher<User> _passwordHasher;

    public PasswordHasherService(Microsoft.AspNetCore.Identity.IPasswordHasher<User> passwordHasher)
    {
        ArgumentNullException.ThrowIfNull(passwordHasher);
        _passwordHasher = passwordHasher;
    }

    public string HashPassword(User user, string password)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(password);

        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(User user, string hashedPassword, string providedPassword)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(hashedPassword);
        ArgumentNullException.ThrowIfNull(providedPassword);


        var result = _passwordHasher.VerifyHashedPassword(
        user,
        hashedPassword,
        providedPassword);

        return result == PasswordVerificationResult.Success ||
               result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}
