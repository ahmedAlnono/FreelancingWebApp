// hooks/useMutation.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '../api/types/api.types';

interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data?: T, error?: Error, variables?: V) => void;
}

export function useMutation<T, V = unknown>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T, V> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: V) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await mutationFn(variables);
        
        if (response.success) {
          setData(response.data);
          options.onSuccess?.(response.data, variables);
          return response.data;
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        options.onError?.(error, variables);
        throw error;
      } finally {
        setIsLoading(false);
        options.onSettled?.(data || undefined, error, variables);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    data,
    reset
  };
}
