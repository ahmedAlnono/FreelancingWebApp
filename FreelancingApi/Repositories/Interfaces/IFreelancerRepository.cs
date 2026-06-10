using FreelancingApi.Models.Dtos;
using FreelancingApi.Models.Entities;

namespace FreelancingApi.Repositories.Interfaces;

public interface IFreelancerRepository
{
    Task<IReadOnlyList<User>> GetUsersWithFilter(FreelnacerFilterParams dto);
}