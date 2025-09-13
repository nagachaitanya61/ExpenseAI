import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Theme = 'light' | 'dark';
type Accent = 'cyan' | 'indigo' | 'pink';

interface AccentColor {
  bg: string;
  hoverBg: string;
  text: string;
  border: string;
  focusRing: string;
  focusBorder: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
  accentColor: AccentColor;
}

const GENERIC_ACCENT_CLASSES: AccentColor = {
  bg: 'bg-accent-600',
  hoverBg: 'hover:bg-accent-700',
  text: 'text-accent-500',
  border: 'border-accent-500',
  focusRing: 'focus:ring-accent-500',
  focusBorder: 'focus:border-accent-500',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [accent, setAccent] = useLocalStorage<Accent>('accent', 'cyan');

  useEffect(() => {
    const root = window.document.body;
    root.classList.remove('light', 'dark', 'theme-cyan', 'theme-indigo', 'theme-pink');
    root.classList.add(theme);
    root.classList.add(`theme-${accent}`);
  }, [theme, accent]);
  
  const value = { theme, setTheme, accent, setAccent, accentColor: GENERIC_ACCENT_CLASSES };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};