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
import { managementCommitteeService } from '../services/ManagementCommitteeService';
import { ManagementCommitteeAgenda, CommitteeData, MeetingSchedule } from '../types/committee';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import {
  Send, CheckCircle, XCircle, Clock, AlertCircle, FileText,
  Calendar, User, Building2, ChevronRight, LayoutGrid, List,
  Users, Briefcase, Search, Filter, TrendingUp, MapPin
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

  // 議題一覧用のstate
  const [agendas, setAgendas] = useState<ManagementCommitteeAgenda[]>([]);
  const [agendaFilter, setAgendaFilter] = useState<{
    status?: ManagementCommitteeAgenda['status'];
    priority?: ManagementCommitteeAgenda['priority'];
    agendaType?: ManagementCommitteeAgenda['agendaType'];
    searchQuery?: string;
  }>({});

  // 委員会一覧用のstate
  const [committees, setCommittees] = useState<CommitteeData[]>([]);

  // カレンダー用のstate
  const [meetings, setMeetings] = useState<MeetingSchedule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeUser) {
      loadRequests();
      loadAgendas();
      loadCommittees();
      loadMeetings();
    }
  }, [activeUser, filter, agendaFilter, selectedMonth, selectedYear]);

  const loadRequests = () => {
    if (filter === 'pending') {
      setRequests(committeeSubmissionService.getPendingRequests());
    } else {
      setRequests(committeeSubmissionService.getAllRequests());
    }
  };

  const loadAgendas = () => {
    setAgendas(managementCommitteeService.getAgendas(agendaFilter));
  };

  const loadCommittees = () => {
    setCommittees(managementCommitteeService.getCommittees());
  };

  const loadMeetings = () => {
    setMeetings(managementCommitteeService.getMeetings(selectedMonth, selectedYear));
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

  // アクセス権限チェック - Level 7以上でアクセス可能
  // Level 7-9: 閲覧のみ
  // Level 8+: 提出承認
  // Level 10+: 運営委員会メンバー（全機能）
  const canApproveSubmissions = activeUser.permissionLevel && activeUser.permissionLevel >= 8;
  const isCommitteeMember = activeUser.permissionLevel && activeUser.permissionLevel >= 10;

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
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-xs text-blue-400 mb-2">必要な権限レベル</div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>• Level 7-9: 議題閲覧、委員会情報閲覧</div>
            <div>• Level 8+: 提出リクエスト承認</div>
            <div>• Level 10+: 運営委員会メンバー（全機能）</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>;
  }

  const committeeStats = managementCommitteeService.getStats();
  const stats = {
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    totalCommittees: committeeStats.committeeCount,
    upcomingMeetings: committeeStats.upcomingMeetings
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6 m-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">🏛️</span>
              委員会管理
            </h1>
            <p className="text-gray-300 mb-2">
              委員会提出承認、議題管理、委員会運営の統合管理
            </p>

            {/* 権限レベル別ヘルプ */}
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded font-medium ${
                  isCommitteeMember ? 'bg-purple-600 text-white' :
                  canApproveSubmissions ? 'bg-blue-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  Level {activeUser.permissionLevel}
                </span>
                <span className="text-gray-300">
                  {isCommitteeMember ? '運営委員会メンバー - 全機能利用可能' :
                   canApproveSubmissions ? '課長以上 - 提出承認・議題閲覧可能' :
                   '主任・係長 - 議題閲覧・委員会情報確認可能'}
                </span>
              </div>
            </div>
          </div>
        </div>

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

                  {request.status === 'pending' && (
                    <>
                      {canApproveSubmissions ? (
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
                      ) : (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
                          <div className="text-sm text-yellow-400">
                            ⚠️ Level 8以上の権限が必要です
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 議題一覧タブ */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            {/* 検索とフィルター */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              {/* 検索バー */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="議題タイトル、提案者、説明で検索..."
                  value={agendaFilter.searchQuery || ''}
                  onChange={(e) => setAgendaFilter({ ...agendaFilter, searchQuery: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* フィルターボタン */}
              <div className="flex gap-2 flex-wrap">
                {/* ステータスフィルター */}
                <select
                  value={agendaFilter.status || ''}
                  onChange={(e) => setAgendaFilter({ ...agendaFilter, status: e.target.value as any || undefined })}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">全ステータス</option>
                  <option value="pending">審議待ち</option>
                  <option value="in_review">審議中</option>
                  <option value="approved">承認</option>
                  <option value="rejected">却下</option>
                  <option value="deferred">保留</option>
                </select>

                {/* 優先度フィルター */}
                <select
                  value={agendaFilter.priority || ''}
                  onChange={(e) => setAgendaFilter({ ...agendaFilter, priority: e.target.value as any || undefined })}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">全優先度</option>
                  <option value="urgent">緊急</option>
                  <option value="high">高</option>
                  <option value="normal">通常</option>
                  <option value="low">低</option>
                </select>

                {/* 議題タイプフィルター */}
                <select
                  value={agendaFilter.agendaType || ''}
                  onChange={(e) => setAgendaFilter({ ...agendaFilter, agendaType: e.target.value as any || undefined })}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">全タイプ</option>
                  <option value="committee_proposal">委員会提案</option>
                  <option value="facility_policy">施設方針</option>
                  <option value="personnel">人事</option>
                  <option value="budget">予算</option>
                  <option value="equipment">設備</option>
                  <option value="other">その他</option>
                </select>

                {/* リセットボタン */}
                {(agendaFilter.status || agendaFilter.priority || agendaFilter.agendaType || agendaFilter.searchQuery) && (
                  <button
                    onClick={() => setAgendaFilter({})}
                    className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                  >
                    フィルタークリア
                  </button>
                )}
              </div>

              {/* 件数表示 */}
              <div className="text-sm text-gray-400">
                {agendas.length}件の議題
              </div>
            </div>

            {/* 議題リスト */}
            {agendas.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl text-gray-400">該当する議題がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agendas.map(agenda => (
                  <div
                    key={agenda.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{agenda.title}</h3>

                          {/* ステータスバッジ */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            agenda.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                            agenda.status === 'in_review' ? 'bg-blue-900/30 text-blue-400' :
                            agenda.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                            agenda.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}>
                            {agenda.status === 'pending' ? '審議待ち' :
                             agenda.status === 'in_review' ? '審議中' :
                             agenda.status === 'approved' ? '承認' :
                             agenda.status === 'rejected' ? '却下' : '保留'}
                          </span>

                          {/* 優先度バッジ */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            agenda.priority === 'urgent' ? 'bg-red-900/30 text-red-400' :
                            agenda.priority === 'high' ? 'bg-orange-900/30 text-orange-400' :
                            agenda.priority === 'normal' ? 'bg-blue-900/30 text-blue-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}>
                            {agenda.priority === 'urgent' ? '🔥 緊急' :
                             agenda.priority === 'high' ? '⚠️ 高' :
                             agenda.priority === 'normal' ? '📌 通常' : '📋 低'}
                          </span>

                          {/* タイプバッジ */}
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-900/30 text-purple-400">
                            {agenda.agendaType === 'committee_proposal' ? '委員会提案' :
                             agenda.agendaType === 'facility_policy' ? '施設方針' :
                             agenda.agendaType === 'personnel' ? '人事' :
                             agenda.agendaType === 'budget' ? '予算' :
                             agenda.agendaType === 'equipment' ? '設備' : 'その他'}
                          </span>
                        </div>

                        <p className="text-gray-300 text-sm mb-3">{agenda.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            提案: {agenda.proposedBy} ({agenda.proposerDepartment})
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {agenda.proposedDate.toLocaleDateString('ja-JP')}
                          </div>
                          {agenda.decidedDate && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              決定: {agenda.decidedDate.toLocaleDateString('ja-JP')}
                            </div>
                          )}
                          {agenda.estimatedCost && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              予算: ¥{agenda.estimatedCost.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {/* 影響部署 */}
                        {agenda.impactDepartments.length > 0 && (
                          <div className="mt-2 flex items-start gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {agenda.impactDepartments.map((dept, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded text-xs">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 決定メモ */}
                        {agenda.decisionNotes && (
                          <div className="mt-3 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                            <div className="text-xs text-indigo-400 font-medium mb-1">決定事項</div>
                            <div className="text-sm text-gray-300">{agenda.decisionNotes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* カレンダータブ */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {/* 月選択 */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  会議スケジュール
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(selectedMonth - 1);
                      }
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-300 transform rotate-180" />
                  </button>
                  <div className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg font-medium min-w-[140px] text-center">
                    {selectedYear}年{selectedMonth + 1}月
                  </div>
                  <button
                    onClick={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(selectedYear + 1);
                      } else {
                        setSelectedMonth(selectedMonth + 1);
                      }
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMonth(new Date().getMonth());
                      setSelectedYear(new Date().getFullYear());
                    }}
                    className="ml-2 px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors text-sm"
                  >
                    今月
                  </button>
                </div>
              </div>
            </div>

            {/* 会議リスト */}
            {meetings.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-xl text-gray-400">この月に予定されている会議はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map(meeting => (
                  <div
                    key={meeting.id}
                    className={`bg-gray-800/50 rounded-xl p-4 border transition-all ${
                      meeting.status === 'scheduled' ? 'border-green-500/30 hover:border-green-500/50' :
                      meeting.status === 'in_progress' ? 'border-blue-500/30 hover:border-blue-500/50' :
                      meeting.status === 'completed' ? 'border-gray-700/50' :
                      'border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* ヘッダー */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex flex-col items-center bg-indigo-900/30 rounded-lg p-2 min-w-[60px]">
                            <div className="text-xs text-indigo-400">
                              {meeting.date.toLocaleDateString('ja-JP', { month: 'short' })}
                            </div>
                            <div className="text-2xl font-bold text-indigo-300">
                              {meeting.date.getDate()}
                            </div>
                            <div className="text-xs text-indigo-400">
                              {meeting.date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{meeting.committeeName}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {meeting.date.toLocaleTimeString('ja-JP', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {meeting.venue}
                              </div>
                            </div>
                          </div>

                          {/* ステータスバッジ */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'scheduled' ? 'bg-green-900/30 text-green-400' :
                            meeting.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
                            meeting.status === 'completed' ? 'bg-gray-900/30 text-gray-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {meeting.status === 'scheduled' ? '予定' :
                             meeting.status === 'in_progress' ? '進行中' :
                             meeting.status === 'completed' ? '完了' : '中止'}
                          </span>
                        </div>

                        {/* 議題数 */}
                        <div className="flex items-center gap-2 mt-3 p-3 bg-purple-900/20 rounded-lg">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-300">
                            審議予定議題: <span className="font-bold">{meeting.agendaCount}件</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* カレンダー統計 */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                今月の統計
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">予定会議数</div>
                  <div className="text-2xl font-bold text-green-400">
                    {meetings.filter(m => m.status === 'scheduled').length}件
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">審議予定議題</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {meetings.reduce((sum, m) => sum + m.agendaCount, 0)}件
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">完了会議</div>
                  <div className="text-2xl font-bold text-gray-400">
                    {meetings.filter(m => m.status === 'completed').length}件
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 委員会一覧タブ */}
        {activeTab === 'committees' && (
          <div className="space-y-4">
            {/* 委員会リスト */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {committees.map(committee => (
                <div
                  key={committee.id}
                  className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-indigo-500/30 transition-all"
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{committee.name}</h3>
                      <p className="text-sm text-gray-400">{committee.description}</p>
                    </div>
                    <div className="text-3xl">🏛️</div>
                  </div>

                  {/* 統計情報 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-900/20 rounded-lg p-3">
                      <div className="text-xs text-blue-400 mb-1">メンバー数</div>
                      <div className="text-2xl font-bold text-blue-300">{committee.memberCount}名</div>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-3">
                      <div className="text-xs text-purple-400 mb-1">総開催回数</div>
                      <div className="text-2xl font-bold text-purple-300">{committee.totalMeetings}回</div>
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">委員長</span>
                      <span className="text-white font-medium">{committee.chairperson}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">審議中議題</span>
                      <span className="text-yellow-400 font-medium">{committee.activeAgendas}件</span>
                    </div>
                    {committee.nextMeetingDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">次回開催</span>
                        <span className="text-green-400 font-medium">
                          {committee.nextMeetingDate.toLocaleDateString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => {
                        // 議題一覧タブに移動して、この委員会の議題を表示
                        setActiveTab('agenda');
                        setAgendaFilter({ searchQuery: committee.name });
                      }}
                      className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      議題を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 委員会統計サマリー */}
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                委員会活動サマリー
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">総委員会数</div>
                  <div className="text-2xl font-bold text-white">{committees.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">総メンバー数</div>
                  <div className="text-2xl font-bold text-white">
                    {committees.reduce((sum, c) => sum + c.memberCount, 0)}名
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">審議中議題</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {committees.reduce((sum, c) => sum + c.activeAgendas, 0)}件
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">予定会議</div>
                  <div className="text-2xl font-bold text-green-400">
                    {committees.filter(c => c.nextMeetingDate && c.nextMeetingDate > new Date()).length}件
                  </div>
                </div>
              </div>
            </div>
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
