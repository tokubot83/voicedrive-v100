// プロフィール管理カスタムフック
import { useState, useCallback } from 'react';
import { MedicalProfile } from '../types/profile';
import { ExperienceCalculationEngine } from '../services/ExperienceCalculationEngine';

export const useProfile = (initialProfile?: MedicalProfile) => {
  const [profile, setProfile] = useState<MedicalProfile | null>(initialProfile || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィール更新
  const updateProfile = useCallback(async (updatedProfile: MedicalProfile) => {
    setLoading(true);
    setError(null);
    
    try {
      // ここで実際のAPI呼び出しを行う
      // const response = await api.updateProfile(updatedProfile);
      
      // デモ用：そのまま更新
      setProfile(updatedProfile);
      
      // 成功通知など
      console.log('プロフィールが更新されました');
      
      return updatedProfile;
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 投票重みを再計算
  const recalculateVotingWeight = useCallback(() => {
    if (!profile) return;

    const engine = new ExperienceCalculationEngine();
    const experience = engine.calculateExperience(
      profile.hireDate,
      profile.previousExperience
    );
    
    const votingWeight = engine.calculateVotingWeight(
      profile.profession,
      profile.position,
      experience.totalExperience
    );

    setProfile(prev => prev ? {
      ...prev,
      votingWeight,
      experienceYears: experience.currentExperience,
      totalExperience: experience.totalExperience
    } : null);
  }, [profile]);

  // プロフィール完成度を計算
  const calculateCompleteness = useCallback(() => {
    if (!profile) return 0;

    const engine = new ExperienceCalculationEngine();
    return engine.calculateProfileCompleteness(profile);
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    recalculateVotingWeight,
    calculateCompleteness
  };
};