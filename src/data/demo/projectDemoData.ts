import { Post } from '../../types';
import { demoPosts } from './posts';

// プロジェクト関連の投稿データをエクスポート
// posts.ts のデータを再利用し、プロジェクト関連のもののみをフィルタリング
export const projectDemoPosts: Post[] = demoPosts.filter(post => 
  post.type === 'proposal' || 
  post.category === 'improvement' || 
  post.category === 'innovation' ||
  post.projectPhase !== undefined
);

// 後方互換性のため、デフォルトエクスポートも提供
export default projectDemoPosts;