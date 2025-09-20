// データバリデーション ミドルウェア (TypeScript版)
import { Request, Response, NextFunction } from 'express';

// 定数定義
export const VALID_CATEGORIES = ['announcement', 'interview', 'training', 'survey', 'other'];
export const VALID_PRIORITIES = ['urgent', 'high', 'normal', 'low'];
export const VALID_TARGETS = ['all', 'doctors', 'nurses', 'technicians', 'admin', 'selected'];

// サブカテゴリ定義
export const VALID_SUBCATEGORIES: Record<string, string[]> = {
  survey: [
    'satisfaction',  // 満足度調査
    'workenv',      // 職場環境
    'education',    // 教育・研修
    'welfare',      // 福利厚生
    'system',       // システム改善
    'event',        // イベント
    'other'         // その他
  ],
  announcement: ['general', 'urgent', 'system', 'event'],
  interview: ['regular', 'followup', 'special'],
  training: ['mandatory', 'optional', 'certification'],
  other: ['general']
};

// 通知データの型定義
interface NotificationData {
  category?: string;
  subcategory?: string;
  priority?: string;
  title?: string;
  content?: string;
  target?: string | string[];
}

// ペイロードサイズ検証ミドルウェア
export function validatePayloadSize(maxSizeBytes: number = 1048576) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body exceeds ${maxSizeBytes} bytes`,
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: maxSizeBytes
      });
      return;
    }

    next();
  };
}

// 通知データバリデーション
export function validateNotification(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data: NotificationData = req.body;
  const errors: string[] = [];

  // 必須フィールドチェック
  if (!data.category) {
    errors.push('Category is required');
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // サブカテゴリチェック
  if (data.subcategory && data.category) {
    const validSubcategories = VALID_SUBCATEGORIES[data.category];
    if (validSubcategories && !validSubcategories.includes(data.subcategory)) {
      errors.push(`Invalid subcategory for ${data.category}. Must be one of: ${validSubcategories.join(', ')}`);
    }
  }

  // 優先度チェック
  if (!data.priority) {
    errors.push('Priority is required');
  } else if (!VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  // タイトルチェック
  if (!data.title) {
    errors.push('Title is required');
  } else if (typeof data.title !== 'string') {
    errors.push('Title must be a string');
  } else if (data.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  // 内容チェック
  if (!data.content) {
    errors.push('Content is required');
  } else if (typeof data.content !== 'string') {
    errors.push('Content must be a string');
  } else if (data.content.length > 5000) {
    errors.push('Content must be 5000 characters or less');
  }

  // 配信先チェック
  if (!data.target) {
    errors.push('Target is required');
  } else {
    const targets = Array.isArray(data.target) ? data.target : [data.target];
    for (const target of targets) {
      if (!VALID_TARGETS.includes(target) && !target.startsWith('employee_')) {
        errors.push(`Invalid target: ${target}. Must be one of: ${VALID_TARGETS.join(', ')}, or employee ID`);
      }
    }
  }

  // エラーがある場合
  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Request data validation failed',
      code: 'VALIDATION_FAILED',
      details: errors
    });
    return;
  }

  next();
}

// アンケートデータバリデーション
export function validateSurveyData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { surveyId, responses } = req.body;
  const errors: string[] = [];

  if (!surveyId) {
    errors.push('Survey ID is required');
  }

  if (!responses) {
    errors.push('Responses are required');
  } else if (typeof responses !== 'object') {
    errors.push('Responses must be an object');
  } else if (Object.keys(responses).length === 0) {
    errors.push('At least one response is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Survey data validation failed',
      code: 'VALIDATION_FAILED',
      details: errors
    });
    return;
  }

  next();
}

// 面談予約バリデーション
export function validateBookingData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { employeeId, preferredDate, reason } = req.body;
  const errors: string[] = [];

  if (!employeeId) {
    errors.push('Employee ID is required');
  }

  if (!preferredDate) {
    errors.push('Preferred date is required');
  } else {
    const date = new Date(preferredDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    } else if (date < new Date()) {
      errors.push('Preferred date must be in the future');
    }
  }

  if (!reason) {
    errors.push('Reason is required');
  } else if (typeof reason !== 'string') {
    errors.push('Reason must be a string');
  } else if (reason.length > 1000) {
    errors.push('Reason must be 1000 characters or less');
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Booking data validation failed',
      code: 'VALIDATION_FAILED',
      details: errors
    });
    return;
  }

  next();
}

export default {
  validatePayloadSize,
  validateNotification,
  validateSurveyData,
  validateBookingData,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
  VALID_SUBCATEGORIES,
  VALID_TARGETS
};