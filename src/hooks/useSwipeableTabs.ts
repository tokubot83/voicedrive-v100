/**
 * Phase 7: モバイルスワイプナビゲーション
 *
 * タブ間のスワイプ切り替えを実現するカスタムフック
 * モバイルデバイスでのみ有効化され、PC版では無効
 */

import { useState, useEffect, useMemo } from 'react';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';

export interface UseSwipeableTabsOptions<T extends string | number> {
  /** 現在アクティブなタブ */
  activeTab: T;
  /** タブのID配列 */
  tabs: T[];
  /** タブ変更時のコールバック */
  onTabChange: (tab: T) => void;
  /** PC版でも有効化するか（デフォルト: false） */
  enableOnDesktop?: boolean;
  /** スワイプの最小距離（デフォルト: 50px） */
  swipeThreshold?: number;
  /** スワイプを無効化するか（デフォルト: false） */
  disabled?: boolean;
}

export interface UseSwipeableTabsReturn {
  /** react-swipeableのハンドラー */
  handlers: SwipeableHandlers;
  /** 現在のスワイプ方向 */
  swipeDirection: 'left' | 'right' | null;
  /** トランジション中かどうか */
  isTransitioning: boolean;
  /** モバイルデバイスかどうか */
  isMobile: boolean;
}

/**
 * モバイルデバイスかどうかを判定
 */
const checkIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  // lg breakpoint (1024px) 未満をモバイルとみなす
  return window.innerWidth < 1024;
};

/**
 * タブ間のスワイプナビゲーションを提供するカスタムフック
 */
export const useSwipeableTabs = <T extends string | number>({
  activeTab,
  tabs,
  onTabChange,
  enableOnDesktop = false,
  swipeThreshold = 50,
  disabled = false
}: UseSwipeableTabsOptions<T>): UseSwipeableTabsReturn => {
  const [isMobile, setIsMobile] = useState(checkIsMobile);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ウィンドウリサイズ時にモバイル判定を更新
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 現在のタブインデックス
  const currentIndex = useMemo(
    () => tabs.indexOf(activeTab),
    [tabs, activeTab]
  );

  // 次のタブに移動（左スワイプ）
  const goToNext = () => {
    if (currentIndex < tabs.length - 1) {
      setSwipeDirection('left');
      setIsTransitioning(true);
      onTabChange(tabs[currentIndex + 1]);

      // トランジション後にリセット
      setTimeout(() => {
        setSwipeDirection(null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // 前のタブに移動（右スワイプ）
  const goToPrev = () => {
    if (currentIndex > 0) {
      setSwipeDirection('right');
      setIsTransitioning(true);
      onTabChange(tabs[currentIndex - 1]);

      // トランジション後にリセット
      setTimeout(() => {
        setSwipeDirection(null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // スワイプ機能が有効かどうか
  const isSwipeEnabled = !disabled && (isMobile || enableOnDesktop);

  // react-swipeableのハンドラー
  const handlers = useSwipeable({
    onSwipedLeft: isSwipeEnabled ? goToNext : undefined,
    onSwipedRight: isSwipeEnabled ? goToPrev : undefined,
    trackMouse: false,  // PC版ではマウスドラッグを無効化
    delta: swipeThreshold,  // 最小スワイプ距離
    preventScrollOnSwipe: false,  // 縦スクロールを妨げない
    trackTouch: isSwipeEnabled,  // タッチトラッキングの有効/無効
  });

  return {
    handlers: isSwipeEnabled ? handlers : {},
    swipeDirection,
    isTransitioning,
    isMobile
  };
};
