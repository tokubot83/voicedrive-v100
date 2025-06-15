// MemberSelectionPanel - プロジェクトメンバー選定UI
// Phase 1: 基本的な選定機能のUI実装

import React, { useState, useEffect } from 'react';
import { User, HierarchicalUser } from '../../types';
import { MemberCandidate, MemberSelection, SelectionCriteria, MemberRole } from '../../types/memberSelection';
import BasicMemberSelectionService from '../../services/BasicMemberSelectionService';

interface MemberSelectionPanelProps {
  projectId: string;
  selectorId: string;
  approvalCompleted?: boolean;
  approvalCompletedAt?: Date;
  onSelectionComplete?: (selection: MemberSelection) => void;
  onCancel?: () => void;
}

interface SelectedMember {
  candidate: MemberCandidate;
  role: MemberRole;
  responsibility?: string;
}

export const MemberSelectionPanel: React.FC<MemberSelectionPanelProps> = ({
  projectId,
  selectorId,
  approvalCompleted = false,
  approvalCompletedAt,
  onSelectionComplete,
  onCancel
}) => {
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [criteria, setCriteria] = useState<SelectionCriteria>({
    projectScope: 'DEPARTMENT' as any,
    maxTeamSize: 10
  });

  const selectionService = new BasicMemberSelectionService();

  useEffect(() => {
    loadCandidates();
  }, []);

  /**
   * 候補者リストを読み込み
   */
  const loadCandidates = async () => {
    setLoading(true);
    try {
      // デモ用の候補者データを生成
      const demoUsers: HierarchicalUser[] = [
        {
          id: 'user-1',
          name: '田中 太郎',
          department: '看護部',
          role: '看護師',
          accountType: 'STAFF',
          permissionLevel: 1,
          facility_id: 'facility-1'
        },
        {
          id: 'user-2', 
          name: '佐藤 花子',
          department: 'リハビリテーション部',
          role: '理学療法士',
          accountType: 'SUPERVISOR',
          permissionLevel: 2,
          facility_id: 'facility-1'
        },
        {
          id: 'user-3',
          name: '山田 次郎',
          department: '事務部',
          role: '事務職員',
          accountType: 'STAFF',
          permissionLevel: 1,
          facility_id: 'facility-1'
        },
        {
          id: 'user-4',
          name: '鈴木 美咲',
          department: '薬剤部',
          role: '薬剤師',
          accountType: 'DEPARTMENT_HEAD',
          permissionLevel: 3,
          facility_id: 'facility-1'
        }
      ];

      const candidateList: MemberCandidate[] = demoUsers.map(user => ({
        user,
        availability: {
          isAvailable: Math.random() > 0.2,
          currentProjects: Math.floor(Math.random() * 4),
          workloadPercentage: Math.floor(Math.random() * 80) + 20,
          constraints: []
        },
        skillMatch: Math.floor(Math.random() * 40) + 60,
        workloadCapacity: Math.floor(Math.random() * 60) + 20,
        departmentMatch: true,
        facilityMatch: true,
        recommendationScore: Math.floor(Math.random() * 30) + 70
      }));

      setCandidates(candidateList.sort((a, b) => b.recommendationScore - a.recommendationScore));
    } catch (err) {
      setError('候補者の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * メンバーを選択
   */
  const selectMember = (candidate: MemberCandidate, role: MemberRole = 'TEAM_MEMBER') => {
    if (selectedMembers.some(m => m.candidate.user.id === candidate.user.id)) {
      return; // 既に選択済み
    }

    if (selectedMembers.length >= (criteria.maxTeamSize || 10)) {
      setError(`チームサイズの上限 (${criteria.maxTeamSize}) に達しています`);
      return;
    }

    setSelectedMembers([...selectedMembers, { candidate, role }]);
    setError('');
  };

  /**
   * メンバーの選択を解除
   */
  const deselectMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.candidate.user.id !== userId));
  };

  /**
   * メンバーの役割を変更
   */
  const updateMemberRole = (userId: string, newRole: MemberRole) => {
    setSelectedMembers(selectedMembers.map(m => 
      m.candidate.user.id === userId 
        ? { ...m, role: newRole }
        : m
    ));
  };

  /**
   * 選定を実行
   */
  const executeSelection = async () => {
    if (selectedMembers.length === 0) {
      setError('少なくとも1人のメンバーを選択してください');
      return;
    }

    setLoading(true);
    try {
      const memberIds = selectedMembers.map(m => m.candidate.user.id);
      const result = await selectionService.selectMembers(projectId, selectorId, memberIds, criteria);

      if (result.success && result.selection) {
        onSelectionComplete?.(result.selection);
      } else {
        setError(result.errors?.join(', ') || '選定に失敗しました');
      }
    } catch (err) {
      setError('選定処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 候補者をフィルタリング
   */
  const filteredCandidates = candidates.filter(candidate => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        candidate.user.name.toLowerCase().includes(term) ||
        candidate.user.department.toLowerCase().includes(term) ||
        candidate.user.role.toLowerCase().includes(term)
      );
    }
    return true;
  });

  /**
   * 可用性の表示
   */
  const getAvailabilityDisplay = (availability: MemberCandidate['availability']) => {
    if (!availability.isAvailable) {
      return <span className="text-red-600">利用不可</span>;
    }
    
    const workloadColor = availability.workloadPercentage > 80 ? 'text-orange-600' : 'text-green-600';
    return <span className={workloadColor}>負荷 {availability.workloadPercentage}%</span>;
  };

  if (loading && candidates.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">候補者を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">プロジェクトメンバー選定</h2>
        <p className="text-sm text-gray-600 mt-1">候補者から適切なメンバーを選択してください</p>
        
        {/* 承認状態の表示 */}
        {!approvalCompleted ? (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 text-sm font-medium">承認待ち</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              プロジェクトの承認が完了してからメンバー選出を開始できます。
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 text-sm font-medium">承認完了</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              {approvalCompletedAt && `${approvalCompletedAt.toLocaleDateString('ja-JP')} ${approvalCompletedAt.toLocaleTimeString('ja-JP')} に承認が完了しました。`}
              メンバー選出を開始できます。
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="p-6">
        {/* 検索とフィルター */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="名前、部署、役職で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={criteria.maxTeamSize || 10}
                onChange={(e) => setCriteria({...criteria, maxTeamSize: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>最大5名</option>
                <option value={10}>最大10名</option>
                <option value={15}>最大15名</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 候補者リスト */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">候補者一覧</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMembers.some(m => m.candidate.user.id === candidate.user.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectMember(candidate)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{candidate.user.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.user.department} - {candidate.user.role}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>スキルマッチ: {candidate.skillMatch}%</span>
                        <span>推奨度: {candidate.recommendationScore}%</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      {getAvailabilityDisplay(candidate.availability)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 選択済みメンバー */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              選択済みメンバー ({selectedMembers.length}/{criteria.maxTeamSize || 10})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedMembers.map((selected) => (
                <div
                  key={selected.candidate.user.id}
                  className="p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{selected.candidate.user.name}</h4>
                      <p className="text-sm text-gray-600">{selected.candidate.user.department}</p>
                      <div className="mt-2">
                        <select
                          value={selected.role}
                          onChange={(e) => updateMemberRole(selected.candidate.user.id, e.target.value as MemberRole)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="TEAM_MEMBER">チームメンバー</option>
                          <option value="PROJECT_LEADER">プロジェクトリーダー</option>
                          <option value="SPECIALIST">専門家</option>
                          <option value="ADVISOR">アドバイザー</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deselectMember(selected.candidate.user.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}

              {selectedMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>メンバーが選択されていません</p>
                  <p className="text-sm">左の候補者リストからメンバーを選択してください</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={executeSelection}
            disabled={loading || selectedMembers.length === 0 || !approvalCompleted}
            className={`px-4 py-2 rounded-md transition-colors ${
              !approvalCompleted
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
            }`}
            title={!approvalCompleted ? '承認完了後に選定を実行できます' : ''}
          >
            {loading ? '選定中...' : '選定を確定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberSelectionPanel;