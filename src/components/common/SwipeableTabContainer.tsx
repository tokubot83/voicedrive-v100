/**
 * Phase 7-B: 共通スワイプタブコンテナ
 *
 * 他のステーションページで再利用可能なスワイプタブコンテナコンポーネント
 */

import React, { ReactNode } from 'react';
import { useSwipeableTabs } from '../../hooks/useSwipeableTabs';

export interface TabConfig<T extends string | number> {
  id: T;
  label: string;
  content: ReactNode;
  icon?: string;
}

export interface SwipeableTabContainerProps<T extends string | number> {
  /** タブ設定 */
  tabs: TabConfig<T>[];
  /** 現在アクティブなタブのID */
  activeTab: T;
  /** タブ変更時のコールバック */
  onTabChange: (tabId: T) => void;
  /** コンテナのクラス名 */
  containerClassName?: string;
  /** タブヘッダーのクラス名 */
  headerClassName?: string;
  /** タブボタンのベースクラス名 */
  tabButtonClassName?: string;
  /** アクティブタブのクラス名 */
  activeTabClassName?: string;
  /** 非アクティブタブのクラス名 */
  inactiveTabClassName?: string;
  /** コンテンツエリアのクラス名 */
  contentClassName?: string;
  /** スワイプを無効化するか */
  disableSwipe?: boolean;
}

/**
 * スワイプ対応のタブコンテナコンポーネント
 */
export const SwipeableTabContainer = <T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
  containerClassName = '',
  headerClassName = 'bg-gray-800',
  tabButtonClassName = 'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
  activeTabClassName = 'border-blue-500 text-blue-500',
  inactiveTabClassName = 'border-transparent text-gray-400 hover:text-gray-300',
  contentClassName = 'p-6',
  disableSwipe = false
}: SwipeableTabContainerProps<T>) => {
  // スワイプハンドラーの取得
  const { handlers: swipeHandlers } = useSwipeableTabs({
    activeTab,
    tabs: tabs.map(t => t.id),
    onTabChange,
    disabled: disableSwipe
  });

  // アクティブなタブコンテンツを取得
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`flex-1 flex flex-col ${containerClassName}`}>
      {/* タブヘッダー */}
      <div className={headerClassName}>
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`${tabButtonClassName} ${
                  activeTab === tab.id
                    ? activeTabClassName
                    : inactiveTabClassName
                }`}
              >
                {tab.icon && <span className="mr-1">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* コンテンツエリア（スワイプ対応） */}
      <div className={contentClassName} {...swipeHandlers}>
        {activeTabContent}
      </div>
    </div>
  );
};

/**
 * スワイプインジケーター（Phase 7-C用）
 */
export interface SwipeIndicatorProps<T extends string | number> {
  tabs: TabConfig<T>[];
  activeTab: T;
  className?: string;
}

export const SwipeIndicator = <T extends string | number>({
  tabs,
  activeTab,
  className = 'mt-2'
}: SwipeIndicatorProps<T>) => {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            activeTab === tab.id
              ? 'w-8 bg-purple-500'
              : 'w-1.5 bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
};
