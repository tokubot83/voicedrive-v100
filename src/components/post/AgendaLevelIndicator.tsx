import React from 'react';
import { Eye, MessageSquare, Vote, Lock, Users } from 'lucide-react';
import { AgendaLevel } from '../../types/committee';
import { VisibilityPermissions } from '../../services/AgendaVisibilityEngine';

interface AgendaLevelIndicatorProps {
  agendaLevel: AgendaLevel;
  currentScore: number;
  permissions: VisibilityPermissions;
  supportRate?: number;
  totalVotes?: number;
}

export const AgendaLevelIndicator: React.FC<AgendaLevelIndicatorProps> = ({
  agendaLevel,
  currentScore,
  permissions,
  supportRate,
  totalVotes
}) => {
  // レベル設定
  const levelConfigs = {
    'PENDING': {
      label: '検討中',
      icon: '💭',
      color: 'gray',
      bgGradient: 'from-gray-100 to-gray-200',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-700'
    },
    'DEPT_REVIEW': {
      label: '部署検討',
      icon: '📋',
      color: 'yellow',
      bgGradient: 'from-yellow-100 to-yellow-200',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800'
    },
    'DEPT_AGENDA': {
      label: '部署議題',
      icon: '👥',
      color: 'blue',
      bgGradient: 'from-blue-100 to-blue-200',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800'
    },
    'FACILITY_AGENDA': {
      label: '施設議題',
      icon: '🏥',
      color: 'green',
      bgGradient: 'from-green-100 to-green-200',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      badge: '委員会提出可'
    },
    'CORP_REVIEW': {
      label: '法人検討',
      icon: '🏢',
      color: 'purple',
      bgGradient: 'from-purple-100 to-purple-200',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800'
    },
    'CORP_AGENDA': {
      label: '法人議題',
      icon: '🏛️',
      color: 'pink',
      bgGradient: 'from-pink-100 to-pink-200',
      borderColor: 'border-pink-300',
      textColor: 'text-pink-800',
      badge: '理事会提出'
    }
  };

  const config = levelConfigs[agendaLevel];

  return (
    <div className={`bg-gradient-to-r ${config.bgGradient} rounded-lg border ${config.borderColor} p-3`}>
      {/* レベル表示ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={`font-bold ${config.textColor}`}>
              {config.label}
            </div>
            <div className={`text-xs opacity-75 ${config.textColor}`}>
              {currentScore}点
            </div>
          </div>
        </div>

        {/* 特別バッジ */}
        {config.badge && (
          <span className={`px-2 py-1 text-xs font-medium bg-white rounded-full ${config.textColor} border ${config.borderColor}`}>
            {config.badge}
          </span>
        )}
      </div>

      {/* 投票範囲表示 */}
      <div className="bg-white bg-opacity-70 rounded p-2 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700 font-medium">
            {permissions.visibilityScope}
          </span>
        </div>
      </div>

      {/* 権限インジケーター */}
      <div className="flex items-center gap-3">
        {/* 閲覧 */}
        <div className={`flex items-center gap-1 ${permissions.canView ? 'text-green-600' : 'text-gray-400'}`}>
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">閲覧</span>
        </div>

        {/* 投票 */}
        <div className={`flex items-center gap-1 ${permissions.canVote ? 'text-blue-600' : 'text-gray-400'}`}>
          <Vote className="w-4 h-4" />
          <span className="text-xs font-medium">投票</span>
        </div>

        {/* コメント */}
        <div className={`flex items-center gap-1 ${permissions.canComment ? 'text-purple-600' : 'text-gray-400'}`}>
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-medium">コメント</span>
        </div>
      </div>

      {/* 支持率表示（オプション） */}
      {supportRate !== undefined && totalVotes !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">支持率</span>
            <div>
              <span className={`font-bold ${config.textColor}`}>{supportRate}%</span>
              <span className="text-gray-500 ml-1">({totalVotes}票)</span>
            </div>
          </div>
        </div>
      )}

      {/* 権限制限メッセージ */}
      {permissions.permissionReason && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>{permissions.permissionReason}</span>
        </div>
      )}
    </div>
  );
};

export default AgendaLevelIndicator;