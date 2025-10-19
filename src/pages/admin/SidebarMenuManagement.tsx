/**
 * サイドバーメニュー管理ページ
 *
 * レベルX（システム管理者）専用
 * 議題モード・プロジェクト化モード・共通メニューの表示設定を管理
 */

import React, { useState } from 'react';
import { useSidebarMenuConfigs, SidebarMenuConfig } from '@/hooks/useSidebarMenuConfigs';

type MenuCategory = 'common' | 'agenda' | 'project';

export default function SidebarMenuManagement() {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('common');
  const [editingItem, setEditingItem] = useState<SidebarMenuConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { configs, loading, error } = useSidebarMenuConfigs({
    category: selectedCategory,
  });

  const handleEditClick = (item: SidebarMenuConfig) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedItem: Partial<SidebarMenuConfig>) => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/sidebar-menu/configs/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error('Failed to update menu config');
      }

      // リロード
      window.location.reload();
    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">エラーが発生しました: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          サイドバーメニュー管理
        </h1>
        <p className="text-gray-600">
          議題モード・プロジェクト化モード・共通メニューの表示設定を管理します
        </p>
      </div>

      {/* カテゴリ選択タブ */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedCategory('common')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  selectedCategory === 'common'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              共通メニュー
            </button>
            <button
              onClick={() => setSelectedCategory('agenda')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  selectedCategory === 'agenda'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              議題モードメニュー
            </button>
            <button
              onClick={() => setSelectedCategory('project')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  selectedCategory === 'project'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              プロジェクト化モードメニュー
            </button>
          </nav>
        </div>
      </div>

      {/* メニュー項目一覧 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アイコン
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ラベル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                表示
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PC
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                スマホ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                順序
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((item) => (
              <tr key={item.id} className={!item.isVisible ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-2xl">
                  {item.icon}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.path}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.isVisible ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      表示中
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      非表示
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.showOnDesktop ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-300">−</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.showOnMobile ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-300">−</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {item.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    編集
                  </button>
                  {!item.isSystem && (
                    <button className="text-red-600 hover:text-red-900">削除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {isModalOpen && editingItem && (
        <EditMenuItemModal
          item={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* 追加ボタン */}
      <div className="mt-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + 新規メニュー項目を追加
        </button>
      </div>

      {/* 注意事項 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">注意事項</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>システム項目は削除できません</li>
          <li>表示設定の変更は即座に全ユーザーに反映されます</li>
          <li>評価ステーション・健康ステーションは導入タイミングに応じて表示してください</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * メニュー項目編集モーダル
 */
interface EditMenuItemModalProps {
  item: SidebarMenuConfig;
  onClose: () => void;
  onSave: (updatedItem: Partial<SidebarMenuConfig>) => void;
}

function EditMenuItemModal({ item, onClose, onSave }: EditMenuItemModalProps) {
  const [formData, setFormData] = useState({
    icon: item.icon,
    label: item.label,
    path: item.path,
    description: item.description || '',
    isVisible: item.isVisible,
    displayOrder: item.displayOrder,
    showOnDesktop: item.showOnDesktop,
    showOnMobile: item.showOnMobile,
    showOnTablet: item.showOnTablet,
    adminNotes: item.adminNotes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">メニュー項目を編集</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* アイコン */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アイコン
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* ラベル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ラベル
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（ツールチップ）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>

            {/* 表示設定 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">表示設定</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">このメニュー項目を表示する</span>
                </label>
              </div>
            </div>

            {/* デバイス別表示 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">表示デバイス</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnDesktop}
                    onChange={(e) =>
                      setFormData({ ...formData, showOnDesktop: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">PC/デスクトップ</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnMobile}
                    onChange={(e) =>
                      setFormData({ ...formData, showOnMobile: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">スマートフォン</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showOnTablet}
                    onChange={(e) =>
                      setFormData({ ...formData, showOnTablet: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">タブレット</span>
                </label>
              </div>
            </div>

            {/* 表示順序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示順序
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* 管理者メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理者メモ
              </label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="例: 評価制度は2025年4月導入予定。人事部門の準備完了後に表示を有効化。"
              />
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
