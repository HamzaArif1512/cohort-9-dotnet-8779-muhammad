using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Common;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.RegularUser;

        public ICollection<RefreshToken> RefreshTokens { get; set;} = new List<RefreshToken>();
        public ICollection<TaskItem> TaskItems { get; set; } = new List<TaskItem>();
    }
}
