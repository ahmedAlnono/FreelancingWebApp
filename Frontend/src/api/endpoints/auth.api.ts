// api/endpoints/auth.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: 'freelancer' | 'client';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  location?: string;
  unreadMessages: number;
  notifications: number;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

class AuthApi {
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', request);
  }

  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', request);
  }

  async refreshToken(request: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/refresh', request);
  }

  async logout(refreshToken?: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>('/auth/logout', { refreshToken });
  }

  async revokeAllTokens(): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>('/auth/revoke-all');
  }

  async forgotPassword(email: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>('/auth/reset-password', { token, newPassword });
  }

  async verifyEmail(token: string): Promise<ApiResponse<boolean>> {
    return apiClient.post<boolean>('/auth/verify-email', { token });
  }
}

export const authApi = new AuthApi();
