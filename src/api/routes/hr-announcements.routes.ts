/**
 * 人事お知らせ関連のAPIルート
 * 職員カルテシステムからのお知らせ受信用エンドポイント
 */

import { Router, Request, Response } from 'express';
import {
  MedicalSystemAnnouncementRequest,
  MedicalSystemAnnouncementResponse,
  HRAnnouncement
} from '../../types/hr-announcements';

const router = Router();

/**
 * POST /api/hr-announcements
 * 職員カルテシステムからお知らせを受信
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // 認証確認
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: MedicalSystemAnnouncementResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証トークンが無効です'
        }
      };
      return res.status(401).json(errorResponse);
    }

    // システム識別ヘッダー確認
    const sourceSystem = req.headers['x-source-system'];
    if (sourceSystem !== 'medical-staff-system') {
      const errorResponse: MedicalSystemAnnouncementResponse = {
        success: false,
        error: {
          code: 'INVALID_SOURCE',
          message: '不正なソースシステムです'
        }
      };
      return res.status(403).json(errorResponse);
    }

    // リクエストボディの取得
    const request: MedicalSystemAnnouncementRequest = req.body;

    // バリデーション
    const validationErrors = validateAnnouncementRequest(request);
    if (validationErrors.length > 0) {
      const errorResponse: MedicalSystemAnnouncementResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'リクエストボディが不正です',
          details: validationErrors
        }
      };
      return res.status(400).json(errorResponse);
    }

    // VoiceDrive内部形式に変換
    const announcement = convertToInternalFormat(request);

    // お知らせを保存（実際の実装ではDBに保存）
    const saved = await saveAnnouncement(announcement);

    // レスポンス
    const successResponse: MedicalSystemAnnouncementResponse = {
      success: true,
      data: {
        voicedriveAnnouncementId: saved.id,
        status: saved.publishAt <= new Date() ? 'published' : 'scheduled',
        publishedAt: saved.publishAt.toISOString(),
        estimatedDelivery: estimateDeliveryCount(saved),
        targetedUsers: calculateTargetedUsers(saved)
      },
      message: 'お知らせを正常に作成しました'
    };

    res.status(201).json(successResponse);

  } catch (error) {
    console.error('お知らせ受信エラー:', error);
    const errorResponse: MedicalSystemAnnouncementResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバー内部エラーが発生しました'
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * バリデーション
 */
function validateAnnouncementRequest(
  request: MedicalSystemAnnouncementRequest
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];

  // 必須フィールド
  if (!request.title || request.title.trim() === '') {
    errors.push({ field: 'title', message: 'タイトルは必須です' });
  } else if (request.title.length > 500) {
    errors.push({ field: 'title', message: 'タイトルは500文字以内で入力してください' });
  }

  if (!request.content || request.content.trim() === '') {
    errors.push({ field: 'content', message: '本文は必須です' });
  } else if (request.content.length > 5000) {
    errors.push({ field: 'content', message: '本文は5000文字以内で入力してください' });
  }

  if (!request.category) {
    errors.push({ field: 'category', message: 'カテゴリは必須です' });
  } else if (!['announcement', 'interview', 'training', 'survey', 'other'].includes(request.category)) {
    errors.push({ field: 'category', message: 'カテゴリの値が不正です' });
  }

  if (!request.priority) {
    errors.push({ field: 'priority', message: '優先度は必須です' });
  } else if (!['low', 'medium', 'high'].includes(request.priority)) {
    errors.push({ field: 'priority', message: '優先度の値が不正です' });
  }

  if (!request.targetType) {
    errors.push({ field: 'targetType', message: '配信対象タイプは必須です' });
  } else if (!['all', 'departments', 'individuals', 'positions'].includes(request.targetType)) {
    errors.push({ field: 'targetType', message: '配信対象タイプの値が不正です' });
  }

  // 条件付き必須フィールド
  if (request.targetType === 'departments' && (!request.targetDepartments || request.targetDepartments.length === 0)) {
    errors.push({ field: 'targetDepartments', message: 'targetType=departmentsの場合、targetDepartmentsは必須です' });
  }

  if (request.targetType === 'individuals' && (!request.targetIndividuals || request.targetIndividuals.length === 0)) {
    errors.push({ field: 'targetIndividuals', message: 'targetType=individualsの場合、targetIndividualsは必須です' });
  }

  if (request.targetType === 'positions' && (!request.targetPositions || request.targetPositions.length === 0)) {
    errors.push({ field: 'targetPositions', message: 'targetType=positionsの場合、targetPositionsは必須です' });
  }

  if (request.hasActionButton && !request.actionButton) {
    errors.push({ field: 'actionButton', message: 'hasActionButton=trueの場合、actionButtonは必須です' });
  }

  if (!request.metadata) {
    errors.push({ field: 'metadata', message: 'metadataは必須です' });
  } else {
    if (!request.metadata.sourceAnnouncementId) {
      errors.push({ field: 'metadata.sourceAnnouncementId', message: 'metadata.sourceAnnouncementIdは必須です' });
    }
  }

  // requireResponse と autoTrackResponse の検証
  if (request.requireResponse !== false) {
    errors.push({ field: 'requireResponse', message: 'requireResponseはfalse固定です' });
  }

  if (request.autoTrackResponse !== true) {
    errors.push({ field: 'autoTrackResponse', message: 'autoTrackResponseはtrue固定です' });
  }

  return errors;
}

