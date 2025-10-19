/**
 * 運営委員会ページ（レベル10+：部長以上）
 * 施設レベルの意思決定機関
 * - 議事録管理
 * - 決定事項の追跡
 * - 委員会メンバー管理
 * - 議題の承認・決定フロー
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import {
  FileText, Calendar, Users, CheckCircle, AlertCircle,
  Clock, TrendingUp, Award, Target, ChevronRight, Download
} from 'lucide-react';

type TabType = 'agenda' | 'minutes' | 'decisions' | 'members';

interface CommitteeAgenda {
  id: string;
  title: string;
  proposer: string;
  department: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  scheduledDate?: Date;
  summary: string;
}

interface CommitteeMinutes {
  id: string;
  date: Date;
  attendees: string[];
  agendas: string[];
  decisions: string[];
  nextMeeting: Date;
}

interface CommitteeDecision {
  id: string;
  title: string;
  decidedDate: Date;
  status: 'implementation' | 'monitoring' | 'completed';
  impact: string;
  responsible: string;
}

export const ManagementCommitteePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [activeTab, setActiveTab] = useState<TabType>('agenda');

  // デモデータ
  const demoAgendas: CommitteeAgenda[] = [
    {
      id: 'agenda-1',
      title: '夜勤シフト体制の見直しについて',
      proposer: '看護部 山田部長',
      department: '看護部',
      status: 'pending',
      priority: 'high',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      summary: '夜勤人員配置の最適化と労働環境改善を目的とした提案'
    },
    {
      id: 'agenda-2',
      title: '電子カルテシステムのUI改善',
      proposer: '情報システム部 田中課長',
      department: '情報システム部',
      status: 'in_review',
      priority: 'medium',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      summary: '職員からの意見を反映した使いやすさ向上施策'
    },
    {
      id: 'agenda-3',
      title: '院内研修プログラムの拡充',
      proposer: '人事部 佐藤部長',
      department: '人事部',
      status: 'approved',
      priority: 'medium',
      summary: '職員のスキルアップ支援と定着率向上を目的とした新プログラム'
    }
  ];

  const demoMinutes: CommitteeMinutes[] = [
    {
      id: 'minutes-1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      attendees: ['山田部長', '田中課長', '佐藤部長', '鈴木副院長'],
      agendas: ['夜勤体制見直し', '電子カルテ改善', '研修プログラム'],
      decisions: ['夜勤体制検討委員会の設置', '電子カルテUI改善プロジェクト承認'],
      nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const demoDecisions: CommitteeDecision[] = [
    {
      id: 'decision-1',
      title: '電子カルテUI改善プロジェクト',
      decidedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'implementation',
      impact: '全職員（500名）',
      responsible: '情報システム部'
    },
    {
      id: 'decision-2',
      title: '新人研修プログラム導入',
      decidedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'monitoring',
      impact: '新入職員（年間50名）',
      responsible: '人事部'
    }
  ];

  if (!activeUser) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">読み込み中...</div>
    </div>;
  }

  // Level 10 未満はアクセス不可
  if (!activeUser.permissionLevel || activeUser.permissionLevel < 10) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 max-w-md">
        <div className="flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">アクセス権限がありません</h2>
        <p className="text-gray-400 text-center">
          運営委員会には Level 10 以上（部長職以上）の権限が必要です
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
    pendingAgendas: demoAgendas.filter(a => a.status === 'pending').length,
    approvedAgendas: demoAgendas.filter(a => a.status === 'approved').length,
    activeDecisions: demoDecisions.filter(d => d.status === 'implementation').length,
    totalMembers: 12
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>
          運営委員会
        </h1>
        <p className="text-gray-300 mb-4">
          施設運営の最高意思決定機関 - 議題審議・決定・進捗管理
        </p>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingAgendas}</div>
            <div className="text-xs text-yellow-300">審議待ち議題</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.approvedAgendas}</div>
            <div className="text-xs text-green-300">承認済み議題</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{stats.activeDecisions}</div>
            <div className="text-xs text-blue-300">実施中の決定事項</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{stats.totalMembers}</div>
            <div className="text-xs text-purple-300">委員会メンバー</div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mx-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'agenda'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            議題管理
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'minutes'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            議事録
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'decisions'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            決定事項
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
              activeTab === 'members'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            委員
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="mx-6 pb-24">
        {/* 議題管理タブ */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            {demoAgendas.map(agenda => (
              <div
                key={agenda.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{agenda.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agenda.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                        agenda.status === 'in_review' ? 'bg-blue-900/30 text-blue-400' :
                        agenda.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {agenda.status === 'pending' ? '審議待ち' :
                         agenda.status === 'in_review' ? '審議中' :
                         agenda.status === 'approved' ? '承認' : '却下'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agenda.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                        agenda.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {agenda.priority === 'high' ? '高' :
                         agenda.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>提案者: {agenda.proposer}</div>
                      <div>部署: {agenda.department}</div>
                      <div>{agenda.summary}</div>
                      {agenda.scheduledDate && (
                        <div className="flex items-center gap-2 text-purple-400">
                          <Calendar className="w-4 h-4" />
                          予定: {agenda.scheduledDate.toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 議事録タブ */}
        {activeTab === 'minutes' && (
          <div className="space-y-4">
            {demoMinutes.map(minutes => (
              <div
                key={minutes.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {minutes.date.toLocaleDateString('ja-JP')} 運営委員会
                  </h3>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">出席者</div>
                    <div className="text-white">{minutes.attendees.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">審議議題</div>
                    <ul className="text-white list-disc list-inside">
                      {minutes.agendas.map((agenda, i) => (
                        <li key={i}>{agenda}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">決定事項</div>
                    <ul className="text-white list-disc list-inside">
                      {minutes.decisions.map((decision, i) => (
                        <li key={i}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-gray-700/50">
                    <div className="text-purple-400">
                      次回開催: {minutes.nextMeeting.toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 決定事項タブ */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            {demoDecisions.map(decision => (
              <div
                key={decision.id}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{decision.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        decision.status === 'implementation' ? 'bg-blue-900/30 text-blue-400' :
                        decision.status === 'monitoring' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {decision.status === 'implementation' ? '実施中' :
                         decision.status === 'monitoring' ? '監視中' : '完了'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>決定日: {decision.decidedDate.toLocaleDateString('ja-JP')}</div>
                      <div>影響範囲: {decision.impact}</div>
                      <div>担当: {decision.responsible}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 委員タブ */}
        {activeTab === 'members' && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-xl text-gray-400">委員会メンバー管理機能は開発中です</p>
            <p className="text-sm text-gray-500 mt-2">
              委員一覧、役割管理、任期管理機能を実装予定
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

export default ManagementCommitteePage;
