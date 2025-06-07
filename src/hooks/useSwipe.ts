import { useEffect, useState } from 'react';

interface SwipeInput {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

const useSwipe = ({ onSwipeLeft, onSwipeRight, minSwipeDistance = 50 }: SwipeInput) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isSwipeLeft = distance > minSwipeDistance;
      const isSwipeRight = distance < -minSwipeDistance;

      if (isSwipeLeft && onSwipeLeft) {
        onSwipeLeft();
      }
      
      if (isSwipeRight && onSwipeRight) {
        onSwipeRight();
      }
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