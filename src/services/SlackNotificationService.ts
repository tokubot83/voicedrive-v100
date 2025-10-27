// Slack Notification Service
// Phase 3: Send security alerts to Slack webhook

export interface SlackNotification {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  text?: string;
  attachments?: SlackAttachment[];
}

export interface SlackAttachment {
  color?: 'good' | 'warning' | 'danger' | string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export class SlackNotificationService {
  private static instance: SlackNotificationService;
  private webhookUrl: string;

  private constructor() {
    // Get webhook URL from environment variable
    this.webhookUrl = process.env.MEDICAL_SYSTEM_SLACK_WEBHOOK_URL || '';

    if (!this.webhookUrl) {
      console.warn('[SlackNotification] MEDICAL_SYSTEM_SLACK_WEBHOOK_URL not configured');
    }
  }

  static getInstance(): SlackNotificationService {
    if (!SlackNotificationService.instance) {
      SlackNotificationService.instance = new SlackNotificationService();
    }
    return SlackNotificationService.instance;
  }

  /**
   * Send a security alert to Slack
   */
  async sendSecurityAlert(alert: {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('[SlackNotification] Skipping Slack notification (not configured)');
      return false;
    }

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const notification: SlackNotification = {
      channel: '#security-alerts',
      username: 'VoiceDrive Security Bot',
      icon_emoji: ':rotating_light:',
      attachments: [
        {
          color,
          title: `${emoji} ${alert.type.toUpperCase().replace(/_/g, ' ')}`,
          text: alert.description,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Alert ID',
              value: alert.id,
              short: true
            },
            {
              title: 'Detected At',
              value: alert.detectedAt.toLocaleString('ja-JP', {
                timeZone: 'Asia/Tokyo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              short: true
            },
            {
              title: 'Related Logs',
              value: `${alert.relatedLogs.length} logs`,
              short: true
            }
          ],
          footer: 'VoiceDrive Audit System',
          ts: Math.floor(alert.detectedAt.getTime() / 1000)
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log(`[SlackNotification] Security alert sent: ${alert.id} (${alert.severity})`);
      return true;
    } catch (error) {
      console.error('[SlackNotification] Failed to send alert:', error);
      return false;
    }
  }

  /**
   * Send a daily summary to Slack
   */
  async sendDailySummary(summary: {
    date: Date;
    totalActions: number;
    criticalActions: number;
    highActions: number;
    newAlerts: number;
    topUsers: { userId: string; count: number }[];
  }): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('[SlackNotification] Skipping Slack notification (not configured)');
      return false;
    }

    const notification: SlackNotification = {
      channel: '#security-alerts',
      username: 'VoiceDrive Security Bot',
      icon_emoji: ':bar_chart:',
      attachments: [
        {
          color: 'good',
          title: '📊 VoiceDrive Daily Audit Summary',
          text: `Summary for ${summary.date.toLocaleDateString('ja-JP')}`,
          fields: [
            {
              title: 'Total Actions',
              value: summary.totalActions.toLocaleString(),
              short: true
            },
            {
              title: 'Critical Actions',
              value: summary.criticalActions.toLocaleString(),
              short: true
            },
            {
              title: 'High Severity Actions',
              value: summary.highActions.toLocaleString(),
              short: true
            },
            {
              title: 'New Security Alerts',
              value: summary.newAlerts.toLocaleString(),
              short: true
            },
            {
              title: 'Top 3 Active Users',
              value: summary.topUsers
                .slice(0, 3)
                .map((u, i) => `${i + 1}. ${u.userId} (${u.count} actions)`)
                .join('\n'),
              short: false
            }
          ],
          footer: 'VoiceDrive Audit System',
          ts: Math.floor(summary.date.getTime() / 1000)
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log('[SlackNotification] Daily summary sent');
      return true;
    } catch (error) {
      console.error('[SlackNotification] Failed to send daily summary:', error);
      return false;
    }
  }

  /**
   * Send archive maintenance notification
   */
  async sendMaintenanceNotification(result: {
    archived: number;
    deleted: number;
    activeLogsCount: number;
    archivedLogsCount: number;
  }): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('[SlackNotification] Skipping Slack notification (not configured)');
      return false;
    }

    const notification: SlackNotification = {
      channel: '#security-alerts',
      username: 'VoiceDrive Maintenance Bot',
      icon_emoji: ':gear:',
      attachments: [
        {
          color: 'good',
          title: '🔧 Audit Log Maintenance Completed',
          fields: [
            {
              title: 'Logs Archived (>1 year)',
              value: result.archived.toLocaleString(),
              short: true
            },
            {
              title: 'Logs Deleted (>3 years)',
              value: result.deleted.toLocaleString(),
              short: true
            },
            {
              title: 'Active Logs',
              value: result.activeLogsCount.toLocaleString(),
              short: true
            },
            {
              title: 'Archived Logs',
              value: result.archivedLogsCount.toLocaleString(),
              short: true
            }
          ],
          footer: 'VoiceDrive Audit System'
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log('[SlackNotification] Maintenance notification sent');
      return true;
    } catch (error) {
      console.error('[SlackNotification] Failed to send maintenance notification:', error);
      return false;
    }
  }

  /**
   * Get color based on severity
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return '#ffa500'; // Orange
      case 'low':
        return 'good';
      default:
        return '#808080'; // Gray
    }
  }

  /**
   * Get emoji based on severity
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  }

  /**
   * Test Slack integration
   */
  async testConnection(): Promise<boolean> {
    if (!this.webhookUrl) {
      console.error('[SlackNotification] Webhook URL not configured');
      return false;
    }

    const testNotification: SlackNotification = {
      channel: '#security-alerts',
      username: 'VoiceDrive Test Bot',
      icon_emoji: ':white_check_mark:',
      text: '✅ Slack integration test successful! VoiceDrive security alerts are now connected.'
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testNotification)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log('[SlackNotification] Test message sent successfully');
      return true;
    } catch (error) {
      console.error('[SlackNotification] Test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default SlackNotificationService.getInstance();
