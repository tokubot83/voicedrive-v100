/**
 * ユーザープロフィール取得・更新用カスタムフック
 */

import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  userId: string;
  motto: string | null;
  selfIntroduction: string | null;
  hobbies: string | null;
  coverImage: string | null;
  profileCompleteRate: number;
  privacyLevel: string;
  lastProfileUpdate: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    role: string | null;
    profilePhotoUrl: string | null;
  };
}

export interface UserStats {
  postsCount: number;
  votesCount: number;
  commentsCount: number;
  experienceYears: number;
  totalExperience: number;
  previousExperience: number;
  skills: string[];
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // プロフィール情報を取得
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile', {
        headers: userId ? { 'x-user-id': userId } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'プロフィールの取得に失敗しました');
      }

      setProfile(data.profile);
    } catch (err) {
      console.error('[useUserProfile] プロフィール取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  // 統計情報を取得
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/profile/stats', {
        headers: userId ? { 'x-user-id': userId } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '統計情報の取得に失敗しました');
      }

      setStats(data.stats);
    } catch (err) {
      console.error('[useUserProfile] 統計情報取得エラー:', err);
      // 統計情報はエラーでもプロフィールは表示させる
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: {
    motto?: string | null;
    selfIntroduction?: string | null;
    hobbies?: string | null;
    coverImage?: string | null;
    privacyLevel?: string;
  }) => {
    try {
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'プロフィールの更新に失敗しました');
      }

      setProfile(data.profile);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      console.error('[useUserProfile] プロフィール更新エラー:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [userId]);

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    refetch: () => {
      fetchProfile();
      fetchStats();
    },
  };
}
