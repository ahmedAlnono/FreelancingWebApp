// hooks/useQuery.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../api/types/api.types';

interface UseQueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private static instance: QueryCache;
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, staleTime: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + staleTime
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export function useQuery<T>(
  key: unknown,
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseQueryOptions<T> = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const queryFnRef = useRef(queryFn);
  const cache = QueryCache.getInstance();
  
  // Create a string key from whatever is passed in
  const cacheKey = JSON.stringify(key);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, []);

  const fetchData = useCallback(async (skipCache: boolean = false) => {
    if (!enabled) return;

    // Check cache first
    if (!skipCache) {
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData) {
        if (!mountedRef.current) return;
        setData(cachedData);
        setIsLoading(false);
        return;
      }
    }

    if (!mountedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await queryFnRef.current();
      
      if (response.success) {
        const responseData = response.data;
        if (!mountedRef.current) return;
        setData(responseData);
        cache.set(cacheKey, responseData, staleTime);
        onSuccess?.(responseData);
        retryCount.current = 0;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err as Error);
      onError?.(err as Error);
      
      // Retry logic
      if (retryCount.current < retry) {
        retryCount.current++;
        if (retryTimeout.current) clearTimeout(retryTimeout.current);
        retryTimeout.current = setTimeout(() => {
          if (!mountedRef.current) return;
          fetchData(true);
        }, retryDelay * retryCount.current);
      }
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, [cacheKey, enabled, staleTime, retry, retryDelay, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.invalidate(cacheKey);
    return fetchData(true);
  }, [cacheKey, fetchData]);

  const invalidate = useCallback(() => {
    cache.invalidate(cacheKey);
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate
  };
}
