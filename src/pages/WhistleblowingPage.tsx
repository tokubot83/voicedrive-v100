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
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">コンプライアンス窓口</h1>
            <p className="text-gray-400 text-sm">安全で匿名性を保護した相談窓口</p>
          </div>
          
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