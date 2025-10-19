import React, { useState } from 'react';
import { Briefcase, Clock } from 'lucide-react';
import { Post, VoteOption, User } from '../types';
import UnifiedProgressBar from './UnifiedProgressBar';
import { ConsensusInsightGenerator } from '../utils/consensusInsights';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import SimpleApprovalCard from './approval/SimpleApprovalCard';
import CommitteeReviewStatus from './committee/CommitteeReviewStatus';
import { systemModeManager, SystemMode } from '../config/systemMode';
import { agendaLevelEngine } from '../systems/agenda/engines/AgendaLevelEngine';
import AgendaDeadlineManager from '../utils/agendaDeadlineManager';
import { useAgendaVote } from '../hooks/useAgendaVote';
import { AgendaVoteButtons } from './voting/AgendaVoteButtons';
import { AgendaScoreDisplay } from './voting/AgendaScoreDisplay';

interface VotingSectionProps {
  post: Post;
  currentUser?: User;
  onVote: (postId: string, option: VoteOption) => void;
  userVote?: VoteOption;
  canVote?: boolean; // 投票権限フラグ
  showTransparencyOnly?: boolean; // 透明性表示のみ
}

const VotingSection: React.FC<VotingSectionProps> = ({ 
  post, 
  currentUser,
  onVote, 
  userVote,
  canVote = true,
  showTransparencyOnly = false
}) => {
  console.log('🗳️ VotingSection rendering for post:', post.id, 'type:', post.type);
  
  // postオブジェクトからユーザーの投票状態を取得
  const currentUserVote = post.userVote || userVote;
  const hasVoted = post.hasUserVoted || !!userVote;
  
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(currentUserVote || null);
  const [isVoting, setIsVoting] = useState(false);
  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // Phase 4: 議題モード投票フック
  const currentMode = systemModeManager.getCurrentMode();
  const {
    currentVote: agendaCurrentVote,
    voteSummary,
    isVoting: isAgendaVoting,
    vote: submitAgendaVote,
    error: agendaVoteError
  } = useAgendaVote(post.id, currentUser?.id);

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
      {/* みんなの投票スコア（改善提案用） - モード対応統合表示 */}
      {post.type === 'improvement' && currentUser && (() => {
        const agendaLevel = currentMode === SystemMode.AGENDA
          ? agendaLevelEngine.getAgendaLevel(currentScore)
          : null;

        // 議題レベル設定
        const getLevelConfig = (level: string) => {
          const configs = {
            'PENDING': { emoji: '💭', label: '検討中', color: 'gray', gradient: 'from-gray-100 to-gray-200', badge: null },
            'DEPT_REVIEW': { emoji: '📋', label: '部署検討', color: 'yellow', gradient: 'from-yellow-100 to-yellow-200', badge: null },
            'DEPT_AGENDA': { emoji: '👥', label: '部署議題', color: 'blue', gradient: 'from-blue-100 to-blue-200', badge: null },
            'FACILITY_AGENDA': { emoji: '🏥', label: '施設議題', color: 'green', gradient: 'from-green-100 to-green-200', badge: '委員会提出可' },
            'CORP_REVIEW': { emoji: '🏢', label: '法人検討', color: 'purple', gradient: 'from-purple-100 to-purple-200', badge: null },
            'CORP_AGENDA': { emoji: '🏛️', label: '法人議題', color: 'pink', gradient: 'from-pink-100 to-pink-200', badge: '理事会提出' }
          };
          return configs[level as keyof typeof configs] || configs['PENDING'];
        };

        // 次のレベル情報
        const getNextLevelInfo = (score: number) => {
          if (score >= 600) return null;
          if (score >= 300) return { label: '法人議題', threshold: 600, remaining: 600 - score, progress: ((score - 300) / (600 - 300)) * 100 };
          if (score >= 100) return { label: '法人検討', threshold: 300, remaining: 300 - score, progress: ((score - 100) / (300 - 100)) * 100 };
          if (score >= 50) return { label: '施設議題', threshold: 100, remaining: 100 - score, progress: ((score - 50) / (100 - 50)) * 100 };
          if (score >= 30) return { label: '部署議題', threshold: 50, remaining: 50 - score, progress: ((score - 30) / (50 - 30)) * 100 };
          return { label: '部署検討', threshold: 30, remaining: 30 - score, progress: (score / 30) * 100 };
        };

        const levelConfig = agendaLevel ? getLevelConfig(agendaLevel) : getLevelConfig('PENDING');
        const nextLevel = getNextLevelInfo(currentScore);
        const totalVotes = Object.values(safeVotes).reduce((a, b) => a + b, 0);

        return (
          <div className="w-full bg-white border border-emerald-300 rounded-xl p-4 hover:border-emerald-400 transition-all">
            {/* ヘッダー */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg border text-emerald-700 border-emerald-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800">みんなの投票スコア</h3>
            </div>

            {/* Phase 4: 議題モードの場合は新しいスコア表示を使用 */}
            {currentMode === SystemMode.AGENDA ? (
              <AgendaScoreDisplay
                currentScore={voteSummary?.agendaScore ?? currentScore}
                agendaLevel={agendaLevel}
                totalVotes={voteSummary?.totalVotes ?? totalVotes}
                showThresholds={true}
              />
            ) : (
              /* プロジェクトモード: 既存の表示 */
              <>
                {/* 現在のレベル表示 */}
                <div className={`bg-gradient-to-r ${levelConfig.gradient} rounded-lg p-3 mb-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{levelConfig.emoji}</span>
                      <div>
                        <div className={`font-bold text-${levelConfig.color}-800`}>{levelConfig.label}</div>
                        <div className={`text-xs opacity-75 text-${levelConfig.color}-800`}>
                          {Math.round(currentScore)}点
                        </div>
                      </div>
                    </div>
                    {levelConfig.badge && (
                      <span className={`px-2 py-1 text-xs font-medium bg-white rounded-full text-${levelConfig.color}-800 border border-${levelConfig.color}-300`}>
                        {levelConfig.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* 次のレベルまでの進捗（ゲーミフィケーション） */}
                {nextLevel && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">次のレベル</span>
                      <span className="text-xs font-bold text-blue-700">
                        {nextLevel.label}まであと{Math.round(nextLevel.remaining)}点
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(nextLevel.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 投票範囲 + 支持率 */}
            {currentMode === SystemMode.AGENDA && agendaLevel && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs">
                    {agendaLevel === 'PENDING' && '投稿者の部署内'}
                    {agendaLevel === 'DEPT_REVIEW' && '部署内全員'}
                    {agendaLevel === 'DEPT_AGENDA' && '部署内全員'}
                    {agendaLevel === 'FACILITY_AGENDA' && '施設内全員投票可'}
                    {agendaLevel === 'CORP_REVIEW' && '法人内全員'}
                    {agendaLevel === 'CORP_AGENDA' && '法人内全員'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">支持率</span>
                  <span className={`text-sm font-bold text-${levelConfig.color}-800`}>
                    {consensusData.percentage}%
                  </span>
                  <span className="text-xs text-gray-500">({totalVotes}票)</span>
                </div>
              </div>
            )}

            {/* 投票期限表示（議題モード専用） */}
            {currentMode === SystemMode.AGENDA && post.agendaDeadline && (() => {
              const deadlineInfo = AgendaDeadlineManager.getDeadlineInfo(
                post.agendaDeadline,
                post.agendaDeadlineExtensions || 0
              );
              const deadlineMessage = AgendaDeadlineManager.getDeadlineMessage(deadlineInfo);
              const committeeDescription = AgendaDeadlineManager.getCommitteeDeadlineDescription(post.committeeStatus);

              return (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {deadlineInfo.isExpired
                          ? '投票期限: 終了'
                          : `投票期限: ${AgendaDeadlineManager.formatDeadline(post.agendaDeadline)}`
                        }
                      </span>
                      {deadlineInfo.extensionCount && deadlineInfo.extensionCount > 0 && (
                        <span className="text-orange-600 ml-1">
                          (延長{deadlineInfo.extensionCount}回)
                        </span>
                      )}
                    </div>
                    {deadlineMessage && (
                      <span className={`font-medium ${
                        deadlineMessage.severity === 'error' ? 'text-red-600' :
                        deadlineMessage.severity === 'warning' ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {deadlineMessage.message}
                      </span>
                    )}
                  </div>
                  {deadlineInfo.isExpired && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 border border-red-200">
                      ⏰ 投票期限が終了しました。責任者が判断を行います。
                    </div>
                  )}
                  {committeeDescription && !deadlineInfo.isExpired && (
                    <div className="text-xs text-gray-500 mt-1">
                      💡 {committeeDescription}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* プロジェクトモードの場合は従来のバッジ表示 */}
            {currentMode === SystemMode.PROJECT && (
              <div className="text-sm text-gray-600 text-center">
                プロジェクトレベル: {Math.round(currentScore)}点
              </div>
            )}
          </div>
        );
      })()}

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
        
        {/* 承認プロセス/委員会審議状況（モード別表示） */}
        {(() => {
          const currentMode = systemModeManager.getCurrentMode();
          const agendaLevel = currentMode === SystemMode.AGENDA && post.type === 'improvement'
            ? agendaLevelEngine.getAgendaLevel(currentScore)
            : null;

          // 議題モード：施設議題レベル以上の場合、委員会審議状況を表示
          if (currentMode === SystemMode.AGENDA && agendaLevel &&
              (agendaLevel === 'FACILITY_AGENDA' || agendaLevel === 'CORP_REVIEW' || agendaLevel === 'CORP_AGENDA')) {
            return (
              <CommitteeReviewStatus
                status={post.committeeStatus || 'pending'}
                committeeInfo={post.committeeInfo}
                committeeDecision={post.committeeDecision}
              />
            );
          }

          // プロジェクトモード：高優先度または承認フロー設定済みの場合、承認カードを表示
          if (currentMode === SystemMode.PROJECT && (post.priority === 'high' || post.approvalFlow)) {
            const mockApprovalRequest = {
              id: `approval-${post.id}`,
              projectId: post.id,
              requesterId: post.author.id,
              budgetAmount: 1500000,
              reason: post.content,
              status: post.approvalFlow?.status === 'approved' ? 'approved' as const : 'pending' as const,
              approvalChain: [
                {
                  approverId: 'manager-001',
                  level: 3 as any,
                  role: '師長',
                  department: '看護部',
                  status: post.approvalFlow?.status === 'approved' ? 'approved' as const : 'pending' as const
                },
                {
                  approverId: 'head-001',
                  level: 4 as any,
                  role: '部長',
                  department: '管理部',
                  status: 'pending' as const
                }
              ],
              currentApproverId: 'manager-001',
              createdAt: new Date(),
              deadline: approvalData.deadline
            };

            return (
              <SimpleApprovalCard
                request={mockApprovalRequest}
                onApprove={(requestId, reason) => {
                  console.log('承認:', requestId, reason);
                }}
                onReject={(requestId, reason) => {
                  console.log('差し戻し:', requestId, reason);
                }}
                isActionable={currentUser?.permissionLevel ? currentUser.permissionLevel >= 3 : false}
              />
            );
          }

          return null;
        })()}
        
        {/* プロジェクト進捗（改善提案以外で表示） */}
        {(post.type !== 'improvement' && (post.projectStatus === 'active' || post.enhancedProjectStatus)) && (
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
      
      {/* 投票エリア - 権限に応じて表示制御 + モード別UI */}
      {(canVote && !showTransparencyOnly) ? (
        <div className="bg-white border border-emerald-300 rounded-xl p-6">
          {/* 議題モード: Phase 4の新しい投票UI */}
          {currentMode === SystemMode.AGENDA && post.type === 'improvement' ? (
            <>
              <AgendaVoteButtons
                postId={post.id}
                currentVote={agendaCurrentVote}
                onVote={submitAgendaVote}
                isVoting={isAgendaVoting}
                disabled={!canVote || showTransparencyOnly}
              />
              {agendaVoteError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  ❌ {agendaVoteError}
                </div>
              )}
            </>
          ) : (
            /* プロジェクトモード: 既存の絵文字投票UI */
            <>
              <h3 className="text-emerald-700 font-medium mb-4 flex items-center gap-2">
                🗳️ 投票
              </h3>

              {/* 洗練された投票ボタン */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
                {voteOptions.map((vote) => (
                  <button
                    key={vote.type}
                    onClick={() => setSelectedVote(vote.type)}
                    disabled={hasVoted}
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
                        : currentUserVote === vote.type
                        ? ((vote.color || 'blue') === 'red' ? 'from-red-400 to-red-500 shadow-md' :
                          vote.color === 'orange' ? 'from-orange-400 to-orange-500 shadow-md' :
                          vote.color === 'gray' ? 'from-gray-400 to-gray-500 shadow-md' :
                          vote.color === 'green' ? 'from-green-400 to-green-500 shadow-md' :
                          'from-blue-400 to-blue-500 shadow-md')
                        : 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:scale-105 hover:-translate-y-0.5'
                      }
                      ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}
                      border border-white/20
                    `}
                  >
                    {/* 背景エフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* コンテンツ */}
                    <span className={`text-2xl sm:text-3xl mb-2 transform transition-transform group-hover:scale-110 ${
                      selectedVote === vote.type || currentUserVote === vote.type ? 'text-white drop-shadow-lg' : 'text-gray-700'
                    }`}>
                      {vote.emoji}
                    </span>
                    <span className={`text-xs font-medium text-center leading-tight ${
                      selectedVote === vote.type || currentUserVote === vote.type ? 'text-white' : 'text-gray-700'
                    }`}>
                      {vote.label}
                    </span>

                    {/* 投票済みバッジ */}
                    {currentUserVote === vote.type && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* 選択インジケーター */}
                    {selectedVote === vote.type && !hasVoted && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50" />
                    )}
                  </button>
                ))}
              </div>


              {/* アクションボタン */}
              <div className="flex">
                <button
                  onClick={handleVote}
                  disabled={!selectedVote || hasVoted || isVoting}
                  className={`
                    relative w-full px-6 py-4 rounded-xl font-bold text-white
                    transition-all duration-300 transform overflow-hidden group
                    ${!selectedVote || hasVoted || isVoting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                >
                  {/* 背景アニメーション */}
                  {!(!selectedVote || hasVoted || isVoting) && (
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
                    ) : hasVoted ? (
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
            </>
          )}
        </div>
      ) : (
        /* 投票権限なし - 透明性表示のみ */
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-6">
          <h3 className="text-gray-600 font-medium mb-4 flex items-center gap-2">
            🗳️ 投票
          </h3>
          <div className="text-center py-2 text-gray-500 bg-gray-100 rounded-lg border border-gray-200 mb-4">
            <div className="text-sm mb-1">
              <span className="text-orange-500">ℹ️</span> 投票権限なし（{(() => {
                const postAuthorFacility = post.author.facility_id;
                const currentUserFacility = currentUser?.facility_id;
                const postAuthorDepartment = post.author.department;
                const currentUserDepartment = currentUser?.department;
                
                // 施設が異なる場合
                if (postAuthorFacility !== currentUserFacility) {
                  return '他施設の投稿';
                }
                // 同じ施設だが部署が異なる場合
                else if (postAuthorDepartment !== currentUserDepartment) {
                  return '他部署の投稿';
                }
                // その他の理由
                else {
                  return '権限制限';
                }
              })()}）
            </div>
            <div className="text-xs text-blue-600">
              ※プロジェクト昇格時に権限付与の可能性あり
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingSection;