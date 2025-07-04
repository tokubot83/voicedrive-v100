import { Post, User } from '../types';
import { TabState } from '../types/tabs';
import PostVisibilityEngine from '../services/PostVisibilityEngine';
import { StakeholderGroup } from '../types/visibility';

/**
 * 投稿が最近のものかどうかを判定
 * @param createdAt 投稿日時
 * @param days 何日以内を最近とするか（デフォルト: 7日）
 */
const isRecent = (createdAt: string | Date, days: number = 7): boolean => {
  const postDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - postDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays <= days;
};

/**
 * 投稿タイプの判定（type フィールドがない場合の推定）
 */
const getPostType = (post: Post): 'improvement' | 'freevoice' | 'whistleblowing' | null => {
  // typeフィールドがある場合はそれを使用（whistleblowingは特別扱い）
  if (post.type === 'report' && post.proposalType === 'strategic') {
    return 'whistleblowing';
  }
  
  if (post.type === 'community') {
    return 'freevoice';
  }
  
  if (post.type) {
    return post.type as any;
  }
  
  // proposalType がある場合は改善提案
  if (post.proposalType) {
    return 'improvement';
  }
  
  // tags や content から推定
  if (post.tags && (post.tags.includes('公益通報') || post.tags.includes('内部告発'))) {
    return 'whistleblowing';
  }
  
  if (post.tags && (post.tags.includes('コミュニティ') || post.tags.includes('交流'))) {
    return 'freevoice';
  }
  
  // デフォルトは改善提案
  return 'improvement';
};

/**
 * フリーボイス投稿のサブタイプ判定
 */
const getFreevoiceSubType = (post: Post): 'voting' | 'event' | 'other' => {
  // 投票関連
  if (post.poll?.options || post.pollResult || post.votingDeadline || 
      (post.tags && (post.tags.includes('投票') || post.tags.includes('アンケート') || post.tags.includes('投票結果')))) {
    return 'voting';
  }
  
  // イベント関連
  if (post.event || 
      (post.tags && (post.tags.includes('イベント') || post.tags.includes('開催') || post.tags.includes('参加募集')))) {
    return 'event';
  }
  
  // その他
  return 'other';
};

/**
 * 投稿が緊急かどうかを判定
 */
const isUrgent = (post: Post): boolean => {
  // isUrgent フラグがある場合
  if ('isUrgent' in post && post.isUrgent) {
    return true;
  }
  
  // priority が urgent の場合
  if (post.priority === 'urgent') {
    return true;
  }
  
  // tags に緊急が含まれる場合
  if (post.tags && (post.tags.includes('緊急') || post.tags.includes('至急'))) {
    return true;
  }
  
  return false;
};

/**
 * タブとフィルターに基づいて投稿をフィルタリング
 */
export const filterPostsByTab = (posts: Post[], tabState: TabState): Post[] => {
  const { activeMainTab, activeSubFilter } = tabState;
  
  // メインタブによる基本フィルタリング
  let filtered = posts.filter(post => {
    switch (activeMainTab) {
      case 'home':
        return true; // 全ての投稿を表示
        
      case 'improvement':
        return getPostType(post) === 'improvement';
        
      case 'freevoice':
        return getPostType(post) === 'freevoice';
        
      case 'whistleblowing':
        return getPostType(post) === 'whistleblowing';
        
      case 'urgent':
        return isUrgent(post);
        
      case 'projects':
        return !!post.enhancedProjectStatus;
        
      default:
        return true;
    }
  });

  // サブフィルターによる追加フィルタリング
  if (activeSubFilter) {
    filtered = filtered.filter(post => {
      switch (activeSubFilter) {
        case 'new':
          return isRecent(post.timestamp, 7);
          
        case 'trending':
          // 合計投票数が10以上を注目とする
          const totalVotes = Object.values(post.votes || {}).reduce((sum, val) => sum + val, 0);
          return totalVotes > 10;
          
        case 'near-project':
          // 合意レベルが80%以上をプロジェクト化間近とする
          const agreementLevel = post.votingData?.consensus || 0;
          return agreementLevel > 80;
          
        // フリーボイス専用フィルター
        case 'polls':
          return getPostType(post) === 'freevoice' && getFreevoiceSubType(post) === 'voting';
          
        case 'events':
          return getPostType(post) === 'freevoice' && getFreevoiceSubType(post) === 'event';
          
        case 'others':
          return getPostType(post) === 'freevoice' && getFreevoiceSubType(post) === 'other';
          
        case 'urgent-improvement':
        case 'urgent-community':
        case 'urgent-whistleblowing':
          return isUrgent(post);
          
        // プロジェクトフィルター
        case 'active':
          return post.enhancedProjectStatus?.stage === 'DEPARTMENT_PROJECT' || 
                 post.enhancedProjectStatus?.stage === 'FACILITY_PROJECT' || 
                 post.enhancedProjectStatus?.stage === 'CORPORATE_PROJECT';
                 
        case 'department':
          return post.enhancedProjectStatus?.level === 'DEPARTMENT';
          
        case 'facility':
          return post.enhancedProjectStatus?.level === 'FACILITY';
          
        case 'corporate':
          return post.enhancedProjectStatus?.level === 'CORPORATE';
          
        case 'completed':
          return post.enhancedProjectStatus?.milestones?.every(m => m.status === 'completed');
          
        default:
          return true;
      }
    });
  }

  // 日付でソート（新しい順）
  return filtered.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
};

/**
 * タブごとの投稿数を取得
 */
export const getPostCountsByTab = (posts: Post[]) => {
  return {
    home: posts.length,
    improvement: posts.filter(p => getPostType(p) === 'improvement').length,
    freevoice: posts.filter(p => getPostType(p) === 'freevoice').length,
    whistleblowing: posts.filter(p => getPostType(p) === 'whistleblowing').length,
    urgent: posts.filter(p => isUrgent(p)).length,
    projects: posts.filter(p => !!p.enhancedProjectStatus).length
  };
};

/**
 * ユーザーコンテキストに基づいて投稿をフィルタリング
 * 投稿の可視性ルールに従って、ユーザーが見るべき投稿のみを返す
 */
export const filterPostsByUserContext = (posts: Post[], currentUser: User): Post[] => {
  const visibilityEngine = new PostVisibilityEngine();
  
  return posts.filter(post => {
    // 同一施設内の投稿は基本的に全て表示
    const userScope = visibilityEngine.getUserScope(post, currentUser);
    
    // 同一施設内または同一法人内の投稿は表示
    // (投票権限は別途Post.tsxで制御される)
    return userScope === StakeholderGroup.SAME_TEAM || 
           userScope === StakeholderGroup.SAME_DEPARTMENT || 
           userScope === StakeholderGroup.SAME_FACILITY ||
           userScope === StakeholderGroup.SAME_ORGANIZATION;
  });
};