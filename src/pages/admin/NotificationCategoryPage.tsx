import React, { useState } from 'react';
import { Bell, Mail, Calendar, Briefcase, Users, GraduationCap, Clock, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { AuditService } from '../../services/AuditService';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';

/**
 * 通知カテゴリ管理ページ（Level 99専用）
 *
 * 役割: 通知システムのカテゴリ別設定を管理
 * - 各カテゴリの有効化/無効化
 * - カテゴリ別の配信方法設定
 * - 優先度別の配信ルール
 *
 * アクセス: SystemOperationsPage > 通知カテゴリ管理カード
 */

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  enabled: boolean;
  emailEnabled: boolean;
  systemEnabled: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export const NotificationCategoryPage: React.FC = () => {
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // 通知カテゴリ設定
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'interview',
      name: '面談・予約通知',
      description: '面談予約、リマインダー、キャンセル通知',
      icon: Calendar,
      color: '#2196F3',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'hr',
      name: '人事お知らせ',
      description: '人事からの重要なお知らせ、評価通知',
      icon: Users,
      color: '#4CAF50',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'agenda',
      name: '議題・提案通知',
      description: '議題の状態変更、コメント、承認通知',
      icon: Briefcase,
      color: '#FF9800',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'system',
      name: 'システム通知',
      description: 'メンテナンス、システム更新のお知らせ',
      icon: Bell,
      color: '#9C27B0',
      enabled: true,
      emailEnabled: false,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'training',
      name: '研修・教育通知',
      description: '研修案内、受講リマインダー',
      icon: GraduationCap,
      color: '#00BCD4',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'shift',
      name: 'シフト・勤務通知',
      description: 'シフト変更、勤務時間の通知',
      icon: Clock,
      color: '#FFC107',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    },
    {
      id: 'project',
      name: 'プロジェクト通知',
      description: 'プロジェクトの進捗、マイルストーン通知',
      icon: Briefcase,
      color: '#8BC34A',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'normal'
    },
    {
      id: 'evaluation',
      name: '評価通知',
      description: '評価開示、フィードバック面談の案内',
      icon: Users,
      color: '#E91E63',
      enabled: true,
      emailEnabled: true,
      systemEnabled: true,
      priority: 'high'
    }
  ]);

  // 全般設定
  const [generalSettings, setGeneralSettings] = useState({
    retentionDays: 30,
    criticalPriorityImmediate: true,
    highPriorityImmediate: true,
    normalPriorityBatch: false,
    lowPriorityBatch: true,
    nightModeStart: '22:00',
    nightModeEnd: '07:00',
    nightModeSilent: true
  });

  const handleCategoryToggle = (id: string, field: 'enabled' | 'emailEnabled' | 'systemEnabled') => {
    setHasChanges(true);
    setSaveStatus('idle');
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, [field]: !cat[field] } : cat))
    );
  };

  const handlePriorityChange = (id: string, priority: 'low' | 'normal' | 'high' | 'critical') => {
    setHasChanges(true);
    setSaveStatus('idle');
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, priority } : cat))
    );
  };

  const handleGeneralSettingChange = (key: string, value: any) => {
    setHasChanges(true);
    setSaveStatus('idle');
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');

    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);

      AuditService.log({
        userId: user?.id || '',
        action: 'NOTIFICATION_CATEGORY_SETTINGS_UPDATED',
        details: {
          categories: categories.map(c => ({
            id: c.id,
            enabled: c.enabled,
            emailEnabled: c.emailEnabled,
            systemEnabled: c.systemEnabled,
            priority: c.priority
          })),
          generalSettings
        },
        severity: 'medium'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return '緊急';
      case 'high': return '高';
      case 'normal': return '通常';
      case 'low': return '低';
      default: return '通常';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-indigo-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">🔔</span>
            通知カテゴリ管理
          </h1>
          <p className="text-gray-300">
            通知システムのカテゴリ別設定を管理します（配信方法、優先度）
          </p>
        </div>

        {/* 警告メッセージ */}
        {hasChanges && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200">未保存の変更があります</span>
          </div>
        )}

        {/* 全般設定 */}
        <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            全般設定
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-white text-sm">通知保存期間（日）</span>
              <input
                type="number"
                value={generalSettings.retentionDays}
                onChange={(e) => handleGeneralSettingChange('retentionDays', parseInt(e.target.value))}
                className="px-3 py-1 bg-gray-700/50 rounded text-white w-20 text-sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-white text-sm">緊急通知の即時配信</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalSettings.criticalPriorityImmediate}
                  onChange={(e) => handleGeneralSettingChange('criticalPriorityImmediate', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-white text-sm">夜間モード開始時刻</span>
              <input
                type="time"
                value={generalSettings.nightModeStart}
                onChange={(e) => handleGeneralSettingChange('nightModeStart', e.target.value)}
                className="px-3 py-1 bg-gray-700/50 rounded text-white text-sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-white text-sm">夜間モード終了時刻</span>
              <input
                type="time"
                value={generalSettings.nightModeEnd}
                onChange={(e) => handleGeneralSettingChange('nightModeEnd', e.target.value)}
                className="px-3 py-1 bg-gray-700/50 rounded text-white text-sm"
              />
            </div>
          </div>
        </Card>

        {/* カテゴリ別設定 */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            カテゴリ別設定
          </h2>
          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="p-5 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={category.enabled}
                        onChange={() => handleCategoryToggle(category.id, 'enabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {category.enabled && (
                    <div className="grid md:grid-cols-3 gap-3 pt-4 border-t border-gray-600/30">
                      {/* 配信方法 */}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={category.emailEnabled}
                            onChange={() => handleCategoryToggle(category.id, 'emailEnabled')}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-300">メール通知</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={category.systemEnabled}
                            onChange={() => handleCategoryToggle(category.id, 'systemEnabled')}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-gray-300">システム内通知</span>
                        </label>
                      </div>

                      {/* 優先度 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">優先度:</span>
                        <select
                          value={category.priority}
                          onChange={(e) => handlePriorityChange(category.id, e.target.value as any)}
                          className={`px-2 py-1 rounded text-xs border ${getPriorityColor(category.priority)}`}
                        >
                          <option value="critical">緊急</option>
                          <option value="high">高</option>
                          <option value="normal">通常</option>
                          <option value="low">低</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
