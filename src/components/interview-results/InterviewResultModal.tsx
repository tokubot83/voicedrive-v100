// 面談サマリ詳細モーダル
import React, { useEffect, useState } from 'react';
import './InterviewResultModal.css';

interface InterviewResult {
  id: string;
  interviewId: string;
  completedAt: string;
  duration: number;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    description: string;
    dueDate?: string;
  }>;
  followUpRequired: boolean;
  followUpDate?: string;
  feedbackToEmployee: string;
  nextRecommendations: {
    suggestedNextInterview?: string;
    suggestedTopics: string[];
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
}

export const InterviewResultModal: React.FC<Props> = ({ isOpen, onClose, interviewId }) => {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && interviewId) {
      fetchInterviewResult();
    }
  }, [isOpen, interviewId]);

  const fetchInterviewResult = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/my/interview-results/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'データの取得に失敗しました');
      }

      const data = await response.json();
      setResult(data.data);

      // 既読マーク
      markAsRead();
    } catch (err) {
      console.error('Error fetching interview result:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/my/interview-results/${interviewId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="interview-result-modal">
          {/* ヘッダー */}
          <div className="modal-header">
            <h2>📝 面談サマリ</h2>
            <button onClick={onClose} className="close-btn" aria-label="閉じる">
              ×
            </button>
          </div>

          {/* コンテンツ */}
          <div className="modal-content">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>読み込み中...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p className="error-icon">⚠️</p>
                <p className="error-message">{error}</p>
                <button onClick={onClose} className="btn-secondary">
                  閉じる
                </button>
              </div>
            )}

            {!loading && !error && result && (
              <>
                {/* 実施情報 */}
                <div className="modal-section">
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="icon">📅</span>
                      <span className="label">実施日時:</span>
                      <span className="value">{formatDateTime(result.completedAt)}</span>
                    </div>
                    <div className="info-row">
                      <span className="icon">⏱️</span>
                      <span className="label">実施時間:</span>
                      <span className="value">{result.duration}分</span>
                    </div>
                  </div>
                </div>

                {/* 面談サマリ */}
                <div className="modal-section">
                  <h3>📝 面談内容</h3>
                  <p className="summary-text">{result.summary}</p>
                </div>

                {/* 重要ポイント */}
                {result.keyPoints.length > 0 && (
                  <div className="modal-section">
                    <h3>🔑 重要ポイント</h3>
                    <ul className="key-points-list">
                      {result.keyPoints.map((point, index) => (
                        <li key={index}>
                          <span className="bullet">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* アクションアイテム */}
                {result.actionItems.length > 0 && (
                  <div className="modal-section">
                    <h3>✅ アクションアイテム</h3>
                    <div className="action-items-list">
                      {result.actionItems.map((item, index) => (
                        <div key={index} className="action-item">
                          <label className="checkbox-label">
                            <input type="checkbox" />
                            <span className="action-description">{item.description}</span>
                          </label>
                          {item.dueDate && (
                            <span className="due-date">
                              期限: {formatDate(item.dueDate)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* フィードバック */}
                <div className="modal-section feedback-section">
                  <h3>💬 人事部からのフィードバック</h3>
                  <p className="feedback-text">{result.feedbackToEmployee}</p>
                </div>

                {/* フォローアップ */}
                {result.followUpRequired && (
                  <div className="modal-section followup-section">
                    <h3>💡 フォローアップ予定</h3>
                    <div className="followup-info">
                      <span className="icon">📅</span>
                      <span>{formatDate(result.followUpDate)}</span>
                    </div>
                  </div>
                )}

                {/* 次回推奨 */}
                <div className="modal-section">
                  <h3>🎯 次回面談の推奨</h3>
                  <p className="next-interview-date">
                    推奨日: {formatDate(result.nextRecommendations.suggestedNextInterview)}
                  </p>
                  {result.nextRecommendations.suggestedTopics.length > 0 && (
                    <div className="topics">
                      <p className="topics-label">推奨トピック:</p>
                      <div className="topic-tags">
                        {result.nextRecommendations.suggestedTopics.map((topic, index) => (
                          <span key={index} className="topic-tag">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* フッター */}
          {!loading && !error && (
            <div className="modal-footer">
              <button onClick={onClose} className="btn-primary">
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
