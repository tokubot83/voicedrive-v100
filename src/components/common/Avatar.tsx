import React from 'react';

interface AvatarData {
  gradient: string;
  primaryText: string;
  secondaryText: string;
  icon: string;
  borderColor: string;
  textColor: string;
}

interface AvatarProps {
  avatarData: AvatarData;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  avatarData, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-3xl'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${avatarData.gradient} 
        rounded-full 
        flex items-center justify-center 
        border-2 ${avatarData.borderColor}
        shadow-lg 
        relative 
        ${className}
      `}
    >
      {/* メインテキスト（イニシャルまたは部署略称） */}
      {avatarData.primaryText && (
        <span className={`${avatarData.textColor} font-bold ${sizeClasses[size]}`}>
          {avatarData.primaryText}
        </span>
      )}
      
      {/* アイコン表示（テキストがない場合） */}
      {!avatarData.primaryText && avatarData.icon && (
        <span className={iconSizes[size]}>
          {avatarData.icon}
        </span>
      )}
      
      {/* セカンダリテキスト（小さいサイズ時は非表示） */}
      {avatarData.secondaryText && size !== 'xs' && size !== 'sm' && (
        <span 
          className={`
            absolute -bottom-1 -right-1 
            bg-white text-gray-700 
            text-xs font-medium 
            px-1 py-0.5 
            rounded-full 
            border border-gray-200
            ${size === 'md' ? 'text-xs' : 'text-sm'}
          `}
        >
          {avatarData.secondaryText}
        </span>
      )}
      
      {/* アイコンバッジ（大きいサイズ時） */}
      {avatarData.icon && avatarData.primaryText && (size === 'lg' || size === 'xl') && (
        <span 
          className={`
            absolute -top-1 -right-1 
            bg-white 
            w-6 h-6 
            rounded-full 
            flex items-center justify-center 
            border border-gray-200
            text-sm
          `}
        >
          {avatarData.icon}
        </span>
      )}
    </div>
  );
};

export default Avatar;