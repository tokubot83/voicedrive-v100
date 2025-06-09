// プロジェクトワークフロー状態表示コンポーネント - Phase 2 実装
import React from 'react';
import { useWorkflow } from '../../hooks/workflow/useWorkflow';
import { usePermissions } from '../../hooks/usePermissions';
import EnhancedWorkflowTimeline from './EnhancedWorkflowTimeline';
import WorkflowActions from './WorkflowActions';
import { ApprovalWorkflowEngine } from '../../services/ApprovalWorkflowEngine';

interface ProjectWorkflowStatusProps {
  projectId: string;
  className?: string;
}

const ProjectWorkflowStatus: React.FC<ProjectWorkflowStatusProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const { workflow, currentStage, updateStage, loading, error } = useWorkflow(projectId);
  const { hasPermission, userLevel } = usePermissions();
  const workflowEngine = new ApprovalWorkflowEngine();
  
  if (loading) {
    return (
      <div className="workflow-loading">
        <div className="loading-spinner">🔄</div>
        <span>承認フロー読み込み中...</span>
      </div>
    );
  }
  
  if (error || !workflow) {
    return (
      <div className="workflow-error">
        承認フローの読み込みに失敗しました
      </div>
    );
  }
  
  return (
    <div className={`project-workflow-status ${className}`}>
      <EnhancedWorkflowTimeline 
        stages={workflow.stages}
        currentStage={currentStage}
        onStageAction={updateStage}
        userPermissions={{ hasPermission, userLevel: String(userLevel) }}
        workflowEngine={workflowEngine}
      />
    </div>
  );
};

interface WorkflowHeaderProps {
  workflow: any;
  currentStage: number;
  workflowEngine: ApprovalWorkflowEngine;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ 
  workflow, 
  currentStage,
  workflowEngine 
}) => {
  const getStatusConfig = (stage: any) => {
    const configs = {
      IN_PROGRESS: { icon: '🔄', color: '#ff7a00', label: '進行中' },
      COMPLETED: { icon: '✅', color: '#00ba7c', label: '完了' },
      PENDING: { icon: '⏳', color: '#71767b', label: '待機中' },
      ESCALATED: { icon: '🚨', color: '#dc2626', label: 'エスカレーション' },
      REJECTED: { icon: '❌', color: '#dc2626', label: '却下' }
    };
    return configs[stage.status] || configs.PENDING;
  };
  
  const currentStageData = workflow.stages[currentStage];
  const statusConfig = getStatusConfig(currentStageData);
  
  // ワークフロー全体の状態を判定
  const isCompleted = workflow.stages.every((s: any) => s.status === 'COMPLETED');
  const isRejected = workflow.stages.some((s: any) => s.status === 'REJECTED');
  
  const getTitle = () => {
    if (isRejected) return 'プロジェクト却下';
    if (isCompleted) return 'プロジェクト承認完了';
    if (currentStageData.stage === 'IMPLEMENTATION') return 'プロジェクト実行中';
    return '承認プロセス進行中';
  };
  
  return (
    <div className="workflow-header">
      <span className="workflow-icon" style={{ color: statusConfig.color }}>
        {statusConfig.icon}
      </span>
      <span className="workflow-title">
        {getTitle()}
      </span>
      <span className="workflow-badge">
        Step {currentStage + 1}/{workflow.stages.length}
      </span>
    </div>
  );
};

export default ProjectWorkflowStatus;