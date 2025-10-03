// 面談履歴アイテム（サマリボタン統合版）
import React, { useState } from 'react';
import { InterviewResultModal } from '../interview-results/InterviewResultModal';
import './InterviewHistoryItem.css';

interface Interview {
  id: string;
  topic: string;
  category: string;
  type: string;
  scheduledDate?: Date | string;
  actualDate?: Date | string;
  duration?: number;
  status: string;
  urgencyLevel: string;
  interviewerName?: string;
  // サマリ関連
  hasSummary?: boolean;  // サマリが存在するか
  summaryInterviewId?: string;  // 医療システム側の面談ID
}

interface Props {
  interview: Interview;
  onViewDetails?: (id: string) => void;
}

export const InterviewHistoryItem: React.FC<Props> = ({ interview, onViewDetails }) => {
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'pending': '申込中',
      'scheduled': '予約済み',
      'completed': '完了',
      'cancelled': 'キャンセル'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string): string => {
    return `status-badge status-${status}`;
  };

  const getUrgencyClass = (urgency: string): string => {
    return `urgency-badge urgency-${urgency}`;
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewSummary = () => {
    if (interview.summaryInterviewId) {
      setSummaryModalOpen(true);
    }
  };

  return (
    <>
      <div className="interview-history-item">
        {/* メイン情報 */}
        <div className="interview-main-info">
          <div className="interview-header">
            <h3 className="interview-topic">{interview.topic}</h3>
            <div className="interview-badges">
              <span className={getStatusClass(interview.status)}>
                {getStatusLabel(interview.status)}
              </span>
              {interview.urgencyLevel && interview.status === 'pending' && (
                <span className={getUrgencyClass(interview.urgencyLevel)}>
                  {interview.urgencyLevel === 'urgent' && '緊急'}
                  {interview.urgencyLevel === 'this_week' && '今週中'}
                  {interview.urgencyLevel === 'next_week' && '来週'}
                  {interview.urgencyLevel === 'this_month' && '今月中'}
                </span>
              )}
            </div>
          </div>

          <div className="interview-details">
            <div className="detail-row">
              <span className="detail-label">📅 日時:</span>
              <span className="detail-value">
                {formatDate(interview.actualDate || interview.scheduledDate)}
              </span>
            </div>

            {interview.duration && (
              <div className="detail-row">
                <span className="detail-label">⏱️ 時間:</span>
                <span className="detail-value">{interview.duration}分</span>
              </div>
            )}

            {interview.interviewerName && (
              <div className="detail-row">
                <span className="detail-label">👤 面談者:</span>
                <span className="detail-value">{interview.interviewerName}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">📝 種類:</span>
              <span className="detail-value">{interview.category} - {interview.type}</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="interview-actions">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(interview.id)}
              className="btn-action btn-details"
            >
              詳細を見る
            </button>
          )}

          {/* サマリボタン（完了済み＆サマリ存在時のみ） */}
          {interview.status === 'completed' && interview.hasSummary && interview.summaryInterviewId && (
            <button
              onClick={handleViewSummary}
              className="btn-action btn-summary"
            >
              📝 サマリを見る
            </button>
          )}
        </div>
      </div>

      {/* サマリモーダル */}
      {interview.summaryInterviewId && (
        <InterviewResultModal
          isOpen={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          interviewId={interview.summaryInterviewId}
        />
      )}
    </>
  );
};
