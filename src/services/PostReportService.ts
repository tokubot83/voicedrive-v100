// Post Report Service
// 投稿通報の管理サービス（API連携版）
// 注意: 開発環境向け暫定実装。共通DB構築後は直接DB接続に切り替え予定

import { v4 as uuidv4 } from 'uuid';
import {
  PostReport,
  ReportSummary,
  ReportType,
  ReportStatus,
  ReportAlert,
  ReportThreshold,
  ReportStatistics
} from '../types/report';
import { environment } from '../config/environment';

// APIベースURL（Vercel環境では無効）
const API_BASE_URL = environment.apiBaseUrl ? `${environment.apiBaseUrl}/api` : null;

export class PostReportService {
  private static instance: PostReportService;

  // フォールバック用（APIが利用できない場合）
  private fallbackReports: Map<string, PostReport[]> = new Map();
  private fallbackAlerts: Map<string, ReportAlert> = new Map();
  private useApiFallback: boolean = false;

  // 通報閾値設定
  private readonly THRESHOLDS: ReportThreshold = {
    lowThreshold: 1,      // 1件で注意
    mediumThreshold: 3,   // 3件で警告
    highThreshold: 5,     // 5件で緊急
    criticalThreshold: 10 // 10件で重大
  };

  private constructor() {
    // 開発環境用: APIの可用性をチェック
    this.checkApiAvailability();
  }

  static getInstance(): PostReportService {
    if (!PostReportService.instance) {
      PostReportService.instance = new PostReportService();
    }
    return PostReportService.instance;
  }

  /**
   * API可用性チェック（開発環境用）
   */
  private async checkApiAvailability(): Promise<void> {
    // Vercel環境では常にフォールバックモード
    if (environment.isVercel || !API_BASE_URL) {
      this.useApiFallback = true;
      console.info('通報サービス: デモモードで動作します');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      this.useApiFallback = !response.ok;
    } catch {
      this.useApiFallback = true;
      console.warn('通報API利用不可: フォールバックモードで動作します');
    }
  }

