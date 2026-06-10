// services/token.service.ts
class TokenService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    
    // Decode JWT to get expiry
    const payload = this.decodeJwt(accessToken);
    if (payload?.exp) {
      localStorage.setItem(this.tokenExpiryKey, payload.exp.toString());
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry, 10) * 1000;
    return Date.now() >= expiryTime;
  }

  shouldRefreshToken(): boolean {
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry, 10) * 1000;
    const timeUntilExpiry = expiryTime - Date.now();
    
    // Refresh if less than 5 minutes remaining
    return timeUntilExpiry < 5 * 60 * 1000;
  }

  private decodeJwt(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}

export const tokenService = new TokenService();
