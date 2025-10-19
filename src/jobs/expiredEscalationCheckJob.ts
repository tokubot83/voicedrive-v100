/**
 * 期限到達・未達成昇格の自動チェックと通知Job
 *
 * 毎日午前9時に実行され、期限到達した提案を検出し、
 * 該当する管理職にアプリ内通知を送信します。
 */

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { AgendaExpiredEscalationService } from '../services/AgendaExpiredEscalationService';

const prisma = new PrismaClient();
const expiredEscalationService = new AgendaExpiredEscalationService();

interface ManagerGroup {
  managerId: string;
  managerName: string;
  proposals: Array<{
    postId: string;
    content: string;
    currentScore: number;
    targetScore: number;
    achievementRate: number;
    daysOverdue: number;
    level: string;
  }>;
}

/**
 * 期限到達提案を管理職ごとにグループ化
 */
async function groupByManager(expiredEscalations: any[]): Promise<ManagerGroup[]> {
  const managerMap = new Map<string, ManagerGroup>();

  for (const escalation of expiredEscalations) {
    const { post, currentScore, targetScore, achievementRate, daysOverdue } = escalation;
    const managerId = post.agendaDecisionBy;

    if (!managerId) {
      console.warn(`⚠️ 管理職IDが見つかりません: postId=${post.id}`);
      continue;
    }

    // 管理職情報を取得
    if (!managerMap.has(managerId)) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
        select: { id: true, name: true, email: true }
      });

      if (!manager) {
        console.warn(`⚠️ 管理職が見つかりません: managerId=${managerId}`);
        continue;
      }

      managerMap.set(managerId, {
        managerId: manager.id,
        managerName: manager.name,
        proposals: []
      });
    }

    // 提案を追加
    const group = managerMap.get(managerId)!;
    group.proposals.push({
      postId: post.id,
      content: post.content.substring(0, 50) + '...',
      currentScore,
      targetScore,
      achievementRate,
      daysOverdue,
      level: post.agendaLevel
    });
  }

  return Array.from(managerMap.values());
}

/**
 * 通知メッセージを生成
 */
function generateNotificationMessage(proposals: any[]): string {
  const count = proposals.length;

  if (count === 1) {
    const p = proposals[0];
    return `期限到達・未達成の提案があります。\n\n【${p.level}】${p.content}\n現在スコア: ${p.currentScore}点 / 目標: ${p.targetScore}点（到達率${p.achievementRate}%）\n期限超過: ${p.daysOverdue}日\n\n早めの判断をお願いします。`;
  } else {
    return `期限到達・未達成の提案が${count}件あります。\n\n判断が必要な提案を確認し、適切な処理を行ってください。\n\nシステムの「期限到達判断」タブから確認できます。`;
  }
}

/**
 * メインのチェック処理
 */
async function checkExpiredEscalations() {
  const now = new Date();
  console.log(`\n🕐 [ExpiredEscalationJob] チェック開始: ${now.toISOString()}`);

  try {
    // 1. 期限到達・未達成の提案を検出
    const expiredList = await expiredEscalationService.detectExpiredEscalations();

    console.log(`📊 [ExpiredEscalationJob] 期限到達提案: ${expiredList.length}件`);

    if (expiredList.length === 0) {
      console.log('✅ [ExpiredEscalationJob] 判断が必要な提案はありません');
      return;
    }

    // 2. 管理職ごとにグループ化
    const managerGroups = await groupByManager(expiredList);
    console.log(`👥 [ExpiredEscalationJob] 対象管理職: ${managerGroups.length}名`);

    // 3. システム送信者を取得（理事長レベルの最初のユーザー）
    const systemSender = await prisma.user.findFirst({
      where: { permissionLevel: { gte: 9 } },
      select: { id: true }
    });

    if (!systemSender) {
      console.error('❌ [ExpiredEscalationJob] システム送信者が見つかりません');
      return;
    }

    // 4. 各管理職にアプリ内通知を送信
    let notificationCount = 0;

    for (const group of managerGroups) {
      try {
        const message = generateNotificationMessage(group.proposals);

        // アプリ内通知を作成
        await prisma.notification.create({
          data: {
            target: group.managerId,
            senderId: systemSender.id,
            category: 'agenda_management',
            subcategory: 'expired_escalation',
            priority: 'high',
            title: `【要判断】期限到達・未達成の提案が${group.proposals.length}件あります`,
            content: message,
            status: 'pending',
            sentAt: now,
          }
        });

        notificationCount++;
        console.log(`📧 [ExpiredEscalationJob] 通知送信: ${group.managerName} (${group.proposals.length}件)`);

        // 提案詳細をログ出力
        for (const proposal of group.proposals) {
          console.log(`   - [${proposal.level}] ${proposal.content} (${proposal.currentScore}/${proposal.targetScore}点, ${proposal.achievementRate}%)`);
        }

      } catch (error) {
        console.error(`❌ [ExpiredEscalationJob] 通知作成エラー: ${group.managerName}`, error);
      }
    }

    console.log(`✅ [ExpiredEscalationJob] チェック完了: ${notificationCount}件の通知を送信\n`);

  } catch (error) {
    console.error('❌ [ExpiredEscalationJob] エラー発生:', error);
  }
}

/**
 * Cron Jobスケジュール設定
 */
export function startExpiredEscalationJob() {
  // 毎日午前9時に実行（日本時間想定）
  // Cron式: 分 時 日 月 曜日
  const schedule = '0 9 * * *'; // 毎日午前9時

  cron.schedule(schedule, async () => {
    await checkExpiredEscalations();
  });

  console.log('⏰ [ExpiredEscalationJob] Cron Job起動完了');
  console.log(`   スケジュール: ${schedule} (毎日午前9時)`);
  console.log(`   現在時刻: ${new Date().toLocaleString('ja-JP')}`);
}

/**
 * 手動実行用（テスト用）
 */
export async function runExpiredEscalationCheckNow() {
  console.log('🚀 [ExpiredEscalationJob] 手動実行開始...');
  await checkExpiredEscalations();
}

// スタンドアロンで実行された場合（ESM版）
if (import.meta.url.includes('expiredEscalationCheckJob')) {
  if (process.argv[1] && process.argv[1].includes('expiredEscalationCheckJob')) {
    runExpiredEscalationCheckNow()
      .then(() => {
        console.log('✅ [ExpiredEscalationJob] 手動実行完了');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ [ExpiredEscalationJob] 手動実行エラー:', error);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
}
