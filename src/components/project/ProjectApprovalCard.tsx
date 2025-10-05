import React, { useState } from 'react';
import { Post } from '../../types';
import { ProjectLevel } from '../../types/visibility';
import { ProjectPermission } from '../../services/ProjectPermissionService';
import { ProjectScale, getProjectScaleDescription } from '../../types/project';
import { ChevronDown, ChevronUp, AlertTriangle, Users } from 'lucide-react';
import ProjectDetailPanel from './ProjectDetailPanel';

interface ProjectApprovalCardProps {
  post: Post;
  projectLevel: ProjectLevel;
  currentScore: number;
  permission: ProjectPermission;
  totalVotes: number;
  supportRate: number;
  projectScale?: ProjectScale;
  estimatedTeamSize?: number;
  onApprove?: (postId: string) => void;
  onReject?: (postId: string, reason: string) => void;
  onHold?: (postId: string, reason: string) => void;
  onEmergencyOverride?: (postId: string) => void;
  onFormTeam?: (postId: string) => void;
}

const ProjectApprovalCard: React.FC<ProjectApprovalCardProps> = ({
  post,
  projectLevel,
  currentScore,
  permission,
  totalVotes,
  supportRate,
  projectScale,
  estimatedTeamSize,
  onApprove,
  onReject,
  onHold,
  onEmergencyOverride,
  onFormTeam
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  // プロジェクトレベル設定
  const levelConfig = {
    'PENDING': {
      label: 'アイデア検討中',
      icon: '💡',
      color: 'gray',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      threshold: '0-99点'
    },
    'TEAM': {
      label: 'チームプロジェクト',
      icon: '👥',
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      threshold: '100-199点'
    },
    'DEPARTMENT': {
      label: '部署プロジェクト',
      icon: '🏢',
      color: 'green',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      threshold: '200-399点'
    },
    'FACILITY': {
      label: '施設プロジェクト',
      icon: '🏥',
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      threshold: '400-799点'
    },
    'ORGANIZATION': {
      label: '法人プロジェクト',
      icon: '🏛️',
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      threshold: '800点以上'
    },
    'STRATEGIC': {
      label: '戦略プロジェクト',
      icon: '⭐',
      color: 'pink',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500/30',
      threshold: '戦略指定'
    }
  }[projectLevel] || {
    label: 'アイデア検討中',
    icon: '💡',
    color: 'gray',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    threshold: '0-99点'
  };

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

        {/* プロジェクトレベルバッジ */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3 ${levelConfig.bgColor} border ${levelConfig.borderColor}`}>
          <span className="text-2xl">{levelConfig.icon}</span>
          <div>
            <div className="text-white font-bold">{levelConfig.label}</div>
            <div className="text-sm text-gray-300">{currentScore}点 ({levelConfig.threshold})</div>
          </div>
        </div>

        {/* プロジェクト規模情報 */}
        {projectScale && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">プロジェクト規模</span>
            </div>
            <div className="text-white font-bold mb-1">
              {getProjectScaleDescription(projectScale)}
            </div>
            {estimatedTeamSize && (
              <div className="text-sm text-gray-400">
                推定チーム規模: {estimatedTeamSize}名
              </div>
            )}
          </div>
        )}

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

        {/* プロジェクト承認アクションボタン */}
        {permission.canApprove && (
          <div className="space-y-2 mb-3">
            {/* プロジェクト開始 */}
            <button
              onClick={() => onApprove?.(post.id)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span className="text-lg">🚀</span>
              <span>プロジェクト開始を承認</span>
            </button>

            {/* チーム編成へ（オプション） */}
            {permission.canFormTeam && projectLevel !== 'PENDING' && (
              <button
                onClick={() => onFormTeam?.(post.id)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>チーム編成へ進む</span>
              </button>
            )}

            {/* 保留・却下 */}
            <div className="flex gap-2">
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
          </div>
        )}

        {/* アドバイスボタン（監督者） */}
        {permission.canComment && !permission.canApprove && (
          <div className="mb-3">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              💬 アドバイスする
            </button>
          </div>
        )}

        {/* 緊急介入モード（上位者） */}
        {permission.canEmergencyOverride && !permission.canApprove && (
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
          <ProjectDetailPanel
            post={post}
            currentScore={currentScore}
            permission={permission}
            projectLevel={projectLevel}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectApprovalCard;
