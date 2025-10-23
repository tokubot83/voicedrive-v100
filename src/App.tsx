import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NotificationService from './services/NotificationService';
import AppBadgeService from './services/AppBadgeService';
import ErrorDebugger from './components/debug/ErrorDebugger';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

// React Query Client の作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5分
    },
  },
});

function App() {
  useEffect(() => {
    // デモ通知の初期化（田中太郎の1on1プロジェクト緊急メンバー選出通知）
    const initDemoNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        // initializeDemoNotificationsメソッドが存在する場合のみ実行
        if (typeof (notificationService as any).initializeDemoNotifications === 'function') {
          await (notificationService as any).initializeDemoNotifications();
        }
      } catch (error) {
        console.error('デモ通知初期化エラー:', error);
      }
    };

    // アプリバッジサービスの初期化
    const initAppBadge = () => {
      const badgeService = AppBadgeService.getInstance();
      const support = badgeService.getSupport();

      // サポート状況をログ出力
      console.log(`App Badge Support: ${support.isSupported ? '✅' : '❌'} (Platform: ${support.platform})`);

      // バッジの定期更新を開始（30秒ごと）
      if (support.isSupported) {
        badgeService.startPeriodicUpdate({
          updateInterval: 30000, // 30秒
          enabled: true
        });

        // ページ表示時に即座に更新
        badgeService.updateBadge();
      }
    };

    // 少し遅延させて初期化
    const timer = setTimeout(initDemoNotifications, 1000);

    // バッジサービスを初期化
    initAppBadge();

    // クリーンアップ
    return () => {
      clearTimeout(timer);
      // アプリ終了時に定期更新を停止
      AppBadgeService.getInstance().stopPeriodicUpdate();
    };
  }, []);

  return (
    <ErrorDebugger>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <UserProvider>
                <DemoModeProvider>
                  <TabProvider>
                    <DemoModeController />
                    <AppRouter />
                    <PWAInstallPrompt />
                  </TabProvider>
                </DemoModeProvider>
              </UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorDebugger>
  );
}

export default App;