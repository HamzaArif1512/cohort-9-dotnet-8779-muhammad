using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagement.Application.DTOs.AuthDtos;

public class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
