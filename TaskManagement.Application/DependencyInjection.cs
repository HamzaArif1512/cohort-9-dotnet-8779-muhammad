using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Mapping;

namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
