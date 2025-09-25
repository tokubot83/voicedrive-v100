import React from 'react';
import { TrendingUp, Users, Building, Briefcase, Award } from 'lucide-react';
import { ProposalStatus } from '../../services/ProposalEscalationEngine';

interface ProposalLevelIndicatorProps {
  status: ProposalStatus;
  departmentSize?: number;
  showDetails?: boolean;
}

export const ProposalLevelIndicator: React.FC<ProposalLevelIndicatorProps> = ({
  status,
  departmentSize = 30,
  showDetails = true
}) => {
  
  // レベルに応じた色とアイコンの取得
  const getLevelStyle = () => {
    const level = status.currentLevel;
    
    if (level.includes('法人議題')) {
      return {
        color: 'bg-purple-500',
        lightColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-700',
        icon: <Briefcase className="w-5 h-5" />,
        badge: 'bg-purple-100 text-purple-800'
      };
    } else if (level.includes('法人検討')) {
      return {
        color: 'bg-indigo-500',
        lightColor: 'bg-indigo-50',
        borderColor: 'border-indigo-500',
        textColor: 'text-indigo-700',
        icon: <Award className="w-5 h-5" />,
        badge: 'bg-indigo-100 text-indigo-800'
      };
    } else if (level.includes('施設議題')) {
      return {
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700',
        icon: <Building className="w-5 h-5" />,
        badge: 'bg-blue-100 text-blue-800'
      };
    } else if (level.includes('部署議題')) {
      return {
        color: 'bg-green-500',
        lightColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-700',
        icon: <Users className="w-5 h-5" />,
        badge: 'bg-green-100 text-green-800'
      };
    } else if (level.includes('部署検討')) {
      return {
        color: 'bg-yellow-500',
        lightColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        icon: <TrendingUp className="w-5 h-5" />,
        badge: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return {
      color: 'bg-gray-500',
      lightColor: 'bg-gray-50',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-700',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: 'bg-gray-100 text-gray-800'
    };
  };
  
  const style = getLevelStyle();
  const progressPercentage = status.progress;
  
  // 部署規模調整の表示
  const getSizeAdjustmentText = () => {
    if (departmentSize <= 5) return '小規模部署（5人以下）';
    if (departmentSize <= 15) return '中規模部署（6-15人）';
    if (departmentSize <= 30) return '大規模部署（16-30人）';
    return '超大規模部署（31人以上）';
  };
  
  return (
    <div className={`rounded-lg p-4 ${style.lightColor} border ${style.borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${style.color} text-white`}>
            {style.icon}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              現在のレベル
            </div>
            <div className={`text-sm ${style.textColor}`}>
              {status.currentLevel}
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
          スコア: {status.currentScore}
        </div>
      </div>
      
      {/* 進捗バー */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>次のレベル: {status.nextLevel}</span>
          <span>{status.nextThreshold}点必要</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${style.color}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          進捗: {progressPercentage}%
        </div>
      </div>
      
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          {/* 投票範囲 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">投票範囲:</span>
            <span className="font-medium">
              {status.votingScope === 'department' && '部署内のみ'}
              {status.votingScope === 'facility' && '施設全体'}
              {status.votingScope === 'corporation' && '法人全体'}
            </span>
          </div>
          
          {/* 部署規模調整 */}
          {departmentSize && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">部署規模:</span>
              <span className="font-medium">
                {getSizeAdjustmentText()}
              </span>
            </div>
          )}
          
          {/* エスカレーション可否 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">議題化:</span>
            <span className={`font-medium ${
              status.canEscalate ? 'text-green-600' : 'text-gray-400'
            }`}>
              {status.canEscalate ? '可能' : '準備中'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};