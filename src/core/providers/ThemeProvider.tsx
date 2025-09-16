import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS } from '../../config/constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Background colors
    background: string;
    surface: string;
    card: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textLight: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border and divider
    border: string;
    divider: string;
    
    // Interactive elements
    ripple: string;
    disabled: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    body1: { fontSize: number; fontWeight: string; lineHeight: number };
    body2: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#FF6B35',
    primaryLight: '#FFF5F2',
    primaryDark: '#E55A2B',
    
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    
    text: '#1A1A1A',
    textSecondary: '#666666',
    textLight: '#999999',
    
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    border: '#E0E0E0',
    divider: '#F0F0F0',
    
    ripple: 'rgba(255, 107, 53, 0.1)',
    disabled: '#CCCCCC',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body1: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
    body2: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textLight: '#999999',
    
    border: '#333333',
    divider: '#2A2A2A',
    
    ripple: 'rgba(255, 107, 53, 0.2)',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await SecureStore.getItemAsync(STORAGE_KEYS.THEME);
      if (storedTheme && isValidThemeMode(storedTheme)) {
        setThemeModeState(storedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading stored theme:', error);
    }
  };

  const isValidThemeMode = (mode: string): boolean => {
    return ['light', 'dark', 'system'].includes(mode);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
      throw error;
    }
  };

  const getCurrentTheme = (): Theme => {
    const shouldUseDark = themeMode === 'dark' || 
      (themeMode === 'system' && systemColorScheme === 'dark');
    
    return shouldUseDark ? darkTheme : lightTheme;
  };

  const isDark = themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const value: ThemeContextType = {
    theme: getCurrentTheme(),
    themeMode,
    isDark,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}