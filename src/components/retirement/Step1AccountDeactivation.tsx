import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RetirementStepProps, Step1AccountDeactivationData } from '../../types/retirementFlow';
import { useDemoMode } from '../demo/DemoModeController';

interface Step1Props extends Omit<RetirementStepProps, 'processState'> {
  processState?: RetirementStepProps['processState'];
}

const Step1AccountDeactivation: React.FC<Step1Props> = ({
  processState,
  onStepComplete,
  onStepError,
  onNavigateBack
}) => {
  const navigate = useNavigate();
  const { processId } = useParams<{ processId: string }>();
  const { currentUser } = useDemoMode();
  
  const [formData, setFormData] = useState<Step1AccountDeactivationData>({
    timing: 'immediate',
    scheduledDate: undefined,
    forceLogout: true,
    notifyUser: false,
    backupCreated: false
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleTimingChange = (timing: 'immediate' | 'scheduled') => {
    setFormData(prev => ({
      ...prev,
      timing,
      scheduledDate: timing === 'scheduled' ? new Date() : undefined
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: new Date(date)
    }));
  };

  const handleCheckboxChange = (field: keyof Omit<Step1AccountDeactivationData, 'timing' | 'scheduledDate'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    if (formData.timing === 'scheduled' && !formData.scheduledDate) {
      onStepError(1, 'スケジュール無効化を選択した場合は日時を指定してください');
      return false;
    }
    
    if (formData.timing === 'scheduled' && formData.scheduledDate && formData.scheduledDate <= new Date()) {
      onStepError(1, '無効化日時は現在時刻より後の時間を指定してください');
      return false;
    }

    return true;
  };

  const handleExecute = async () => {
    if (!validateForm()) return;
    
    setIsExecuting(true);
    try {
      await onStepComplete(1, formData);
      navigate(`/retirement-processing/step2/${processId}`);
    } catch (error) {
      onStepError(1, error.message || 'ステップ1の実行中にエラーが発生しました');
    } finally {
      setIsExecuting(false);
      setShowConfirmation(false);
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
                <span className="text-3xl">🔒</span>
                ステップ1: アカウント無効化
              </h1>
              <p className="text-gray-400 text-sm">
                対象: {processState.employeeName} ({processState.employeeDepartment} {processState.employeeRole})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
              Step 1/4
            </span>
            <span className="text-gray-300">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 概要説明 */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              ステップ1の概要
            </h3>
            <p className="text-gray-300">
              対象職員のシステムアクセスを無効化し、セキュリティを確保します。
              この操作により、対象者はシステムにログインできなくなります。
            </p>
          </div>

          {/* 無効化設定 */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">無効化設定</h3>
            
            <div className="space-y-6">
              {/* 無効化タイミング */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">無効化タイミング</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      value="immediate"
                      checked={formData.timing === 'immediate'}
                      onChange={() => handleTimingChange('immediate')}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white font-medium">即座に無効化</span>
                      <p className="text-gray-400 text-sm">実行ボタンを押すと即座にアカウントが無効化されます</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      value="scheduled"
                      checked={formData.timing === 'scheduled'}
                      onChange={() => handleTimingChange('scheduled')}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-white font-medium">指定日時に無効化</span>
                      <p className="text-gray-400 text-sm mb-3">指定した日時に自動的に無効化されます</p>
                      {formData.timing === 'scheduled' && (
                        <input
                          type="datetime-local"
                          value={formData.scheduledDate?.toISOString().slice(0, 16) || ''}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* アクセス制限オプション */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">アクセス制限オプション</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 opacity-50"
                    />
                    <div>
                      <span className="text-gray-400">ログイン無効化</span>
                      <p className="text-gray-500 text-sm">（必須）新しいログインを無効化</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.forceLogout}
                      onChange={() => handleCheckboxChange('forceLogout')}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white">既存セッションの強制終了</span>
                      <p className="text-gray-400 text-sm">現在ログインしているセッションを強制終了</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyUser}
                      onChange={() => handleCheckboxChange('notifyUser')}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white">対象者への通知</span>
                      <p className="text-gray-400 text-sm">アカウント無効化を対象者にメール通知</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.backupCreated}
                      onChange={() => handleCheckboxChange('backupCreated')}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white">データバックアップ作成</span>
                      <p className="text-gray-400 text-sm">個人データのバックアップを作成（推奨）</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 警告と実行ボタン */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              重要な注意事項
            </h3>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• この操作により、対象者はシステムにアクセスできなくなります</li>
              <li>• 無効化された後は、レベル7権限者のみが復元可能です</li>
              <li>• 業務への影響を考慮し、適切なタイミングで実行してください</li>
              <li>• 実行前に対象者の業務状況を確認することを推奨します</li>
            </ul>
            
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isExecuting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? '実行中...' : 'ステップ1を実行してステップ2へ進む'}
            </button>
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">アカウント無効化の確認</h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {processState.employeeName} のアカウントを無効化します。
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">無効化タイミング:</span>
                  <span className="text-white">
                    {formData.timing === 'immediate' ? '即座に実行' : `${formData.scheduledDate?.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">強制ログアウト:</span>
                  <span className="text-white">{formData.forceLogout ? 'あり' : 'なし'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">バックアップ:</span>
                  <span className="text-white">{formData.backupCreated ? 'あり' : 'なし'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">
                ⚠️ この操作は取り消しが困難です。実行前に十分確認してください。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isExecuting ? '実行中...' : '実行する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1AccountDeactivation;