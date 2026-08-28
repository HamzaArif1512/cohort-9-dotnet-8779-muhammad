using System;
using System.Collections.Generic;
using System.Text;
using TaskManagement.Domain.Common;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; private set; } = string.Empty;

        public string Email { get; private set; } = string.Empty;

        public string PasswordHash { get; private set; } = string.Empty;

        public UserRole Role { get; private set; } = UserRole.RegularUser;

        public ICollection<RefreshToken> RefreshTokens { get; set; }
            = new List<RefreshToken>();

        public ICollection<TaskItem> TaskItems { get; set; }
            = new List<TaskItem>();

        private User()
        {
        }

        public User(
            string name,
            string email,
            UserRole role = UserRole.RegularUser)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);
            ArgumentException.ThrowIfNullOrWhiteSpace(email);

            Name = name;
            Email = email;
            Role = role;
        }

        public void SetPasswordHash(string passwordHash)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

            PasswordHash = passwordHash;
        }
    }
}
