using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Mapping;
using TaskManagement.Application.Validators.TaskValidators;

namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();

        return services;
    }
}
