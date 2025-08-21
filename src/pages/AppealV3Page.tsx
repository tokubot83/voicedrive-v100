import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import AppealFormV3 from '../components/appeal/AppealFormV3';
import AppealStatusListV3 from '../components/appeal/AppealStatusListV3';
import { toast } from 'react-toastify';

const AppealV3Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'form' | 'status'>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deepLinkParams, setDeepLinkParams] = useState<{
    period?: string;
    employeeId?: string;
    fromMedical?: boolean;
  }>({});

  // URLパラメータの解析
  useEffect(() => {
    const period = searchParams.get('period');
    const employeeId = searchParams.get('employee');
    const fromMedical = searchParams.get('from') === 'medical';

    if (period || employeeId || fromMedical) {
      setDeepLinkParams({
        period: period || undefined,
        employeeId: employeeId || undefined,
        fromMedical
      });

      // 医療システムから遷移してきた場合は自動的にフォームタブを開く
      if (fromMedical) {
        setActiveTab('form');
        toast.info('医療システムから異議申し立てページに遷移しました');
      }

      // パラメータをログに出力（デバッグ用）
      console.log('Deep link parameters:', {
        period,
        employeeId,
        fromMedical,
        fullUrl: window.location.href
      });
    }
  }, [searchParams]);

  const handleAppealSuccess = (appealId: string) => {
    toast.success(`V3異議申し立てが正常に送信されました（ID: ${appealId}）`);
    setActiveTab('status');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setActiveTab('status');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                V3評価システム 異議申し立て
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                100点満点・7段階グレードシステム対応
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                V3.0.0
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                100点満点
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                7段階グレード
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-lg mt-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 新規申し立て
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 申し立て状況
            </button>
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-b-lg shadow-lg">
          <div className="p-8">
            {/* 医療システムからの遷移通知 */}
            {deepLinkParams.fromMedical && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-800">
                    医療システムから遷移しました。
                    {deepLinkParams.period && <span className="font-semibold ml-1">評価期間: {deepLinkParams.period}</span>}
                    {deepLinkParams.employeeId && <span className="font-semibold ml-1">/ 従業員ID: {deepLinkParams.employeeId}</span>}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'form' ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    V3新規異議申し立て
                  </h2>
                  <p className="text-gray-600">
                    V3評価システムの100点満点評価に対する異議申し立てを行います。
                    7段階グレード（S, A+, A, B+, B, C, D）での表示に対応しています。
                  </p>
                </div>

                <AppealFormV3
                  onSuccess={handleAppealSuccess}
                  onCancel={handleFormCancel}
                  initialPeriod={deepLinkParams.period}
                  initialEmployeeId={deepLinkParams.employeeId}
                  fromMedicalSystem={deepLinkParams.fromMedical}
                />
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    V3異議申し立て状況一覧
                  </h2>
                  <p className="text-gray-600">
                    V3評価システムで送信した異議申し立ての現在の状況を確認できます。
                    スコア変更とグレード変更の詳細も表示されます。
                  </p>
                </div>

                <AppealStatusListV3
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
          </div>
        </div>

        {/* V3システム情報パネル */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📊 V3評価システムについて
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">100点満点システム</h4>
              <p className="text-sm text-blue-700">
                従来システムから100点満点での評価に変更されました。
                より細かい評価が可能になっています。
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">7段階グレード</h4>
              <p className="text-sm text-blue-700">
                S（90-100）、A+（80-89）、A（70-79）、B+（60-69）、
                B（50-59）、C（40-49）、D（0-39）で表示されます。
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">優先度判定</h4>
              <p className="text-sm text-blue-700">
                V3では15点以上の差で高優先度、8点以上で中優先度、
                それ未満で低優先度として処理されます。
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 pb-8 text-center text-sm text-gray-500">
          <p>VoiceDrive V3評価システム - 医療職員管理システム統合版</p>
          <p className="mt-1">
            技術的な問題については 
            <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">
              #medical-voicedrive-integration
            </a> 
            までお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppealV3Page;