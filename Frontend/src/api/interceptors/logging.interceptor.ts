// api/interceptors/logging.interceptor.ts
import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const setupLoggingInterceptor = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.group(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
        headers: config.headers
      });
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      console.groupEnd();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('Response:', {
        status: response.status,
        data: response.data
      });
      console.groupEnd();
      return response;
    },
    (error) => {
      console.error('Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      console.groupEnd();
      return Promise.reject(error);
    }
  );
};
