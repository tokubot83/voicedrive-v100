import { User } from '../types';

interface Vote {
  userId: string;
  value: number;
  timestamp: Date;
}

interface VoteData {
  'strongly-oppose': number;
  'oppose': number;
  'neutral': number;
  'support': number;
  'strongly-support': number;
}

export class ConsensusInsightGenerator {
  static generateInsights(votes: VoteData, users?: User[]): string[] {
    const insights: string[] = [];
    
    // 総投票数の計算
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    // 支持率の計算
    const supportVotes = votes['support'] + votes['strongly-support'];
    const opposeVotes = votes['strongly-oppose'] + votes['oppose'];
    const supportRate = totalVotes > 0 ? Math.round((supportVotes / totalVotes) * 100) : 0;
    
    // 基本的な投票傾向
    if (supportRate > 70) {
      insights.push('👍 高い支持率');
    } else if (supportRate > 50) {
      insights.push('📊 過半数が支持');
    } else if (supportRate < 30) {
      insights.push('⚠️ 支持率低め');
    }
    
    // 投票の偏り分析
    if (votes['strongly-support'] > totalVotes * 0.3) {
      insights.push('😍 強い支持多数');
    }
    if (votes['strongly-oppose'] > totalVotes * 0.3) {
      insights.push('😠 強い反対あり');
    }
    
    // 中立票の分析
    if (votes['neutral'] > totalVotes * 0.4) {
      insights.push('🤔 意見分かれる');
    }
    
    // 参加率（仮想的な全体数を100として）
    if (totalVotes > 50) {
      insights.push('🔥 高い関心度');
    } else if (totalVotes > 20) {
      insights.push('📈 関心集まる');
    }
    
    // 専門職分析（デモ用の仮想的な分析）
    if (supportRate > 60 && totalVotes > 30) {
      insights.push('👨‍⚕️ 専門職支持');
    }
    
    // 世代分析（デモ用の仮想的な分析）
    if (totalVotes > 20 && supportRate > 50) {
      insights.push('👥 若手関心高');
    }
    
    return insights.slice(0, 4); // 最大4つまで表示
  }
  
  static calculateSimpleConsensus(votes: VoteData): {
    percentage: number;
    level: string;
    color: 'green' | 'yellow' | 'red';
  } {
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    if (totalVotes === 0) {
      return { percentage: 0, level: '投票待ち', color: 'yellow' };
    }
    
    // 加重スコアの計算
    const weightedScore = (
      votes['strongly-support'] * 2 +
      votes['support'] * 1 +
      votes['neutral'] * 0 +
      votes['oppose'] * -1 +
      votes['strongly-oppose'] * -2
    ) / (totalVotes * 2);
    
    // -1 〜 1 の範囲を 0 〜 100 に変換
    const percentage = Math.round((weightedScore + 1) * 50);
    
    if (percentage > 66) {
      return { percentage, level: '高い合意', color: 'green' };
    } else if (percentage > 33) {
      return { percentage, level: '中程度の合意', color: 'yellow' };
    } else {
      return { percentage, level: '低い合意', color: 'red' };
    }
  }
  
  static getConsensusDetails(votes: VoteData): Array<{label: string; value: string | number; trend?: 'up' | 'down' | 'stable'}> {
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const supportVotes = votes['support'] + votes['strongly-support'];
    const opposeVotes = votes['strongly-oppose'] + votes['oppose'];
    
    return [
      { label: '総投票数', value: totalVotes, trend: 'up' },
      { label: '支持', value: `${supportVotes}票`, trend: supportVotes > opposeVotes ? 'up' : 'down' },
      { label: '反対', value: `${opposeVotes}票`, trend: opposeVotes > supportVotes ? 'up' : 'down' },
      { label: '中立', value: `${votes['neutral']}票`, trend: 'stable' }
    ];
  }
}