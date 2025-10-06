/**
 * 議題提案書カード
 * 作成済みの議題提案書を一覧表示
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProposalDocument } from '../../types/proposalDocument';
import { FileText, Calendar, User, BarChart3, MessageSquare, Edit, Send, CheckCircle } from 'lucide-react';

interface ProposalDocumentCardProps {
  document: ProposalDocument;
  onEdit?: (documentId: string) => void;
  onSubmitRequest?: (documentId: string) => void;
}

export const ProposalDocumentCard: React.FC<ProposalDocumentCardProps> = ({
  document,
  onEdit,
  onSubmitRequest
}) => {
  const navigate = useNavigate();

  // 議題レベルの表示設定
  const levelConfig = {
    PENDING: { label: '投票中', color: 'text-gray-400', bg: 'bg-gray-800/30' },
    DEPT_REVIEW: { label: '部署レビュー', color: 'text-blue-400', bg: 'bg-blue-900/30' },
    DEPT_AGENDA: { label: '部署議題', color: 'text-blue-500', bg: 'bg-blue-900/50' },
    FACILITY_AGENDA: { label: '施設議題', color: 'text-purple-400', bg: 'bg-purple-900/50' },
    CORP_REVIEW: { label: '法人レビュー', color: 'text-orange-400', bg: 'bg-orange-900/50' },
    CORP_AGENDA: { label: '法人議題', color: 'text-red-400', bg: 'bg-red-900/50' }
  };

  const config = levelConfig[document.agendaLevel];

  // ステータスの表示設定
  const statusConfig = {
    draft: { label: '下書き', color: 'bg-gray-700/30 text-gray-400' },
    under_review: { label: 'レビュー中', color: 'bg-blue-900/30 text-blue-400' },
    ready: { label: '提出準備完了', color: 'bg-green-900/30 text-green-400' },
    submitted: { label: '委員会提出済み', color: 'bg-purple-900/30 text-purple-400' },
    approved: { label: '承認', color: 'bg-green-900/30 text-green-400' },
    rejected: { label: '却下', color: 'bg-red-900/30 text-red-400' }
  };

  const statusStyle = statusConfig[document.status];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{document.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`px-3 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className={`px-3 py-1 rounded text-xs font-medium ${statusStyle.color}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* 情報 */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          作成: {new Date(document.createdDate).toLocaleDateString('ja-JP')}
        </div>
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          {document.createdBy.name}
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-900/30 rounded-lg p-3">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{document.voteAnalysis.totalVotes}</div>
          <div className="text-xs text-gray-400">総投票数</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{document.voteAnalysis.supportRate}%</div>
          <div className="text-xs text-gray-400">支持率</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{document.commentAnalysis.totalComments}</div>
          <div className="text-xs text-gray-400">コメント</div>
        </div>
      </div>

      {/* 提案内容プレビュー */}
      <div className="bg-gray-900/30 rounded-lg p-3 mb-4">
        <div className="text-sm text-gray-300 line-clamp-2">
          {document.summary}
        </div>
      </div>

      {/* 推奨レベル */}
      {document.recommendationLevel && (
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            document.recommendationLevel === 'strongly_recommend' ? 'bg-green-900/30 text-green-400' :
            document.recommendationLevel === 'recommend' ? 'bg-blue-900/30 text-blue-400' :
            document.recommendationLevel === 'neutral' ? 'bg-gray-800/30 text-gray-400' :
            'bg-orange-900/30 text-orange-400'
          }`}>
            推奨: {
              document.recommendationLevel === 'strongly_recommend' ? '強く推奨' :
              document.recommendationLevel === 'recommend' ? '推奨' :
              document.recommendationLevel === 'neutral' ? '中立' :
              '推奨しない'
            }
          </span>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/proposal-document/${document.id}`)}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          詳細を見る
        </button>
        {document.status === 'draft' && onEdit && (
          <button
            onClick={() => onEdit(document.id)}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            編集
          </button>
        )}
        {document.status === 'ready' && onSubmitRequest && (
          <button
            onClick={() => onSubmitRequest(document.id)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            提出
          </button>
        )}
      </div>

      {/* 提出済みの場合 */}
      {document.status === 'submitted' && document.targetCommittee && (
        <div className="mt-3 bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">{document.targetCommittee}に提出済み</span>
          </div>
          {document.submittedDate && (
            <div className="text-xs text-purple-400 mt-1">
              提出日: {new Date(document.submittedDate).toLocaleString('ja-JP')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalDocumentCard;
