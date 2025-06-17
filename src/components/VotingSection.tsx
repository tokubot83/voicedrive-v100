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

  // 投票データのnullチェック
  const safeVotes = post.votes || {
    'strongly-oppose': 0,
    'oppose': 0,
    'neutral': 0,
    'support': 0,
    'strongly-support': 0
  };

  // 合意形成データの計算
  const consensusData = ConsensusInsightGenerator.calculateSimpleConsensus(safeVotes);
  const insights = ConsensusInsightGenerator.generateInsights(safeVotes);
  const details = ConsensusInsightGenerator.getConsensusDetails(safeVotes);

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
    ? calculateScore(convertVotesToEngagements(safeVotes), post.proposalType)
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
    if (!selectedVote || typeof onVote !== 'function') return;
    
    setIsVoting(true);
    try {
      await onVote(post.id, selectedVote);
    } catch (error) {
      console.error('Vote error:', error);
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
      {/* 改善提案用スコア表示パネル */}
      {post.type === 'improvement' && (
        <div className="bg-white border border-emerald-300 rounded-xl p-4 mb-4 hover:border-emerald-400 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border border-emerald-300 text-emerald-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800">プロジェクトスコア</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600 capitalize">active</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-800">{Math.round(currentScore)}</div>
              <div className="text-sm text-gray-600">点</div>
            </div>
          </div>
          
          {/* レベル表示 */}
          <div className="mt-4 mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {currentScore >= 600 ? '🏢 法人レベル' :
               currentScore >= 300 ? '🏥 施設レベル' :
               currentScore >= 100 ? '🏢 部署レベル' :
               currentScore >= 50 ? '👥 チームレベル' : '💭 議論段階'}
            </span>
            {currentScore < 600 && (
              <span className="text-sm text-gray-500">
                次の目標まで{currentScore >= 300 ? 600 - currentScore :
                           currentScore >= 100 ? 300 - currentScore :
                           currentScore >= 50 ? 100 - currentScore : 50 - currentScore}点
              </span>
            )}
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (currentScore / (
                  currentScore >= 300 ? 600 :
                  currentScore >= 100 ? 300 :
                  currentScore >= 50 ? 100 : 50
                )) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* 統一ステータス表示（縦積みレイアウト） */}
      <div className="space-y-4">
        {/* みんなの納得率（常に表示） */}
        <UnifiedProgressBar
          type="consensus"
          title="みんなの納得率"
          percentage={consensusData.percentage}
          status="active"
          quickInsights={insights}
          details={details}
          detailsData={{ ...consensusData, votes: safeVotes }}
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
      <div className="bg-white border border-emerald-300 rounded-xl p-6">
        <h3 className="text-emerald-700 font-medium mb-4 flex items-center gap-2">
          💬 あなたの意見をお聞かせください
        </h3>
        
        {/* 洗練された投票ボタン */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
          {voteOptions.map((vote, index) => (
            <button
              key={vote.type}
              onClick={() => setSelectedVote(vote.type)}
              disabled={userVote !== undefined}
              className={`
                relative group overflow-hidden
                flex flex-col items-center p-3 sm:p-4 rounded-xl
                bg-gradient-to-b transition-all duration-300 transform
                ${selectedVote === vote.type 
                  ? ((vote.color || 'blue') === 'red' ? 'from-red-500 to-red-600 shadow-lg shadow-red-500/30 scale-105 -translate-y-1' :
                    vote.color === 'orange' ? 'from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 scale-105 -translate-y-1' :
                    vote.color === 'gray' ? 'from-gray-500 to-gray-600 shadow-lg shadow-gray-500/30 scale-105 -translate-y-1' :
                    vote.color === 'green' ? 'from-green-500 to-green-600 shadow-lg shadow-green-500/30 scale-105 -translate-y-1' :
                    'from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-105 -translate-y-1')
                  : userVote === vote.type
                  ? ((vote.color || 'blue') === 'red' ? 'from-red-400 to-red-500 shadow-md' :
                    vote.color === 'orange' ? 'from-orange-400 to-orange-500 shadow-md' :
                    vote.color === 'gray' ? 'from-gray-400 to-gray-500 shadow-md' :
                    vote.color === 'green' ? 'from-green-400 to-green-500 shadow-md' :
                    'from-blue-400 to-blue-500 shadow-md')
                  : 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:scale-105 hover:-translate-y-0.5'
                }
                ${userVote !== undefined ? 'cursor-not-allowed' : 'cursor-pointer'}
                border border-white/20
              `}
            >
              {/* 背景エフェクト */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* コンテンツ */}
              <span className={`text-2xl sm:text-3xl mb-2 transform transition-transform group-hover:scale-110 ${
                selectedVote === vote.type || userVote === vote.type ? 'text-white drop-shadow-lg' : 'text-gray-700'
              }`}>
                {vote.emoji}
              </span>
              <span className={`text-xs font-medium text-center leading-tight ${
                selectedVote === vote.type || userVote === vote.type ? 'text-white' : 'text-gray-700'
              }`}>
                {vote.label}
              </span>
              
              {/* 投票済みバッジ */}
              {userVote === vote.type && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* 選択インジケーター */}
              {selectedVote === vote.type && userVote === undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50" />
              )}
            </button>
          ))}
        </div>
        
        {/* 現在の投票分布 */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>現在の投票分布</span>
            <span>計 {Object.values(safeVotes).reduce((sum, count) => sum + count, 0)} 票</span>
          </div>
          <div className="flex h-6 rounded-full overflow-hidden bg-gray-200 shadow-inner">
            {voteOptions.map(vote => {
              const totalVotes = Object.values(safeVotes).reduce((sum, count) => sum + count, 0);
              const percentage = totalVotes > 0
                ? (safeVotes[vote.type] / totalVotes) * 100
                : 0;
              
              if (percentage === 0) return null;
              
              return (
                <div
                  key={vote.type}
                  className={`h-full transition-all duration-500 relative group ${
                    ((vote.color || 'blue') === 'red' ? 'bg-red-500' :
                    vote.color === 'orange' ? 'bg-orange-500' :
                    vote.color === 'gray' ? 'bg-gray-500' :
                    vote.color === 'green' ? 'bg-green-500' :
                    'bg-blue-500')
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  {/* ホバー時のツールチップ */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {vote.emoji} {vote.label}: {safeVotes[vote.type]}票 ({Math.round(percentage)}%)
                  </div>
                </div>
              );
            })}
          </div>
          {/* 色の凡例 */}
          <div className="flex justify-center gap-4 text-xs text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>強く賛成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>賛成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span>反対</span>
            </div>
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex">
          <button
            onClick={handleVote}
            disabled={!selectedVote || userVote !== undefined || isVoting}
            className={`
              relative w-full px-6 py-4 rounded-xl font-bold text-white
              transition-all duration-300 transform overflow-hidden group
              ${!selectedVote || userVote !== undefined || isVoting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {/* 背景アニメーション */}
            {!(!selectedVote || userVote !== undefined || isVoting) && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
            
            {/* ボタンテキスト */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isVoting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  投票中...
                </>
              ) : userVote ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  投票済み
                </>
              ) : (
                <>
                  投票する
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingSection;