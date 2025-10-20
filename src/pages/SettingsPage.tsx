import { useState } from 'react';
import { User, Bell, Shield, Palette, Smartphone, Sun, Moon, Monitor } from 'lucide-react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PWAInstallSettings } from '../components/settings/PWAInstallSettings';
import { ConsentSettings } from '../components/settings/ConsentSettings';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSize } from '../hooks/useFontSize';
import { useAnimation } from '../hooks/useAnimation';

const SettingsPage = () => {
  const { currentUser } = useDemoMode();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { transitionsEnabled, reducedMotion, setTransitionsEnabled, setReducedMotion } = useAnimation();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'display' | 'app'>('notifications');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* 固定ヘッダーコンテナ */}
      <div className="sticky top-0 z-30">
        {/* タイトルヘッダー */}
        <div className="hr-title-header">
          <div className="hr-title-content">
            <div className="hr-title-icon">⚙️</div>
            <h1 className="hr-title-text">
              設定
            </h1>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="hr-category-filter">
          <div className="hr-category-container">
            <button
              onClick={() => setActiveTab('profile')}
              className={`hr-category-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>プロフィール</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`hr-category-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span>通知</span>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`hr-category-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            >
              <Shield className="w-4 h-4" />
              <span>プライバシー</span>
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`hr-category-btn ${activeTab === 'display' ? 'active' : ''}`}
            >
              <Palette className="w-4 h-4" />
              <span>表示</span>
            </button>
            <button
              onClick={() => setActiveTab('app')}
              className={`hr-category-btn ${activeTab === 'app' ? 'active' : ''}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>アプリ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hr-messages-container">
        <div className="max-w-7xl mx-auto">

        {/* タブコンテンツ */}
        <div className="space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">プロフィール設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">名前</label>
                  <input
                    type="text"
                    value={currentUser.name}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">役職</label>
                  <input
                    type="text"
                    value={currentUser.position}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">部門</label>
                  <input
                    type="text"
                    value={currentUser.department}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <NotificationSettings userId={currentUser.id || 'demo-user'} />
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                {/* VoiceDriveデータ分析同意設定 */}
                <ConsentSettings userId={currentUser.id || 'demo-user'} />

                {/* その他のプライバシー設定 */}
                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">その他のプライバシー設定</h2>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400">プロフィール公開設定</h3>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-800 dark:text-gray-300">プロフィールを公開</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-800 dark:text-gray-300">投稿履歴を公開</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-800 dark:text-gray-300">評価スコアを公開</span>
                        <input type="checkbox" className="toggle" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">表示設定</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">テーマ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        ダーク
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          theme === 'light'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        ライト
                      </button>
                      <button
                        onClick={() => setTheme('auto')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          theme === 'auto'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                        自動
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">文字サイズ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setFontSize('small')}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          fontSize === 'small'
                            ? 'bg-indigo-500 text-white text-sm'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 text-sm'
                        }`}
                      >
                        小
                      </button>
                      <button
                        onClick={() => setFontSize('medium')}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          fontSize === 'medium'
                            ? 'bg-indigo-500 text-white text-base'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 text-base'
                        }`}
                      >
                        中
                      </button>
                      <button
                        onClick={() => setFontSize('large')}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          fontSize === 'large'
                            ? 'bg-indigo-500 text-white text-lg'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 text-lg'
                        }`}
                      >
                        大
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">アニメーション設定</h3>
                    <label className="flex items-center justify-between py-2 cursor-pointer">
                      <span className="text-gray-800 dark:text-gray-300">画面遷移アニメーション</span>
                      <input
                        type="checkbox"
                        checked={transitionsEnabled}
                        onChange={(e) => setTransitionsEnabled(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                    </label>
                    <label className="flex items-center justify-between py-2 cursor-pointer">
                      <span className="text-gray-800 dark:text-gray-300">低スペックモード</span>
                      <input
                        type="checkbox"
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* App Settings */}
            {activeTab === 'app' && <PWAInstallSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;