// Post Report Button Component
// 投稿通報ボタンとモーダル

import React, { useState } from 'react';
import { PostReportService } from '../../services/PostReportService';
import { ReportType } from '../../types/report';

interface PostReportButtonProps {
  postId: string;
  currentUserId: string;
  compact?: boolean; // コンパクト表示モード
}

const PostReportButton: React.FC<PostReportButtonProps> = ({
  postId,
  currentUserId,
  compact = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  const reportService = PostReportService.getInstance();

  // 既に通報済みかチェック（非同期）
  React.useEffect(() => {
    const checkReportStatus = async () => {
      const reported = await reportService.hasUserReported(postId, currentUserId);
      setAlreadyReported(reported);
    };
    checkReportStatus();
  }, [postId, currentUserId]);

  const reportTypeOptions = [
    { value: 'personal_attack', label: '個人攻撃', icon: '💥', description: '特定の個人への攻撃的な表現' },
    { value: 'defamation', label: '誹謗中傷', icon: '🗣️', description: '根拠のない悪口や中傷' },
    { value: 'harassment', label: 'ハラスメント', icon: '⚠️', description: 'パワハラ・セクハラ等のハラスメント表現' },
    { value: 'privacy_violation', label: 'プライバシー侵害', icon: '🔒', description: '個人情報や機密情報の漏洩' },
    { value: 'inappropriate_content', label: '不適切なコンテンツ', icon: '🚫', description: '職場環境にふさわしくない内容' },
    { value: 'spam', label: 'スパム', icon: '📧', description: '無関係な宣伝や重複投稿' },
    { value: 'other', label: 'その他', icon: '❓', description: '上記に当てはまらない問題' }
  ];

  const handleReport = async () => {
    if (!reportType) {
      alert('通報理由を選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await reportService.reportPost(
        postId,
        currentUserId,
        reportType as ReportType,
        description
      );

      if (result.success) {
        alert(result.message);
        setShowModal(false);
        setReportType('');
        setDescription('');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('通報エラー:', error);
      alert('通報の送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 通報ボタン */}
      <button
        onClick={() => setShowModal(true)}
        disabled={alreadyReported}
        className={`
          ${
            compact
              ? 'text-xs text-gray-500 hover:text-red-400'
              : 'text-sm text-gray-400 hover:text-red-400'
          }
          flex items-center gap-1 transition-colors
          ${alreadyReported ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={alreadyReported ? '通報済み' : '不適切な内容を通報'}
      >
        <span className="text-base">🚩</span>
        {!compact && <span>{alreadyReported ? '通報済み' : '通報'}</span>}
      </button>

      {/* 通報モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🚩</span> 投稿を通報
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {/* 注意事項 */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div className="flex-1">
                    <h4 className="text-blue-300 font-bold mb-2">通報について</h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• 通報は匿名で処理されます</li>
                      <li>• 複数の通報があった投稿は優先的に確認されます</li>
                      <li>• 虚偽の通報は禁止されています</li>
                      <li>• 確認後、適切な対応が取られます</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 通報理由選択 */}
              <div>
                <label className="block text-white font-bold mb-3">
                  通報理由 <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {reportTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setReportType(option.value as ReportType)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-left
                        ${
                          reportType === option.value
                            ? 'border-red-500 bg-red-900/30'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{option.label}</span>
                            {reportType === option.value && (
                              <span className="text-red-400 text-xl">✓</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 詳細説明（任意） */}
              <div>
                <label className="block text-white font-bold mb-2">
                  詳細説明（任意）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="具体的な問題点や懸念事項があれば記入してください（任意）"
                  rows={4}
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-vertical"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500 text-xs">
                    匿名性を保つため、あなたを特定できる情報は記載しないでください
                  </span>
                  <span className="text-gray-500 text-sm">
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* 確認事項 */}
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1"
                  />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">以下を確認しました：</p>
                    <ul className="text-yellow-300/80 space-y-1 text-xs">
                      <li>• この通報は正当な理由に基づいています</li>
                      <li>• 虚偽の通報でないことを確認しました</li>
                      <li>• 通報内容について責任を持ちます</li>
                    </ul>
                  </div>
                </label>
              </div>
            </div>

            {/* フッター */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleReport}
                disabled={!reportType || isSubmitting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    送信中...
                  </>
                ) : (
                  <>
                    <span>🚩</span>
                    通報する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostReportButton;
