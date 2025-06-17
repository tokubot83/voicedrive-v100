import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - prevScrollY) < 5) {
        ticking = false;
        return;
      }

      // スクロール位置が上部に近い場合は常に表示
      if (scrollY < 50) {
        setIsVisible(true);
        setScrollDirection(null);
      } else if (scrollY > prevScrollY) {
        // 下にスクロール
        setScrollDirection('down');
        setIsVisible(false);
      } else {
        // 上にスクロール
        setScrollDirection('up');
        setIsVisible(true);
      }

      setPrevScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [prevScrollY]);

  return { scrollDirection, isVisible };
}