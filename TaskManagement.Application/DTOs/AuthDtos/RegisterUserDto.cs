using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Application.DTOs.UserDtos;

public class RegisterUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
