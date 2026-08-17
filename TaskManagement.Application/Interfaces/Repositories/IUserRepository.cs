using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User, Guid>
{
    public Task<User?> GetByEmailAsync(string email);
}
