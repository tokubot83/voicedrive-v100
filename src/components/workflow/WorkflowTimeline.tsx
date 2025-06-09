// ワークフロータイムライン表示コンポーネント - Phase 2 実装
import React from 'react';
import { WorkflowStage, ApprovalWorkflowEngine } from '../../services/ApprovalWorkflowEngine';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  currentStage: number;
  onStageAction: (stageId: string, action: string, comment?: string) => void;
  userPermissions: {
    hasPermission: (permission: string) => boolean;
    userLevel: string;
  };
  workflowEngine: ApprovalWorkflowEngine;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ 
  stages, 
  currentStage, 
  onStageAction, 
  userPermissions,
  workflowEngine
}) => {
  const canUserApprove = (stage: WorkflowStage): boolean => {
    if (stage.status !== 'IN_PROGRESS') return false;
    if (!stage.requiredLevel) return false;
    return userPermissions.hasPermission(String(stage.requiredLevel));
  };
  
  return (
    <div className="workflow-timeline">
      {stages.map((stage, index) => (
        <WorkflowStep
          key={stage.id}
          stage={stage}
          index={index}
          isActive={index === currentStage}
          isCompleted={stage.status === 'COMPLETED'}
          isPending={stage.status === 'PENDING'}
          onAction={onStageAction}
          canApprove={canUserApprove(stage)}
          workflowEngine={workflowEngine}
        />
      ))}
    </div>
  );
};

interface WorkflowStepProps {
  stage: WorkflowStage;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isPending: boolean;
  onAction: (stageId: string, action: string, comment?: string) => void;
  canApprove: boolean;
  workflowEngine: ApprovalWorkflowEngine;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ 
  stage, 
  index, 
  isActive, 
  isCompleted, 
  isPending, 
  onAction, 
  canApprove,
  workflowEngine
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [comment, setComment] = React.useState('');
  
  const getStepClassNames = () => {
    const base = 'workflow-step';
    if (isCompleted) return `${base} completed`;
    if (isActive) return `${base} active`;
    if (stage.status === 'REJECTED') return `${base} rejected`;
    if (stage.status === 'ESCALATED') return `${base} escalated`;
    return `${base} pending`;
  };
  
  const getStepIcon = () => {
    if (isCompleted) return '✅';
    if (stage.status === 'REJECTED') return '❌';
    if (stage.status === 'ESCALATED') return '🚨';
    if (isActive) return '🔄';
    return '⏳';
  };
  
  const handleApprove = () => {
    onAction(stage.id, 'APPROVE', comment);
    setShowActions(false);
    setComment('');
  };
  
  const handleReject = () => {
    if (!comment) {
      alert('却下理由を入力してください');
      return;
    }
    onAction(stage.id, 'REJECT', comment);
    setShowActions(false);
    setComment('');
  };
  
  return (
    <div className={getStepClassNames()}>
      <div className="step-connector" />
      <div className="step-icon">{getStepIcon()}</div>
      <div className="step-content">
        <div className="step-title">
          {workflowEngine.getStageDisplayName(stage.stage)}
        </div>
        
        {stage.assignedTo && (
          <div className="step-assignee">
            {stage.assignedTo.name} 
            {isActive && !isCompleted && ' (承認待ち)'}
            {stage.status === 'ESCALATED' && ' (エスカレーション済み)'}
          </div>
        )}
        
        {stage.completedAt && (
          <div className="step-time">
            完了: {formatDateTime(stage.completedAt)}
          </div>
        )}
        
        {stage.dueDate && isActive && (
          <div className="step-due">
            期限: {formatDate(stage.dueDate)}
            {new Date(stage.dueDate) < new Date() && (
              <span className="overdue-badge">期限超過</span>
            )}
          </div>
        )}
        
        {stage.comments && (
          <div className="step-comments">
            💬 {stage.comments}
          </div>
        )}
        
        {isActive && canApprove && !showActions && (
          <button 
            className="btn-show-actions"
            onClick={() => setShowActions(true)}
          >
            アクションを表示
          </button>
        )}
        
        {isActive && canApprove && showActions && (
          <div className="step-actions">
            <textarea
              className="action-comment"
              placeholder="コメント（任意）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="action-buttons">
              <button 
                className="btn-approve"
                onClick={handleApprove}
              >
                ✅ 承認
              </button>
              <button 
                className="btn-reject"
                onClick={handleReject}
              >
                ❌ 却下
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowActions(false);
                  setComment('');
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTimeline;