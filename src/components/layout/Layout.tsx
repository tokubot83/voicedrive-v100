import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { EnhancedSidebar } from './EnhancedSidebar';
import RightSidebar from '../RightSidebar';
import MobileOverlay from '../MobileOverlay';
import Breadcrumb from '../Breadcrumb';
import Header from '../Header';
import { MobileFooter } from './MobileFooter';
import { DesktopFooter } from './DesktopFooter';
import useSwipe from '../../hooks/useSwipe';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { UserRole } from '../../types';
import { useDemoMode } from '../demo/DemoModeController';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isDemoMode } = useDemoMode();
  const { isVisible } = useScrollDirection();
  
  // Map demo user role to UserRole type
  const userRole = currentUser?.role as UserRole | undefined;
  
  // 専用管理画面のパスを定義
  const managementPaths = [
    '/retirement-processing',
    '/authority',
    '/whistleblowing',
    '/admin-settings',
    '/system-management',
    '/projects',
    '/dashboard/personal',
    '/dashboard/team-leader',
    '/dashboard/department',
    '/dashboard/facility',
    '/dashboard/integrated-corporate',
    '/dashboard/hr-management',
    '/dashboard/strategic',
    '/dashboard/corporate',
    '/dashboard/executive',
    '/staff-dashboard/department',
    '/staff-dashboard/facility',
    '/staff-dashboard/corporate',
    '/personal-dashboard',
    '/team-dashboard',
    '/department-dashboard',
    '/facility-dashboard',
    '/corporate-dashboard',
    '/hr-dashboard',
    '/strategic-dashboard',
    '/strategic-overview',
    '/strategic-planning',
    '/strategic-initiatives',
    '/executive-overview',
    '/executive-reports',
    '/board-reports',
    '/organization-analytics',
    '/performance-analytics',
    '/talent-analytics',
    '/governance',
    '/policy-management',
    '/policy',
    '/budget',
    '/budget-planning',
    '/facility-management',
    '/team-management',
    '/org-development',
    '/admin',
    // ステーション系ページ
    '/personal-station',
    '/leader-station',
    '/department-station',
    '/section-station'
  ];
  
  // 現在のパスが専用管理画面かどうかを判定（修正版）
  const isManagementPage = managementPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  
  // ステーション系ページの確実な判定（追加対策）
  const isStationPage = ['/personal-station', '/leader-station', '/department-station', '/section-station']
    .includes(location.pathname);
  
  // 最終的な表示判定（管理画面またはステーション系ページ）
  const shouldShowDesktopFooter = isManagementPage || isStationPage;

  // 詳細デバッグログ（最強化版）
  console.log('🔧 Layout: ================================ パス判定開始 ================================');
  console.log('🔧 Layout: 現在のパス =', `"${location.pathname}"`);
  console.log('🔧 Layout: パス文字列の長さ =', location.pathname.length);
  console.log('🔧 Layout: パス文字列の文字コード =', [...location.pathname].map(c => c.charCodeAt(0)));
  console.log('🔧 Layout: 管理画面判定結果 =', isManagementPage);
  console.log('🔧 Layout: ⭐️ ステーション画面判定結果 =', isStationPage);
  console.log('🔧 Layout: 🎯 最終表示判定結果 =', shouldShowDesktopFooter);
  console.log('🔧 Layout: managementPaths配列の長さ =', managementPaths.length);
  
  // ステーション系パスの詳細確認
  console.log('🔧 Layout: ステーション系パス確認:');
  const stationPaths = ['/personal-station', '/leader-station', '/department-station', '/section-station'];
  stationPaths.forEach(stationPath => {
    const inArray = managementPaths.includes(stationPath);
    const exactMatch = location.pathname === stationPath;
    const startsWithMatch = location.pathname.startsWith(stationPath + '/');
    console.log(`  - ${stationPath}:`, { inArray, exactMatch, startsWithMatch });
  });
  
  // パス判定の詳細確認（修正版）
  const matchedPaths = managementPaths.filter(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  console.log('🔧 Layout: マッチしたパス（修正版） =', matchedPaths);
  
  // ステーション系パスの個別詳細チェック
  console.log('🔧 Layout: ⭐️ ステーション系パス個別チェック:');
  stationPaths.forEach((stationPath, index) => {
    const exactMatch = location.pathname === stationPath;
    console.log(`  ${index + 1}. "${stationPath}" === "${location.pathname}" = ${exactMatch}`);
  });
  
  // 現在のパスが特定のステーションパスと一致するかチェック
  const isCurrentPathInStationPaths = stationPaths.includes(location.pathname);
  console.log('🔧 Layout: ⭐️ stationPaths.includes(location.pathname) =', isCurrentPathInStationPaths);
  
  if (isCurrentPathInStationPaths) {
    console.log('🔧 Layout: 🎉 ステーションページ検出! =', location.pathname);
    console.log('🔧 Layout: 🎉 管理画面判定結果 =', isManagementPage);
    console.log('🔧 Layout: 🎉 ステーション画面判定結果 =', isStationPage);
    console.log('🔧 Layout: 🎉 最終表示判定結果 =', shouldShowDesktopFooter);
  } else {
    console.log('🔧 Layout: ❌ ステーションページではありません =', location.pathname);
  }
  
  console.log('🔧 Layout: ================================ パス判定終了 ================================');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // スワイプ機能の追加（画面端からのスワイプのみ）
  useSwipe({
    onSwipeLeft: closeSidebar,
    onSwipeRight: () => {
      // 右スワイプは画面左端からのみ有効
      if (window.innerWidth <= 768) {
        openSidebar();
      }
    },
    minSwipeDistance: 50,
    edgeSwipeThreshold: 30, // 画面端30px以内からのスワイプのみ有効
  });

  // ESCキーでサイドバーを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  // ウィンドウリサイズ時の処理
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isSidebarOpen) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isDemoMode ? 'pt-[80px] md:pt-[60px]' : ''} pb-16 md:pb-0`}>
      {/* ヘッダーを最上部に配置 */}
      {!isManagementPage && <Header toggleSidebar={toggleSidebar} />}
      {/* モバイルメニューボタン（lg以下で表示、管理画面では非表示） */}
      {!isManagementPage && (
        <button 
          onClick={toggleSidebar}
          className={`lg:hidden fixed left-4 top-4 z-50 bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-full p-3 shadow-lg hover:bg-slate-700/90 transition-all duration-300 ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {/* メインコンテナ */}
      <div className="flex justify-center min-h-screen">
        <div className={`w-full ${isManagementPage ? '' : 'max-w-container'} flex relative`}>
          {/* 左サイドバー（デスクトップ、管理画面では非表示） */}
          {!isManagementPage && (
            <aside className="hidden lg:block w-sidebar-left flex-shrink-0">
              <div className="sticky top-0 h-screen">
                <EnhancedSidebar 
                  currentPath={location.pathname}
                  onNavigate={(path) => navigate(path)}
                />
              </div>
            </aside>
          )}
          
          {/* メインコンテンツ */}
          <main className={`flex-1 ${isManagementPage ? 'w-full' : 'max-w-main'} min-w-0 ${isManagementPage ? '' : 'border-x-0 lg:border-x border-slate-700/50'}`}>
            <div className={`w-full h-full bg-black/80 backdrop-blur-lg ${
              isManagementPage ? '' : 'pt-20 md:pt-24'
            }`}>
              {!isManagementPage && <Breadcrumb />}
              <Outlet />
            </div>
          </main>
          
          {/* 右サイドバー（xl以上で表示、管理画面では非表示） */}
          {!isManagementPage && (
            <aside className="hidden xl:block w-sidebar-right flex-shrink-0">
              <div className="sticky top-0 h-screen">
                <RightSidebar />
              </div>
            </aside>
          )}
        </div>
      </div>
      
      {/* モバイル用サイドバー（管理画面では非表示） */}
      {!isManagementPage && (
        <>
          <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-sidebar-left transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="h-full bg-black/95 backdrop-blur-xl border-r border-slate-700/50">
              <EnhancedSidebar 
                currentPath={location.pathname}
                onNavigate={(path) => {
                  navigate(path);
                  closeSidebar();
                }}
              />
            </div>
          </div>
          
          {/* モバイルオーバーレイ */}
          <MobileOverlay 
            isOpen={isSidebarOpen}
            closeSidebar={closeSidebar}
          />
        </>
      )}
      
      {/* モバイルフッター */}
      <MobileFooter />
      
      {/* PC用フッター（管理画面またはステーション系ページで表示） */}
      {console.log('🔧 Layout: ================================ フッター表示判定 ================================')}
      {console.log('🔧 Layout: 🎯 DesktopFooter表示判定 =', shouldShowDesktopFooter)}
      {console.log('🔧 Layout: 🎯 isManagementPage =', isManagementPage)}
      {console.log('🔧 Layout: 🎯 isStationPage =', isStationPage)}
      {console.log('🔧 Layout: 🎯 shouldShowDesktopFooter =', shouldShowDesktopFooter)}
      {shouldShowDesktopFooter && (
        <>
          {console.log('🔧 Layout: 🎉 DesktopFooter レンダリング実行開始')}
          <DesktopFooter />
          {console.log('🔧 Layout: 🎉 DesktopFooter レンダリング実行完了')}
        </>
      )}
      {!shouldShowDesktopFooter && (
        <>
          {console.log('🔧 Layout: ❌ DesktopFooter 非表示（対象ページではない）')}
          {console.log('🔧 Layout: ❌ 非表示理由: isManagementPage =', isManagementPage, ', isStationPage =', isStationPage)}
        </>
      )}
    </div>
  );
};

export default Layout;