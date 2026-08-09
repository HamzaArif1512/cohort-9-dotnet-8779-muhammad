using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Domain.Entities;


namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class TaskRepository : GenericRepository<TaskItem, Guid>, ITaskRepository
{
    public TaskRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }
}
