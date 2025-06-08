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
      <div className="flex max-w-[1200px] mx-auto min-h-screen pt-12">
        <Sidebar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          userRole={userRole}
        />
        
        <MainContent 
          currentPage={currentPage}
          selectedPostType={selectedPostType}
          setSelectedPostType={setSelectedPostType}
          toggleSidebar={toggleSidebar}
        />
        
        <RightSidebar />
        
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