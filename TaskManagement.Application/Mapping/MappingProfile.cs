using AutoMapper;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.DTOs.UsersDto;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {

        CreateMap<CreateTaskDto, TaskItem>();

        CreateMap<UpdateTaskDto, TaskItem>();

        CreateMap<TaskItem, TaskResponseDto>();

        CreateMap<RegisterUserDto, User>();

        CreateMap<User, UserProfileDto>();
    }
}
