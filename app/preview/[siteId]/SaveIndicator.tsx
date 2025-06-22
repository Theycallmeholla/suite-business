'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

export function SaveIndicator({ status, message }: SaveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
      
      if (status === 'saved') {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [status]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
        ${status === 'saving' ? 'bg-blue-500 text-white' : ''}
        ${status === 'saved' ? 'bg-green-500 text-white' : ''}
        ${status === 'error' ? 'bg-red-500 text-white' : ''}
      `}>
        {status === 'saving' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Check className="w-4 h-4" />
            <span>Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>{message || 'Error saving'}</span>
          </>
        )}
      </div>
    </div>
  );
}