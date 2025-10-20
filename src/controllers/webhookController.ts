/**
 * Phase 2: 顔写真統合 - Webhookハンドラー
 *
 * 医療システムからの職員顔写真データWebhookを処理
 *
 * 対応イベント:
 * - employee.created: 新規職員アカウント作成
 * - employee.photo.updated: 職員写真URL更新
 * - employee.photo.deleted: 職員写真URL削除
 *
 * @module webhookController
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Webhookイベントタイプ
 */
type WebhookEventType =
  | 'employee.created'
  | 'employee.photo.updated'
  | 'employee.photo.deleted';

/**
 * 職員作成イベントペイロード
 */
interface EmployeeCreatedData {
  staffId: string;
  fullName: string;
  email: string;
  facilityId?: string;
  departmentId?: string;
  position?: string;
  authLevel?: number;
  profilePhotoUrl: string;
  photoUpdatedAt: string; // ISO 8601
  photoMimeType: 'image/jpeg' | 'image/png';
  photoFileSize: number;
  employmentStatus?: 'active' | 'onLeave' | 'retired';
  hiredAt?: string; // ISO 8601
}

/**
 * 職員写真更新イベントペイロード
 */
interface EmployeePhotoUpdatedData {
  staffId: string;
  profilePhotoUrl: string;
  photoUpdatedAt: string; // ISO 8601
  photoMimeType: 'image/jpeg' | 'image/png';
  photoFileSize: number;
  updateReason?: 'annual_update' | 'user_request' | 'admin_update';
}

/**
 * 職員写真削除イベントペイロード
 */
interface EmployeePhotoDeletedData {
  staffId: string;
  deletionReason?: 'user_request' | 'retention_period_expired' | 'admin_action';
  photoDeletedAt: string; // ISO 8601
}

/**
 * Webhookペイロード（共通構造）
 */
interface WebhookPayload<T> {
  eventType: WebhookEventType;
  timestamp: string; // ISO 8601
  data: T;
}

/**
 * 医療システムからのWebhookハンドラー（メイン）
 *
 * リクエストボディのeventTypeに応じて、適切なハンドラー関数を呼び出します。
 *
 * @param req - Expressリクエストオブジェクト
 * @param res - Expressレスポンスオブジェクト
 *
 * @example
 * ```typescript
 * // routes/apiRoutes.tsで使用
 * router.post(
 *   '/api/webhooks/medical-system/employee',
 *   validateWebhookSignature,
 *   handleEmployeeWebhook
 * );
 * ```
 */
export const handleEmployeeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.body as WebhookPayload<any>;

    console.log('[Webhook] 受信:', {
      eventType: payload.eventType,
      timestamp: payload.timestamp,
      staffId: payload.data?.staffId
    });

    // イベントタイプに応じた処理
    switch (payload.eventType) {
      case 'employee.created':
        await handleEmployeeCreated(payload as WebhookPayload<EmployeeCreatedData>);
        break;

      case 'employee.photo.updated':
        await handlePhotoUpdated(payload as WebhookPayload<EmployeePhotoUpdatedData>);
        break;

      case 'employee.photo.deleted':
        await handlePhotoDeleted(payload as WebhookPayload<EmployeePhotoDeletedData>);
        break;

      default:
        console.error('[Webhook] ERROR: 未知のイベントタイプ:', payload.eventType);
        res.status(400).json({
          error: 'Unknown event type',
          message: `イベントタイプ "${payload.eventType}" は未対応です`
        });
        return;
    }

    // 成功レスポンス
    res.status(200).json({ success: true });

    console.log('[Webhook] 処理成功:', {
      eventType: payload.eventType,
      staffId: payload.data?.staffId
    });

  } catch (error) {
    console.error('[Webhook] ERROR: 処理中にエラーが発生しました:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Webhook処理中にエラーが発生しました'
    });
  }
};

/**
 * employee.created イベント処理
 *
 * 新規職員アカウント作成または既存アカウントの写真URL更新
 *
 * ロジック:
 * 1. staffIdで既存ユーザーを検索
 * 2. 存在する場合: 写真URLのみ更新（upsert）
 * 3. 存在しない場合: 新規アカウント作成
 *
 * @param payload - employee.createdイベントペイロード
 */
