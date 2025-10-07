import React, { useState } from 'react';
import { FileText, Calendar, Users, CheckCircle, AlertCircle, TrendingUp, FileSpreadsheet, Presentation, Send, Eye, Edit3 } from 'lucide-react';

/**
 * 理事会準備ページ
 *
 * 対象: レベル17（戦略企画・統括管理部門長）
 * 目的: エグゼクティブレポートから理事会議題を選定し、理事会資料を準備
 */

interface BoardAgendaItem {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  preparedBy: string;
  status: 'draft' | 'reviewing' | 'approved' | 'finalized';
  documentsReady: boolean;
  presentationReady: boolean;
  estimatedTime: number; // minutes
}

interface BoardMeetingInfo {
  date: string;
  time: string;
  location: string;
  attendees: number;
  expectedDuration: number; // minutes
  status: 'planning' | 'agenda_draft' | 'materials_ready' | 'confirmed';
}

export const BoardPreparationPage: React.FC = () => {
  const [selectedAgendaIds, setSelectedAgendaIds] = useState<string[]>([]);

  // 次回理事会情報
  const nextBoardMeeting: BoardMeetingInfo = {
    date: '2025年10月20日',
    time: '14:00',
    location: '本部会議室A',
    attendees: 12,
    expectedDuration: 120,
    status: 'materials_ready'
  };

  // 議題候補一覧（エグゼクティブレポートから）
  const agendaCandidates: BoardAgendaItem[] = [
    {
      id: 'agenda-1',
      title: '2025年度第2四半期 人事戦略報告',
      category: '人事戦略',
      priority: 'high',
      source: '月次議題化プロセスレポート',
      preparedBy: '戦略企画部',
      status: 'finalized',
      documentsReady: true,
      presentationReady: true,
      estimatedTime: 20
    },
    {
      id: 'agenda-2',
      title: '施設間人材配置最適化提案',
      category: '組織改善',
      priority: 'high',
      source: '組織分析レポート',
      preparedBy: '戦略企画部',
      status: 'approved',
      documentsReady: true,
      presentationReady: false,
      estimatedTime: 15
    },
    {
      id: 'agenda-3',
      title: '職員エンゲージメント向上施策の中間報告',
      category: 'カルチャー開発',
      priority: 'medium',
      source: 'カルチャー開発委員会',
      preparedBy: '人事部',
      status: 'reviewing',
      documentsReady: true,
      presentationReady: true,
      estimatedTime: 10
    },
    {
      id: 'agenda-4',
      title: '委員会制度改革の進捗と成果',
      category: 'ガバナンス',
      priority: 'medium',
      source: '委員会効果測定レポート',
      preparedBy: '戦略企画部',
      status: 'approved',
      documentsReady: true,
      presentationReady: true,
      estimatedTime: 15
    },
    {
      id: 'agenda-5',
      title: 'VoiceDrive議題化プロセス導入成果報告',
      category: 'システム改善',
      priority: 'high',
      source: 'ボイス分析統括レポート',
      preparedBy: '人事部・戦略企画部',
      status: 'finalized',
      documentsReady: true,
      presentationReady: true,
      estimatedTime: 25
    },
    {
      id: 'agenda-6',
      title: '次年度予算編成方針（人事関連）',
      category: '予算',
      priority: 'high',
      source: '戦略HR計画',
      preparedBy: '戦略企画部',
      status: 'draft',
      documentsReady: false,
      presentationReady: false,
      estimatedTime: 20
    }
  ];

  // 資料準備状況
  const preparationStatus = {
    totalAgendas: agendaCandidates.length,
    finalized: agendaCandidates.filter(a => a.status === 'finalized').length,
    approved: agendaCandidates.filter(a => a.status === 'approved').length,
    reviewing: agendaCandidates.filter(a => a.status === 'reviewing').length,
    draft: agendaCandidates.filter(a => a.status === 'draft').length,
    documentsReady: agendaCandidates.filter(a => a.documentsReady).length,
    presentationsReady: agendaCandidates.filter(a => a.presentationReady).length
  };

  // 理事長への提案トピック
  const chairmanProposals = [
    {
      id: 'prop-1',
      title: '議題化プロセスの法人全体展開',
      description: '現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開することを提案します。',
      impact: '職員エンゲージメント向上、組織課題の早期発見・解決',
      requiredBudget: '約800万円',
      timeline: '2026年1月準備開始、4月本格運用',
      status: 'pending_review'
    },
    {
      id: 'prop-2',
      title: '施設間人材ローテーション制度の導入',
      description: '組織分析により判明した施設間の人材偏在を解消するため、定期的な人材ローテーション制度を提案します。',
      impact: 'スキル平準化、組織活性化、キャリア開発支援',
      requiredBudget: '約200万円（移動支援費）',
      timeline: '2026年4月第1回実施',
      status: 'draft'
    }
  ];

  // 議題化プロセス統括サマリー
  const agendaProcessSummary = {
    totalVoices: 1247,
    committeeReviewed: 342,
    executiveReported: 89,
    boardAgenda: 6,
    implementedActions: 127,
    avgProcessTime: '28日',
    participationRate: '68%'
  };

  const toggleAgendaSelection = (agendaId: string) => {
    if (selectedAgendaIds.includes(agendaId)) {
      setSelectedAgendaIds(selectedAgendaIds.filter(id => id !== agendaId));
    } else {
      setSelectedAgendaIds([...selectedAgendaIds, agendaId]);
    }
  };

  const getStatusColor = (status: BoardAgendaItem['status']) => {
    switch (status) {
      case 'finalized': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'reviewing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: BoardAgendaItem['status']) => {
    switch (status) {
      case 'finalized': return '確定';
      case 'approved': return '承認済';
      case 'reviewing': return 'レビュー中';
      case 'draft': return '草案';
    }
  };

  const getPriorityColor = (priority: BoardAgendaItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
    }
  };

  const totalEstimatedTime = agendaCandidates
    .filter(a => selectedAgendaIds.includes(a.id))
    .reduce((sum, a) => sum + a.estimatedTime, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">理事会準備</h1>
              <p className="text-gray-400">次回理事会の議題選定と資料準備を行います</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors flex items-center gap-2">
                <Eye className="w-4 h-4" />
                プレビュー
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                理事長へ提出
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 次回理事会情報 */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">次回理事会</h2>
                <p className="text-sm text-gray-400">第3回定例理事会</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">開催日時</p>
                <p className="text-lg font-medium">{nextBoardMeeting.date}</p>
                <p className="text-gray-400">{nextBoardMeeting.time}〜 （{nextBoardMeeting.expectedDuration}分予定）</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">開催場所</p>
                <p className="text-lg font-medium">{nextBoardMeeting.location}</p>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4" />
                  理事 {nextBoardMeeting.attendees}名出席予定
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 mb-2">準備状況</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <p className="text-sm text-green-400 mt-2">資料準備順調</p>
              </div>
            </div>
          </div>

          {/* 資料準備状況サマリー */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">資料準備状況</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">確定済み議題</span>
                <span className="text-xl font-bold text-green-400">{preparationStatus.finalized}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">承認済み議題</span>
                <span className="text-xl font-bold text-blue-400">{preparationStatus.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">レビュー中</span>
                <span className="text-xl font-bold text-yellow-400">{preparationStatus.reviewing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">草案</span>
                <span className="text-xl font-bold text-gray-400">{preparationStatus.draft}</span>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">報告書準備</span>
                  <span className="text-sm font-medium">{preparationStatus.documentsReady}/{preparationStatus.totalAgendas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">プレゼン資料</span>
                  <span className="text-sm font-medium">{preparationStatus.presentationsReady}/{preparationStatus.totalAgendas}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 議題候補一覧 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">議題候補一覧</h2>
                <p className="text-sm text-gray-400">エグゼクティブレポートから選定</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">選択中: {selectedAgendaIds.length}件</p>
              <p className="text-sm text-gray-400">予定時間: {totalEstimatedTime}分</p>
            </div>
          </div>

          <div className="space-y-4">
            {agendaCandidates.map((agenda) => (
              <div
                key={agenda.id}
                className={`bg-slate-900/50 rounded-lg p-4 border transition-all cursor-pointer ${
                  selectedAgendaIds.includes(agenda.id)
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
                onClick={() => toggleAgendaSelection(agenda.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={selectedAgendaIds.includes(agenda.id)}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xl ${getPriorityColor(agenda.priority)}`}>●</span>
                          <h3 className="text-lg font-medium">{agenda.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {agenda.category}
                          </span>
                          <span>出典: {agenda.source}</span>
                          <span>担当: {agenda.preparedBy}</span>
                          <span>予定時間: {agenda.estimatedTime}分</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(agenda.status)}`}>
                        {getStatusLabel(agenda.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        {agenda.documentsReady ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={`text-sm ${agenda.documentsReady ? 'text-green-400' : 'text-gray-500'}`}>
                          報告書
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {agenda.presentationReady ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={`text-sm ${agenda.presentationReady ? 'text-green-400' : 'text-gray-500'}`}>
                          プレゼン資料
                        </span>
                      </div>
                      <button className="ml-auto px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-sm transition-colors flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        編集
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 理事長への提案 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">理事長への提案</h2>
                <p className="text-sm text-gray-400">戦略的重要事項</p>
              </div>
            </div>

            <div className="space-y-4">
              {chairmanProposals.map((proposal) => (
                <div key={proposal.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-lg font-medium mb-2">{proposal.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{proposal.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">期待効果:</span>
                      <span className="text-right flex-1 ml-4">{proposal.impact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">必要予算:</span>
                      <span className="font-medium">{proposal.requiredBudget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">実施時期:</span>
                      <span>{proposal.timeline}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-sm text-yellow-400">レビュー待ち</span>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      提案書作成
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 議題化プロセス統括サマリー */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">議題化プロセス統括</h2>
                <p className="text-sm text-gray-400">職員の声から理事会まで</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">総投稿数</span>
                  <span className="text-2xl font-bold text-blue-400">{agendaProcessSummary.totalVoices.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">職員からの声・提案</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">委員会レビュー</span>
                  <span className="text-2xl font-bold text-purple-400">{agendaProcessSummary.committeeReviewed.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">各種委員会で検討</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">エグゼクティブ報告</span>
                  <span className="text-2xl font-bold text-yellow-400">{agendaProcessSummary.executiveReported.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">経営層への報告事項</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">理事会議題</span>
                  <span className="text-2xl font-bold text-green-400">{agendaProcessSummary.boardAgenda}</span>
                </div>
                <div className="text-sm text-gray-500">理事会での審議事項</div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg p-4 border border-blue-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">実施済みアクション</span>
                  <span className="text-2xl font-bold text-green-400">{agendaProcessSummary.implementedActions}</span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-gray-400">平均処理時間:</span>
                  <span className="font-medium">{agendaProcessSummary.avgProcessTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">職員参加率:</span>
                  <span className="font-medium">{agendaProcessSummary.participationRate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクション項目 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">理事会前の確認事項</h2>
              <p className="text-sm text-gray-400">最終チェックリスト</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium">資料最終確認</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">全議題の報告書・スライドを確認</p>
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                一括確認
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Presentation className="w-5 h-5 text-purple-400" />
                <h3 className="font-medium">事前配布</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">理事への資料事前配布</p>
              <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                配布実行
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <h3 className="font-medium">出席確認</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">理事の出席状況を確認</p>
              <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                確認状況
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Send className="w-5 h-5 text-yellow-400" />
                <h3 className="font-medium">理事長承認</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">アジェンダ最終承認依頼</p>
              <button className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors">
                承認依頼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
