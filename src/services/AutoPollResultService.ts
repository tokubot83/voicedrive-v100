import { Poll, PollOption } from '../types/poll';
import { Post, PostType } from '../types';
// import { NotificationService } from './NotificationService'; // 一時的に無効化

interface PollResult {
  totalVotes: number;
  winnerOption: PollOption;
  participationRate: number;
  results: {
    option: PollOption;
    votes: number;
    percentage: number;
  }[];
}

export class AutoPollResultService {
  private static instance: AutoPollResultService;
  private notificationService: any = null; // 一時的に無効化

  private constructor() {
    // NotificationService の初期化を一時的に無効化
    // this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AutoPollResultService {
    if (!AutoPollResultService.instance) {
      AutoPollResultService.instance = new AutoPollResultService();
    }
    return AutoPollResultService.instance;
  }

  /**
   * 投票期限をチェックし、必要に応じて結果投稿を作成
   */
  public checkAndProcessExpiredPolls(polls: Poll[], posts: Post[]): Post[] {
    // 一時的に無効化
    console.log('AutoPollResultService: checkAndProcessExpiredPolls temporarily disabled');
    return [];
  }

  /**
   * 期限切れ投票をアーカイブ
   */
  public archiveExpiredPoll(poll: Poll): void {
    // 一時的に無効化
    console.log('AutoPollResultService: archiveExpiredPoll temporarily disabled');
  }

  // 他のメソッドも一時的に無効化
  private createResultPost(poll: Poll, originalPost: Post): Post {
    // ダミー実装
    return {} as Post;
  }

  private calculatePollResult(poll: Poll): PollResult {
    // ダミー実装
    return {} as PollResult;
  }

  private generateResultContent(poll: Poll, originalPost: Post, result: PollResult): string {
    return 'Temporarily disabled';
  }

  private sendResultNotifications(poll: Poll, originalPost: Post, resultPost: Post): void {
    // 一時的に無効化
  }

  private calculateParticipationRate(poll: Poll): number {
    return 0;
  }
}

export default AutoPollResultService;