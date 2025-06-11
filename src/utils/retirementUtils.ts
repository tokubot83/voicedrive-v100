import { User, Post, Comment, AnonymityLevel } from '../types';

/**
 * 退職者の表示名を取得
 */
export function getRetiredUserDisplayName(
  user: User,
  anonymityLevel: AnonymityLevel,
  monthsSinceRetirement?: number
): string {
  // 元々匿名投稿の場合はそのまま
  if (anonymityLevel === 'anonymous') {
    return '匿名職員';
  }

  // 部署レベル投稿の場合
  if (anonymityLevel === 'department') {
    if (monthsSinceRetirement && monthsSinceRetirement > 24) {
      return '退職者';
    }
    return `元${user.department}職員`;
  }

  // 実名投稿の場合の処理
  if (anonymityLevel === 'real') {
    // 2年以上経過している場合は完全匿名化
    if (monthsSinceRetirement && monthsSinceRetirement > 24) {
      return '退職者';
    }
    
    // 1年以上経過している場合は部署レベル
    if (monthsSinceRetirement && monthsSinceRetirement > 12) {
      return `元${user.department}職員`;
    }
    
    // 1年未満の場合は役職情報を含む
    return `元${user.department} ${user.role}`;
  }

  return '退職者';
}

/**
 * 退職者の投稿かどうかを判定
 */
export function isRetiredUserPost(author: User): boolean {
  return author.isRetired === true;
}

/**
 * 退職者の投稿を匿名化して返す
 */
export function anonymizeRetiredUserPost(post: Post): Post {
  if (!isRetiredUserPost(post.author)) {
    return post;
  }

  const monthsSinceRetirement = post.author.retirementDate
    ? calculateMonthsSince(post.author.retirementDate)
    : undefined;

  return {
    ...post,
    author: {
      ...post.author,
      name: getRetiredUserDisplayName(
        post.author,
        post.anonymityLevel,
        monthsSinceRetirement
      ),
      // 個人を特定できる情報を削除
      avatar: undefined,
      position: undefined,
      expertise: undefined
    }
  };
}

/**
 * 退職者のコメントを匿名化して返す
 */
export function anonymizeRetiredUserComment(comment: Comment): Comment {
  if (!isRetiredUserPost(comment.author)) {
    return comment;
  }

  const monthsSinceRetirement = comment.author.retirementDate
    ? calculateMonthsSince(comment.author.retirementDate)
    : undefined;

  return {
    ...comment,
    author: {
      ...comment.author,
      name: getRetiredUserDisplayName(
        comment.author,
        comment.anonymityLevel,
        monthsSinceRetirement
      ),
      avatar: undefined,
      position: undefined,
      expertise: undefined
    }
  };
}

/**
 * 指定日からの経過月数を計算
 */
function calculateMonthsSince(date: Date): number {
  const now = new Date();
  const months = (now.getFullYear() - date.getFullYear()) * 12;
  return months + now.getMonth() - date.getMonth();
}

/**
 * 退職処理可能かどうかを判定
 */
export function canProcessRetirement(
  processingUser: User,
  targetUser: User
): boolean {
  // レベル6以上の権限が必要
  if (!processingUser.hierarchyLevel || processingUser.hierarchyLevel < 6) {
    return false;
  }

  // 既に退職済みの場合は処理不可
  if (targetUser.isRetired) {
    return false;
  }

  // 自分自身の退職処理は不可
  if (processingUser.id === targetUser.id) {
    return false;
  }

  return true;
}

/**
 * 退職者データのエクスポート用整形
 */
export interface RetiredUserExportData {
  anonymizedId: string;
  department: string;
  retirementDate: string;
  totalPosts: number;
  totalComments: number;
  contributionScore: number;
}

export function formatRetiredUserForExport(
  user: User,
  posts: Post[],
  comments: Comment[]
): RetiredUserExportData {
  const userPosts = posts.filter(p => p.author.id === user.id);
  const userComments = comments.filter(c => c.author.id === user.id);
  
  // 貢献スコアの計算（投稿数 × 10 + コメント数 × 3）
  const contributionScore = userPosts.length * 10 + userComments.length * 3;

  return {
    anonymizedId: user.anonymizedId || `RETIRED_${user.id}`,
    department: user.department,
    retirementDate: user.retirementDate?.toISOString() || new Date().toISOString(),
    totalPosts: userPosts.length,
    totalComments: userComments.length,
    contributionScore
  };
}