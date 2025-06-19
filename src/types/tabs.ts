/**
 * タブシステムの型定義
 */

export interface MainTab {
  id: string;
  label: string;
  icon: string;
  hasSubFilters: boolean;
}

export interface SubFilter {
  id: string;
  label: string;
  parentTab: string;
}

export interface TabState {
  activeMainTab: string;
  activeSubFilter: string | null;
}

export type MainTabId = 'home' | 'improvement' | 'freevoice' | 'whistleblowing' | 'urgent';
export type SubFilterId = 'new' | 'trending' | 'near-project' | 'urgent-improvement' | 'urgent-community' | 'urgent-whistleblowing' | 'voting' | 'event' | 'other';

export interface TabContextValue {
  tabState: TabState;
  setActiveMainTab: (tabId: string) => void;
  setActiveSubFilter: (filterId: string | null) => void;
  getFilteredPosts: () => any[]; // PostType[]に後で更新
}