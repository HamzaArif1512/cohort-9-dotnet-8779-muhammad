using Microsoft.OpenApi;


namespace TaskManagement.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {

        ArgumentNullException.ThrowIfNull(services);

        services.AddControllers();
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(options =>
        {
            // Configure basic information for the OpenAPI documentation (optional)
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "ASP.NET Core Web API",
                Version = "v1",
                Description = "ASP.NET Core Web API with JWT authentication. " +
                "Target Framework is .NET 10. " +
                "Swashbuckle.AspNetCore 10.1.7 is used."
            });

            // Add a Security Scheme (using a JWT Bearer token).
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Please enter token"
            });

            options.AddSecurityRequirement(document =>
                new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                });
        });
        return services;
    }
}
