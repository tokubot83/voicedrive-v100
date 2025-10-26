import React, { useState, useEffect } from 'react';
import { useProjectModeConfig } from '../../hooks/useProjectModeConfig';
import {
  ProjectModeThresholds,
  EmergencyEscalationConfig,
  TeamFormationRules,
  MilestoneConfig,
  NotificationSettings,
  DEFAULT_PROJECT_MODE_CONFIG,
} from '../../types/project-mode-config';

/**
 * プロジェクトモード設定ページ（API連携版）
 * - プロジェクト化閾値設定
 * - チーム編成ルール設定
 * - 進捗管理設定
 */
export const ProjectModeSettingsPageEnhanced: React.FC = () => {
  const departmentId = 'DEPT-001'; // TODO: 実際は選択または認証から取得
  const {
    config,
    loading,
    error,
    updateThresholds,
    updateTeamFormation,
    updateProgressManagement,
    previewThresholdChanges,
    reload,
  } = useProjectModeConfig(departmentId);

  const [activeSection, setActiveSection] = useState<'threshold' | 'team' | 'progress'>('threshold');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // フォーム状態
  const [thresholds, setThresholds] = useState<ProjectModeThresholds>(
    DEFAULT_PROJECT_MODE_CONFIG.thresholds
  );
  const [emergencyEscalation, setEmergencyEscalation] = useState<EmergencyEscalationConfig>(
    DEFAULT_PROJECT_MODE_CONFIG.emergencyEscalation
  );
  const [teamFormationRules, setTeamFormationRules] = useState<TeamFormationRules>(
    DEFAULT_PROJECT_MODE_CONFIG.teamFormationRules
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_PROJECT_MODE_CONFIG.notifications
  );
  const [milestoneRequired, setMilestoneRequired] = useState(
    DEFAULT_PROJECT_MODE_CONFIG.milestoneRequired
  );
  const [progressReportFrequency, setProgressReportFrequency] = useState<
    'weekly' | 'biweekly' | 'monthly'
  >(DEFAULT_PROJECT_MODE_CONFIG.progressReportFrequency);

  // 設定データ読み込み時にフォーム状態を更新
  useEffect(() => {
    if (config && config.metadata) {
      setThresholds(config.metadata.thresholds);
      setEmergencyEscalation(config.metadata.emergencyEscalation);
      setTeamFormationRules(config.teamFormationRules);
      setNotifications(config.metadata.notifications);
      setMilestoneRequired(config.milestoneRequired);
      setProgressReportFrequency(config.progressReportFrequency);
    }
  }, [config]);

  // 保存成功メッセージの自動非表示
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // 閾値設定を保存
  const handleSaveThresholds = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await updateThresholds({ thresholds, emergencyEscalation });

    if (success) {
      setSaveSuccess(true);
    } else {
      setSaveError(error || '保存に失敗しました');
    }

    setIsSaving(false);
  };

  // チーム編成ルールを保存
  const handleSaveTeamFormation = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await updateTeamFormation({ teamFormationRules });

    if (success) {
      setSaveSuccess(true);
    } else {
      setSaveError(error || '保存に失敗しました');
    }

    setIsSaving(false);
  };

  // 進捗管理設定を保存
  const handleSaveProgressManagement = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await updateProgressManagement({
      milestoneRequired,
      progressReportFrequency,
      milestones: config?.metadata?.milestones || DEFAULT_PROJECT_MODE_CONFIG.milestones,
      notifications,
    });

    if (success) {
      setSaveSuccess(true);
    } else {
      setSaveError(error || '保存に失敗しました');
    }

    setIsSaving(false);
  };

  // プレビューを表示
  const handlePreview = async () => {
    if (activeSection === 'threshold') {
      const preview = await previewThresholdChanges(thresholds);
      if (preview) {
        setPreviewData(preview);
        setShowPreview(true);
      }
    }
  };

  // 保存ハンドラー（現在のセクションに応じて）
  const handleSave = () => {
    switch (activeSection) {
      case 'threshold':
        handleSaveThresholds();
        break;
      case 'team':
        handleSaveTeamFormation();
        break;
      case 'progress':
        handleSaveProgressManagement();
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">設定を読み込んでいます...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 保存成功メッセージ */}
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span className="text-green-400 text-sm">設定を保存しました</span>
          </div>
        </div>
      )}

      {/* 保存エラーメッセージ */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-400 text-sm">{saveError}</span>
          </div>
        </div>
      )}

      {/* セクション選択タブ */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection('threshold')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${
                activeSection === 'threshold'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">📊</span>
              <span>プロジェクト化閾値</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('team')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${
                activeSection === 'team'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">👥</span>
              <span>チーム編成ルール</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('progress')}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-all
              ${
                activeSection === 'progress'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">📈</span>
              <span>進捗管理設定</span>
            </div>
          </button>
        </div>
      </div>

      {/* プロジェクト化閾値設定 */}
      {activeSection === 'threshold' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">📊</span>
              <span>プロジェクト化閾値設定</span>
            </h2>
            <p className="text-sm text-slate-400">
              アイデアボイスがプロジェクト化される条件を設定します
            </p>
          </div>

          {/* スコア閾値設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">スコア閾値</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">部署プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">部署内でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={thresholds.department}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, department: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">施設プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">施設横断でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={thresholds.facility}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, facility: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">法人プロジェクト化</div>
                  <div className="text-xs text-slate-400 mt-1">法人全体でプロジェクトチームを編成</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={thresholds.corporate}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, corporate: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">点以上</span>
                </div>
              </div>
            </div>
          </div>

          {/* 緊急昇格設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">緊急昇格設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">緊急昇格を有効化</div>
                  <div className="text-xs text-slate-400 mt-1">管理職が重要案件を即座にプロジェクト化</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyEscalation.enabled}
                    onChange={(e) =>
                      setEmergencyEscalation({ ...emergencyEscalation, enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最低必要レベル</div>
                  <div className="text-xs text-slate-400 mt-1">緊急昇格を実行できる最低権限レベル</div>
                </div>
                <select
                  value={emergencyEscalation.requiredLevel}
                  onChange={(e) =>
                    setEmergencyEscalation({
                      ...emergencyEscalation,
                      requiredLevel: parseInt(e.target.value),
                    })
                  }
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white"
                >
                  <option value="8">Level 8 (部長)</option>
                  <option value="10">Level 10 (施設長)</option>
                  <option value="12">Level 12 (経営幹部)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チーム編成ルール */}
      {activeSection === 'team' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">👥</span>
              <span>チーム編成ルール設定</span>
            </h2>
            <p className="text-sm text-slate-400">
              プロジェクトチームの自動編成ルールを設定します
            </p>
          </div>

          {/* チームサイズ設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">チームサイズ</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最小チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">プロジェクトチームの最小人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={teamFormationRules.teamSize.min}
                    onChange={(e) =>
                      setTeamFormationRules({
                        ...teamFormationRules,
                        teamSize: { ...teamFormationRules.teamSize, min: parseInt(e.target.value) || 2 },
                      })
                    }
                    min={2}
                    max={10}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">推奨チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">効率的なプロジェクト運営のための推奨人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={teamFormationRules.teamSize.recommended}
                    onChange={(e) =>
                      setTeamFormationRules({
                        ...teamFormationRules,
                        teamSize: {
                          ...teamFormationRules.teamSize,
                          recommended: parseInt(e.target.value) || 3,
                        },
                      })
                    }
                    min={3}
                    max={15}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">最大チームサイズ</div>
                  <div className="text-xs text-slate-400 mt-1">プロジェクトチームの最大人数</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={teamFormationRules.teamSize.max}
                    onChange={(e) =>
                      setTeamFormationRules({
                        ...teamFormationRules,
                        teamSize: { ...teamFormationRules.teamSize, max: parseInt(e.target.value) || 5 },
                      })
                    }
                    min={5}
                    max={30}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">名</span>
                </div>
              </div>
            </div>
          </div>

          {/* 専門性考慮設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">専門性考慮設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">職種バランスを考慮</div>
                  <div className="text-xs text-slate-400 mt-1">多様な職種でチームを編成</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamFormationRules.diversityRules.considerSpecialtyBalance}
                    onChange={(e) =>
                      setTeamFormationRules({
                        ...teamFormationRules,
                        diversityRules: {
                          ...teamFormationRules.diversityRules,
                          considerSpecialtyBalance: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">関連部署を優先</div>
                  <div className="text-xs text-slate-400 mt-1">議題に関連する部署のメンバーを優先</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamFormationRules.diversityRules.prioritizeRelatedDepartments}
                    onChange={(e) =>
                      setTeamFormationRules({
                        ...teamFormationRules,
                        diversityRules: {
                          ...teamFormationRules.diversityRules,
                          prioritizeRelatedDepartments: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 進捗管理設定 */}
      {activeSection === 'progress' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
              <span className="text-2xl">📈</span>
              <span>進捗管理設定</span>
            </h2>
            <p className="text-sm text-slate-400">プロジェクトの進捗管理とマイルストーン設定</p>
          </div>

          {/* 通知設定 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-4">進捗通知設定</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">期限前通知</div>
                  <div className="text-xs text-slate-400 mt-1">マイルストーン期限の何日前に通知</div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={notifications.deadlineReminderDays}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        deadlineReminderDays: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    max={14}
                    className="w-20 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-white text-center"
                  />
                  <span className="text-slate-400">日前</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">遅延アラート</div>
                  <div className="text-xs text-slate-400 mt-1">期限超過時に管理者に自動通知</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.delayAlert}
                    onChange={(e) =>
                      setNotifications({ ...notifications, delayAlert: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-300">週次進捗レポート</div>
                  <div className="text-xs text-slate-400 mt-1">チームリーダーに週次で進捗状況を通知</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReport}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyReport: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => reload()}
          className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 transition-colors"
          disabled={isSaving}
        >
          リセット
        </button>
        {activeSection === 'threshold' && (
          <button
            onClick={handlePreview}
            className="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
            disabled={isSaving}
          >
            プレビュー
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      {/* プレビューモーダル */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">設定変更のプレビュー</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {previewData.affectedProjects}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">影響を受ける案件</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {previewData.upgradedProjects}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">昇格</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {previewData.downgradedProjects}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">降格</div>
                  </div>
                </div>
              </div>

              {previewData.details && previewData.details.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">変更される案件:</h4>
                  {previewData.details.slice(0, 10).map((detail: any, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-900/50 border border-slate-700/30 rounded p-3 text-sm"
                    >
                      <div className="text-white font-medium">{detail.title}</div>
                      <div className="text-slate-400 text-xs mt-1">
                        スコア: {detail.currentScore}点 → {detail.currentLevel} から{' '}
                        {detail.newLevel}へ
                      </div>
                    </div>
                  ))}
                  {previewData.details.length > 10 && (
                    <div className="text-slate-400 text-xs text-center">
                      他 {previewData.details.length - 10} 件
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
