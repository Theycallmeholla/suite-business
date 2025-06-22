'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface ViewportContextType {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <ViewportContext.Provider value={{ viewport, setViewport }}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  return context;
}