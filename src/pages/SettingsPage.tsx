import { useState } from 'react';
import { User, Bell, Shield, Palette, Smartphone } from 'lucide-react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PWAInstallSettings } from '../components/settings/PWAInstallSettings';

const SettingsPage = () => {
  const { currentUser } = useDemoMode();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'display' | 'app'>('notifications');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
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
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4">プロフィール設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">名前</label>
                  <input 
                    type="text" 
                    value={currentUser.name}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">役職</label>
                  <input 
                    type="text" 
                    value={currentUser.position}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">部門</label>
                  <input 
                    type="text" 
                    value={currentUser.department}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
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
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4">プライバシー設定</h2>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400">プロフィール公開設定</h3>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">プロフィールを公開</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">投稿履歴を公開</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">評価スコアを公開</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">データ共有設定</h3>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">匿名データの分析利用を許可</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">改善提案の共有を許可</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold mb-4">表示設定</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">テーマ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        ダーク
                      </button>
                      <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                        ライト
                      </button>
                      <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                        自動
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">文字サイズ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                        小
                      </button>
                      <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        中
                      </button>
                      <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                        大
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">アニメーション設定</h3>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">画面遷移アニメーション</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">低スペックモード</span>
                      <input type="checkbox" className="toggle" />
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