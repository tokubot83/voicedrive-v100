/**
 * 理事会決定事項API
 * 作成日: 2025年10月13日
 *
 * エンドポイント:
 * - GET /api/board-decisions - 理事会決定事項一覧取得
 * - GET /api/board-decisions/:decisionId/facility-implementations - 施設別実施状況一覧取得
 * - POST /api/board-decisions - 理事会決定事項作成
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateDecisionProgress, determineDecisionStatus } from '../../services/boardDecisionService';

const router = Router();
const prisma = new PrismaClient();

/**
 * 権限チェック: レベル18以上（理事長・法人事務局長）のみアクセス可能
 */
function hasChairmanPermission(permissionLevel: number): boolean {
  return permissionLevel >= 18;
}

/**
 * GET /api/board-decisions
 * 理事会決定事項一覧取得
 *
 * クエリパラメータ:
 * - category?: string - カテゴリーフィルター
 * - status?: string - ステータスフィルター
 * - limit?: number - 取得件数（デフォルト: 50）
 * - offset?: number - オフセット（デフォルト: 0）
 *
 * レスポンス:
 * {
 *   success: true,
 *   data: {
 *     decisions: Array<BoardDecision>,
 *     pagination: {
 *       total: number,
 *       limit: number,
 *       offset: number,
 *       hasMore: boolean
 *     }
 *   }
 * }
 */
