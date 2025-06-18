import React from 'react';

interface AvatarData {
  gradient: string;
  shadowClass?: string;
  primaryText: string;
  secondaryText: string;
  icon: string;
  borderColor: string;
  textColor: string;
  isRichGradient?: boolean;
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

  // サイズ別のシャドウ強度
  const shadowIntensity = {
    xs: '',
    sm: 'shadow-md',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  // サイズ別のハイライト表示
  const showHighlight = size === 'lg' || size === 'xl';

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
        ${shadowIntensity[size]} ${avatarData.shadowClass || ''}
        relative 
        overflow-hidden
        transition-all duration-300 ease-in-out
        hover:transform hover:scale-105 hover:-translate-y-0.5
        hover:shadow-2xl
        cursor-pointer
        ${className}
      `}
      style={{
        boxShadow: avatarData.isRichGradient && (size === 'lg' || size === 'xl') 
          ? `
            0 10px 25px rgba(0,0,0,0.15),
            0 5px 10px rgba(0,0,0,0.1),
            inset 0 2px 4px rgba(255,255,255,0.3)
          `
          : undefined
      }}
    >
      {/* 内側のハイライト効果 */}
      {showHighlight && avatarData.isRichGradient && (
        <>
          <div 
            className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full opacity-80"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
              filter: 'blur(2px)'
            }}
          />
          {size === 'xl' && (
            <div 
              className="absolute top-[60%] right-[10%] w-[20%] h-[20%] rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)',
                filter: 'blur(3px)'
              }}
            />
          )}
        </>
      )}
      
      {/* 小サイズ用の簡易グラデーションオーバーレイ */}
      {(size === 'xs' || size === 'sm') && avatarData.isRichGradient && (
        <div 
          className="absolute inset-0 rounded-full opacity-10"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))'
          }}
        />
      )}
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
            bg-gradient-to-br from-white to-gray-100
            w-6 h-6 
            rounded-full 
            flex items-center justify-center 
            border border-gray-200
            text-sm
            shadow-md
            transition-all duration-300
            group-hover:scale-110
          `}
        >
          {avatarData.icon}
        </span>
      )}
    </div>
  );
};

export default Avatar;