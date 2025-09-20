// 面談予約APIルート
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';
import { InterviewService } from '../api/db/interviewService';

const router = Router();

// 面談予約作成
router.post('/',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    const { category, type, topic, preferredDate, urgencyLevel, duration, notes } = req.body;

    // バリデーション
    const errors = [];
    if (!category) errors.push('Category is required');
    if (!type) errors.push('Type is required');
    if (!topic) errors.push('Topic is required');
    if (!preferredDate) errors.push('Preferred date is required');
    if (!urgencyLevel) errors.push('Urgency level is required');

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors,
      });
    }

    // @ts-ignore
    const employeeId = req.user?.id || 'EMP100'; // テスト用

    const result = await InterviewService.create({
      employeeId,
      category,
      type,
      topic,
      preferredDate: new Date(preferredDate),
      urgencyLevel,
      duration,
      notes,
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: result.error,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Interview request created successfully',
      data: result.data,
    });
  }
);

// 面談予約リスト取得
router.get('/',
  standardRateLimit,
  authenticateToken,
  async (req, res) => {
    const { category, status, urgency } = req.query;

    const result = await InterviewService.list({
      category: category as string,
      status: status as string,
      urgencyLevel: urgency as string,
    });

    res.json({
      success: result.success,
      data: result.data,
      count: result.count,
    });
  }
);

// 面談予約詳細取得
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    const result = await InterviewService.getById(id);

    if (!result.success) {
      return res.status(404).json({
        error: 'Not Found',
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  }
);

// スケジュール確定
router.put('/:id/schedule',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { scheduledDate, interviewerName } = req.body;

    if (!scheduledDate || !interviewerName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Scheduled date and interviewer name are required',
      });
    }

    const result = await InterviewService.schedule(
      id,
      new Date(scheduledDate),
      interviewerName
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      data: result.data,
    });
  }
);

// 面談完了
router.put('/:id/complete',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { result: interviewResult, notes } = req.body;

    if (!interviewResult) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Interview result is required',
      });
    }

    const result = await InterviewService.complete(id, interviewResult, notes);

    if (!result.success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Interview completed successfully',
      data: result.data,
    });
  }
);

// 面談キャンセル
router.delete('/:id',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await InterviewService.cancel(id, reason);

    if (!result.success) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: result.data,
    });
  }
);

// 統計情報取得
router.get('/stats/summary',
  authenticateToken,
  async (req, res) => {
    // @ts-ignore
    const employeeId = req.user?.id;

    const result = await InterviewService.getStatistics(employeeId);

    res.json({
      success: result.success,
      data: result.data,
    });
  }
);

// 3段階25タイプ情報取得
router.get('/types/mapping',
  (req, res) => {
    const mapping = InterviewService.getCategoryTypeMapping();

    res.json({
      success: true,
      data: mapping,
    });
  }
);

export default router;