import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RetirementStepProps, Step4CompletionNotificationData } from '../../types/retirementFlow';
import { useDemoMode } from '../demo/DemoModeController';

interface Step4Props extends Omit<RetirementStepProps, 'processState'> {
  processState?: RetirementStepProps['processState'];
}

const Step4CompletionNotification: React.FC<Step4Props> = ({
  processState,
  onStepComplete,
  onStepError,
  onNavigateBack
}) => {
  const navigate = useNavigate();
  const { processId } = useParams<{ processId: string }>();
  const { currentUser } = useDemoMode();
  
  const [formData, setFormData] = useState<Step4CompletionNotificationData>({
    notificationRecipients: [
      { id: 'hr_dept_head', name: '人事部門長', role: '部門長', notified: false },
      { id: 'system_admin', name: 'システム管理者', role: '管理者', notified: false },
      { id: 'dept_manager', name: '所属部署管理者', role: '管理者', notified: false }
    ],
    reportGenerated: false,
    complianceChecklist: {
      'データ保護法準拠': false,
      '労働法規準拠': false,
      '社内規定準拠': false,
      '監査ログ記録': false,
      'セキュリティ確認': false
    },
    finalNotes: ''
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  const handleRecipientChange = (recipientId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationRecipients: prev.notificationRecipients.map(recipient =>
        recipient.id === recipientId 
          ? { ...recipient, notified: checked }
          : recipient
      )
    }));
  };

  const handleComplianceChange = (item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      complianceChecklist: {
        ...prev.complianceChecklist,
        [item]: checked
      }
    }));
  };

  const isAllComplianceChecked = () => {
    return Object.values(formData.complianceChecklist).every(checked => checked);
  };

  const handleFinalExecute = async () => {
    if (!isAllComplianceChecked()) {
      onStepError(4, 'すべてのコンプライアンス項目をチェックしてください');
      return;
    }

    setIsExecuting(true);
    try {
      await onStepComplete(4, formData);
      // 処理完了後、退職処理ダッシュボードに戻る
      navigate('/retirement-processing');
    } catch (error) {
      onStepError(4, error.message || 'ステップ4の実行中にエラーが発生しました');
    } finally {
      setIsExecuting(false);
      setShowFinalConfirmation(false);
    }
  };

  if (!processState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">プロセス情報が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* ヘッダー */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-xl">←</span>
              <span>プロセスに戻る</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">📢</span>
                ステップ4: 完了通知
              </h1>
              <p className="text-gray-400 text-sm">
                対象: {processState.employeeName} ({processState.employeeDepartment} {processState.employeeRole})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
              Final Step 4/4
            </span>
            <span className="text-gray-300">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 概要説明 */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              最終ステップ
            </h3>
            <p className="text-gray-300">
              退職処理の最終段階です。関係部署への通知送信、コンプライアンス確認、
              そして処理完了レポートの生成を行います。
            </p>
          </div>

          {/* 処理サマリー */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">処理サマリー</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">対象者:</span>
                      <span className="text-white">{processState.employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">所属:</span>
                      <span className="text-white">{processState.employeeDepartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">開始日時:</span>
                      <span className="text-white">{processState.startedAt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">実行者:</span>
                      <span className="text-white">{currentUser.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">完了ステップ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">アカウント無効化</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">権限取り消し</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">投稿匿名化</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">🔄</span>
                      <span className="text-gray-300">完了通知（進行中）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 通知送信先 */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">通知送信先</h3>
            
            <div className="space-y-4">
              {formData.notificationRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={recipient.notified}
                      onChange={(e) => handleRecipientChange(recipient.id, e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white font-medium">{recipient.name}</span>
                      <p className="text-gray-400 text-sm">{recipient.role}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                    通知対象
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 通知内容プレビュー */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">通知内容プレビュー</h3>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border-l-4 border-blue-500">
              <h4 className="font-bold text-white mb-4">退職処理完了通知</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>対象者:</strong> {processState.employeeName} ({processState.employeeDepartment} {processState.employeeRole})</p>
                <p><strong>処理完了日時:</strong> {new Date().toLocaleString()}</p>
                <p><strong>実行者:</strong> {currentUser.name} ({currentUser.department} Level {currentUser.permissionLevel})</p>
                <p><strong>プロセスID:</strong> {processState.processId}</p>
                
                <div className="mt-4">
                  <p><strong>処理内容:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>✓ アカウント無効化</li>
                    <li>✓ 権限取り消しと引き継ぎ</li>
                    <li>✓ 投稿内容の匿名化</li>
                    <li>✓ 完了通知送信</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <p><strong>備考:</strong></p>
                  <p className="text-gray-400">
                    すべての処理は監査ログに記録されています。
                    緊急時の問い合わせは人事部までご連絡ください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* コンプライアンスチェック */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">コンプライアンスチェック</h3>
            <p className="text-gray-400 text-sm mb-6">
              退職処理の法令遵守・社内規定準拠を確認してください。すべての項目をチェックする必要があります。
            </p>
            
            <div className="space-y-4">
              {Object.entries(formData.complianceChecklist).map(([item, checked]) => (
                <label key={item} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleComplianceChange(item, e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 mt-1"
                  />
                  <div>
                    <span className="text-white font-medium">{item}</span>
                    <p className="text-gray-400 text-sm">
                      {item === 'データ保護法準拠' && '個人情報の適切な処理・匿名化を確認'}
                      {item === '労働法規準拠' && '労働契約終了に関する法的手続きを確認'}
                      {item === '社内規定準拠' && '退職処理に関する社内規定に従って実施'}
                      {item === '監査ログ記録' && 'すべての操作が監査ログに適切に記録'}
                      {item === 'セキュリティ確認' && 'セキュリティリスクの評価と対策を確認'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 最終メモ */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">最終メモ（任意）</h3>
            <textarea
              value={formData.finalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, finalNotes: e.target.value }))}
              placeholder="退職処理に関する特記事項や引き継ぎ事項があれば記録してください..."
              className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* 最終実行ボタン */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              退職処理完了
            </h3>
            <p className="text-gray-300 mb-6">
              すべてのステップが完了しました。最終確認を行い、退職処理を完了してください。
              この操作により、プロセスが正式に完了し、関係者に通知が送信されます。
            </p>
            
            <button
              onClick={() => setShowFinalConfirmation(true)}
              disabled={isExecuting || !isAllComplianceChecked()}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? '処理中...' : '退職処理を完了する'}
            </button>
            
            {!isAllComplianceChecked() && (
              <p className="text-red-400 text-sm mt-2 text-center">
                すべてのコンプライアンス項目をチェックしてください
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 最終確認ダイアログ */}
      {showFinalConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">退職処理完了の最終確認</h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {processState.employeeName} の退職処理を完了します。
              </p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-400 text-sm">
                  ✓ すべてのステップが正常に完了しています
                </p>
                <p className="text-green-400 text-sm">
                  ✓ コンプライアンス要件を満たしています
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium mb-2">実行される処理:</p>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• 選択された関係者への通知送信</li>
                  <li>• 完了レポートの生成と保存</li>
                  <li>• プロセス状態の正式完了設定</li>
                  <li>• 監査ログの最終記録</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalConfirmation(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleFinalExecute}
                disabled={isExecuting}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isExecuting ? '完了処理中...' : '完了する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4CompletionNotification;