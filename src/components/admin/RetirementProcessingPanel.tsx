import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { RetirementProcessingService, RetirementProcessingOptions } from '../../services/RetirementProcessingService';
import { AuditService } from '../../services/AuditService';
import NotificationService from '../../services/NotificationService';
import { usePermissions } from '../../hooks/usePermissions';
import { RetirementFlowController } from '../../services/RetirementFlowController';
import { RetirementProcessState } from '../../types/retirementFlow';
import RetirementProgressIndicator from '../retirement/RetirementProgressIndicator';

interface RetirementProcessingPanelProps {
  currentUser: User;
}

const RetirementProcessingPanel = ({ currentUser }: RetirementProcessingPanelProps) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeProcesses, setActiveProcesses] = useState<RetirementProcessState[]>([]);
  const [retirementController] = useState(() => 
    RetirementFlowController.getInstance(
      AuditService.getInstance(),
      NotificationService.getInstance()
    )
  );
  
  const [processingOptions, setProcessingOptions] = useState<RetirementProcessingOptions>({
    preserveAnonymousContent: true,
    anonymizationLevel: 'department',
    retentionPeriod: 24
  });

  // レベル6権限チェック
  if (!hasPermission('MANAGE_RETIREMENT')) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400">退職処理にはレベル6以上の権限が必要です</p>
      </div>
    );
  }

  useEffect(() => {
    // アクティブなプロセスを取得
    const processes = retirementController.getAllProcesses();
    setActiveProcesses(processes);
  }, [retirementController]);

  const handleStartRetirementProcess = async () => {
    if (!selectedUser || !currentUser) return;

    setIsProcessing(true);
    try {
      const processId = await retirementController.startRetirementProcess(
        selectedUser,
        currentUser
      );

      // 成功通知
      alert(`${selectedUser.name}の退職処理プロセスを開始しました`);
      setSelectedUser(null);
      setShowConfirmDialog(false);
      
      // ステップ1に移動
      navigate(`/retirement-processing/step1/${processId}`);
    } catch (error) {
      console.error('退職プロセス開始エラー:', error);
      alert('退職処理プロセスの開始中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeProcess = (processId: string, currentStep: number) => {
    navigate(`/retirement-processing/step${currentStep}/${processId}`);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-3xl">👤</span>
          退職処理管理
        </h2>
        <p className="text-gray-400">職員の退職に伴うアカウント処理を行います</p>
      </div>

      {/* ユーザー検索 */}
      <div className="mb-6">
        <label className="block text-gray-300 mb-2 font-medium">対象職員の検索</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="氏名または職員IDで検索..."
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* 処理オプション */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-800/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">処理オプション</h3>
          
          <div className="space-y-4">
            {/* 匿名化レベル */}
         
            <div>
              <label className="block text-gray-300 mb-2">匿名化レベル</label>
              <select
                value={processingOptions.anonymizationLevel}
                onChange={(e) => setProcessingOptions({
                  ...processingOptions,
                  anonymizationLevel: e.target.value as 'full' | 'department' | 'partial'
                })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white"
              >
                <option value="full">完全匿名化（すべて「退職者」として表示）</option>
                <option value="department">部署レベル保持（「元○○部職員」として表示）</option>
                <option value="partial">部分的保持（役職を除き部署情報を保持）</option>
              </select>
            </div>

            {/* 保持期間 */}
            <div>
              <label className="block text-gray-300 mb-2">データ保持期間</label>
              <select
                value={processingOptions.retentionPeriod}
                onChange={(e) => setProcessingOptions({
                  ...processingOptions,
                  retentionPeriod: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white"
              >
                <option value="12">1年間</option>
                <option value="24">2年間</option>
                <option value="36">3年間</option>
                <option value="60">5年間</option>
              </select>
              <p className="text-gray-500 text-sm mt-1">
                指定期間経過後、完全匿名化されます
              </p>
            </div>

            {/* 匿名コンテンツの保持 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="preserveAnonymous"
                checked={processingOptions.preserveAnonymousContent}
                onChange={(e) => setProcessingOptions({
                  ...processingOptions,
                  preserveAnonymousContent: e.target.checked
                })}
                className="w-5 h-5 bg-gray-700 border-gray-600 rounded"
              />
              <label htmlFor="preserveAnonymous" className="text-gray-300">
                元々匿名で投稿されたコンテンツをそのまま保持
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 選択されたユーザー情報 */}
      {selectedUser && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h4 className="text-blue-400 font-bold mb-2">選択された職員</h4>
          <div className="text-white">
            <p>氏名: {selectedUser.name}</p>
            <p>部署: {selectedUser.department}</p>
            <p>役職: {selectedUser.role}</p>
          </div>
        </div>
      )}

      {/* 処理実行ボタン */}
      <button
        onClick={() => setShowConfirmDialog(true)}
        disabled={!selectedUser || isProcessing}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'プロセス開始中...' : '段階的退職処理を開始'}
      </button>

      {/* アクティブプロセス一覧 */}
      {activeProcesses.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">進行中のプロセス</h3>
          <div className="space-y-4">
            {activeProcesses.map((process) => (
              <div key={process.processId} className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{process.employeeName}</h4>
                    <p className="text-gray-400 text-sm">{process.employeeDepartment} {process.employeeRole}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                      ステップ {process.currentStep}/4
                    </span>
                    <button
                      onClick={() => handleResumeProcess(process.processId, process.currentStep)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      続行
                    </button>
                  </div>
                </div>
                <RetirementProgressIndicator processState={process} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">退職処理の確認</h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                以下の処理を実行します。この操作は取り消しができません。
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• アカウントの無効化</li>
                <li>• すべての権限の取り消し</li>
                <li>• 投稿・コメントの匿名化（設定に従う）</li>
                <li>• アクセストークンの無効化</li>
              </ul>
            </div>
            
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">
                ⚠️ この操作は監査ログに記録され、レベル7権限でのみ取り消し可能です
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleStartRetirementProcess}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                プロセス開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 処理履歴 */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">最近の処理履歴</h3>
        <div className="space-y-2">
          <div className="bg-gray-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-300">元営業部職員</p>
              <p className="text-gray-500 text-sm">処理日: 2024/10/15</p>
            </div>
            <span className="text-gray-400 text-sm">部署レベル匿名化</span>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-300">退職者</p>
              <p className="text-gray-500 text-sm">処理日: 2024/09/01</p>
            </div>
            <span className="text-gray-400 text-sm">完全匿名化</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementProcessingPanel;