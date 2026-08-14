using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace TaskManagement.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAt { get; set; }

    public DateTime RefreshTokenExpiresAt { get; set; }

    //public int UserId { get; set; }

    //public string FullName { get; set; } = string.Empty;

    //public string Email { get; set; } = string.Empty;

    //public string Role { get; set; } = string.Empty;
}
