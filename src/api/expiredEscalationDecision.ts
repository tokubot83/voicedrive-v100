/**
 * 期限到達提案の判断API
 * Phase 6 - 期限到達・未達成昇格の判断機能
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 判断タイプの定義
 */
export type DecisionType =
  | 'approve_at_current_level'  // 現在のレベルで承認
  | 'downgrade'                  // ダウングレード
  | 'reject';                    // 不採用

/**
 * 判断記録のパラメータ
 */
export interface RecordDecisionParams {
  postId: string;
  decision: DecisionType;
  deciderId: string;
  decisionReason: string;
  currentScore: number;
  targetScore: number;
  agendaLevel: string;
  proposalType?: string;
  department?: string;
  facilityId?: string;
}

/**
 * 判断履歴取得のパラメータ
 */
export interface GetHistoryParams {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * 判断履歴のレスポンス
 */
export interface DecisionHistoryItem {
  id: string;
  postId: string;
  postContent: string;
  decision: DecisionType;
  deciderId: string;
  deciderName: string;
  decisionReason: string;
  currentScore: number;
  targetScore: number;
  achievementRate: number;
  daysOverdue: number;
  agendaLevel: string;
  proposalType?: string;
  department?: string;
  facilityId?: string;
  createdAt: Date;
}

export interface GetHistoryResponse {
  decisions: DecisionHistoryItem[];
  total: number;
  summary: {
    totalDecisions: number;
    approvalCount: number;
    downgradeCount: number;
    rejectCount: number;
    averageAchievementRate: number;
    averageDaysOverdue: number;
  };
}

/**
 * 期限到達提案の判断を記録する
 */
export async function recordExpiredEscalationDecision(
  params: RecordDecisionParams
): Promise<{ success: boolean; decisionId?: string; error?: string }> {
  try {
    // 到達率を計算
    const achievementRate = (params.currentScore / params.targetScore) * 100;

    // 期限超過日数を計算
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { agendaVotingDeadline: true }
    });

    if (!post || !post.agendaVotingDeadline) {
      return {
        success: false,
        error: '提案が見つからないか、投票期限が設定されていません'
      };
    }

