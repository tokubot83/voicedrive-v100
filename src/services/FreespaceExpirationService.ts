import { Post } from '../types';

export class FreespaceExpirationService {
  private static readonly DEFAULT_EXPIRATION_DAYS = {
    idea_sharing: 30,      // アイデア共有: 30日
    casual_discussion: 7,  // 雑談: 7日
    event_planning: 1      // イベント企画: イベント終了日+1日
  };

  private static readonly ARCHIVE_PERIOD_DAYS = 365; // 1年後に完全削除

  /**
   * フリースペース投稿のデフォルト有効期限を計算
   */
  static getDefaultExpirationDate(category: 'idea_sharing' | 'casual_discussion' | 'event_planning', eventDate?: Date): Date {
    const now = new Date();
    
    if (category === 'event_planning' && eventDate) {
      // イベント企画の場合はイベント終了日+1日
      const expiration = new Date(eventDate);
      expiration.setDate(expiration.getDate() + this.DEFAULT_EXPIRATION_DAYS.event_planning);
      return expiration;
    }
    
    // その他のカテゴリは現在日時から計算
    const days = this.DEFAULT_EXPIRATION_DAYS[category] || this.DEFAULT_EXPIRATION_DAYS.casual_discussion;
    const expiration = new Date(now);
    expiration.setDate(expiration.getDate() + days);
    return expiration;
  }

  /**
   * 投稿が期限切れかどうかを判定
   */
  static isPostExpired(post: Post): boolean {
    if (!post.expirationDate) return false;
    return new Date() > post.expirationDate;
  }

  /**
   * 投稿がアーカイブ対象かどうかを判定
   */
  static shouldArchivePost(post: Post): boolean {
    if (!post.expirationDate) return false;
    
    const now = new Date();
    const archiveDate = new Date(post.expirationDate);
    archiveDate.setDate(archiveDate.getDate() + this.ARCHIVE_PERIOD_DAYS);
    
    return now > archiveDate;
  }

  /**
   * 期限切れまでの残り時間を計算
   */
  static getTimeUntilExpiration(post: Post): {
    days: number;
    hours: number;
    isExpiringSoon: boolean;
  } | null {
    if (!post.expirationDate) return null;
    
    const now = new Date();
    const timeDiff = post.expirationDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { days: 0, hours: 0, isExpiringSoon: true };
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    // 24時間以内の場合は期限切れ間近とみなす
    const isExpiringSoon = days === 0 && hours <= 24;
    
    return { days, hours, isExpiringSoon };
  }

  /**
   * 投稿を期限切れ状態に更新
   */
  static markAsExpired(post: Post): Post {
    return {
      ...post,
      isExpired: true
    };
  }

  /**
   * 投稿をアーカイブ状態に更新
   */
  static markAsArchived(post: Post): Post {
    return {
      ...post,
      isExpired: true,
      isArchived: true,
      archivedDate: new Date()
    };
  }

  /**
   * 延長リクエストを作成
   */
  static requestExtension(post: Post, reason: string): Post {
    return {
      ...post,
      extensionRequested: true,
      extensionReason: reason,
      extensionRequestedDate: new Date()
    };
  }

  /**
   * 延長リクエストを承認（新しい期限を設定）
   */
  static approveExtension(post: Post, newExpirationDate: Date): Post {
    return {
      ...post,
      expirationDate: newExpirationDate,
      extensionRequested: false,
      extensionReason: undefined,
      extensionRequestedDate: undefined,
      isExpired: false
    };
  }

  /**
   * ユーザーの権限に基づいて投稿の可視性を判定
   */
  static canViewPost(post: Post, userPermissionLevel: number, isAuthor: boolean): boolean {
    // 期限切れでない場合は全員が閲覧可能
    if (!this.isPostExpired(post)) {
      return true;
    }

    // 投稿者は自分の期限切れ投稿を閲覧可能
    if (isAuthor) {
      return true;
    }

    // アーカイブ済み投稿は投稿者以外閲覧不可
    if (post.isArchived) {
      return false;
    }

    // HR部門（権限レベル5以上）は期限切れ投稿を閲覧可能
    return userPermissionLevel >= 5;
  }

  /**
   * 期限切れ間近の投稿を取得（通知用）
   */
  static getPostsExpiringSoon(posts: Post[]): Post[] {
    return posts.filter(post => {
      const timeInfo = this.getTimeUntilExpiration(post);
      return timeInfo?.isExpiringSoon || false;
    });
  }

  /**
   * 期限切れ投稿を取得
   */
  static getExpiredPosts(posts: Post[]): Post[] {
    return posts.filter(post => this.isPostExpired(post));
  }

  /**
   * アーカイブ対象投稿を取得
   */
  static getPostsToArchive(posts: Post[]): Post[] {
    return posts.filter(post => this.shouldArchivePost(post));
  }

  /**
   * フリースペース投稿のフィルタリング（一般ユーザー向け）
   */
  static filterVisiblePosts(posts: Post[], userPermissionLevel: number, userId: string): Post[] {
    return posts.filter(post => {
      // フリースペース投稿でない場合はそのまま表示
      if (post.type !== 'community') return true;
      
      const isAuthor = post.author.id === userId;
      return this.canViewPost(post, userPermissionLevel, isAuthor);
    });
  }

  /**
   * 期限切れ投稿の自動処理（バッチ処理用）
   */
  static processExpiredPosts(posts: Post[]): {
    expiredPosts: Post[];
    archivedPosts: Post[];
  } {
    const expiredPosts: Post[] = [];
    const archivedPosts: Post[] = [];

    posts.forEach(post => {
      if (this.shouldArchivePost(post)) {
        archivedPosts.push(this.markAsArchived(post));
      } else if (this.isPostExpired(post) && !post.isExpired) {
        expiredPosts.push(this.markAsExpired(post));
      }
    });

    return { expiredPosts, archivedPosts };
  }
}