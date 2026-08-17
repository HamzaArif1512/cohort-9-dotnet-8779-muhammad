using System.Security.Claims;
using TaskManagement.Application.Interfaces.Services;


namespace TaskManagement.API;

public class CurrentUserServices
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserServices(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userId = _httpContextAccessor.HttpContext?
                .User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(userId, out var id)
                ? id
                : null;
        }
    }

    public bool IsAdmin =>
        _httpContextAccessor.HttpContext?
        .User
        .IsInRole("Admin") ?? false;
}
