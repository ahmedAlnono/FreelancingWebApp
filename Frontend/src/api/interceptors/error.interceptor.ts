// api/interceptors/error.interceptor.ts
import { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../types/api.types';
import { errorHandler } from '../../utils/errorHandler';

export const setupErrorInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const apiError: ApiError = {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        errors: error.response?.data?.errors,
        timestamp: new Date().toISOString(),
        path: error.config?.url
      };
      
      // Log error to monitoring service
      errorHandler.captureException(apiError);
      
      // Show user-friendly notification
      errorHandler.showError(apiError);
      
      return Promise.reject(apiError);
    }
  );
};
