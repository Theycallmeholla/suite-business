'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { generateColorPalette, generateCSSVariables } from '@/lib/color-utils';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  neutral: string;
  neutralLight: string;
  neutralDark: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
}

export interface ThemeContextType {
  colors: ThemeColors;
  template: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  template?: string;
  industry?: string;
}

export function ThemeProvider({
  children,
  primaryColor,
  secondaryColor,
  accentColor,
  template = 'modern',
  industry = 'general',
}: ThemeProviderProps) {
  // Generate the color palette
  const palette = generateColorPalette(primaryColor, industry);
  
  // Override with custom colors if provided
  if (secondaryColor) {
    palette.secondary = secondaryColor;
    palette.secondaryLight = palette.secondaryLight; // Could enhance this
    palette.secondaryDark = palette.secondaryDark;
  }
  
  if (accentColor) {
    palette.accent = accentColor;
    palette.accentLight = palette.accentLight;
    palette.accentDark = palette.accentDark;
  }

  // Apply CSS variables to the document
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = generateCSSVariables(palette);
    const varLines = cssVars.trim().split('\n').filter(line => line.trim());
    
    varLines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        root.style.setProperty(key, value.replace(';', ''));
      }
    });

    // Apply template-specific classes
    document.body.setAttribute('data-template', template);
    document.body.setAttribute('data-industry', industry);

    return () => {
      // Cleanup
      varLines.forEach(line => {
        const [key] = line.split(':').map(s => s.trim());
        if (key) {
          root.style.removeProperty(key);
        }
      });
      document.body.removeAttribute('data-template');
      document.body.removeAttribute('data-industry');
    };
  }, [palette, template, industry]);

  return (
    <ThemeContext.Provider value={{ colors: palette, template }}>
      {children}
    </ThemeContext.Provider>
  );
}