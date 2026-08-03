using TaskManagement.API.Middleware;
namespace TaskManagement.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseGlobalExceptionMiddleware(this IApplicationBuilder builder)
    {

        ArgumentNullException.ThrowIfNull(builder);

        return builder.UseMiddleware<GlobalExceptionMiddleware>();

    }
}
