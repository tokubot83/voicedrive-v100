import { useState, useEffect } from 'react';

interface AnimationSettings {
  transitionsEnabled: boolean;
  reducedMotion: boolean;
}

interface UseAnimationReturn {
  transitionsEnabled: boolean;
  reducedMotion: boolean;
  setTransitionsEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

/**
 * アニメーション管理フック
 * 画面遷移アニメーションと低スペックモードをサポート
 */
export const useAnimation = (): UseAnimationReturn => {
  // localStorageから初期値を取得
  const [settings, setSettings] = useState<AnimationSettings>(() => {
    const saved = localStorage.getItem('voicedrive-animation-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { transitionsEnabled: true, reducedMotion: false };
      }
    }
    return { transitionsEnabled: true, reducedMotion: false };
  });

  // 設定が変更されたらDOMとlocalStorageを更新
  useEffect(() => {
    const root = document.documentElement;

    // アニメーション無効化クラスの制御
    if (!settings.transitionsEnabled) {
      root.classList.add('no-transitions');
    } else {
      root.classList.remove('no-transitions');
    }

    // 低スペックモード（アニメーション削減）クラスの制御
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // localStorageに保存
    localStorage.setItem('voicedrive-animation-settings', JSON.stringify(settings));
  }, [settings]);

  const setTransitionsEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, transitionsEnabled: enabled }));
  };

  const setReducedMotion = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion: enabled }));
  };

  return {
    transitionsEnabled: settings.transitionsEnabled,
    reducedMotion: settings.reducedMotion,
    setTransitionsEnabled,
    setReducedMotion,
  };
};
