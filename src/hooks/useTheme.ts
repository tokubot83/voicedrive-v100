import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'auto';
export type ResolvedTheme = 'dark' | 'light';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

/**
 * テーマ管理フック
 * ダーク/ライト/自動の3モードをサポート
 */
export const useTheme = (): UseThemeReturn => {
  // localStorageから初期値を取得（デフォルトはdark）
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('voicedrive-theme');
    return (savedTheme as Theme) || 'dark';
  });

  // システムのカラースキーム設定を監視
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // 実際に適用されるテーマ（autoの場合はシステム設定に従う）
  const resolvedTheme: ResolvedTheme = theme === 'auto' ? systemPreference : theme;

  // システムのカラースキーム変更を監視
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // モダンブラウザ
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // 古いブラウザ対応
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // テーマが変更されたらDOMとlocalStorageを更新
  useEffect(() => {
    const root = document.documentElement;

    // すべてのテーマクラスを削除
    root.classList.remove('light-theme', 'dark-theme', 'dark');

    // 適用するテーマのクラスを追加
    if (resolvedTheme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.add('dark'); // Tailwindの標準darkクラスも追加
    }

    // localStorageに保存
    localStorage.setItem('voicedrive-theme', theme);
  }, [theme, resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
};
