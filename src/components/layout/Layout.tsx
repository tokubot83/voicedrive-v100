import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import RightSidebar from '../RightSidebar';
import MobileOverlay from '../MobileOverlay';
import Breadcrumb from '../Breadcrumb';
import useSwipe from '../../hooks/useSwipe';
import { UserRole } from '../../types';
import { useDemoMode } from '../demo/DemoModeController';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useDemoMode();
  
  // Map demo user role to UserRole type
  const userRole = currentUser.role as UserRole;
  
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
    '/budget',
    '/budget-planning',
    '/facility-management',
    '/team-management',
    '/org-development'
  ];
  
  // 現在のパスが専用管理画面かどうかを判定
  const isManagementPage = managementPaths.some(path => 
    location.pathname.includes(path)
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // スワイプ機能の追加
  useSwipe({
    onSwipeLeft: closeSidebar,
    onSwipeRight: openSidebar,
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
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${isDemoMode ? 'pt-[80px] md:pt-[60px]' : ''}`}>
      {/* モバイルメニューボタン（lg以下で表示、管理画面では非表示） */}
      {!isManagementPage && (
        <button 
          onClick={toggleSidebar}
          className={`lg:hidden fixed left-4 z-50 bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-full p-3 shadow-lg hover:bg-slate-700/90 transition-all duration-200 ${isDemoMode ? 'top-[100px] md:top-[80px]' : 'top-4'}`}
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
                <Sidebar 
                  currentPath={location.pathname}
                  isOpen={false}
                  closeSidebar={closeSidebar}
                  userRole={userRole}
                />
              </div>
            </aside>
          )}
          
          {/* メインコンテンツ */}
          <main className={`flex-1 ${isManagementPage ? 'w-full' : 'max-w-main'} min-w-0 ${isManagementPage ? '' : 'border-x-0 lg:border-x border-slate-700/50'}`}>
            <div className="w-full h-full bg-black/20 backdrop-blur-lg">
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
          <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-sidebar-left transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="h-full bg-black/95 backdrop-blur-xl border-r border-slate-700/50">
              <Sidebar 
                currentPath={location.pathname}
                isOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
                userRole={userRole}
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
    </div>
  );
};

export default Layout;