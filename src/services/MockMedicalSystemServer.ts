/**
 * モック医療システムAPIサーバー
 * Phase 2.5統合テスト用
 */

import express from 'express';
import type { Request, Response } from 'express';
import type {
  MedicalSystemWebhookStats,
  MedicalSystemInterviewStats,
  MedicalSystemApiResponse
} from '../types/medicalSystem.types';

const app = express();
const PORT = 8888;

app.use(express.json());

// CORS設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-VoiceDrive-System-ID');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 認証ミドルウェア
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (token !== 'test-api-key-for-integration-testing') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key'
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API 1: Webhook送信統計
app.get('/api/voicedrive/webhook-stats', authenticateToken, (req, res) => {
  console.log('[MockMedicalSystem] GET /api/voicedrive/webhook-stats', req.query);

  const stats: MedicalSystemWebhookStats = {
    sent24h: 100,
    succeeded: 100,
    failed: 0,
    retried: 0,
    lastSentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10分前
    byEventType: {
      'employee.created': {
        sent: 30,
        succeeded: 30,
        failed: 0,
        avgResponseTime: 120
      },
      'employee.photo.updated': {
        sent: 50,
        succeeded: 50,
        failed: 0,
        avgResponseTime: 110
      },
      'employee.photo.deleted': {
        sent: 20,
        succeeded: 20,
        failed: 0,
        avgResponseTime: 98
      }
    },
    queueStatus: {
      pending: 0,
      processing: 0,
      failed: 0
    },
    retryPolicy: {
      maxRetries: 3,
      retryIntervals: [60, 300, 1800],
      currentRetrying: 0
    }
  };

  const response: MedicalSystemApiResponse<MedicalSystemWebhookStats> = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

// API 2: 面談完了統計
app.get('/api/voicedrive/interview-completion-stats', authenticateToken, (req, res) => {
  console.log('[MockMedicalSystem] GET /api/voicedrive/interview-completion-stats', req.query);

  const stats: MedicalSystemInterviewStats = {
    totalScheduled: 50,
    actuallyCompleted: 45,
    completionRate: 90.0,
    noShowRate: 4.0,
    rescheduledCount: 2,
    avgDuration: 18.5,
    byInterviewType: {
      '定期面談': {
        scheduled: 30,
        completed: 28,
        completionRate: 93.33,
        avgDuration: 20.3
      },
      '緊急面談': {
        scheduled: 15,
        completed: 13,
        completionRate: 86.67,
        avgDuration: 15.2
      },
      'フォローアップ': {
        scheduled: 5,
        completed: 4,
        completionRate: 80.0,
        avgDuration: 12.5
      }
    },
    recentCompletions: [
      {
        interviewId: 'INT-2025-001',
        staffId: 'EMP-001',
        staffName: '山田太郎',
        interviewType: '定期面談',
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
        duration: 25,
        status: 'completed' as const
      },
      {
        interviewId: 'INT-2025-002',
        staffId: 'EMP-002',
        staffName: '佐藤花子',
        interviewType: '緊急面談',
        scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000).toISOString(),
        duration: 18,
        status: 'completed' as const
      }
    ],
    pendingInterviews: [
      {
        interviewId: 'INT-2025-003',
        staffId: 'EMP-003',
        staffName: '鈴木一郎',
        interviewType: '定期面談',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled' as const,
        isPastDue: false
      }
    ],
    missedInterviews: [
      {
        interviewId: 'INT-2025-004',
        staffId: 'EMP-004',
        staffName: '田中次郎',
        interviewType: '定期面談',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'no_show' as const,
        reason: '無断欠席'
      }
    ]
  };

  const response: MedicalSystemApiResponse<MedicalSystemInterviewStats> = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

// テストシナリオ: 警告レベルの差分（5件）
app.get('/api/voicedrive/webhook-stats/scenario-warning', authenticateToken, (req, res) => {
  const stats: MedicalSystemWebhookStats = {
    sent24h: 105,
    succeeded: 100,
    failed: 5,
    retried: 3,
    lastSentAt: new Date().toISOString(),
    byEventType: {
      'employee.created': {
        sent: 35,
        succeeded: 32,
        failed: 3,
        avgResponseTime: 150
      },
      'employee.photo.updated': {
        sent: 50,
        succeeded: 48,
        failed: 2,
        avgResponseTime: 130
      },
      'employee.photo.deleted': {
        sent: 20,
        succeeded: 20,
        failed: 0,
        avgResponseTime: 100
      }
    },
    queueStatus: {
      pending: 3,
      processing: 1,
      failed: 1
    },
    retryPolicy: {
      maxRetries: 3,
      retryIntervals: [60, 300, 1800],
      currentRetrying: 3
    }
  };

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
});

// テストシナリオ: 重大レベルの差分（25件）
app.get('/api/voicedrive/webhook-stats/scenario-critical', authenticateToken, (req, res) => {
  const stats: MedicalSystemWebhookStats = {
    sent24h: 125,
    succeeded: 90,
    failed: 35,
    retried: 15,
    lastSentAt: new Date().toISOString(),
    byEventType: {
      'employee.created': {
        sent: 45,
        succeeded: 30,
        failed: 15,
        avgResponseTime: 250
      },
      'employee.photo.updated': {
        sent: 60,
        succeeded: 45,
        failed: 15,
        avgResponseTime: 230
      },
      'employee.photo.deleted': {
        sent: 20,
        succeeded: 15,
        failed: 5,
        avgResponseTime: 200
      }
    },
    queueStatus: {
      pending: 20,
      processing: 5,
      failed: 10
    },
    retryPolicy: {
      maxRetries: 3,
      retryIntervals: [60, 300, 1800],
      currentRetrying: 20
    }
  };

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
});

export function startMockServer() {
  app.listen(PORT, () => {
    console.log(`[MockMedicalSystemServer] 起動しました: http://localhost:${PORT}`);
    console.log('[MockMedicalSystemServer] エンドポイント:');
    console.log('  - GET /api/voicedrive/webhook-stats');
    console.log('  - GET /api/voicedrive/interview-completion-stats');
    console.log('  - GET /api/health');
    console.log('[MockMedicalSystemServer] テストシナリオ:');
    console.log('  - GET /api/voicedrive/webhook-stats/scenario-warning (差分5件)');
    console.log('  - GET /api/voicedrive/webhook-stats/scenario-critical (差分25件)');
  });

  return app;
}

// 常にサーバーを起動
startMockServer();
