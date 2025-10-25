/**
 * MonitoringService - システム監視データ取得サービス
 *
 * VoiceDrive内部のデータを集計し、SystemMonitorPageに提供
 * Phase 1: VoiceDrive単独で実装可能な監視項目のみ
 */

// データベース監視メトリクス
export interface DatabaseMetrics {
  tables: {
    [tableName: string]: {
      count: number;
      lastUpdated: string;
    };
  };
  totalRecords: number;
  slowQueries: number;
  activeConnections: number;
}

// セキュリティ監視メトリクス
export interface SecurityMetrics {
  suspiciousActivities: {
    rapidActions: number;        // 5分間に10回以上のアクション
    nightActivity: number;        // 22時-6時のアクティビティ
    repeatedFailures: number;     // 10分間に5回以上のエラー
    permissionEscalation: number; // 権限昇格操作
  };
  auditLog: {
    total24h: number;
    highSeverity: number;
    criticalActions: number;
    integrityChecksPassed: boolean;
  };
  recentCriticalActions: Array<{
    action: string;
    userId: string;
    timestamp: string;
    severity: string;
  }>;
}

// ビジネスKPIメトリクス
export interface BusinessMetrics {
  voting: {
    totalVotes: number;
    completedVotes: number;
    completionRate: number;      // %
    participationRate: number;   // %
    avgVotingTime: number;       // 分
    escalationCount: number;
    deadlineExtensions: number;
  };
  proposals: {
    totalProposals: number;
    approvedProposals: number;
    approvalRate: number;        // %
    avgReviewTime: number;       // 時間
    pendingReviews: number;
  };
  interviews: {
    totalBookings: number;
    confirmedBookings: number;
    confirmationRate: number;    // %
    cancellationRate: number;    // %
  };
}

// 通知システムメトリクス
export interface NotificationMetrics {
  sent24h: number;
  deliveryRate: number;          // %
  openRate: number;              // %
  byCategory: {
    [category: string]: {
      sent: number;
      opened: number;
      openRate: number;
    };
  };
  failedDeliveries: number;
}

// スケジューラーメトリクス
export interface SchedulerMetrics {
  schedulers: {
    [schedulerName: string]: {
      lastRun: string;
      status: 'success' | 'failed' | 'pending';
      processedCount: number;
      duration: number;          // 秒
      nextRun?: string;
    };
  };
}

// APIメトリクス（簡易版）
export interface APIMetrics {
  endpoints: {
    [endpoint: string]: {
      requests24h: number;
      avgResponseTime: number;   // ms
      errorRate: number;         // %
    };
  };
  totalRequests24h: number;
  overallErrorRate: number;
}

/**
 * MonitoringService クラス
 *
 * 各種監視データを取得するメソッドを提供
 * 実際の実装では、Prismaを使用してDBからデータを取得
 */
export class MonitoringService {
  /**
   * データベース監視データを取得
   */
  static async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    // TODO: 実際のPrisma実装
    // const userCount = await prisma.user.count();
    // const postCount = await prisma.post.count();
    // etc...

