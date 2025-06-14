// useMemberSelection Hook - メンバー選定機能の統合フック
// Phase 1: 基本的なメンバー選定機能のReactフック

import { useState, useEffect, useCallback } from 'react';
import { MemberSelection, MemberCandidate, SelectionCriteria, SelectionResult } from '../types/memberSelection';
import BasicMemberSelectionService from '../services/BasicMemberSelectionService';
import { PermissionLevel } from '../permissions/types/PermissionTypes';

interface UseMemberSelectionProps {
  projectId: string;
  selectorId: string;
  initialCriteria?: SelectionCriteria;
}

interface UseMemberSelectionReturn {
  // 状態
  candidates: MemberCandidate[];
  currentSelection: MemberSelection | null;
  loading: boolean;
  error: string | null;
  
  // 選定機能
  selectMembers: (memberIds: string[], criteria?: SelectionCriteria) => Promise<SelectionResult>;
  loadCandidates: (departmentId?: string) => Promise<void>;
  approveSelection: (selectionId: string) => Promise<SelectionResult>;
  
  // ユーティリティ
  canSelectMembers: boolean;
  maxTeamSize: number;
  selectedMemberCount: number;
  
  // フィルタリング・検索
  searchCandidates: (searchTerm: string) => void;
  filterByAvailability: (availableOnly: boolean) => void;
  filterByDepartment: (departmentId: string) => void;
  
  // 選定履歴
  selectionHistory: MemberSelection[];
  loadSelectionHistory: () => Promise<void>;
}

/**
 * メンバー選定機能のカスタムフック
 */
export const useMemberSelection = ({
  projectId,
  selectorId,
  initialCriteria
}: UseMemberSelectionProps): UseMemberSelectionReturn => {
  
  // 状態管理
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<MemberCandidate[]>([]);
  const [currentSelection, setCurrentSelection] = useState<MemberSelection | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<MemberSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // サービスインスタンス
  const selectionService = new BasicMemberSelectionService();

  // 権限チェック
  const [canSelectMembers, setCanSelectMembers] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState(10);

  useEffect(() => {
    checkSelectionPermissions();
    loadInitialData();
  }, [projectId, selectorId]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, availabilityFilter, departmentFilter, allCandidates]);

  /**
   * 選定権限をチェック
   */
  const checkSelectionPermissions = async () => {
    try {
      const permissionCheck = await selectionService.validateSelectionPermission(
        selectorId,
        projectId,
        'BASIC'
      );
      
      setCanSelectMembers(permissionCheck.hasPermission);
      
      // 権限レベルに応じた制限設定
      // 実際の実装では、ユーザーサービスから権限情報を取得
      setMaxTeamSize(10); // デフォルト値
      
    } catch (err) {
      setError('権限チェック中にエラーが発生しました');
      setCanSelectMembers(false);
    }
  };

  /**
   * 初期データを読み込み
   */
  const loadInitialData = async () => {
    await Promise.all([
      loadCandidates(),
      loadSelectionHistory()
    ]);
  };

  /**
   * 候補者リストを読み込み
   */
  const loadCandidates = useCallback(async (departmentId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 実際の実装では、API から候補者データを取得
      const candidateList = await selectionService.getDepartmentCandidates(
        departmentId || 'default-department',
        initialCriteria
      );
      
      setAllCandidates(candidateList);
      setCandidates(candidateList);
      
    } catch (err) {
      setError('候補者の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [initialCriteria]);

  /**
   * メンバーを選定
   */
  const selectMembers = useCallback(async (
    memberIds: string[],
    criteria?: SelectionCriteria
  ): Promise<SelectionResult> => {
    if (!canSelectMembers) {
      return {
        success: false,
        errors: ['メンバー選定の権限がありません']
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await selectionService.selectMembers(
        projectId,
        selectorId,
        memberIds,
        criteria || initialCriteria
      );

      if (result.success && result.selection) {
        setCurrentSelection(result.selection);
        // 選定履歴を更新
        await loadSelectionHistory();
      } else {
        setError(result.errors?.join(', ') || '選定に失敗しました');
      }

      return result;
      
    } catch (err) {
      const errorMessage = '選定処理中にエラーが発生しました';
      setError(errorMessage);
      return {
        success: false,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [projectId, selectorId, canSelectMembers, initialCriteria]);

  /**
   * 選定を承認
   */
  const approveSelection = useCallback(async (selectionId: string): Promise<SelectionResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await selectionService.approveSelection(selectionId, selectorId);
      
      if (result.success && result.selection) {
        setCurrentSelection(result.selection);
        await loadSelectionHistory();
      } else {
        setError(result.errors?.join(', ') || '承認に失敗しました');
      }

      return result;
      
    } catch (err) {
      const errorMessage = '承認処理中にエラーが発生しました';
      setError(errorMessage);
      return {
        success: false,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, [selectorId]);

  /**
   * 選定履歴を読み込み
   */
  const loadSelectionHistory = useCallback(async () => {
    try {
      const history = await selectionService.getProjectSelections(projectId);
      setSelectionHistory(history);
      
      // 現在アクティブな選定があれば設定
      const activeSelection = history.find(s => s.status === 'ACTIVE' || s.status === 'APPROVED');
      if (activeSelection) {
        setCurrentSelection(activeSelection);
      }
      
    } catch (err) {
      console.error('選定履歴の読み込みに失敗しました:', err);
    }
  }, [projectId]);

  /**
   * フィルターを適用
   */
  const applyFilters = useCallback(() => {
    let filtered = [...allCandidates];

    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.user.name.toLowerCase().includes(term) ||
        candidate.user.department.toLowerCase().includes(term) ||
        candidate.user.role.toLowerCase().includes(term)
      );
    }

    // 可用性フィルター
    if (availabilityFilter) {
      filtered = filtered.filter(candidate => candidate.availability.isAvailable);
    }

    // 部門フィルター
    if (departmentFilter) {
      filtered = filtered.filter(candidate => candidate.user.department === departmentFilter);
    }

    setCandidates(filtered);
  }, [allCandidates, searchTerm, availabilityFilter, departmentFilter]);

  /**
   * 候補者を検索
   */
  const searchCandidates = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  /**
   * 可用性でフィルター
   */
  const filterByAvailability = useCallback((availableOnly: boolean) => {
    setAvailabilityFilter(availableOnly);
  }, []);

  /**
   * 部門でフィルター
   */
  const filterByDepartment = useCallback((departmentId: string) => {
    setDepartmentFilter(departmentId);
  }, []);

  /**
   * 選択済みメンバー数を計算
   */
  const selectedMemberCount = currentSelection 
    ? currentSelection.selectedMembers.filter(m => !m.isRequired).length 
    : 0;

  return {
    // 状態
    candidates,
    currentSelection,
    loading,
    error,
    
    // 機能
    selectMembers,
    loadCandidates,
    approveSelection,
    
    // ユーティリティ
    canSelectMembers,
    maxTeamSize,
    selectedMemberCount,
    
    // フィルタリング
    searchCandidates,
    filterByAvailability,
    filterByDepartment,
    
    // 履歴
    selectionHistory,
    loadSelectionHistory
  };
};

export default useMemberSelection;