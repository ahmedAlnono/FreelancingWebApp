using FreelancingApi.Models.Entities;

namespace FreelancingApi.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<User> Users { get; }
    IGenericRepository<Category> Categories { get; }
    IJobRepository Jobs { get; }
    IGenericRepository<Proposal> Proposals { get; }
    IGenericRepository<Message> Messages { get; }
    IGenericRepository<Review> Reviews { get; }
    IGenericRepository<Skill> Skills { get; }

    Task<int> CompleteAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}