using TaskManagement.Application.DTOs.CategoryDtos;

namespace TaskManagement.Application.Interfaces.Services;

public interface ICategoryService
{
    public Task<IEnumerable<CategoryResponseDto>> GetCategoriesAsync(
        CancellationToken cancellationToken);
}
