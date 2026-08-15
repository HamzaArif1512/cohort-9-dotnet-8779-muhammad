using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;


namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class UserRepository : GenericRepository<User, Guid>, IUserRepository
{
    public UserRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
