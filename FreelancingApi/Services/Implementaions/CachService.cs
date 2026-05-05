using FreelancingApi.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
namespace FreelancingApi.Services.Implementaions;

public class CacheService(
    IDistributedCache cache,
    ILogger<CacheService> logger
) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key)
    {
        var data = await cache.GetStringAsync(key);
        if (string.IsNullOrEmpty(data))
            return default;

        try
        {
            return JsonSerializer.Deserialize<T>(data);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deserializing cache key {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var options = new DistributedCacheEntryOptions();

        if (expiration.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiration;
        }
        else
        {
            options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
        }

        var data = JsonSerializer.Serialize(value);
        await cache.SetStringAsync(key, data, options);
    }

    public async Task RemoveAsync(string key)
    {
        await cache.RemoveAsync(key);
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
    {
        var cached = await GetAsync<T>(key);
        if (cached != null)
            return cached;

        var result = await factory();
        await SetAsync(key, result, expiration);
        return result;
    }
}