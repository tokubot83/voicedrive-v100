// ワークフローアクションコンポーネント - Phase 2 実装
import React from 'react';
import { ProjectWorkflow } from '../../services/ApprovalWorkflowEngine';

interface WorkflowActionsProps {
  workflow: ProjectWorkflow;
  currentStage: number;
  userPermissions: {
    hasPermission: (permission: string) => boolean;
    userLevel: string;
  };
}

const WorkflowActions: React.FC<WorkflowActionsProps> = ({ 
  workflow, 
  currentStage, 
  userPermissions 
}) => {
  const currentStageData = workflow.stages[currentStage];
  const isWorkflowComplete = workflow.stages.every(s => s.status === 'COMPLETED');
  const isWorkflowRejected = workflow.stages.some(s => s.status === 'REJECTED');
  
  // 管理者向けアクション
  const canManageWorkflow = userPermissions.hasPermission('LEVEL_4');
  const canViewDetails = userPermissions.hasPermission('LEVEL_2');
  
  const handleViewHistory = () => {
    console.log('View workflow history');
    // 実装: ワークフロー履歴モーダルを表示
  };
  
  const handleExportReport = () => {
    console.log('Export workflow report');
    // 実装: レポートエクスポート処理
  };
  
  const handleEscalate = () => {
    console.log('Manually escalate');
    // 実装: 手動エスカレーション処理
  };
  
  const handleRestart = () => {
    console.log('Restart workflow');
    // 実装: ワークフロー再開処理
  };
  
  return (
    <div className="workflow-actions">
      {canViewDetails && (
        <button 
          className="btn-action btn-view-history"
          onClick={handleViewHistory}
        >
          📋 履歴を表示
        </button>
      )}
      
      {canManageWorkflow && !isWorkflowComplete && !isWorkflowRejected && (
        <button 
          className="btn-action btn-escalate"
          onClick={handleEscalate}
        >
          🚨 手動エスカレーション
        </button>
      )}
      
      {canManageWorkflow && (
        <button 
          className="btn-action btn-export"
          onClick={handleExportReport}
        >
          📊 レポート出力
        </button>
      )}
      
      {canManageWorkflow && isWorkflowRejected && (
        <button 
          className="btn-action btn-restart"
          onClick={handleRestart}
        >
          🔄 ワークフロー再開
        </button>
      )}
      
      {/* プロジェクト実行フェーズのアクション */}
      {currentStageData.stage === 'IMPLEMENTATION' && isWorkflowComplete && (
        <div className="implementation-actions">
          <button className="btn-action btn-view-project">
            🏗️ プロジェクト詳細
          </button>
          <button className="btn-action btn-view-progress">
            📈 進捗確認
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowActions;