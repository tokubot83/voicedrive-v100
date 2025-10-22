/**
 * 提案書類サービス
 * 作成日: 2025年10月13日
 *
 * 機能:
 * - 編集権限チェック
 * - 監査ログ作成
 * - 変更フィールド検出
 */

import { PrismaClient, ProposalDocument, ProposalAuditLog } from '@prisma/client';

const prisma = new PrismaClient();

// ===========================
// 型定義
// ===========================

interface AuditLogData {
  documentId: string;
  action: 'CREATED' | 'UPDATED' | 'SUBMITTED' | 'EXPORTED';
  userId: string;
  userName: string;
  userLevel: number;
  changedFields: Record<string, any>;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ===========================
// 権限チェック
// ===========================

/**
 * 提案書類の編集権限をチェック
 *
 * 権限ルール:
 * - Level 18: すべての提案書類を編集可能
 * - Level 12-17: 権限範囲内の提案書類を編集可能
 * - Level 11: 自施設の提案書類を編集可能
 * - Level 9-10: 自部署の提案書類を編集可能
 * - Level 1-8: 編集不可（閲覧のみ）
 *
 * @param userId ユーザーID
 * @param userLevel 権限レベル
 * @param document 提案書類
 * @returns 編集可能かどうか
 */
export async function canEditDocument(
  userId: string,
  userLevel: number,
  document: ProposalDocument
): Promise<boolean> {
  console.log('[canEditDocument] 権限チェック開始:', {
    userId,
    userLevel,
    documentId: document.id,
    createdById: document.createdById
  });

  // Level 1-8: 編集不可
  if (userLevel < 9) {
    console.log('[canEditDocument] Level 1-8: 編集不可');
    return false;
  }

  // Level 18: すべて編集可能
  if (userLevel >= 18) {
    console.log('[canEditDocument] Level 18: すべて編集可能');
    return true;
  }

  // Level 12-17: 経営層（権限範囲内）
  if (userLevel >= 12) {
    console.log('[canEditDocument] Level 12-17: 経営層として編集可能');
    return true;
  }

  // Level 11: 施設長（自施設のみ）
  if (userLevel === 11) {
    // ユーザーの施設IDを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { facilityId: true }
    });

    // 提案の作成者の施設IDを取得
    const creator = await prisma.user.findUnique({
      where: { id: document.createdById },
      select: { facilityId: true }
    });

    const canEdit = user?.facilityId === creator?.facilityId;
    console.log('[canEditDocument] Level 11: 施設長権限チェック:', {
      userFacilityId: user?.facilityId,
      creatorFacilityId: creator?.facilityId,
      canEdit
    });
    return canEdit;
  }

  // Level 9-10: 課長・部長（自部署のみ）
  if (userLevel >= 9) {
    // ユーザーの部署を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { department: true }
    });

    // 提案の作成者の部署を取得
    const creator = await prisma.user.findUnique({
      where: { id: document.createdById },
      select: { department: true }
    });

    const canEdit = user?.department === creator?.department;
    console.log('[canEditDocument] Level 9-10: 部長権限チェック:', {
      userDepartment: user?.department,
      creatorDepartment: creator?.department,
      canEdit
    });
    return canEdit;
  }

  return false;
}

/**
 * 提案書類の閲覧権限をチェック
 *
 * 権限ルール:
 * - すべてのユーザーが閲覧可能（Level 1以上）
 *
 * @param userLevel 権限レベル
 * @returns 閲覧可能かどうか
 */
export function canViewDocument(userLevel: number): boolean {
  return userLevel >= 1;
}

// ===========================
// 変更フィールド検出
// ===========================

/**
 * 変更されたフィールドを検出
 *
 * @param oldDocument 変更前の提案書類
 * @param newData 変更後のデータ
 * @returns 変更されたフィールドのリスト
 */
export function detectChangedFields(
  oldDocument: ProposalDocument,
  newData: Partial<ProposalDocument>
): {
  changedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
} {
  const changedFields: string[] = [];
  const previousValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  // チェック対象フィールド
  const fieldsToCheck = [
    'title',
    'background',
    'objectives',
    'expectedEffects',
    'concerns',
    'counterMeasures',
    'managerNotes',
    'additionalContext',
    'status',
    'targetCommittee'
  ];

  for (const field of fieldsToCheck) {
    const oldValue = (oldDocument as any)[field];
    const newValue = (newData as any)[field];

    // 新しい値が提供されていて、かつ古い値と異なる場合
    if (newValue !== undefined && oldValue !== newValue) {
      changedFields.push(field);
      previousValues[field] = oldValue;
      newValues[field] = newValue;
    }
  }

  console.log('[detectChangedFields] 変更検出:', {
    changedFieldsCount: changedFields.length,
    changedFields
  });

  return {
    changedFields,
    previousValues,
    newValues
  };
}

// ===========================
// 監査ログ作成
// ===========================

/**
 * 監査ログを作成
 *
 * @param data 監査ログデータ
 * @returns 作成された監査ログ
 */
