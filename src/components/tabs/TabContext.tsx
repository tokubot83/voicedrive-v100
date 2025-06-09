import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { TabState, TabContextValue } from '../../types/tabs';
import { mainTabs } from './MainTabs';
import { useFilteredPosts } from '../../hooks/useTabFilters';

const TabContext = createContext<TabContextValue | undefined>(undefined);

interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabState, setTabState] = useState<TabState>({
    activeMainTab: 'home',
    activeSubFilter: null
  });

  // メインタブの変更ハンドラー
  const setActiveMainTab = (tabId: string) => {
    const tab = mainTabs.find(t => t.id === tabId);
    
    setTabState({
      activeMainTab: tabId,
      // サブフィルターがあるタブの場合、デフォルトで'new'を選択
      activeSubFilter: tab?.hasSubFilters ? 'new' : null
    });
  };

  // サブフィルターの変更ハンドラー
  const setActiveSubFilter = (filterId: string | null) => {
    setTabState(prev => ({
      ...prev,
      activeSubFilter: filterId
    }));
  };

  // フィルタリングされた投稿を取得
  const getFilteredPosts = useFilteredPosts(tabState);

  const contextValue = useMemo(() => ({
    tabState,
    setActiveMainTab,
    setActiveSubFilter,
    getFilteredPosts
  }), [tabState, getFilteredPosts]);

  return (
    <TabContext.Provider value={contextValue}>
      {children}
    </TabContext.Provider>
  );
};

// カスタムフック
export const useTabContext = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
};