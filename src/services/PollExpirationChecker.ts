import { Poll } from '../types/poll';
import { Post } from '../types';
import AutoPollResultService from './AutoPollResultService';

export class PollExpirationChecker {
  private static instance: PollExpirationChecker;
  private autoPollResultService: AutoPollResultService;
  private checkInterval: number = 60000; // 1分間隔でチェック
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    try {
      this.autoPollResultService = AutoPollResultService.getInstance();
    } catch (error) {
      console.error('Failed to initialize AutoPollResultService:', error);
      // フォールバック実装
      this.autoPollResultService = new (AutoPollResultService as any)();
    }
  }

  public static getInstance(): PollExpirationChecker {
    if (!PollExpirationChecker.instance) {
      PollExpirationChecker.instance = new PollExpirationChecker();
    }
    return PollExpirationChecker.instance;
  }

  /**
   * 定期的な投票期限チェックを開始
   */
  public startPeriodicCheck(
    getPolls: () => Poll[],
    getPosts: () => Post[],
    addPosts: (newPosts: Post[]) => void
  ): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.checkExpiredPolls(getPolls(), getPosts(), addPosts);
    }, this.checkInterval);

    console.log('Poll expiration checker started');
  }

  /**
   * 定期チェックを停止
   */
  public stopPeriodicCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Poll expiration checker stopped');
    }
  }

  /**
   * 期限切れ投票をチェックし、結果投稿を作成
   */
  public checkExpiredPolls(
    polls: Poll[],
    posts: Post[],
    addPosts: (newPosts: Post[]) => void
  ): void {
    const newResultPosts = this.autoPollResultService.checkAndProcessExpiredPolls(polls, posts);
    
    if (newResultPosts.length > 0) {
      console.log(`Generated ${newResultPosts.length} poll result posts`);
      addPosts(newResultPosts);
      
      // アーカイブ処理
      polls.forEach(poll => {
        if (!poll.isActive && new Date(poll.deadline) <= new Date()) {
          this.autoPollResultService.archiveExpiredPoll(poll);
        }
      });
    }
  }

  /**
   * 手動で期限チェックを実行
   */
  public manualCheck(
    polls: Poll[],
    posts: Post[],
    addPosts: (newPosts: Post[]) => void
  ): number {
    const newResultPosts = this.autoPollResultService.checkAndProcessExpiredPolls(polls, posts);
    
    if (newResultPosts.length > 0) {
      addPosts(newResultPosts);
    }
    
    return newResultPosts.length;
  }

  /**
   * チェック間隔を設定
   */
  public setCheckInterval(milliseconds: number): void {
    this.checkInterval = milliseconds;
    
    // 実行中の場合は再開
    if (this.intervalId) {
      this.stopPeriodicCheck();
    }
  }
}

export default PollExpirationChecker;