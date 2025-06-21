// 新マッピング対応版プロジェクトレベルバッジコンポーネント - 予算情報表示対応
import React from 'react';

interface ProjectLevelBadgeEnhancedProps {
  level: 'PENDING' | 'TEAM' | 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'STRATEGIC';
  score: number;
  isAnimated?: boolean;
  showNextLevel?: boolean;
  nextLevelInfo?: {
    label: string;
    remainingPoints: number;
  };
  compact?: boolean; // モバイル向けコンパクト表示
  showBudgetInfo?: boolean; // 予算情報表示フラグ
  budgetLimit?: number;     // 予算上限金額
  approvalChain?: string[]; // 承認チェーン情報
}

const ProjectLevelBadgeEnhanced: React.FC<ProjectLevelBadgeEnhancedProps> = ({ 
  level, 
  score, 
  isAnimated = false,
  showNextLevel = false,
  nextLevelInfo,
  compact = false,
  showBudgetInfo = false,
  budgetLimit,
  approvalChain = []
}) => {
  const getLevelConfig = () => {
    switch(level) {
      case 'PENDING': 
        return { 
          label: '議論段階', 
          color: 'gray', 
          icon: '💭', 
          bgGradient: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          description: 'コミュニティで意見収集中',
          budget: null,
          approvalType: null
        };
      case 'TEAM': 
        return { 
          label: 'チームレベル', 
          color: 'green', 
          icon: '👥', 
          bgGradient: 'from-green-400 to-green-600',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          description: '部門内改善提案、業務効率化',
          budget: '予算上限: 5万円',
          approvalType: 'レベル2→レベル3→レベル5承認'
        };
      case 'DEPARTMENT': 
        return { 
          label: '部門レベル', 
          color: 'blue', 
          icon: '🏢', 
          bgGradient: 'from-blue-400 to-blue-600',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-700',
          description: '部門横断的改善、設備導入',
          budget: '予算上限: 20万円',
          approvalType: 'レベル3→レベル4→レベル5承認'
        };
      case 'FACILITY': 
        return { 
          label: '施設レベル', 
          color: 'purple', 
          icon: '🏥', 
          bgGradient: 'from-purple-400 to-purple-600',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-700',
          description: '施設全体の改善、システム導入',
          budget: '予算上限: 1,000万円',
          approvalType: '所属施設のレベル4全員→レベル5→レベル6→レベル7→レベル12'
        };
      case 'ORGANIZATION': 
        return { 
          label: '法人レベル', 
          color: 'orange', 
          icon: '🏛️', 
          bgGradient: 'from-orange-400 to-orange-600',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-700',
          description: '複数施設にわたる戦略的プロジェクト',
          budget: '予算上限: 2,000万円',
          approvalType: '各施設のレベル5全員→レベル6全員→レベル7全員→レベル12→レベル13'
        };
      case 'STRATEGIC':
        return { 
          label: '戦略レベル', 
          color: 'red', 
          icon: '🚀', 
          bgGradient: 'from-red-400 to-red-600',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          description: '経営戦略、M&A、大規模投資',
          budget: '予算: 無制限',
          approvalType: 'レベル12緊急オーバーライド権限行使により発動'
        };
      default: 
        return { 
          label: '議論段階', 
          color: 'gray', 
          icon: '💭', 
          bgGradient: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          description: '状態不明',
          budget: null,
          approvalType: null
        };
    }
  };
  
  const formatBudget = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(0)}千万円`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万円`;
    } else {
      return `${amount.toLocaleString()}円`;
    }
  };

  const config = getLevelConfig();

  if (compact) {
    // モバイル向けコンパクト表示（予算情報付き）
    return (
      <div className="space-y-3">
        {/* タイトル */}
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
              {showBudgetInfo && config.budget && (
                <div className="text-xs opacity-80">{config.budget}</div>
              )}
              {showBudgetInfo && budgetLimit && budgetLimit > 0 && (
                <div className="text-xs opacity-80">上限: {formatBudget(budgetLimit)}</div>
              )}
              {showBudgetInfo && budgetLimit === -1 && (
                <div className="text-xs opacity-80">予算: 無制限</div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold">{Math.round(score)}</span>
            <span className="text-sm opacity-90 ml-1">点</span>
          </div>
        </div>
        
        {/* 承認チェーン情報 */}
        {showBudgetInfo && config.approvalType && (
          <div className={`
            px-3 py-2 rounded-lg bg-gray-50 border ${config.borderColor}
          `}>
            <div className="text-xs text-gray-600 mb-1">承認フロー</div>
            <div className={`text-xs ${config.textColor} font-medium`}>
              {config.approvalType}
            </div>
          </div>
        )}
        
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
                {nextLevelInfo.label.includes('部門') ? '🏢' :
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
          {showBudgetInfo && config.budget && (
            <span className="text-xs opacity-80">{config.budget}</span>
          )}
          {showBudgetInfo && budgetLimit && budgetLimit > 0 && (
            <span className="text-xs opacity-80">上限: {formatBudget(budgetLimit)}</span>
          )}
          {showBudgetInfo && budgetLimit === -1 && (
            <span className="text-xs opacity-80">予算: 無制限</span>
          )}
        </div>
        <div className="ml-2 px-3 py-1 bg-white/20 rounded-full relative z-10">
          <span className="text-sm font-bold">{Math.round(score)}点</span>
        </div>
      </div>

      {/* 承認フロー情報 */}
      {showBudgetInfo && config.approvalType && (
        <div className={`
          flex flex-col gap-1 px-3 py-2 rounded-lg
          bg-gray-50 border ${config.borderColor}
          max-w-xs
        `}>
          <div className="text-xs text-gray-600">承認フロー</div>
          <div className={`text-xs ${config.textColor} font-medium leading-tight`}>
            {config.approvalType}
          </div>
        </div>
      )}

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

export default ProjectLevelBadgeEnhanced;