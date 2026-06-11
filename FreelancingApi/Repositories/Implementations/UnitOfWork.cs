using FreelancingApi.Data;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace FreelancingApi.Repositories.Implementations;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IDbContextTransaction? _transaction;
    private IGenericRepository<User>? _users;
    private IGenericRepository<Category>? _categories;
    private IJobRepository? _jobs;
    private IGenericRepository<Proposal>? _proposals;
    private IGenericRepository<Message>? _messages;
    private IGenericRepository<Review>? _reviews;
    private IGenericRepository<Skill>? _skills;
    
    public IGenericRepository<User> Users => 
        _users ??= new GenericRepository<User>(context);
    
    public IGenericRepository<Category> Categories => 
        _categories ??= new GenericRepository<Category>(context);
    
    public IJobRepository Jobs => 
        _jobs ??= new JobRepository(context);
    
    public IGenericRepository<Proposal> Proposals => 
        _proposals ??= new GenericRepository<Proposal>(context);
    
    public IGenericRepository<Message> Messages => 
        _messages ??= new GenericRepository<Message>(context);
    
    public IGenericRepository<Review> Reviews => 
        _reviews ??= new GenericRepository<Review>(context);
    
    public IGenericRepository<Skill> Skills => 
        _skills ??= new GenericRepository<Skill>(context);
    public async Task<int> CompleteAsync()
    {
        return await context.SaveChangesAsync();
    }
    
    public async Task BeginTransactionAsync()
    {
        _transaction = await context.Database.BeginTransactionAsync();
    }
    
    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
            await _transaction.CommitAsync();
    }
    
    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
            await _transaction.RollbackAsync();
    }
    
    public void Dispose()
    {
        _transaction?.Dispose();
        context.Dispose();
    }
}