router.get('/board-decisions', async (req: Request, res: Response) => {
  try {
    const { category, status, limit = '50', offset = '0' } = req.query;

    // クエリパラメータのパース
    const parsedLimit = parseInt(limit as string, 10);
    const parsedOffset = parseInt(offset as string, 10);

    if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
      return res.status(400).json({
        success: false,
        error: 'limitとoffsetは数値である必要があります'
      });
    }

    // WHERE条件の構築
    const where: any = {};

    if (category && typeof category === 'string') {
      where.category = category;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    console.log('[GET /api/board-decisions] クエリ条件:', { where, limit: parsedLimit, offset: parsedOffset });

    // 決定事項一覧取得（マイルストーンと施設実施状況を含む）
    const [decisions, totalCount] = await Promise.all([
      prisma.boardDecision.findMany({
        where,
        include: {
          milestones: {
            orderBy: { sortOrder: 'asc' }
          },
          facilityImplementations: {
            orderBy: { facilityName: 'asc' }
          }
        },
        orderBy: [
          { meetingDate: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parsedLimit,
        skip: parsedOffset
      }),
      prisma.boardDecision.count({ where })
    ]);

    console.log('[GET /api/board-decisions] 取得結果:', {
      count: decisions.length,
      totalCount
    });

    // レスポンス整形
    const formattedDecisions = decisions.map(decision => ({
      id: decision.id,
      boardMeetingId: decision.boardMeetingId,
      meetingDate: decision.meetingDate.toISOString(),
      title: decision.title,
      category: decision.category,
      description: decision.description,
      decision: decision.decision,
      implementationDeadline: decision.implementationDeadline.toISOString(),
      responsibleDept: decision.responsibleDept,
      responsibleDeptId: decision.responsibleDeptId,
      affectedFacilities: decision.affectedFacilities,
      status: decision.status,
      progress: decision.progress,
      milestones: decision.milestones.map(m => ({
        id: m.id,
        title: m.title,
        deadline: m.deadline.toISOString(),
        status: m.status,
        assignee: m.assignee,
        assigneeId: m.assigneeId,
        sortOrder: m.sortOrder,
        completedAt: m.completedAt?.toISOString()
      })),
      lastUpdate: decision.lastUpdate.toISOString(),
      createdAt: decision.createdAt.toISOString()
    }));

    return res.status(200).json({
      success: true,
      data: {
        decisions: formattedDecisions,
        pagination: {
          total: totalCount,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + parsedLimit < totalCount
        }
      }
    });

  } catch (error: any) {
    console.error('[GET /api/board-decisions] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '理事会決定事項の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/board-decisions/:decisionId/facility-implementations
 * 施設別実施状況一覧取得
 *
 * レスポンス:
 * {
 *   success: true,
 *   data: {
 *     implementations: Array<FacilityImplementation>
 *   }
 * }
 */
router.get('/board-decisions/:decisionId/facility-implementations', async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;

    console.log('[GET /api/board-decisions/:decisionId/facility-implementations] 取得開始:', { decisionId });

    // 決定事項の存在確認
    const decision = await prisma.boardDecision.findUnique({
      where: { id: decisionId }
    });

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: '理事会決定事項が見つかりません'
      });
    }

    // 施設別実施状況取得
    const implementations = await prisma.boardDecisionFacilityImplementation.findMany({
      where: { boardDecisionId: decisionId },
      orderBy: { facilityName: 'asc' }
    });

    console.log('[GET /api/board-decisions/:decisionId/facility-implementations] 取得完了:', {
      count: implementations.length
    });

    // レスポンス整形
    const formattedImplementations = implementations.map(impl => ({
      id: impl.id,
      facilityId: impl.facilityId,
      facilityName: impl.facilityName,
      status: impl.status,
      progress: impl.progress,
      note: impl.note,
      startedAt: impl.startedAt?.toISOString(),
      completedAt: impl.completedAt?.toISOString(),
      lastUpdate: impl.updatedAt.toISOString()
    }));

    return res.status(200).json({
      success: true,
      data: {
        implementations: formattedImplementations
      }
    });

  } catch (error: any) {
    console.error('[GET /api/board-decisions/:decisionId/facility-implementations] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '施設別実施状況の取得中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/board-decisions
 * 理事会決定事項作成
 *
 * リクエストボディ:
 * {
 *   boardMeetingId: string,
 *   meetingDate: string (ISO 8601),
 *   title: string,
 *   category: string,
 *   description: string,
 *   decision: string,
 *   implementationDeadline: string (ISO 8601),
 *   responsibleDept: string,
 *   responsibleDeptId?: string,
 *   affectedFacilities: Array<{id: string, name: string}>,
 *   milestones: Array<{
 *     title: string,
 *     deadline: string (ISO 8601),
 *     assignee: string,
 *     assigneeId?: string,
 *     sortOrder: number
 *   }>,
 *   userId: string (作成者)
 * }
 *
 * レスポンス:
 * {
 *   success: true,
 *   data: {
 *     decision: BoardDecision (with milestones and facilityImplementations)
 *   }
 * }
 */
router.post('/board-decisions', async (req: Request, res: Response) => {
  try {
    const {
      boardMeetingId,
      meetingDate,
      title,
      category,
      description,
      decision,
      implementationDeadline,
      responsibleDept,
      responsibleDeptId,
      affectedFacilities,
      milestones,
      userId
    } = req.body;

    // 1. バリデーション
    if (!boardMeetingId || !meetingDate || !title || !category || !description || !decision || !implementationDeadline || !responsibleDept || !userId) {
      return res.status(400).json({
        success: false,
        error: '必須フィールドが不足しています',
        required: ['boardMeetingId', 'meetingDate', 'title', 'category', 'description', 'decision', 'implementationDeadline', 'responsibleDept', 'userId']
      });
    }

    if (!Array.isArray(affectedFacilities) || affectedFacilities.length === 0) {
      return res.status(400).json({
        success: false,
        error: '対象施設を少なくとも1つ指定してください'
      });
    }

    if (!Array.isArray(milestones) || milestones.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'マイルストーンを少なくとも1つ指定してください'
      });
    }

    // 2. ユーザー権限チェック
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
    }

    if (!hasChairmanPermission(Number(user.permissionLevel))) {
      return res.status(403).json({
        success: false,
        error: 'この操作にはレベル18以上の権限が必要です（理事長・法人事務局長）'
      });
    }

    // 3. 日付のパース
    const parsedMeetingDate = new Date(meetingDate);
    const parsedDeadline = new Date(implementationDeadline);

    if (isNaN(parsedMeetingDate.getTime()) || isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        error: '無効な日付形式です'
      });
    }

    console.log('[POST /api/board-decisions] 作成開始:', {
      title: title.substring(0, 50),
      category,
      affectedFacilitiesCount: affectedFacilities.length,
      milestonesCount: milestones.length
    });

    // 4. トランザクションで一括作成
    const result = await prisma.$transaction(async (tx) => {
      // 4-1. 決定事項レコード作成
      const newDecision = await tx.boardDecision.create({
        data: {
          boardMeetingId,
          meetingDate: parsedMeetingDate,
          title,
          category,
          description,
          decision,
          implementationDeadline: parsedDeadline,
          responsibleDept,
          responsibleDeptId,
          affectedFacilities: affectedFacilities,
          status: 'on_track', // 初期ステータス
          progress: 0 // 初期進捗率
        }
      });

      console.log('[POST /api/board-decisions] 決定事項作成完了:', newDecision.id);

      // 4-2. マイルストーン一括作成
      const createdMilestones = await Promise.all(
        milestones.map((milestone: any) =>
          tx.boardDecisionMilestone.create({
            data: {
              boardDecisionId: newDecision.id,
              title: milestone.title,
              deadline: new Date(milestone.deadline),
              assignee: milestone.assignee,
              assigneeId: milestone.assigneeId,
              sortOrder: milestone.sortOrder,
              status: 'pending' // 初期ステータス
            }
          })
        )
      );

      console.log('[POST /api/board-decisions] マイルストーン作成完了:', createdMilestones.length);

      // 4-3. 施設別実施状況レコード自動生成
      const createdImplementations = await Promise.all(
        affectedFacilities.map((facility: any) =>
          tx.boardDecisionFacilityImplementation.create({
            data: {
              boardDecisionId: newDecision.id,
              facilityId: facility.id,
              facilityName: facility.name,
              status: 'not_started', // 初期ステータス
              progress: 0 // 初期進捗率
            }
          })
        )
      );

      console.log('[POST /api/board-decisions] 施設実施状況作成完了:', createdImplementations.length);

      return {
        decision: newDecision,
        milestones: createdMilestones,
        implementations: createdImplementations
      };
    });

    console.log('[POST /api/board-decisions] 作成処理完了');

    // 5. レスポンス
    return res.status(201).json({
      success: true,
      data: {
        decision: {
          id: result.decision.id,
          boardMeetingId: result.decision.boardMeetingId,
          meetingDate: result.decision.meetingDate.toISOString(),
          title: result.decision.title,
          category: result.decision.category,
          description: result.decision.description,
          decision: result.decision.decision,
          implementationDeadline: result.decision.implementationDeadline.toISOString(),
          responsibleDept: result.decision.responsibleDept,
          responsibleDeptId: result.decision.responsibleDeptId,
          affectedFacilities: result.decision.affectedFacilities,
          status: result.decision.status,
          progress: result.decision.progress,
          milestones: result.milestones.map(m => ({
            id: m.id,
            title: m.title,
            deadline: m.deadline.toISOString(),
            status: m.status,
            assignee: m.assignee,
            assigneeId: m.assigneeId,
            sortOrder: m.sortOrder
          })),
          facilityImplementations: result.implementations.map(impl => ({
            id: impl.id,
            facilityId: impl.facilityId,
            facilityName: impl.facilityName,
            status: impl.status,
            progress: impl.progress
          })),
          createdAt: result.decision.createdAt.toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('[POST /api/board-decisions] エラー:', error);
    return res.status(500).json({
      success: false,
      error: '理事会決定事項の作成中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
