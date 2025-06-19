import React from 'react';
import ExecutiveLevelDashboard from '../components/dashboards/ExecutiveLevelDashboard';

const ExecutiveDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">経営ダッシュボード</h1>
            <p className="text-gray-400 text-sm">組織全体の経営状況</p>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="overflow-y-auto">
        <ExecutiveLevelDashboard />
      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;