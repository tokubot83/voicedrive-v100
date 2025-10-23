/**
 * 期限到達提案一覧ページ
 * Phase 6 - 期限到達・未達成昇格の判断機能
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Info, AlertCircle } from 'lucide-react';
import { ExpiredEscalationDecisionModal, ExpiredProposal } from '../components/agenda-mode/ExpiredEscalationDecisionModal';

interface ProposalWithDeadline extends ExpiredProposal {
  facilityId?: string;
}

export const ExpiredEscalationProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalWithDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<ProposalWithDeadline | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // agendaLevelに応じた目標スコアを取得
  const getTargetScore = (agendaLevel?: string): number => {
    if (agendaLevel?.includes('CORP')) return 600;
    if (agendaLevel?.includes('FACILITY')) return 300;
    if (agendaLevel?.includes('DEPT')) return 100;
    return 100;
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: 実際のAPIエンドポイントに置き換え
      const response = await fetch('/api/agenda/expired-escalation-proposals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('期限到達提案の取得に失敗しました');
      }

      const data = await response.json();
      setProposals(data.data?.proposals || []);
    } catch (err: any) {
      setError(err.message || '期限到達提案の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleOpenModal = (proposal: ProposalWithDeadline) => {
    setSelectedProposal(proposal);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProposal(null);
  };

  const handleDecide = async (decision: {
    postId: string;
    decision: 'approve_at_current_level' | 'downgrade' | 'reject';
    decisionReason: string;
    currentScore: number;
    targetScore: number;
    agendaLevel: string;
    proposalType?: string;
    department?: string;
  }) => {
    try {
      const response = await fetch('/api/agenda/expired-escalation-decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(decision),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '判断の記録に失敗しました');
      }

      // 成功したら再取得
      await fetchProposals();
    } catch (err: any) {
      throw err;
    }
  };

  const getDaysOverdue = (deadline: Date | string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAchievementRate = (currentScore: number, targetScore: number) => {
    return (currentScore / targetScore) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold text-white mb-6">期限到達提案一覧</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white">期限到達提案一覧</h1>
          <button
            onClick={fetchProposals}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="更新"
          >
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </button>
        </div>

        {/* 説明 */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-200 text-sm">
            投票期限に到達したが目標スコアに未達成の提案を表示しています。
            各提案について、現在のレベルで承認するか、ダウングレードするか、不採用にするかを判断してください。
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-1">{proposals.length}</div>
            <div className="text-sm text-gray-300">判断待ち提案数</div>
          </div>
        </div>

        {/* 提案一覧 */}
        {proposals.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl p-12 border border-gray-700/50">
            <p className="text-center text-gray-400">
              判断待ちの期限到達提案はありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const currentScore = proposal.agendaScore || 0;
              const targetScore = getTargetScore(proposal.agendaLevel);
              const achievementRate = getAchievementRate(currentScore, targetScore);
              const daysOverdue = proposal.agendaVotingDeadline
                ? getDaysOverdue(proposal.agendaVotingDeadline)
                : 0;

              return (
                <div key={proposal.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 p-6">
                {/* ヘッダー行 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {proposal.agendaLevel && (
                        <span className="px-3 py-1 bg-blue-900/50 text-blue-300 border border-blue-500/50 rounded-full text-sm font-medium">
                          {proposal.agendaLevel}
                        </span>
                      )}
                      {proposal.proposalType && (
                        <span className="px-3 py-1 bg-purple-900/50 text-purple-300 border border-purple-500/50 rounded-full text-sm">
                          {proposal.proposalType}
                        </span>
                      )}
                      {daysOverdue > 0 && (
                        <span className="px-3 py-1 bg-red-900/50 text-red-300 border border-red-500/50 rounded-full text-sm font-medium">
                          期限超過 {daysOverdue}日
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {proposal.content}
                    </h3>

                    {proposal.author && (
                      <p className="text-sm text-gray-300">
                        提案者: {proposal.author.name}
                        {proposal.author.department && ` (${proposal.author.department})`}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenModal(proposal)}
                    className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex-shrink-0"
                  >
                    判断する
                  </button>
                </div>

                <div className="border-t border-gray-700/50 my-4"></div>

                {/* スコア情報 */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-3xl font-bold text-blue-400">
                      {currentScore}点
                    </div>
                    <div className="text-gray-300">
                      / 目標 {targetScore}点
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        achievementRate >= 100
                          ? 'bg-green-900/50 text-green-300 border border-green-500/50'
                          : 'bg-orange-900/50 text-orange-300 border border-orange-500/50'
                      }`}
                    >
                      到達率 {achievementRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${Math.min(achievementRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 判断モーダル */}
      <ExpiredEscalationDecisionModal
        open={modalOpen}
        proposal={selectedProposal}
        targetScore={selectedProposal ? getTargetScore(selectedProposal.agendaLevel) : 100}
        onClose={handleCloseModal}
        onDecide={handleDecide}
      />
      </div>
    </div>
  );
};
