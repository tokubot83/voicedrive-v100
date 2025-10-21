/**
 * Phase 2: 顔写真統合 - PhotoAvatarコンポーネント
 *
 * CloudFront CDN経由の職員写真を表示するアバターコンポーネント
 *
 * 機能:
 * - profilePhotoUrl（CloudFront URL）からの画像表示
 * - 画像未登録時のフォールバック（既存のイラストアバター表示）
 * - 画像読み込み失敗時のフォールバック（既存のイラストアバター表示）
 * - レスポンシブサイズ対応
 *
 * @module PhotoAvatar
 */

import React, { useState } from 'react';
import Avatar from './Avatar';

interface AvatarData {
  gradient: string;
  shadowClass?: string;
  icon: string;
  borderColor: string;
  isRichGradient?: boolean;
}

interface PhotoAvatarProps {
  /** 職員名（イニシャル表示用） */
  name: string;
  /** CloudFront CDN URL */
  profilePhotoUrl?: string | null;
  /** アバターサイズ */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 追加のCSSクラス */
  className?: string;
  /** フォールバック用のイラストアバターデータ（avatarGenerator生成） */
  fallbackAvatarData?: AvatarData;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl'
};

/**
 * PhotoAvatarコンポーネント
 *
 * 優先順位:
 * 1. profilePhotoUrl が存在する場合 → 写真を表示
 * 2. profilePhotoUrl が null または画像読み込み失敗 → fallbackAvatarData のイラスト表示
 * 3. fallbackAvatarData も null → イニシャル表示（デフォルト）
 *
 * @example
 * ```tsx
 * // 写真URLあり
 * <PhotoAvatar
 *   name="山田太郎"
 *   profilePhotoUrl="https://medical-system.example.com/employees/EMP-2025-001.jpg"
 *   size="md"
 * />
 *
 * // 写真URLなし、イラストアバターあり
 * <PhotoAvatar
 *   name="山田太郎"
 *   size="md"
 *   fallbackAvatarData={generatePersonalAvatar(user)}
 * />
 *
 * // すべてなし（イニシャル表示）
 * <PhotoAvatar
 *   name="山田太郎"
 *   size="md"
 * />
 * ```
 */
const PhotoAvatar: React.FC<PhotoAvatarProps> = ({
  name,
  profilePhotoUrl,
  size = 'md',
  className = '',
  fallbackAvatarData
}) => {
  const [imageError, setImageError] = useState(false);

  // CloudFront URLが存在し、かつ画像読み込みエラーがない場合は写真を表示
  const shouldShowPhoto = profilePhotoUrl && !imageError;

  // イニシャル取得（姓名の最初の1文字ずつ、最大2文字）
  const getInitials = (fullName: string): string => {
    const nameParts = fullName.trim().split(/\s+/);

    if (nameParts.length >= 2) {
      // 姓名がある場合: 姓の1文字目 + 名の1文字目
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    } else {
      // 姓のみの場合: 最初の1文字
      return fullName.charAt(0).toUpperCase();
    }
  };

  const initials = getInitials(name);

  // 画像読み込みエラーハンドラー
  const handleImageError = () => {
    console.warn(`[PhotoAvatar] 画像読み込み失敗: ${profilePhotoUrl}`);
    setImageError(true);
  };

  // 優先順位1: 写真を表示
  if (shouldShowPhoto) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <img
          src={profilePhotoUrl}
          alt={`${name}のプロフィール写真`}
          className={`
            ${sizeClasses[size]}
            rounded-full
            object-cover
            border-2 border-gray-300 dark:border-slate-600
            shadow-md
            transition-all duration-300 ease-in-out
            hover:shadow-lg hover:scale-105
          `}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // 優先順位2: イラストアバターを表示（既存のavatar generatorの出力）
  if (fallbackAvatarData) {
    return (
      <Avatar
        avatarData={fallbackAvatarData}
        size={size}
        className={className}
      />
    );
  }

  // 優先順位3: イニシャル表示（フォールバック）
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br from-blue-500 to-purple-600
        flex items-center justify-center
        text-white font-semibold
        border-2 border-gray-300 dark:border-slate-600
        shadow-md
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105
        ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  );
};

export default PhotoAvatar;