export async function createAuditLog(data: AuditLogData): Promise<ProposalAuditLog> {
  console.log('[createAuditLog] 監査ログ作成開始:', {
    documentId: data.documentId,
    action: data.action,
    userId: data.userId,
    changedFieldsCount: Object.keys(data.changedFields).length
  });

  const auditLog = await prisma.proposalAuditLog.create({
    data: {
      documentId: data.documentId,
      action: data.action,
      userId: data.userId,
      userName: data.userName,
      userLevel: data.userLevel,
      changedFields: data.changedFields,
      previousValues: data.previousValues || null,
      newValues: data.newValues || null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date()
    }
  });

  console.log('[createAuditLog] 監査ログ作成完了:', auditLog.id);

  return auditLog;
}

/**
 * 監査ログを一括取得
 *
 * @param documentId 提案書類ID
 * @param limit 取得件数
 * @param offset オフセット
 * @returns 監査ログ配列と総件数
 */
export async function getAuditLogs(
  documentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  auditLogs: ProposalAuditLog[];
  total: number;
}> {
  console.log('[getAuditLogs] 監査ログ取得:', { documentId, limit, offset });

  const [auditLogs, total] = await Promise.all([
    prisma.proposalAuditLog.findMany({
      where: { documentId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.proposalAuditLog.count({
      where: { documentId }
    })
  ]);

  console.log('[getAuditLogs] 取得完了:', {
    count: auditLogs.length,
    total
  });

  return {
    auditLogs,
    total
  };
}

// ===========================
// 提案書類操作
// ===========================

/**
 * 提案書類を取得（権限チェック付き）
 *
 * @param documentId 提案書類ID
 * @param userId ユーザーID
 * @param userLevel 権限レベル
 * @returns 提案書類と編集可否
 */
export async function getDocumentWithPermission(
  documentId: string,
  userId: string,
  userLevel: number
): Promise<{
  document: ProposalDocument;
  canEdit: boolean;
  canView: boolean;
}> {
  console.log('[getDocumentWithPermission] 取得開始:', {
    documentId,
    userId,
    userLevel
  });

  // 提案書類取得
  const document = await prisma.proposalDocument.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error(`提案書類が見つかりません: ${documentId}`);
  }

  // 権限チェック
  const canView = canViewDocument(userLevel);
  const canEdit = await canEditDocument(userId, userLevel, document);

  console.log('[getDocumentWithPermission] 権限チェック結果:', {
    canView,
    canEdit
  });

  if (!canView) {
    throw new Error('この提案書類を閲覧する権限がありません');
  }

  return {
    document,
    canEdit,
    canView
  };
}

/**
 * 提案書類を更新（監査ログ付き）
 *
 * @param documentId 提案書類ID
 * @param updateData 更新データ
 * @param userId 更新者ID
 * @param userName 更新者名
 * @param userLevel 更新者権限レベル
 * @param ipAddress IPアドレス
 * @param userAgent User Agent
 * @returns 更新された提案書類と監査ログ
 */
export async function updateDocumentWithAudit(
  documentId: string,
  updateData: Partial<ProposalDocument>,
  userId: string,
  userName: string,
  userLevel: number,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  document: ProposalDocument;
  auditLog: ProposalAuditLog;
}> {
  console.log('[updateDocumentWithAudit] 更新開始:', {
    documentId,
    userId,
    fieldsToUpdate: Object.keys(updateData)
  });

  // 既存の提案書類を取得
  const existingDocument = await prisma.proposalDocument.findUnique({
    where: { id: documentId }
  });

  if (!existingDocument) {
    throw new Error(`提案書類が見つかりません: ${documentId}`);
  }

  // 権限チェック
  const canEdit = await canEditDocument(userId, userLevel, existingDocument);
  if (!canEdit) {
    throw new Error('この提案書類を編集する権限がありません');
  }

  // 変更フィールドを検出
  const { changedFields, previousValues, newValues } = detectChangedFields(
    existingDocument,
    updateData
  );

  if (changedFields.length === 0) {
    console.log('[updateDocumentWithAudit] 変更なし、更新をスキップ');
    return {
      document: existingDocument,
      auditLog: null as any // 変更がない場合は監査ログを作成しない
    };
  }

  // トランザクションで更新と監査ログ作成
  const result = await prisma.$transaction(async (tx) => {
    // 提案書類を更新
    const updatedDocument = await tx.proposalDocument.update({
      where: { id: documentId },
      data: {
        ...updateData,
        lastModifiedDate: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('[updateDocumentWithAudit] 提案書類更新完了');

    // 監査ログを作成
    const auditLog = await tx.proposalAuditLog.create({
      data: {
        documentId,
        action: 'UPDATED',
        userId,
        userName,
        userLevel,
        changedFields: { fields: changedFields },
        previousValues,
        newValues,
        ipAddress,
        userAgent,
        timestamp: new Date()
      }
    });

    console.log('[updateDocumentWithAudit] 監査ログ作成完了:', auditLog.id);

    return {
      document: updatedDocument,
      auditLog
    };
  });

  return result;
}

// ===========================
// エクスポート
// ===========================

export const proposalDocumentService = {
  canEditDocument,
  canViewDocument,
  detectChangedFields,
  createAuditLog,
  getAuditLogs,
  getDocumentWithPermission,
  updateDocumentWithAudit
};

export default proposalDocumentService;
