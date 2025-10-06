/**
 * 委員会提出承認ページ（Level 8+専用）
 * Level 7+からの提出リクエストを承認・却下
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { SubmissionRequest, committeeSubmissionService } from '../services/CommitteeSubmissionService';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import {
  Send, CheckCircle, XCircle, Clock, AlertCircle, FileText,
  Calendar, User, Building2, ChevronRight
} from 'lucide-react';

export const CommitteeSubmissionApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [requests, setRequests] = useState<SubmissionRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<SubmissionRequest | null>(null);

  useEffect(() => {
    if (activeUser) {
      loadRequests();
    }
  }, [activeUser, filter]);

  const loadRequests = () => {
    if (filter === 'pending') {
      setRequests(committeeSubmissionService.getPendingRequests());
    } else {
      setRequests(committeeSubmissionService.getAllRequests());
    }
  };

  const handleApprove = (request: SubmissionRequest) => {
    if (!activeUser) return;

    const notes = prompt('承認コメント（任意）');

    const approved = committeeSubmissionService.approveSubmissionRequest(
      request.id,
      activeUser,
      notes || undefined
    );

    if (approved) {
      alert(`提出リクエストを承認しました\n委員会: ${request.targetCommittee}`);
      loadRequests();
      setSelectedRequest(null);
    }
  };

  const handleReject = (request: SubmissionRequest) => {
    if (!activeUser) return;

    const reason = prompt('却下理由を入力してください（必須）');
    if (!reason) return;

    const rejected = committeeSubmissionService.rejectSubmissionRequest(
      request.id,
      activeUser,
      reason
    );

    if (rejected) {
      alert(`提出リクエストを却下しました`);
      loadRequests();
      setSelectedRequest(null);
    }
  };

  if (!activeUser) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">読み込み中...</div>
    </div>;
  }

  // Level 8 未満はアクセス不可
  if (!activeUser.permissionLevel || activeUser.permissionLevel < 8) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 max-w-md">
        <div className="flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">アクセス権限がありません</h2>
        <p className="text-gray-400 text-center">
          委員会提出承認には Level 8 以上の権限が必要です
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>;
  }

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Send className="w-8 h-8" />
          委員会提出承認（Level 8+）
        </h1>
        <p className="text-gray-300 mb-4">
          提出リクエストを確認し、委員会への提出を承認・却下
        </p>

        {/* 統計サマリー */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-yellow-300">レビュー待ち</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-xs text-green-300">承認済み</div>
          </div>
          <div className="bg-red-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-xs text-red-300">却下</div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Clock className="w-5 h-5 inline-block mr-2" />
            レビュー待ち ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            全て表示 ({requests.length})
          </button>
        </div>
      </div>

      {/* リクエスト一覧 */}
      <div className="mx-6 pb-24 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-400">
              {filter === 'pending' ? 'レビュー待ちのリクエストはありません' : 'リクエストがありません'}
            </p>
          </div>
        ) : (
          requests.map(request => (
            <div
              key={request.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{request.document.title}</h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {request.requestedBy.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.requestedDate).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {request.targetCommittee}
                    </div>
                  </div>
                </div>
              </div>

              {/* 投票データ */}
              <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-900/30 rounded-lg p-4">
                <div>
                  <div className="text-xs text-gray-400">総投票数</div>
                  <div className="text-xl font-bold text-white">{request.document.voteAnalysis.totalVotes}票</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">支持率</div>
                  <div className="text-xl font-bold text-green-400">{request.document.voteAnalysis.supportRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">コメント数</div>
                  <div className="text-xl font-bold text-blue-400">{request.document.commentAnalysis.totalComments}件</div>
                </div>
              </div>

              {/* レビュー情報 */}
              {request.reviewedBy && (
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-400 mb-1">レビュー結果</div>
                  <div className="text-sm text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{request.reviewedBy.name}</span>
                      <span className="text-gray-500">
                        {request.reviewedDate && new Date(request.reviewedDate).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {request.reviewNotes && (
                      <div className="text-gray-300 mt-2">{request.reviewNotes}</div>
                    )}
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/proposal-document/${request.documentId}`)}
                  className="flex-1 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  提案書を確認
                </button>

                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(request)}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      承認して提出
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      却下
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// ステータスバッジ
const StatusBadge: React.FC<{ status: SubmissionRequest['status'] }> = ({ status }) => {
  const config = {
    pending: { label: 'レビュー待ち', color: 'bg-yellow-900/30 text-yellow-400', icon: Clock },
    approved: { label: '承認済み', color: 'bg-green-900/30 text-green-400', icon: CheckCircle },
    rejected: { label: '却下', color: 'bg-red-900/30 text-red-400', icon: XCircle }
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <span className={`px-3 py-1 rounded text-xs font-medium ${color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default CommitteeSubmissionApprovalPage;
