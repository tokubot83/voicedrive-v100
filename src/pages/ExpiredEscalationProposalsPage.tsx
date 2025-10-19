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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">期限到達提案一覧</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">期限到達提案一覧</h1>
        <button
          onClick={fetchProposals}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="更新"
        >
          <RefreshCw className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-800 text-sm">
          投票期限に到達したが目標スコアに未達成の提案を表示しています。
          各提案について、現在のレベルで承認するか、ダウングレードするか、不採用にするかを判断してください。
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-1">{proposals.length}</div>
          <div className="text-sm text-gray-600">判断待ち提案数</div>
        </div>
      </div>

      {/* 提案一覧 */}
      {proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 border border-gray-200">
          <p className="text-center text-gray-500">
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
              <div key={proposal.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                {/* ヘッダー行 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {proposal.agendaLevel && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {proposal.agendaLevel}
                        </span>
                      )}
                      {proposal.proposalType && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {proposal.proposalType}
                        </span>
                      )}
                      {daysOverdue > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          期限超過 {daysOverdue}日
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {proposal.content}
                    </h3>

                    {proposal.author && (
                      <p className="text-sm text-gray-600">
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

                <div className="border-t border-gray-200 my-4"></div>

                {/* スコア情報 */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {currentScore}点
                    </div>
                    <div className="text-gray-600">
                      / 目標 {targetScore}点
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        achievementRate >= 100
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      到達率 {achievementRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
  );
};
