using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;


namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class CategoryRepository : GenericRepository<Category, Guid>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
