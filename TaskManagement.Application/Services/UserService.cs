using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.Application.Services;

internal class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(
    IUserRepository userrepository,
    IMapper mapper)
    {
        _userRepository = userrepository;
        _mapper = mapper;
    }
}
