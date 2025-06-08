// ワークフロー管理カスタムフック - Phase 2 実装
import { useState, useEffect, useCallback } from 'react';
import { ProjectWorkflow, ApprovalWorkflowEngine } from '../../services/ApprovalWorkflowEngine';
import NotificationService from '../../services/NotificationService';
import EscalationService from '../../services/EscalationService';

interface UseWorkflowReturn {
  workflow: ProjectWorkflow | null;
  currentStage: number;
  loading: boolean;
  error: string | null;
  updateStage: (stageId: string, action: string, comment?: string) => Promise<void>;
  refreshWorkflow: () => Promise<void>;
}

export const useWorkflow = (projectId: string): UseWorkflowReturn => {
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const workflowEngine = new ApprovalWorkflowEngine();
  
  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 実際の実装では、APIからワークフローを取得
      // ここではデモ用にダミーデータを作成
      const demoWorkflow = await workflowEngine.initializeWorkflow({
        id: projectId,
        level: 'FACILITY',
        department: '看護部',
        facility: '第一病院'
      });
      
      // デモ用: 最初のステージを完了状態にする
      if (demoWorkflow.stages.length > 0) {
        demoWorkflow.stages[0].status = 'COMPLETED';
        demoWorkflow.stages[0].completedAt = new Date('2025-06-08T19:43:00');
        demoWorkflow.stages[0].comments = 'プロジェクト化基準を達成しました';
        
        // 2番目のステージを進行中にする
        if (demoWorkflow.stages.length > 1) {
          demoWorkflow.stages[1].status = 'IN_PROGRESS';
          demoWorkflow.currentStage = 1;
        }
      }
      
      setWorkflow(demoWorkflow);
      
      // エスカレーション監視を開始
      await EscalationService.initializeEscalationMonitoring(demoWorkflow);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ワークフローの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  useEffect(() => {
    fetchWorkflow();
    
    // クリーンアップ: エスカレーションタイマーをキャンセル
    return () => {
      EscalationService.cancelAllEscalations(projectId);
    };
  }, [fetchWorkflow, projectId]);
  
  const updateStage = useCallback(async (
    stageId: string, 
    action: string, 
    comment?: string
  ) => {
    if (!workflow) return;
    
    try {
      const stageIndex = workflow.stages.findIndex(s => s.id === stageId);
      if (stageIndex === -1) {
        throw new Error('Invalid stage');
      }
      
      const updatedWorkflow = { ...workflow };
      
      if (action === 'APPROVE') {
        await workflowEngine.completeStage(
          updatedWorkflow, 
          stageIndex, 
          'current-user', // 実際の実装では現在のユーザーIDを使用
          comment
        );
        
        // 承認通知を送信
        await NotificationService.sendWorkflowNotification(
          updatedWorkflow, 
          updatedWorkflow.stages[stageIndex], 
          'STAGE_COMPLETED'
        );
        
        // 次のステージがある場合は通知
        if (stageIndex < updatedWorkflow.stages.length - 1) {
          await NotificationService.sendWorkflowNotification(
            updatedWorkflow,
            updatedWorkflow.stages[stageIndex + 1],
            'STAGE_ASSIGNED'
          );
        } else {
          // ワークフロー完了通知
          await NotificationService.sendWorkflowNotification(
            updatedWorkflow,
            updatedWorkflow.stages[stageIndex],
            'WORKFLOW_COMPLETED'
          );
        }
        
      } else if (action === 'REJECT') {
        await workflowEngine.rejectStage(
          updatedWorkflow,
          stageIndex,
          'current-user',
          comment || '理由なし'
        );
        
        // 却下通知を送信
        await NotificationService.sendWorkflowNotification(
          updatedWorkflow,
          updatedWorkflow.stages[stageIndex],
          'WORKFLOW_REJECTED'
        );
      }
      
      setWorkflow(updatedWorkflow);
      
      // 実際の実装では、APIでワークフローを保存
      console.log('Workflow updated:', updatedWorkflow);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステージの更新に失敗しました');
    }
  }, [workflow, workflowEngine]);
  
  return {
    workflow,
    currentStage: workflow?.currentStage || 0,
    loading,
    error,
    updateStage,
    refreshWorkflow: fetchWorkflow
  };
};