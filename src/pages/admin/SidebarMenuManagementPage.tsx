/**
 * サイドバーメニュー管理ページ
 *
 * レベルX（システム管理者）専用
 * 議題モード・プロジェクト化モード・共通メニューの表示設定を管理
 */

import React, { useState } from 'react';
import { useSidebarMenuConfigs, SidebarMenuConfig } from '../../hooks/useSidebarMenuConfigs';
import { Settings, Plus, Edit2, Trash2, Save, X, Monitor, Smartphone, Tablet } from 'lucide-react';

type TabType = 'common' | 'agenda' | 'project';

export const SidebarMenuManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('common');
  const [editingConfig, setEditingConfig] = useState<SidebarMenuConfig | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // メニュー設定取得
  const { configs, loading, error } = useSidebarMenuConfigs({
    category: activeTab,
    enabled: true,
  });

  const handleEdit = (config: SidebarMenuConfig) => {
    setEditingConfig(config);
    setShowEditModal(true);
  };

  const handleSave = async (config: Partial<SidebarMenuConfig>) => {
    try {
      const response = await fetch(`/api/sidebar-menu/configs/${editingConfig?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('更新に失敗しました');

      // 成功したらモーダルを閉じる
      setShowEditModal(false);
      setEditingConfig(null);

      // リロード（実装は省略、refetchを使用）
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">サイドバーメニュー管理</h1>
          </div>
          <p className="text-slate-400">
            議題モード・プロジェクト化モード・共通メニューの表示設定を管理します
          </p>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('common')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'common'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            共通メニュー
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'agenda'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            議題モードメニュー
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'project'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            プロジェクト化モードメニュー
          </button>
        </div>

        {/* メニュー一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-400">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">表示</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">アイコン</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">ラベル</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">URL</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">デバイス</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">順序</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={config.isVisible}
                        className="w-5 h-5"
                        readOnly
                      />
                    </td>
                    <td className="px-6 py-4 text-2xl">{config.icon}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{config.label}</span>
                        {config.showNewBadge && (
                          <span className="text-xs bg-red-500 px-2 py-0.5 rounded">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{config.path}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Monitor
                          className={`w-5 h-5 ${
                            config.showOnDesktop ? 'text-blue-400' : 'text-slate-600'
                          }`}
                          title="PC"
                        />
                        <Smartphone
                          className={`w-5 h-5 ${
                            config.showOnMobile ? 'text-blue-400' : 'text-slate-600'
                          }`}
                          title="スマホ"
                        />
                        <Tablet
                          className={`w-5 h-5 ${
                            config.showOnTablet ? 'text-blue-400' : 'text-slate-600'
                          }`}
                          title="タブレット"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{config.displayOrder}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(config)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        {!config.isSystem && (
                          <button
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {configs.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                メニュー項目がありません
              </div>
            )}
          </div>
        )}

        {/* 新規追加ボタン */}
        <div className="mt-6">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>新規メニュー項目を追加</span>
          </button>
        </div>
      </div>

      {/* 編集モーダル */}
      {showEditModal && editingConfig && (
        <EditModal
          config={editingConfig}
          onSave={handleSave}
          onClose={() => {
            setShowEditModal(false);
            setEditingConfig(null);
          }}
        />
      )}
    </div>
  );
};

// 編集モーダルコンポーネント
interface EditModalProps {
  config: SidebarMenuConfig;
  onSave: (config: Partial<SidebarMenuConfig>) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    icon: config.icon,
    label: config.label,
    path: config.path,
    description: config.description || '',
    isVisible: config.isVisible,
    displayOrder: config.displayOrder,
    showOnDesktop: config.showOnDesktop,
    showOnMobile: config.showOnMobile,
    showOnTablet: config.showOnTablet,
    showNewBadge: config.showNewBadge,
    adminNotes: config.adminNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">メニュー項目を編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* アイコン・ラベル */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">アイコン（Emoji）</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-2xl text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">ラベル</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold mb-2">URL</label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-semibold mb-2">説明（ツールチップ）</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg resize-none"
              rows={2}
            />
          </div>

          {/* 表示設定 */}
          <div>
            <label className="block text-sm font-semibold mb-2">表示設定</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>このメニュー項目を表示する</span>
              </label>
            </div>
          </div>

          {/* デバイス別表示 */}
          <div>
            <label className="block text-sm font-semibold mb-2">表示デバイス</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showOnDesktop}
                  onChange={(e) => setFormData({ ...formData, showOnDesktop: e.target.checked })}
                  className="w-5 h-5"
                />
                <Monitor className="w-5 h-5" />
                <span>PC/デスクトップ</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showOnMobile}
                  onChange={(e) => setFormData({ ...formData, showOnMobile: e.target.checked })}
                  className="w-5 h-5"
                />
                <Smartphone className="w-5 h-5" />
                <span>スマートフォン</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.showOnTablet}
                  onChange={(e) => setFormData({ ...formData, showOnTablet: e.target.checked })}
                  className="w-5 h-5"
                />
                <Tablet className="w-5 h-5" />
                <span>タブレット</span>
              </label>
            </div>
          </div>

          {/* 表示順序 */}
          <div>
            <label className="block text-sm font-semibold mb-2">表示順序</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg"
            />
          </div>

          {/* NEWバッジ */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showNewBadge}
                onChange={(e) => setFormData({ ...formData, showNewBadge: e.target.checked })}
                className="w-5 h-5"
              />
              <span>「NEW!」バッジを表示</span>
            </label>
          </div>

          {/* 管理者メモ */}
          <div>
            <label className="block text-sm font-semibold mb-2">管理者メモ</label>
            <textarea
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg resize-none"
              rows={3}
              placeholder="例: 評価制度は2025年4月導入予定。人事部門の準備完了後に表示を有効化。"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
