using FreelancingApi.Models.Entities;

namespace FreelancingApi.Models.Dtos;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int JobCount { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = [];

    // public static implicit operator CategoryDto(Category v)
    // {
    //     throw new NotImplementedException();
    // }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
}