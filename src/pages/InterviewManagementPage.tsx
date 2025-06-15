import React from 'react';
import InterviewManagementDashboard from '../components/interview/InterviewManagementDashboard';

const InterviewManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダーセクション */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              🏥 面談管理システム
            </h1>
            <p className="text-gray-300 text-lg">
              人財統括本部 - 面談予約・スケジュール管理
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <InterviewManagementDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewManagementPage;