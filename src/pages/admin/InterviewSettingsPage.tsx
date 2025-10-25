import React, { useState } from 'react';
import { Calendar, Clock, Users, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { AuditService } from '../../services/AuditService';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';

/**
 * 面談設定ページ（Level 99専用）
 *
 * 役割: 面談システムの業務設定を管理
 * - 面談タイプの有効化/無効化
 * - 面談スケジュール設定（時間帯、枠数）
 * - 予約制限設定（雇用状況別）
 * - カテゴリ管理
 *
 * アクセス: SystemOperationsPage > 面談設定カード
 */

interface InterviewSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select' | 'time';
  options?: string[];
  description: string;
  category: string;
}

export const InterviewSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('types');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // 面談タイプ設定
  const [interviewTypes, setInterviewTypes] = useState([
    { id: 'new_employee_monthly', name: '新入職員月次面談', enabled: true, frequency: '月1回' },
    { id: 'regular_annual', name: '一般職員年次面談', enabled: true, frequency: '年1回' },
    { id: 'management_biannual', name: '管理職半年面談', enabled: true, frequency: '半年1回' },
    { id: 'return_to_work', name: '復職面談', enabled: true, frequency: '復職時' },
    { id: 'incident_followup', name: 'インシデント後面談', enabled: true, frequency: '発生時' },
    { id: 'exit_interview', name: '退職面談', enabled: true, frequency: '退職前' },
    { id: 'feedback', name: 'フィードバック面談', enabled: true, frequency: '随時' },
    { id: 'career_support', name: 'キャリア系面談', enabled: true, frequency: '随時' },
    { id: 'workplace_support', name: '職場環境系面談', enabled: true, frequency: '随時' },
    { id: 'individual_consultation', name: '個別相談面談', enabled: true, frequency: '随時' }
  ]);

  // スケジュール設定
  const [scheduleSettings, setScheduleSettings] = useState<Record<string, InterviewSetting>>({
    startTime: {
      key: 'startTime',
      value: '13:40',
      type: 'time',
      description: '面談開始時刻',
      category: 'schedule'
    },
    endTime: {
      key: 'endTime',
      value: '16:50',
      type: 'time',
      description: '面談終了時刻',
      category: 'schedule'
    },
    slotDuration: {
      key: 'slotDuration',
      value: 30,
      type: 'number',
      description: '1回あたりの面談時間（分）',
      category: 'schedule'
    },
    maxSlotsPerDay: {
      key: 'maxSlotsPerDay',
      value: 6,
      type: 'number',
      description: '1日の最大面談枠数',
      category: 'schedule'
    },
    nightShiftSlots: {
      key: 'nightShiftSlots',
      value: true,
      type: 'boolean',
      description: '夜勤者向け特別時間帯',
      category: 'schedule'
    },
    advanceBookingDays: {
      key: 'advanceBookingDays',
      value: 30,
      type: 'number',
      description: '予約可能期間（日）',
      category: 'schedule'
    }
  });

  // 予約制限設定
  const [restrictionSettings, setRestrictionSettings] = useState<Record<string, InterviewSetting>>({
    newEmployeeRequired: {
      key: 'newEmployeeRequired',
      value: true,
      type: 'boolean',
      description: '新入職員の月次面談を必須にする',
      category: 'restriction'
    },
    newEmployeeMonthlyLimit: {
      key: 'newEmployeeMonthlyLimit',
      value: 1,
      type: 'number',
      description: '新入職員の月間予約上限',
      category: 'restriction'
    },
    regularEmployeeAnnualLimit: {
      key: 'regularEmployeeAnnualLimit',
      value: 1,
      type: 'number',
      description: '一般職員の年間予約上限',
      category: 'restriction'
    },
    managementBiannualLimit: {
      key: 'managementBiannualLimit',
      value: 2,
      type: 'number',
      description: '管理職の年間予約上限',
      category: 'restriction'
    },
    casualInterviewMonthlyLimit: {
      key: 'casualInterviewMonthlyLimit',
      value: 3,
      type: 'number',
      description: '随時面談の月間予約上限',
      category: 'restriction'
    },
    cancellationDeadlineHours: {
      key: 'cancellationDeadlineHours',
      value: 24,
      type: 'number',
      description: 'キャンセル期限（時間前）',
      category: 'restriction'
    }
  });

  const handleInterviewTypeToggle = (id: string) => {
    setHasChanges(true);
    setSaveStatus('idle');
    setInterviewTypes(prev =>
      prev.map(type => (type.id === id ? { ...type, enabled: !type.enabled } : type))
    );
  };

  const handleSettingChange = (
    category: 'schedule' | 'restriction',
    key: string,
    value: any
  ) => {
    setHasChanges(true);
    setSaveStatus('idle');

    if (category === 'schedule') {
      setScheduleSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    } else {
      setRestrictionSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');

    // 保存処理のシミュレーション
    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);

      // 監査ログ記録
      AuditService.log({
        userId: user?.id || '',
        action: 'INTERVIEW_SETTINGS_UPDATED',
        details: {
          interviewTypes: interviewTypes.map(t => ({ id: t.id, enabled: t.enabled })),
          scheduleSettings: Object.fromEntries(
            Object.entries(scheduleSettings).map(([k, v]) => [k, v.value])
          ),
          restrictionSettings: Object.fromEntries(
            Object.entries(restrictionSettings).map(([k, v]) => [k, v.value])
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
      // ここで元の値に戻す処理を実装
    }
  };

  const renderSettingInput = (
    setting: InterviewSetting,
    category: 'schedule' | 'restriction'
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

      case 'time':
        return (
          <input
            type="time"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(category, setting.key, e.target.value)}
            className="px-3 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    { id: 'types', label: '面談タイプ', icon: Calendar },
    { id: 'schedule', label: 'スケジュール', icon: Clock },
    { id: 'restrictions', label: '予約制限', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-purple-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">💬</span>
            面談設定
          </h1>
          <p className="text-gray-300">
            面談システムの業務設定を管理します（タイプ、スケジュール、予約制限）
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
          {/* 面談タイプ */}
          {activeTab === 'types' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                面談タイプの有効化/無効化
              </h2>
              <div className="space-y-3">
                {interviewTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{type.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">実施頻度: {type.frequency}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={type.enabled}
                        onChange={() => handleInterviewTypeToggle(type.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* スケジュール設定 */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                面談スケジュール設定
              </h2>
              <div className="space-y-6">
                {Object.entries(scheduleSettings).map(([key, setting]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{setting.description}</h4>
                      <p className="text-sm text-gray-400 mt-1">設定キー: {setting.key}</p>
                    </div>
                    <div className="ml-4">{renderSettingInput(setting, 'schedule')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 予約制限設定 */}
          {activeTab === 'restrictions' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                予約制限設定
              </h2>
              <div className="space-y-6">
                {Object.entries(restrictionSettings).map(([key, setting]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{setting.description}</h4>
                      <p className="text-sm text-gray-400 mt-1">設定キー: {setting.key}</p>
                    </div>
                    <div className="ml-4">{renderSettingInput(setting, 'restriction')}</div>
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