    const now = new Date();
    const deadline = new Date(post.agendaVotingDeadline);
    const daysOverdue = Math.floor(
      (now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 判断を記録
    const decision = await prisma.expiredEscalationDecision.create({
      data: {
        postId: params.postId,
        deciderId: params.deciderId,
        decision: params.decision,
        decisionReason: params.decisionReason,
        currentScore: params.currentScore,
        targetScore: params.targetScore,
        achievementRate,
        daysOverdue: Math.max(0, daysOverdue),
        agendaLevel: params.agendaLevel,
        proposalType: params.proposalType,
        department: params.department,
        facilityId: params.facilityId
      }
    });

    // 提案のステータスを更新
    await updatePostStatusAfterDecision(params.postId, params.decision);

    return {
      success: true,
      decisionId: decision.id
    };
  } catch (error) {
    console.error('[ExpiredEscalationAPI] 判断記録エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '判断の記録に失敗しました'
    };
  }
}

/**
 * 判断後の提案ステータスを更新
 */
async function updatePostStatusAfterDecision(
  postId: string,
  decision: DecisionType
): Promise<void> {
  const updateData: any = {
    updatedAt: new Date()
  };

  switch (decision) {
    case 'approve_at_current_level':
      // 現在のレベルで承認 → agendaStatusを'approved'に
      updateData.agendaStatus = 'approved';
      updateData.agendaDecisionAt = new Date();
      break;

    case 'downgrade':
      // ダウングレード → 1つ下のレベルに降格
      // ※ 実装は簡易版：agendaStatusを'downgraded'に
      updateData.agendaStatus = 'downgraded';
      updateData.agendaDecisionAt = new Date();
      break;

    case 'reject':
      // 不採用 → agendaStatusを'rejected'に
      updateData.agendaStatus = 'rejected';
      updateData.agendaDecisionAt = new Date();
      break;
  }

  await prisma.post.update({
    where: { id: postId },
    data: updateData
  });
}

/**
 * 期限到達判断履歴を取得する（権限レベル別）
 */
export async function getExpiredEscalationHistory(
  params: GetHistoryParams
): Promise<GetHistoryResponse> {
  try {
    const {
      userId,
      permissionLevel,
      facilityId,
      departmentId,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = params;

    // 権限レベルに応じたフィルタ条件を構築
    const whereCondition = buildWhereCondition(
      userId,
      permissionLevel,
      facilityId,
      departmentId,
      startDate,
      endDate
    );

    // 判断履歴を取得
    const decisions = await prisma.expiredEscalationDecision.findMany({
      where: whereCondition,
      include: {
        post: {
          select: {
            id: true,
            content: true,
            proposalType: true,
            agendaLevel: true
          }
        },
        decider: {
          select: {
            id: true,
            name: true,
            department: true,
            facilityId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // 総数を取得
    const total = await prisma.expiredEscalationDecision.count({
      where: whereCondition
    });

    // サマリー統計を計算
    const allDecisions = await prisma.expiredEscalationDecision.findMany({
      where: whereCondition,
      select: {
        decision: true,
        achievementRate: true,
        daysOverdue: true
      }
    });

    const summary = calculateSummary(allDecisions);

    // レスポンスを整形
    const formattedDecisions: DecisionHistoryItem[] = decisions.map((d) => ({
      id: d.id,
      postId: d.postId,
      postContent: d.post.content,
      decision: d.decision as DecisionType,
      deciderId: d.deciderId,
      deciderName: d.decider.name,
      decisionReason: d.decisionReason,
      currentScore: d.currentScore,
      targetScore: d.targetScore,
      achievementRate: d.achievementRate,
      daysOverdue: d.daysOverdue,
      agendaLevel: d.agendaLevel,
      proposalType: d.proposalType || undefined,
      department: d.department || undefined,
      facilityId: d.facilityId || undefined,
      createdAt: d.createdAt
    }));

    return {
      decisions: formattedDecisions,
      total,
      summary
    };
  } catch (error) {
    console.error('[ExpiredEscalationAPI] 履歴取得エラー:', error);
    throw error;
  }
}

/**
 * 権限レベルに応じたWHERE条件を構築
 */
function buildWhereCondition(
  userId: string,
  permissionLevel: number,
  facilityId?: string,
  departmentId?: string,
  startDate?: string,
  endDate?: string
): any {
  const where: any = {};

  // 日付フィルタ
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  // 権限レベル別のフィルタリング
  // LEVEL_99: システム管理者 - 全データ
  if (permissionLevel === 99) {
    return where;
  }

  // LEVEL_16-17: 組織開発 - 全データ（生データ含む）
  if (permissionLevel >= 16) {
    return where;
  }

  // LEVEL_14-15: 人事部門 - 法人全体
  if (permissionLevel >= 14) {
    return where;
  }

  // LEVEL_12-13: 施設経営層 - 施設全体
  if (permissionLevel >= 12) {
    if (facilityId) {
      where.facilityId = facilityId;
    }
    return where;
  }

  // LEVEL_9-11: 部長級 - 施設全体
  if (permissionLevel >= 9) {
    if (facilityId) {
      where.facilityId = facilityId;
    }
    return where;
  }

  // LEVEL_7-8: 師長・課長級 - 部署統計
  if (permissionLevel >= 7) {
    if (departmentId) {
      where.department = departmentId;
    }
    return where;
  }

  // LEVEL_5-6: 主任級 - 自分の判断履歴のみ
  if (permissionLevel >= 5) {
    where.deciderId = userId;
    return where;
  }

  // LEVEL_1-4: 一般職員 - アクセス不可（空の結果を返す）
  where.deciderId = 'INVALID_ID_NO_ACCESS';
  return where;
}

/**
 * サマリー統計を計算
 */
function calculateSummary(decisions: any[]): GetHistoryResponse['summary'] {
  if (decisions.length === 0) {
    return {
      totalDecisions: 0,
      approvalCount: 0,
      downgradeCount: 0,
      rejectCount: 0,
      averageAchievementRate: 0,
      averageDaysOverdue: 0
    };
  }

  const approvalCount = decisions.filter(
    (d) => d.decision === 'approve_at_current_level'
  ).length;
  const downgradeCount = decisions.filter(
    (d) => d.decision === 'downgrade'
  ).length;
  const rejectCount = decisions.filter((d) => d.decision === 'reject').length;

  const totalAchievementRate = decisions.reduce(
    (sum, d) => sum + d.achievementRate,
    0
  );
  const totalDaysOverdue = decisions.reduce((sum, d) => sum + d.daysOverdue, 0);

  return {
    totalDecisions: decisions.length,
    approvalCount,
    downgradeCount,
    rejectCount,
    averageAchievementRate: totalAchievementRate / decisions.length,
    averageDaysOverdue: totalDaysOverdue / decisions.length
  };
}

/**
 * 期限到達提案の一覧を取得（判断待ち）
 */
export async function getExpiredEscalationProposals(params: {
  userId: string;
  permissionLevel: number;
  facilityId?: string;
  department?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const { userId, permissionLevel, facilityId, department, limit = 20, offset = 0 } = params;

    // 権限レベルに応じたフィルタ条件
    const whereCondition: any = {
      // 期限到達条件
      agendaVotingDeadline: {
        lte: new Date()
      },
      // 昇格状態
      agendaLevel: {
        in: [
          'escalated_to_dept',
          'escalated_to_facility',
          'escalated_to_corp'
        ]
      },
      // 未判断（agendaStatusがpendingまたはnull）
      OR: [
        { agendaStatus: 'pending' },
        { agendaStatus: null }
      ]
    };

    // 権限レベル別のフィルタ
    if (permissionLevel < 9 && facilityId) {
      whereCondition.facilityId = facilityId;
    }
    if (permissionLevel < 7 && department) {
      whereCondition.department = department;
    }

    const proposals = await prisma.post.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        agendaVotingDeadline: 'asc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.post.count({
      where: whereCondition
    });

    return {
      proposals,
      total
    };
  } catch (error) {
    console.error('[ExpiredEscalationAPI] 期限到達提案取得エラー:', error);
    throw error;
  }
}
