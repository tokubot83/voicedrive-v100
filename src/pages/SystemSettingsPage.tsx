import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Database, Globe, Sliders, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

/**
 * システム基盤設定ページ（Level 99専用）
 *
 * 役割: システムインフラ・基盤レイヤーの設定を管理
 * - 一般設定（サイト名、言語、セッション）
 * - セキュリティ基盤（パスワード、2FA、ログイン制限）
 * - 通知基盤（メール/システム通知のON/OFF）
 * - データベース基盤（バックアップ、保持期間、圧縮）
 * - API基盤（有効化、レート制限、CORS）
 * - 詳細設定（ログレベル、キャッシュ、デバッグモード）
 *
 * 対象外（専用ページで管理）:
 * - 業務機能設定（面談、投票、委員会、プロジェクトなど）
 * - 通知カテゴリ管理
 * - ユーザー・権限管理
 *
 * アクセス: SystemOperationsPage > システム基盤設定カード
 */

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

  const [databaseSettings, setDatabaseSettings] = useState<Record<string, SystemSetting>>({
    autoBackup: {
      key: 'autoBackup',
      value: true,
      type: 'boolean',
      description: '自動バックアップを有効化'
    },
    backupInterval: {
      key: 'backupInterval',
      value: 24,
      type: 'number',
      description: 'バックアップ間隔（時間）'
    },
    dataRetention: {
      key: 'dataRetention',
      value: 365,
      type: 'number',
      description: 'データ保持期間（日）'
    },
    compressionEnabled: {
      key: 'compressionEnabled',
      value: true,
      type: 'boolean',
      description: 'データ圧縮を有効化'
    },
    queryTimeout: {
      key: 'queryTimeout',
      value: 30,
      type: 'number',
      description: 'クエリタイムアウト（秒）'
    }
  });

  const [apiSettings, setApiSettings] = useState<Record<string, SystemSetting>>({
    apiEnabled: {
      key: 'apiEnabled',
      value: true,
      type: 'boolean',
      description: 'API機能を有効化'
    },
    rateLimit: {
      key: 'rateLimit',
      value: 1000,
      type: 'number',
      description: 'レート制限（リクエスト/時）'
    },
    corsEnabled: {
      key: 'corsEnabled',
      value: true,
      type: 'boolean',
      description: 'CORSを有効化'
    },
    apiKeyRotation: {
      key: 'apiKeyRotation',
      value: 90,
      type: 'number',
      description: 'APIキーローテーション（日）'
    },
    webhookEnabled: {
      key: 'webhookEnabled',
      value: false,
      type: 'boolean',
      description: 'Webhookを有効化'
    }
  });

  const [advancedSettings, setAdvancedSettings] = useState<Record<string, SystemSetting>>({
    logLevel: {
      key: 'logLevel',
      value: 'info',
      type: 'select',
      options: ['debug', 'info', 'warn', 'error'],
      description: 'ログレベル'
    },
    cacheEnabled: {
      key: 'cacheEnabled',
      value: true,
      type: 'boolean',
      description: 'キャッシュを有効化'
    },
    cacheDuration: {
      key: 'cacheDuration',
      value: 3600,
      type: 'number',
      description: 'キャッシュ保持時間（秒）'
    },
    performanceMonitoring: {
      key: 'performanceMonitoring',
      value: true,
      type: 'boolean',
      description: 'パフォーマンス監視を有効化'
    },
    debugMode: {
      key: 'debugMode',
      value: false,
      type: 'boolean',
      description: 'デバッグモード'
    }
  });

  const handleSettingChange = (
    category: 'general' | 'security' | 'notification' | 'database' | 'api' | 'advanced',
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
      case 'database':
        setDatabaseSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
      case 'api':
        setApiSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
      case 'advanced':
        setAdvancedSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        break;
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');

    try {
      // API呼び出しでシステム設定を保存
      const response = await fetch('/api/system/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          settings: {
            general: Object.fromEntries(
              Object.entries(generalSettings).map(([k, v]) => [k, v.value])
            ),
            security: Object.fromEntries(
              Object.entries(securitySettings).map(([k, v]) => [k, v.value])
            ),
            notification: Object.fromEntries(
              Object.entries(notificationSettings).map(([k, v]) => [k, v.value])
            ),
            database: Object.fromEntries(
              Object.entries(databaseSettings).map(([k, v]) => [k, v.value])
            ),
            api: Object.fromEntries(
              Object.entries(apiSettings).map(([k, v]) => [k, v.value])
            ),
            advanced: Object.fromEntries(
              Object.entries(advancedSettings).map(([k, v]) => [k, v.value])
            )
          },
          userId: user?.id || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('saved');
        setHasChanges(false);

        console.log('✅ システム設定を保存しました:', {
          updatedCount: result.data.updatedCount,
          updatedSettings: result.data.updatedSettings
        });

        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'システム設定の保存に失敗しました');
      }
    } catch (error) {
      console.error('❌ システム設定保存エラー:', error);
      setSaveStatus('error');
      alert(error instanceof Error ? error.message : 'システム設定の保存に失敗しました');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('すべての変更を破棄してよろしいですか？')) {
      setHasChanges(false);
      setSaveStatus('idle');
      // ここで元の値に戻す処理を実装
    }
  };

  const renderSettingInput = (setting: SystemSetting, category: 'general' | 'security' | 'notification' | 'database' | 'api' | 'advanced') => {
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

  const renderSettings = (settings: Record<string, SystemSetting>, category: 'general' | 'security' | 'notification' | 'database' | 'api' | 'advanced') => (
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
            システム基盤設定
          </h1>
          <p className="text-gray-300">
            システムインフラ・基盤レイヤーの設定を管理します（DB、API、セキュリティ、キャッシュなど）
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ※業務機能設定（面談、投票、委員会など）は各専用ページで管理してください
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
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                データベース設定
              </h2>
              {renderSettings(databaseSettings, 'database')}

              {/* データベース操作ボタン */}
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <h3 className="text-sm font-semibold text-white mb-3">データベース操作</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    手動バックアップ実行
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    最適化実行
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                    整合性チェック
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                API設定
              </h2>
              {renderSettings(apiSettings, 'api')}

              {/* API情報 */}
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <h3 className="text-sm font-semibold text-white mb-3">API情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">APIエンドポイント:</span>
                    <span className="text-white font-mono">https://api.voicedrive.local/v1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">現在のAPIバージョン:</span>
                    <span className="text-white">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">APIキー有効期限:</span>
                    <span className="text-white">2025-12-31</span>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  APIキーを再生成
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                詳細設定
              </h2>
              {renderSettings(advancedSettings, 'advanced')}

              {/* システム情報 */}
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <h3 className="text-sm font-semibold text-white mb-3">システム情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VoiceDriveバージョン:</span>
                    <span className="text-white">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Node.jsバージョン:</span>
                    <span className="text-white">{typeof process !== 'undefined' ? process.version : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">稼働時間:</span>
                    <span className="text-white">72時間 15分</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">最終起動:</span>
                    <span className="text-white">2025-10-02 09:30:00</span>
                  </div>
                </div>
              </div>

              {/* 危険な操作 */}
              <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/50">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  危険な操作
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
                    全キャッシュクリア
                  </button>
                  <button className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
                    システム再起動
                  </button>
                </div>
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