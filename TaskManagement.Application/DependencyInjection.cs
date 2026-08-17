using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Mapping;
using TaskManagement.Application.Validators.UserValidators;
using TaskManagement.Application.Validators.TaskValidators;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;
using Microsoft.AspNetCore.Identity;
using TaskManagement.Domain.Entities;


namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
      
        ArgumentNullException.ThrowIfNull(services);
      
        services.AddAutoMapper(cfg => { }, typeof(MappingProfile));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddValidatorsFromAssembly(typeof(RegisterUserDtoValidator).Assembly);

        services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();

        services.AddScoped<ITaskService, TaskService>();

        services.AddScoped<
        Microsoft.AspNetCore.Identity.IPasswordHasher<User>,
        Microsoft.AspNetCore.Identity.PasswordHasher<User>>();

        services.AddScoped<
            TaskManagement.Application.Interfaces.Services.IPasswordHasher,
            PasswordHasherService>();

        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
