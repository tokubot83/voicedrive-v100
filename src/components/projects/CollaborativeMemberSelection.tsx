// CollaborativeMemberSelection - 協議式メンバー選定UI
// Phase 2: ステークホルダー投票・合意形成機能

import React, { useState, useEffect } from 'react';
import { HierarchicalUser } from '../../types';
import { 
  MemberCandidate,
  SelectionCriteria 
} from '../../types/memberSelection';
import {
  CollaborativeSelection,
  StakeholderParticipant,
  CandidateVote,
  VotingRound,
  ProfessionBalance,
  CollaborationRequest
} from '../../services/CollaborativeMemberSelectionService';
import CollaborativeMemberSelectionService from '../../services/CollaborativeMemberSelectionService';

interface CollaborativeMemberSelectionProps {
  projectId: string;
  initiatorId: string;
  onComplete?: (selection: CollaborativeSelection) => void;
  onCancel?: () => void;
}

interface VotingStatus {
  stakeholderId: string;
  votes: Map<string, CandidateVote['support']>;
  comments: string;
}

export const CollaborativeMemberSelection: React.FC<CollaborativeMemberSelectionProps> = ({
  projectId,
  initiatorId,
  onComplete,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'voting' | 'results'>('setup');
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborativeSelection | null>(null);
  const [currentRound, setCurrentRound] = useState<VotingRound | null>(null);
  const [votingStatus, setVotingStatus] = useState<VotingStatus>({
    stakeholderId: initiatorId,
    votes: new Map(),
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [consensusThreshold, setConsensusThreshold] = useState(80);

  const service = new CollaborativeMemberSelectionService();

  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * 初期データ読み込み
   */
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 候補者リストを取得（部門横断）
      const criteria: SelectionCriteria = {
        projectScope: 'FACILITY' as any,
        maxTeamSize: 15
      };
      
      const facilityId = 'facility-1'; // 実際は動的に取得
      const candidateList = await service.getCrossDepartmentCandidates(facilityId, criteria);
      setCandidates(candidateList);
      
      // デフォルトステークホルダーを設定
      setStakeholders([
        initiatorId,
        'stakeholder-1',
        'stakeholder-2',
        'stakeholder-3'
      ]);
      
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 協議プロセスを開始
   */
  const startCollaboration = async () => {
    if (stakeholders.length < 2) {
      setError('協議には最低2名のステークホルダーが必要です');
      return;
    }

    setLoading(true);
    try {
      const request: CollaborationRequest = {
        projectId,
        initiatorId,
        stakeholderIds: stakeholders,
        criteria: {
          projectScope: 'FACILITY' as any,
          maxTeamSize: 15
        },
        requiredConsensusLevel: consensusThreshold,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
        notes: '施設レベルプロジェクトのメンバー選定'
      };

      const result = await service.initiateCollaborativeSelection(request);
      
      if (result.success && result.collaboration) {
        setCollaboration(result.collaboration);
        setActiveTab('voting');
      } else {
        setError(result.errors?.join(', ') || '協議開始に失敗しました');
      }
    } catch (err) {
      setError('協議開始中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 投票を送信
   */
  const submitVotes = async () => {
    if (!collaboration) return;

    const votes: CandidateVote[] = Array.from(votingStatus.votes.entries()).map(([candidateId, support]) => ({
      candidateId,
      support,
      reason: `${support}の理由` // 実際は個別入力
    }));

    if (votes.length === 0) {
      setError('少なくとも1名に投票してください');
      return;
    }

    setLoading(true);
    try {
      const result = await service.submitStakeholderVote(
        collaboration.id,
        votingStatus.stakeholderId,
        votes,
        votingStatus.comments
      );

      if (result.success && result.collaboration) {
        setCollaboration(result.collaboration);
        
        // 全員投票完了したら結果タブへ
        const allVoted = result.collaboration.stakeholders.every(s => s.hasVoted);
        if (allVoted) {
          setActiveTab('results');
        }
      } else {
        setError(result.errors?.join(', ') || '投票送信に失敗しました');
      }
    } catch (err) {
      setError('投票処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 候補者への投票を更新
   */
  const updateVote = (candidateId: string, support: CandidateVote['support'] | null) => {
    const newVotes = new Map(votingStatus.votes);
    if (support === null) {
      newVotes.delete(candidateId);
    } else {
      newVotes.set(candidateId, support);
    }
    setVotingStatus({ ...votingStatus, votes: newVotes });
  };

  /**
   * 職種バランスの表示
   */
  const renderProfessionBalance = (balance: ProfessionBalance) => {
    const groups = [
      { key: 'medicalStaff', label: '医療職', color: 'bg-red-500' },
      { key: 'nursingStaff', label: '看護職', color: 'bg-blue-500' },
      { key: 'careStaff', label: '介護職', color: 'bg-green-500' },
      { key: 'rehabilitationStaff', label: 'リハビリ職', color: 'bg-yellow-500' },
      { key: 'administrativeStaff', label: '事務職', color: 'bg-purple-500' },
      { key: 'technicalStaff', label: '技術職', color: 'bg-pink-500' }
    ];

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">職種バランス</h4>
          <span className="text-sm text-gray-600">スコア: {balance.balanceScore}/100</span>
        </div>
        {groups.map(group => {
          const data = balance[group.key as keyof ProfessionBalance] as any;
          if (!data || typeof data !== 'object') return null;
          
          return (
            <div key={group.key} className="flex items-center gap-2">
              <span className="text-xs w-20">{group.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={`${group.color || 'bg-gray-500'} h-4 rounded-full`}
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
              <span className="text-xs w-12 text-right">{data.count}名</span>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * セットアップタブ
   */
  const renderSetupTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">協議参加者の選択</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            施設レベルプロジェクトのため、各部門の責任者を含めた協議が必要です
          </p>
          <div className="space-y-2">
            {['施設管理者 (Level 4)', '人事部門長 (Level 5)', '看護部長', 'リハビリ部長', '事務部長'].map((role, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={index < stakeholders.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStakeholders([...stakeholders, `stakeholder-${index}`]);
                    } else {
                      setStakeholders(stakeholders.filter((_, i) => i !== index));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">合意形成基準</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm">必要な合意レベル:</label>
          <input
            type="range"
            min="60"
            max="100"
            step="10"
            value={consensusThreshold}
            onChange={(e) => setConsensusThreshold(Number(e.target.value))}
            className="flex-1"
          />
          <span className="font-medium">{consensusThreshold}%</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          通常は80%以上を推奨。緊急案件の場合は60%まで下げることができます
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          キャンセル
        </button>
        <button
          onClick={startCollaboration}
          disabled={loading || stakeholders.length < 2}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
        >
          協議を開始
        </button>
      </div>
    </div>
  );

  /**
   * 投票タブ
   */
  const renderVotingTab = () => {
    if (!collaboration) return null;

    const currentStakeholder = collaboration.stakeholders.find(
      s => s.userId === votingStatus.stakeholderId
    );
    const hasVoted = currentStakeholder?.hasVoted || false;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">投票状況</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              参加者: {collaboration.stakeholders.filter(s => s.hasVoted).length} / {collaboration.stakeholders.length}
            </div>
            <div>
              ラウンド: {collaboration.votingRounds.length + 1} / 3
            </div>
          </div>
        </div>

        {hasVoted ? (
          <div className="text-center py-8">
            <p className="text-green-600 text-lg">投票完了しました</p>
            <p className="text-gray-600 mt-2">他の参加者の投票を待っています...</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">候補者への投票</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {candidates.slice(0, 15).map((candidate) => {
                const currentVote = votingStatus.votes.get(candidate.user.id);
                
                return (
                  <div key={candidate.user.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{candidate.user.name}</h4>
                        <p className="text-sm text-gray-600">
                          {candidate.user.department} - {candidate.user.role}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>推奨度: {candidate.recommendationScore}%</span>
                          <span>負荷: {candidate.availability.workloadPercentage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {[
                        { value: 'STRONGLY_SUPPORT', label: '強く支持', color: 'bg-green-600' },
                        { value: 'SUPPORT', label: '支持', color: 'bg-green-400' },
                        { value: 'NEUTRAL', label: '中立', color: 'bg-gray-400' },
                        { value: 'OPPOSE', label: '反対', color: 'bg-orange-400' },
                        { value: 'STRONGLY_OPPOSE', label: '強く反対', color: 'bg-red-600' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateVote(
                            candidate.user.id,
                            currentVote === option.value ? null : option.value as CandidateVote['support']
                          )}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            currentVote === option.value
                              ? `${option.color || 'bg-gray-400'} text-white`
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">コメント（任意）</label>
              <textarea
                value={votingStatus.comments}
                onChange={(e) => setVotingStatus({ ...votingStatus, comments: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="選定に関する意見や提案があれば記入してください"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveTab('setup')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                戻る
              </button>
              <button
                onClick={submitVotes}
                disabled={loading || votingStatus.votes.size === 0}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
              >
                投票を送信
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * 結果タブ
   */
  const renderResultsTab = () => {
    if (!collaboration) return null;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">協議結果</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>合意レベル: {collaboration.consensusLevel}%</div>
            <div>状態: {collaboration.status === 'APPROVED' ? '承認済み' : '協議中'}</div>
          </div>
        </div>

        {collaboration.professionBalance && (
          <div className="bg-white p-4 border rounded-lg">
            {renderProfessionBalance(collaboration.professionBalance)}
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-4">選定メンバー</h3>
          <div className="space-y-2">
            {collaboration.selectedMembers
              .filter(m => !m.isRequired)
              .map((member, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{member.userId}</span>
                  <span className="text-sm text-gray-600">{member.role}</span>
                </div>
              ))}
          </div>
        </div>

        {collaboration.status === 'APPROVED' && (
          <div className="flex justify-end">
            <button
              onClick={() => onComplete?.(collaboration)}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md"
            >
              選定を確定
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading && !collaboration) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">協議式メンバー選定</h2>
        <p className="text-sm text-gray-600 mt-1">施設レベルプロジェクトの協議式選定プロセス</p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'setup', label: 'セットアップ' },
            { id: 'voting', label: '投票' },
            { id: 'results', label: '結果' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              disabled={
                (tab.id === 'voting' && !collaboration) ||
                (tab.id === 'results' && (!collaboration || collaboration.votingRounds.length === 0))
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'setup' && renderSetupTab()}
        {activeTab === 'voting' && renderVotingTab()}
        {activeTab === 'results' && renderResultsTab()}
      </div>
    </div>
  );
};

export default CollaborativeMemberSelection;