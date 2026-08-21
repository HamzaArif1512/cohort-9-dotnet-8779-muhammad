using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Exceptions;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Infrastructure.Persistence.Repositories;

public class UserRepository : GenericRepository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        ArgumentException.ThrowIfNullOrEmpty(email, nameof(email));

        return await _context.Users
            .SingleOrDefaultAsync(u => u.Email == email);
    }

    public override async Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsDuplicateEmailException(ex))
        {
            throw new DuplicateEmailException(
                "User with this email already exists.");
        }
    }

    private static bool IsDuplicateEmailException(
        DbUpdateException exception)
    {
        return exception.InnerException is SqlException sqlException
               && sqlException.Number is 2601 or 2627;
    }
}