async function handleEmployeeCreated(
  payload: WebhookPayload<EmployeeCreatedData>
): Promise<void> {
  const { data } = payload;

  console.log('[Webhook] employee.created 処理開始:', {
    staffId: data.staffId,
    fullName: data.fullName,
    email: data.email,
    profilePhotoUrl: data.profilePhotoUrl
  });

  // staffIdで既存ユーザーを検索（employeeIdフィールドで照合）
  const existingUser = await prisma.user.findUnique({
    where: { employeeId: data.staffId }
  });

  if (existingUser) {
    // 既存ユーザーの場合: 写真URLのみ更新
    console.log('[Webhook] 既存ユーザーの写真URL更新:', {
      userId: existingUser.id,
      staffId: data.staffId,
      oldPhotoUrl: existingUser.profilePhotoUrl,
      newPhotoUrl: data.profilePhotoUrl
    });

    await prisma.user.update({
      where: { employeeId: data.staffId },
      data: {
        profilePhotoUrl: data.profilePhotoUrl,
        profilePhotoUpdatedAt: new Date(data.photoUpdatedAt),
        updatedAt: new Date()
      }
    });

    console.log('[Webhook] 既存ユーザーの写真URL更新完了');
  } else {
    // 新規アカウント作成
    console.log('[Webhook] 新規アカウント作成:', {
      staffId: data.staffId,
      fullName: data.fullName,
      email: data.email
    });

    await prisma.user.create({
      data: {
        employeeId: data.staffId,
        name: data.fullName,
        email: data.email,
        department: data.departmentId || null,
        facilityId: data.facilityId || null,
        position: data.position || null,
        role: data.position || 'staff',
        profilePhotoUrl: data.profilePhotoUrl,
        profilePhotoUpdatedAt: new Date(data.photoUpdatedAt),
        accountType: 'standard',
        permissionLevel: data.authLevel || 1,
        isRetired: data.employmentStatus === 'retired',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[Webhook] 新規アカウント作成完了');
  }
}

/**
 * employee.photo.updated イベント処理
 *
 * 既存職員の写真URL更新
 *
 * @param payload - employee.photo.updatedイベントペイロード
 */
async function handlePhotoUpdated(
  payload: WebhookPayload<EmployeePhotoUpdatedData>
): Promise<void> {
  const { data } = payload;

  console.log('[Webhook] employee.photo.updated 処理開始:', {
    staffId: data.staffId,
    profilePhotoUrl: data.profilePhotoUrl,
    updateReason: data.updateReason
  });

  // staffIdで既存ユーザーを検索
  const existingUser = await prisma.user.findUnique({
    where: { employeeId: data.staffId }
  });

  if (!existingUser) {
    console.warn('[Webhook] WARNING: staffIdに該当するユーザーが見つかりません:', {
      staffId: data.staffId
    });

    // ユーザーが存在しない場合でもエラーにしない（医療システム側でリトライさせない）
    return;
  }

  // 写真URL更新
  await prisma.user.update({
    where: { employeeId: data.staffId },
    data: {
      profilePhotoUrl: data.profilePhotoUrl,
      profilePhotoUpdatedAt: new Date(data.photoUpdatedAt),
      updatedAt: new Date()
    }
  });

  console.log('[Webhook] employee.photo.updated 処理完了:', {
    userId: existingUser.id,
    staffId: data.staffId,
    newPhotoUrl: data.profilePhotoUrl
  });
}

/**
 * employee.photo.deleted イベント処理
 *
 * 既存職員の写真URL削除（nullに設定）
 *
 * @param payload - employee.photo.deletedイベントペイロード
 */
async function handlePhotoDeleted(
  payload: WebhookPayload<EmployeePhotoDeletedData>
): Promise<void> {
  const { data } = payload;

  console.log('[Webhook] employee.photo.deleted 処理開始:', {
    staffId: data.staffId,
    deletionReason: data.deletionReason
  });

  // staffIdで既存ユーザーを検索
  const existingUser = await prisma.user.findUnique({
    where: { employeeId: data.staffId }
  });

  if (!existingUser) {
    console.warn('[Webhook] WARNING: staffIdに該当するユーザーが見つかりません:', {
      staffId: data.staffId
    });

    // ユーザーが存在しない場合でもエラーにしない（医療システム側でリトライさせない）
    return;
  }

  // 写真URL削除（nullに設定）
  await prisma.user.update({
    where: { employeeId: data.staffId },
    data: {
      profilePhotoUrl: null,
      profilePhotoUpdatedAt: new Date(data.photoDeletedAt),
      updatedAt: new Date()
    }
  });

  console.log('[Webhook] employee.photo.deleted 処理完了:', {
    userId: existingUser.id,
    staffId: data.staffId
  });
}
