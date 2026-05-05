using FreelancingApi.Data;
using FreelancingApi.Models.Entities;
using FreelancingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FreelancingApi.Repositories.Implementations;

public class GenericRepository<T>(AppDbContext context) : IGenericRepository<T> where T : BaseEntity
{
    protected readonly DbSet<T> dbSet = context.Set<T>();

    public async Task<T?> GetByIdAsync(int id)
    {
        return await dbSet.FindAsync(id);
    }
    
    public async Task<IReadOnlyList<T>> GetAllAsync()
    {
        return await dbSet.ToListAsync();
    }
    
    public async Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate)
    {
        return await dbSet.Where(predicate).ToListAsync();
    }
    
    public async Task<T> AddAsync(T entity)
    {
        await dbSet.AddAsync(entity);
        return entity;
    }
    
    public Task UpdateAsync(T entity)
    {
        context.Entry(entity).State = EntityState.Modified;
        return Task.CompletedTask;
    }
    
    public Task DeleteAsync(T entity)
    {
        entity.IsDeleted = true;
        context.Entry(entity).State = EntityState.Modified;
        return Task.CompletedTask;
    }
    
    public async Task<bool> ExistsAsync(int id)
    {
        return await dbSet.AnyAsync(e => e.Id == id);
    }
    
    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await dbSet.CountAsync();
        
        return await dbSet.CountAsync(predicate);
    }
}