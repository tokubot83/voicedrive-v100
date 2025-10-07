import React, { useState } from 'react';
import { FileText, Calendar, CheckCircle, AlertCircle, MessageSquare, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * 理事会議題確認
 *
 * 対象: レベル18（理事長・法人事務局長）
 * 目的: レベル17が準備した理事会議題を事前確認し、理事会前の論点整理を行う
 */

interface AgendaItem {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  preparedBy: string;
  source: string;
  summary: string;
  keyPoints: string[];
  expectedDiscussion: string;
  requiredDecision: string;
  documentsAttached: boolean;
  presentationReady: boolean;
  estimatedTime: number; // minutes
  chairmanReview: 'pending' | 'approved' | 'needs_revision' | 'rejected';
  chairmanComment?: string;
}

interface BoardMeeting {
  date: string;
  time: string;
  location: string;
  expectedAttendees: number;
  totalEstimatedTime: number;
}

export const BoardAgendaReviewPage: React.FC = () => {
  const [selectedAgenda, setSelectedAgenda] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});

  // 次回理事会情報
  const nextMeeting: BoardMeeting = {
    date: '2025年10月20日',
    time: '14:00',
    location: '本部会議室A',
    expectedAttendees: 12,
    totalEstimatedTime: 120
  };

  // 理事会議題一覧（レベル17が準備）
  const agendaItems: AgendaItem[] = [
    {
      id: 'agenda-1',
      title: '2025年度第2四半期 人事戦略報告',
      category: '人事戦略',
      priority: 'high',
      preparedBy: '戦略企画部',
      source: '月次議題化プロセスレポート',
      summary: 'Q2の人事施策実施状況、職員エンゲージメント指標、次四半期の重点課題を報告。VoiceDrive議題化プロセス導入により職員参加率が64%に向上。',
      keyPoints: [
        '職員エンゲージメントスコア: 74点（前期比+6点）',
        'VoiceDrive参加率: 64.3%（目標60%達成）',
        '議題化プロセス導入による組織課題の早期発見・解決',
        'Q3重点施策: 施設間人材ローテーション制度の試験導入'
      ],
      expectedDiscussion: '施設間ローテーション制度の具体的な運用方法、予算措置',
      requiredDecision: '施設間人材ローテーション制度の試験導入承認',
      documentsAttached: true,
      presentationReady: true,
      estimatedTime: 20,
      chairmanReview: 'pending'
    },
    {
      id: 'agenda-2',
      title: '施設間人材配置最適化提案',
      category: '組織改善',
      priority: 'high',
      preparedBy: '戦略企画部',
      source: '組織分析レポート',
      summary: '全10施設の人材配置分析の結果、夜勤帯の人員偏在が判明。施設横断での人材融通により、負担平準化と医療の質向上を図る。',
      keyPoints: [
        '6施設で夜勤時の人手不足が共通課題',
        '施設間での人材融通により月平均40時間の残業削減見込み',
        '職員のスキル向上とキャリア開発にも寄与',
        '初期投資: 約500万円、年間効果: 人件費効率化 約2,000万円'
      ],
      expectedDiscussion: '施設間移動の支援体制、職員の同意取得プロセス',
      requiredDecision: '2026年4月からの試験運用承認、予算措置',
      documentsAttached: true,
      presentationReady: false,
      estimatedTime: 15,
      chairmanReview: 'pending'
    },
    {
      id: 'agenda-3',
      title: '職員エンゲージメント向上施策の中間報告',
      category: 'カルチャー開発',
      priority: 'medium',
      preparedBy: '人事部',
      source: 'カルチャー開発委員会',
      summary: '2025年上半期のエンゲージメント向上施策の実施状況と成果を報告。メンター制度、チーム制勤務など複数施策を展開。',
      keyPoints: [
        '新人離職率: 35% → 12%（中央総合病院メンター制度）',
        '残業時間削減: 月平均18時間 → 12時間（桜ヶ丘総合病院チーム制勤務）',
        '成功事例の横展開により法人全体での効果拡大を計画',
        '下半期重点: 若手職員キャリアパス制度の整備'
      ],
      expectedDiscussion: '成功事例の他施設への展開スケジュール',
      requiredDecision: '特になし（情報共有）',
      documentsAttached: true,
      presentationReady: true,
      estimatedTime: 10,
      chairmanReview: 'approved',
      chairmanComment: '良好な成果。横展開を積極的に進めてください。'
    },
    {
      id: 'agenda-4',
      title: '委員会制度改革の進捗と成果',
      category: 'ガバナンス',
      priority: 'medium',
      preparedBy: '戦略企画部',
      source: '委員会効果測定レポート',
      summary: '議題化プロセスと連動した委員会制度改革の進捗報告。職員の声が委員会で適切に検討される仕組みを構築。',
      keyPoints: [
        '委員会レビュー案件: 342件（前年同期比+180%）',
        '委員会から経営層への提案: 89件（実施率67%）',
        '職員の声が組織改善につながる実感の向上',
        '今後の課題: 委員会間の連携強化、審議の効率化'
      ],
      expectedDiscussion: '委員会運営の効率化施策',
      requiredDecision: '特になし（進捗確認）',
      documentsAttached: true,
      presentationReady: true,
      estimatedTime: 15,
      chairmanReview: 'approved'
    },
    {
      id: 'agenda-5',
      title: 'VoiceDrive議題化プロセス導入成果報告',
      category: 'システム改善',
      priority: 'high',
      preparedBy: '人事部・戦略企画部',
      source: 'ボイス分析統括レポート',
      summary: 'VoiceDrive議題化プロセスの導入成果を総括。職員の声の可視化・組織化により、組織課題の早期発見と解決を実現。',
      keyPoints: [
        '総投稿数: 12,847件（全施設）、参加率: 64.3%',
        '解決済み案件: 7,541件（解決率58.7%）',
        '平均処理日数: 26.4日（目標30日以内達成）',
        '2026年4月より全10施設への本格展開を提案'
      ],
      expectedDiscussion: '全施設展開の予算、スケジュール、体制',
      requiredDecision: '2026年4月全施設展開の承認、予算約800万円の承認',
      documentsAttached: true,
      presentationReady: true,
      estimatedTime: 25,
      chairmanReview: 'pending'
    },
    {
      id: 'agenda-6',
      title: '次年度予算編成方針（人事関連）',
      category: '予算',
      priority: 'high',
      preparedBy: '戦略企画部',
      source: '戦略HR計画',
      summary: '2026年度の人事関連予算編成方針を提示。職員育成、システム投資、働き方改革施策への重点配分を提案。',
      keyPoints: [
        '総額: 前年比+12%（重点投資により組織強化）',
        '主要項目: VoiceDrive全施設展開、人材ローテーション制度、キャリアラダー制度',
        '期待効果: 離職率低下、生産性向上、職員満足度向上',
        '投資回収: 3年間で人件費効率化により投資額の150%回収見込み'
      ],
      expectedDiscussion: '予算規模の妥当性、優先順位',
      requiredDecision: '次年度予算編成方針の承認',
      documentsAttached: false,
      presentationReady: false,
      estimatedTime: 20,
      chairmanReview: 'needs_revision',
      chairmanComment: '具体的な数値根拠を補強してください。投資効果の試算をより詳細に。'
    }
  ];

  const getReviewStatusColor = (status: AgendaItem['chairmanReview']) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'needs_revision': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'pending': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getReviewStatusLabel = (status: AgendaItem['chairmanReview']) => {
    switch (status) {
      case 'approved': return '承認済';
      case 'needs_revision': return '修正依頼';
      case 'rejected': return '却下';
      case 'pending': return '確認待ち';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
    }
  };

  const handleReviewAction = (agendaId: string, action: 'approve' | 'revise' | 'reject') => {
    console.log(`Agenda ${agendaId}: ${action}`);
    // 実際の実装では、ここでAPIを呼び出してレビュー結果を保存
  };

  const totalTime = agendaItems.reduce((sum, item) => sum + item.estimatedTime, 0);
  const approvedCount = agendaItems.filter(item => item.status === 'approved').length;
  const pendingCount = agendaItems.filter(item => item.chairmanReview === 'pending').length;
  const needsRevisionCount = agendaItems.filter(item => item.chairmanReview === 'needs_revision').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">理事会議題確認</h1>
              <p className="text-gray-400">次回理事会の議題を事前確認し、論点を整理します</p>
            </div>
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">次回理事会</span>
            </div>
            <div className="text-2xl font-bold mb-1">{nextMeeting.date}</div>
            <p className="text-sm text-gray-400">{nextMeeting.time} / {nextMeeting.location}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">総議題数</span>
            </div>
            <div className="text-3xl font-bold mb-1">{agendaItems.length}件</div>
            <p className="text-sm text-gray-400">予定時間: {totalTime}分</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">承認済</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-green-400">{approvedCount}件</div>
            <p className="text-sm text-yellow-400">確認待ち: {pendingCount}件</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">要対応</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-yellow-400">{needsRevisionCount}件</div>
            <p className="text-sm text-gray-400">修正依頼中</p>
          </div>
        </div>

        {/* 議題一覧 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">議題一覧</h2>
          </div>

          <div className="space-y-4">
            {agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl ${getPriorityColor(agenda.priority)}`}>●</span>
                      <h3 className="text-lg font-medium">{agenda.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getReviewStatusColor(agenda.chairmanReview)}`}>
                        {getReviewStatusLabel(agenda.chairmanReview)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span>{agenda.category}</span>
                      <span>準備: {agenda.preparedBy}</span>
                      <span>出典: {agenda.source}</span>
                      <span>予定時間: {agenda.estimatedTime}分</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{agenda.summary}</p>

                {/* 論点 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">主要ポイント:</p>
                    <ul className="space-y-1">
                      {agenda.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">想定される議論:</p>
                      <p className="text-sm text-gray-300">{agenda.expectedDiscussion}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">求められる決定:</p>
                      <p className="text-sm text-yellow-400">{agenda.requiredDecision}</p>
                    </div>
                  </div>
                </div>

                {/* 資料状況 */}
                <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    {agenda.documentsAttached ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${agenda.documentsAttached ? 'text-green-400' : 'text-red-400'}`}>
                      報告書
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {agenda.presentationReady ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${agenda.presentationReady ? 'text-green-400' : 'text-red-400'}`}>
                      プレゼン資料
                    </span>
                  </div>
                </div>

                {/* 理事長コメント */}
                {agenda.chairmanComment && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className="text-xs text-blue-400 mb-1">理事長コメント:</p>
                        <p className="text-sm text-gray-300">{agenda.chairmanComment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* アクションボタン */}
                {agenda.chairmanReview === 'pending' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReviewAction(agenda.id, 'approve')}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      承認
                    </button>
                    <button
                      onClick={() => handleReviewAction(agenda.id, 'revise')}
                      className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      修正依頼
                    </button>
                    <button
                      onClick={() => handleReviewAction(agenda.id, 'reject')}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      却下
                    </button>
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      詳細確認
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
