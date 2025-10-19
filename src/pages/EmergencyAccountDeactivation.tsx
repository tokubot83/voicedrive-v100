/**
 * 緊急アカウント停止ページ
 *
 * レベル14-17（人事部門）専用
 * 職員カルテシステム障害時の応急措置
 */

import React, { useState } from 'react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { emergencyAccountService } from '../services/EmergencyAccountService';
import { AlertTriangle, UserX, CheckCircle, X } from 'lucide-react';

export const EmergencyAccountDeactivation: React.FC = () => {
  const { currentUser } = useDemoMode();
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // 権限チェック：レベル14-17のみアクセス可能
  const hasPermission = () => {
    const level = currentUser?.permissionLevel || 0;
    return level >= 14 && level <= 17;
  };

  // アカウント停止を実行
  const handleDeactivate = async () => {
    if (!currentUser) return;

    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const result = await emergencyAccountService.deactivateAccount(
        targetUserId,
        currentUser,
        reason
      );

      setResult(result);

      if (result.success) {
        // 成功時はフォームをクリア
        setTargetUserId('');
        setReason('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: '予期しないエラーが発生しました。'
      });
    } finally {
      setLoading(false);
    }
  };

  // フォームバリデーション
  const isFormValid = () => {
    return targetUserId.trim().length > 0 && reason.trim().length > 0;
  };

  // 権限がない場合はエラー表示
  if (!hasPermission()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">アクセス権限がありません</h2>
            <p className="text-slate-300">
              この機能は人事部門（レベル14-17）のみアクセス可能です。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600/20 rounded-lg">
              <UserX className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🚨 緊急アカウント停止</h1>
              <p className="text-slate-400 mt-1">職員カルテシステム障害時の応急措置</p>
            </div>
          </div>
        </div>

        {/* 警告メッセージ */}
        <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-100 mb-2">
                ⚠️ 重要な注意事項
              </h3>
              <ul className="text-yellow-200 text-sm space-y-1">
                <li>• この機能は職員カルテシステム障害時の応急措置です</li>
                <li>• 通常時は職員カルテシステムで処理してください</li>
                <li>• この処理は監査ログに記録されます</li>
                <li>• 職員カルテシステム復旧後に自動同期されます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* メインフォーム */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-8 border border-slate-700/50">
          <div className="space-y-6">
            {/* 対象ユーザーID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                停止対象ユーザーID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="例：level-1-staff"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* 停止理由 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                停止理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例：退職処理・職員カルテシステム障害中"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg
                         text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
                disabled={loading}
              />
            </div>

            {/* 実行ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!isFormValid() || loading}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                  font-semibold text-white transition-all duration-150
                  ${isFormValid() && !loading
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/50'
                    : 'bg-slate-700 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <UserX className="w-5 h-5" />
                緊急停止を実行
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className={`mt-8 rounded-lg p-6 border-2 ${
            result.success
              ? 'bg-green-900/20 border-green-500'
              : 'bg-red-900/20 border-red-500'
          }`}>
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  result.success ? 'text-green-100' : 'text-red-100'
                }`}>
                  {result.success ? '✅ 停止完了' : '❌ エラー'}
                </h3>
                <p className={result.success ? 'text-green-200' : 'text-red-200'}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 確認ダイアログ */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border-2 border-red-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    本当に停止しますか？
                  </h2>
                  <p className="text-slate-300 text-sm">
                    この操作は監査ログに記録されます。
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-slate-400">対象ユーザーID:</span>
                    <span className="text-white ml-2 font-mono">{targetUserId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">理由:</span>
                    <p className="text-white mt-1">{reason}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600
                           text-white rounded-lg font-semibold transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4 inline mr-2" />
                  キャンセル
                </button>
                <button
                  onClick={handleDeactivate}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700
                           text-white rounded-lg font-semibold transition-colors"
                  disabled={loading}
                >
                  <UserX className="w-4 h-4 inline mr-2" />
                  {loading ? '処理中...' : '停止実行'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyAccountDeactivation;
