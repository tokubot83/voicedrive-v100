import { VoteOption } from '../types';

export interface UserVoteRecord {
  postId: string;
  vote: VoteOption;
  timestamp: string;
}

export interface VotingStorage {
  userVotes: Record<string, UserVoteRecord>;
  voteHistory: UserVoteRecord[];
}

class VotingService {
  private static readonly STORAGE_KEY = 'voicedrive-user-votes';

  /**
   * ローカルストレージから投票データを取得
   */
  static getVotingData(): VotingStorage {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load voting data:', error);
    }
    
    return {
      userVotes: {},
      voteHistory: []
    };
  }

  /**
   * ローカルストレージに投票データを保存
   */
  static saveVotingData(data: VotingStorage): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save voting data:', error);
    }
  }

  /**
   * ユーザーが指定の投稿に投票しているかチェック
   */
  static hasUserVoted(postId: string): boolean {
    const data = this.getVotingData();
    return postId in data.userVotes;
  }

  /**
   * ユーザーの投票を取得
   */
  static getUserVote(postId: string): VoteOption | null {
    const data = this.getVotingData();
    return data.userVotes[postId]?.vote || null;
  }

  /**
   * 新しい投票を記録
   */
  static recordVote(postId: string, vote: VoteOption): boolean {
    // 既に投票済みの場合は拒否
    if (this.hasUserVoted(postId)) {
      return false;
    }

    const data = this.getVotingData();
    const voteRecord: UserVoteRecord = {
      postId,
      vote,
      timestamp: new Date().toISOString()
    };

    // ユーザー投票記録を更新
    data.userVotes[postId] = voteRecord;
    
    // 履歴に追加
    data.voteHistory.push(voteRecord);

    // 保存
    this.saveVotingData(data);
    return true;
  }

  /**
   * 投票を変更（管理者用または特定条件下）
   */
  static updateVote(postId: string, newVote: VoteOption): boolean {
    const data = this.getVotingData();
    
    if (!(postId in data.userVotes)) {
      return false;
    }

    const oldVoteRecord = data.userVotes[postId];
    const newVoteRecord: UserVoteRecord = {
      postId,
      vote: newVote,
      timestamp: new Date().toISOString()
    };

    // 投票記録を更新
    data.userVotes[postId] = newVoteRecord;
    
    // 履歴に変更記録を追加
    data.voteHistory.push(newVoteRecord);

    // 保存
    this.saveVotingData(data);
    return true;
  }

  /**
   * 投票履歴を取得
   */
  static getVoteHistory(): UserVoteRecord[] {
    const data = this.getVotingData();
    return data.voteHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * 特定投稿の投票履歴を取得
   */
  static getPostVoteHistory(postId: string): UserVoteRecord[] {
    const data = this.getVotingData();
    return data.voteHistory
      .filter(record => record.postId === postId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * 投票データをクリア（開発/テスト用）
   */
  static clearVotingData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear voting data:', error);
    }
  }

  /**
   * 投票統計を取得
   */
  static getVotingStats(): {
    totalVotes: number;
    votesByOption: Record<VoteOption, number>;
    recentVotes: UserVoteRecord[];
  } {
    const data = this.getVotingData();
    const votesByOption: Record<VoteOption, number> = {
      'strongly-oppose': 0,
      'oppose': 0,
      'neutral': 0,
      'support': 0,
      'strongly-support': 0
    };

    // 投票を集計
    Object.values(data.userVotes).forEach(record => {
      votesByOption[record.vote]++;
    });

    // 最近の投票（過去24時間）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVotes = data.voteHistory.filter(record => 
      new Date(record.timestamp) > oneDayAgo
    );

    return {
      totalVotes: Object.keys(data.userVotes).length,
      votesByOption,
      recentVotes
    };
  }
}

export default VotingService;