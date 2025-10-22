import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Calendar, CheckCircle, AlertCircle, MessageSquare, Eye, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

/**
 * 理事会議題確認
 *
 * 対象: レベル18（理事長・法人事務局長）
 * 目的: レベル17が準備した理事会議題を事前確認し、理事会前の論点整理を行う
 */

interface AgendaItem {
  id: string;
  item: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  preparedBy?: string;
  sourceReport?: string;
  summary?: string;
  keyPoints?: string;
  expectedDiscussion?: string;
  requiredDecision?: string;
  documentsReady: boolean;
  presentationReady: boolean;
  duration: number;
  chairmanReview?: string;
  chairmanComment?: string;
  chairmanReviewedAt?: string;
  agendaOrder: number;
  presenter: {
    id: string;
    name: string;
    position?: string;
    department?: string;
  };
}

interface BoardMeeting {
  id: string;
  meetingDate: string;
  startTime: string;
  location: string;
  expectedAttendees: number;
  expectedDuration: number;
  totalAgendaCount: number;
  totalEstimatedTime: number;
  preparationProgress: number;
  status: string;
}

interface BoardMeetingResponse {
  success: boolean;
  meeting: BoardMeeting;
}

interface BoardAgendasResponse {
  success: boolean;
  agendas: AgendaItem[];
  statistics: {
    total: number;
    approved: number;
    pending: number;
    needsRevision: number;
    rejected: number;
  };
}

// APIベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// 次回理事会情報取得
async function fetchNextBoardMeeting(): Promise<BoardMeeting> {
  const response = await fetch(`${API_BASE_URL}/api/board-meetings/next`);
  if (!response.ok) {
    throw new Error('次回理事会情報の取得に失敗しました');
  }
  const data: BoardMeetingResponse = await response.json();
  return data.meeting;
}

// 理事会議題一覧取得
async function fetchBoardAgendas(meetingDate: string): Promise<BoardAgendasResponse> {
  const response = await fetch(`${API_BASE_URL}/api/board-agendas?meetingDate=${encodeURIComponent(meetingDate)}`);
  if (!response.ok) {
    throw new Error('議題一覧の取得に失敗しました');
  }
  return response.json();
}

// 理事長レビューアクション
async function reviewAgenda(params: {
  agendaId: string;
  action: 'approve' | 'revise' | 'reject';
  comment?: string;
  userId: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/board-agendas/${params.agendaId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: params.action,
      comment: params.comment,
      userId: params.userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'レビュー処理に失敗しました');
  }

  return response.json();
}

