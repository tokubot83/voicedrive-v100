import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HRManagementDashboard from '../components/dashboards/HRManagementDashboard';

const HRManagementDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* カスタムヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ホーム</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">人事統括ダッシュボード</h1>
              <p className="text-gray-400 text-sm">人事戦略と組織管理</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <div className="overflow-y-auto">
        <HRManagementDashboard />
      </div>
    </div>
  );
};

export default HRManagementDashboardPage;