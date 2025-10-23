/**
 * 投稿分析カード
 * 管理職が投稿の客観的データを視覚的に確認できるUI
 */

import React, { useState } from 'react';
import { Post, User } from '../../types';
import { AgendaLevel } from '../../types/committee';
import { VoteAnalysis, CommentAnalysis } from '../../types/proposalDocument';
import { BarChart3, MessageSquare, Users, Calendar, Star, Send, Clock, ThumbsUp, ThumbsDown, Pause, FileText, AlertCircle, ArrowUp } from 'lucide-react';
import { analyzeVotes, analyzeComments } from '../../utils/proposalAnalyzer';
import { proposalPermissionService } from '../../services/ProposalPermissionService';
import AgendaDeadlineManager from '../../utils/agendaDeadlineManager';
import { AgendaResponsibilityService, ResponsibilityAction } from '../../systems/agenda/services/AgendaResponsibilityService';

// タイムラインイベント型
interface TimelineEvent {
  id: string;
  type: 'created' | 'level_up' | 'vote_milestone' | 'comment' | 'deadline' | 'action';
  timestamp: Date;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ProposalAnalysisCardProps {
  post: Post;
  agendaLevel: AgendaLevel;
  currentScore: number;
  canEdit: boolean;  // 編集権限があるか
  currentUser?: User;  // 現在のユーザー
  onCreateDocument?: () => void;
  onMarkAsCandidate?: () => void;
  isMarkedAsCandidate?: boolean;
  // 責任者判断アクション
  onApprovalLevelUp?: () => void;
  onReject?: (feedback: string) => void;
  onHold?: (feedback: string) => void;
  onDepartmentMatter?: (feedback: string) => void;
}

export const ProposalAnalysisCard: React.FC<ProposalAnalysisCardProps> = ({
  post,
  agendaLevel,
  currentScore,
  canEdit,
  currentUser,
  onCreateDocument,
  onMarkAsCandidate,
  isMarkedAsCandidate = false,
  onApprovalLevelUp,
  onReject,
  onHold,
  onDepartmentMatter
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState<ResponsibilityAction | null>(null);
  const [actionFeedback, setActionFeedback] = useState('');

  const voteAnalysis = analyzeVotes(post);
  const commentAnalysis = analyzeComments(post);

  // 議題レベルの責任情報を取得
  const responsibility = proposalPermissionService.getResponsibility(agendaLevel);
  const targetCommittee = responsibility?.targetCommittee;

  // 期限情報を取得
  const deadlineInfo = post.agendaDeadline
    ? AgendaDeadlineManager.getDeadlineInfo(
        post.agendaDeadline,
        post.agendaDeadlineExtensions || 0
      )
    : null;
  const deadlineMessage = deadlineInfo
    ? AgendaDeadlineManager.getDeadlineMessage(deadlineInfo)
    : null;
  const deadlineStatusMessage = AgendaResponsibilityService.getDeadlineStatusMessage(post);

  // 責任者アクションの実行可否を確認
  const responsibilityPermissions = currentUser
    ? {
        approveLevelUp: AgendaResponsibilityService.canPerformAction(post, 'approve_levelup', currentUser.permissionLevel),
        reject: AgendaResponsibilityService.canPerformAction(post, 'reject', currentUser.permissionLevel),
        hold: AgendaResponsibilityService.canPerformAction(post, 'hold', currentUser.permissionLevel),
        departmentMatter: AgendaResponsibilityService.canPerformAction(post, 'department_matter', currentUser.permissionLevel)
      }
    : null;

  // 議題レベルのラベルと色
  const levelConfig = {
    PENDING: { label: '投票中', color: 'text-gray-400', bg: 'bg-gray-800/30' },
    DEPT_REVIEW: { label: '部署レビュー', color: 'text-blue-400', bg: 'bg-blue-900/30' },
    DEPT_AGENDA: { label: '部署議題', color: 'text-blue-500', bg: 'bg-blue-900/50' },
    FACILITY_AGENDA: { label: '施設議題', color: 'text-purple-400', bg: 'bg-purple-900/50' },
    CORP_REVIEW: { label: '法人レビュー', color: 'text-orange-400', bg: 'bg-orange-900/50' },
    CORP_AGENDA: { label: '法人議題', color: 'text-red-400', bg: 'bg-red-900/50' }
  };

  const config = levelConfig[agendaLevel] || levelConfig.PENDING;

  // タイムラインイベントを生成
  const generateTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. 投稿作成
    events.push({
      id: 'created',
      type: 'created',
      timestamp: post.timestamp,
      title: '投稿作成',
      description: `${post.author.name}が提案を投稿`,
      icon: <FileText className="w-4 h-4" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500'
    });

    // 2. レベル昇格イベント（スコアから推測）
    const levelThresholds = [
      { level: 'DEPT_REVIEW' as AgendaLevel, threshold: 30, label: '部署検討' },
      { level: 'DEPT_AGENDA' as AgendaLevel, threshold: 50, label: '部署議題' },
      { level: 'FACILITY_AGENDA' as AgendaLevel, threshold: 100, label: '施設議題' },
      { level: 'CORP_REVIEW' as AgendaLevel, threshold: 300, label: '法人検討' },
      { level: 'CORP_AGENDA' as AgendaLevel, threshold: 600, label: '法人議題' }
    ];

    levelThresholds.forEach((lvl, index) => {
      if (currentScore >= lvl.threshold) {
        // レベル到達の推定日時（投稿からの経過日数で推測）
        const daysAfterCreation = index + 2; // 2日、3日、4日...と仮定
        const estimatedDate = new Date(post.timestamp);
        estimatedDate.setDate(estimatedDate.getDate() + daysAfterCreation);

        events.push({
          id: `levelup-${lvl.level}`,
          type: 'level_up',
          timestamp: estimatedDate,
          title: `${lvl.label}に到達`,
          description: `スコア${lvl.threshold}点を達成`,
          icon: <ArrowUp className="w-4 h-4" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500'
        });
      }
    });

    // 3. 投票マイルストーン
    const totalVotes = Object.values(post.votes || {}).reduce((sum, count) => sum + count, 0);
    if (totalVotes >= 10) {
      const voteDate = post.lastActivityDate || new Date();
      events.push({
        id: 'votes-10',
        type: 'vote_milestone',
        timestamp: voteDate,
        title: `${totalVotes}票獲得`,
        description: `支持率${voteAnalysis.supportRate}%`,
        icon: <ThumbsUp className="w-4 h-4" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500'
      });
    }

    // 4. コメント追加
    if (commentAnalysis.totalComments > 0) {
      events.push({
        id: 'comments',
        type: 'comment',
        timestamp: post.lastActivityDate || new Date(),
        title: `${commentAnalysis.totalComments}件のコメント`,
        description: `賛成${commentAnalysis.supportComments}、懸念${commentAnalysis.concernComments}`,
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500'
      });
    }

    // 5. 期限イベント
    if (post.agendaDeadline && deadlineInfo) {
      if (deadlineInfo.isExpired) {
        events.push({
          id: 'deadline-expired',
          type: 'deadline',
          timestamp: post.agendaDeadline,
          title: '投票期限終了',
          description: '責任者の判断待ち',
          icon: <Clock className="w-4 h-4" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500'
        });
      }
    }

    // タイムスタンプでソート（古い順）
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const timelineEvents = generateTimeline();

  // 次のアクションを決定
  const getNextAction = (): { title: string; description: string; type: 'info' | 'warning' | 'success' } | null => {
    if (!deadlineInfo) return null;

    if (deadlineInfo.isExpired) {
      // 期限切れ：責任者の判断待ち
      if (responsibilityPermissions && canEdit) {
        const availableActions = [
          responsibilityPermissions.reject.allowed && '却下',
          responsibilityPermissions.hold.allowed && '保留',
          responsibilityPermissions.departmentMatter.allowed && '部署案件化',
          responsibilityPermissions.approveLevelUp.allowed && 'レベルアップ承認'
        ].filter(Boolean);

        return {
          title: '🎯 あなたの判断が必要です',
          description: `実行可能なアクション: ${availableActions.join('、')}`,
          type: 'warning'
        };
      } else {
        return {
          title: '⏰ 投票期限終了',
          description: '責任者の判断を待っています',
          type: 'info'
        };
      }
    } else if (deadlineInfo.isNearExpiration) {
      // 期限が近い：投票を呼びかけ
      return {
        title: '⚠️ 投票期限が近づいています',
        description: `残り${deadlineInfo.remainingDays}日 - より多くの投票を集めましょう`,
        type: 'warning'
      };
    } else {
      // 通常：投票継続中
      const nextThreshold = getNextLevelThreshold();
      if (nextThreshold) {
        return {
          title: '✅ 投票継続中',
          description: `次のレベル「${nextThreshold.label}」まであと${nextThreshold.remaining}点`,
          type: 'success'
        };
      }
    }

    return null;
  };

  const getNextLevelThreshold = (): { label: string; remaining: number } | null => {
    if (currentScore >= 600) return null;
    if (currentScore >= 300) return { label: '法人議題', remaining: 600 - currentScore };
    if (currentScore >= 100) return { label: '法人検討', remaining: 300 - currentScore };
    if (currentScore >= 50) return { label: '施設議題', remaining: 100 - currentScore };
    if (currentScore >= 30) return { label: '部署議題', remaining: 50 - currentScore };
    return { label: '部署検討', remaining: 30 - currentScore };
  };

  const nextAction = getNextAction();

  // タイムスタンプのフォーマット
  const formatTimestamp = (timestamp: Date | string) => {
    // Date オブジェクトに変換
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // 無効な日付の場合はデフォルト表示
    if (isNaN(date.getTime())) {
      return '日時不明';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              <span className="text-xs text-gray-500">スコア: {currentScore}</span>
              {isMarkedAsCandidate && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  議題候補
                </span>
              )}
            </div>
            <p className="text-white font-medium">{post.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.timestamp).toLocaleDateString('ja-JP')}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {post.author.department}
          </div>
          {targetCommittee && targetCommittee !== 'なし（様子見）' && (
            <div className="flex items-center gap-1 text-purple-400">
              <Send className="w-4 h-4" />
              提出先: {targetCommittee}
            </div>
          )}
        </div>
      </div>

      {/* 期限表示セクション */}
      {post.agendaDeadline && deadlineInfo && (
        <div className={`p-4 border-b border-gray-700/50 ${
          deadlineInfo.isExpired ? 'bg-red-900/10' :
          deadlineInfo.isNearExpiration ? 'bg-orange-900/10' :
          'bg-blue-900/10'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${
                deadlineInfo.isExpired ? 'text-red-400' :
                deadlineInfo.isNearExpiration ? 'text-orange-400' :
                'text-blue-400'
              }`} />
              <span className={`text-sm font-medium ${
                deadlineInfo.isExpired ? 'text-red-400' :
                deadlineInfo.isNearExpiration ? 'text-orange-400' :
                'text-blue-400'
              }`}>
                {deadlineInfo.isExpired ? '投票期限終了' : '投票期限'}
              </span>
            </div>
            <span className={`text-sm font-bold ${
              deadlineInfo.isExpired ? 'text-red-400' :
              deadlineInfo.isNearExpiration ? 'text-orange-400' :
              'text-blue-400'
            }`}>
              {deadlineInfo.isExpired
                ? `終了（${AgendaDeadlineManager.formatDeadline(post.agendaDeadline)}）`
                : AgendaDeadlineManager.formatDeadline(post.agendaDeadline)
              }
            </span>
          </div>
          {deadlineInfo.extensionCount && deadlineInfo.extensionCount > 0 && (
            <div className="text-xs text-orange-400 mb-1">
              延長{deadlineInfo.extensionCount}回
            </div>
          )}
          {deadlineMessage && (
            <div className={`text-xs ${
              deadlineMessage.severity === 'error' ? 'text-red-400' :
              deadlineMessage.severity === 'warning' ? 'text-orange-400' :
              'text-blue-400'
            }`}>
              {deadlineMessage.message}
            </div>
          )}
          {deadlineStatusMessage && (
            <div className={`mt-2 p-2 rounded text-xs ${
              deadlineStatusMessage.type === 'info' ? 'bg-blue-900/20 text-blue-300 border border-blue-500/30' :
              deadlineStatusMessage.type === 'warning' ? 'bg-orange-900/20 text-orange-300 border border-orange-500/30' :
              'bg-green-900/20 text-green-300 border border-green-500/30'
            }`}>
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {deadlineStatusMessage.message}
            </div>
          )}
        </div>
      )}

      {/* 統計サマリー */}
      <div className="p-4 grid grid-cols-3 gap-4">
        {/* 総投票数 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{voteAnalysis.totalVotes}</div>
          <div className="text-xs text-gray-400">総投票数</div>
        </div>

        {/* 支持率 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{voteAnalysis.supportRate}%</div>
          <div className="text-xs text-gray-400">支持率</div>
        </div>

        {/* コメント数 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{commentAnalysis.totalComments}</div>
          <div className="text-xs text-gray-400">コメント数</div>
        </div>
      </div>

      {/* 投稿ストーリー（タイムライン） */}
      <div className="p-4 bg-gray-900/30 border-y border-gray-700/50">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          📖 投稿ストーリー
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {timelineEvents.map((event, index) => {
            const isLast = index === timelineEvents.length - 1;
            return (
              <div key={event.id} className="relative">
                {/* タイムライン線 */}
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-700" />
                )}

                {/* イベントカード */}
                <div className="flex gap-3">
                  {/* アイコン */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full ${event.bgColor} border-2 ${event.borderColor} flex items-center justify-center ${event.color} z-10`}
                  >
                    {event.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold ${event.color}`}>
                        {event.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-300">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 次のアクション */}
        {nextAction && (
          <div className={`mt-4 p-3 rounded-lg border ${
            nextAction.type === 'warning' ? 'bg-orange-900/20 border-orange-500/30' :
            nextAction.type === 'success' ? 'bg-green-900/20 border-green-500/30' :
            'bg-blue-900/20 border-blue-500/30'
          }`}>
            <div className={`text-sm font-bold mb-1 ${
              nextAction.type === 'warning' ? 'text-orange-400' :
              nextAction.type === 'success' ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {nextAction.title}
            </div>
            <p className={`text-xs ${
              nextAction.type === 'warning' ? 'text-orange-300' :
              nextAction.type === 'success' ? 'text-green-300' :
              'text-blue-300'
            }`}>
              {nextAction.description}
            </p>
          </div>
        )}
      </div>

      {/* 詳細表示トグル */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showDetails ? '詳細を隠す ▲' : '詳細分析を表示 ▼'}
        </button>
      </div>

      {/* 詳細分析 */}
      {showDetails && (
        <div className="p-4 bg-gray-900/30 border-t border-gray-700/50 space-y-4">
          {/* 投票内訳 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              投票内訳
            </h4>
            <div className="space-y-2">
              <VoteBar label="強く支持" count={post.votes?.['strongly-support'] || 0} total={voteAnalysis.totalVotes} color="bg-green-500" />
              <VoteBar label="支持" count={post.votes?.['support'] || 0} total={voteAnalysis.totalVotes} color="bg-green-400" />
              <VoteBar label="中立" count={post.votes?.['neutral'] || 0} total={voteAnalysis.totalVotes} color="bg-gray-400" />
              <VoteBar label="反対" count={post.votes?.['oppose'] || 0} total={voteAnalysis.totalVotes} color="bg-orange-400" />
              <VoteBar label="強く反対" count={post.votes?.['strongly-oppose'] || 0} total={voteAnalysis.totalVotes} color="bg-red-500" />
            </div>
          </div>

          {/* 部署別分析 */}
          {voteAnalysis.byDepartment && voteAnalysis.byDepartment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                部署別支持率
              </h4>
              <div className="space-y-2">
                {voteAnalysis.byDepartment.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: `${dept.supportRate}%` }}
                        />
                      </div>
                      <span className="text-gray-400 w-12 text-right">{dept.supportRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* コメント分析 */}
          {commentAnalysis.totalComments > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                コメント分析
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-900/20 p-2 rounded">
                  <div className="text-green-400 font-medium">賛成意見</div>
                  <div className="text-white text-lg">{commentAnalysis.supportComments}</div>
                </div>
                <div className="bg-orange-900/20 p-2 rounded">
                  <div className="text-orange-400 font-medium">懸念点</div>
                  <div className="text-white text-lg">{commentAnalysis.concernComments}</div>
                </div>
                <div className="bg-blue-900/20 p-2 rounded">
                  <div className="text-blue-400 font-medium">建設的提案</div>
                  <div className="text-white text-lg">{commentAnalysis.proposalComments}</div>
                </div>
              </div>

              {/* 主要なコメント */}
              {commentAnalysis.keyComments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-400">主要なコメント（いいね数上位）</div>
                  {commentAnalysis.keyComments.slice(0, 3).map((comment, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-2 rounded text-sm">
                      <div className="text-gray-300">{comment.content}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                        <span>{comment.author}</span>
                        <span>👍 {comment.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* アクションボタン */}
      <div className="p-4 border-t border-gray-700/50 space-y-2">
        {/* 通常アクション（常に表示） */}
        <div className="flex gap-2">
          {onMarkAsCandidate && (
            <button
              onClick={onMarkAsCandidate}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isMarkedAsCandidate
                  ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isMarkedAsCandidate ? 'fill-yellow-400' : ''}`} />
              {isMarkedAsCandidate ? '候補マーク済み' : '議題候補としてマーク'}
            </button>
          )}
          {onCreateDocument && canEdit && (
            <button
              onClick={onCreateDocument}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              議題提案書を作成
            </button>
          )}
        </div>

        {/* 責任者判断アクション（権限と期限に応じて表示） */}
        {responsibilityPermissions && canEdit && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 font-medium">責任者判断アクション</div>
            <div className="grid grid-cols-2 gap-2">
              {/* レベルアップ承認（期限内でも可） */}
              {responsibilityPermissions.approveLevelUp.allowed && onApprovalLevelUp && (
                <button
                  onClick={onApprovalLevelUp}
                  className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  title={AgendaResponsibilityService.getActionDescription('approve_levelup')}
                >
                  <ThumbsUp className="w-4 h-4" />
                  レベルアップ承認
                </button>
              )}

              {/* 却下（期限後のみ） */}
              {responsibilityPermissions.reject.allowed && onReject ? (
                <button
                  onClick={() => setShowActionModal('reject')}
                  className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  title={AgendaResponsibilityService.getActionDescription('reject')}
                >
                  <ThumbsDown className="w-4 h-4" />
                  却下
                </button>
              ) : !responsibilityPermissions.reject.allowed && responsibilityPermissions.reject.reason && (
                <div
                  className="py-2 px-3 bg-gray-700/30 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                  title={responsibilityPermissions.reject.reason}
                >
                  <ThumbsDown className="w-4 h-4" />
                  却下
                </div>
              )}

              {/* 保留（期限後のみ） */}
              {responsibilityPermissions.hold.allowed && onHold ? (
                <button
                  onClick={() => setShowActionModal('hold')}
                  className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  title={AgendaResponsibilityService.getActionDescription('hold')}
                >
                  <Pause className="w-4 h-4" />
                  保留
                </button>
              ) : !responsibilityPermissions.hold.allowed && responsibilityPermissions.hold.reason && (
                <div
                  className="py-2 px-3 bg-gray-700/30 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                  title={responsibilityPermissions.hold.reason}
                >
                  <Pause className="w-4 h-4" />
                  保留
                </div>
              )}

              {/* 部署案件化（期限後のみ） */}
              {responsibilityPermissions.departmentMatter.allowed && onDepartmentMatter ? (
                <button
                  onClick={() => setShowActionModal('department_matter')}
                  className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm col-span-2"
                  title={AgendaResponsibilityService.getActionDescription('department_matter')}
                >
                  <FileText className="w-4 h-4" />
                  部署ミーティング案件化
                </button>
              ) : !responsibilityPermissions.departmentMatter.allowed && responsibilityPermissions.departmentMatter.reason && (
                <div
                  className="py-2 px-3 bg-gray-700/30 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2 text-sm cursor-not-allowed col-span-2"
                  title={responsibilityPermissions.departmentMatter.reason}
                >
                  <FileText className="w-4 h-4" />
                  部署ミーティング案件化
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* アクション確認モーダル */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">
              {showActionModal === 'reject' && '却下理由を入力'}
              {showActionModal === 'hold' && '保留理由を入力'}
              {showActionModal === 'department_matter' && '部署案件化理由を入力'}
            </h3>
            <textarea
              value={actionFeedback}
              onChange={(e) => setActionFeedback(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="理由を入力してください..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionFeedback('');
                }}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (showActionModal === 'reject' && onReject) {
                    onReject(actionFeedback);
                  } else if (showActionModal === 'hold' && onHold) {
                    onHold(actionFeedback);
                  } else if (showActionModal === 'department_matter' && onDepartmentMatter) {
                    onDepartmentMatter(actionFeedback);
                  }
                  setShowActionModal(null);
                  setActionFeedback('');
                }}
                disabled={!actionFeedback.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 投票バーコンポーネント
const VoteBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({
  label,
  count,
  total,
  color
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-gray-400">{label}</div>
      <div className="flex-1 h-6 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-12 text-xs text-gray-400 text-right">{count}票</div>
    </div>
  );
};

export default ProposalAnalysisCard;
