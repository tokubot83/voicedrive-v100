import { useEffect } from 'react';

export type Theme = 'dark';
export type ResolvedTheme = 'dark';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

/**
 * テーマ管理フック
 * ダークモード固定
 */
export const useTheme = (): UseThemeReturn => {
  // ダークモード固定
  const theme: Theme = 'dark';
  const resolvedTheme: ResolvedTheme = 'dark';

  // DOMにダークテーマクラスを追加
  useEffect(() => {
    const root = document.documentElement;

    // すべてのテーマクラスを削除
    root.classList.remove('light-theme', 'dark-theme', 'dark');

    // ダークテーマのクラスを追加
    root.classList.add('dark-theme');
    root.classList.add('dark'); // Tailwindの標準darkクラスも追加
  }, []);

  // setThemeは何もしない（互換性のため残す）
  const setTheme = (_newTheme: Theme) => {
    // ダークモード固定のため何もしない
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
};
