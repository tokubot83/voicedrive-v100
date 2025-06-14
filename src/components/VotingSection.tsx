import React, { useState } from 'react';
import { Post, VoteOption, User } from '../types';
import UnifiedProgressBar from './UnifiedProgressBar';
import { ConsensusInsightGenerator } from '../utils/consensusInsights';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';

interface VotingSectionProps {
  post: Post;
  currentUser?: User;
  onVote: (postId: string, option: VoteOption) => void;
  userVote?: VoteOption;
}

const VotingSection: React.FC<VotingSectionProps> = ({ 
  post, 
  currentUser,
  onVote, 
  userVote 
}) => {
  console.log('🗳️ VotingSection rendering for post:', post.id, 'type:', post.type);
  
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(userVote || null);
  const [isVoting, setIsVoting] = useState(false);
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // 合意形成データの計算
  const consensusData = ConsensusInsightGenerator.calculateSimpleConsensus(post.votes);
  const insights = ConsensusInsightGenerator.generateInsights(post.votes);
  const details = ConsensusInsightGenerator.getConsensusDetails(post.votes);

  // 承認プロセスデータ（デモ用）
  const approvalData = {
    currentLevel: 3,
    requiredLevel: 4,
    approvers: ['施設長', '経営企画部'],
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48時間後
    status: 'pending' as const
  };

  // スコア計算（改善提案の場合）
  const currentScore = post.type === 'improvement' 
    ? calculateScore(convertVotesToEngagements(post.votes), post.proposalType)
    : 0;
  
  console.log('📊 VotingSection calculated score:', currentScore, 'for post:', post.id);

  // プロジェクトデータ（デモ用）
  const projectData = {
    progress: 67,
    budget: { used: 450000, total: 800000 },
    timeline: { current: 3, total: 6 }, // 月
    team: 12,
    nextMilestone: '第2フェーズ完了'
  };

  const handleVote = async () => {
    if (!selectedVote) return;
    
    setIsVoting(true);
    try {
      await onVote(post.id, selectedVote);
    } finally {
      setIsVoting(false);
    }
  };

  const voteOptions = [
    { type: 'strongly-oppose' as VoteOption, emoji: '😠', label: '強く反対', color: 'red' },
    { type: 'oppose' as VoteOption, emoji: '😕', label: '反対', color: 'orange' },
    { type: 'neutral' as VoteOption, emoji: '😐', label: '中立', color: 'gray' },
    { type: 'support' as VoteOption, emoji: '😊', label: '賛成', color: 'green' },
    { type: 'strongly-support' as VoteOption, emoji: '😍', label: '強く賛成', color: 'blue' }
  ];

  return (
    <div className="space-y-6">
      {/* 統一ステータス表示（縦積みレイアウト） */}
      <div className="space-y-4">
        {/* 合意形成（常に表示） */}
        <UnifiedProgressBar
          type="consensus"
          title="合意形成状況"
          percentage={consensusData.percentage}
          status="active"
          quickInsights={insights}
          details={details}
          detailsData={consensusData}
          description={`${consensusData.level} (${consensusData.percentage}%)`}
        />
        
        {/* 承認プロセス（条件付き） */}
        {(post.priority === 'high' || post.approvalFlow) && (
          <UnifiedProgressBar
            type="approval"
            title="承認プロセス"
            percentage={post.approvalFlow ? 
              (post.approvalFlow.history.filter(h => h.status === 'approved').length / post.approvalFlow.history.length) * 100 :
              30
            }
            status={post.approvalFlow?.status === 'approved' ? 'completed' : 
                   post.approvalFlow?.status === 'in_progress' ? 'pending' : 
                   'pending'
            }
            quickInsights={post.approvalFlow ? [
              post.approvalFlow.status === 'approved' ? '✅ 承認完了' : '📋 承認進行中',
              `${post.approvalFlow.currentLevel} レベル`,
              post.approvalFlow.status === 'approved' ? '全ての承認を取得' : '承認待ち'
            ] : [
              '📋 施設長確認中',
              `⏰ 残り${Math.floor((approvalData.deadline.getTime() - Date.now()) / (1000 * 60 * 60))}時間`,
              'LEVEL_4承認待ち'
            ]}
            details={post.approvalFlow ? [
              { label: '現在レベル', value: post.approvalFlow.currentLevel },
              { label: 'ステータス', value: post.approvalFlow.status === 'approved' ? '承認済み' : '進行中' },
              { label: '承認履歴', value: `${post.approvalFlow.history.filter(h => h.status === 'approved').length}/${post.approvalFlow.history.length}` }
            ] : [
              { label: '現在レベル', value: `LEVEL_${approvalData.currentLevel}` },
              { label: '必要レベル', value: `LEVEL_${approvalData.requiredLevel}` },
              { label: '承認者', value: approvalData.approvers.join(', ') },
              { label: '期限', value: approvalData.deadline.toLocaleDateString('ja-JP') }
            ]}
            detailsData={{ post, ...(post.approvalFlow || approvalData) }}
            description={post.approvalFlow ? 
              (post.approvalFlow.status === 'approved' ? '承認プロセス完了' : '承認プロセス進行中') :
              "高優先度案件のため承認が必要です"
            }
          />
        )}
        
        {/* プロジェクト進捗（改善提案の場合は常に表示） */}
        {(post.type === 'improvement' || post.projectStatus === 'active' || post.enhancedProjectStatus) && (
          <UnifiedProgressBar
            type="project"
            title="プロジェクト進捗"
            percentage={post.enhancedProjectStatus ? post.enhancedProjectStatus.resources.completion : projectData.progress}
            status="active"
            quickInsights={post.enhancedProjectStatus ? [
              `🏢 ${post.enhancedProjectStatus.level === 'DEPARTMENT' ? '部署内' : post.enhancedProjectStatus.level === 'FACILITY' ? '施設内' : '法人'}プロジェクト`,
              `💰 予算${Math.round((post.enhancedProjectStatus.resources.budget_used / post.enhancedProjectStatus.resources.budget_total) * 100)}%使用`,
              `👥 ${post.enhancedProjectStatus.resources.team_size}名参加`,
              `⏱️ ${post.enhancedProjectStatus.timeline}`
            ] : post.type === 'improvement' ? [
              `🎯 現在スコア: ${Math.round(currentScore)}点`,
              currentScore >= 600 ? '🏢 法人レベル到達' :
              currentScore >= 300 ? '🏥 施設レベル到達' :
              currentScore >= 100 ? '🏢 部署レベル到達' :
              currentScore >= 50 ? '👥 チームレベル到達' : '💭 議論段階',
              `📊 次の目標まで${currentScore >= 600 ? '完了' : 
                currentScore >= 300 ? Math.round(600 - currentScore) + '点' :
                currentScore >= 100 ? Math.round(300 - currentScore) + '点' :
                currentScore >= 50 ? Math.round(100 - currentScore) + '点' : Math.round(50 - currentScore) + '点'}`
            ] : [
              '📅 予定通り',
              `💰 予算${Math.round((projectData.budget.used / projectData.budget.total) * 100)}%使用`,
              `👥 ${projectData.team}名参加`
            ]}
            details={post.enhancedProjectStatus ? [
              { label: '進捗率', value: `${post.enhancedProjectStatus.resources.completion}%`, trend: 'up' },
              { label: '予算執行', value: `${(post.enhancedProjectStatus.resources.budget_used / 10000).toFixed(0)}万円`, trend: 'stable' },
              { label: 'チーム規模', value: `${post.enhancedProjectStatus.resources.team_size}名` },
              { label: '期間', value: post.enhancedProjectStatus.timeline }
            ] : [
              { label: '進捗率', value: `${projectData.progress}%`, trend: 'up' },
              { label: '予算執行', value: `¥${projectData.budget.used.toLocaleString()}`, trend: 'stable' },
              { label: '経過期間', value: `${projectData.timeline.current}/${projectData.timeline.total}ヶ月` },
              { label: '次の節目', value: projectData.nextMilestone }
            ]}
            detailsData={post.enhancedProjectStatus ? {
              projectStatus: post.enhancedProjectStatus,
              approvalFlow: post.approvalFlow,
              tags: post.tags
            } : projectData}
            description={post.enhancedProjectStatus ? 
              `${post.enhancedProjectStatus.level === 'DEPARTMENT' ? '部署内' : post.enhancedProjectStatus.level === 'FACILITY' ? '施設内' : '法人'}プロジェクトとして進行中` : 
              "順調に進行中"
            }
          />
        )}
      </div>
      
      {/* 投票エリア */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          💬 あなたの意見をお聞かせください
        </h3>
        
        {/* 感情的でわかりやすい投票ボタン */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-4">
          {voteOptions.map(vote => (
            <button
              key={vote.type}
              onClick={() => setSelectedVote(vote.type)}
              disabled={userVote !== undefined}
              className={`
                flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all
                ${selectedVote === vote.type 
                  ? vote.color === 'red' ? 'border-red-500 bg-red-500/20' :
                    vote.color === 'orange' ? 'border-orange-500 bg-orange-500/20' :
                    vote.color === 'gray' ? 'border-gray-500 bg-gray-500/20' :
                    vote.color === 'green' ? 'border-green-500 bg-green-500/20' :
                    'border-blue-500 bg-blue-500/20'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }
                ${userVote !== undefined ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <span className="text-xl sm:text-2xl mb-1">{vote.emoji}</span>
              <span className="text-xs text-gray-300 text-center leading-tight">{vote.label}</span>
              {userVote === vote.type && (
                <span className="text-xs text-blue-400 mt-1">投票済み</span>
              )}
            </button>
          ))}
        </div>
        
        {/* 現在の投票分布 */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>現在の投票分布</span>
            <span>計 {Object.values(post.votes).reduce((sum, count) => sum + count, 0)} 票</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-gray-800">
            {voteOptions.map(vote => {
              const percentage = Object.values(post.votes).reduce((sum, count) => sum + count, 0) > 0
                ? (post.votes[vote.type] / Object.values(post.votes).reduce((sum, count) => sum + count, 0)) * 100
                : 0;
              
              if (percentage === 0) return null;
              
              return (
                <div
                  key={vote.type}
                  className={`h-full transition-all duration-500 ${
                    vote.color === 'red' ? 'bg-red-500' :
                    vote.color === 'orange' ? 'bg-orange-500' :
                    vote.color === 'gray' ? 'bg-gray-500' :
                    vote.color === 'green' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                  title={`${vote.label}: ${post.votes[vote.type]}票 (${Math.round(percentage)}%)`}
                />
              );
            })}
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex">
          <button
            onClick={handleVote}
            disabled={!selectedVote || userVote !== undefined || isVoting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isVoting ? '投票中...' : userVote ? '投票済み' : '投票する'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingSection;