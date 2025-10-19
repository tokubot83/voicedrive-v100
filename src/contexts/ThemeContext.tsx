import React, { createContext, useContext } from 'react';
import { useTheme as useThemeHook, Theme, ResolvedTheme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * テーマコンテキストプロバイダー
 * アプリ全体でテーマ設定を共有
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeState = useThemeHook();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * テーマコンテキストを使用するフック
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
