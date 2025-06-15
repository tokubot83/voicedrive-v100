import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';
import { AuthProvider } from './hooks/useAuth';
import { NotificationService } from './services/NotificationService';

function App() {
  useEffect(() => {
    // デモ通知の初期化（田中太郎の1on1プロジェクト緊急メンバー選出通知）
    const initDemoNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        await notificationService.initializeDemoNotifications();
      } catch (error) {
        console.error('デモ通知初期化エラー:', error);
      }
    };

    // 少し遅延させて初期化
    const timer = setTimeout(initDemoNotifications, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoModeProvider>
          <TabProvider>
            <DemoModeController />
            <AppRouter />
          </TabProvider>
        </DemoModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;