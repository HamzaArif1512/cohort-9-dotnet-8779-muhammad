using TaskManagement.API.Middleware;
namespace TaskManagement.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseGlobalExceptionMiddleware(this IApplicationBuilder builder, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(configuration);

        return builder.UseMiddleware<GlobalExceptionMiddleware>();

    }
}
