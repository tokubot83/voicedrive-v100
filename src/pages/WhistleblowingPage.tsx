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

  const handleSubmitReport = async (report: ReportSubmissionForm) => {
    try {
      const response = await fetch('/api/whistleblowing/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '通報の提出に失敗しました');
      }

      const data = await response.json();

      alert(
        `相談が正常に提出されました。\n\n` +
        `追跡ID: ${data.anonymousId}\n\n` +
        `このIDは進捗確認に使用できます。大切に保管してください。\n` +
        `受付番号: ${data.reportId.substring(0, 8)}`
      );

      setShowReportForm(false);
    } catch (error) {
      console.error('通報提出エラー:', error);
      alert(
        `通報の提出中にエラーが発生しました。\n\n` +
        `${error instanceof Error ? error.message : '不明なエラー'}\n\n` +
        `しばらく時間をおいて再度お試しください。`
      );
    }
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