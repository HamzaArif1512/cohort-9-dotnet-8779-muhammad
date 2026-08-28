using AutoMapper;
using TaskManagement.Application.DTOs.Auth;
using TaskManagement.Application.DTOs.CategoryDtos;
using TaskManagement.Application.DTOs.ProfileDtos;
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
                opt => opt.MapFrom(src => src.CategoryId))
            .ForMember(
                dest => dest.Status,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Users,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Category,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Id,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.UpdatedAt,
                opt => opt.Ignore());

        CreateMap<UpdateTaskDto, TaskItem>()
            .ForMember(
                dest => dest.UserId,
                opt => opt.MapFrom(src => src.AssigneeId))
            .ForMember(
                dest => dest.CategoryId,
                opt => opt.MapFrom(src => src.CategoryId))
            .ForMember(
                dest => dest.Users,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Category,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Id,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.CreatedAt,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.UpdatedAt,
                opt => opt.Ignore());

        CreateMap<TaskItem, TaskResponseDto>()
            .ForMember(
                dest => dest.CategoryName,
                opt => opt.MapFrom(src => src.Category != null
                    ? src.Category.Name
                    : null))
            .ForMember(
                dest => dest.AssigneeName,
                opt => opt.MapFrom(src => src.Users != null
                    ? src.Users.Name
                    : null));

        CreateMap<RegisterUserDto, User>()
            .ForMember(
                dest => dest.Name,
                opt => opt.MapFrom(src => src.FullName))
            .ForMember(
                dest => dest.PasswordHash,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Role,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.RefreshTokens,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.TaskItems,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Id,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.CreatedAt,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.UpdatedAt,
                opt => opt.Ignore())
            .ForMember(
                dest => dest.Email,
                opt => opt.MapFrom(src => src.Email));

        CreateMap<User, ProfileDto>()
                   .ForMember(
                       dest => dest.FullName,
                       opt => opt.MapFrom(src => src.Name))
                   .ForMember(
                       dest => dest.Role,
                       opt => opt.MapFrom(src => src.Role.ToString()));

        CreateMap<Category, CategoryResponseDto>();
    }
}
