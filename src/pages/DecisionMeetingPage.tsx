/**
 * 決定会議ページ（レベル13：院長・施設長専用）
 * 運営委員会からの議題を最終決定
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { DecisionAgenda, DecisionMeetingStats } from '../types/decisionMeeting';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Card } from '../components/ui/Card';
import {
  Gavel, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle,
  Pause, Calendar, DollarSign, Users, FileText, Building2, Award,
  Zap, ArrowRight
} from 'lucide-react';

// API Functions
const API_BASE = 'http://localhost:4000';

async function fetchDecisionAgendas(status?: string, priority?: string, month?: string): Promise<{ agendas: DecisionAgenda[], stats: DecisionMeetingStats }> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (month) params.append('month', month);

  const url = `${API_BASE}/api/decision-agendas${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch decision agendas: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    agendas: data.agendas.map((a: any) => ({
      ...a,
      proposedDate: new Date(a.proposedDate),
      scheduledDate: a.scheduledDate ? new Date(a.scheduledDate) : undefined,
      decidedDate: a.decidedDate ? new Date(a.decidedDate) : undefined
    })),
    stats: data.stats
  };
}

async function decideAgenda(agendaId: string, action: 'approve' | 'reject' | 'defer', userId: string, notes?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/decision-agendas/${agendaId}/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, userId, notes })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to decide agenda');
  }

  return response.json();
}

async function startReview(agendaId: string, userId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/decision-agendas/${agendaId}/start-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start review');
  }

  return response.json();
}

type TabType = 'all' | 'pending' | 'in_review' | 'this_month';

const DecisionMeetingPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedAgenda, setSelectedAgenda] = useState<DecisionAgenda | null>(null);

  // タブに基づくフィルタパラメータ
  const getFilterParams = () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    switch (activeTab) {
      case 'pending':
        return { status: 'pending' };
      case 'in_review':
        return { status: 'in_review' };
      case 'this_month':
        return { month };
      default:
        return {};
    }
  };

  const filterParams = getFilterParams();

  // データ取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['decisionAgendas', filterParams],
    queryFn: () => fetchDecisionAgendas(filterParams.status, undefined, filterParams.month)
  });

  const agendas = data?.agendas || [];
  const stats = data?.stats || null;

  // 決定アクションのMutation
  const decideMutation = useMutation({
    mutationFn: ({ agendaId, action, notes }: { agendaId: string, action: 'approve' | 'reject' | 'defer', notes?: string }) =>
      decideAgenda(agendaId, action, activeUser?.id || '', notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionAgendas'] });
      setSelectedAgenda(null);
    }
  });

  // 審議開始のMutation
  const startReviewMutation = useMutation({
    mutationFn: (agendaId: string) => startReview(agendaId, activeUser?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionAgendas'] });
    }
  });

  const getTypeLabel = (type: DecisionAgenda['type']) => {
    const labels = {
      committee_proposal: '委員会提案',
      facility_policy: '施設方針',
      personnel: '重要人事',
      budget: '予算承認',
      equipment: '設備投資',
      other: 'その他'
    };
    return labels[type];
  };

  const getTypeIcon = (type: DecisionAgenda['type']) => {
    const icons = {
      committee_proposal: <FileText className="w-4 h-4" />,
      facility_policy: <Building2 className="w-4 h-4" />,
      personnel: <Users className="w-4 h-4" />,
      budget: <DollarSign className="w-4 h-4" />,
      equipment: <Award className="w-4 h-4" />,
      other: <FileText className="w-4 h-4" />
    };
    return icons[type];
  };

  const getStatusColor = (status: DecisionAgenda['status']) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_review: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      deferred: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status];
  };

  const getStatusLabel = (status: DecisionAgenda['status']) => {
    const labels = {
      pending: '審議待ち',
      in_review: '審議中',
      approved: '承認',
      rejected: '却下',
      deferred: '保留'
    };
    return labels[status];
  };

  const getPriorityIcon = (priority: DecisionAgenda['priority']) => {
    const icons = {
      urgent: <Zap className="w-4 h-4 text-red-400" />,
      high: <ArrowRight className="w-4 h-4 text-orange-400" />,
      normal: <ArrowRight className="w-4 h-4 text-gray-400" />,
      low: <ArrowRight className="w-4 h-4 text-gray-600" />
    };
    return icons[priority];
  };

  const formatCurrency = (amount: number) => {
    return `¥${(amount / 1000000).toFixed(1)}M`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredAgendas = () => {
    return agendas;
  };

  const handleApprove = () => {
    if (!selectedAgenda || !activeUser) return;

    const notes = prompt('承認コメント（任意）');
    if (notes === null) return; // キャンセル

    decideMutation.mutate({
      agendaId: selectedAgenda.id,
      action: 'approve',
      notes: notes || undefined
    });

    alert(`✅ 議題を承認しました\n\n${selectedAgenda.title}`);
  };

  const handleReject = () => {
    if (!selectedAgenda || !activeUser) return;

    const reason = prompt('却下理由を入力してください（必須）');
    if (!reason) return;

    decideMutation.mutate({
      agendaId: selectedAgenda.id,
      action: 'reject',
      notes: reason
    });

    alert(`❌ 議題を却下しました\n\n${selectedAgenda.title}`);
  };

  const handleDefer = () => {
    if (!selectedAgenda || !activeUser) return;

    const reason = prompt('保留理由を入力してください（必須）');
    if (!reason) return;

    decideMutation.mutate({
      agendaId: selectedAgenda.id,
      action: 'defer',
      notes: reason
    });

    alert(`⏸️ 議題を保留しました\n\n${selectedAgenda.title}`);
  };

  const handleStartReview = (id: string) => {
    startReviewMutation.mutate(id);
    alert('審議を開始しました');
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/50 p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 text-center mb-2">エラーが発生しました</h2>
          <p className="text-gray-300 text-center">{(error as Error).message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          決定会議
        </h1>
        <p className="text-gray-300">
          院長専用 - 運営委員会からの議題を最終決定
        </p>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div className="mx-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Gavel className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">総議題数</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalAgendas}</div>
              <div className="text-xs text-gray-400 mt-1">
                今月: {stats.thisMonthDecisions}件決定
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">審議待ち</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.pendingCount}</div>
              <div className="text-xs text-red-400 mt-1">
                緊急: {stats.urgentCount}件
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-semibold text-white">承認済み</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.approvedCount}</div>
              <div className="text-xs text-green-400 mt-1">
                承認率: {Math.round(stats.approvalRate)}%
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-semibold text-white">却下</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.rejectedCount}</div>
              <div className="text-xs text-gray-400 mt-1">
                保留: {stats.deferredCount}件
              </div>
            </Card>

            <Card className="bg-gray-800/50 p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">平均決定日数</h3>
              </div>
              <div className="text-3xl font-bold text-white">{stats.averageDecisionDays}</div>
              <div className="text-xs text-gray-400 mt-1">日</div>
            </Card>
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 border-b border-gray-700/50">
          {[
            { id: 'pending', label: '審議待ち', count: stats?.pendingCount || 0 },
            { id: 'in_review', label: '審議中', count: agendas.filter(a => a.status === 'in_review').length },
            { id: 'this_month', label: '今月決定', count: stats?.thisMonthDecisions || 0 },
            { id: 'all', label: '全議題', count: stats?.totalAgendas || 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors border-b-2
                ${activeTab === tab.id
                  ? 'text-purple-400 border-purple-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* 議題一覧 */}
      <div className="mx-6 mb-6 space-y-4">
        {getFilteredAgendas().map(agenda => (
          <Card
            key={agenda.id}
            className="bg-gray-800/50 p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedAgenda(agenda)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPriorityIcon(agenda.priority)}
                  <h3 className="text-xl font-bold text-white">{agenda.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(agenda.status)}`}>
                    {getStatusLabel(agenda.status)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{agenda.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    {getTypeIcon(agenda.type)}
                    {getTypeLabel(agenda.type)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    提案: {formatDate(agenda.proposedDate)}
                  </span>
                  {agenda.scheduledDate && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Clock className="w-4 h-4" />
                      審議予定: {formatDate(agenda.scheduledDate)}
                    </span>
                  )}
                  {agenda.impact.estimatedCost && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(agenda.impact.estimatedCost)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 提案元 */}
            <div className="mb-3 text-sm">
              <span className="text-gray-500">提案元: </span>
              <span className="text-white font-medium">{agenda.proposedBy}</span>
              <span className="text-gray-500 ml-2">（{agenda.proposerDepartment}）</span>
            </div>

            {/* 影響範囲 */}
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">期待される効果</div>
              <div className="text-sm text-white">{agenda.impact.expectedEffect}</div>
            </div>

            {/* アクションボタン（審議待ちの場合のみ） */}
            {agenda.status === 'pending' && (
              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartReview(agenda.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  審議を開始
                </button>
              </div>
            )}
          </Card>
        ))}

        {getFilteredAgendas().length === 0 && (
          <Card className="bg-gray-800/50 p-12 border border-gray-700/50 text-center">
            <Gavel className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">議題がありません</h3>
            <p className="text-gray-500">該当する議題はありません</p>
          </Card>
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedAgenda && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAgenda(null)}
        >
          <Card
            className="bg-gray-800 p-6 border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedAgenda.title}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${getStatusColor(selectedAgenda.status)}`}>
                    {getStatusLabel(selectedAgenda.status)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {getTypeLabel(selectedAgenda.type)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgenda(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 概要 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">概要</h3>
              <p className="text-gray-300">{selectedAgenda.description}</p>
            </div>

            {/* 背景 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">背景・経緯</h3>
              <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{selectedAgenda.background}</p>
            </div>

            {/* 提案元情報 */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">提案元</div>
                <div className="text-white font-medium">{selectedAgenda.proposedBy}</div>
                <div className="text-sm text-gray-500">{selectedAgenda.proposerDepartment}</div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">提案日</div>
                <div className="text-white font-medium">{formatDate(selectedAgenda.proposedDate)}</div>
                {selectedAgenda.scheduledDate && (
                  <div className="text-sm text-yellow-400 mt-1">
                    審議予定: {formatDate(selectedAgenda.scheduledDate)}
                  </div>
                )}
              </div>
            </div>

            {/* 影響分析 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">影響分析</h3>
              <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">影響を受ける部署</div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedAgenda.impact.departments.map(dept => (
                      <span key={dept} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedAgenda.impact.estimatedCost && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">予算影響</div>
                    <div className="text-xl font-bold text-yellow-400">
                      {formatCurrency(selectedAgenda.impact.estimatedCost)}
                    </div>
                  </div>
                )}
                {selectedAgenda.impact.implementationPeriod && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">実施期間</div>
                    <div className="text-white">{selectedAgenda.impact.implementationPeriod}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-400 mb-1">期待される効果</div>
                  <div className="text-white">{selectedAgenda.impact.expectedEffect}</div>
                </div>
              </div>
            </div>

            {/* 議事録 */}
            {selectedAgenda.meetingMinutes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">審議内容</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">出席者</div>
                    <div className="text-white text-sm">
                      {selectedAgenda.meetingMinutes.attendees.join('、')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">議論内容</div>
                    <div className="text-white text-sm">{selectedAgenda.meetingMinutes.discussion}</div>
                  </div>
                  {selectedAgenda.meetingMinutes.concerns.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">懸念事項</div>
                      <ul className="space-y-1">
                        {selectedAgenda.meetingMinutes.concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-yellow-300">• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAgenda.meetingMinutes.conditions && selectedAgenda.meetingMinutes.conditions.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">承認条件</div>
                      <ul className="space-y-1">
                        {selectedAgenda.meetingMinutes.conditions.map((condition, idx) => (
                          <li key={idx} className="text-sm text-green-300">✓ {condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 決定情報 */}
            {selectedAgenda.decidedDate && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">決定内容</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">決定者</div>
                      <div className="text-white">{selectedAgenda.decidedBy}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">決定日</div>
                      <div className="text-white">{formatDate(selectedAgenda.decidedDate)}</div>
                    </div>
                  </div>
                  {selectedAgenda.decisionNotes && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">決定理由・コメント</div>
                      <div className="text-white">{selectedAgenda.decisionNotes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            {(selectedAgenda.status === 'pending' || selectedAgenda.status === 'in_review') && (
              <div className="flex gap-3 pt-6 border-t border-gray-700">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  承認
                </button>
                <button
                  onClick={handleDefer}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Pause className="w-5 h-5" />
                  保留
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  却下
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default DecisionMeetingPage;
