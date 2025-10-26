import React, { useState } from 'react';
import { Bell, ChevronDown, ChevronRight, Check, Info } from 'lucide-react';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { NOTIFICATION_CATEGORIES_INFO, NotificationCategory } from '../../types/notification';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const {
    settings,
    isLoading,
    hasUnsavedChanges,
    saveSettings,
    setQuickSetting,
    toggleCategory,
    updateCategorySettings,
    toggleSubType,
    requestPermission,
    setQuietHours
  } = useNotificationSettings(userId);

  const [expandedCategories, setExpandedCategories] = useState<Set<NotificationCategory>>(new Set());
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // カテゴリの展開/折りたたみ
  const toggleExpand = (category: NotificationCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 権限リクエスト処理
  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionDialog(false);
    }
  };

  // 設定の保存
  const handleSave = () => {
    const saved = saveSettings();
    if (saved) {
      // 成功通知を表示（実装は別途）
      console.log('設定を保存しました');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 通知権限の状態 */}
      {settings.permission !== 'granted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900">通知を有効にしてください</h4>
              <p className="text-sm text-yellow-700 mt-1">
                緊急連絡や重要なお知らせをお届けするため、通知を許可してください
              </p>
              <button
                onClick={() => setShowPermissionDialog(true)}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                通知を許可する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* シンプル通知設定（メイン） */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">通知設定</h2>
        </div>

        <p className="text-gray-300 mb-6 text-lg">
          どの通知を受け取りますか？
        </p>

        {/* 大きな選択ボタン（50代・60代向け） */}
        <div className="space-y-4">
          <button
            onClick={() => setQuickSetting('all')}
            className={`w-full p-6 rounded-xl text-left transition-all border-2 ${
              settings.quickSetting === 'all'
                ? 'bg-indigo-600 border-indigo-400 shadow-lg'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-xl font-bold text-white">すべて受け取る</h3>
                </div>
                <p className="text-gray-300 text-base ml-11">
                  すべての通知を受け取ります（推奨）
                </p>
              </div>
              {settings.quickSetting === 'all' && (
                <Check className="w-8 h-8 text-white" />
              )}
            </div>
          </button>

          <button
            onClick={() => setQuickSetting('important')}
            className={`w-full p-6 rounded-xl text-left transition-all border-2 ${
              settings.quickSetting === 'important'
                ? 'bg-indigo-600 border-indigo-400 shadow-lg'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-xl font-bold text-white">重要なお知らせのみ</h3>
                </div>
                <p className="text-gray-300 text-base ml-11">
                  緊急連絡や面談予定など、重要な通知だけ受け取ります
                </p>
              </div>
              {settings.quickSetting === 'important' && (
                <Check className="w-8 h-8 text-white" />
              )}
            </div>
          </button>

          <button
            onClick={() => setQuickSetting('none')}
            className={`w-full p-6 rounded-xl text-left transition-all border-2 ${
              settings.quickSetting === 'none'
                ? 'bg-indigo-600 border-indigo-400 shadow-lg'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔕</span>
                  <h3 className="text-xl font-bold text-white">通知OFF</h3>
                </div>
                <p className="text-gray-300 text-base ml-11">
                  すべての通知を停止します
                </p>
              </div>
              {settings.quickSetting === 'none' && (
                <Check className="w-8 h-8 text-white" />
              )}
            </div>
          </button>
        </div>

        {/* 上級者向け設定トグル */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center justify-between w-full text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">上級者向け設定</span>
            {showAdvancedSettings ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* カテゴリ別設定（上級者向け） */}
      {showAdvancedSettings && (
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">詳細設定（上級者向け）</h3>
          <div className="space-y-2">
            {Object.entries(NOTIFICATION_CATEGORIES_INFO).map(([key, info]) => {
              const category = key as NotificationCategory;
              const categorySettings = settings.categories[category];
              const isExpanded = expandedCategories.has(category);
              const isEnabled = categorySettings?.enabled ?? false;

              return (
                <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
                  {/* カテゴリヘッダー */}
                  <div className="bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleExpand(category)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <h4 className="font-medium text-white">{info.name}</h4>
                          <p className="text-xs text-gray-400">{info.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleCategory(category)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* 展開時の詳細設定 */}
                  {isExpanded && isEnabled && (
                    <div className="p-4 bg-slate-800/30 space-y-4">
                      {/* サブタイプ設定 */}
                      {info.subTypes && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">通知タイプ</h5>
                          {info.subTypes.map((subType) => {
                            const isSubTypeEnabled = categorySettings?.subTypes?.[subType.id] !== false;
                            const isMandatory = 'mandatory' in subType && subType.mandatory;

                            return (
                              <label
                                key={subType.id}
                                className={`flex items-center justify-between py-2 ${
                                  isMandatory ? 'opacity-75' : ''
                                }`}
                              >
                                <span className="text-sm text-gray-300">
                                  {subType.name}
                                  {isMandatory && (
                                    <span className="ml-2 text-xs text-red-400">（必須）</span>
                                  )}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isSubTypeEnabled}
                                  onChange={() => !isMandatory && toggleSubType(category, subType.id)}
                                  disabled={isMandatory}
                                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 通知方法設定 */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={categorySettings?.sound ?? false}
                            onChange={(e) =>
                              updateCategorySettings(category, { sound: e.target.checked })
                            }
                            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">🔊 音</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={categorySettings?.vibration ?? false}
                            onChange={(e) =>
                              updateCategorySettings(category, { vibration: e.target.checked })
                            }
                            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">📳 バイブ</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 静音時間設定（上級者向け） */}
      {showAdvancedSettings && (
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">静音時間</h3>
              <p className="text-sm text-gray-400 mt-1">指定時間は通知を制限します</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours?.enabled ?? false}
                onChange={(e) => setQuietHours(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          {settings.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">開始時刻</label>
                <input
                  type="time"
                  value={settings.quietHours.startTime}
                  onChange={(e) =>
                    setQuietHours(true, e.target.value, settings.quietHours?.endTime)
                  }
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">終了時刻</label>
                <input
                  type="time"
                  value={settings.quietHours.endTime}
                  onChange={(e) =>
                    setQuietHours(true, settings.quietHours?.startTime, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 保存ボタン */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-20 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">変更が保存されていません</span>
            <div className="space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 権限リクエストダイアログ */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">通知を許可してください</h3>
            <p className="text-gray-300 mb-6">
              VoiceDriveから重要なお知らせや面談リマインダーなどの通知を受け取るには、
              ブラウザの通知を許可する必要があります。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissionDialog(false)}
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                後で設定
              </button>
              <button
                onClick={handlePermissionRequest}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                許可する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};