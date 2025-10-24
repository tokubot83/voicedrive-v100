/**
 * 議題統計取得用カスタムフック
 */

import { useState, useEffect } from 'react';

export interface AgendaStats {
  // 議題提出関連
  submittedAgendas: number;          // 議題として提出された数
  adoptedAgendas: number;            // 委員会で採択された数
  rejectedAgendas: number;           // 委員会で却下された数
  pendingAgendas: number;            // 審議待ちの数

  // 実施状況
  implementingAgendas: number;       // 実施中の改善活動
  completedAgendas: number;          // 完了した改善活動
  pausedAgendas: number;             // 一時停止中の改善活動

  // 委員会別統計
  committeeBreakdown: {
    committeeType: string;
    committeeLevel: string;
    submittedCount: number;
    adoptedCount: number;
    adoptionRate: number;
  }[];

  // スコア
  committeeScore: number;            // 委員会での貢献度スコア（0-100）
  adoptionRate: number;              // 全体採択率（%）
  implementationRate: number;        // 実施完了率（%）

  // 詳細メトリクス
  averageImplementationDays: number; // 平均実施日数
  totalImpactScore: number;          // 総インパクトスコア
}

export interface DepartmentAverage {
  averageCommitteeScore: number;
  averageAdoptionRate: number;
  averageImplementationRate: number;
  totalSubmittedAgendas: number;
}

export function useAgendaStats(userId?: string) {
  const [stats, setStats] = useState<AgendaStats | null>(null);
  const [departmentAverage, setDepartmentAverage] = useState<DepartmentAverage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile/agenda-stats', {
        headers: userId ? { 'x-user-id': userId } : {},
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '議題統計の取得に失敗しました');
      }

      setStats(data.stats);
      setDepartmentAverage(data.departmentAverage);
    } catch (err) {
      console.error('[useAgendaStats] 議題統計取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    departmentAverage,
    loading,
    error,
    refetch: fetchStats,
  };
}
