import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../permissions/hooks/usePermissions';
import WhistleblowingReportForm from '../components/whistleblowing/WhistleblowingReportForm';
import WhistleblowingDashboard from '../components/whistleblowing/WhistleblowingDashboard';
import { ReportSubmissionForm } from '../types/whistleblowing';
import { useDemoMode } from '../components/demo/DemoModeController';

const WhistleblowingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userLevel } = usePermissions();
  const { currentUser } = useDemoMode();
  const [showReportForm, setShowReportForm] = useState(false);

  const handleNewReport = () => {
    setShowReportForm(true);
  };

  const handleSubmitReport = (report: ReportSubmissionForm) => {
    // 実際の実装では、ここでAPIにデータを送信
    console.log('新しい相談:', report);
    
    // 匿名IDを生成（実際はサーバーサイドで生成）
    const anonymousId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    alert(`相談が正常に提出されました。\n\n追跡ID: ${anonymousId}\n\nこのIDは進捗確認に使用できます。大切に保管してください。`);
    setShowReportForm(false);
  };

  const handleCancelReport = () => {
    setShowReportForm(false);
  };

  return (
    <div className="min-h-screen text-white">
      {/* 管理画面ヘッダー */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-xl">←</span>
              <span>← ホーム</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">🚨</span>
                コンプライアンス窓口
              </h1>
              <p className="text-gray-400 text-sm">
                安全で匿名性を保護した相談窓口
              </p>
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                Level {currentUser.permissionLevel}
              </span>
              <span className="text-gray-300">{currentUser.name}</span>
            </div>
          )}
        </div>
      </div>

      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {showReportForm ? (
            <WhistleblowingReportForm 
              onSubmit={handleSubmitReport}
              onCancel={handleCancelReport}
            />
          ) : (
            <WhistleblowingDashboard onNewReport={handleNewReport} />
          )}
        </div>
      </main>
    </div>
  );
};

export default WhistleblowingPage;