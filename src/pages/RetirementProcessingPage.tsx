import React from 'react';
import { useNavigate } from 'react-router-dom';
import RetirementProcessingPanel from '../components/admin/RetirementProcessingPanel';
import { useDemoMode } from '../components/demo/DemoModeController';
import { usePermissions } from '../hooks/usePermissions';

const RetirementProcessingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useDemoMode();
  const { hasPermission } = usePermissions();

  // レベル14権限チェック（人事部門員以上）
  if (!currentUser || currentUser.permissionLevel < 14) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-300 mb-6">
            緊急退職処理にはレベル14以上（人事部門員）の権限が必要です。
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            ホーム
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* 管理画面ヘッダー */}
      <div className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <span className="text-sm">←</span>
              <span className="text-sm">ホーム</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">⚠️</span>
                緊急退職処理
              </h1>
              <p className="text-gray-400 text-sm">
                職員カルテシステムの自動処理が使えない場合の緊急対応用
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium">
              Level {currentUser.permissionLevel}
            </span>
            <span className="text-gray-300">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 緊急処理の警告 */}
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold text-xl mb-3 flex items-center gap-2">
              <span className="text-3xl">🚨</span>
              緊急処理専用機能
            </h3>
            <div className="space-y-2 text-gray-200">
              <p className="font-semibold">この機能は通常使用しないでください。</p>
              <p>• 通常の退職処理は職員カルテシステムで自動処理されます</p>
              <p>• この機能は職員カルテシステムが使用できない緊急時のみ使用してください</p>
              <p>• 処理実行前に必ず上長の承認を得てください</p>
            </div>
          </div>

          <RetirementProcessingPanel currentUser={currentUser} />

          {/* 注意事項 */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              重要な注意事項
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• 退職処理は原則として取り消しができません</li>
              <li>• 処理を実行する前に、対象者が本当に退職済みであることを確認してください</li>
              <li>• すべての処理は監査ログに記録されます</li>
              <li>• 緊急時の取り消しはレベル7権限者に依頼してください</li>
            </ul>
          </div>

          {/* 処理フロー説明 */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">退職処理フロー</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-3xl mb-2">1️⃣</div>
                <h4 className="font-bold text-white mb-1">アカウント無効化</h4>
                <p className="text-sm text-gray-400">ログイン不可に設定</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-3xl mb-2">2️⃣</div>
                <h4 className="font-bold text-white mb-1">権限取り消し</h4>
                <p className="text-sm text-gray-400">すべての権限を無効化</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-3xl mb-2">3️⃣</div>
                <h4 className="font-bold text-white mb-1">投稿匿名化</h4>
                <p className="text-sm text-gray-400">設定に従い匿名化</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="text-3xl mb-2">4️⃣</div>
                <h4 className="font-bold text-white mb-1">完了通知</h4>
                <p className="text-sm text-gray-400">関係部署へ通知</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementProcessingPage;