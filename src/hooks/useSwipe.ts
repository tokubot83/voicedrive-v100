import { useEffect, useState } from 'react';

interface SwipeInput {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  edgeSwipeThreshold?: number;
}

const useSwipe = ({ onSwipeLeft, onSwipeRight, minSwipeDistance = 50, edgeSwipeThreshold = 50 }: SwipeInput) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // タッチ対象がボタンやインタラクティブ要素の場合はスワイプを無効化
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.clickable') ||
        target.closest('.comment-button') ||
        target.closest('.vote-button') ||
        target.closest('.interactive')
      )) {
        return;
      }
      
      const touchX = e.targetTouches[0].clientX;
      const touchY = e.targetTouches[0].clientY;
      
      // 右スワイプは画面左端からのみ、左スワイプは画面右端からのみ有効
      if (onSwipeRight && touchX > edgeSwipeThreshold) {
        return; // 画面左端以外からの右スワイプは無視
      }
      if (onSwipeLeft && touchX < window.innerWidth - edgeSwipeThreshold) {
        return; // 画面右端以外からの左スワイプは無視
      }
      
      setTouchStart(touchX);
      setTouchStartY(touchY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // touchStartが設定されていない場合は処理しない
      if (!touchStart) return;
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isSwipeLeft = distance > minSwipeDistance;
      const isSwipeRight = distance < -minSwipeDistance;

      // 水平方向のスワイプであることを確認（垂直スクロールと区別）
      const verticalDistance = Math.abs(touchStartY - (touchEnd || touchStart));
      const horizontalDistance = Math.abs(distance);
      
      // 水平スワイプが垂直スワイプより明確に大きい場合のみ有効
      if (horizontalDistance > verticalDistance * 1.5) {
        if (isSwipeLeft && onSwipeLeft) {
          onSwipeLeft();
        }
        
        if (isSwipeRight && onSwipeRight) {
          onSwipeRight();
        }
      }
      
      // リセット
      setTouchStart(0);
      setTouchEnd(0);
      setTouchStartY(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, minSwipeDistance]);

  return null;
};

export default useSwipe;