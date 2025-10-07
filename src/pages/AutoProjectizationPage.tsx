/**
 * 自動プロジェクト化承認ページ
 * レベル3.5以上（係長以上）
 *
 * 議題モードでスコアが閾値に達したアイデアボイスを
 * プロジェクトモードのプロジェクトに変換する承認フロー
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { autoProjectizationService } from '../services/AutoProjectizationService';
import {
  ProjectizationProposal,
  ProjectizationStats,
  ProjectizationStatus,
  ProjectizationApproval
} from '../types/autoProjectization';
import { ProjectLevel } from '../types/visibility';

type TabType = 'pending' | 'eligible' | 'approved' | 'rejected' | 'converted' | 'all';

const AutoProjectizationPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [proposals, setProposals] = useState<ProjectizationProposal[]>([]);
  const [stats, setStats] = useState<ProjectizationStats | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProjectizationProposal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    autoProjectizationService.initializeDemoData();
    loadData();
  }, []);

  const loadData = () => {
    setStats(autoProjectizationService.getStats());
    filterProposals(activeTab);
  };

  const filterProposals = (tab: TabType) => {
    let filtered: ProjectizationProposal[];

    switch (tab) {
      case 'pending':
        filtered = autoProjectizationService.getProposalsByStatus('pending_review');
        break;
      case 'eligible':
        filtered = autoProjectizationService.getProposalsByStatus('eligible');
        break;
      case 'approved':
        filtered = autoProjectizationService.getProposalsByStatus('approved');
        break;
      case 'rejected':
        filtered = autoProjectizationService.getProposalsByStatus('rejected');
        break;
      case 'converted':
        filtered = autoProjectizationService.getProposalsByStatus('converted');
        break;
      default:
        filtered = autoProjectizationService.getAllProposals();
    }

    setProposals(filtered);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    filterProposals(tab);
  };

  const handleOpenDetail = (proposal: ProjectizationProposal) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
    setActionType(null);
    setComment('');
    setRejectionReason('');
  };

  const handleStartReview = (proposal: ProjectizationProposal) => {
    if (!activeUser) return;

    autoProjectizationService.startReview(
      proposal.id,
      activeUser.id,
      activeUser.name
    );
    loadData();
  };

  const handleApprove = () => {
    if (!selectedProposal || !activeUser) return;

    const approval: ProjectizationApproval = {
      proposalId: selectedProposal.id,
      action: 'approve',
      approverId: activeUser.id,
      approverName: activeUser.name,
      approverLevel: activeUser.permissionLevel || 1,
      comment,
      timestamp: new Date(),
      projectSettings: {
        title: selectedProposal.post.content.slice(0, 50) + '...',
        description: selectedProposal.post.content,
        objectives: ['目標1', '目標2'], // 実際にはフォームで入力
        targetDuration: selectedProposal.projectEstimate.estimatedDuration,
        estimatedBudget: selectedProposal.projectEstimate.estimatedBudget
      }
    };

    autoProjectizationService.approveProposal(selectedProposal.id, approval);
    setShowDetailModal(false);
    loadData();
  };

  const handleReject = () => {
    if (!selectedProposal || !activeUser || !rejectionReason) return;

    autoProjectizationService.rejectProposal(
      selectedProposal.id,
      activeUser.id,
      activeUser.name,
      rejectionReason
    );
    setShowDetailModal(false);
    loadData();
  };

  const getProjectLevelIcon = (level: ProjectLevel): string => {
    const icons: Record<ProjectLevel, string> = {
      PENDING: '⏳',
      TEAM: '👥',
      DEPARTMENT: '🏢',
      FACILITY: '🏥',
      ORGANIZATION: '🌐',
      STRATEGIC: '🎯'
    };
    return icons[level];
  };

  const getProjectLevelLabel = (level: ProjectLevel): string => {
    const labels: Record<ProjectLevel, string> = {
      PENDING: '検討中',
      TEAM: 'チーム',
      DEPARTMENT: '部門',
      FACILITY: '施設',
      ORGANIZATION: '法人',
      STRATEGIC: '戦略'
    };
    return labels[level];
  };

  const getProjectLevelColor = (level: ProjectLevel): string => {
    const colors: Record<ProjectLevel, string> = {
      PENDING: 'text-gray-400 bg-gray-800/50',
      TEAM: 'text-cyan-400 bg-cyan-900/30',
      DEPARTMENT: 'text-teal-400 bg-teal-900/30',
      FACILITY: 'text-emerald-400 bg-emerald-900/30',
      ORGANIZATION: 'text-blue-400 bg-blue-900/30',
      STRATEGIC: 'text-purple-400 bg-purple-900/30'
    };
    return colors[level];
  };

  const getStatusBadge = (status: ProjectizationStatus) => {
    const badges: Record<ProjectizationStatus, { label: string; color: string }> = {
      eligible: { label: '適格', color: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30' },
      pending_review: { label: 'レビュー中', color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' },
      approved: { label: '承認済み', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' },
      rejected: { label: '却下', color: 'bg-red-900/30 text-red-400 border-red-500/30' },
      converted: { label: '変換完了', color: 'bg-purple-900/30 text-purple-400 border-purple-500/30' }
    };

    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { label: string; color: string; icon: string }> = {
      low: { label: '通常', color: 'bg-gray-800/50 text-gray-400', icon: '📝' },
      normal: { label: '標準', color: 'bg-blue-900/30 text-blue-400', icon: '📋' },
      high: { label: '高', color: 'bg-orange-900/30 text-orange-400', icon: '⚠️' },
      urgent: { label: '緊急', color: 'bg-red-900/30 text-red-400', icon: '🚨' }
    };

    const badge = badges[priority];
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const formatBudget = (budget: number): string => {
    if (budget === -1) return '無制限';
    if (budget >= 10000000) return `${(budget / 10000000).toFixed(0)}千万円`;
    if (budget >= 10000) return `${(budget / 10000).toFixed(0)}万円`;
    return `${budget.toLocaleString()}円`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 rounded-2xl p-6 backdrop-blur-xl border border-teal-500/20 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🚀</span>
          自動プロジェクト化
        </h1>
        <p className="text-gray-300">
          高スコアアイデアのプロジェクト変換承認
        </p>
      </div>

      {/* 統計ダッシュボード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 rounded-xl p-5 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-sm font-semibold">承認待ち</span>
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pendingReview}</div>
            <div className="text-xs text-gray-400 mt-1">件</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-xl p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-sm font-semibold">今月変換</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.thisMonthConversions}</div>
            <div className="text-xs text-gray-400 mt-1">プロジェクト</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-semibold">承認率</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.approvalRate}%</div>
            <div className="text-xs text-gray-400 mt-1">
              承認 {stats.approved} / 却下 {stats.rejected}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-semibold">平均レビュー時間</span>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.avgReviewTime}</div>
            <div className="text-xs text-gray-400 mt-1">日</div>
          </div>
        </div>
      )}

      {/* タブフィルタ */}
      <div className="bg-gray-800/50 rounded-xl p-2 mb-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'pending' as TabType, label: '承認待ち', count: stats?.pendingReview },
          { id: 'eligible' as TabType, label: '適格', count: stats?.totalEligible },
          { id: 'approved' as TabType, label: '承認済み', count: stats?.approved },
          { id: 'rejected' as TabType, label: '却下', count: stats?.rejected },
          { id: 'converted' as TabType, label: '変換完了', count: stats?.converted },
          { id: 'all' as TabType, label: 'すべて', count: proposals.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-teal-600/30 text-teal-400 border border-teal-500/50'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 提案リスト */}
      {proposals.length === 0 ? (
        <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700/30">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">提案がありません</h3>
          <p className="text-gray-500">
            {activeTab === 'pending' && '現在、承認待ちの提案はありません。'}
            {activeTab === 'eligible' && '現在、適格な投稿はありません。'}
            {activeTab === 'approved' && '承認済みの提案はありません。'}
            {activeTab === 'rejected' && '却下された提案はありません。'}
            {activeTab === 'converted' && '変換完了したプロジェクトはありません。'}
            {activeTab === 'all' && 'プロジェクト化提案がありません。'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => (
            <div
              key={proposal.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-teal-500/50 transition-all cursor-pointer"
              onClick={() => handleOpenDetail(proposal)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getProjectLevelColor(proposal.achievedLevel)}`}>
                      {getProjectLevelIcon(proposal.achievedLevel)} {getProjectLevelLabel(proposal.achievedLevel)}レベル
                    </span>
                    {getPriorityBadge(proposal.priority)}
                    {getStatusBadge(proposal.status)}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {proposal.post.content.slice(0, 100)}
                    {proposal.post.content.length > 100 && '...'}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>提案者: {proposal.post.author.name}</span>
                    <span>•</span>
                    <span>部署: {proposal.post.author.department}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">
                    {proposal.currentScore}点
                  </div>
                  <div className="text-xs text-gray-500">
                    閾値 {proposal.threshold}点達成
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700/50">
                <div>
                  <div className="text-xs text-gray-500 mb-1">推定予算</div>
                  <div className="text-sm font-semibold text-white">
                    {formatBudget(proposal.projectEstimate.estimatedBudget)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">推定期間</div>
                  <div className="text-sm font-semibold text-white">
                    {proposal.projectEstimate.estimatedDuration}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">推奨チーム規模</div>
                  <div className="text-sm font-semibold text-white">
                    {proposal.projectEstimate.recommendedTeamSize}名
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">賛成率</div>
                  <div className="text-sm font-semibold text-emerald-400">
                    {proposal.supportRate}%
                  </div>
                </div>
              </div>

              {proposal.status === 'eligible' && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartReview(proposal);
                    }}
                    className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-500/30 rounded-lg font-semibold transition-all"
                  >
                    レビュー開始
                  </button>
                </div>
              )}

              {proposal.reviewedBy && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 text-sm text-gray-400">
                  <span>レビュー担当: {proposal.reviewedBy}</span>
                  {proposal.reviewedDate && (
                    <span className="ml-4">
                      • {proposal.reviewedDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {showDetailModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-900/80 to-cyan-900/80 backdrop-blur-xl p-6 border-b border-teal-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getProjectLevelColor(selectedProposal.achievedLevel)}`}>
                      {getProjectLevelIcon(selectedProposal.achievedLevel)} {getProjectLevelLabel(selectedProposal.achievedLevel)}レベル
                    </span>
                    {getPriorityBadge(selectedProposal.priority)}
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    プロジェクト化提案詳細
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 元の投稿内容 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📝</span> 投稿内容
                </h3>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedProposal.post.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span>投稿者: {selectedProposal.post.author.name}</span>
                    <span>•</span>
                    <span>{selectedProposal.post.author.department}</span>
                    <span>•</span>
                    <span>{selectedProposal.proposedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* スコア情報 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📊</span> スコア情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-teal-900/20 to-teal-800/10 rounded-xl p-4 border border-teal-500/20">
                    <div className="text-sm text-gray-400 mb-1">現在のスコア</div>
                    <div className="text-2xl font-bold text-teal-400">{selectedProposal.currentScore}点</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="text-sm text-gray-400 mb-1">賛成率</div>
                    <div className="text-2xl font-bold text-emerald-400">{selectedProposal.supportRate}%</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  総投票数: {selectedProposal.totalVotes}票
                </div>
              </div>

              {/* プロジェクト推定 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> プロジェクト推定情報
                </h3>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">推定予算:</span>
                    <span className="text-white font-semibold">
                      {formatBudget(selectedProposal.projectEstimate.estimatedBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">推定期間:</span>
                    <span className="text-white font-semibold">
                      {selectedProposal.projectEstimate.estimatedDuration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">推奨チーム規模:</span>
                    <span className="text-white font-semibold">
                      {selectedProposal.projectEstimate.recommendedTeamSize}名
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">必要承認者レベル:</span>
                    <span className="text-white font-semibold">
                      Level {selectedProposal.projectEstimate.requiredApproverLevel}以上
                    </span>
                  </div>
                </div>
              </div>

              {/* レビューコメント（既存の場合） */}
              {selectedProposal.reviewComment && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>💬</span> レビューコメント
                  </h3>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                    <p className="text-gray-300">{selectedProposal.reviewComment}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      - {selectedProposal.reviewedBy} ({selectedProposal.reviewedDate?.toLocaleDateString()})
                    </div>
                  </div>
                </div>
              )}

              {/* 却下理由（却下された場合） */}
              {selectedProposal.rejectionReason && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>❌</span> 却下理由
                  </h3>
                  <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                    <p className="text-gray-300">{selectedProposal.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* アクションボタン（承認待ちの場合） */}
              {selectedProposal.status === 'pending_review' && !actionType && (
                <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => setActionType('approve')}
                    className="flex-1 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold transition-all"
                  >
                    ✅ 承認
                  </button>
                  <button
                    onClick={() => setActionType('reject')}
                    className="flex-1 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all"
                  >
                    ❌ 却下
                  </button>
                </div>
              )}

              {/* 承認フォーム */}
              {actionType === 'approve' && (
                <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/30 space-y-4">
                  <h4 className="font-semibold text-emerald-400">承認コメント（任意）</h4>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="プロジェクト化の方針や期待について..."
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
                    >
                      承認を確定
                    </button>
                    <button
                      onClick={() => setActionType(null)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {/* 却下フォーム */}
              {actionType === 'reject' && (
                <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30 space-y-4">
                  <h4 className="font-semibold text-red-400">却下理由（必須）</h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="却下する理由を詳しく入力してください..."
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      却下を確定
                    </button>
                    <button
                      onClick={() => setActionType(null)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoProjectizationPage;
