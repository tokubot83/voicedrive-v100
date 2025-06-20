import React, { useState } from 'react';
import { HierarchicalUser } from '../../types';
import { ContentModerationService, ModerationResult } from '../../services/ContentModerationService';
import { PermissionLevel } from '../../permissions/types/PermissionTypes';

interface EmergencyDeletionPanelProps {
  postId: string;
  postContent: string;
  postTitle?: string;
  postScope: 'team' | 'department' | 'facility' | 'organization';
  currentUser: HierarchicalUser;
  onDeletionComplete: (success: boolean, message: string) => void;
  onClose: () => void;
}

const EmergencyDeletionPanel: React.FC<EmergencyDeletionPanelProps> = ({
  postId,
  postContent,
  postTitle,
  postScope,
  currentUser,
  onDeletionComplete,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);

  // Pre-analyze content for violations
  React.useEffect(() => {
    const contentService = ContentModerationService.getInstance();
    const result = contentService.moderateContent(postContent, postTitle);
    setModerationResult(result);
  }, [postContent, postTitle]);

  const handleEmergencyDeletion = async () => {
    if (!reason.trim()) {
      alert('削除理由を入力してください。');
      return;
    }

    setIsProcessing(true);

    try {
      const contentService = ContentModerationService.getInstance();
      const result = await contentService.executeEmergencyDeletion(
        postId,
        currentUser,
        reason,
        postScope,
        moderationResult?.violations
      );

      onDeletionComplete(result.success, result.message);
      
      if (result.success && result.complianceReportId) {
        alert(`投稿を削除し、コンプライアンス窓口に自動通報しました（ID: ${result.complianceReportId}）`);
      }
    } catch (error) {
      console.error('緊急削除エラー:', error);
      onDeletionComplete(false, '緊急削除の実行中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeletionScopeText = (scope: string): string => {
    switch (scope) {
      case 'team': return 'チーム内';
      case 'department': return '部門内';
      case 'facility': return '施設内';
      case 'organization': return '組織全体';
      default: return scope;
    }
  };

  const canDelete = currentUser.permissionLevel >= PermissionLevel.LEVEL_2;

  if (!canDelete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">⚠️ 権限不足</h3>
          <p className="text-gray-300 mb-4">
            緊急削除権限がありません。上級者に相談してください。
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            🚨 緊急削除
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* 権限確認 */}
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <h4 className="text-yellow-300 font-bold mb-2">⚖️ 削除権限</h4>
          <p className="text-yellow-200 text-sm">
            あなたの権限レベル: LEVEL {currentUser.permissionLevel}<br/>
            削除可能範囲: {getDeletionScopeText(postScope)}の投稿
          </p>
        </div>

        {/* 投稿内容 */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-bold mb-2">📝 対象投稿</h4>
          {postTitle && (
            <div className="mb-2">
              <span className="text-gray-400 text-sm">タイトル:</span>
              <p className="text-white">{postTitle}</p>
            </div>
          )}
          <div>
            <span className="text-gray-400 text-sm">内容:</span>
            <p className="text-white text-sm max-h-32 overflow-y-auto">
              {postContent}
            </p>
          </div>
        </div>

        {/* 自動検出された違反 */}
        {moderationResult && moderationResult.violations.length > 0 && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <h4 className="text-red-300 font-bold mb-3">🔍 検出された問題</h4>
            <div className="space-y-2">
              {moderationResult.violations.map((violation, index) => (
                <div key={index} className="bg-red-800/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-400 font-medium">
                      {violation.violationType === 'harassment' && '🔴 ハラスメント'}
                      {violation.violationType === 'personal_attack' && '💥 個人攻撃'}
                      {violation.violationType === 'privacy_violation' && '🔒 個人情報'}
                      {violation.violationType === 'legal_risk' && '⚖️ 法的リスク'}
                      {violation.violationType === 'organizational_risk' && '🏢 組織リスク'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      violation.severity === 'critical' ? 'bg-red-600 text-white' :
                      violation.severity === 'high' ? 'bg-orange-600 text-white' :
                      violation.severity === 'medium' ? 'bg-yellow-600 text-black' :
                      'bg-blue-600 text-white'
                    }`}>
                      {violation.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-red-200 text-sm">{violation.description}</p>
                  {violation.matchedPhrases.length > 0 && (
                    <p className="text-red-300 text-xs mt-1">
                      検出語句: {violation.matchedPhrases.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 削除理由入力 */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            削除理由 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="緊急削除の詳細な理由を記入してください。この情報は監査ログに記録され、48時間以内の詳細報告に使用されます。"
            rows={4}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-vertical"
            required
          />
        </div>

        {/* 自動処理の説明 */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
          <h4 className="text-blue-300 font-bold mb-2">🤖 自動処理</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• 削除実行後、監査ログに自動記録されます</li>
            <li>• 重大な違反の場合、コンプライアンス窓口に自動通報されます</li>
            <li>• 48時間以内の詳細報告が必要です</li>
            <li>• 削除権限の行使状況が上級管理者に通知されます</li>
            {currentUser.permissionLevel >= PermissionLevel.LEVEL_7 && (
              <li>• 緊急権限行使として EmergencyAuthorityService に記録されます</li>
            )}
          </ul>
        </div>

        {/* 確認チェックボックス */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              className="mt-1"
            />
            <div className="text-sm">
              <p className="text-white font-medium mb-1">緊急削除の実行を確認します</p>
              <ul className="text-gray-400 space-y-1">
                <li>• この操作は取り消しできません</li>
                <li>• 削除理由と根拠を正確に記載しました</li>
                <li>• 必要な事後報告を48時間以内に行います</li>
                <li>• 組織のガイドラインに従って行動しています</li>
              </ul>
            </div>
          </label>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleEmergencyDeletion}
            disabled={isProcessing || !reason.trim()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                削除中...
              </>
            ) : (
              <>
                🚨 緊急削除実行
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDeletionPanel;