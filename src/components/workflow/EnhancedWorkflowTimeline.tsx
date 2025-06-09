import React from 'react';
import { WorkflowStage, ApprovalWorkflowEngine } from '../../services/ApprovalWorkflowEngine';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface EnhancedWorkflowTimelineProps {
  stages: WorkflowStage[];
  currentStage: number;
  onStageAction: (stageId: string, action: string, comment?: string) => void;
  userPermissions: {
    hasPermission: (permission: string) => boolean;
    userLevel: string;
  };
  workflowEngine: ApprovalWorkflowEngine;
}

const EnhancedWorkflowTimeline: React.FC<EnhancedWorkflowTimelineProps> = ({ 
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

  // 全体の進捗率を計算
  const completedStages = stages.filter(s => s.status === 'COMPLETED').length;
  const progressPercentage = stages.length > 0 ? (completedStages / stages.length) * 100 : 0;

  if (!stages || stages.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-2xl p-6 mt-5">
        <p className="text-center text-gray-400">承認フローが設定されていません</p>
      </div>
    );
  }

  return (
    <div className="enhanced-workflow-timeline bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-2xl p-6 mt-5">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            🔄 承認プロセス進行状況
          </h3>
          <p className="text-sm text-gray-400">
            ステップ {currentStage + 1} / {stages.length} - {stages[currentStage]?.assignedTo?.name || 'システム'}が処理中
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{progressPercentage.toFixed(0)}%</div>
          <div className="text-xs text-gray-400">完了</div>
        </div>
      </div>

      {/* 全体進捗バー */}
      <div className="mb-8">
        <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* ステップ表示（横並び） */}
      <div className="relative">
        {/* 接続線 */}
        <div className="absolute top-8 left-[10%] right-[10%] h-1 bg-gray-700/50 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* ステップノード */}
        <div className="flex justify-between items-start relative z-10 px-8">
          {stages.map((stage, index) => (
            <EnhancedWorkflowStep
              key={stage.id}
              stage={stage}
              index={index}
              isActive={index === currentStage}
              isCompleted={stage.status === 'COMPLETED'}
              isPending={stage.status === 'PENDING'}
              onAction={onStageAction}
              canApprove={canUserApprove(stage)}
              workflowEngine={workflowEngine}
              totalStages={stages.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface EnhancedWorkflowStepProps {
  stage: WorkflowStage;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isPending: boolean;
  onAction: (stageId: string, action: string, comment?: string) => void;
  canApprove: boolean;
  workflowEngine: ApprovalWorkflowEngine;
  totalStages: number;
}

const EnhancedWorkflowStep: React.FC<EnhancedWorkflowStepProps> = ({ 
  stage, 
  index, 
  isActive, 
  isCompleted, 
  isPending, 
  onAction, 
  canApprove,
  workflowEngine,
  totalStages
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [comment, setComment] = React.useState('');
  
  const getStepIcon = () => {
    if (isCompleted) return '✅';
    if (stage.status === 'REJECTED') return '❌';
    if (stage.status === 'ESCALATED') return '🚨';
    if (isActive) return '🔄';
    return '⏳';
  };

  const getStepColor = () => {
    if (isCompleted) return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]';
    if (stage.status === 'REJECTED') return 'bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]';
    if (stage.status === 'ESCALATED') return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    if (isActive) return 'bg-blue-500 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.8)]';
    return 'bg-gray-600';
  };

  const getAvatarText = () => {
    if (stage.stage === 'PROJECT_CREATED') return 'SYS';
    if (stage.assignedTo?.name) {
      return stage.assignedTo.name.charAt(0);
    }
    return '?';
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
    <div className="flex flex-col items-center group relative">
      {/* ステップノード */}
      <div className="relative">
        {/* アバター/アイコン */}
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 cursor-pointer transform hover:scale-110 ${getStepColor()}`}
        >
          {stage.stage === 'PROJECT_CREATED' ? (
            <span className="text-2xl">{getStepIcon()}</span>
          ) : (
            <span className="text-lg">{getAvatarText()}</span>
          )}
        </div>
        
        {/* ステータスアイコン（右上） */}
        {stage.status !== 'PENDING' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-sm">
            {getStepIcon()}
          </div>
        )}
      </div>

      {/* ステップ情報 */}
      <div className="mt-3 text-center">
        <div className="text-xs font-semibold text-gray-300 mb-1 max-w-[100px] truncate">
          {workflowEngine.getStageDisplayName(stage.stage)}
        </div>
        
        {stage.assignedTo && (
          <div className="text-[10px] text-gray-500 max-w-[100px] truncate">
            {stage.assignedTo.name}
          </div>
        )}
        
        {stage.completedAt && (
          <div className="text-[10px] text-green-400">
            {formatDateTime(stage.completedAt).split(' ')[0]}
          </div>
        )}
        
        {stage.dueDate && isActive && (
          <div className="text-[10px] text-orange-400">
            期限: {formatDate(stage.dueDate)}
          </div>
        )}
      </div>

      {/* ホバー時の詳細情報 */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900/95 backdrop-blur-lg rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 border border-gray-700 shadow-xl scale-95 group-hover:scale-100">
        <div className="text-sm font-semibold text-gray-100 mb-2">
          {workflowEngine.getStageDisplayName(stage.stage)}
        </div>
        
        {stage.assignedTo && (
          <div className="text-xs text-gray-400 mb-1">
            承認者: {stage.assignedTo.name} {stage.assignedTo.department && `(${stage.assignedTo.department})`}
          </div>
        )}
        
        {stage.completedAt && (
          <div className="text-xs text-green-400 mb-1">
            完了: {formatDateTime(stage.completedAt)}
          </div>
        )}
        
        {stage.dueDate && (
          <div className="text-xs text-orange-400 mb-1">
            期限: {formatDate(stage.dueDate)}
          </div>
        )}
        
        {stage.comments && (
          <div className="text-xs text-gray-300 mt-2 pt-2 border-t border-gray-700">
            💬 {stage.comments}
          </div>
        )}
      </div>

      {/* アクションボタン（アクティブかつ承認可能な場合） */}
      {isActive && canApprove && (
        <div className="mt-3">
          {!showActions ? (
            <button 
              className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-all duration-300"
              onClick={() => setShowActions(true)}
            >
              アクション
            </button>
          ) : (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowActions(false)}>
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-100 mb-4">承認アクション</h3>
                
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-gray-100 text-sm mb-4"
                  placeholder="コメント（却下の場合は必須）"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                
                <div className="flex gap-3">
                  <button 
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                    onClick={handleApprove}
                  >
                    ✅ 承認
                  </button>
                  <button 
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                    onClick={handleReject}
                  >
                    ❌ 却下
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition-all duration-300"
                    onClick={() => {
                      setShowActions(false);
                      setComment('');
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedWorkflowTimeline;