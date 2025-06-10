import React, { useState } from 'react';
import { usePermissions } from '../permissions/hooks/usePermissions';
import Header from '../components/Header';
import WhistleblowingReportForm from '../components/whistleblowing/WhistleblowingReportForm';
import WhistleblowingDashboard from '../components/whistleblowing/WhistleblowingDashboard';
import { ReportSubmissionForm } from '../types/whistleblowing';

const WhistleblowingPage: React.FC = () => {
  const { userLevel } = usePermissions();
  const [showReportForm, setShowReportForm] = useState(false);

  const handleNewReport = () => {
    setShowReportForm(true);
  };

  const handleSubmitReport = (report: ReportSubmissionForm) => {
    // 実際の実装では、ここでAPIにデータを送信
    console.log('新しい通報:', report);
    
    // 匿名IDを生成（実際はサーバーサイドで生成）
    const anonymousId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    alert(`通報が正常に提出されました。\n\n追跡ID: ${anonymousId}\n\nこのIDは進捗確認に使用できます。大切に保管してください。`);
    setShowReportForm(false);
  };

  const handleCancelReport = () => {
    setShowReportForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header 
        toggleSidebar={() => {}}
      />
      <main className="pt-20 pb-8 px-4">
        {showReportForm ? (
          <WhistleblowingReportForm 
            onSubmit={handleSubmitReport}
            onCancel={handleCancelReport}
          />
        ) : (
          <WhistleblowingDashboard onNewReport={handleNewReport} />
        )}
      </main>
    </div>
  );
};

export default WhistleblowingPage;