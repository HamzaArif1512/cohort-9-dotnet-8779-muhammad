using AutoMapper;
using TaskManagement.Application.DTOs.CategoryDtos;
using TaskManagement.Application.Interfaces.Repositories;
using TaskManagement.Application.Interfaces.Services;

namespace TaskManagement.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CategoryService(
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetCategoriesAsync(
        CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllAsync();

        return _mapper.Map<IEnumerable<CategoryResponseDto>>(categories);
    }
}
