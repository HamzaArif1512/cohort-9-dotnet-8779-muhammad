using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Domain.Entities;

public class Category
{
    public int Id { get; private set; }

    public string Name { get; private set; }

    public Category(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Category name cannot be null or empty.",
                nameof(name));
        }

        Name = name;
    }

    private Category()
    {
        // Required by EF Core
        Name = string.Empty;
    }

    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();
}
