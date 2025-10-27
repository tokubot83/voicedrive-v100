import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhistleblowingPermissions } from '../../../../../data/demo/whistleblowing';
import { logWhistleblowingAccess } from '../../../../../utils/auditLog';

const prisma = new PrismaClient();

/**
 * POST /api/whistleblowing/reports/[id]/notes
 * 調査ノートを追加する（高権限者のみ）
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { authorRole, content, isConfidential = true, actionItems } = req.body;

    // バリデーション
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '通報IDが無効です' });
    }

    if (!authorRole || !content) {
      return res.status(400).json({ error: '必須項目が入力されていません' });
    }

    // ユーザー認証（認証実装後に対応）
    // const userId = req.session?.user?.id;
    // const userLevel = req.session?.user?.permissionLevel || 1;
    const userId = 'demo-user-001'; // 暫定
    const userLevel = 5; // 暫定: 管理者権限
    const userName = 'デモ調査員'; // 暫定

    // 権限チェック
    const permissions = getWhistleblowingPermissions(userLevel);
    if (!permissions.canAccessConfidentialNotes) {
      return res.status(403).json({
        error: '調査ノートを追加する権限がありません',
        requiredLevel: 5,
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

    // 調査ノート作成
    const note = await prisma.investigationNote.create({
      data: {
        reportId: id as string,
        authorRole,
        authorName: userName,
        content,
        isConfidential,
        actionItems: actionItems || null
      }
    });

    // 通報ステータスを自動更新（receivedの場合のみ）
    if (report.status === 'received') {
      await prisma.whistleblowingReport.update({
        where: { id: id as string },
        data: { status: 'investigating' }
      });
    }

    // 監査ログ記録
    await logWhistleblowingAccess(
      id as string,
      userId,
      'note_added',
      JSON.stringify({
        authorRole,
        isConfidential,
        hasActionItems: !!actionItems
      }),
      req as any
    );

    return res.status(201).json({
      success: true,
      noteId: note.id,
      reportId: id,
      createdAt: note.createdAt,
      message: '調査ノートを追加しました'
    });
  } catch (error) {
    console.error('調査ノート追加エラー:', error);
    return res.status(500).json({
      error: '調査ノートの追加に失敗しました',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
