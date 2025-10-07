/**
 * 委員会管理ページ（レベル7+）
 * 委員会関連の統合管理機能
 * - 委員会提出リクエストの承認・却下
 * - 委員会一覧・カレンダー
 * - 議題一覧
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
  Calendar, User, Building2, ChevronRight, LayoutGrid, List,
  Users, Briefcase
} from 'lucide-react';

type TabType = 'requests' | 'agenda' | 'calendar' | 'committees';

export const CommitteeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('requests');
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

  // Level 7 未満はアクセス不可
  if (!activeUser.permissionLevel || activeUser.permissionLevel < 7) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 max-w-md">
        <div className="flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">アクセス権限がありません</h2>
        <p className="text-gray-400 text-center">
          委員会管理には Level 7 以上の権限が必要です
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
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    totalCommittees: 8, // デモデータ
    upcomingMeetings: 3 // デモデータ
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          委員会管理
        </h1>
        <p className="text-gray-300 mb-4">
          委員会提出承認、議題管理、委員会運営の統合管理
        </p>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingRequests}</div>
            <div className="text-xs text-yellow-300">承認待ち</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.approvedRequests}</div>
            <div className="text-xs text-green-300">承認済み</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{stats.totalCommittees}</div>
            <div className="text-xs text-blue-300">委員会数</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{stats.upcomingMeetings}</div>
            <div className="text-xs text-purple-300">予定会議</div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mx-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Send className="w-4 h-4" />
            提出承認
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'agenda'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            議題一覧
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            カレンダー
          </button>
          <button
            onClick={() => setActiveTab('committees')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'committees'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            委員会一覧
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="mx-6 pb-24">
        {/* 提出承認タブ */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* フィルター */}
            <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2">
              <button
                onClick={() => setFilter('pending')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ⏳ 承認待ち
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                📋 全て
              </button>
            </div>

            {/* リクエスト一覧 */}
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-400">提出リクエストがありません</p>
              </div>
            ) : (
              requests.map(request => (
                <div
                  key={request.id}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{request.proposalTitle}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          request.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {request.status === 'pending' ? '承認待ち' :
                           request.status === 'approved' ? '承認済み' : '却下'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {request.requesterName} (Level {request.requesterLevel})
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {request.targetCommittee}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {request.requestedAt.toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && activeUser.permissionLevel && activeUser.permissionLevel >= 8 && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(request)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        承認
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        却下
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 議題一覧タブ */}
        {activeTab === 'agenda' && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-400">議題一覧機能は開発中です</p>
            <p className="text-sm text-gray-500 mt-2">
              承認済み議題の一覧・検索・フィルター機能を実装予定
            </p>
          </div>
        )}

        {/* カレンダータブ */}
        {activeTab === 'calendar' && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl text-gray-400">委員会カレンダー機能は開発中です</p>
            <p className="text-sm text-gray-500 mt-2">
              委員会開催予定、議題スケジュール管理機能を実装予定
            </p>
          </div>
        )}

        {/* 委員会一覧タブ */}
        {activeTab === 'committees' && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">🏛️</div>
            <p className="text-xl text-gray-400">委員会一覧機能は開発中です</p>
            <p className="text-sm text-gray-500 mt-2">
              委員会情報、メンバー管理、開催履歴機能を実装予定
            </p>
          </div>
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default CommitteeManagementPage;
