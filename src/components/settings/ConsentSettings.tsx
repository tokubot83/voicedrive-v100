/**
 * データ分析同意設定コンポーネント
 *
 * 設定画面のプライバシータブに表示される
 * 同意状態の確認・変更・データ削除リクエスト機能
 */

import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { useDataConsent } from '../../hooks/useDataConsent';
import { useNavigate } from 'react-router-dom';

interface ConsentSettingsProps {
  userId: string;
}

export const ConsentSettings: React.FC<ConsentSettingsProps> = ({ userId }) => {
  const {
    consentStatus,
    loading,
    hasAnalyticsConsent,
    hasPersonalFeedbackConsent,
    isConsentRevoked,
    isDeletionRequested,
    updateConsent,
    revokeConsent,
    requestDataDeletion
  } = useDataConsent(userId);

  const navigate = useNavigate();

  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * 同意を取り消す
   */
  const handleRevokeConsent = async () => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const result = await revokeConsent();

      if (result.success) {
        setActionMessage({ type: 'success', text: result.message });
        setShowRevokeDialog(false);
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: '処理中にエラーが発生しました。' });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * 同意を再度付与
   */
  const handleGrantConsent = async () => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const result = await updateConsent({ analyticsConsent: true });

      if (result.success) {
        setActionMessage({ type: 'success', text: '同意を更新しました。' });
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: '処理中にエラーが発生しました。' });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * データ削除をリクエスト
   */
  const handleRequestDeletion = async () => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const result = await requestDataDeletion();

      if (result.success) {
        setActionMessage({ type: 'success', text: result.message });
        setShowDeleteDialog(false);
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: '処理中にエラーが発生しました。' });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * プライバシーポリシーを表示
   */
  const handleViewPolicy = () => {
    navigate('/privacy-policy');
  };

  if (loading && !consentStatus) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">VoiceDriveデータ分析同意設定</h2>
      </div>

      {/* 現在の同意状態 */}
      <div className="space-y-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-3">現在の同意状態</h3>

          <div className="space-y-3">
            {/* Analytics同意状態 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasAnalyticsConsent ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-slate-300">組織分析への同意</span>
              </div>
              <span className={`text-sm font-medium ${
                hasAnalyticsConsent ? 'text-green-400' : 'text-slate-500'
              }`}>
                {hasAnalyticsConsent ? '同意済み' : '未同意'}
              </span>
            </div>

            {/* 同意日時 */}
            {consentStatus?.analyticsConsentDate && (
              <div className="text-xs text-slate-500 ml-7">
                同意日時: {new Date(consentStatus.analyticsConsentDate).toLocaleString('ja-JP')}
              </div>
            )}

            {/* 取り消し状態 */}
            {isConsentRevoked && consentStatus?.revokeDate && (
              <div className="flex items-center gap-2 ml-7 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {new Date(consentStatus.revokeDate).toLocaleString('ja-JP')} に取り消し済み
                </span>
              </div>
            )}

            {/* データ削除リクエスト状態 */}
            {isDeletionRequested && (
              <div className="flex items-center gap-2 ml-7 text-sm text-orange-400">
                <Trash2 className="w-4 h-4" />
                <span>
                  データ削除リクエスト受付済み
                  {consentStatus?.dataDeletionRequestedAt && (
                    <> ({new Date(consentStatus.dataDeletionRequestedAt).toLocaleString('ja-JP')})</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 説明文 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            同意すると、あなたのVoiceDrive活動データ（投稿・投票・コメント）が
            職員カルテシステムで分析され、組織改善とキャリア支援に活用されます。
          </p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3 mb-6">
        {/* 同意状態の変更 */}
        {hasAnalyticsConsent && !isConsentRevoked ? (
          <button
            onClick={() => setShowRevokeDialog(true)}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg
                     font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            同意を取り消す
          </button>
        ) : (
          <button
            onClick={handleGrantConsent}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-green-600 hover:bg-green-700 text-white rounded-lg
                     font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? '処理中...' : '同意する'}
          </button>
        )}

        {/* データ削除リクエスト */}
        {!isDeletionRequested && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-red-600 hover:bg-red-700 text-white rounded-lg
                     font-semibold transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            過去データの削除をリクエスト
          </button>
        )}

        {/* プライバシーポリシー表示 */}
        <button
          onClick={handleViewPolicy}
          className="w-full flex items-center justify-center gap-2 px-4 py-3
                   bg-slate-700 hover:bg-slate-600 text-white rounded-lg
                   font-semibold transition-colors"
        >
          <FileText className="w-5 h-5" />
          プライバシーポリシーを確認
        </button>
      </div>

      {/* アクション結果メッセージ */}
      {actionMessage && (
        <div className={`rounded-lg p-4 ${
          actionMessage.type === 'success'
            ? 'bg-green-900/20 border border-green-500/30'
            : 'bg-red-900/20 border border-red-500/30'
        }`}>
          <p className={actionMessage.type === 'success' ? 'text-green-200' : 'text-red-200'}>
            {actionMessage.text}
          </p>
        </div>
      )}

      {/* 同意取り消し確認ダイアログ */}
      {showRevokeDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border-2 border-yellow-500">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">同意を取り消しますか？</h3>
                <p className="text-sm text-slate-300">
                  取り消し後、今後のデータは分析対象外となります。
                  既に収集されたデータは組織分析に使用される場合があります。
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRevokeDialog(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                disabled={actionLoading}
              >
                キャンセル
              </button>
              <button
                onClick={handleRevokeConsent}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? '処理中...' : '取り消す'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* データ削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border-2 border-red-500">
            <div className="flex items-start gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">データ削除をリクエストしますか？</h3>
                <p className="text-sm text-slate-300 mb-2">
                  過去のVoiceDrive活動データの削除をリクエストします。
                </p>
                <p className="text-xs text-yellow-300">
                  ※処理完了まで数日かかる場合があります。<br />
                  ※法令上の保存義務があるデータは削除されません。
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                disabled={actionLoading}
              >
                キャンセル
              </button>
              <button
                onClick={handleRequestDeletion}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? '処理中...' : 'リクエスト'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentSettings;
