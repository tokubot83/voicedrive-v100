/**
 * 期限到達提案の判断モーダル
 * Phase 6 - 期限到達・未達成昇格の判断機能
 */

import React, { useState } from 'react';
import { X, CheckCircle, TrendingDown, XCircle, AlertCircle } from 'lucide-react';

export interface ExpiredProposal {
  id: string;
  content: string;
  agendaScore?: number;
  agendaLevel?: string;
  proposalType?: string;
  department?: string;
  agendaVotingDeadline?: Date | string;
  author?: {
    name: string;
    department?: string;
  };
}

interface ExpiredEscalationDecisionModalProps {
  open: boolean;
  proposal: ExpiredProposal | null;
  targetScore: number;
  onClose: () => void;
  onDecide: (decision: {
    postId: string;
    decision: 'approve_at_current_level' | 'downgrade' | 'reject';
    decisionReason: string;
    currentScore: number;
    targetScore: number;
    agendaLevel: string;
    proposalType?: string;
    department?: string;
  }) => Promise<void>;
}

export const ExpiredEscalationDecisionModal: React.FC<
  ExpiredEscalationDecisionModalProps
> = ({ open, proposal, targetScore, onClose, onDecide }) => {
  const [decision, setDecision] = useState<
    'approve_at_current_level' | 'downgrade' | 'reject' | ''
  >('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !proposal) return null;

  const currentScore = proposal.agendaScore || 0;
  const achievementRate = (currentScore / targetScore) * 100;

  // 期限超過日数を計算
  const deadline = proposal.agendaVotingDeadline
    ? new Date(proposal.agendaVotingDeadline)
    : null;
  const now = new Date();
  const daysOverdue = deadline
    ? Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleSubmit = async () => {
    // バリデーション
    if (!decision) {
      setError('判断を選択してください');
      return;
    }

    if (!reason.trim()) {
      setError('判断理由を入力してください');
      return;
    }

    if (reason.trim().length < 10) {
      setError('判断理由は10文字以上入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onDecide({
        postId: proposal.id,
        decision,
        decisionReason: reason.trim(),
        currentScore,
        targetScore,
        agendaLevel: proposal.agendaLevel || 'unknown',
        proposalType: proposal.proposalType,
        department: proposal.department,
      });

      // 成功したらリセット
      setDecision('');
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || '判断の記録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDecision('');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">期限到達提案の判断</h2>
            {daysOverdue > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                期限超過 {daysOverdue}日
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 提案内容 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">提案内容</h3>
            <p className="text-gray-800 leading-relaxed mb-3">{proposal.content}</p>
            <div className="flex gap-2 flex-wrap">
              {proposal.agendaLevel && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {proposal.agendaLevel}
                </span>
              )}
              {proposal.proposalType && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {proposal.proposalType}
                </span>
              )}
              {proposal.author && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  提案者: {proposal.author.name}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* スコア情報 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">スコア到達状況</h3>
            <div className="flex items-center gap-4 mb-2">
              <div className="text-3xl font-bold text-blue-600">{currentScore}点</div>
              <div className="text-gray-500">/ 目標 {targetScore}点</div>
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

          <div className="border-t border-gray-200"></div>

          {/* 判断選択 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              判断を選択してください <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              {/* 承認 */}
              <button
                onClick={() => setDecision('approve_at_current_level')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  decision === 'approve_at_current_level'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      decision === 'approve_at_current_level'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {decision === 'approve_at_current_level' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-bold text-gray-800">現在のレベルで承認</div>
                    <div className="text-sm text-gray-600">
                      目標スコアに未達でも、現在のレベルで承認します
                    </div>
                  </div>
                </div>
              </button>

              {/* ダウングレード */}
              <button
                onClick={() => setDecision('downgrade')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  decision === 'downgrade'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      decision === 'downgrade'
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {decision === 'downgrade' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-bold text-gray-800">ダウングレード</div>
                    <div className="text-sm text-gray-600">1つ下のレベルに降格します</div>
                  </div>
                </div>
              </button>

              {/* 不採用 */}
              <button
                onClick={() => setDecision('reject')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  decision === 'reject'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      decision === 'reject'
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {decision === 'reject' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-bold text-gray-800">不採用</div>
                    <div className="text-sm text-gray-600">この提案を不採用とします</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 判断理由 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              判断理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="判断の理由を具体的に記入してください（10文字以上）"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                reason.length > 0 && reason.length < 10
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            <div className="text-sm text-gray-500 mt-1">
              {reason.length}文字 / 最低10文字
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !decision || reason.length < 10}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              decision === 'approve_at_current_level'
                ? 'bg-green-600 hover:bg-green-700'
                : decision === 'downgrade'
                ? 'bg-orange-600 hover:bg-orange-700'
                : decision === 'reject'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400'
            }`}
          >
            {isSubmitting ? '処理中...' : '判断を確定'}
          </button>
        </div>
      </div>
    </div>
  );
};
