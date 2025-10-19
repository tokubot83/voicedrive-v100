import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPermission } from '../../hooks/useUserPermission';

/**
 * Level 99専用フローティングボタン
 * 画面右下に固定表示され、どのページからでもシステム運用にアクセス可能
 */
export const SystemAdminFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 権限チェック
  let permission = { calculatedLevel: 1 };
  try {
    const userPermission = useUserPermission();
    permission = userPermission;
  } catch (error) {
    // UserProviderが存在しない場合は表示しない
    return null;
  }

  // Level 99以外は表示しない
  if (permission.calculatedLevel < 99) {
    return null;
  }

  const menuItems = [
    {
      id: 'system-operations',
      icon: '🔧',
      label: 'システム運用',
      path: '/admin/system-operations',
      color: 'from-red-600 to-purple-600',
      hoverColor: 'hover:from-red-500 hover:to-purple-500',
    },
    {
      id: 'sidebar-menu',
      icon: '🎛️',
      label: 'メニュー管理',
      path: '/admin/sidebar-menu-management',
      color: 'from-purple-600 to-pink-600',
      hoverColor: 'hover:from-purple-500 hover:to-pink-500',
    },
    {
      id: 'mode-switcher',
      icon: '🔄',
      label: 'モード切替',
      path: '/admin/mode-switcher',
      color: 'from-green-600 to-teal-600',
      hoverColor: 'hover:from-green-500 hover:to-teal-500',
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* メニュー展開時のオーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* フローティングメニュー */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* 展開メニュー */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 mb-2 space-y-2 animate-fadeIn">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
                  bg-gradient-to-r ${item.color} ${item.hoverColor}
                  text-white font-medium
                  transform hover:scale-105 transition-all duration-200
                  min-w-[200px]
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* メインボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-16 h-16 rounded-full shadow-2xl
            bg-gradient-to-br from-red-600 via-purple-600 to-pink-600
            hover:from-red-500 hover:to-pink-500
            flex items-center justify-center
            transform transition-all duration-300
            ${isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'}
            border-2 border-white/20
            group
          `}
          title="システム管理者メニュー"
        >
          {isOpen ? (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-3xl group-hover:scale-110 transition-transform">🔧</span>
          )}
        </button>

        {/* Level 99バッジ */}
        {!isOpen && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">
            99
          </div>
        )}
      </div>

      {/* アニメーション用スタイル */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
