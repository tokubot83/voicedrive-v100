import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import MobileOverlay from './components/MobileOverlay';
import MedicalProfileDemo from './components/profile/MedicalProfileDemo';
import TimeAxisDemo from './components/TimeAxisDemo';
import useSwipe from './hooks/useSwipe';
import { PostType, UserRole } from './types';
import { DemoModeProvider, DemoModeController, useDemoMode } from './components/demo/DemoModeController';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType>('improvement');
  const { currentUser } = useDemoMode();
  
  // Map demo user role to UserRole type
  const userRole = currentUser.role as UserRole;

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

  // Medical Profile Demo Mode
  if (currentPage === 'medical-profile') {
    return <MedicalProfileDemo />;
  }
  
  // Time Axis Demo Mode
  if (currentPage === 'time-axis') {
    return <TimeAxisDemo />;
  }

  return (
    <>
      <DemoModeController />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* モバイルメニューボタン（lg以下で表示） */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-full p-3 shadow-lg hover:bg-slate-700/90 transition-all duration-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* メインコンテナ */}
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-container flex relative">
            {/* 左サイドバー（デスクトップ） */}
            <aside className="hidden lg:block w-sidebar-left flex-shrink-0">
              <div className="sticky top-0 h-screen">
                <Sidebar 
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  isOpen={false}
                  closeSidebar={closeSidebar}
                  userRole={userRole}
                />
              </div>
            </aside>
            
            {/* メインコンテンツ */}
            <main className="flex-1 max-w-main min-w-0 border-x-0 lg:border-x border-slate-700/50">
              <MainContent 
                currentPage={currentPage}
                selectedPostType={selectedPostType}
                setSelectedPostType={setSelectedPostType}
                toggleSidebar={toggleSidebar}
              />
            </main>
            
            {/* 右サイドバー（xl以上で表示） */}
            <aside className="hidden xl:block w-sidebar-right flex-shrink-0">
              <div className="sticky top-0 h-screen">
                <RightSidebar />
              </div>
            </aside>
          </div>
        </div>
        
        {/* モバイル用サイドバー */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-sidebar-left transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full bg-black/95 backdrop-blur-xl border-r border-slate-700/50">
            <Sidebar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
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
      </div>
    </>
  );
}

function App() {
  return (
    <DemoModeProvider>
      <AppContent />
    </DemoModeProvider>
  );
}

export default App;