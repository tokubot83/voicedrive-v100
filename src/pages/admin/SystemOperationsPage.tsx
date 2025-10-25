import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * システム運用ページ（Level 99専用）
 * カードグリッド形式でLevel 99管理機能へのアクセスを提供
 */
export const SystemOperationsPage: React.FC = () => {
  const navigate = useNavigate();

  // 管理機能カード定義
  const operationCards = [
    {
      id: 'system-monitor',
      icon: '📊',
      title: 'システム監視',
      description: 'サーバー状態、パフォーマンス、エラーログの監視',
      path: '/admin/system-monitor',
      stats: 'サーバー稼働率: 99.8%',
      color: 'blue',
      badge: null
    },
    {
      id: 'mode-switcher',
      icon: '🔄',
      title: 'モード切替',
      description: '議題モード ⇄ プロジェクトモード切替',
      path: '/admin/mode-switcher',
      stats: '現在: 議題モード',
      color: 'green',
      badge: '重要'
    },
    {
      id: 'voting-settings',
      icon: '⚙️',
      title: '投票設定',
      description: '議題/プロジェクトモードの投票ルール設定',
      path: '/admin/voting-settings',
      stats: '最終更新: 2025/10/13',
      color: 'purple',
      badge: null
    },
    {
      id: 'user-management',
      icon: '👥',
      title: 'ユーザー管理',
      description: 'アカウント管理、権限レベル設定',
      path: '/admin/user-management',
      stats: 'アクティブユーザー: 342名',
      color: 'cyan',
      badge: null
    },
    {
      id: 'system-settings',
      icon: '🛠️',
      title: 'システム基盤設定',
      description: 'インフラ設定（DB、API、セキュリティ、キャッシュ）',
      path: '/admin/system-settings',
      stats: '設定項目: 28件',
      color: 'orange',
      badge: null
    },
    {
      id: 'audit-logs',
      icon: '📜',
      title: '監査ログ',
      description: 'システム変更履歴、操作ログの確認',
      path: '/admin/audit-logs',
      stats: '本日のログ: 127件',
      color: 'slate',
      badge: null
    },
    {
      id: 'sidebar-menu-management',
      icon: '🎛️',
      title: 'サイドバーメニュー管理',
      description: '議題/プロジェクト/共通メニューの表示設定',
      path: '/admin/sidebar-menu-management',
      stats: '管理項目: 11件',
      color: 'pink',
      badge: null
    },
    {
      id: 'interview-settings',
      icon: '💬',
      title: '面談設定',
      description: '面談タイプ、スケジュール、予約制限の設定',
      path: '/admin/interview-settings',
      stats: '面談タイプ: 10種類',
      color: 'teal',
      badge: 'NEW'
    },
    {
      id: 'committee-settings',
      icon: '🏛️',
      title: '委員会設定',
      description: 'ステータス、会議スケジュール、承認フロー',
      path: '/admin/committee-settings',
      stats: 'ステータス: 5種類',
      color: 'emerald',
      badge: 'NEW'
    },
    {
      id: 'notification-category',
      icon: '🔔',
      title: '通知カテゴリ管理',
      description: 'カテゴリ別の配信方法、優先度設定',
      path: '/admin/notification-category',
      stats: 'カテゴリ: 8種類',
      color: 'indigo',
      badge: 'NEW'
    }
  ];

  // カラーテーママッピング
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-600/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-600/20 hover:border-blue-500/50'
      },
      green: {
        bg: 'bg-green-600/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        hover: 'hover:bg-green-600/20 hover:border-green-500/50'
      },
      purple: {
        bg: 'bg-purple-600/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        hover: 'hover:bg-purple-600/20 hover:border-purple-500/50'
      },
      cyan: {
        bg: 'bg-cyan-600/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        hover: 'hover:bg-cyan-600/20 hover:border-cyan-500/50'
      },
      orange: {
        bg: 'bg-orange-600/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        hover: 'hover:bg-orange-600/20 hover:border-orange-500/50'
      },
      slate: {
        bg: 'bg-slate-600/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        hover: 'hover:bg-slate-600/20 hover:border-slate-500/50'
      },
      pink: {
        bg: 'bg-pink-600/10',
        border: 'border-pink-500/30',
        text: 'text-pink-400',
        hover: 'hover:bg-pink-600/20 hover:border-pink-500/50'
      },
      teal: {
        bg: 'bg-teal-600/10',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        hover: 'hover:bg-teal-600/20 hover:border-teal-500/50'
      },
      emerald: {
        bg: 'bg-emerald-600/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        hover: 'hover:bg-emerald-600/20 hover:border-emerald-500/50'
      },
      indigo: {
        bg: 'bg-indigo-600/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        hover: 'hover:bg-indigo-600/20 hover:border-indigo-500/50'
      }
    };
    return colorMap[color] || colorMap.slate;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                <span className="text-4xl">🔧</span>
                <span>システム運用</span>
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Level 99専用のシステム管理機能にアクセスできます
              </p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                Level 99
              </span>
              <span className="text-red-400">専用</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 注意事項バナー */}
        <div className="mb-8 bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-400 mb-1">管理者専用機能</h3>
              <p className="text-xs text-yellow-300/80">
                これらの機能はシステム全体に影響を与えます。設定変更時は十分に注意してください。
              </p>
            </div>
          </div>
        </div>

        {/* システムステータス概要 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">システム状態</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <div className="text-2xl font-bold text-green-400">正常</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">稼働時間</div>
            <div className="text-2xl font-bold text-white">28日</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">総ユーザー数</div>
            <div className="text-2xl font-bold text-white">342名</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-2">現在のモード</div>
            <div className="text-2xl font-bold text-green-400">議題</div>
          </div>
        </div>

        {/* 管理機能カードグリッド */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">管理機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationCards.map((card) => {
              const colors = getColorClasses(card.color);
              return (
                <button
                  key={card.id}
                  onClick={() => navigate(card.path)}
                  className={`
                    relative bg-slate-800/50 border rounded-xl p-6 text-left
                    transition-all duration-200 transform hover:scale-[1.02]
                    ${colors.bg} ${colors.border} ${colors.hover}
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  `}
                >
                  {/* バッジ */}
                  {card.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-xs text-red-400 font-medium">
                        {card.badge}
                      </span>
                    </div>
                  )}

                  {/* アイコン */}
                  <div className="text-5xl mb-4">{card.icon}</div>

                  {/* タイトル */}
                  <h3 className={`text-lg font-bold mb-2 ${colors.text}`}>
                    {card.title}
                  </h3>

                  {/* 説明 */}
                  <p className="text-sm text-slate-400 mb-4 min-h-[40px]">
                    {card.description}
                  </p>

                  {/* 統計情報 */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">{card.stats}</span>
                    <svg
                      className={`w-5 h-5 ${colors.text}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <span>クイックアクション</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/system-monitor')}
              className="flex items-center space-x-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:bg-slate-900/70 transition-colors"
            >
              <span className="text-2xl">🔍</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">システム状態確認</div>
                <div className="text-xs text-slate-400">リアルタイム監視</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/mode-switcher')}
              className="flex items-center space-x-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:bg-slate-900/70 transition-colors"
            >
              <span className="text-2xl">🔄</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">モード切替</div>
                <div className="text-xs text-slate-400">議題 ⇄ プロジェクト</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="flex items-center space-x-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:bg-slate-900/70 transition-colors"
            >
              <span className="text-2xl">📋</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">最新ログ確認</div>
                <div className="text-xs text-slate-400">今日の操作履歴</div>
              </div>
            </button>
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>システム運用機能へのアクセスは監査ログに記録されます</p>
        </div>
      </main>
    </div>
  );
};
