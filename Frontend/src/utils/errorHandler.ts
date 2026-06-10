// utils/errorHandler.ts
import { ApiError } from '../api/types/api.types';

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Set<(error: ApiError) => void> = new Set();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  captureException(error: ApiError): void {
    // Send to monitoring service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      // Sentry.captureException(error);
    }
    
    console.error('[ErrorHandler]', error);
    this.notifyListeners(error);
  }

  showError(error: ApiError): void {
    const message = this.getUserFriendlyMessage(error);
    
    // Show toast notification
    this.showToast(message, 'error');
  }

  getUserFriendlyMessage(error: ApiError): string {
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Your session has expired. Please login again.',
      403: 'You don\'t have permission to perform this action.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Something went wrong on our end. Please try again.',
      503: 'Service is temporarily unavailable. Please try again later.'
    };
    
    if (error.statusCode in statusMessages) {
      return statusMessages[error.statusCode];
    }
    
    return error.message || 'An unexpected error occurred.';
  }

  private showToast(message: string, type: string): void {
    // Implement your toast notification system
    // For now, we'll just log it. In a real app, this would trigger a UI component.
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  addListener(listener: (error: ApiError) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private notifyListeners(error: ApiError): void {
    this.errorListeners.forEach(listener => listener(error));
  }
}

export const errorHandler = ErrorHandler.getInstance();
