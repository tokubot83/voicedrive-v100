/**
 * 健康データ関連のAPIルート
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  getHealthNotificationHandler,
  getHealthNotificationWatcher
} from '../../services/healthNotificationHandler';
import {
  HealthNotification,
  HealthReport,
  NotificationProcessResult
} from '../../types/health-notifications';

const router = Router();

// レポートの保存先
const REPORTS_PATH = path.join(process.cwd(), 'mcp-shared', 'reports', 'health');

/**
 * GET /api/health/notifications
 * 通知一覧を取得
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const handler = getHealthNotificationHandler();
    const notifications = handler.detectNewNotifications();

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const includeProcessed = req.query.includeProcessed === 'true';

    let filtered = includeProcessed
      ? notifications
      : notifications.filter(n => !n.processed);

    filtered = filtered.slice(0, limit);

    res.json({
      success: true,
      count: filtered.length,
      notifications: filtered
    });
  } catch (error) {
    console.error('通知一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '通知一覧の取得に失敗しました'
    });
  }
});

/**
 * GET /api/health/notifications/:filename
 * 特定の通知を取得
 */
router.get('/notifications/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'mcp-shared', 'notifications', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '通知が見つかりません'
      });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const notification: HealthNotification = JSON.parse(data);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('通知取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '通知の取得に失敗しました'
    });
  }
});

/**
 * POST /api/health/notifications/process
 * 未処理の通知をすべて処理
 */
router.post('/notifications/process', async (req: Request, res: Response) => {
  try {
    const handler = getHealthNotificationHandler();
    const results = await handler.processAllPendingNotifications();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      processed: results.length,
      successCount,
      failureCount,
      results
    });
  } catch (error) {
    console.error('通知処理エラー:', error);
    res.status(500).json({
      success: false,
      error: '通知の処理に失敗しました'
    });
  }
});

/**
 * GET /api/health/notifications/stats
 * 通知の統計情報を取得
 */
router.get('/notifications/stats', async (req: Request, res: Response) => {
  try {
    const handler = getHealthNotificationHandler();
    const stats = handler.getStatistics();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '統計情報の取得に失敗しました'
    });
  }
});

/**
 * GET /api/health/reports
 * レポート一覧を取得
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(REPORTS_PATH)) {
      return res.json({
        success: true,
        count: 0,
        reports: []
      });
    }

    const files = fs.readdirSync(REPORTS_PATH);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const reports = jsonFiles.map(filename => {
      const filePath = path.join(REPORTS_PATH, filename);
      const stats = fs.statSync(filePath);
      const data = fs.readFileSync(filePath, 'utf-8');
      const report: HealthReport = JSON.parse(data);

      return {
        reportId: report.reportId,
        reportType: report.reportType,
        period: report.period,
        generatedAt: report.generatedAt,
        summary: report.summary,
        filename
      };
    });

    // 生成日時でソート（新しい順）
    reports.sort((a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    res.json({
      success: true,
      count: reports.length,
      reports: reports.slice(0, limit)
    });
  } catch (error) {
    console.error('レポート一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'レポート一覧の取得に失敗しました'
    });
  }
});

/**
 * GET /api/health/reports/:reportId
 * 特定のレポートを取得
 */
router.get('/reports/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const format = (req.query.format as string) || 'json';

    let filePath: string;
    if (format === 'markdown' || format === 'md') {
      filePath = path.join(REPORTS_PATH, `${reportId}.md`);
    } else {
      filePath = path.join(REPORTS_PATH, `${reportId}.json`);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'レポートが見つかりません'
      });
    }

    const data = fs.readFileSync(filePath, 'utf-8');

    if (format === 'markdown' || format === 'md') {
      res.set('Content-Type', 'text/markdown');
      res.send(data);
    } else {
      const report: HealthReport = JSON.parse(data);
      res.json({
        success: true,
        report
      });
    }
  } catch (error) {
    console.error('レポート取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'レポートの取得に失敗しました'
    });
  }
});

/**
 * GET /api/health/reports/staff/:staffId
 * 職員別のレポート一覧を取得
 */
router.get('/reports/staff/:staffId', async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;

    if (!fs.existsSync(REPORTS_PATH)) {
      return res.json({
        success: true,
        count: 0,
        reports: []
      });
    }

    const files = fs.readdirSync(REPORTS_PATH);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const staffReports = jsonFiles
      .map(filename => {
        const filePath = path.join(REPORTS_PATH, filename);
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as HealthReport;
      })
      .filter(report => report.staffId === staffId);

    // 生成日時でソート（新しい順）
    staffReports.sort((a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    res.json({
      success: true,
      count: staffReports.length,
      reports: staffReports
    });
  } catch (error) {
    console.error('職員別レポート取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '職員別レポートの取得に失敗しました'
    });
  }
});

/**
 * GET /api/health/watcher/status
 * ファイル監視の状態を取得
 */
router.get('/watcher/status', async (req: Request, res: Response) => {
  try {
    const watcher = getHealthNotificationWatcher();
    const status = watcher.getStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('監視状態取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '監視状態の取得に失敗しました'
    });
  }
});

/**
 * POST /api/health/watcher/start
 * ファイル監視を開始
 */
router.post('/watcher/start', async (req: Request, res: Response) => {
  try {
    const watcher = getHealthNotificationWatcher();
    watcher.start();

    res.json({
      success: true,
      message: 'ファイル監視を開始しました'
    });
  } catch (error) {
    console.error('監視開始エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ファイル監視の開始に失敗しました'
    });
  }
});

/**
 * POST /api/health/watcher/stop
 * ファイル監視を停止
 */
router.post('/watcher/stop', async (req: Request, res: Response) => {
  try {
    const watcher = getHealthNotificationWatcher();
    watcher.stop();

    res.json({
      success: true,
      message: 'ファイル監視を停止しました'
    });
  } catch (error) {
    console.error('監視停止エラー:', error);
    res.status(500).json({
      success: false,
      error: 'ファイル監視の停止に失敗しました'
    });
  }
});

export default router;