import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RetirementStepProps, Step2PermissionRevocationData } from '../../types/retirementFlow';
import { useDemoMode } from '../demo/DemoModeController';

interface Step2Props extends Omit<RetirementStepProps, 'processState'> {
  processState?: RetirementStepProps['processState'];
}

const Step2PermissionRevocation: React.FC<Step2Props> = ({
  processState,
  onStepComplete,
  onStepError,
  onNavigateBack
}) => {
  const navigate = useNavigate();
  const { processId } = useParams<{ processId: string }>();
  const { currentUser } = useDemoMode();
  
  const [formData, setFormData] = useState<Step2PermissionRevocationData>({
    revokedPermissions: [],
    handoverAssignments: {},
    projectHandovers: [],
    emergencyContacts: []
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // サンプル権限データ
  const availablePermissions = [
    { id: 'user_management', name: 'ユーザー管理権限', critical: true },
    { id: 'system_settings', name: 'システム設定権限', critical: true },
    { id: 'approval_authority', name: '承認権限', critical: false },
    { id: 'project_creation', name: 'プロジェクト作成権限', critical: false },
    { id: 'budget_approval', name: '予算承認権限', critical: true },
    { id: 'hr_management', name: '人事管理権限', critical: true }
  ];

  const availableAssignees = [
    { id: 'tanaka_dept_head', name: '田中部長' },
    { id: 'yamada_manager', name: '山田課長' },
    { id: 'sato_supervisor', name: '佐藤主任' },
    { id: 'suzuki_leader', name: '鈴木リーダー' }
  ];

  const sampleProjects = [
    { id: 'proj_001', name: '業務効率化プロジェクト' },
    { id: 'proj_002', name: 'システム刷新計画' },
    { id: 'proj_003', name: 'セキュリティ強化' }
  ];

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      revokedPermissions: checked 
        ? [...prev.revokedPermissions, permissionId]
        : prev.revokedPermissions.filter(id => id !== permissionId)
    }));
  };

  const handleHandoverChange = (permission: string, assigneeId: string) => {
    setFormData(prev => ({
      ...prev,
      handoverAssignments: {
        ...prev.handoverAssignments,
        [permission]: assigneeId
      }
    }));
  };

  const handleProjectHandoverChange = (projectId: string, newOwnerId: string) => {
    setFormData(prev => ({
      ...prev,
      projectHandovers: [
        ...prev.projectHandovers.filter(h => h.projectId !== projectId),
        { projectId, newOwnerId }
      ]
    }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onStepComplete(2, formData);
      navigate(`/retirement-processing/step3/${processId}`);
    } catch (error) {
      onStepError(2, error.message || 'ステップ2の実行中にエラーが発生しました');
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
                <span className="text-3xl">🚫</span>
                ステップ2: 権限取り消し
              </h1>
              <p className="text-gray-400 text-sm">
                対象: {processState.employeeName} ({processState.employeeDepartment} {processState.employeeRole})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
              Step 2/4
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
              ステップ2の概要
            </h3>
            <p className="text-gray-300">
              対象職員の権限を適切に取り消し、必要に応じて他の職員に引き継ぎを行います。
              業務の継続性を確保するため、重要な権限は必ず引き継ぎ先を指定してください。
            </p>
          </div>

          {/* 権限取り消し設定 */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">取り消し対象権限</h3>
            
            <div className="space-y-4">
              {availablePermissions.map(permission => (
                <div key={permission.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.revokedPermissions.includes(permission.id)}
                      onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600"
                    />
                    <div>
                      <span className="text-white font-medium">{permission.name}</span>
                      {permission.critical && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                          重要
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {formData.revokedPermissions.includes(permission.id) && permission.critical && (
                    <select
                      value={formData.handoverAssignments[permission.id] || ''}
                      onChange={(e) => handleHandoverChange(permission.id, e.target.value)}
                      className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm"
                    >
                      <option value="">引き継ぎ先を選択</option>
                      {availableAssignees.map(assignee => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* プロジェクト引き継ぎ */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">プロジェクト引き継ぎ</h3>
            
            <div className="space-y-4">
              {sampleProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                  <div>
                    <span className="text-white font-medium">{project.name}</span>
                    <p className="text-gray-400 text-sm">プロジェクトID: {project.id}</p>
                  </div>
                  
                  <select
                    value={formData.projectHandovers.find(h => h.projectId === project.id)?.newOwnerId || ''}
                    onChange={(e) => handleProjectHandoverChange(project.id, e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm"
                  >
                    <option value="">新しい責任者を選択</option>
                    {availableAssignees.map(assignee => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 緊急連絡先 */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6">緊急連絡先</h3>
            <p className="text-gray-400 text-sm mb-4">
              権限移譲完了時に通知を送信する関係者を選択してください。
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {availableAssignees.map(assignee => (
                <label key={assignee.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergencyContacts.includes(assignee.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          emergencyContacts: [...prev.emergencyContacts, assignee.id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          emergencyContacts: prev.emergencyContacts.filter(id => id !== assignee.id)
                        }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                  />
                  <span className="text-white">{assignee.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 実行ボタン */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              重要な注意事項
            </h3>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• 重要な権限は必ず引き継ぎ先を指定してください</li>
              <li>• 引き継ぎが不完全な場合、業務に影響が出る可能性があります</li>
              <li>• 取り消された権限は即座に無効化されます</li>
              <li>• プロジェクトの引き継ぎは事前に関係者に連絡することを推奨します</li>
            </ul>
            
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isExecuting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? '実行中...' : 'ステップ2を実行してステップ3へ進む'}
            </button>
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">権限取り消しの確認</h3>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {processState.employeeName} の権限を取り消します。
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">取り消し権限数:</span>
                  <span className="text-white ml-2">{formData.revokedPermissions.length}件</span>
                </div>
                <div>
                  <span className="text-gray-400">引き継ぎ設定:</span>
                  <span className="text-white ml-2">{Object.keys(formData.handoverAssignments).length}件</span>
                </div>
                <div>
                  <span className="text-gray-400">プロジェクト引き継ぎ:</span>
                  <span className="text-white ml-2">{formData.projectHandovers.length}件</span>
                </div>
              </div>
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

export default Step2PermissionRevocation;