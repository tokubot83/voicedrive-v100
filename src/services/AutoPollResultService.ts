import { Poll, PollOption } from '../types/poll';
import { Post, PostType } from '../types';
import { NotificationService } from './NotificationService';

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
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
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
    const now = new Date();
    const newResultPosts: Post[] = [];

    polls.forEach(poll => {
      if (poll.isActive && new Date(poll.deadline) <= now) {
        // 投票を期限切れに設定
        poll.isActive = false;
        
        // 結果投稿を作成
        const originalPost = posts.find(p => p.id === poll.postId);
        if (originalPost) {
          const resultPost = this.createResultPost(poll, originalPost);
          newResultPosts.push(resultPost);
          
          // 結果通知を送信
          this.sendResultNotifications(poll, originalPost, resultPost);
        }
      }
    });

    return newResultPosts;
  }

  /**
   * 投票結果から新しい投稿を作成
   */
  private createResultPost(poll: Poll, originalPost: Post): Post {
    const result = this.calculatePollResult(poll);
    const content = this.generateResultContent(poll, originalPost, result);
    
    return {
      id: `result-${poll.id}-${Date.now()}`,
      type: 'community' as PostType,
      category: 'idea_sharing',
      title: `📊 投票結果: ${originalPost.title}`,
      content: content,
      author: 'system',
      timestamp: new Date(),
      createdDate: new Date(),
      votingDeadline: null,
      isUrgent: false,
      visibility: originalPost.visibility,
      tags: [...(originalPost.tags || []), '投票結果', '自動生成'],
      comments: [],
      pollResult: result,
      originalPollId: poll.id,
      originalPostId: originalPost.id
    };
  }

  /**
   * 投票結果を計算
   */
  private calculatePollResult(poll: Poll): PollResult {
    const totalVotes = poll.votes.length;
    const voteCount = poll.options.map(option => ({
      option,
      votes: poll.votes.filter(vote => vote.optionId === option.id).length
    }));

    const sortedResults = voteCount
      .map(item => ({
        option: item.option,
        votes: item.votes,
        percentage: totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0
      }))
      .sort((a, b) => b.votes - a.votes);

    const winnerOption = sortedResults[0]?.option || poll.options[0];
    
    // 参加率を計算（仮の対象者数100名として計算）
    const targetParticipants = this.estimateTargetParticipants(poll);
    const participationRate = (totalVotes / targetParticipants) * 100;

    return {
      totalVotes,
      winnerOption,
      participationRate,
      results: sortedResults
    };
  }

  /**
   * 対象参加者数を推定
   */
  private estimateTargetParticipants(poll: Poll): number {
    // 公開範囲に基づいて推定参加者数を計算
    switch (poll.visibility) {
      case 'team': return 10;
      case 'department': return 30;
      case 'facility': return 100;
      case 'organization': return 300;
      default: return 50;
    }
  }

  /**
   * 結果投稿のコンテンツを生成
   */
  private generateResultContent(poll: Poll, originalPost: Post, result: PollResult): string {
    const { totalVotes, winnerOption, participationRate, results } = result;
    
    let content = `## 🏆 投票結果発表\n\n`;
    content += `**元の投稿**: ${originalPost.title}\n`;
    content += `**投票期間**: ${new Date(poll.createdAt).toLocaleDateString('ja-JP')} ～ ${new Date(poll.deadline).toLocaleDateString('ja-JP')}\n\n`;
    
    // 勝者発表
    content += `### 🥇 最多得票\n`;
    content += `**${winnerOption.text}** (${results[0]?.votes || 0}票 - ${results[0]?.percentage.toFixed(1) || 0}%)\n\n`;
    
    // 詳細結果
    content += `### 📈 詳細結果\n\n`;
    results.forEach((item, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
      content += `${emoji} **${item.option.text}**: ${item.votes}票 (${item.percentage.toFixed(1)}%)\n`;
    });
    
    // 統計情報
    content += `\n### 📊 投票統計\n`;
    content += `- **総投票数**: ${totalVotes}票\n`;
    content += `- **参加率**: ${participationRate.toFixed(1)}%\n`;
    content += `- **投票方式**: ${poll.allowMultiple ? '複数選択可' : '単一選択'}\n\n`;
    
    // 分析コメント
    content += this.generateAnalysisComment(result, poll);
    
    content += `\n---\n*この結果は投票期限終了時に自動生成されました*`;
    
    return content;
  }

  /**
   * 分析コメントを生成
   */
  private generateAnalysisComment(result: PollResult, poll: Poll): string {
    const { totalVotes, participationRate, results } = result;
    let analysis = `### 💭 分析コメント\n\n`;
    
    // 参加率に関するコメント
    if (participationRate >= 70) {
      analysis += `✅ **高い参加率**: ${participationRate.toFixed(1)}%の参加率で、組織の意見が十分に反映された投票となりました。\n\n`;
    } else if (participationRate >= 40) {
      analysis += `📊 **適度な参加率**: ${participationRate.toFixed(1)}%の参加率でした。より多くの意見を集めるため、今後は告知方法の改善を検討してみてください。\n\n`;
    } else {
      analysis += `⚠️ **参加率要改善**: ${participationRate.toFixed(1)}%の参加率でした。重要な判断については、より多くの方の参加を促す工夫が必要かもしれません。\n\n`;
    }
    
    // 結果の接戦度に関するコメント
    if (results.length >= 2) {
      const topDiff = results[0].percentage - results[1].percentage;
      
      if (topDiff <= 10) {
        analysis += `🤝 **接戦の結果**: 1位と2位の差が${topDiff.toFixed(1)}%と僅差でした。両方の意見を考慮した判断が望ましいかもしれません。\n\n`;
      } else if (topDiff >= 50) {
        analysis += `🎯 **明確な結果**: ${topDiff.toFixed(1)}%の大差で1位が決定しました。組織の意向が明確に示された結果です。\n\n`;
      } else {
        analysis += `📈 **バランスの取れた結果**: 適度な差で1位が決定しました。組織内での健全な議論が行われた証拠です。\n\n`;
      }
    }
    
    return analysis;
  }

  /**
   * 結果通知を送信
   */
  private sendResultNotifications(poll: Poll, originalPost: Post, resultPost: Post): void {
    // 投票参加者への通知
    poll.votes.forEach(vote => {
      this.notificationService.addNotification({
        id: `poll-result-${poll.id}-${vote.userId}`,
        userId: vote.userId,
        type: 'poll_result',
        title: '📊 投票結果が発表されました',
        message: `「${originalPost.title}」の投票結果が発表されました。`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/posts/${resultPost.id}`,
        priority: 'medium'
      });
    });

    // 投稿者への通知
    if (originalPost.author !== 'system') {
      this.notificationService.addNotification({
        id: `poll-result-author-${poll.id}`,
        userId: originalPost.author,
        type: 'poll_result',
        title: '🏆 あなたの投稿の結果が確定しました',
        message: `「${originalPost.title}」の投票が終了し、結果が自動投稿されました。`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/posts/${resultPost.id}`,
        priority: 'high'
      });
    }
  }

  /**
   * 期限切れ投票をアーカイブ
   */
  public archiveExpiredPoll(poll: Poll): void {
    // アーカイブ処理の実装
    // 将来的にはデータベースのarchived状態を更新
    console.log(`Poll ${poll.id} has been archived`);
  }
}

export default AutoPollResultService;