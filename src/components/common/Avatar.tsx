import React from 'react';

interface AvatarData {
  gradient: string;
  shadowClass?: string;
  icon: string;
  borderColor: string;
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
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
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
      {/* アイコンを中央に表示 */}
      <span className={`${iconSizes[size]} flex items-center justify-center`}>
        {avatarData.icon}
      </span>
      
    </div>
  );
};

export default Avatar;