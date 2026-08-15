using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Mapping;
using TaskManagement.Application.Validators.TaskValidators;
using TaskManagement.Application.Interfaces.Services;
using TaskManagement.Application.Services;


namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
      
        ArgumentNullException.ThrowIfNull(services);
      
        services.AddAutoMapper(cfg => { }, typeof(MappingProfile));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();

        services.AddScoped<ITaskService, TaskService>();

        return services;
    }
}
