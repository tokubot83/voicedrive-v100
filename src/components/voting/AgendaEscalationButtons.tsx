/**
 * 議題昇格ボタンコンポーネント
 * Phase 5実装
 *
 * 管理職が手動で議題レベルを昇格させるためのボタンUI
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp, Lock, CheckCircle2 } from 'lucide-react';

export type AgendaLevel = 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';

interface AgendaEscalationButtonsProps {
  postId: string;
  currentScore: number;
  currentLevel: AgendaLevel | null;
  userPermissionLevel: number;
  onEscalate: (targetLevel: AgendaLevel, reason: string) => Promise<void>;
}

interface EscalationOption {
  level: AgendaLevel;
  label: string;
  icon: string;
  minScore: number;
  requiredPermission: number;
  color: string;
  description: string;
}

const ESCALATION_OPTIONS: EscalationOption[] = [
  {
    level: 'FACILITY_AGENDA',
    label: '施設議題に昇格',
    icon: '🏥',
    minScore: 100,
    requiredPermission: 7, // 師長
    color: 'green',
    description: '施設内全員が投票可能になります',
  },
  {
    level: 'CORP_REVIEW',
    label: '法人検討に昇格',
    icon: '🏢',
    minScore: 300,
    requiredPermission: 8, // 副看護部長
    color: 'purple',
    description: '法人内全員が閲覧・投票可能になります',
  },
  {
    level: 'CORP_AGENDA',
    label: '法人議題に昇格',
    icon: '🏛️',
    minScore: 600,
    requiredPermission: 11, // 事務長
    color: 'pink',
    description: '法人全体の重要議題として扱われます',
  },
];

export function AgendaEscalationButtons({
  postId,
  currentScore,
  currentLevel,
  userPermissionLevel,
  onEscalate,
}: AgendaEscalationButtonsProps) {
  const [selectedLevel, setSelectedLevel] = useState<AgendaLevel | null>(null);
  const [reason, setReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);

  // 昇格可能なオプションをフィルタリング
  const availableOptions = ESCALATION_OPTIONS.filter(option => {
    // 現在のレベルより上位であること
    const levelOrder = ['PENDING', 'DEPT_REVIEW', 'DEPT_AGENDA', 'FACILITY_AGENDA', 'CORP_REVIEW', 'CORP_AGENDA'];
    const currentIndex = currentLevel ? levelOrder.indexOf(currentLevel) : 0;
    const targetIndex = levelOrder.indexOf(option.level);

    if (targetIndex <= currentIndex) {
      return false;
    }

    // 権限があること
    if (userPermissionLevel < option.requiredPermission) {
      return false;
    }

    return true;
  });

  // 昇格処理
  const handleEscalate = async () => {
    if (!selectedLevel || !reason.trim()) {
      return;
    }

    setIsEscalating(true);
    try {
      await onEscalate(selectedLevel, reason.trim());
      setShowReasonDialog(false);
      setSelectedLevel(null);
      setReason('');
    } catch (error) {
      console.error('昇格エラー:', error);
    } finally {
      setIsEscalating(false);
    }
  };

  // 昇格ボタンがない場合は何も表示しない
  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowUp className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">議題レベルの早期昇格</h4>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        この提案は重要だと判断される場合、スコアに関わらず議題レベルを昇格できます。
      </p>

      {/* 昇格ボタン一覧 */}
      <div className="space-y-2">
        {availableOptions.map((option) => {
          const isLocked = userPermissionLevel < option.requiredPermission;
          const colorClasses = {
            green: {
              bg: 'bg-green-500 hover:bg-green-600',
              text: 'text-green-700',
              border: 'border-green-300',
            },
            purple: {
              bg: 'bg-purple-500 hover:bg-purple-600',
              text: 'text-purple-700',
              border: 'border-purple-300',
            },
            pink: {
              bg: 'bg-pink-500 hover:bg-pink-600',
              text: 'text-pink-700',
              border: 'border-pink-300',
            },
          };

          const colors = colorClasses[option.color as keyof typeof colorClasses];

          return (
            <button
              key={option.level}
              onClick={() => {
                setSelectedLevel(option.level);
                setShowReasonDialog(true);
              }}
              disabled={isLocked}
              className={`
                w-full p-3 rounded-lg border-2 transition-all
                ${isLocked
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                  : `bg-white ${colors.border} hover:shadow-md active:scale-[0.98]`
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-left">
                    <div className={`font-semibold ${isLocked ? 'text-gray-500' : colors.text}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
                {isLocked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <ArrowUp className={`w-5 h-5 ${colors.text}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        ※ 昇格後は投票期限が14日間延長され、新しい投票範囲の職員全員に通知されます
      </div>

      {/* 昇格理由入力ダイアログ */}
      {showReasonDialog && selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">昇格理由を入力してください</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                昇格先: <span className="font-semibold">
                  {ESCALATION_OPTIONS.find(o => o.level === selectedLevel)?.label}
                </span>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例: 複数部署から高い支持を得ており、施設全体の業務改善につながる重要な提案のため"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={isEscalating}
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowReasonDialog(false);
                  setSelectedLevel(null);
                  setReason('');
                }}
                disabled={isEscalating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleEscalate}
                disabled={!reason.trim() || isEscalating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEscalating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    昇格中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    昇格を実行
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendaEscalationButtons;
