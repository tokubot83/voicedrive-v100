/**
 * AgendaDecisionModal
 *
 * 議題モードの判断（承認/却下/昇格）時の理由入力モーダル
 */

import React, { useState } from 'react';
import { AgendaDecisionType } from '@/services/AgendaDecisionService';

interface AgendaDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, committeeId?: string) => void;
  decisionType: AgendaDecisionType;
  postTitle: string;
  isLoading?: boolean;
}

const DECISION_LABELS: Record<AgendaDecisionType, { title: string; color: string; emoji: string }> = {
  // Level 3.5
  recommend_to_manager: { title: '師長に推薦', color: 'green', emoji: '✅' },
  reject_by_supervisor: { title: '却下', color: 'red', emoji: '❌' },

  // Level 7
  approve_as_dept_agenda: { title: '部署議題承認', color: 'green', emoji: '✅' },
  escalate_to_facility: { title: '施設議題に昇格', color: 'blue', emoji: '⬆️' },
  reject_by_manager: { title: '却下', color: 'red', emoji: '❌' },
  rescue_as_dept_agenda: { title: '部署議題承認（救済）', color: 'green', emoji: '🆘' },
  complete_rejection: { title: '完全却下', color: 'red', emoji: '❌' },

  // Level 8
  approve_for_committee: { title: '委員会提出承認', color: 'green', emoji: '✅' },
  escalate_to_corp_review: { title: '法人検討に昇格', color: 'blue', emoji: '⬆️' },
  reject_by_deputy_director: { title: '却下', color: 'red', emoji: '❌' },

  // Level 11
  approve_as_corp_agenda: { title: '法人議題承認', color: 'green', emoji: '✅' },
  escalate_to_corp_agenda: { title: '法人議題に昇格', color: 'blue', emoji: '⬆️' },
  reject_by_general_affairs: { title: '却下', color: 'red', emoji: '❌' },
  rescue_as_facility_agenda: { title: '施設議題承認（救済）', color: 'green', emoji: '🆘' },

  // Level 18
  approve_for_corp_meeting: { title: '法人運営会議提出承認', color: 'green', emoji: '✅' },
  reject_by_general_affairs_director: { title: '却下', color: 'red', emoji: '❌' },
};

export const AgendaDecisionModal: React.FC<AgendaDecisionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  decisionType,
  postTitle,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [committeeId, setCommitteeId] = useState<string>('');

  const decision = DECISION_LABELS[decisionType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('判断理由を入力してください');
      return;
    }

    onSubmit(reason, committeeId || undefined);
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setCommitteeId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  // 昇格の場合は確認メッセージを表示
  const isEscalation = decisionType.includes('escalate');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className={`px-6 py-4 border-b border-gray-200 bg-${decision.color}-50`}>
          <h2 className="text-xl font-bold text-gray-900">
            {decision.emoji} {decision.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            投稿: {postTitle.substring(0, 50)}{postTitle.length > 50 ? '...' : ''}
          </p>
        </div>

        {/* ボディ */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* 昇格時の確認メッセージ */}
          {isEscalation && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>⚠️ 昇格について</strong>
                <br />
                この投稿を上位レベルに昇格させると、投票期限が延長され、より広い範囲の職員が投票できるようになります。
              </p>
            </div>
          )}

          {/* 判断理由入力 */}
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              判断理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="判断の理由を詳しく入力してください..."
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              この理由は投稿者および関係者に通知されます
            </p>
          </div>

          {/* 委員会選択（Level 8の承認時のみ） */}
          {decisionType === 'approve_for_committee' && (
            <div className="mb-4">
              <label htmlFor="committee" className="block text-sm font-medium text-gray-700 mb-2">
                提出先委員会
              </label>
              <select
                id="committee"
                value={committeeId}
                onChange={(e) => setCommitteeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">-- 委員会を選択 --</option>
                <option value="safety-committee">医療安全委員会</option>
                <option value="infection-committee">感染対策委員会</option>
                <option value="quality-committee">医療の質向上委員会</option>
                <option value="ethics-committee">倫理委員会</option>
                <option value="management-committee">運営委員会</option>
              </select>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                decision.color === 'green'
                  ? 'bg-green-600 hover:bg-green-700'
                  : decision.color === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : `${decision.emoji} ${decision.title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
