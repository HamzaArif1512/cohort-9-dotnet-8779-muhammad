using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Domain.Entities;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; }

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

    public Category()
    {
        // Required by EF Core
        Name = string.Empty;
    }

    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();
}
