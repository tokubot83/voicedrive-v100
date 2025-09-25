import React from 'react';

interface ProjectLevelBadgeProps {
  level: 'PENDING' | 'DEPT_REVIEW' | 'DEPT_AGENDA' | 'FACILITY_AGENDA' | 'CORP_REVIEW' | 'CORP_AGENDA';
  score: number;
  isAnimated?: boolean;
  showNextLevel?: boolean;
  nextLevelInfo?: {
    label: string;
    remainingPoints: number;
  };
  compact?: boolean; // モバイル向けコンパクト表示
}

const ProjectLevelBadge: React.FC<ProjectLevelBadgeProps> = ({ 
  level, 
  score, 
  isAnimated = false,
  showNextLevel = false,
  nextLevelInfo,
  compact = false
}) => {
  const getLevelConfig = () => {
    switch(level) {
      case 'PENDING':
        return {
          label: '検討中',
          color: 'gray',
          icon: '💭',
          bgGradient: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          range: '0-29点'
        };
      case 'DEPT_REVIEW':
        return {
          label: '部署検討',
          color: 'yellow',
          icon: '📋',
          bgGradient: 'from-yellow-400 to-yellow-600',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-700',
          range: '30-49点'
        };
      case 'DEPT_AGENDA':
        return {
          label: '部署議題',
          color: 'blue',
          icon: '👥',
          bgGradient: 'from-blue-400 to-blue-600',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-700',
          range: '50-99点'
        };
      case 'FACILITY_AGENDA':
        return {
          label: '施設議題',
          color: 'green',
          icon: '🏥',
          bgGradient: 'from-green-400 to-green-600',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          range: '100-299点',
          subtitle: '委員会提出'
        };
      case 'CORP_REVIEW':
        return {
          label: '法人検討',
          color: 'purple',
          icon: '🏢',
          bgGradient: 'from-purple-400 to-purple-600',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-700',
          range: '300-599点'
        };
      case 'CORP_AGENDA':
        return {
          label: '法人議題',
          color: 'pink',
          icon: '🏛️',
          bgGradient: 'from-pink-400 to-pink-600',
          borderColor: 'border-pink-300',
          textColor: 'text-pink-700',
          range: '600点以上',
          subtitle: '理事会提出'
        };
      default:
        return {
          label: '検討中',
          color: 'gray',
          icon: '💭',
          bgGradient: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          range: '0-29点'
        };
    }
  };

  const config = getLevelConfig();

  if (compact) {
    // モバイル向けコンパクト表示（上下2列レイアウト）
    return (
      <div className="space-y-3">
        {/* タイトル - みんなの納得率と同じスタイル */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">みんなの投票スコア</span>
          </div>
        </div>
        
        {/* 上段: 現在のレベル */}
        <div className={`
          flex items-center justify-between px-4 py-3 rounded-xl
          bg-gradient-to-r ${config.bgGradient} text-white
          shadow-md ${isAnimated ? 'animate-pulse' : ''}
          transition-all duration-300
        `}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{config.icon}</span>
            <div>
              <span className="text-xs opacity-90">現在</span>
              <div className="text-base font-bold">{config.label}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold">{Math.round(score)}</span>
            <span className="text-sm opacity-90 ml-1">点</span>
          </div>
        </div>
        
        {/* 下段: 次のレベル */}
        {showNextLevel && nextLevelInfo && (
          <div className={`
            flex items-center justify-between px-4 py-3 rounded-xl
            bg-gray-50 border-2 ${config.borderColor}
            ${isAnimated ? 'animate-bounce' : ''}
            transition-all duration-300
          `}>
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-60">
                {nextLevelInfo.label.includes('部署') ? '🏢' :
                 nextLevelInfo.label.includes('施設') ? '🏥' :
                 nextLevelInfo.label.includes('法人') ? '🏛️' :
                 nextLevelInfo.label.includes('戦略') ? '🚀' : '👥'}
              </span>
              <div>
                <span className={`text-xs ${config.textColor} opacity-80`}>次</span>
                <div className={`text-base font-bold ${config.textColor}`}>
                  {nextLevelInfo.label}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs ${config.textColor} opacity-80`}>まであと</span>
              <div className={`text-lg font-bold ${config.textColor}`}>
                {nextLevelInfo.remainingPoints}点
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* メインバッジ */}
      <div className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r ${config.bgGradient} text-white font-bold
        shadow-lg ${isAnimated ? 'animate-pulse' : ''}
        transform hover:scale-105 transition-all duration-300
        relative
      `}>
        {/* レベルアップ間近の光彩エフェクト */}
        {isAnimated && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}
        
        <span className="text-2xl relative z-10">{config.icon}</span>
        <div className="flex flex-col relative z-10">
          <span className="text-xs opacity-90">現在のレベル</span>
          <span className="text-lg">{config.label}</span>
        </div>
        <div className="ml-2 px-3 py-1 bg-white/20 rounded-full relative z-10">
          <span className="text-sm font-bold">{Math.round(score)}点</span>
        </div>
      </div>

      {/* 次のレベルまでの情報 */}
      {showNextLevel && nextLevelInfo && (
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-gray-100 border-2 ${config.borderColor}
          ${isAnimated ? 'animate-bounce' : ''}
        `}>
          <span className="text-xs ${config.textColor} font-medium">
            次のレベル「{nextLevelInfo.label}」まで
          </span>
          <span className={`text-sm font-bold ${config.textColor}`}>
            あと{nextLevelInfo.remainingPoints}点
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectLevelBadge;