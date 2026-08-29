using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces.Services;

public interface IPasswordHasher
{
    public string HashPassword(User user, string password);
    public bool VerifyPassword(User user, string hashedPassword, string providedPassword);
}
