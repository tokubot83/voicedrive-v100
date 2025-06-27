import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export function DesktopFooter() {
  console.log('🔧 DesktopFooter: ================================ レンダリング開始 ================================');
  
  const location = useLocation();
  const isHome = location.pathname === '/';

  // 詳細デバッグログ（最強化版）
  console.log('🔧 DesktopFooter: 現在のパス =', `"${location.pathname}"`);
  console.log('🔧 DesktopFooter: ホーム判定 =', isHome);
  console.log('🔧 DesktopFooter: window.innerWidth =', window.innerWidth);
  console.log('🔧 DesktopFooter: window.innerWidth >= 768 =', window.innerWidth >= 768);
  console.log('🔧 DesktopFooter: コンポーネント表示準備完了');
  console.log('🔧 DesktopFooter: ================================ レンダリング処理 ================================');

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 w-full h-16 bg-red-500 border-t-4 border-yellow-400 hidden md:block z-[9999]"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '64px',
        backgroundColor: '#ef4444',
        borderTop: '4px solid #facc15',
        zIndex: 9999,
        display: window.innerWidth >= 768 ? 'block' : 'none'
      }}
    >
      <nav className="flex items-center justify-center h-full w-full bg-blue-600 text-white text-xl font-bold">
        PC用フッター表示テスト - ホームに戻る
        <Link
          to="/"
          className="ml-4 bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200"
        >
          <Home className="w-5 h-5 inline mr-2" />
          ホーム
        </Link>
      </nav>
    </div>
  );
}