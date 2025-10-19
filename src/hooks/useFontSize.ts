import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

interface UseFontSizeReturn {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

/**
 * 文字サイズ管理フック
 * 小/中/大の3段階をサポート
 */
export const useFontSize = (): UseFontSizeReturn => {
  // localStorageから初期値を取得（デフォルトはmedium）
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem('voicedrive-font-size');
    return (savedSize as FontSize) || 'medium';
  });

  // 文字サイズが変更されたらDOMとlocalStorageを更新
  useEffect(() => {
    const root = document.documentElement;

    // すべての文字サイズクラスを削除
    root.classList.remove('font-small', 'font-medium', 'font-large');

    // 選択された文字サイズのクラスを追加
    root.classList.add(`font-${fontSize}`);

    // localStorageに保存
    localStorage.setItem('voicedrive-font-size', fontSize);
  }, [fontSize]);

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
  };

  return {
    fontSize,
    setFontSize,
  };
};
