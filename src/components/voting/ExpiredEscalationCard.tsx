/**
 * 期限到達・未達成の昇格提案カードコンポーネント
 * Phase 6実装
 *
 * 昇格させたけど目標スコアに達しなかった提案を管理職が判断するUI
 */

import React, { useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, ArrowDown, XCircle, TrendingDown } from 'lucide-react';

export type AgendaLevel = 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
export type ExpiredEscalationDecision = 'approve_at_current_level' | 'downgrade' | 'reject';

interface Post {
  id: string;
  content: string;
  authorId: string;
  agendaLevel: AgendaLevel;
  agendaScore: number;
  createdAt: string;
  author?: {
    name: string;
    department: string;
  };
}

interface ExpiredEscalation {
  post: Post;
  currentScore: number;
  targetScore: number;
  achievementRate: number;
  daysOverdue: number;
}

interface ExpiredEscalationCardProps {
  escalation: ExpiredEscalation;
  onDecide: (postId: string, decision: ExpiredEscalationDecision, reason: string) => Promise<void>;
}

const LEVEL_LABELS: Record<AgendaLevel, string> = {
  'PENDING': '保留',
  'DEPT_REVIEW': '部署検討',
  'DEPT_AGENDA': '部署議題',
  'FACILITY_AGENDA': '施設議題',
  'CORP_REVIEW': '法人検討',
  'CORP_AGENDA': '法人議題',
};

const LEVEL_COLORS: Record<AgendaLevel, string> = {
  'PENDING': 'gray',
  'DEPT_REVIEW': 'blue',
  'DEPT_AGENDA': 'green',
  'FACILITY_AGENDA': 'green',
  'CORP_REVIEW': 'purple',
  'CORP_AGENDA': 'pink',
};

export function ExpiredEscalationCard({ escalation, onDecide }: ExpiredEscalationCardProps) {
  const { post, currentScore, targetScore, achievementRate, daysOverdue } = escalation;
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<ExpiredEscalationDecision | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentLevel = post.agendaLevel;
  const levelColor = LEVEL_COLORS[currentLevel];

  // 1つ下のレベルを取得
  const getLowerLevel = (): AgendaLevel | null => {
    const levelOrder: AgendaLevel[] = ['PENDING', 'DEPT_REVIEW', 'DEPT_AGENDA', 'FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    if (currentIndex > 0) {
      return levelOrder[currentIndex - 1];
    }
    return null;
  };

  const lowerLevel = getLowerLevel();

  // 判断処理
  const handleDecide = async () => {
    if (!selectedDecision || !reason.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      await onDecide(post.id, selectedDecision, reason.trim());
      setShowDecisionDialog(false);
      setSelectedDecision(null);
      setReason('');
    } catch (error) {
      console.error('判断処理エラー:', error);
      alert('判断処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 到達率の色
  const getAchievementColor = () => {
    if (achievementRate >= 90) return 'text-yellow-600';
    if (achievementRate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <div className="bg-white border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 bg-${levelColor}-100 text-${levelColor}-700 rounded-full text-sm font-semibold`}>
                  {LEVEL_LABELS[currentLevel]}
                </span>
                <span className="text-xs text-gray-500">期限到達 {daysOverdue}日経過</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                投稿者: {post.author?.name || '匿名'} ({post.author?.department || '不明'})
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getAchievementColor()}`}>
              {achievementRate}%
            </div>
            <div className="text-xs text-gray-500">目標到達率</div>
          </div>
        </div>

        {/* 提案内容 */}
        <div className="mb-4">
          <p className="text-gray-800 line-clamp-3">{post.content}</p>
        </div>

        {/* スコア情報 */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">現在のスコア</span>
            <span className="text-lg font-semibold text-gray-800">{currentScore}点</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">目標スコア</span>
            <span className="text-lg font-semibold text-gray-800">{targetScore}点</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">不足</span>
            <span className="text-lg font-semibold text-red-600">-{targetScore - currentScore}点</span>
          </div>
        </div>

        {/* 判断ボタン */}
        <div className="grid grid-cols-3 gap-2">
          {/* 現在のレベルで承認 */}
          <button
            onClick={() => {
              setSelectedDecision('approve_at_current_level');
              setShowDecisionDialog(true);
            }}
            className="flex flex-col items-center gap-2 p-3 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">現レベルで承認</span>
          </button>

          {/* ダウングレード */}
          {lowerLevel && (
            <button
              onClick={() => {
                setSelectedDecision('downgrade');
                setShowDecisionDialog(true);
              }}
              className="flex flex-col items-center gap-2 p-3 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowDown className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                {LEVEL_LABELS[lowerLevel]}に変更
              </span>
            </button>
          )}

          {/* 不採用 */}
          <button
            onClick={() => {
              setSelectedDecision('reject');
              setShowDecisionDialog(true);
            }}
            className="flex flex-col items-center gap-2 p-3 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-semibold text-red-700">不採用</span>
          </button>
        </div>

        {/* 注意書き */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              この提案は昇格後に目標スコアに達しませんでした。投票結果を尊重しつつ、組織の判断で処理してください。
            </p>
          </div>
        </div>
      </div>

      {/* 判断理由入力ダイアログ */}
      {showDecisionDialog && selectedDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">判断理由を入力してください</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                判断: <span className="font-semibold">
                  {selectedDecision === 'approve_at_current_level' && '現在のレベルで承認'}
                  {selectedDecision === 'downgrade' && `${LEVEL_LABELS[lowerLevel!]}にダウングレード`}
                  {selectedDecision === 'reject' && '不採用'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                提案: {post.content.substring(0, 50)}...
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                selectedDecision === 'approve_at_current_level'
                  ? '例: 現在のスコアで十分な支持を得ており、組織改善に寄与すると判断したため'
                  : selectedDecision === 'downgrade'
                  ? '例: 施設全体よりも部署レベルでの検討が適切と判断したため'
                  : '例: 投票結果から組織全体の支持が得られていないと判断したため'
              }
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={isProcessing}
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowDecisionDialog(false);
                  setSelectedDecision(null);
                  setReason('');
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDecide}
                disabled={!reason.trim() || isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    処理中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    判断を確定
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExpiredEscalationCard;
