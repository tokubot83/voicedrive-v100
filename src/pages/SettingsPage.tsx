import { useState } from 'react';
import { Bell, Shield, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { ConsentSettings } from '../components/settings/ConsentSettings';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
  const { currentUser } = useDemoMode();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'notifications' | 'theme' | 'consent'>('notifications');
  
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
              onClick={() => setActiveTab('notifications')}
              className={`hr-category-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span>通知</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`hr-category-btn ${activeTab === 'theme' ? 'active' : ''}`}
            >
              <Palette className="w-4 h-4" />
              <span>テーマ</span>
            </button>
            <button
              onClick={() => setActiveTab('consent')}
              className={`hr-category-btn ${activeTab === 'consent' ? 'active' : ''}`}
            >
              <Shield className="w-4 h-4" />
              <span>データ分析同意</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hr-messages-container">
        <div className="max-w-7xl mx-auto">

        {/* タブコンテンツ */}
        <div className="space-y-6">
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <NotificationSettings userId={currentUser.id || 'demo-user'} />
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">テーマ設定</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">カラーテーマ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span>ダーク</span>
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2 ${
                          theme === 'light'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        <span>ライト</span>
                      </button>
                      <button
                        onClick={() => setTheme('auto')}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2 ${
                          theme === 'auto'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        <Monitor className="w-5 h-5" />
                        <span>自動</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      自動モードでは、OSの設定に合わせてテーマが切り替わります
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">テーマプレビュー</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-2">ライトモード</p>
                        <div className="space-y-2">
                          <div className="h-2 bg-blue-500 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-2">ダークモード</p>
                        <div className="space-y-2">
                          <div className="h-2 bg-blue-500 rounded w-3/4"></div>
                          <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                          <div className="h-2 bg-slate-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">💡 ヒント</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• ライトモード: X（Twitter）のような完全白ベース</li>
                      <li>• ダークモード: 夜勤帯の使用に最適</li>
                      <li>• 自動モード: 時間帯に合わせて自動切替</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Consent Settings */}
            {activeTab === 'consent' && (
              <ConsentSettings userId={currentUser.id || 'demo-user'} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;