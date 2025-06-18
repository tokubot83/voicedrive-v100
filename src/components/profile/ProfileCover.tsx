import React from 'react';
import { generateProfileCover, generateFacilityCover, CoverPattern } from '../../utils/profileCoverGenerator';
import { User } from '../../types';

interface ProfileCoverProps {
  user?: User;
  facility?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOverlay?: boolean;
}

const ProfileCover: React.FC<ProfileCoverProps> = ({
  user,
  facility,
  height = 'md',
  className = '',
  showOverlay = true
}) => {
  const heightClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-64'
  };

  // カバーデータ生成
  const coverData = user 
    ? generateProfileCover(user)
    : facility 
    ? generateFacilityCover(facility)
    : { pattern: { type: 'gradient', colors: 'from-gray-400 to-gray-600', opacity: 0.8 }, svgPattern: '' };

  const { pattern, svgPattern } = coverData;

  return (
    <div 
      className={`
        ${heightClasses[height]}
        relative overflow-hidden rounded-lg
        bg-gradient-to-br ${pattern.colors}
        ${className}
      `}
      style={{
        opacity: pattern.opacity || 0.85
      }}
    >
      {/* SVGパターンオーバーレイ */}
      {svgPattern && (
        <div 
          className="absolute inset-0 opacity-60"
          dangerouslySetInnerHTML={{ __html: svgPattern }}
        />
      )}
      
      {/* グラデーションオーバーレイ */}
      {showOverlay && (
        <div className="absolute inset-0">
          {/* トップからボトムへの薄いグラデーション */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
            }}
          />
          
          {/* 微細なノイズテクスチャ */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3Ccircle cx='52' cy='22' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
      )}
      
      {/* 光沢効果 */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 opacity-20"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
        }}
      />
      
      {/* アニメーション光沢（ホバー時） */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-700"
        style={{
          background: `
            linear-gradient(
              105deg,
              transparent 40%,
              rgba(255, 255, 255, 0.2) 50%,
              transparent 60%
            )
          `,
          animation: 'shimmer 3s infinite'
        }}
      />
      
      {/* コンテンツエリア（子要素用） */}
      <div className="absolute inset-0 flex items-end justify-start p-4">
        <div className="text-white">
          {/* ここに追加のコンテンツを配置可能 */}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProfileCover;