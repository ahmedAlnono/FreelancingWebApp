// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi, AuthResponse, UserInfo, LoginRequest, RegisterRequest } from '../api/endpoints/auth.api';
import { tokenService } from '../services/token.service';
import { webSocketService } from '../services/websocket.service';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserInfo) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    const accessToken = tokenService.getAccessToken();
    
    if (accessToken && !tokenService.isTokenExpired()) {
      // In a real app, you might want to verify the token or fetch the user profile
      // For now we'll assume the token is enough if it's in localStorage
      // user could be stored in localStorage too or fetched from a /me endpoint
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    
    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      tokenService.setTokens(accessToken, refreshToken);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Connect WebSocket
      await webSocketService.connect();
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    
    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      tokenService.setTokens(accessToken, refreshToken);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Connect WebSocket
      await webSocketService.connect();
    }
  };

  const logout = async () => {
    const refreshToken = tokenService.getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    
    tokenService.clearTokens();
    setUser(null);
    localStorage.removeItem('user');
    webSocketService.disconnect();
  };

  const updateUser = (updatedUser: UserInfo) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
