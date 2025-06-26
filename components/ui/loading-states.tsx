/**
 * Loading States & Error Handling Components
 * 
 * Provides consistent loading states and error handling across the platform
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

/**
 * Generic loading spinner
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

/**
 * Loading skeleton for content
 */
export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
        <LoadingSkeleton lines={3} />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Full page loading state
 */
export function PageLoading({ 
  message = 'Loading...', 
  submessage 
}: { 
  message?: string; 
  submessage?: string; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
        <div>
          <h3 className="text-lg font-medium">{message}</h3>
          {submessage && (
            <p className="text-gray-600 text-sm mt-1">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Progressive loading with steps
 */
export function ProgressiveLoading({ 
  steps, 
  currentStep, 
  className = '' 
}: { 
  steps: string[]; 
  currentStep: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : index === currentStep ? (
              <LoadingSpinner size="sm" className="text-blue-600" />
            ) : (
              <Clock className="h-5 w-5 text-gray-300" />
            )}
            <span className={`text-sm ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error boundary component
 */
interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'network';
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error',
  className = '' 
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <XCircle className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <Alert className={`${className}`} variant={type === 'warning' ? 'default' : 'destructive'}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium">{getTitle()}</h4>
          <AlertDescription className="mt-1">
            {errorMessage}
          </AlertDescription>
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="h-8"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Network status indicator
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>You're offline. Some features may not work.</span>
      </div>
    </div>
  );
}

/**
 * Async operation wrapper with loading and error states
 */
interface AsyncWrapperProps<T> {
  operation: () => Promise<T>;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error, retry: () => void) => React.ReactNode;
  children: (data: T) => React.ReactNode;
  deps?: any[];
}

export function AsyncWrapper<T>({ 
  operation, 
  loadingComponent, 
  errorComponent, 
  children, 
  deps = [] 
}: AsyncWrapperProps<T>) {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const executeOperation = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await operation();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, deps);

  React.useEffect(() => {
    executeOperation();
  }, [executeOperation]);

  if (state.loading) {
    return loadingComponent || <LoadingSpinner />;
  }

  if (state.error) {
    return errorComponent ? 
      errorComponent(state.error, executeOperation) : 
      <ErrorDisplay error={state.error} onRetry={executeOperation} />;
  }

  if (state.data) {
    return <>{children(state.data)}</>;
  }

  return null;
}

/**
 * Button with loading state
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({ 
  loading = false, 
  loadingText, 
  children, 
  disabled, 
  className = '',
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      {...props}
      disabled={disabled || loading}
      className={className}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}

/**
 * Form field with validation state
 */
interface FormFieldWrapperProps {
  label: string;
  error?: string;
  loading?: boolean;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({ 
  label, 
  error, 
  loading, 
  required, 
  children, 
  className = '' 
}: FormFieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {loading && <LoadingSpinner size="sm" />}
      </label>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}