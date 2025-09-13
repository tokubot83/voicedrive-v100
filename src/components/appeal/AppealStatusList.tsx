import React, { useState, useEffect } from 'react';
import { 
  AppealRecord,
  AppealStatus,
  APPEAL_STATUS_CONFIG,
  APPEAL_CATEGORY_LABELS
} from '../../types/appeal';
import appealServiceV3 from '../../services/appealServiceV3';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/dateUtils';

interface AppealStatusListProps {
  onSelectAppeal?: (appeal: AppealRecord) => void;
}

const AppealStatusList: React.FC<AppealStatusListProps> = ({ onSelectAppeal }) => {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<AppealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppealId, setSelectedAppealId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppealStatus | 'all'>('all');

  useEffect(() => {
    loadAppeals();
  }, [user]);

  const loadAppeals = async () => {
    if (!user?.employeeId) return;

    setLoading(true);
    try {
      const data = await appealServiceV3.getAppeals(user.employeeId);
      setAppeals(data);
    } catch (error) {
      console.error('異議申し立て一覧の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appealId: string) => {
    if (!window.confirm('この異議申し立てを取り下げますか？')) {
      return;
    }

    try {
      const response = await appealServiceV3.withdrawAppeal(appealId);
      if (response.success) {
        await loadAppeals();
      }
    } catch (error) {
      console.error('取り下げエラー:', error);
    }
  };

  const handleViewDetails = (appeal: AppealRecord) => {
    setSelectedAppealId(appeal.appealId);
    if (onSelectAppeal) {
      onSelectAppeal(appeal);
    }
  };

  const filteredAppeals = filter === 'all' 
    ? appeals 
    : appeals.filter(a => a.status === filter);

  const getStatusBadge = (status: AppealStatus) => {
    const config = APPEAL_STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const canWithdraw = (appeal: AppealRecord) => {
    return [AppealStatus.RECEIVED, AppealStatus.UNDER_REVIEW, AppealStatus.ADDITIONAL_INFO].includes(appeal.status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="appeal-status-list">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">異議申し立て履歴</h2>
        
        {/* フィルター */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            すべて ({appeals.length})
          </button>
          {Object.entries(APPEAL_STATUS_CONFIG).map(([status, config]) => {
            const count = appeals.filter(a => a.status === status).length;
            if (count === 0) return null;
            
            return (
              <button
                key={status}
                onClick={() => setFilter(status as AppealStatus)}
                className={`px-4 py-2 rounded-lg ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredAppeals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">異議申し立ての履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((appeal) => (
            <div
              key={appeal.appealId}
              className={`border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedAppealId === appeal.appealId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleViewDetails(appeal)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {appeal.evaluationPeriod}の異議申し立て
                  </h3>
                  <p className="text-sm text-gray-600">
                    申請ID: {appeal.appealId}
                  </p>
                </div>
                {getStatusBadge(appeal.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500">カテゴリー</p>
                  <p className="font-medium">{APPEAL_CATEGORY_LABELS[appeal.appealCategory]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">申請日</p>
                  <p className="font-medium">{formatDate(appeal.createdAt)}</p>
                </div>
                {appeal.originalScore !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">現在の評価点</p>
                    <p className="font-medium">{appeal.originalScore}点</p>
                  </div>
                )}
                {appeal.requestedScore !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">希望評価点</p>
                    <p className="font-medium">{appeal.requestedScore}点</p>
                  </div>
                )}
              </div>

              {/* 申し立て理由（抜粋） */}
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1">申し立て理由</p>
                <p className="text-sm line-clamp-2">{appeal.appealReason}</p>
              </div>

              {/* 決定内容 */}
              {appeal.decision && (
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-semibold mb-1">審査結果</p>
                  <p className="text-sm">
                    {appeal.decision.outcome === 'approved' && '承認'}
                    {appeal.decision.outcome === 'partially_approved' && '一部承認'}
                    {appeal.decision.outcome === 'rejected' && '却下'}
                  </p>
                  {appeal.decision.adjustedScore && (
                    <p className="text-sm mt-1">
                      調整後の評価点: {appeal.decision.adjustedScore}点
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{appeal.decision.reason}</p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(appeal);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  詳細を見る
                </button>
                
                {canWithdraw(appeal) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWithdraw(appeal.appealId);
                    }}
                    className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
                  >
                    取り下げ
                  </button>
                )}

                {appeal.status === AppealStatus.ADDITIONAL_INFO && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 追加情報提出画面へ
                    }}
                    className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    追加情報を提出
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppealStatusList;