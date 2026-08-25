using AutoMapper;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.CategoryDtos;
using TaskManagement.Application.DTOs.TaskDtos;
using TaskManagement.Application.DTOs.UserDtos;
using TaskManagement.Application.DTOs.UsersDto;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateTaskDto, TaskItem>()
            .ForMember(
                dest => dest.UserId,
                opt => opt.MapFrom(src => src.AssigneeId))
            .ForMember(
                dest => dest.CategoryId,
                opt => opt.MapFrom(src => src.CategoryId));

        CreateMap<UpdateTaskDto, TaskItem>()
            .ForMember(
                dest => dest.UserId,
                opt => opt.MapFrom(src => src.AssigneeId))
            .ForMember(
                dest => dest.CategoryId,
                opt => opt.MapFrom(src => src.CategoryId));

            CreateMap<TaskItem, TaskResponseDto>()
         .ForMember(
             dest => dest.CategoryName,
             opt => opt.MapFrom(src => src.Category.Name))
         .ForMember(
             dest => dest.AssigneeName,
             opt => opt.MapFrom(src => src.Users.Name));

        CreateMap<RegisterUserDto, User>();

        CreateMap<User, UserProfileDto>();

        CreateMap<Category, CategoryResponseDto>();
    }
}
