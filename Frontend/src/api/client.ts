// api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { environment } from '../config/environment';
import { ApiResponse } from './types/api.types';
import { setupAuthInterceptor } from './interceptors/auth.interceptor';
import { setupErrorInterceptor } from './interceptors/error.interceptor';
import { setupLoggingInterceptor } from './interceptors/logging.interceptor';

class ApiClient {
  private instance: AxiosInstance;
  private static apiClientInstance: ApiClient;

  private constructor() {
    this.instance = axios.create({
      baseURL: environment.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.apiClientInstance) {
      ApiClient.apiClientInstance = new ApiClient();
    }
    return ApiClient.apiClientInstance;
  }

  private setupInterceptors(): void {
    setupAuthInterceptor(this.instance);
    setupErrorInterceptor(this.instance);
    
    if (!environment.production) {
      setupLoggingInterceptor(this.instance);
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return response.data;
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = ApiClient.getInstance();
