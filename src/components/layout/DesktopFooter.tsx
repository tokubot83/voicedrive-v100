import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export function DesktopFooter() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t border-gray-800 hidden md:block z-50">
      <nav className="flex items-center justify-center h-12">
        <Link
          to="/"
          className={`flex items-center justify-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
            isHome 
              ? 'text-blue-500 bg-blue-500/10' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Home 
            className="w-5 h-5" 
            fill={isHome ? 'currentColor' : 'none'}
            strokeWidth={isHome ? 0 : 2}
          />
          <span className="text-sm font-medium">ホーム</span>
        </Link>
      </nav>
    </div>
  );
}