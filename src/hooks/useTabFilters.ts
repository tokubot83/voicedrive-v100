import { useMemo } from 'react';
import { TabState } from '../types/tabs';
import { filterPostsByTab, filterPostsByUserContext } from '../utils/postFilters';
import { demoPosts } from '../data/demo/posts';
import { useDemoMode } from '../components/demo/DemoModeController';

/**
 * タブフィルタリング用カスタムフック
 * 現在のタブ状態に基づいてフィルタリングされた投稿を返す
 */
export const useFilteredPosts = (tabState: TabState) => {
  const { currentUser } = useDemoMode();
  
  return useMemo(() => {
    // TODO: 実際のアプリケーションでは、ここでAPIから投稿を取得する
    // const posts = usePostsQuery();
    
    // デモデータを使用
    const posts = demoPosts;
    
    return () => {
      // まずタブによるフィルタリング
      const tabFiltered = filterPostsByTab(posts, tabState);
      
      // 次にユーザーコンテキストによるフィルタリング（投稿の表示権限）
      if (currentUser) {
        return filterPostsByUserContext(tabFiltered, currentUser);
      }
      
      return tabFiltered;
    };
  }, [tabState, currentUser]);
};

/**
 * タブごとの投稿数を取得するフック
 */
export const usePostCounts = () => {
  return useMemo(() => {
    const posts = demoPosts;
    
    // 各タブの投稿数を計算
    const counts = {
      home: posts.length,
      improvement: posts.filter(p => p.proposalType).length,
      community: posts.filter(p => p.tags?.includes('コミュニティ')).length,
      whistleblowing: posts.filter(p => p.tags?.includes('公益通報')).length,
      urgent: posts.filter(p => p.priority === 'urgent').length
    };
    
    return counts;
  }, []);
};