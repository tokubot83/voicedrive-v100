import React, { useState, useEffect } from 'react';
import { 
  AppealRecord,
  AppealStatus,
  APPEAL_STATUS_CONFIG,
  APPEAL_CATEGORY_LABELS,
  AppealCommunication
} from '../../types/appeal';
import appealService from '../../services/appealService';
import { formatDate } from '../../utils/dateUtils';

interface AppealDetailProps {
  appealId: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

const AppealDetail: React.FC<AppealDetailProps> = ({ 
  appealId, 
  onClose,
  onUpdate 
}) => {
  const [appeal, setAppeal] = useState<AppealRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  useEffect(() => {
    loadAppealDetail();
  }, [appealId]);

  const loadAppealDetail = async () => {
    setLoading(true);
    try {
      const data = await appealService.getAppealStatus(appealId);
      setAppeal(data);
    } catch (error) {
      console.error('異議申し立て詳細の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !appeal) return;

    setSubmittingComment(true);
    try {
      const success = await appealService.addComment(appeal.appealId, newComment);
      if (success) {
        setNewComment('');
        await loadAppealDetail();
      }
    } catch (error) {
      console.error('コメント追加エラー:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitAdditionalInfo = async () => {
    if (!additionalInfo.trim() || !appeal) return;

    try {
      // ファイルアップロード
      const uploadedUrls: string[] = [];
      for (const file of additionalFiles) {
        const url = await appealService.uploadEvidence(file, appeal.appealId);
        uploadedUrls.push(url);
      }

      // 追加情報提出
      const response = await appealService.updateAppeal(appeal.appealId, {
        appealReason: appeal.appealReason + '\n\n【追加情報】\n' + additionalInfo,
        evidenceDocuments: [...(appeal.evidenceDocuments || []), ...uploadedUrls]
      });

      if (response.success) {
        setShowAddInfo(false);
        setAdditionalInfo('');
        setAdditionalFiles([]);
        await loadAppealDetail();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('追加情報提出エラー:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!appeal || !window.confirm('この異議申し立てを取り下げますか？')) return;

    try {
      const response = await appealService.withdrawAppeal(appeal.appealId);
      if (response.success) {
        await loadAppealDetail();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('取り下げエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">異議申し立て情報が見つかりません</p>
      </div>
    );
  }

  const statusConfig = APPEAL_STATUS_CONFIG[appeal.status];

  return (
    <div className="appeal-detail bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">異議申し立て詳細</h2>
          <p className="text-gray-600">申請ID: {appeal.appealId}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* ステータス */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">現在のステータス</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.label}
          </span>
        </div>
        {appeal.reviewStartDate && (
          <p className="text-sm text-gray-600">
            審査開始日: {formatDate(appeal.reviewStartDate)}
          </p>
        )}
        {appeal.reviewEndDate && (
          <p className="text-sm text-gray-600">
            審査完了日: {formatDate(appeal.reviewEndDate)}
          </p>
        )}
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">評価期間</p>
          <p className="font-medium">{appeal.evaluationPeriod}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">カテゴリー</p>
          <p className="font-medium">{APPEAL_CATEGORY_LABELS[appeal.appealCategory]}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">申請日</p>
          <p className="font-medium">{formatDate(appeal.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">最終更新</p>
          <p className="font-medium">{formatDate(appeal.updatedAt)}</p>
        </div>
      </div>

      {/* 評価点 */}
      {(appeal.originalScore !== undefined || appeal.requestedScore !== undefined) && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          {appeal.originalScore !== undefined && (
            <div>
              <p className="text-sm text-gray-600">現在の評価点</p>
              <p className="text-2xl font-bold">{appeal.originalScore}点</p>
            </div>
          )}
          {appeal.requestedScore !== undefined && (
            <div>
              <p className="text-sm text-gray-600">希望評価点</p>
              <p className="text-2xl font-bold">{appeal.requestedScore}点</p>
            </div>
          )}
          {appeal.finalScore !== undefined && (
            <div>
              <p className="text-sm text-gray-600">最終評価点</p>
              <p className="text-2xl font-bold text-green-600">{appeal.finalScore}点</p>
            </div>
          )}
        </div>
      )}

      {/* 申し立て理由 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">申し立て理由</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{appeal.appealReason}</p>
        </div>
      </div>

      {/* 証拠書類 */}
      {appeal.evidenceDocuments && appeal.evidenceDocuments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">添付書類</h3>
          <div className="space-y-2">
            {appeal.evidenceDocuments.map((doc, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">📎 書類{index + 1}</span>
                <a 
                  href={doc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-600 hover:underline text-sm"
                >
                  表示
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 審査結果 */}
      {appeal.decision && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">審査結果</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">判定: </span>
              {appeal.decision.outcome === 'approved' && '承認'}
              {appeal.decision.outcome === 'partially_approved' && '一部承認'}
              {appeal.decision.outcome === 'rejected' && '却下'}
            </p>
            {appeal.decision.adjustedScore !== undefined && (
              <p>
                <span className="font-medium">調整後評価点: </span>
                {appeal.decision.adjustedScore}点
              </p>
            )}
            <p>
              <span className="font-medium">理由: </span>
              {appeal.decision.reason}
            </p>
            <p className="text-sm text-gray-600">
              決定者: {appeal.decision.decidedBy} | 
              決定日: {formatDate(appeal.decision.decidedAt)}
            </p>
          </div>
        </div>
      )}

      {/* コミュニケーションログ */}
      {appeal.communicationLog && appeal.communicationLog.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">コミュニケーション履歴</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {appeal.communicationLog.map((log: AppealCommunication) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{log.from}</span>
                  <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                </div>
                <p className="text-sm">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* コメント追加 */}
      {appeal.status !== AppealStatus.RESOLVED && appeal.status !== AppealStatus.WITHDRAWN && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">コメントを追加</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="質問や補足情報を入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleAddComment}
              disabled={submittingComment || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              送信
            </button>
          </div>
        </div>
      )}

      {/* 追加情報提出フォーム */}
      {appeal.status === AppealStatus.ADDITIONAL_INFO && showAddInfo && (
        <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">追加情報の提出</h3>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="追加情報を入力してください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            rows={4}
          />
          <input
            type="file"
            onChange={(e) => setAdditionalFiles(Array.from(e.target.files || []))}
            multiple
            className="mb-2"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSubmitAdditionalInfo}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              提出
            </button>
            <button
              onClick={() => setShowAddInfo(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex justify-end space-x-2">
        {appeal.status === AppealStatus.ADDITIONAL_INFO && !showAddInfo && (
          <button
            onClick={() => setShowAddInfo(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            追加情報を提出
          </button>
        )}
        
        {(appeal.status === AppealStatus.RECEIVED || 
          appeal.status === AppealStatus.UNDER_REVIEW || 
          appeal.status === AppealStatus.ADDITIONAL_INFO) && (
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
          >
            取り下げ
          </button>
        )}

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default AppealDetail;