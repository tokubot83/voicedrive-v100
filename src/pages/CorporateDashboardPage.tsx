import React from 'react';
import CorporateDashboard from '../components/dashboards/CorporateDashboard';

const CorporateDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">法人統括ダッシュボード</h1>
            <p className="text-gray-400 text-sm">法人全体の統括管理</p>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="overflow-y-auto">
        <CorporateDashboard />
      </div>
    </div>
  );
};

export default CorporateDashboardPage;