    // Phase 1.1: シミュレーションデータ（後でPrismaに置き換え）
    return {
      tables: {
        User: { count: 342, lastUpdated: new Date().toISOString() },
        Post: { count: 1547, lastUpdated: new Date().toISOString() },
        Vote: { count: 8932, lastUpdated: new Date().toISOString() },
        VoteHistory: { count: 45231, lastUpdated: new Date().toISOString() },
        Notification: { count: 12458, lastUpdated: new Date().toISOString() },
        AuditLog: { count: 234567, lastUpdated: new Date().toISOString() },
        Interview: { count: 892, lastUpdated: new Date().toISOString() },
        Evaluation: { count: 456, lastUpdated: new Date().toISOString() },
        ProposalReview: { count: 234, lastUpdated: new Date().toISOString() },
        SystemConfig: { count: 15, lastUpdated: new Date().toISOString() }
      },
      totalRecords: 304724,
      slowQueries: 0,
      activeConnections: 12
    };
  }

  /**
   * セキュリティ監視データを取得
   */
  static async getSecurityMetrics(): Promise<SecurityMetrics> {
    // TODO: AuditLogテーブルから実データを取得
    // const rapidActions = await prisma.auditLog.count({
    //   where: {
    //     createdAt: { gte: fiveMinutesAgo },
    //     userId: { /* group by */ }
    //   }
    // });

    return {
      suspiciousActivities: {
        rapidActions: 0,
        nightActivity: 12,
        repeatedFailures: 0,
        permissionEscalation: 0
      },
      auditLog: {
        total24h: 1247,
        highSeverity: 23,
        criticalActions: 5,
        integrityChecksPassed: true
      },
      recentCriticalActions: [
        {
          action: 'SYSTEM_SETTINGS_UPDATED',
          userId: 'admin-001',
          timestamp: new Date().toISOString(),
          severity: 'high'
        }
      ]
    };
  }

  /**
   * ビジネスKPIデータを取得
   */
  static async getBusinessMetrics(): Promise<BusinessMetrics> {
    // TODO: Vote, Post, Interviewテーブルから実データを取得

    return {
      voting: {
        totalVotes: 8932,
        completedVotes: 6028,
        completionRate: 67.5,
        participationRate: 82.3,
        avgVotingTime: 2.5,
        escalationCount: 12,
        deadlineExtensions: 3
      },
      proposals: {
        totalProposals: 145,
        approvedProposals: 63,
        approvalRate: 43.4,
        avgReviewTime: 18.5,
        pendingReviews: 23
      },
      interviews: {
        totalBookings: 892,
        confirmedBookings: 821,
        confirmationRate: 92.1,
        cancellationRate: 5.3
      }
    };
  }

  /**
   * 通知システムデータを取得
   */
  static async getNotificationMetrics(): Promise<NotificationMetrics> {
    // TODO: Notificationテーブルから実データを取得

    return {
      sent24h: 1250,
      deliveryRate: 94.5,
      openRate: 42.3,
      byCategory: {
        interview: { sent: 250, opened: 120, openRate: 48.0 },
        hr: { sent: 180, opened: 95, openRate: 52.8 },
        agenda: { sent: 420, opened: 180, openRate: 42.9 },
        system: { sent: 150, opened: 45, openRate: 30.0 },
        training: { sent: 100, opened: 58, openRate: 58.0 },
        shift: { sent: 80, opened: 62, openRate: 77.5 },
        project: { sent: 50, opened: 28, openRate: 56.0 },
        evaluation: { sent: 20, opened: 12, openRate: 60.0 }
      },
      failedDeliveries: 69
    };
  }

  /**
   * スケジューラーデータを取得
   */
  static async getSchedulerMetrics(): Promise<SchedulerMetrics> {
    // TODO: スケジューラー実行ログから実データを取得

    return {
      schedulers: {
        InterviewReminderService: {
          lastRun: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 45,
          duration: 2.3,
          nextRun: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
        },
        VotingDeadlineService: {
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 12,
          duration: 1.1,
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
        },
        UserActivityService: {
          lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 342,
          duration: 15.7,
          nextRun: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString()
        },
        RetirementProcessingService: {
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 2,
          duration: 0.8,
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        PollExpirationChecker: {
          lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 8,
          duration: 1.2,
          nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        },
        FreespaceExpirationService: {
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          processedCount: 15,
          duration: 2.1,
          nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
        }
      }
    };
  }

  /**
   * API監視データを取得
   */
  static async getAPIMetrics(): Promise<APIMetrics> {
    // TODO: APIログから実データを取得

    return {
      endpoints: {
        '/api/posts': {
          requests24h: 1250,
          avgResponseTime: 145,
          errorRate: 0.8
        },
        '/api/votes': {
          requests24h: 890,
          avgResponseTime: 95,
          errorRate: 0.3
        },
        '/api/profile': {
          requests24h: 456,
          avgResponseTime: 210,
          errorRate: 1.2
        },
        '/api/proposal-review': {
          requests24h: 234,
          avgResponseTime: 320,
          errorRate: 2.1
        },
        '/api/interviews': {
          requests24h: 178,
          avgResponseTime: 180,
          errorRate: 0.6
        },
        '/api/notifications': {
          requests24h: 2340,
          avgResponseTime: 85,
          errorRate: 0.4
        },
        '/api/system/mode': {
          requests24h: 45,
          avgResponseTime: 120,
          errorRate: 0.0
        },
        '/api/audit-logs': {
          requests24h: 123,
          avgResponseTime: 250,
          errorRate: 1.6
        }
      },
      totalRequests24h: 5516,
      overallErrorRate: 0.9
    };
  }

  /**
   * すべての監視データを一度に取得
   */
  static async getAllMetrics() {
    const [
      database,
      security,
      business,
      notifications,
      schedulers,
      api
    ] = await Promise.all([
      this.getDatabaseMetrics(),
      this.getSecurityMetrics(),
      this.getBusinessMetrics(),
      this.getNotificationMetrics(),
      this.getSchedulerMetrics(),
      this.getAPIMetrics()
    ]);

    return {
      database,
      security,
      business,
      notifications,
      schedulers,
      api,
      timestamp: new Date().toISOString()
    };
  }
}
