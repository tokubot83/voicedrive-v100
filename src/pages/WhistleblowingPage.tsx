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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Custom Header with Back Button */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">コンプライアンス窓口</h1>
            <p className="text-gray-400 text-sm">安全で匿名性を保護した相談窓口</p>
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
      </header>

      <div className="p-6">
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
      </div>
    </div>
  );
};

export default WhistleblowingPage;