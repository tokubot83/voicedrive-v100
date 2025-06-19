import React from 'react';
import InterviewManagementDashboard from '../components/interview/InterviewManagementDashboard';
import { MobileFooter } from '../components/layout/MobileFooter';

const InterviewManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">面談管理システム</h1>
            <p className="text-gray-400 text-sm">人財統括本部 - 面談予約・スケジュール管理</p>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* メインコンテンツ */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <InterviewManagementDashboard />
          </div>
        </div>
      </div>
      
      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default InterviewManagementPage;