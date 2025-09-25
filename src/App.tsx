import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './contexts/UserContext';
import NotificationService from './services/NotificationService';
import AppBadgeService from './services/AppBadgeService';
import ErrorDebugger from './components/debug/ErrorDebugger';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function App() {
  useEffect(() => {
    // デモ通知の初期化（田中太郎の1on1プロジェクト緊急メンバー選出通知）
    const initDemoNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        // initializeDemoNotificationsメソッドが存在する場合のみ実行
        if (typeof notificationService.initializeDemoNotifications === 'function') {
          await notificationService.initializeDemoNotifications();
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
      <BrowserRouter>
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
      </BrowserRouter>
    </ErrorDebugger>
  );
}

export default App;