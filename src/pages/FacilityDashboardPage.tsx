import React from 'react';
import FacilityDashboard from '../components/dashboards/FacilityDashboard';

const FacilityDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">施設管理ダッシュボード</h1>
            <p className="text-gray-400 text-sm">施設全体の運営管理</p>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="overflow-y-auto">
        <FacilityDashboard />
      </div>
    </div>
  );
};

export default FacilityDashboardPage;