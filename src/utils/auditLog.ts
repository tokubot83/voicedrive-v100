import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 内部通報へのアクセスを監査ログに記録する
 *
 * @param reportId - 通報ID
 * @param userId - アクセスしたユーザーID
 * @param action - アクション（viewed, note_added, status_changed, escalated, resolved）
 * @param details - アクション詳細（オプション）
 * @param req - リクエストオブジェクト（IPアドレス、UserAgent取得用）
 */
export async function logWhistleblowingAccess(
  reportId: string,
  userId: string,
  action: string,
  details?: string,
  req?: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }
): Promise<void> {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] as string || req?.socket?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] as string || null;

    await prisma.whistleblowingAccessLog.create({
      data: {
        reportId,
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('監査ログ記録エラー:', error);
    // 監査ログの記録失敗はアプリケーションの動作を止めない
  }
}

/**
 * 特定の通報に対するアクセスログを取得する
 *
 * @param reportId - 通報ID
 * @param limit - 取得件数の上限（デフォルト: 100）
 * @returns アクセスログの配列
 */
export async function getWhistleblowingAccessLogs(
  reportId: string,
  limit: number = 100
) {
  try {
    return await prisma.whistleblowingAccessLog.findMany({
      where: { reportId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: { accessedAt: 'desc' },
      take: limit
    });
  } catch (error) {
    console.error('アクセスログ取得エラー:', error);
    return [];
  }
}

/**
 * 特定ユーザーのアクセスログを取得する
 *
 * @param userId - ユーザーID
 * @param limit - 取得件数の上限（デフォルト: 100）
 * @returns アクセスログの配列
 */
export async function getUserWhistleblowingAccessLogs(
  userId: string,
  limit: number = 100
) {
  try {
    return await prisma.whistleblowingAccessLog.findMany({
      where: { userId },
      include: {
        report: {
          select: {
            id: true,
            anonymousId: true,
            category: true,
            severity: true,
            status: true
          }
        }
      },
      orderBy: { accessedAt: 'desc' },
      take: limit
    });
  } catch (error) {
    console.error('ユーザーアクセスログ取得エラー:', error);
    return [];
  }
}
