import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '../../services/token.service';
import { eventBus } from '../../utils/eventBus';

export const setupAuthInterceptor = (instance: AxiosInstance): void => {
  // Request interceptor - add auth token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = tokenService.getAccessToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = tokenService.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }
          
          // Attempt to refresh tokens
          const { data } = await instance.post('/auth/refresh', {
            accessToken: tokenService.getAccessToken(),
            refreshToken: refreshToken
          });
          
          if (data.success) {
            tokenService.setTokens(data.data.accessToken, data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          tokenService.clearTokens();
          eventBus.emit('auth:logout');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
