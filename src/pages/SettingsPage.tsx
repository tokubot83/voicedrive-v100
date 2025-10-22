import { useState } from 'react';
import { Bell, Shield } from 'lucide-react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { ConsentSettings } from '../components/settings/ConsentSettings';

const SettingsPage = () => {
  const { currentUser } = useDemoMode();
  const [activeTab, setActiveTab] = useState<'notifications' | 'consent'>('notifications');
  
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