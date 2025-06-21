/**
 * Toast notification utility for user feedback
 * This provides a centralized way to show success, error, and info messages to users
 */

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  success(message: string, options?: ToastOptions) {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  error(message: string, options?: ToastOptions) {
    sonnerToast.error(message, {
      description: options?.description || 'Please try again or contact support if the issue persists.',
      duration: options?.duration || 6000,
      action: options?.action,
    });
  }

  info(message: string, options?: ToastOptions) {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  loading(message: string) {
    return sonnerToast.loading(message);
  }

  dismiss(toastId?: string | number) {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  }

  // Helper for async operations with loading state
  async promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): Promise<T> {
    // Sonner's promise method returns a promise with extra methods, but we just need the original promise
    sonnerToast.promise(promise, options);
    return promise;
  }

  // Common error messages
  authError() {
    this.error('Authentication failed', {
      description: 'Please sign in again to continue.',
      action: {
        label: 'Sign In',
        onClick: () => window.location.href = '/auth/signin',
      },
    });
  }

  networkError() {
    this.error('Network error', {
      description: 'Check your internet connection and try again.',
    });
  }

  validationError(field?: string) {
    this.error(field ? `Invalid ${field}` : 'Validation error', {
      description: 'Please check your input and try again.',
    });
  }

  rateLimitError() {
    this.error('Too many requests', {
      description: 'Please wait a moment before trying again.',
    });
  }

  saveSuccess() {
    this.success('Changes saved successfully');
  }

  deleteSuccess(item = 'Item') {
    this.success(`${item} deleted successfully`);
  }

  copySuccess() {
    this.success('Copied to clipboard');
  }
}

export const toast = new ToastManager();