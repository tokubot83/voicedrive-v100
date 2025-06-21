// 理由付きメンバー選出のカスタムフック
import { useState, useCallback } from 'react';
import { MemberSelection, MemberCandidate, SelectionCriteria, SelectionResult } from '../types/memberSelection';
import BasicMemberSelectionService from '../services/BasicMemberSelectionService';
import { NotificationService } from '../services/NotificationService';

interface SelectedMemberWithReason {
  candidate: MemberCandidate;
  role: 'PROJECT_LEADER' | 'TEAM_MEMBER' | 'SPECIALIST' | 'ADVISOR';
  selectionReason?: string;
}

interface UseReasonedMemberSelectionOptions {
  projectId: string;
  selectorId: string;
  onSelectionComplete?: (selection: MemberSelection) => void;
  onError?: (error: string) => void;
}

export const useReasonedMemberSelection = ({
  projectId,
  selectorId,
  onSelectionComplete,
  onError
}: UseReasonedMemberSelectionOptions) => {
  const [selectedMembers, setSelectedMembers] = useState<SelectedMemberWithReason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const selectionService = new BasicMemberSelectionService();
  const notificationService = NotificationService.getInstance();

  /**
   * メンバーを選択（理由付き）
   */
  const selectMember = useCallback((
    candidate: MemberCandidate,
    role: SelectedMemberWithReason['role'] = 'TEAM_MEMBER',
    reason: string = ''
  ) => {
    if (selectedMembers.some(m => m.candidate.user.id === candidate.user.id)) {
      setError('既に選択済みのメンバーです');
      return false;
    }

    setSelectedMembers(prev => [...prev, {
      candidate,
      role,
      selectionReason: reason
    }]);
    setError('');
    return true;
  }, [selectedMembers]);

  /**
   * メンバーの選択を解除
   */
  const deselectMember = useCallback((userId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.candidate.user.id !== userId));
  }, []);

  /**
   * メンバーの役割を更新
   */
  const updateMemberRole = useCallback((userId: string, newRole: SelectedMemberWithReason['role']) => {
    setSelectedMembers(prev => prev.map(m =>
      m.candidate.user.id === userId
        ? { ...m, role: newRole }
        : m
    ));
  }, []);

  /**
   * メンバーの選出理由を更新
   */
  const updateMemberReason = useCallback((userId: string, reason: string) => {
    setSelectedMembers(prev => prev.map(m =>
      m.candidate.user.id === userId
        ? { ...m, selectionReason: reason }
        : m
    ));
  }, []);

  /**
   * 選定を実行（理由付き通知を送信）
   */
  const executeSelection = useCallback(async (
    criteria?: SelectionCriteria,
    projectTitle: string = 'プロジェクト',
    selectorName: string = '選出権限者'
  ): Promise<SelectionResult> => {
    if (selectedMembers.length === 0) {
      const errorMsg = '少なくとも1人のメンバーを選択してください';
      setError(errorMsg);
      onError?.(errorMsg);
      return { success: false, errors: [errorMsg] };
    }

    setLoading(true);
    setError('');

    try {
      // メンバーIDと理由のマップを作成
      const memberIds = selectedMembers.map(m => m.candidate.user.id);
      const memberReasons = new Map<string, string>();
      
      selectedMembers.forEach(member => {
        if (member.selectionReason) {
          memberReasons.set(member.candidate.user.id, member.selectionReason);
        }
      });

      // メンバー選出を実行
      const result = await selectionService.selectMembers(
        projectId,
        selectorId,
        memberIds,
        criteria,
        memberReasons
      );

      if (result.success && result.selection) {
        // 理由付き通知を送信
        await notificationService.sendMemberSelectionNotification(
          selectedMembers.map(member => ({
            userId: member.candidate.user.id,
            name: member.candidate.user.name,
            role: member.role,
            selectionReason: member.selectionReason
          })),
          {
            projectId,
            projectTitle,
            selectorName,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
          }
        );

        onSelectionComplete?.(result.selection);
        
        // 選出完了後、選択状態をリセット
        setSelectedMembers([]);
      } else {
        const errorMsg = result.errors?.join(', ') || '選定に失敗しました';
        setError(errorMsg);
        onError?.(errorMsg);
      }

      return result;

    } catch (err) {
      const errorMsg = '選定処理中にエラーが発生しました';
      setError(errorMsg);
      onError?.(errorMsg);
      return {
        success: false,
        errors: [errorMsg]
      };
    } finally {
      setLoading(false);
    }
  }, [
    selectedMembers,
    projectId,
    selectorId,
    onSelectionComplete,
    onError,
    selectionService,
    notificationService
  ]);

  /**
   * 選択状態をクリア
   */
  const clearSelection = useCallback(() => {
    setSelectedMembers([]);
    setError('');
  }, []);

  /**
   * 理由が入力されていないメンバーをチェック
   */
  const getMembersWithoutReason = useCallback(() => {
    return selectedMembers.filter(member => !member.selectionReason?.trim());
  }, [selectedMembers]);

  /**
   * 他部署メンバーをチェック（理由が特に重要）
   */
  const getCrossDepartmentMembers = useCallback((currentDepartment: string) => {
    return selectedMembers.filter(member => 
      member.candidate.user.department !== currentDepartment
    );
  }, [selectedMembers]);

  /**
   * 選出の妥当性をチェック
   */
  const validateSelection = useCallback((currentDepartment?: string) => {
    const issues: string[] = [];
    
    if (selectedMembers.length === 0) {
      issues.push('メンバーが選択されていません');
    }

    // 理由未入力チェック
    const membersWithoutReason = getMembersWithoutReason();
    if (membersWithoutReason.length > 0) {
      issues.push(`${membersWithoutReason.length}名の選出理由が未入力です`);
    }

    // 他部署メンバーの理由チェック
    if (currentDepartment) {
      const crossDeptMembers = getCrossDepartmentMembers(currentDepartment);
      const crossDeptWithoutReason = crossDeptMembers.filter(m => !m.selectionReason?.trim());
      
      if (crossDeptWithoutReason.length > 0) {
        issues.push(`他部署メンバー ${crossDeptWithoutReason.length}名の選出理由は特に重要です`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings: issues.filter(issue => issue.includes('理由'))
    };
  }, [selectedMembers, getMembersWithoutReason, getCrossDepartmentMembers]);

  return {
    // 状態
    selectedMembers,
    loading,
    error,
    
    // アクション
    selectMember,
    deselectMember,
    updateMemberRole,
    updateMemberReason,
    executeSelection,
    clearSelection,
    
    // ヘルパー
    getMembersWithoutReason,
    getCrossDepartmentMembers,
    validateSelection,
    
    // 計算値
    selectedCount: selectedMembers.length,
    hasSelection: selectedMembers.length > 0,
    allHaveReasons: selectedMembers.every(m => m.selectionReason?.trim())
  };
};

export default useReasonedMemberSelection;