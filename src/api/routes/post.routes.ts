/**
 * 投稿API（ComposeForm統合実装）
 * 作成日: 2025年10月9日
 *
 * エンドポイント:
 * - POST /api/posts - 投稿作成
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * 議題レベル自動判定
 */
function getExpectedAgendaLevel(permissionLevel: number): string {
  if (permissionLevel >= 8) return '施設議題レベル（100点以上で委員会提出可能）';
  if (permissionLevel >= 5) return '部署議題レベル（50点以上で部署課題として扱われます）';
  if (permissionLevel >= 3) return '部署検討レベル（30点以上で部署内検討対象）';
  return '検討中レベル（まずは関係者から意見を集めます）';
}

/**
 * POST /api/posts
 * 投稿作成API
 *
 * リクエストボディ:
 * {
 *   type: 'improvement' | 'community' | 'report',
 *   content: string,
 *   anonymityLevel: string,
 *   proposalType?: string,  // improvement専用
 *   priority?: string,
 *   freespaceCategory?: string,  // community専用
 *   freespaceScope?: string,
 *   expirationDate?: string,
 *   pollData?: CreatePollData,
 *   eventData?: CreateEventData,
 *   season?: string,
 *   moderationScore?: number
 * }
 */
router.post('/posts', async (req: Request, res: Response) => {
  try {
    // 🔴 共通DB構築前の暫定実装: ユーザー認証をスキップ
    // 本来はJWT認証ミドルウェアで req.user.id を取得
    // const userId = req.user?.id;

    // 暫定: デモユーザーID使用
    const userId = 'demo-user-001';

    const {
      type,
      content,
      anonymityLevel,
      proposalType,
      priority,
      freespaceCategory,
      freespaceScope,
      expirationDate,
      pollData,
      eventData,
      season,
      moderationScore
    } = req.body;

    // 1. バリデーション
    if (!type || !content || !anonymityLevel) {
      return res.status(400).json({
        success: false,
        message: '必須フィールドが不足しています。type, content, anonymityLevel は必須です。'
      });
    }

    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        message: '投稿内容は10文字以上で入力してください。'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '投稿内容は500文字以下で入力してください。'
      });
    }

    // 2. タイプ別バリデーション
    if (type === 'improvement' && !proposalType) {
      return res.status(400).json({
        success: false,
        message: 'improvement投稿では proposalType は必須です。'
      });
    }

    if (type === 'community' && (!freespaceCategory || !freespaceScope)) {
      return res.status(400).json({
        success: false,
        message: 'community投稿では freespaceCategory, freespaceScope は必須です。'
      });
    }

    if (type === 'report' && anonymityLevel !== 'anonymous') {
      return res.status(400).json({
        success: false,
        message: 'report投稿では anonymityLevel は "anonymous" 固定です。'
      });
    }

    console.log('[POST /api/posts] 投稿作成開始:', {
      userId,
      type,
      proposalType,
      freespaceCategory
    });

    // 3. Postレコード作成
    const post = await prisma.post.create({
      data: {
        type,
        content,
        authorId: userId,
        anonymityLevel,
        proposalType,
        priority,
        freespaceCategory,
        freespaceScope,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        season,
        moderationScore,
        status: 'active',
        moderationStatus: 'pending'
      }
    });

    console.log('[POST /api/posts] Post作成完了:', post.id);

    // 4. Pollデータがあれば作成
    if (pollData) {
      console.log('[POST /api/posts] Poll作成開始:', post.id);

      const poll = await prisma.poll.create({
        data: {
          postId: post.id,
          question: pollData.question,
          description: pollData.description,
          deadline: new Date(Date.now() + pollData.duration * 60 * 1000),
          allowMultiple: pollData.allowMultiple || false,
          showResults: pollData.showResults,
          category: pollData.category,
          scope: pollData.scope,
          createdById: userId
        }
      });

      // PollOption作成
      for (let i = 0; i < pollData.options.length; i++) {
        await prisma.pollOption.create({
          data: {
            pollId: poll.id,
            text: pollData.options[i].text,
            emoji: pollData.options[i].emoji,
            sortOrder: i
          }
        });
      }

      console.log('[POST /api/posts] Poll作成完了:', poll.id);
    }

    // 5. Eventデータがあれば作成
    if (eventData) {
      console.log('[POST /api/posts] Event作成開始:', post.id);

      const event = await prisma.event.create({
        data: {
          postId: post.id,
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          organizerId: userId,
          maxParticipants: eventData.maxParticipants,
          venueName: eventData.venue?.name,
          venueAddress: eventData.venue?.address,
          cost: eventData.cost,
          requirements: eventData.requirements,
          registrationDeadline: eventData.registrationDeadline
            ? new Date(eventData.registrationDeadline)
            : undefined,
          status: 'planning',
          visibility: eventData.visibility,
          allowDateVoting: eventData.allowDateVoting,
          allowComments: eventData.allowParticipantComments,
          sendReminders: eventData.sendReminders,
          tags: eventData.tags
        }
      });

      // ProposedDate作成
      for (let i = 0; i < eventData.proposedDates.length; i++) {
        await prisma.proposedDate.create({
          data: {
            eventId: event.id,
            date: new Date(eventData.proposedDates[i].date),
            startTime: eventData.proposedDates[i].startTime,
            endTime: eventData.proposedDates[i].endTime,
            sortOrder: i
          }
        });
      }

      console.log('[POST /api/posts] Event作成完了:', event.id);
    }

    // 6. Webhook通知（improvement投稿時）
    // 🔴 共通DB構築前の暫定実装: Webhook送信をスキップ
    // 本来はここで医療システムへWebhook送信
    if (type === 'improvement') {
      console.log('[POST /api/posts] 🔴 Webhook送信スキップ（共通DB構築前）');

      /*
      // 共通DB構築後の実装:
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user) {
        const permissionLevel = Number(user.permissionLevel);

        await medicalSystemWebhook.notifyProposalCreated({
          proposalId: post.id,
          staffId: user.employeeId,
          staffName: user.name,
          department: user.department || '',
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          content,
          proposalType: proposalType || 'operational',
          priority: priority || 'medium',
          permissionLevel,
          expectedAgendaLevel: getExpectedAgendaLevel(permissionLevel)
        });

        console.log('[POST /api/posts] Webhook送信完了');
      }
      */
    }

    // 7. レスポンス返却
    return res.status(201).json({
      success: true,
      data: post,
      message: '投稿が正常に作成されました。'
    });

  } catch (error: any) {
    console.error('[POST /api/posts] エラー:', error);

    return res.status(500).json({
      success: false,
      message: '投稿の作成中にエラーが発生しました。',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
