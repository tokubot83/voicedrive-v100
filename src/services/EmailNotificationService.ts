// Email Notification Service
// Phase 3: Send security alerts via email (backup notification)

export interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  private securityEmail: string;
  private fromEmail: string;

  private constructor() {
    // Get email addresses from environment variables
    this.securityEmail = process.env.MEDICAL_SYSTEM_SECURITY_EMAIL || '';
    this.fromEmail = process.env.VOICEDRIVE_FROM_EMAIL || 'noreply@voicedrive.jp';

    if (!this.securityEmail) {
      console.warn('[EmailNotification] MEDICAL_SYSTEM_SECURITY_EMAIL not configured');
    }
  }

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Send a security alert via email
   */
  async sendSecurityAlert(alert: {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): Promise<boolean> {
    if (!this.securityEmail) {
      console.log('[EmailNotification] Skipping email notification (not configured)');
      return false;
    }

    const subject = `[VoiceDrive Security Alert] ${alert.severity.toUpperCase()}: ${alert.type.replace(/_/g, ' ')}`;

    const html = this.generateSecurityAlertHtml(alert);
    const text = this.generateSecurityAlertText(alert);

    return await this.sendEmail({
      to: [this.securityEmail],
      subject,
      html,
      text
    });
  }

  /**
   * Send critical alert (double notification for critical severity)
   */
  async sendCriticalAlert(alert: {
    id: string;
    type: string;
    severity: 'critical';
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): Promise<boolean> {
    if (!this.securityEmail) {
      console.log('[EmailNotification] Skipping email notification (not configured)');
      return false;
    }

    const subject = `🚨 [CRITICAL] VoiceDrive Security Alert: ${alert.type.replace(/_/g, ' ')}`;

    const html = this.generateCriticalAlertHtml(alert);
    const text = this.generateSecurityAlertText(alert);

    // Send to multiple recipients for critical alerts
    const recipients = [this.securityEmail];

    // Add additional critical alert recipients from env
    const additionalRecipients = process.env.MEDICAL_SYSTEM_CRITICAL_ALERT_EMAILS?.split(',') || [];
    recipients.push(...additionalRecipients.filter(email => email.trim()));

    return await this.sendEmail({
      to: recipients,
      subject,
      html,
      text
    });
  }

  /**
   * Send daily summary via email
   */
  async sendDailySummary(summary: {
    date: Date;
    totalActions: number;
    criticalActions: number;
    highActions: number;
    newAlerts: number;
    topUsers: { userId: string; count: number }[];
  }): Promise<boolean> {
    if (!this.securityEmail) {
      console.log('[EmailNotification] Skipping email notification (not configured)');
      return false;
    }

    const subject = `VoiceDrive Daily Audit Summary - ${summary.date.toLocaleDateString('ja-JP')}`;

    const html = this.generateDailySummaryHtml(summary);
    const text = this.generateDailySummaryText(summary);

    return await this.sendEmail({
      to: [this.securityEmail],
      subject,
      html,
      text
    });
  }

  /**
   * Send email using configured SMTP or service
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In production, use an email service (SendGrid, AWS SES, etc.)
      // For now, log the email that would be sent

      console.log('[EmailNotification] Email would be sent:');
      console.log('  To:', options.to.join(', '));
      console.log('  Subject:', options.subject);
      console.log('  Text:', options.text?.substring(0, 200) + '...');

      // TODO: Integrate with actual email service
      /*
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: options.to.map(email => ({ email }))
          }],
          from: { email: this.fromEmail },
          subject: options.subject,
          content: [
            { type: 'text/plain', value: options.text || '' },
            { type: 'text/html', value: options.html }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }
      */

      return true;
    } catch (error) {
      console.error('[EmailNotification] Failed to send email:', error);
      return false;
    }
  }

  /**
   * Generate HTML for security alert email
   */
  private generateSecurityAlertHtml(alert: {
    id: string;
    type: string;
    severity: string;
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): string {
    const severityColor = this.getSeverityColor(alert.severity);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #555; }
    .field-value { color: #333; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 VoiceDrive Security Alert</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Alert Type:</div>
        <div class="field-value">${alert.type.toUpperCase().replace(/_/g, ' ')}</div>
      </div>
      <div class="field">
        <div class="field-label">Severity:</div>
        <div class="field-value" style="color: ${severityColor}; font-weight: bold;">${alert.severity.toUpperCase()}</div>
      </div>
      <div class="field">
        <div class="field-label">Description:</div>
        <div class="field-value">${alert.description}</div>
      </div>
      <div class="field">
        <div class="field-label">Alert ID:</div>
        <div class="field-value">${alert.id}</div>
      </div>
      <div class="field">
        <div class="field-label">Detected At:</div>
        <div class="field-value">${alert.detectedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
      </div>
      <div class="field">
        <div class="field-label">Related Audit Logs:</div>
        <div class="field-value">${alert.relatedLogs.length} log entries</div>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated security alert from VoiceDrive Audit System.</p>
      <p>Please investigate and take appropriate action if necessary.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for critical alert email (enhanced styling)
   */
  private generateCriticalAlertHtml(alert: {
    id: string;
    type: string;
    severity: string;
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .critical-banner { background: #ffebee; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 20px; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #555; }
    .field-value { color: #333; }
    .action-required { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 CRITICAL SECURITY ALERT 🚨</h1>
    </div>
    <div class="critical-banner">
      <strong>⚠️ IMMEDIATE ACTION REQUIRED</strong><br>
      This is a critical security event that requires immediate investigation.
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Alert Type:</div>
        <div class="field-value"><strong>${alert.type.toUpperCase().replace(/_/g, ' ')}</strong></div>
      </div>
      <div class="field">
        <div class="field-label">Severity:</div>
        <div class="field-value" style="color: #dc3545; font-weight: bold; font-size: 18px;">CRITICAL</div>
      </div>
      <div class="field">
        <div class="field-label">Description:</div>
        <div class="field-value">${alert.description}</div>
      </div>
      <div class="field">
        <div class="field-label">Alert ID:</div>
        <div class="field-value"><code>${alert.id}</code></div>
      </div>
      <div class="field">
        <div class="field-label">Detected At:</div>
        <div class="field-value">${alert.detectedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
      </div>
      <div class="field">
        <div class="field-label">Related Audit Logs:</div>
        <div class="field-value">${alert.relatedLogs.length} log entries</div>
      </div>
      <div class="action-required">
        <strong>Recommended Actions:</strong>
        <ul>
          <li>Review related audit logs immediately</li>
          <li>Verify the legitimacy of the detected activity</li>
          <li>Take containment measures if necessary</li>
          <li>Document investigation findings</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p><strong>This is a critical automated security alert from VoiceDrive Audit System.</strong></p>
      <p>Do not ignore this message. Immediate investigation is required.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text for security alert email
   */
  private generateSecurityAlertText(alert: {
    id: string;
    type: string;
    severity: string;
    description: string;
    relatedLogs: string[];
    detectedAt: Date;
  }): string {
    return `
VoiceDrive Security Alert

Alert Type: ${alert.type.toUpperCase().replace(/_/g, ' ')}
Severity: ${alert.severity.toUpperCase()}
Description: ${alert.description}
Alert ID: ${alert.id}
Detected At: ${alert.detectedAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
Related Audit Logs: ${alert.relatedLogs.length} entries

---
This is an automated security alert from VoiceDrive Audit System.
Please investigate and take appropriate action if necessary.
    `.trim();
  }

  /**
   * Generate HTML for daily summary email
   */
  private generateDailySummaryHtml(summary: {
    date: Date;
    totalActions: number;
    criticalActions: number;
    highActions: number;
    newAlerts: number;
    topUsers: { userId: string; count: number }[];
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .stat-box { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
    .stat-label { font-size: 12px; color: #666; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .top-users { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 VoiceDrive Daily Audit Summary</h1>
      <p>Date: ${summary.date.toLocaleDateString('ja-JP')}</p>
    </div>
    <div class="content">
      <div class="stats">
        <div class="stat-box">
          <div class="stat-label">Total Actions</div>
          <div class="stat-value">${summary.totalActions.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Critical Actions</div>
          <div class="stat-value" style="color: #dc3545;">${summary.criticalActions.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">High Severity</div>
          <div class="stat-value" style="color: #ffc107;">${summary.highActions.toLocaleString()}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">New Alerts</div>
          <div class="stat-value">${summary.newAlerts.toLocaleString()}</div>
        </div>
      </div>
      <div class="top-users">
        <h3>Top Active Users</h3>
        <ol>
          ${summary.topUsers.slice(0, 5).map(u =>
            `<li>${u.userId}: ${u.count.toLocaleString()} actions</li>`
          ).join('')}
        </ol>
      </div>
    </div>
    <div class="footer">
      <p>VoiceDrive Audit System - Daily Summary Report</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text for daily summary email
   */
  private generateDailySummaryText(summary: {
    date: Date;
    totalActions: number;
    criticalActions: number;
    highActions: number;
    newAlerts: number;
    topUsers: { userId: string; count: number }[];
  }): string {
    return `
VoiceDrive Daily Audit Summary
Date: ${summary.date.toLocaleDateString('ja-JP')}

Statistics:
- Total Actions: ${summary.totalActions.toLocaleString()}
- Critical Actions: ${summary.criticalActions.toLocaleString()}
- High Severity Actions: ${summary.highActions.toLocaleString()}
- New Security Alerts: ${summary.newAlerts.toLocaleString()}

Top Active Users:
${summary.topUsers.slice(0, 5).map((u, i) =>
  `${i + 1}. ${u.userId}: ${u.count.toLocaleString()} actions`
).join('\n')}

---
VoiceDrive Audit System - Daily Summary Report
    `.trim();
  }

  /**
   * Get color based on severity
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#ffc107';
      case 'medium':
        return '#fd7e14';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  /**
   * Test email integration
   */
  async testConnection(): Promise<boolean> {
    if (!this.securityEmail) {
      console.error('[EmailNotification] Security email not configured');
      return false;
    }

    console.log('[EmailNotification] Test email would be sent to:', this.securityEmail);
    console.log('[EmailNotification] From:', this.fromEmail);

    // In production, send actual test email
    return true;
  }
}

// Export singleton instance
export default EmailNotificationService.getInstance();
