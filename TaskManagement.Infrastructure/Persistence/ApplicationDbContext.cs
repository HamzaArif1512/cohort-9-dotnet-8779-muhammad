using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<TaskItem> TaskItems => Set<TaskItem>();

    public DbSet<Category> Categories => Set<Category>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<Category>().HasData(
    new
    {
        Id = 1,
        Name = "Development"
    },
    new
    {
        Id = 2,
        Name = "Testing"
    },
    new
    {
        Id = 3,
        Name = "Documentation"
    },
    new
    {
        Id = 4,
        Name = "Bug Fix"
    },
    new
    {
        Id = 5,
        Name = "Research"
    }
);

    }
}
