/**
 * 投票設定変更ログ記録サービス
 *
 * すべての投票設定変更を自動的にログに記録するための共通サービス
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ログ記録パラメータの型定義
 */
export interface LogChangeParams {
  mode: 'agenda' | 'project' | 'both';
  category: string;
  subcategory?: string;
  changeDescription: string;
  impactDescription?: string;
  beforeValue?: any;
  afterValue?: any;
  changedBy: string;
  changedByLevel: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
}

/**
 * 投票設定の変更をログに記録
 *
 * @param params ログ記録パラメータ
 * @returns 作成されたログエントリ
 */
export async function logSettingChange(params: LogChangeParams) {
  try {
    const logEntry = await prisma.votingSettingChangeLog.create({
      data: {
        mode: params.mode,
        category: params.category,
        subcategory: params.subcategory,
        changeDescription: params.changeDescription,
        impactDescription: params.impactDescription,
        beforeValue: params.beforeValue,
        afterValue: params.afterValue,
        changedBy: params.changedBy,
        changedByLevel: params.changedByLevel,
        status: 'active',
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
        metadata: params.metadata,
      },
    });

    console.log('[VotingSettingLog] 変更を記録しました:', {
      id: logEntry.id,
      category: params.category,
      description: params.changeDescription,
    });

    return logEntry;
  } catch (error) {
    console.error('[VotingSettingLog] ログ記録エラー:', error);
    // ログ記録の失敗は本来の処理に影響を与えないようにする
    throw error;
  }
}

/**
 * 設定変更を取り消す（ロールバック）
 *
 * @param logId ログエントリのID
 * @param revertedBy 取り消しを実行したユーザーID
 * @param revertReason 取り消し理由
 */
export async function revertSettingChange(
  logId: string,
  revertedBy: string,
  revertReason: string
) {
  try {
    const updatedLog = await prisma.votingSettingChangeLog.update({
      where: { id: logId },
      data: {
        status: 'reverted',
        revertedAt: new Date(),
        revertedBy,
        revertReason,
      },
    });

    console.log('[VotingSettingLog] 変更を取り消しました:', {
      id: logId,
      revertedBy,
    });

    return updatedLog;
  } catch (error) {
    console.error('[VotingSettingLog] 取り消しエラー:', error);
    throw error;
  }
}

/**
 * 古い設定変更を無効化（新しい変更で上書きされた場合）
 *
 * @param logId ログエントリのID
 */
export async function supersedeSetting(logId: string) {
  try {
    const updatedLog = await prisma.votingSettingChangeLog.update({
      where: { id: logId },
      data: {
        status: 'superseded',
      },
    });

    console.log('[VotingSettingLog] 設定を無効化しました:', { id: logId });

    return updatedLog;
  } catch (error) {
    console.error('[VotingSettingLog] 無効化エラー:', error);
    throw error;
  }
}

/**
 * カテゴリー別のヘルパー関数
 */

/**
 * 投票スコープ設定変更のログ記録
 */
export async function logVotingScopeChange(params: {
  departmentName: string;
  oldPattern: string;
  newPattern: string;
  affectedCount: number;
  changedBy: string;
  changedByLevel: number;
}) {
  return logSettingChange({
    mode: 'agenda',
    category: '投票スコープ設定',
    subcategory: params.departmentName,
    changeDescription: `${params.departmentName}の投票パターンを${params.oldPattern}から${params.newPattern}に変更`,
    impactDescription: `約${params.affectedCount}名に影響`,
    beforeValue: { pattern: params.oldPattern },
    afterValue: { pattern: params.newPattern },
    changedBy: params.changedBy,
    changedByLevel: params.changedByLevel,
    relatedEntityType: 'department',
    relatedEntityId: params.departmentName,
  });
}

/**
 * 投票グループ管理変更のログ記録
 */
export async function logVotingGroupChange(params: {
  groupName: string;
  action: 'create' | 'update' | 'delete';
  departments?: string[];
  affectedCount: number;
  changedBy: string;
  changedByLevel: number;
}) {
  const actionLabels = {
    create: '新規作成',
    update: '更新',
    delete: '削除',
  };

  const description = params.action === 'create'
    ? `「${params.groupName}」を新規作成（${params.departments?.join('、')}）`
    : params.action === 'update'
    ? `「${params.groupName}」を更新`
    : `「${params.groupName}」を削除`;

  return logSettingChange({
    mode: 'agenda',
    category: '投票グループ管理',
    subcategory: params.groupName,
    changeDescription: description,
    impactDescription: `${params.affectedCount}名が影響を受ける`,
    afterValue: params.action !== 'delete' ? {
      groupName: params.groupName,
      departments: params.departments
    } : undefined,
    changedBy: params.changedBy,
    changedByLevel: params.changedByLevel,
    relatedEntityType: 'voting_group',
    relatedEntityId: params.groupName,
    metadata: { action: params.action },
  });
}

/**
 * 主承認者設定変更のログ記録
 */
export async function logPrimaryApproverChange(params: {
  groupName: string;
  changeType: 'rotation' | 'approver' | 'settings';
  description: string;
  affectedCount: number;
  changedBy: string;
  changedByLevel: number;
  beforeValue?: any;
  afterValue?: any;
}) {
  return logSettingChange({
    mode: 'agenda',
    category: '主承認者設定',
    subcategory: params.groupName,
    changeDescription: params.description,
    impactDescription: `${params.affectedCount}名の承認者に影響`,
    beforeValue: params.beforeValue,
    afterValue: params.afterValue,
    changedBy: params.changedBy,
    changedByLevel: params.changedByLevel,
    relatedEntityType: 'approver_group',
    relatedEntityId: params.groupName,
    metadata: { changeType: params.changeType },
  });
}

/**
 * プロジェクト設定変更のログ記録
 */
export async function logProjectSettingChange(params: {
  category: 'チーム編成ルール' | 'プロジェクト化閾値' | '進捗管理設定' | 'その他';
  changeDescription: string;
  impactDescription: string;
  changedBy: string;
  changedByLevel: number;
  beforeValue?: any;
  afterValue?: any;
}) {
  return logSettingChange({
    mode: 'project',
    category: params.category,
    changeDescription: params.changeDescription,
    impactDescription: params.impactDescription,
    beforeValue: params.beforeValue,
    afterValue: params.afterValue,
    changedBy: params.changedBy,
    changedByLevel: params.changedByLevel,
    relatedEntityType: 'project_setting',
  });
}

/**
 * 共通設定変更（両モードに影響）のログ記録
 */
export async function logCommonSettingChange(params: {
  category: string;
  changeDescription: string;
  impactDescription: string;
  changedBy: string;
  changedByLevel: number;
  beforeValue?: any;
  afterValue?: any;
}) {
  return logSettingChange({
    mode: 'both',
    category: params.category,
    changeDescription: params.changeDescription,
    impactDescription: params.impactDescription,
    beforeValue: params.beforeValue,
    afterValue: params.afterValue,
    changedBy: params.changedBy,
    changedByLevel: params.changedByLevel,
  });
}
