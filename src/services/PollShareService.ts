import { Poll, Post } from '../types';

export interface ShareOptions {
  includeComments?: boolean;
  anonymize?: boolean;
  format?: 'text' | 'image' | 'link';
}

export class PollShareService {
  /**
   * 投票結果をテキスト形式で生成
   */
  static generateShareText(post: Post, poll: Poll): string {
    const categoryLabels: Record<string, string> = {
      idea_sharing: 'アイデア共有',
      casual_discussion: '雑談',
      event_planning: 'イベント企画'
    };

    const category = categoryLabels[poll.category || 'casual_discussion'];
    const totalVotes = poll.totalVotes || 0;
    
    let shareText = `【VoiceDrive 投票結果】\n`;
    shareText += `カテゴリ: ${category}\n`;
    shareText += `\n`;
    
    if (poll.question) {
      shareText += `質問: ${poll.question}\n`;
    }
    
    if (poll.description) {
      shareText += `説明: ${poll.description}\n`;
    }
    
    shareText += `\n--- 投票結果 ---\n`;
    shareText += `総投票数: ${totalVotes}票\n\n`;
    
    // 結果を票数の多い順にソート
    const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
    
    sortedOptions.forEach((option, index) => {
      const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
      const emoji = option.emoji || '';
      const rank = index + 1;
      
      shareText += `${rank}位: ${emoji} ${option.text}\n`;
      shareText += `   ${percentage}% (${option.votes}票)\n`;
      shareText += `   ${'■'.repeat(Math.floor(percentage / 5))}${'□'.repeat(20 - Math.floor(percentage / 5))}\n`;
      shareText += `\n`;
    });
    
    const deadline = new Date(poll.deadline);
    shareText += `投票期限: ${deadline.toLocaleDateString('ja-JP')} ${deadline.toLocaleTimeString('ja-JP')}\n`;
    
    if (!poll.isActive) {
      shareText += `状態: 終了\n`;
    }
    
    return shareText;
  }

  /**
   * 共有用のURLを生成（実装例）
   */
  static generateShareUrl(postId: string, pollId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/poll/${postId}/${pollId}`;
  }

  /**
   * クリップボードにコピー
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      return false;
    }
  }

  /**
   * Web Share APIを使用した共有
   */
  static async shareViaWebAPI(post: Post, poll: Poll): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    const shareText = this.generateShareText(post, poll);
    const shareUrl = this.generateShareUrl(post.id, poll.id);

    try {
      await navigator.share({
        title: 'VoiceDrive 投票結果',
        text: shareText,
        url: shareUrl
      });
      return true;
    } catch (err) {
      console.error('Web Share APIでの共有に失敗しました:', err);
      return false;
    }
  }

  /**
   * ビジュアル形式で結果を生成（HTMLテンプレート）
   */
  static generateVisualShare(post: Post, poll: Poll): string {
    const categoryColors: Record<string, string> = {
      idea_sharing: '#f59e0b',
      casual_discussion: '#3b82f6',
      event_planning: '#a855f7'
    };

    const color = categoryColors[poll.category || 'casual_discussion'];
    const totalVotes = poll.totalVotes || 0;
    
    let html = `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, ${color} 0%, ${color}99 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">VoiceDrive 投票結果</h2>
        </div>
        
        ${poll.question ? `<h3 style="color: #111827; margin-bottom: 8px;">${poll.question}</h3>` : ''}
        ${poll.description ? `<p style="color: #6b7280; margin-bottom: 20px;">${poll.description}</p>` : ''}
        
        <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    `;
    
    const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
    
    sortedOptions.forEach((option, index) => {
      const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
      const isWinner = index === 0;
      
      html += `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: ${isWinner ? 'bold' : 'normal'}; color: #111827;">
              ${option.emoji || ''} ${option.text} ${isWinner ? '👑' : ''}
            </span>
            <span style="color: ${color}; font-weight: bold;">${percentage}%</span>
          </div>
          <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 1s ease;"></div>
          </div>
          <span style="color: #6b7280; font-size: 12px;">${option.votes}票</span>
        </div>
      `;
    });
    
    html += `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <div>総投票数: ${totalVotes}票</div>
            <div>投票期限: ${new Date(poll.deadline).toLocaleDateString('ja-JP')}</div>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
}