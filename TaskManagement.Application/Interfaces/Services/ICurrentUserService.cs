using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Application.Interfaces.Services;

public interface ICurrentUserService
{
    public Guid? UserId { get; }
    public bool IsAdmin { get; }
}
