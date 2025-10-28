import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, Save, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';

/**
 * 委員会設定ページ（Level 99専用）
 *
 * 役割: 委員会システムの業務設定を管理
 * - 議題ステータス・優先度の定義
 * - 会議スケジュール設定
 * - 提出承認フロー設定
 *
 * アクセス: SystemOperationsPage > 委員会設定カード
 */

interface CommitteeSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  category: string;
}

export const CommitteeSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // 議題ステータス設定
  const [agendaStatuses, setAgendaStatuses] = useState<any[]>([]);

  // 優先度レベル設定
  const [priorityLevels, setPriorityLevels] = useState<any[]>([]);

  // 議題タイプ設定
  const [agendaTypes, setAgendaTypes] = useState<any[]>([]);

  // 会議スケジュール設定
  const [meetingSettings, setMeetingSettings] = useState<Record<string, CommitteeSetting>>({});

  // 承認フロー設定
  const [approvalSettings, setApprovalSettings] = useState<Record<string, CommitteeSetting>>({});

  // 初期データ取得
  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        setLoading(true);

        // 並列でデータ取得
        const [statusesRes, prioritiesRes, typesRes, meetingRes, approvalRes] = await Promise.all([
          fetch('/api/committee/settings/statuses'),
          fetch('/api/committee/settings/priorities'),
          fetch('/api/committee/settings/types'),
          fetch('/api/committee/settings/meeting'),
          fetch('/api/committee/settings/approval'),
        ]);

        const statusesData = await statusesRes.json();
        const prioritiesData = await prioritiesRes.json();
        const typesData = await typesRes.json();
        const meetingData = await meetingRes.json();
        const approvalData = await approvalRes.json();

        // ステータスを設定（statusId → id にマッピング）
        setAgendaStatuses(
          statusesData.statuses.map((s: any) => ({
            id: s.statusId,
            name: s.name,
            color: s.color,
            enabled: s.enabled,
          }))
        );

        // 優先度を設定（priorityId → id にマッピング）
        setPriorityLevels(
          prioritiesData.priorities.map((p: any) => ({
            id: p.priorityId,
            name: p.name,
            color: p.color,
            enabled: p.enabled,
          }))
        );

        // タイプを設定（typeId → id にマッピング）
        setAgendaTypes(
          typesData.types.map((t: any) => ({
            id: t.typeId,
            name: t.name,
            enabled: t.enabled,
          }))
        );

        // 会議設定を変換
        const meetingSettingsObj: Record<string, CommitteeSetting> = {};
        const settingDescriptions: Record<string, string> = {
          defaultMeetingDay: 'デフォルト会議開催日',
          defaultMeetingTime: 'デフォルト会議開始時刻',
          meetingDurationMinutes: '会議時間（分）',
          agendaSubmissionDeadlineDays: '議題提出期限（会議の何日前）',
          minutesPublishDeadlineDays: '議事録公開期限（会議後何日以内）',
        };

        Object.entries(meetingData.settings).forEach(([key, value]) => {
          meetingSettingsObj[key] = {
            key,
            value: value as string | number | boolean,
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
            description: settingDescriptions[key] || key,
            category: 'meeting',
          };
        });
        setMeetingSettings(meetingSettingsObj);

        // 承認設定を変換
        const approvalSettingsObj: Record<string, CommitteeSetting> = {};
        const approvalDescriptions: Record<string, string> = {
          requireApproval: '議題提出時の承認を必須にする',
          minApproverLevel: '承認者の最低権限レベル',
          approvalDeadlineHours: '承認期限（時間）',
          autoApproveAfterDeadline: '期限超過後の自動承認',
          notifyApproverByEmail: '承認者へのメール通知',
        };

        Object.entries(approvalData.settings).forEach(([key, value]) => {
          approvalSettingsObj[key] = {
            key,
            value: value as string | number | boolean,
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
            description: approvalDescriptions[key] || key,
            category: 'approval',
          };
        });
        setApprovalSettings(approvalSettingsObj);

        setLoading(false);
      } catch (error) {
        console.error('設定取得エラー:', error);
        setSaveStatus('error');
        setLoading(false);
      }
    };

    fetchAllSettings();
  }, []);

  const handleStatusToggle = (id: string) => {
    setHasChanges(true);
    setSaveStatus('idle');
    setAgendaStatuses(prev =>
      prev.map(status => (status.id === id ? { ...status, enabled: !status.enabled } : status))
    );
  };

  const handlePriorityToggle = (id: string) => {
    setHasChanges(true);
    setSaveStatus('idle');
    setPriorityLevels(prev =>
      prev.map(priority => (priority.id === id ? { ...priority, enabled: !priority.enabled } : priority))
    );
  };

  const handleTypeToggle = (id: string) => {
    setHasChanges(true);
    setSaveStatus('idle');
    setAgendaTypes(prev =>
      prev.map(type => (type.id === id ? { ...type, enabled: !type.enabled } : type))
    );
  };

  const handleSettingChange = (
    category: 'meeting' | 'approval',
    key: string,
    value: any
  ) => {
    setHasChanges(true);
    setSaveStatus('idle');

    if (category === 'meeting') {
      setMeetingSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    } else {
      setApprovalSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');

      // 並列で保存
      await Promise.all([
        // ステータス更新
        fetch('/api/committee/settings/statuses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statuses: agendaStatuses.map((s) => ({
              statusId: s.id,
              enabled: s.enabled,
            })),
            userId: user?.id,
          }),
        }),

        // 優先度更新
        fetch('/api/committee/settings/priorities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priorities: priorityLevels.map((p) => ({
              priorityId: p.id,
              enabled: p.enabled,
            })),
            userId: user?.id,
          }),
        }),

        // タイプ更新
        fetch('/api/committee/settings/types', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            types: agendaTypes.map((t) => ({
              typeId: t.id,
              enabled: t.enabled,
            })),
            userId: user?.id,
          }),
        }),

        // 会議設定更新
        fetch('/api/committee/settings/meeting', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: Object.fromEntries(
              Object.entries(meetingSettings).map(([k, v]) => [k, v.value])
            ),
            userId: user?.id,
          }),
        }),

        // 承認設定更新
        fetch('/api/committee/settings/approval', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: Object.fromEntries(
              Object.entries(approvalSettings).map(([k, v]) => [k, v.value])
            ),
            userId: user?.id,
          }),
        }),
      ]);

      setSaveStatus('saved');
      setHasChanges(false);

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('保存エラー:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('すべての変更を破棄してよろしいですか？')) {
      setHasChanges(false);
      setSaveStatus('idle');
    }
  };

  const renderSettingInput = (
    setting: CommitteeSetting,
    category: 'meeting' | 'approval'
  ) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(category, setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => handleSettingChange(category, setting.key, parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
          />
        );

      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(category, setting.key, e.target.value)}
            className="px-3 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
          />
        );
    }
  };

  const tabs = [
    { id: 'status', label: 'ステータス・優先度', icon: FileText },
    { id: 'meeting', label: '会議スケジュール', icon: Calendar },
    { id: 'approval', label: '承認フロー', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-green-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🏛️</span>
            委員会設定
          </h1>
          <p className="text-gray-300">
            委員会システムの業務設定を管理します（ステータス、会議、承認フロー）
          </p>
        </div>

        {/* 警告メッセージ */}
        {hasChanges && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200">未保存の変更があります</span>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur border border-gray-700/50 mb-6">
          <nav className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-6 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 設定コンテンツ */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
          {/* ステータス・優先度 */}
          {activeTab === 'status' && (
            <div className="space-y-8">
              {/* 議題ステータス */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  議題ステータス
                </h2>
                <div className="space-y-3">
                  {agendaStatuses.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <h4 className="text-white font-medium">{status.name}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={status.enabled}
                          onChange={() => handleStatusToggle(status.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 優先度レベル */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">優先度レベル</h2>
                <div className="space-y-3">
                  {priorityLevels.map((priority) => (
                    <div
                      key={priority.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <h4 className="text-white font-medium">{priority.name}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={priority.enabled}
                          onChange={() => handlePriorityToggle(priority.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 議題タイプ */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">議題タイプ</h2>
                <div className="space-y-3">
                  {agendaTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{type.name}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={type.enabled}
                          onChange={() => handleTypeToggle(type.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 会議スケジュール設定 */}
          {activeTab === 'meeting' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                会議スケジュール設定
              </h2>
              <div className="space-y-6">
                {Object.entries(meetingSettings).map(([key, setting]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{setting.description}</h4>
                      <p className="text-sm text-gray-400 mt-1">設定キー: {setting.key}</p>
                    </div>
                    <div className="ml-4">{renderSettingInput(setting, 'meeting')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 承認フロー設定 */}
          {activeTab === 'approval' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                承認フロー設定
              </h2>
              <div className="space-y-6">
                {Object.entries(approvalSettings).map(([key, setting]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{setting.description}</h4>
                      <p className="text-sm text-gray-400 mt-1">設定キー: {setting.key}</p>
                    </div>
                    <div className="ml-4">{renderSettingInput(setting, 'approval')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            リセット
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '保存しました' : '設定を保存'}
          </button>
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};
