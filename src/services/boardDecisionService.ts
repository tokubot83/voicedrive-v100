/**
 * 理事会決定事項サービス
 * 作成日: 2025年10月13日
 *
 * 機能:
 * - 進捗率自動計算（マイルストーンベース・施設実施状況ベース）
 * - ステータス自動決定（completed, on_track, at_risk, delayed）
 * - マイルストーン更新時の親レコード自動更新
 * - 施設実施状況更新時の親レコード自動更新
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===========================
// 型定義
// ===========================

type DecisionStatus = 'completed' | 'on_track' | 'at_risk' | 'delayed';
type MilestoneStatus = 'completed' | 'in_progress' | 'pending' | 'delayed';
type FacilityImplementationStatus = 'completed' | 'in_progress' | 'not_started';

interface MilestoneData {
  status: string;
  deadline: Date;
}

interface FacilityImplementationData {
  progress: number;
}

// ===========================
// 進捗率計算ロジック
// ===========================

/**
 * マイルストーンベースの進捗率計算
 *
 * 計算式: (完了済みマイルストーン数 ÷ 総マイルストーン数) × 100
 *
 * @param milestones マイルストーン配列
 * @returns 進捗率（0-100）
 */
export function calculateProgressByMilestones(milestones: MilestoneData[]): number {
  if (milestones.length === 0) return 0;

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  console.log('[calculateProgressByMilestones]', {
    total: milestones.length,
    completed: completedCount,
    progress
  });

  return progress;
}

/**
 * 施設実施状況ベースの進捗率計算
 *
 * 計算式: (全施設の進捗率の合計 ÷ 施設数)
 *
 * @param implementations 施設実施状況配列
 * @returns 進捗率（0-100）
 */
export function calculateProgressByFacilities(implementations: FacilityImplementationData[]): number {
  if (implementations.length === 0) return 0;

  const totalProgress = implementations.reduce((sum, impl) => sum + impl.progress, 0);
  const progress = Math.round(totalProgress / implementations.length);

  console.log('[calculateProgressByFacilities]', {
    total: implementations.length,
    totalProgress,
    averageProgress: progress
  });

  return progress;
}

/**
 * 決定事項の総合進捗率を計算
 *
 * 両方を計算し、より低い値を採用（悲観的計算）
 * ただし、施設実施状況が0件の場合はマイルストーンベースのみ使用
 *
 * @param milestones マイルストーン配列
 * @param implementations 施設実施状況配列
 * @returns 進捗率（0-100）
 */
export function calculateDecisionProgress(
  milestones: MilestoneData[],
  implementations: FacilityImplementationData[]
): number {
  const milestoneProgress = calculateProgressByMilestones(milestones);

  // 施設実施状況が存在しない場合はマイルストーンベースのみ
  if (implementations.length === 0) {
    console.log('[calculateDecisionProgress] マイルストーンベースのみ:', milestoneProgress);
    return milestoneProgress;
  }

  const facilityProgress = calculateProgressByFacilities(implementations);

  // 悲観的計算: より低い値を採用
  const finalProgress = Math.min(milestoneProgress, facilityProgress);

  console.log('[calculateDecisionProgress] 総合進捗率:', {
    milestoneProgress,
    facilityProgress,
    finalProgress: finalProgress
  });

  return finalProgress;
}

// ===========================
// ステータス自動決定ロジック
// ===========================

/**
 * 決定事項のステータスを自動決定
 *
 * 判定基準:
 * 1. progress = 100% → completed
 * 2. 期限超過 → delayed
 * 3. 遅延マイルストーンあり → at_risk
 * 4. 進捗度 < 期待進捗度 - 20% → at_risk
 * 5. それ以外 → on_track
 *
 * @param progress 進捗率（0-100）
 * @param deadline 実施期限
 * @param milestones マイルストーン配列
 * @returns ステータス
 */
export function determineDecisionStatus(
  progress: number,
  deadline: Date,
  milestones: MilestoneData[]
): DecisionStatus {
  const now = new Date();

  // 1. 完了判定
  if (progress === 100) {
    console.log('[determineDecisionStatus] 完了判定: progress = 100');
    return 'completed';
  }

  // 2. 期限超過判定
  const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 0) {
    console.log('[determineDecisionStatus] 期限超過判定:', { daysUntilDeadline });
    return 'delayed';
  }

  // 3. 遅延マイルストーンの存在チェック
  const hasDelayedMilestone = milestones.some(m => m.status === 'delayed');

  if (hasDelayedMilestone) {
    console.log('[determineDecisionStatus] 遅延マイルストーンあり');
    return 'at_risk';
  }

  // 4. 進捗度と残り日数から判定
  // 期待進捗率の計算: 開始から期限までの時間を100として、現在位置を計算
  // 簡易計算: 残り日数が30日以上なら期待進捗0%、0日なら100%
  const totalDays = 90; // 標準的な実施期間を90日と仮定
  const elapsedDays = totalDays - daysUntilDeadline;
  const expectedProgress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));

  console.log('[determineDecisionStatus] 進捗判定:', {
    progress,
    expectedProgress,
    daysUntilDeadline,
    threshold: expectedProgress - 20
  });

  if (progress < expectedProgress - 20) {
    return 'at_risk';
  }

  // 5. 順調
  return 'on_track';
}

// ===========================
// マイルストーン更新処理
// ===========================

/**
 * マイルストーンのステータスを更新し、親決定事項の進捗率・ステータスを自動更新
 *
 * @param milestoneId マイルストーンID
 * @param status 新しいステータス
 * @returns 更新されたマイルストーンと親決定事項
 */
