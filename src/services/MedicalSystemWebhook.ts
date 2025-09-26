/**
 * VoiceDrive → 医療システム Webhook通知サービス
 * Phase 3: リアルタイム統合
 */

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

interface ProposalCreatedData {
  proposalId: string;
  staffId: string;
  staffName: string;
  department: string;
  title: string;
  content: string;
  proposalType: string;
  priority: string;
  permissionLevel: number;
  expectedAgendaLevel: string;
}

interface VotingCompletedData {
  proposalId: string;
  totalVotes: number;
  currentScore: number;
  agendaLevel: string;
  supportRate: number;
  participantCount: number;
}

interface ProposalEscalatedData {
  proposalId: string;
  fromLevel: string;
  toLevel: string;
  currentScore: number;
  requiredScore: number;
  staffId: string;
}

export class MedicalSystemWebhook {
  private webhookUrl: string;
  private timeout: number = 5000; // 5秒タイムアウト

  constructor() {
    // 環境変数から医療システムのWebhook URLを取得
    this.webhookUrl = import.meta.env.VITE_MEDICAL_WEBHOOK_URL || 'http://localhost:3000/api/webhook/voicedrive';
  }

  /**
   * 議題作成通知
   */
  async notifyProposalCreated(data: ProposalCreatedData): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'proposal.created',
      timestamp: new Date().toISOString(),
      data
    };

    return this.sendWebhook(payload);
  }

  /**
   * 投票完了通知
   */
  async notifyVotingCompleted(data: VotingCompletedData): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'voting.completed',
      timestamp: new Date().toISOString(),
      data
    };

    return this.sendWebhook(payload);
  }

  /**
   * 議題エスカレーション通知
   */
  async notifyProposalEscalated(data: ProposalEscalatedData): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'proposal.escalated',
      timestamp: new Date().toISOString(),
      data
    };

    return this.sendWebhook(payload);
  }

  /**
   * 委員会提出通知
   */
  async notifyCommitteeSubmitted(proposalId: string, committeeId: string, staffId: string): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'committee.submitted',
      timestamp: new Date().toISOString(),
      data: {
        proposalId,
        committeeId,
        staffId,
        submittedAt: new Date().toISOString()
      }
    };

    return this.sendWebhook(payload);
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    const payload: WebhookPayload = {
      event: 'system.health_check',
      timestamp: new Date().toISOString(),
      data: {
        source: 'voicedrive',
        version: '1.0.0',
        status: 'active'
      }
    };

    return this.sendWebhook(payload);
  }

  /**
   * Webhook送信の共通メソッド
   */
  private async sendWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      console.log(`[Phase 3] Webhook送信: ${payload.event} -> ${this.webhookUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VoiceDrive-Source': 'webapp'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[Phase 3] Webhook送信成功: ${payload.event}`);
        return true;
      } else {
        console.warn(`[Phase 3] Webhook送信失敗: ${payload.event} - ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[Phase 3] Webhookタイムアウト: ${payload.event}`);
      } else {
        console.error(`[Phase 3] Webhook送信エラー: ${payload.event}`, error);
      }
      return false;
    }
  }

  /**
   * バッチ通知（複数のイベントを一度に送信）
   */
  async sendBatchNotifications(payloads: WebhookPayload[]): Promise<boolean[]> {
    const promises = payloads.map(payload => this.sendWebhook(payload));
    return Promise.all(promises);
  }
}

// シングルトンインスタンス
export const medicalSystemWebhook = new MedicalSystemWebhook();