import React from 'react';
import IntegratedCorporateDashboard from '../components/dashboards/IntegratedCorporateDashboard';
import { useDemoMode } from '../components/demo/DemoModeController';
import { useNavigate } from 'react-router-dom';

const IntegratedCorporateDashboardPage: React.FC = () => {
  const { currentUser } = useDemoMode();
  const navigate = useNavigate();

  // レベル5以上のみアクセス可能
  if (!currentUser || currentUser.permissionLevel < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            法人統合ダッシュボードにはレベル5以上の権限が必要です。
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return <IntegratedCorporateDashboard />;
};

export default IntegratedCorporateDashboardPage;