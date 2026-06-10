using FreelancingApi.Data;
using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelancingApi.Repositories.Implementations;

public class FreelancerRepository
(AppDbContext context) : IFreelancerRepository
{
    public async Task<IReadOnlyList<User>> GetUsersWithFilter(FreelnacerFilterParams dto)
    {
        var query = context.Users
        .Include(u => u.FreelancerProfile)
        .ThenInclude(u => u!.Skills)
        .Include(u => u.ReceivedReviews)
        .Where(u => u.IsActive && !u.IsDeleted);

        if (dto.MinRate != null)
            query = query.Where(u => u.Rating >= dto.MinRate);
        if (dto.MaxRate != null)
            query = query.Where(u => u.Rating <= dto.MaxRate);

        if (dto.Availability != null)
            query = query.Where(u => u.FreelancerProfile != null &&
                                     u.FreelancerProfile.Availability == dto.Availability);
        if (!string.IsNullOrEmpty(dto.Search))
            query = query.Where(u => u.Username.Contains(dto.Search));

        query = query.Skip(dto.PageSize * (dto.Page - 1)).Take(dto.PageSize);

        return await query.ToListAsync();
    }
}