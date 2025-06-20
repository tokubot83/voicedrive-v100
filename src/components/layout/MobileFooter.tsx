import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export function MobileFooter() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-50">
      <nav className="flex items-center justify-center h-14">
        {/* ホームボタンのみ */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center h-full px-8 relative ${
            isHome ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <Home 
            className="w-6 h-6" 
            fill={isHome ? 'currentColor' : 'none'}
            strokeWidth={isHome ? 0 : 2}
          />
        </Link>
      </nav>
    </div>
  );
}