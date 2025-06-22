'use client';

import { useViewport } from '@/contexts/ViewportContext';

export function ViewportWrapper({ children }: { children: React.ReactNode }) {
  const { viewport } = useViewport();

  const viewportClasses = {
    desktop: 'w-full',
    tablet: 'max-w-3xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  if (viewport === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div className={`transition-all duration-300 ${viewportClasses[viewport]}`}>
      <div className="border-l border-r border-gray-300 min-h-screen bg-white shadow-lg">
        {children}
      </div>
    </div>
  );
}