/**
 * プロジェクトモード設定管理カスタムフック
 *
 * プロジェクトモード設定の取得・更新を管理
 *
 * @file src/hooks/useProjectModeConfig.ts
 * @created 2025-10-26
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ProjectModeConfigResponse,
  UpdateThresholdsRequest,
  UpdateTeamFormationRulesRequest,
  UpdateProgressManagementRequest,
} from '../types/project-mode-config';

const API_BASE = '/api/project-mode/configs';

export interface UseProjectModeConfigResult {
  config: ProjectModeConfigResponse | null;
  loading: boolean;
  error: string | null;
  updateThresholds: (data: UpdateThresholdsRequest) => Promise<boolean>;
  updateTeamFormation: (data: UpdateTeamFormationRulesRequest) => Promise<boolean>;
  updateProgressManagement: (data: UpdateProgressManagementRequest) => Promise<boolean>;
  previewThresholdChanges: (
    thresholds: { department: number; facility: number; corporate: number }
  ) => Promise<any>;
  reload: () => Promise<void>;
}

/**
 * プロジェクトモード設定フック
 */
export function useProjectModeConfig(departmentId: string): UseProjectModeConfigResult {
  const [config, setConfig] = useState<ProjectModeConfigResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 設定を取得
   */
  const fetchConfig = useCallback(async () => {
    if (!departmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/${departmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConfig(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'プロジェクトモード設定の取得に失敗しました';
      setError(errorMessage);
      console.error('Error fetching project mode config:', err);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  /**
   * 閾値設定を更新
   */
  const updateThresholds = useCallback(
    async (data: UpdateThresholdsRequest): Promise<boolean> => {
      if (!departmentId) return false;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE}/${departmentId}/thresholds`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          setConfig(response.data.config);
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || '閾値設定の更新に失敗しました';
        setError(errorMessage);
        console.error('Error updating thresholds:', err);
        return false;
      }
    },
    [departmentId]
  );

  /**
   * チーム編成ルールを更新
   */
  const updateTeamFormation = useCallback(
    async (data: UpdateTeamFormationRulesRequest): Promise<boolean> => {
      if (!departmentId) return false;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE}/${departmentId}/team-formation`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          setConfig(response.data.config);
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'チーム編成ルールの更新に失敗しました';
        setError(errorMessage);
        console.error('Error updating team formation:', err);
        return false;
      }
    },
    [departmentId]
  );

  /**
   * 進捗管理設定を更新
   */
  const updateProgressManagement = useCallback(
    async (data: UpdateProgressManagementRequest): Promise<boolean> => {
      if (!departmentId) return false;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_BASE}/${departmentId}/progress-management`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setConfig(response.data.config);
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || '進捗管理設定の更新に失敗しました';
        setError(errorMessage);
        console.error('Error updating progress management:', err);
        return false;
      }
    },
    [departmentId]
  );

  /**
   * 閾値変更のプレビュー
   */
  const previewThresholdChanges = useCallback(
    async (thresholds: { department: number; facility: number; corporate: number }) => {
      if (!departmentId) return null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_BASE}/${departmentId}/preview`,
          { thresholds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'プレビューの取得に失敗しました';
        setError(errorMessage);
        console.error('Error previewing threshold changes:', err);
        return null;
      }
    },
    [departmentId]
  );

  /**
   * 設定を再読み込み
   */
  const reload = useCallback(async () => {
    await fetchConfig();
  }, [fetchConfig]);

  // 初回読み込み
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    updateThresholds,
    updateTeamFormation,
    updateProgressManagement,
    previewThresholdChanges,
    reload,
  };
}
