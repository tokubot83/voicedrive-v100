import React, { useState } from 'react';
import { Settings, Shield, Bell, Mail, Database, Globe, Sliders, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { AuditService } from '../services/AuditService';

interface SystemSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
}

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // システム設定の状態管理
  const [generalSettings, setGeneralSettings] = useState<Record<string, SystemSetting>>({
    siteName: {
      key: 'siteName',
      value: 'VoiceDrive',
      type: 'string',
      description: 'システム名称'
    },
    maintenanceMode: {
      key: 'maintenanceMode',
      value: false,
      type: 'boolean',
      description: 'メンテナンスモード'
    },
    defaultLanguage: {
      key: 'defaultLanguage',
      value: 'ja',
      type: 'select',
      options: ['ja', 'en', 'zh'],
      description: 'デフォルト言語'
    },
    sessionTimeout: {
      key: 'sessionTimeout',
      value: 30,
      type: 'number',
      description: 'セッションタイムアウト（分）'
    }
  });

  const [securitySettings, setSecuritySettings] = useState<Record<string, SystemSetting>>({
    passwordMinLength: {
      key: 'passwordMinLength',
      value: 8,
      type: 'number',
      description: 'パスワード最小文字数'
    },
    passwordRequireSpecial: {
      key: 'passwordRequireSpecial',
      value: true,
      type: 'boolean',
      description: '特殊文字を必須にする'
    },
    twoFactorAuth: {
      key: 'twoFactorAuth',
      value: false,
      type: 'boolean',
      description: '2要素認証を有効化'
    },
    maxLoginAttempts: {
      key: 'maxLoginAttempts',
      value: 5,
      type: 'number',
      description: '最大ログイン試行回数'
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<Record<string, SystemSetting>>({
    emailNotifications: {
      key: 'emailNotifications',
      value: true,
      type: 'boolean',
      description: 'メール通知を有効化'
    },
    systemAlerts: {
      key: 'systemAlerts',
      value: true,
      type: 'boolean',
      description: 'システムアラートを有効化'
    },
    notificationRetention: {
      key: 'notificationRetention',
      value: 30,
      type: 'number',
      description: '通知保存期間（日）'
    }
  });

  const handleSettingChange = (
    category: 'general' | 'security' | 'notification',
    key: string,
    value: any
  ) => {
    setHasChanges(true);
    setSaveStatus('idle');

    switch (category) {
      case 'general':
        setGeneralSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
      case 'security':
        setSecuritySettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
      case 'notification':
        setNotificationSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // 設定保存のシミュレーション
    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);
      
      // 監査ログ記録
      AuditService.log({
        userId: user?.id || '',
        action: 'SYSTEM_SETTINGS_UPDATED',
        details: {
          generalSettings: Object.fromEntries(
            Object.entries(generalSettings).map(([k, v]) => [k, v.value])
          ),
          securitySettings: Object.fromEntries(
            Object.entries(securitySettings).map(([k, v]) => [k, v.value])
          ),
          notificationSettings: Object.fromEntries(
            Object.entries(notificationSettings).map(([k, v]) => [k, v.value])
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

  const renderSettingInput = (setting: SystemSetting, category: 'general' | 'security' | 'notification') => {
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
      
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSettingChange(category, setting.key, e.target.value)}
            className="px-3 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option === 'ja' ? '日本語' : option === 'en' ? 'English' : '中文'}
              </option>
            ))}
          </select>
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

  const renderSettings = (settings: Record<string, SystemSetting>, category: 'general' | 'security' | 'notification') => (
    <div className="space-y-6">
      {Object.entries(settings).map(([key, setting]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
          <div className="flex-1">
            <h4 className="text-white font-medium">{setting.description}</h4>
            <p className="text-sm text-gray-400 mt-1">設定キー: {setting.key}</p>
          </div>
          <div className="ml-4">
            {renderSettingInput(setting, category)}
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'general', label: '一般設定', icon: Settings },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'notification', label: '通知設定', icon: Bell },
    { id: 'database', label: 'データベース', icon: Database },
    { id: 'api', label: 'API設定', icon: Globe },
    { id: 'advanced', label: '詳細設定', icon: Sliders }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-2xl p-6 backdrop-blur-xl border border-cyan-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">⚙️</span>
            システム設定
          </h1>
          <p className="text-gray-300">
            システム全体の設定を管理します
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
            {tabs.map(tab => {
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
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                一般設定
              </h2>
              {renderSettings(generalSettings, 'general')}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                セキュリティ設定
              </h2>
              {renderSettings(securitySettings, 'security')}
            </div>
          )}

          {activeTab === 'notification' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知設定
              </h2>
              {renderSettings(notificationSettings, 'notification')}
            </div>
          )}

          {activeTab === 'database' && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">データベース設定</h3>
              <p className="text-gray-400">この機能は現在開発中です</p>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">API設定</h3>
              <p className="text-gray-400">この機能は現在開発中です</p>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="text-center py-12">
              <Sliders className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">詳細設定</h3>
              <p className="text-gray-400">この機能は現在開発中です</p>
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
    </div>
  );
};