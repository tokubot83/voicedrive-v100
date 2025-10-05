import React, { useState } from 'react';
import { Post } from '../../types';
import { AgendaLevel } from '../../types/committee';
import { ProposalPermission } from '../../services/ProposalPermissionService';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import ProposalDetailPanel from './ProposalDetailPanel';

interface ProposalManagementCardProps {
  post: Post;
  agendaLevel: AgendaLevel;
  currentScore: number;
  permission: ProposalPermission;
  totalVotes: number;
  supportRate: number;
  onApprove?: (postId: string) => void;
  onReject?: (postId: string, reason: string) => void;
  onHold?: (postId: string, reason: string) => void;
  onEmergencyOverride?: (postId: string) => void;
}

const ProposalManagementCard: React.FC<ProposalManagementCardProps> = ({
  post,
  agendaLevel,
  currentScore,
  permission,
  totalVotes,
  supportRate,
  onApprove,
  onReject,
  onHold,
  onEmergencyOverride
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // 議題レベル設定
  const levelConfig = {
    'PENDING': { label: '検討中', icon: '💭', color: 'gray', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' },
    'DEPT_REVIEW': { label: '部署検討', icon: '📋', color: 'blue', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    'DEPT_AGENDA': { label: '部署議題', icon: '👥', color: 'green', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    'FACILITY_AGENDA': { label: '施設議題', icon: '🏥', color: 'yellow', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
    'CORP_REVIEW': { label: '法人検討', icon: '🏢', color: 'orange', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
    'CORP_AGENDA': { label: '法人議題', icon: '🏛️', color: 'pink', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' }
  }[agendaLevel] || { label: '検討中', icon: '💭', color: 'gray', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };

  if (!permission.canView) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-colors">
      {/* カードヘッダー */}
      <div className="p-4">
        {/* 権限バッジ */}
        {permission.badge && (
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${permission.badgeColor}`}>
              {permission.badge}
            </span>
          </div>
        )}

        {/* タイトル */}
        <h3 className="text-lg font-bold text-white mb-3">
          {post.content.length > 80
            ? post.content.substring(0, 80) + '...'
            : post.content
          }
        </h3>

        {/* 議題レベルバッジ */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3 ${levelConfig.bgColor} border ${levelConfig.borderColor}`}>
          <span className="text-2xl">{levelConfig.icon}</span>
          <div>
            <div className="text-white font-bold">{levelConfig.label}</div>
            <div className="text-sm text-gray-300">{currentScore}点</div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">総投票数</div>
            <div className="text-xl font-bold text-white">{totalVotes}人</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">支持率</div>
            <div className="text-xl font-bold text-green-400">{supportRate}%</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">コメント</div>
            <div className="text-xl font-bold text-white">{(post.comments || []).length}件</div>
          </div>
        </div>

        {/* アクションボタン */}
        {permission.canEdit && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onApprove?.(post.id)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              ✅ 承認
            </button>
            <button
              onClick={() => onHold?.(post.id, '')}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
            >
              ⏸️ 保留
            </button>
            <button
              onClick={() => onReject?.(post.id, '')}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              ❌ 却下
            </button>
          </div>
        )}

        {permission.canComment && !permission.canEdit && (
          <div className="mb-3">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              💬 アドバイスする
            </button>
          </div>
        )}

        {permission.canEmergencyOverride && !permission.canEdit && (
          <div className="mb-3">
            {!showEmergencyConfirm ? (
              <button
                onClick={() => setShowEmergencyConfirm(true)}
                className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500 text-red-400 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                ⚠️ 緊急介入モード
              </button>
            ) : (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm mb-2">
                  緊急介入は監査ログに記録されます。本当に実行しますか？
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onEmergencyOverride?.(post.id);
                      setShowEmergencyConfirm(false);
                    }}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    実行
                  </button>
                  <button
                    onClick={() => setShowEmergencyConfirm(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 詳細表示ボタン */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>閉じる</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>📊 詳細を見る（スコア内訳・コメント）</span>
            </>
          )}
        </button>
      </div>

      {/* 展開エリア（詳細パネル） */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 bg-gray-900/50">
          <ProposalDetailPanel
            post={post}
            currentScore={currentScore}
            permission={permission}
          />
        </div>
      )}
    </div>
  );
};

export default ProposalManagementCard;