/**
 * 職員カルテシステム形式からVoiceDrive内部形式に変換
 */
function convertToInternalFormat(request: MedicalSystemAnnouncementRequest): HRAnnouncement {
  // カテゴリマッピング
  const categoryMap: Record<string, HRAnnouncement['category']> = {
    announcement: 'ANNOUNCEMENT',
    interview: 'MEETING',
    training: 'TRAINING',
    survey: 'SURVEY',
    other: 'OTHER'
  };

  // 優先度マッピング
  const priorityMap: Record<string, HRAnnouncement['priority']> = {
    low: 'LOW',
    medium: 'NORMAL',
    high: 'HIGH'
  };

  // アクションボタンの変換
  let actionButton: HRAnnouncement['actionButton'] | undefined;
  if (request.hasActionButton && request.actionButton) {
    if (request.actionButton.type === 'custom' && request.actionButton.url) {
      actionButton = {
        text: request.actionButton.label,
        url: request.actionButton.url,
        type: 'external'
      };
    } else if (request.actionButton.type === 'interview_reservation') {
      actionButton = {
        text: request.actionButton.label,
        url: `/interview/reserve?typeId=${request.actionButton.config?.interviewTypeId || ''}`,
        type: 'medical_system'
      };
    } else if (request.actionButton.type === 'survey_response') {
      actionButton = {
        text: request.actionButton.label,
        url: `/survey/${request.actionButton.config?.surveyId || ''}`,
        type: 'internal'
      };
    } else if (request.actionButton.type === 'training_apply') {
      actionButton = {
        text: request.actionButton.label,
        url: `/training/${request.actionButton.config?.trainingId || ''}`,
        type: 'internal'
      };
    }
  }

  // 配信対象の変換
  const targetAudience: HRAnnouncement['targetAudience'] = {
    isGlobal: request.targetType === 'all',
    departments: request.targetDepartments,
    individuals: request.targetIndividuals,
    roles: request.targetPositions
  };

  const announcement: HRAnnouncement = {
    id: `vd_ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: request.title,
    content: request.content,
    category: categoryMap[request.category],
    priority: priorityMap[request.priority],
    authorId: request.metadata.createdBy,
    authorName: '職員カルテシステム',
    authorDepartment: '人事部',
    publishAt: request.scheduledPublishAt ? new Date(request.scheduledPublishAt) : new Date(),
    isActive: true,
    requireResponse: request.requireResponse,
    responseType: 'acknowledged',
    targetAudience,
    actionButton,
    stats: {
      delivered: 0,
      responses: 0,
      completions: 0
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: request.expiresAt ? new Date(request.expiresAt) : undefined
  };

  return announcement;
}

/**
 * お知らせを保存（モック実装）
 */
async function saveAnnouncement(announcement: HRAnnouncement): Promise<HRAnnouncement> {
  // 実際の実装ではDBに保存
  console.log('📢 お知らせを保存:', {
    id: announcement.id,
    title: announcement.title,
    category: announcement.category,
    targetAudience: announcement.targetAudience
  });

  // モック: そのまま返す
  return announcement;
}

/**
 * 配信予定数を推定
 */
function estimateDeliveryCount(announcement: HRAnnouncement): number {
  // モック実装: 実際はDBから対象ユーザー数を取得
  if (announcement.targetAudience.isGlobal) {
    return 450; // 全職員数
  }

  let count = 0;
  if (announcement.targetAudience.departments) {
    // 部門ごとの職員数（モック）
    const departmentCounts: Record<string, number> = {
      '看護部': 280,
      '医局': 120,
      '事務部': 50,
      'リハビリ科': 40
    };
    announcement.targetAudience.departments.forEach(dept => {
      count += departmentCounts[dept] || 10;
    });
  }

  if (announcement.targetAudience.individuals) {
    count += announcement.targetAudience.individuals.length;
  }

  if (announcement.targetAudience.roles) {
    // 役職ごとの職員数（モック）
    const roleCounts: Record<string, number> = {
      '主任': 45,
      '師長': 20,
      '部長': 8
    };
    announcement.targetAudience.roles.forEach(role => {
      count += roleCounts[role] || 5;
    });
  }

  return count;
}

/**
 * 配信対象の部門別人数を計算
 */
function calculateTargetedUsers(announcement: HRAnnouncement): {
  department: string;
  count: number;
}[] {
  if (announcement.targetAudience.isGlobal) {
    return [
      { department: '看護部', count: 280 },
      { department: '医局', count: 120 },
      { department: '事務部', count: 50 }
    ];
  }

  if (announcement.targetAudience.departments) {
    const departmentCounts: Record<string, number> = {
      '看護部': 280,
      '医局': 120,
      '事務部': 50,
      'リハビリ科': 40
    };

    return announcement.targetAudience.departments.map(dept => ({
      department: dept,
      count: departmentCounts[dept] || 10
    }));
  }

  return [];
}

export default router;
