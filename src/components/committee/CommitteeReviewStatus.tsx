import React from 'react';
import { CommitteeStatus, CommitteeInfo, CommitteeDecision } from '../../types/committee';

interface CommitteeReviewStatusProps {
  status: CommitteeStatus;
  committeeInfo?: CommitteeInfo;
  committeeDecision?: CommitteeDecision;
}

/**
 * 議題モード専用：委員会審議状況の透明性表示
 */
export const CommitteeReviewStatus: React.FC<CommitteeReviewStatusProps> = ({
  status,
  committeeInfo,
  committeeDecision
}) => {
  // ステータス別の設定
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          emoji: '⏳',
          label: '委員会提出待ち',
          color: 'gray',
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          description: 'スコア100点到達で施設議題レベルになります'
        };
      case 'under_review':
        return {
          emoji: '👀',
          label: '施設長審査中',
          color: 'yellow',
          bgGradient: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          description: '施設長が委員会提出の可否を審査中です'
        };
      case 'committee_submitted':
        return {
          emoji: '📨',
          label: '委員会へ提出済み',
          color: 'blue',
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          description: '委員会での審議開始待ちです'
        };
      case 'committee_reviewing':
        return {
          emoji: '🔍',
          label: '委員会で審議中',
          color: 'purple',
          bgGradient: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-800',
          description: '委員会メンバーが審議しています',
          pulse: true
        };
      case 'implementation_decided':
        return {
          emoji: '✅',
          label: '委員会決定：実施予定',
          color: 'green',
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-400',
          textColor: 'text-green-900',
          description: '委員会で実施が決定されました'
        };
      case 'escalated_to_corp':
        return {
          emoji: '🏢',
          label: '委員会決定：法人検討へ',
          color: 'indigo',
          bgGradient: 'from-indigo-50 to-blue-50',
          borderColor: 'border-indigo-300',
          textColor: 'text-indigo-900',
          description: '施設レベルを超えるため法人検討へエスカレーション'
        };
      case 'returned_for_improvement':
        return {
          emoji: '📝',
          label: '要改善',
          color: 'orange',
          bgGradient: 'from-orange-50 to-amber-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-800',
          description: '委員会からの改善要請があります'
        };
      case 'rejected':
        return {
          emoji: '❌',
          label: '施設議題却下',
          color: 'red',
          bgGradient: 'from-red-50 to-rose-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          description: '委員会で却下されました'
        };
      default:
        return {
          emoji: '❓',
          label: '不明',
          color: 'gray',
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          description: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`bg-gradient-to-r ${config.bgGradient} border ${config.borderColor} rounded-xl p-4 transition-all`}>
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* アイコン */}
          <div className={`p-2 rounded-lg bg-white border ${config.borderColor}`}>
            <span className="text-2xl">{config.emoji}</span>
          </div>

          {/* ステータス情報 */}
          <div>
            <div className={`text-sm font-medium opacity-75 ${config.textColor}`}>
              施設議題審議状況
            </div>
            <div className={`text-base font-bold ${config.textColor} flex items-center gap-2`}>
              {config.label}
              {config.pulse && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className={`text-xs mt-1 opacity-75 ${config.textColor}`}>
              {config.description}
            </div>
          </div>
        </div>

        {/* 提出日表示 */}
        {committeeInfo?.submissionDate && (
          <div className="text-right">
            <div className="text-xs text-gray-500">提出日</div>
            <div className={`text-sm font-medium ${config.textColor}`}>
              {new Date(committeeInfo.submissionDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>

      {/* 委員会情報表示 */}
      {committeeInfo?.committees && committeeInfo.committees.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="text-xs text-gray-600 mb-2 font-medium">審議委員会</div>
          <div className="flex gap-2 flex-wrap">
            {committeeInfo.committees.map((committee, index) => (
              <span
                key={index}
                className={`px-3 py-1 bg-white text-${config.color}-800 text-xs font-medium rounded-full border ${config.borderColor}`}
              >
                {committee}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 委員会決定内容の表示 */}
      {committeeDecision && (status === 'implementation_decided' || status === 'escalated_to_corp' || status === 'returned_for_improvement' || status === 'rejected') && (
        <div className="mt-3 pt-3 border-t border-white/50">
          {/* 決定理由 */}
          {committeeDecision.reason && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1 font-medium">💬 委員会からのコメント</div>
              <div className={`text-sm ${config.textColor} bg-white/50 rounded-lg p-3 border ${config.borderColor}`}>
                {committeeDecision.reason}
              </div>
            </div>
          )}

          {/* 次のアクション */}
          {committeeDecision.nextAction && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1 font-medium">📌 次のアクション</div>
              <div className={`text-sm ${config.textColor} font-medium`}>
                {committeeDecision.nextAction}
              </div>
            </div>
          )}

          {/* 決定日 */}
          {committeeDecision.decidedDate && (
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
              <span>
                決定日：{new Date(committeeDecision.decidedDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </span>
              {committeeInfo?.committees && committeeInfo.committees.length > 0 && (
                <span>
                  担当：{committeeInfo.committees[0]}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 備考 */}
      {committeeInfo?.note && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="text-xs text-gray-600 mb-1 font-medium">📝 備考</div>
          <div className={`text-sm ${config.textColor}`}>
            {committeeInfo.note}
          </div>
        </div>
      )}

      {/* 提出者情報（透明性のため） */}
      {committeeInfo?.submittedBy && status !== 'pending' && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="text-xs text-gray-500">
            提出者：{committeeInfo.submittedBy.name} (レベル {committeeInfo.submittedBy.permissionLevel})
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeReviewStatus;
