import React from 'react';
import { Shield, Star, Crown, Award, Users, Briefcase } from 'lucide-react';
import { PermissionLevel, SpecialPermissionLevel } from '../../permissions/types/PermissionTypes';
import { getPermissionMetadata } from '../../permissions/config/permissionMetadata';

interface PermissionLevelBadgeProps {
  level: PermissionLevel | SpecialPermissionLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PermissionLevelBadge: React.FC<PermissionLevelBadgeProps> = ({
  level,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  
  const metadata = getPermissionMetadata(level);
  
  // サイズ設定
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  // レベルに応じたスタイルとアイコン
  const getLevelStyle = () => {
    // システム管理者
    if (level === SpecialPermissionLevel.LEVEL_X) {
      return {
        bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
        text: 'text-white',
        border: 'border-purple-600',
        icon: <Crown className={iconSizes[size]} />,
        label: 'システム管理者'
      };
    }
    
    const numLevel = level as PermissionLevel;
    
    // 最高経営層 (18)
    if (numLevel >= 18) {
      return {
        bg: 'bg-gradient-to-r from-red-600 to-orange-600',
        text: 'text-white',
        border: 'border-red-600',
        icon: <Crown className={iconSizes[size]} />,
        label: metadata.label
      };
    }
    
    // 戦略企画・統括管理 (16-17)
    if (numLevel >= 16) {
      return {
        bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        text: 'text-white',
        border: 'border-indigo-600',
        icon: <Briefcase className={iconSizes[size]} />,
        label: metadata.label
      };
    }
    
    // 人事部 (14-15)
    if (numLevel >= 14) {
      return {
        bg: 'bg-gradient-to-r from-teal-600 to-cyan-600',
        text: 'text-white',
        border: 'border-teal-600',
        icon: <Users className={iconSizes[size]} />,
        label: metadata.label
      };
    }
    
    // 経営層 (12-13)
    if (numLevel >= 12) {
      return {
        bg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        text: 'text-white',
        border: 'border-purple-500',
        icon: <Award className={iconSizes[size]} />,
        label: metadata.label
      };
    }
    
    // 役職者 (5-11)
    if (numLevel >= 5) {
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        text: 'text-white',
        border: 'border-blue-500',
        icon: <Star className={iconSizes[size]} />,
        label: metadata.label
      };
    }
    
    // 一般職員 (1-4.5)
    return {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      text: 'text-white',
      border: 'border-green-500',
      icon: <Shield className={iconSizes[size]} />,
      label: metadata.label
    };
  };
  
  const style = getLevelStyle();
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold ${style.bg} ${style.text} ${sizeStyles[size]} ${className}`}>
      {style.icon}
      {showLabel && (
        <>
          <span>Lv.{level}</span>
          <span className="opacity-90">{style.label}</span>
        </>
      )}
    </div>
  );
};

// 権限レベルリストコンポーネント
export const PermissionLevelList: React.FC<{ selectedLevel?: PermissionLevel | SpecialPermissionLevel }> = ({
  selectedLevel
}) => {
  const allLevels = [
    PermissionLevel.LEVEL_1,
    PermissionLevel.LEVEL_1_5,
    PermissionLevel.LEVEL_2,
    PermissionLevel.LEVEL_2_5,
    PermissionLevel.LEVEL_3,
    PermissionLevel.LEVEL_3_5,
    PermissionLevel.LEVEL_4,
    PermissionLevel.LEVEL_4_5,
    PermissionLevel.LEVEL_5,
    PermissionLevel.LEVEL_6,
    PermissionLevel.LEVEL_7,
    PermissionLevel.LEVEL_8,
    PermissionLevel.LEVEL_9,
    PermissionLevel.LEVEL_10,
    PermissionLevel.LEVEL_11,
    PermissionLevel.LEVEL_12,
    PermissionLevel.LEVEL_13,
    PermissionLevel.LEVEL_14,
    PermissionLevel.LEVEL_15,
    PermissionLevel.LEVEL_16,
    PermissionLevel.LEVEL_17,
    PermissionLevel.LEVEL_18,
    SpecialPermissionLevel.LEVEL_X
  ];
  
  return (
    <div className="space-y-2">
      {allLevels.map(level => {
        const metadata = getPermissionMetadata(level);
        const isSelected = selectedLevel === level;
        
        return (
          <div
            key={level}
            className={`p-3 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <PermissionLevelBadge level={level} size="sm" />
              <span className="text-sm text-gray-600">
                {metadata.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};