export const BoardAgendaReviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');

  // TODO: 実際のユーザーIDを取得（認証コンテキストから）
  const currentUserId = 'user-chairman-001';

  // 次回理事会情報取得
  const { data: nextMeeting, isLoading: isMeetingLoading, error: meetingError } = useQuery({
    queryKey: ['nextBoardMeeting'],
    queryFn: fetchNextBoardMeeting
  });

  // 理事会議題一覧取得
  const { data: agendasData, isLoading: isAgendasLoading, error: agendasError } = useQuery({
    queryKey: ['boardAgendas', nextMeeting?.meetingDate],
    queryFn: () => fetchBoardAgendas(nextMeeting!.meetingDate),
    enabled: !!nextMeeting?.meetingDate
  });

  // レビューアクションミューテーション
  const reviewMutation = useMutation({
    mutationFn: reviewAgenda,
    onSuccess: () => {
      // 議題一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['boardAgendas'] });
      setSelectedAgendaId(null);
      setReviewComment('');
    }
  });

  const handleReviewAction = (agendaId: string, action: 'approve' | 'revise' | 'reject') => {
    const comment = window.prompt(
      action === 'approve' ? 'コメント（任意）:' :
      action === 'revise' ? '修正依頼理由を入力してください:' :
      '却下理由を入力してください:'
    );

    if (action !== 'approve' && !comment) {
      alert('修正依頼・却下の場合は理由の入力が必須です');
      return;
    }

    reviewMutation.mutate({
      agendaId,
      action,
      comment: comment || undefined,
      userId: currentUserId
    });
  };

  const getReviewStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'needs_revision': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'pending':
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getReviewStatusLabel = (status?: string) => {
    switch (status) {
      case 'approved': return '承認済';
      case 'needs_revision': return '修正依頼';
      case 'rejected': return '却下';
      case 'pending':
      default:
        return '確認待ち';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
    }
  };

  // keyPointsのパース（JSON文字列 or 改行区切りテキスト）
  const parseKeyPoints = (keyPoints?: string): string[] => {
    if (!keyPoints) return [];

    try {
      // JSON形式を試す
      const parsed = JSON.parse(keyPoints);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // JSON解析失敗 → 改行区切りと仮定
      return keyPoints.split('\n').filter(line => line.trim());
    }

    return [];
  };

  // ローディング状態
  if (isMeetingLoading || isAgendasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-lg">読み込み中...</span>
        </div>
      </div>
    );
  }

  // エラー状態
  if (meetingError || agendasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-red-400">エラー</h2>
          </div>
          <p className="text-gray-300">
            {(meetingError as Error)?.message || (agendasError as Error)?.message || 'データの取得に失敗しました'}
          </p>
        </div>
      </div>
    );
  }

  // データがない場合
  if (!nextMeeting || !agendasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-400">予定されている理事会がありません</p>
        </div>
      </div>
    );
  }

  const agendaItems = agendasData.agendas;
  const statistics = agendasData.statistics;

  // 日付フォーマット
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
            <div className="text-2xl font-bold mb-1">{formatDate(nextMeeting.meetingDate)}</div>
            <p className="text-sm text-gray-400">{nextMeeting.startTime} / {nextMeeting.location}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">総議題数</span>
            </div>
            <div className="text-3xl font-bold mb-1">{statistics.total}件</div>
            <p className="text-sm text-gray-400">予定時間: {nextMeeting.totalEstimatedTime}分</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">承認済</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-green-400">{statistics.approved}件</div>
            <p className="text-sm text-yellow-400">確認待ち: {statistics.pending}件</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">要対応</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-yellow-400">{statistics.needsRevision}件</div>
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

          {agendaItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>議題がまだ登録されていません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendaItems.map((agenda) => {
                const keyPoints = parseKeyPoints(agenda.keyPoints);

                return (
                  <div
                    key={agenda.id}
                    className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xl ${getPriorityColor(agenda.priority)}`}>●</span>
                          <h3 className="text-lg font-medium">{agenda.item}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs border ${getReviewStatusColor(agenda.chairmanReview)}`}>
                            {getReviewStatusLabel(agenda.chairmanReview)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>{agenda.category}</span>
                          {agenda.preparedBy && <span>準備: {agenda.preparedBy}</span>}
                          {agenda.sourceReport && <span>出典: {agenda.sourceReport}</span>}
                          <span>予定時間: {agenda.duration}分</span>
                        </div>
                      </div>
                    </div>

                    {agenda.summary && (
                      <p className="text-gray-300 mb-4">{agenda.summary}</p>
                    )}

                    {/* 論点 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      {keyPoints.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-400 mb-2">主要ポイント:</p>
                          <ul className="space-y-1">
                            {keyPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="space-y-3">
                        {agenda.expectedDiscussion && (
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">想定される議論:</p>
                            <p className="text-sm text-gray-300">{agenda.expectedDiscussion}</p>
                          </div>
                        )}
                        {agenda.requiredDecision && (
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">求められる決定:</p>
                            <p className="text-sm text-yellow-400">{agenda.requiredDecision}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 資料状況 */}
                    <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        {agenda.documentsReady ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${agenda.documentsReady ? 'text-green-400' : 'text-red-400'}`}>
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
                          disabled={reviewMutation.isPending}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                          承認
                        </button>
                        <button
                          onClick={() => handleReviewAction(agenda.id, 'revise')}
                          disabled={reviewMutation.isPending}
                          className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          修正依頼
                        </button>
                        <button
                          onClick={() => handleReviewAction(agenda.id, 'reject')}
                          disabled={reviewMutation.isPending}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {reviewMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ThumbsDown className="w-4 h-4" />
                          )}
                          却下
                        </button>
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          詳細確認
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
