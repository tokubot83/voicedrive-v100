import React from 'react';
import PersonalDashboard from '../components/dashboards/PersonalDashboard';

const PersonalDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">マイダッシュボード</h1>
            <p className="text-gray-400 text-sm">あなたの活動状況を確認</p>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="overflow-y-auto">
        <PersonalDashboard />
      </div>
    </div>
  );
};

export default PersonalDashboardPage;