import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhistleblowingPermissions } from '../../../../../data/demo/whistleblowing';
import { logWhistleblowingAccess } from '../../../../../utils/auditLog';
import type { ReportStatus } from '../../../../../types/whistleblowing';

const prisma = new PrismaClient();

/**
 * ステータス遷移のバリデーション
 */
function validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string } {
  const validTransitions: Record<string, string[]> = {
    received: ['triaging', 'investigating'],
    triaging: ['investigating', 'received'],
    investigating: ['escalated', 'resolved', 'triaging'],
    escalated: ['resolved', 'investigating'],
    resolved: ['closed', 'investigating'], // 再調査の可能性
    closed: [] // 終了後は変更不可
  };

  const allowedTransitions = validTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      error: `ステータス "${currentStatus}" から "${newStatus}" への遷移は許可されていません`
    };
  }

  return { valid: true };
}

/**
 * ステータス変更に必要な権限レベルを取得
 */
function getRequiredPermissionLevel(newStatus: string): number {
  const permissionRequirements: Record<string, number> = {
    received: 3,
    triaging: 3,
    investigating: 4,
    escalated: 4,
    resolved: 5,
    closed: 5
  };

  return permissionRequirements[newStatus] || 5;
}

/**
 * PATCH /api/whistleblowing/reports/[id]/status
 * 通報のステータスを更新する
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { newStatus, updateNote, escalationReason, resolutionSummary } = req.body;

    // バリデーション
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '通報IDが無効です' });
    }

    if (!newStatus) {
      return res.status(400).json({ error: '新しいステータスが指定されていません' });
    }

    // ユーザー認証（認証実装後に対応）
    // const userId = req.session?.user?.id;
    // const userLevel = req.session?.user?.permissionLevel || 1;
    const userId = 'demo-user-001'; // 暫定
    const userLevel = 5; // 暫定: 管理者権限

    // 権限チェック
    const requiredLevel = getRequiredPermissionLevel(newStatus);
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `ステータス "${newStatus}" への変更には権限レベル ${requiredLevel} 以上が必要です`,
        requiredLevel,
        currentLevel: userLevel
      });
    }

    // 通報の存在確認
    const report = await prisma.whistleblowingReport.findUnique({
      where: { id: id as string }
    });

    if (!report) {
      return res.status(404).json({ error: '指定された通報が見つかりません' });
    }

    // ステータス遷移のバリデーション
    const validation = validateStatusTransition(report.status, newStatus);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        currentStatus: report.status,
        requestedStatus: newStatus
      });
    }

    // 更新データの準備
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    // エスカレーションの場合
    if (newStatus === 'escalated' && escalationReason) {
      updateData.escalationReason = escalationReason;
    }

    // 解決の場合
    if (newStatus === 'resolved' && resolutionSummary) {
      updateData.resolutionSummary = resolutionSummary;
      updateData.followUpRequired = false;
    }

    // ステータス更新
    const updatedReport = await prisma.whistleblowingReport.update({
      where: { id: id as string },
      data: updateData
    });

    // 更新ノートを調査ノートとして記録（提供されている場合）
    if (updateNote) {
      await prisma.investigationNote.create({
        data: {
          reportId: id as string,
          authorRole: 'management',
          authorName: 'システム管理者', // 暫定
          content: `[ステータス変更: ${report.status} → ${newStatus}]\n${updateNote}`,
          isConfidential: true
        }
      });
    }

    // 監査ログ記録
    await logWhistleblowingAccess(
      id as string,
      userId,
      'status_changed',
      JSON.stringify({
        from: report.status,
        to: newStatus,
        hasNote: !!updateNote
      }),
      req as any
    );

    return res.status(200).json({
      success: true,
      reportId: id,
      previousStatus: report.status,
      newStatus: updatedReport.status,
      updatedAt: updatedReport.updatedAt,
      message: `ステータスを "${newStatus}" に更新しました`
    });
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return res.status(500).json({
      error: 'ステータスの更新に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
