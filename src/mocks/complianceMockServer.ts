/**
 * コンプライアンス窓口 モックAPIサーバー
 * 開発・テスト用の医療システムAPI模擬
 * @version 1.0.0
 * @date 2025-09-24
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

// ==================== 型定義 ====================

interface MockDatabase {
  reports: Map<string, any>;
  statusHistory: Map<string, any[]>;
  notifications: any[];
  auditLogs: any[];
}

// ==================== モックデータストア ====================

class MockDataStore {
  private db: MockDatabase = {
    reports: new Map(),
    statusHistory: new Map(),
    notifications: [],
    auditLogs: []
  };

  // レポート保存
  saveReport(caseNumber: string, report: any): void {
    this.db.reports.set(caseNumber, {
      ...report,
      caseNumber,
      status: 'received',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 初期ステータス履歴
    this.addStatusHistory(caseNumber, 'received', '通報を受付しました');
  }

  // ステータス履歴追加
  addStatusHistory(caseNumber: string, status: string, note: string): void {
    const history = this.db.statusHistory.get(caseNumber) || [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note
    });
    this.db.statusHistory.set(caseNumber, history);
  }

  // レポート取得
  getReport(anonymousId: string): any {
    for (const [, report] of this.db.reports) {
      if (report.anonymousId === anonymousId) {
        return report;
      }
    }
    return null;
  }

  // ステータス履歴取得
  getStatusHistory(caseNumber: string): any[] {
    return this.db.statusHistory.get(caseNumber) || [];
  }

  // 監査ログ追加
  addAuditLog(action: string, details: any): void {
    this.db.auditLogs.push({
      id: crypto.randomUUID(),
      action,
      details,
      timestamp: new Date()
    });
  }
}

// ==================== モックAPIサーバー ====================

export class ComplianceMockServer {
  private app: express.Application;
  private port: number;
  private dataStore: MockDataStore;
  private server: any;

  constructor(port: number = 3002) {
    this.app = express();
    this.port = port;
    this.dataStore = new MockDataStore();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * ミドルウェアのセットアップ
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));

    // リクエストログ
    this.app.use((req, res, next) => {
      console.log(`[MockAPI] ${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body
      });
      next();
    });

    // 遅延シミュレーション（実際のAPIの遅延を模擬）
    this.app.use((req, res, next) => {
      const delay = Math.random() * 500 + 100; // 100-600ms
      setTimeout(next, delay);
    });
  }

  /**
   * ルートのセットアップ
   */
  private setupRoutes(): void {
    // ヘルスチェック
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // 通報受信API
    this.app.post('/v3/compliance/receive', this.handleReceiveReport.bind(this));

    // ステータス確認API
    this.app.get('/v3/compliance/status/:anonymousId', this.handleGetStatus.bind(this));

    // 追加情報送信API
    this.app.post('/v3/compliance/additional-info', this.handleAdditionalInfo.bind(this));

    // カテゴリ一覧API
    this.app.get('/v3/compliance/categories', this.handleGetCategories.bind(this));

    // Webhook登録API
    this.app.post('/v3/webhooks/register', this.handleWebhookRegister.bind(this));

    // 統計情報API（追加）
    this.app.get('/v3/compliance/statistics', this.handleGetStatistics.bind(this));

    // 404ハンドラー
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });

    // エラーハンドラー
    this.app.use((err: any, req: any, res: any, next: any) => {
      console.error('[MockAPI] Error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err.message || 'Internal server error'
        }
      });
    });
  }

  /**
   * 通報受信処理
   */
  private handleReceiveReport(req: express.Request, res: express.Response): void {
    try {
      // 認証チェック（モック）
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization token'
          }
        });
      }

      // ペイロード検証
      const { payload, checksum, metadata } = req.body;
      if (!payload || !checksum || !metadata) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields'
          }
        });
      }

      // チェックサム検証（モック）
      // 実際は復号化してチェックサムを検証
      console.log('[MockAPI] Checksum validation passed');

      // ケース番号生成
      const caseNumber = this.generateCaseNumber();

      // レポート保存
      this.dataStore.saveReport(caseNumber, {
        voicedriveReportId: metadata.reportId,
        anonymousId: metadata.anonymousId,
        severity: metadata.severity,
        category: metadata.category,
        requiresImmediateAction: metadata.requiresImmediateAction,
        encryptedPayload: payload
      });

      // 監査ログ
      this.dataStore.addAuditLog('REPORT_RECEIVED', {
        caseNumber,
        reportId: metadata.reportId,
        severity: metadata.severity
      });

      // 成功応答
      res.json({
        success: true,
        caseNumber,
        acknowledgementId: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        message: 'Report received and processing initiated',
        estimatedResponseTime: this.getEstimatedResponseTime(metadata.severity),
        status: 'received',
        nextSteps: '担当者が割り当てられ次第、調査を開始します'
      });

      // 非同期でステータス更新（実際の処理を模擬）
      this.simulateProcessing(caseNumber, metadata.severity);

    } catch (error) {
      console.error('[MockAPI] Error in handleReceiveReport:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process report'
        }
      });
    }
  }

  /**
   * ステータス確認処理
   */
  private handleGetStatus(req: express.Request, res: express.Response): void {
    const { anonymousId } = req.params;

    // レポート検索
    const report = this.dataStore.getReport(anonymousId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: '指定された匿名IDの通報が見つかりません'
        }
      });
    }

    // ステータス履歴取得
    const history = this.dataStore.getStatusHistory(report.caseNumber);

    // 進捗計算
    const progressMap: Record<string, number> = {
      received: 10,
      triaging: 25,
      investigating: 50,
      pending_decision: 75,
      resolved: 90,
      closed: 100
    };

    const currentStatus = history[history.length - 1]?.status || 'received';
    const progress = progressMap[currentStatus] || 0;

    // 応答
    res.json({
      success: true,
      anonymousId,
      caseNumber: report.caseNumber,
      currentStatus: {
        code: currentStatus,
        label: this.getStatusLabel(currentStatus),
        description: this.getStatusDescription(currentStatus),
        since: history[history.length - 1]?.timestamp
      },
      progress: {
        percentage: progress,
        phase: this.getPhaseLabel(currentStatus),
        estimatedCompletion: this.getEstimatedCompletion(report.createdAt, report.severity)
      },
      history,
      actions: {
        canProvideAdditionalInfo: currentStatus !== 'closed',
        canWithdraw: currentStatus === 'received',
        canViewDetails: false,
        canContact: true
      },
      nextSteps: this.getNextSteps(currentStatus),
      lastUpdated: report.updatedAt || report.createdAt
    });
  }

  /**
   * 追加情報処理
   */
  private handleAdditionalInfo(req: express.Request, res: express.Response): void {
    const { anonymousId, type, content } = req.body;

    const report = this.dataStore.getReport(anonymousId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report not found'
        }
      });
    }

    // 追加情報を保存（モック）
    console.log('[MockAPI] Additional info received:', { anonymousId, type });

    res.json({
      success: true,
      message: '追加情報を受け付けました',
      referenceId: `info-${crypto.randomUUID().substring(0, 8)}`,
      receivedAt: new Date().toISOString()
    });
  }

  /**
   * カテゴリ一覧取得
   */
  private handleGetCategories(req: express.Request, res: express.Response): void {
    res.json({
      success: true,
      categories: [
        {
          id: 'harassment',
          label: 'ハラスメント',
          description: 'パワハラ、セクハラ、マタハラなど',
          subcategories: [
            { id: 'power', label: 'パワーハラスメント' },
            { id: 'sexual', label: 'セクシャルハラスメント' },
            { id: 'maternity', label: 'マタニティハラスメント' }
          ]
        },
        {
          id: 'medical_law',
          label: '医療法令違反',
          description: '医療法、診療報酬不正請求など',
          subcategories: [
            { id: 'medical_law_violation', label: '医療法違反' },
            { id: 'billing_fraud', label: '診療報酬不正請求' },
            { id: 'malpractice', label: '医療過誤' }
          ]
        },
        {
          id: 'safety',
          label: '安全管理',
          description: '患者安全、労働安全に関する問題',
          subcategories: []
        }
      ]
    });
  }

  /**
   * Webhook登録処理
   */
  private handleWebhookRegister(req: express.Request, res: express.Response): void {
    const { url, events } = req.body;

    if (!url || !events) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'URL and events are required'
        }
      });
    }

    const webhookId = crypto.randomUUID();
    console.log('[MockAPI] Webhook registered:', { webhookId, url, events });

    res.json({
      success: true,
      webhookId,
      message: 'Webhook registered successfully'
    });
  }

  /**
   * 統計情報取得
   */
  private handleGetStatistics(req: express.Request, res: express.Response): void {
    const totalReports = this.dataStore.db.reports.size;

    res.json({
      success: true,
      statistics: {
        total: totalReports,
        byStatus: {
          received: Math.floor(totalReports * 0.2),
          investigating: Math.floor(totalReports * 0.3),
          resolved: Math.floor(totalReports * 0.4),
          closed: Math.floor(totalReports * 0.1)
        },
        bySeverity: {
          critical: Math.floor(totalReports * 0.05),
          high: Math.floor(totalReports * 0.15),
          medium: Math.floor(totalReports * 0.5),
          low: Math.floor(totalReports * 0.3)
        },
        averageResponseTime: 24,
        averageResolutionTime: 168
      }
    });
  }

  // ==================== ヘルパーメソッド ====================

  /**
   * ケース番号生成
   */
  private generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `MED-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * 推定対応時間
   */
  private getEstimatedResponseTime(severity: string): any {
    const times: Record<string, any> = {
      critical: { value: 1, unit: 'hours' },
      high: { value: 24, unit: 'hours' },
      medium: { value: 3, unit: 'days' },
      low: { value: 7, unit: 'days' }
    };
    return times[severity] || times.medium;
  }

  /**
   * ステータスラベル
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      received: '受付完了',
      triaging: '分類中',
      investigating: '調査中',
      pending_decision: '判定待ち',
      resolved: '対応完了',
      closed: '終了'
    };
    return labels[status] || status;
  }

  /**
   * ステータス説明
   */
  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      received: '通報を受け付けました',
      triaging: '内容を確認し、担当者を割り当てています',
      investigating: '担当者が事実確認を行っています',
      pending_decision: '調査結果を基に対応を検討しています',
      resolved: '必要な対応が完了しました',
      closed: '案件がクローズされました'
    };
    return descriptions[status] || '';
  }

  /**
   * フェーズラベル
   */
  private getPhaseLabel(status: string): string {
    const phases: Record<string, string> = {
      received: '初期確認',
      triaging: '分類・割り当て',
      investigating: '事実確認',
      pending_decision: '判定',
      resolved: '対応実施',
      closed: '完了'
    };
    return phases[status] || status;
  }

  /**
   * 完了予定日
   */
  private getEstimatedCompletion(createdAt: Date, severity: string): string {
    const daysToAdd = severity === 'critical' ? 1 :
                     severity === 'high' ? 3 :
                     severity === 'medium' ? 7 : 14;

    const completion = new Date(createdAt);
    completion.setDate(completion.getDate() + daysToAdd);
    return completion.toISOString();
  }

  /**
   * 次のステップ
   */
  private getNextSteps(status: string): string {
    const steps: Record<string, string> = {
      received: '担当者の割り当てを行います',
      triaging: '調査方針を決定します',
      investigating: '関係者へのヒアリングを実施します',
      pending_decision: '対応方針を決定します',
      resolved: 'フォローアップを実施します',
      closed: '完了'
    };
    return steps[status] || '';
  }

  /**
   * 処理シミュレーション（非同期でステータス更新）
   */
  private async simulateProcessing(caseNumber: string, severity: string): Promise<void> {
    const delays = {
      critical: [1000, 2000, 3000],
      high: [2000, 5000, 10000],
      medium: [5000, 10000, 20000],
      low: [10000, 20000, 30000]
    };

    const statusFlow = [
      { status: 'triaging', note: '内容を確認しています' },
      { status: 'investigating', note: '調査を開始しました' },
      { status: 'pending_decision', note: '調査が完了し、対応を検討しています' }
    ];

    const selectedDelays = delays[severity as keyof typeof delays] || delays.medium;

    for (let i = 0; i < statusFlow.length; i++) {
      await new Promise(resolve => setTimeout(resolve, selectedDelays[i]));
      this.dataStore.addStatusHistory(
        caseNumber,
        statusFlow[i].status,
        statusFlow[i].note
      );
      console.log(`[MockAPI] Status updated: ${caseNumber} -> ${statusFlow[i].status}`);
    }
  }

  /**
   * サーバー起動
   */
  start(): void {
    this.server = this.app.listen(this.port, () => {
      console.log(`[MockAPI] Compliance mock server running on http://localhost:${this.port}`);
      console.log('[MockAPI] Available endpoints:');
      console.log('  - POST   /v3/compliance/receive');
      console.log('  - GET    /v3/compliance/status/:anonymousId');
      console.log('  - POST   /v3/compliance/additional-info');
      console.log('  - GET    /v3/compliance/categories');
      console.log('  - POST   /v3/webhooks/register');
      console.log('  - GET    /v3/compliance/statistics');
    });
  }

  /**
   * サーバー停止
   */
  stop(): void {
    if (this.server) {
      this.server.close(() => {
        console.log('[MockAPI] Server stopped');
      });
    }
  }
}

// ==================== モックサーバー起動スクリプト ====================

if (require.main === module) {
  const server = new ComplianceMockServer();
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[MockAPI] Shutting down...');
    server.stop();
    process.exit(0);
  });
}