  /**
   * 投稿を通報する
   * @param postId 投稿ID
   * @param reporterId 通報者ID
   * @param reportType 通報理由
   * @param description 詳細説明（任意）
   * @returns 通報結果
   */
  public async reportPost(
    postId: string,
    reporterId: string,
    reportType: ReportType,
    description?: string,
    reporterName?: string
  ): Promise<{ success: boolean; message: string; reportId?: string }> {
    // API利用可能な場合
    if (!this.useApiFallback) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporterId,
            reporterName,
            reportType,
            description
          })
        });

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('API通信エラー:', error);
        // フォールバックモードに切り替え
        this.useApiFallback = true;
      }
    }

    // フォールバック処理（メモリ上で管理）
    const existingReports = this.fallbackReports.get(postId) || [];
    const alreadyReported = existingReports.some(
      (r) => r.reporterId === reporterId && r.status === 'pending'
    );

    if (alreadyReported) {
      return {
        success: false,
        message: 'この投稿は既に通報済みです'
      };
    }

    const report: PostReport = {
      id: uuidv4(),
      postId,
      reporterId,
      reportType,
      description,
      timestamp: new Date(),
      status: 'pending'
    };

    existingReports.push(report);
    this.fallbackReports.set(postId, existingReports);

    // 閾値チェックとアラート生成（フォールバック）
    await this.checkThresholdsAndNotifyFallback(postId, existingReports);

    console.log(`[Fallback] 通報を受け付けました: ${report.id}`);

    return {
      success: true,
      message: '通報を受け付けました。確認後、適切に対応いたします。',
      reportId: report.id
    };
  }

  /**
   * 閾値チェックと管理者への通知（フォールバック用）
   * @param postId 投稿ID
   * @param reports 通報リスト
   */
  private async checkThresholdsAndNotifyFallback(
    postId: string,
    reports: PostReport[]
  ): Promise<void> {
    const reportCount = reports.filter((r) => r.status === 'pending').length;
    const severity = this.calculateSeverity(reportCount);

    // 閾値を超えている場合のみアラートを生成/更新
    if (reportCount >= this.THRESHOLDS.lowThreshold) {
      const alert: ReportAlert = {
        id: uuidv4(),
        postId,
        severity,
        reportCount,
        dominantReportType: this.getDominantReportType(reports),
        message: this.generateAlertMessage(reportCount, severity),
        timestamp: new Date(),
        acknowledged: false
      };

      this.fallbackAlerts.set(postId, alert);

      // 管理者への通知（実際の実装ではNotificationServiceを使用）
      await this.notifyAdministrators(alert);
    }
  }

  /**
   * 通報数から重大度を計算
   * @param reportCount 通報数
   * @returns 重大度
   */
  private calculateSeverity(reportCount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (reportCount >= this.THRESHOLDS.criticalThreshold) {
      return 'critical';
    } else if (reportCount >= this.THRESHOLDS.highThreshold) {
      return 'high';
    } else if (reportCount >= this.THRESHOLDS.mediumThreshold) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 最も多い通報理由を取得
   * @param reports 通報リスト
   * @returns 最頻通報理由
   */
  private getDominantReportType(reports: PostReport[]): ReportType {
    const typeCounts: Record<string, number> = {};

    reports.forEach((report) => {
      typeCounts[report.reportType] = (typeCounts[report.reportType] || 0) + 1;
    });

    const dominant = Object.entries(typeCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    );

    return dominant[0] as ReportType;
  }

  /**
   * アラートメッセージを生成
   * @param reportCount 通報数
   * @param severity 重大度
   * @returns アラートメッセージ
   */
  private generateAlertMessage(
    reportCount: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    switch (severity) {
      case 'critical':
        return `🚨 重大: ${reportCount}件の通報があります。即座の対応が必要です`;
      case 'high':
        return `⚠️ 緊急: ${reportCount}件の通報があります。優先的な確認が必要です`;
      case 'medium':
        return `⚡ 警告: ${reportCount}件の通報があります。確認をお願いします`;
      case 'low':
        return `📌 注意: ${reportCount}件の通報があります`;
      default:
        return `通報があります（${reportCount}件）`;
    }
  }

  /**
   * 管理者への通知
   * @param alert アラート情報
   */
  private async notifyAdministrators(alert: ReportAlert): Promise<void> {
    // 通知サービスを使用して管理者に通知
    const { reportNotificationService } = await import('./ReportNotificationService');
    await reportNotificationService.notifyManagers(alert);

    console.log('🔔 管理者への通知完了:', {
      postId: alert.postId,
      severity: alert.severity,
      reportCount: alert.reportCount,
      message: alert.message
    });
  }

  /**
   * 投稿の通報状況を取得
   * @param postId 投稿ID
   * @returns 通報サマリー（通報がない場合はnull）
   */
  public getReportSummary(postId: string): ReportSummary | null {
    // 現時点ではフォールバックのデータのみ返す（開発環境用）
    const reports = this.fallbackReports.get(postId);
    if (!reports || reports.length === 0) return null;

    const pendingReports = reports.filter((r) => r.status === 'pending');
    const reportTypeCounts: Record<string, number> = {};

    pendingReports.forEach((report) => {
      reportTypeCounts[report.reportType] =
        (reportTypeCounts[report.reportType] || 0) + 1;
    });

    const severity = this.calculateSeverity(pendingReports.length);

    return {
      postId,
      totalReports: reports.length,
      reportTypes: reportTypeCounts as Record<ReportType, number>,
      lastReportedAt: reports[reports.length - 1].timestamp,
      needsReview: pendingReports.length >= this.THRESHOLDS.mediumThreshold,
      highPriorityReports: pendingReports.filter(
        (r) =>
          r.reportType === 'harassment' ||
          r.reportType === 'personal_attack' ||
          r.reportType === 'privacy_violation'
      ).length,
      status: severity
    };
  }

  /**
   * ユーザーが特定の投稿を既に通報しているかチェック
   * @param postId 投稿ID
   * @param userId ユーザーID
   * @returns 通報済みかどうか
   */
  public async hasUserReported(postId: string, userId: string): Promise<boolean> {
    // API利用可能な場合
    if (!this.useApiFallback) {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/reports`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          const reports = data.data?.reports || [];
          return reports.some(
            (r: any) => r.reporterId === userId && r.status === 'pending'
          );
        }
      } catch (error) {
        console.error('API通信エラー:', error);
        this.useApiFallback = true;
      }
    }

    // フォールバック処理
    const reports = this.fallbackReports.get(postId);
    if (!reports) return false;

    return reports.some(
      (r) => r.reporterId === userId && r.status === 'pending'
    );
  }

  /**
   * 通報を確認済みにする
   * @param reportId 通報ID
   * @param reviewerId 確認者ID
   * @param actionTaken 実施した対応
   * @param reviewNotes 確認メモ
   */
  public async reviewReport(
    reportId: string,
    reviewerId: string,
    actionTaken: string,
    reviewNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    let foundReport: PostReport | null = null;
    let postId: string | null = null;

    // 通報を検索（フォールバック）
    for (const [pid, reports] of this.fallbackReports.entries()) {
      const report = reports.find((r) => r.id === reportId);
      if (report) {
        foundReport = report;
        postId = pid;
        break;
      }
    }

    if (!foundReport || !postId) {
      return {
        success: false,
        message: '通報が見つかりません'
      };
    }

    // 通報を更新
    foundReport.status = 'actioned';
    foundReport.reviewedBy = reviewerId;
    foundReport.reviewedAt = new Date();
    foundReport.actionTaken = actionTaken;
    foundReport.reviewNotes = reviewNotes;

    // アラートを確認済みにする（フォールバック）
    const alert = this.fallbackAlerts.get(postId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = reviewerId;
      alert.acknowledgedAt = new Date();
    }

    console.log(`通報確認完了: ${reportId} by ${reviewerId}`);

    return {
      success: true,
      message: '通報を確認済みにしました'
    };
  }

  /**
   * 全ての未確認アラートを取得
   * @returns 未確認アラートのリスト
   */
  public getUnacknowledgedAlerts(): ReportAlert[] {
    return Array.from(this.fallbackAlerts.values())
      .filter((alert) => !alert.acknowledged)
      .sort((a, b) => {
        // 重大度でソート
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }

  /**
   * 通報統計を取得
   * @returns 通報統計データ
   */
  public getStatistics(): ReportStatistics {
    const allReports: PostReport[] = [];
    Array.from(this.fallbackReports.values()).forEach((reports) => {
      allReports.push(...reports);
    });

    const reportsByType: Record<string, number> = {};
    const reportsByStatus: Record<string, number> = {};

    allReports.forEach((report) => {
      reportsByType[report.reportType] =
        (reportsByType[report.reportType] || 0) + 1;
      reportsByStatus[report.status] =
        (reportsByStatus[report.status] || 0) + 1;
    });

    // 最も通報が多い投稿TOP5
    const postReportCounts = new Map<string, number>();
    for (const [postId, reports] of this.fallbackReports.entries()) {
      postReportCounts.set(postId, reports.length);
    }

    const topReportedPosts = Array.from(postReportCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([postId, reportCount]) => {
        const reports = this.fallbackReports.get(postId)!;
        const hasPending = reports.some((r) => r.status === 'pending');
        return {
          postId,
          reportCount,
          status: (hasPending ? 'pending' : 'actioned') as ReportStatus
        };
      });

    // 平均対応時間を計算
    const actionedReports = allReports.filter((r) => r.status === 'actioned' && r.reviewedAt);
    const averageResponseTime =
      actionedReports.length > 0
        ? actionedReports.reduce((sum, r) => {
            const responseTime =
              (r.reviewedAt!.getTime() - r.timestamp.getTime()) / (1000 * 60 * 60); // 時間単位
            return sum + responseTime;
          }, 0) / actionedReports.length
        : 0;

    return {
      totalReports: allReports.length,
      reportsByType: reportsByType as Record<ReportType, number>,
      reportsByStatus: reportsByStatus as Record<ReportStatus, number>,
      pendingReports: reportsByStatus['pending'] || 0,
      averageResponseTime,
      topReportedPosts
    };
  }

  /**
   * テスト用: 全データをクリア
   */
  public clearAllData(): void {
    this.fallbackReports.clear();
    this.fallbackAlerts.clear();
  }
}