export async function updateMilestoneAndParent(
  milestoneId: string,
  status: MilestoneStatus
): Promise<{
  milestone: any;
  parentDecision: any;
}> {
  console.log('[updateMilestoneAndParent] 開始:', { milestoneId, status });

  // 1. マイルストーンを更新
  const completedAt = status === 'completed' ? new Date() : null;

  const updatedMilestone = await prisma.boardDecisionMilestone.update({
    where: { id: milestoneId },
    data: {
      status,
      completedAt,
      updatedAt: new Date()
    }
  });

  console.log('[updateMilestoneAndParent] マイルストーン更新完了:', updatedMilestone.id);

  // 2. 親決定事項を取得（全マイルストーンと施設実施状況を含む）
  const parentDecision = await prisma.boardDecision.findUnique({
    where: { id: updatedMilestone.boardDecisionId },
    include: {
      milestones: true,
      facilityImplementations: true
    }
  });

  if (!parentDecision) {
    throw new Error(`親決定事項が見つかりません: ${updatedMilestone.boardDecisionId}`);
  }

  // 3. 進捗率を再計算
  const newProgress = calculateDecisionProgress(
    parentDecision.milestones,
    parentDecision.facilityImplementations
  );

  // 4. ステータスを自動決定
  const newStatus = determineDecisionStatus(
    newProgress,
    parentDecision.implementationDeadline,
    parentDecision.milestones
  );

  console.log('[updateMilestoneAndParent] 親レコード更新:', {
    decisionId: parentDecision.id,
    oldProgress: parentDecision.progress,
    newProgress,
    oldStatus: parentDecision.status,
    newStatus
  });

  // 5. 親決定事項を更新
  const updatedParentDecision = await prisma.boardDecision.update({
    where: { id: parentDecision.id },
    data: {
      progress: newProgress,
      status: newStatus,
      lastUpdate: new Date()
    },
    include: {
      milestones: true,
      facilityImplementations: true
    }
  });

  console.log('[updateMilestoneAndParent] 完了');

  return {
    milestone: updatedMilestone,
    parentDecision: updatedParentDecision
  };
}

// ===========================
// 施設実施状況更新処理
// ===========================

/**
 * 施設別実施状況を更新し、親決定事項の進捗率・ステータスを自動更新
 *
 * @param implementationId 施設実施状況ID
 * @param updateData 更新データ
 * @returns 更新された施設実施状況と親決定事項
 */
export async function updateFacilityImplementationAndParent(
  implementationId: string,
  updateData: {
    status?: FacilityImplementationStatus;
    progress?: number;
    note?: string;
  }
): Promise<{
  implementation: any;
  parentDecision: any;
}> {
  console.log('[updateFacilityImplementationAndParent] 開始:', {
    implementationId,
    updateData
  });

  // 1. 施設実施状況を更新
  const dataToUpdate: any = {
    updatedAt: new Date()
  };

  if (updateData.status !== undefined) {
    dataToUpdate.status = updateData.status;
  }

  if (updateData.progress !== undefined) {
    // 進捗率のバリデーション
    if (updateData.progress < 0 || updateData.progress > 100) {
      throw new Error('進捗率は0～100の範囲で指定してください');
    }
    dataToUpdate.progress = updateData.progress;
  }

  if (updateData.note !== undefined) {
    dataToUpdate.note = updateData.note;
  }

  // ステータスに応じた日時の自動設定
  if (updateData.status === 'in_progress') {
    const current = await prisma.boardDecisionFacilityImplementation.findUnique({
      where: { id: implementationId }
    });
    if (current && current.status === 'not_started') {
      dataToUpdate.startedAt = new Date();
    }
  } else if (updateData.status === 'completed') {
    dataToUpdate.completedAt = new Date();
    dataToUpdate.progress = 100; // 完了時は進捗率を100%に強制
  }

  const updatedImplementation = await prisma.boardDecisionFacilityImplementation.update({
    where: { id: implementationId },
    data: dataToUpdate
  });

  console.log('[updateFacilityImplementationAndParent] 施設実施状況更新完了:', updatedImplementation.id);

  // 2. 親決定事項を取得（全マイルストーンと施設実施状況を含む）
  const parentDecision = await prisma.boardDecision.findUnique({
    where: { id: updatedImplementation.boardDecisionId },
    include: {
      milestones: true,
      facilityImplementations: true
    }
  });

  if (!parentDecision) {
    throw new Error(`親決定事項が見つかりません: ${updatedImplementation.boardDecisionId}`);
  }

  // 3. 進捗率を再計算
  const newProgress = calculateDecisionProgress(
    parentDecision.milestones,
    parentDecision.facilityImplementations
  );

  // 4. ステータスを自動決定
  const newStatus = determineDecisionStatus(
    newProgress,
    parentDecision.implementationDeadline,
    parentDecision.milestones
  );

  console.log('[updateFacilityImplementationAndParent] 親レコード更新:', {
    decisionId: parentDecision.id,
    oldProgress: parentDecision.progress,
    newProgress,
    oldStatus: parentDecision.status,
    newStatus
  });

  // 5. 親決定事項を更新
  const updatedParentDecision = await prisma.boardDecision.update({
    where: { id: parentDecision.id },
    data: {
      progress: newProgress,
      status: newStatus,
      lastUpdate: new Date()
    },
    include: {
      milestones: true,
      facilityImplementations: true
    }
  });

  console.log('[updateFacilityImplementationAndParent] 完了');

  return {
    implementation: updatedImplementation,
    parentDecision: updatedParentDecision
  };
}

// ===========================
// エクスポート
// ===========================

export const boardDecisionService = {
  calculateProgressByMilestones,
  calculateProgressByFacilities,
  calculateDecisionProgress,
  determineDecisionStatus,
  updateMilestoneAndParent,
  updateFacilityImplementationAndParent
};

export default boardDecisionService;
