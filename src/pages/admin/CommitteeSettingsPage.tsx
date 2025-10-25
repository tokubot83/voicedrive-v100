import React, { useState } from 'react';
import { Users, FileText, Calendar, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { AuditService } from '../../services/AuditService';
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

  // 議題ステータス設定
  const [agendaStatuses, setAgendaStatuses] = useState([
    { id: 'pending', name: '審議待ち', color: '#FFA500', enabled: true },
    { id: 'in_review', name: '審議中', color: '#2196F3', enabled: true },
    { id: 'approved', name: '承認', color: '#4CAF50', enabled: true },
    { id: 'rejected', name: '却下', color: '#F44336', enabled: true },
    { id: 'on_hold', name: '保留', color: '#9E9E9E', enabled: true }
  ]);

  // 優先度レベル設定
  const [priorityLevels, setPriorityLevels] = useState([
    { id: 'critical', name: '緊急', color: '#F44336', enabled: true },
    { id: 'high', name: '高', color: '#FF9800', enabled: true },
    { id: 'normal', name: '通常', color: '#2196F3', enabled: true },
    { id: 'low', name: '低', color: '#9E9E9E', enabled: true }
  ]);

  // 議題タイプ設定
  const [agendaTypes, setAgendaTypes] = useState([
    { id: 'committee_proposal', name: '委員会提案', enabled: true },
    { id: 'facility_policy', name: '施設方針', enabled: true },
    { id: 'hr', name: '人事', enabled: true },
    { id: 'budget', name: '予算', enabled: true },
    { id: 'equipment', name: '設備', enabled: true }
  ]);

  // 会議スケジュール設定
  const [meetingSettings, setMeetingSettings] = useState<Record<string, CommitteeSetting>>({
    defaultMeetingDay: {
      key: 'defaultMeetingDay',
      value: '第2木曜日',
      type: 'string',
      description: 'デフォルト会議開催日',
      category: 'meeting'
    },
    defaultMeetingTime: {
      key: 'defaultMeetingTime',
      value: '14:00',
      type: 'string',
      description: 'デフォルト会議開始時刻',
      category: 'meeting'
    },
    meetingDurationMinutes: {
      key: 'meetingDurationMinutes',
      value: 120,
      type: 'number',
      description: '会議時間（分）',
      category: 'meeting'
    },
    agendaSubmissionDeadlineDays: {
      key: 'agendaSubmissionDeadlineDays',
      value: 7,
      type: 'number',
      description: '議題提出期限（会議の何日前）',
      category: 'meeting'
    },
    minutesPublishDeadlineDays: {
      key: 'minutesPublishDeadlineDays',
      value: 3,
      type: 'number',
      description: '議事録公開期限（会議後何日以内）',
      category: 'meeting'
    }
  });

  // 承認フロー設定
  const [approvalSettings, setApprovalSettings] = useState<Record<string, CommitteeSetting>>({
    requireApproval: {
      key: 'requireApproval',
      value: true,
      type: 'boolean',
      description: '議題提出時の承認を必須にする',
      category: 'approval'
    },
    minApproverLevel: {
      key: 'minApproverLevel',
      value: 8,
      type: 'number',
      description: '承認者の最低権限レベル',
      category: 'approval'
    },
    approvalDeadlineHours: {
      key: 'approvalDeadlineHours',
      value: 48,
      type: 'number',
      description: '承認期限（時間）',
      category: 'approval'
    },
    autoApproveAfterDeadline: {
      key: 'autoApproveAfterDeadline',
      value: false,
      type: 'boolean',
      description: '期限超過後の自動承認',
      category: 'approval'
    },
    notifyApproverByEmail: {
      key: 'notifyApproverByEmail',
      value: true,
      type: 'boolean',
      description: '承認者へのメール通知',
      category: 'approval'
    }
  });

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
    setSaveStatus('saving');

    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);

      AuditService.log({
        userId: user?.id || '',
        action: 'COMMITTEE_SETTINGS_UPDATED',
        details: {
          agendaStatuses: agendaStatuses.map(s => ({ id: s.id, enabled: s.enabled })),
          priorityLevels: priorityLevels.map(p => ({ id: p.id, enabled: p.enabled })),
          agendaTypes: agendaTypes.map(t => ({ id: t.id, enabled: t.enabled })),
          meetingSettings: Object.fromEntries(
            Object.entries(meetingSettings).map(([k, v]) => [k, v.value])
          ),
          approvalSettings: Object.fromEntries(
            Object.entries(approvalSettings).map(([k, v]) => [k, v.value])
          )
        },
        severity: 'high'
      });

      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
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
