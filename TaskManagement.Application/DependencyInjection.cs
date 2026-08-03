using Microsoft.Extensions.DependencyInjection;

namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        
        // Register application services here
        // e.g., services.AddScoped<IMyService, MyService>();
        return services;
    }
}
