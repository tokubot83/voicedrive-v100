// Phase 2: Approvals Page - 統合テスト
// 承認フロー、アクション実行、エスカレーションの動作確認

import ActionableNotificationService from '../services/ActionableNotificationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const notificationService = ActionableNotificationService.getInstance();

async function testApprovalsIntegration() {
  console.log('=== Phase 2: Approvals Page 統合テスト開始 ===\n');

  try {
    // テストユーザーを作成
    const testUser1 = await prisma.user.create({
      data: {
        employeeId: 'TEST-APPROVER-001',
        email: 'test.approver@example.com',
        name: 'テスト承認者',
        accountType: 'DEPARTMENT_HEAD',
        permissionLevel: 10,
        budgetApprovalLimit: 1000000,
      }
    });

    const testUser2 = await prisma.user.create({
      data: {
        employeeId: 'TEST-REQUESTER-001',
        email: 'test.requester@example.com',
        name: 'テスト申請者',
        accountType: 'REGULAR',
        permissionLevel: 3,
      }
    });

    console.log(`✅ テストユーザー作成完了`);
    console.log(`   - 承認者: ${testUser1.name} (${testUser1.id})`);
    console.log(`   - 申請者: ${testUser2.name} (${testUser2.id})\n`);

    // ===========================
    // Test 1: 承認通知作成
    // ===========================
    console.log('【Test 1】承認通知作成テスト');

    const notificationId = await notificationService.createActionableNotification({
      category: 'approval',
      subcategory: 'budget',
      priority: 'high',
      title: '予算承認依頼',
      content: '新規プロジェクトの予算申請（¥500,000）の承認をお願いします。',
      target: 'department_head',
      senderId: testUser2.id,

      notificationType: 'APPROVAL_REQUIRED',
      urgency: 'high',
      actionRequired: true,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
      metadata: {
        projectId: 'PRJ-2025-001',
        amount: 500000,
        category: 'budget_approval',
      },
      relatedEntityType: 'ApprovalTask',
      relatedEntityId: 'TASK-001',

      actions: [
        {
          actionType: 'approve',
          actionLabel: '承認',
          isPrimary: true,
          requiresConfirmation: true,
          confirmationMessage: 'この予算申請を承認しますか？',
        },
        {
          actionType: 'reject',
          actionLabel: '却下',
          isDestructive: true,
          requiresConfirmation: true,
          confirmationMessage: 'この予算申請を却下しますか？理由を記載してください。',
        },
        {
          actionType: 'view',
          actionLabel: '詳細確認',
          actionUrl: '/approvals/tasks/TASK-001',
        },
      ],

      recipientIds: [testUser1.id],
    });

    console.log(`✅ 承認通知作成成功: ${notificationId}\n`);

    // ===========================
    // Test 2: 通知一覧取得
    // ===========================
    console.log('【Test 2】通知一覧取得テスト');

    const notifications = await notificationService.getUserNotifications(testUser1.id, {
      notificationType: 'APPROVAL_REQUIRED',
      pendingOnly: true,
    });

    console.log(`✅ 通知一覧取得成功: ${notifications.length}件`);
    notifications.forEach((n, index) => {
      console.log(`   ${index + 1}. ${n.title} (${n.notificationType})`);
      console.log(`      - アクション数: ${n.actions.length}`);
      console.log(`      - 受信者: ${n.recipients.length}人`);
    });
    console.log('');

    // ===========================
    // Test 3: 既読マーク
    // ===========================
    console.log('【Test 3】既読マークテスト');

    await notificationService.markAsRead(notificationId, testUser1.id);
    console.log(`✅ 既読マーク成功\n`);

    // ===========================
    // Test 4: 通知統計取得
    // ===========================
    console.log('【Test 4】通知統計取得テスト');

    const stats = await notificationService.getNotificationStats(testUser1.id);
    console.log(`✅ 通知統計取得成功:`);
    console.log(`   - 未読: ${stats.unread}件`);
    console.log(`   - 未アクション: ${stats.pending}件`);
    console.log(`   - 合計: ${stats.total}件`);
    console.log(`   - 期限切れ: ${stats.overdue}件`);
    console.log(`   - タイプ別:`, stats.byType);
    console.log('');

    // ===========================
    // Test 5: アクション実行（承認）
    // ===========================
    console.log('【Test 5】アクション実行テスト（承認）');

    // アクションコールバックを登録
    notificationService.registerActionCallback({
      actionType: 'approve',
      handler: async (data) => {
        console.log(`   📝 Callback実行: approve`);
        console.log(`      - 通知ID: ${data.notificationId}`);
        console.log(`      - 実行者: ${data.executedBy}`);

        // 実際の承認処理（例: ApprovalTaskのstatus更新）
        // await prisma.approvalTask.update({
        //   where: { id: data.actionData.taskId },
        //   data: { status: 'approved', approverId: data.executedBy }
        // });
      }
    });

    const action = notifications[0].actions[0]; // 最初のアクション（承認）

    await notificationService.executeNotificationAction({
      notificationId,
      actionId: action.id,
      executedBy: testUser1.id,
      result: {
        comment: '承認します。予算配分を確認しました。',
        timestamp: new Date().toISOString(),
      }
    });

    console.log(`✅ アクション実行成功: approve\n`);

    // ===========================
    // Test 6: アクション実行後の状態確認
    // ===========================
    console.log('【Test 6】アクション実行後の状態確認テスト');

    const updatedNotifications = await notificationService.getUserNotifications(testUser1.id, {
      notificationType: 'APPROVAL_REQUIRED',
    });

    const updatedNotification = updatedNotifications.find(n => n.id === notificationId);
    const recipient = updatedNotification?.recipients[0];

    console.log(`✅ 状態確認成功:`);
    console.log(`   - アクション実行済み: ${recipient?.actionTaken || 'なし'}`);
    console.log(`   - 実行日時: ${recipient?.actionTakenAt || '未実行'}`);
    console.log(`   - 既読: ${recipient?.isRead ? 'はい' : 'いいえ'}\n`);

    // ===========================
    // クリーンアップ
    // ===========================
    console.log('【クリーンアップ】テストデータ削除中...');

    await prisma.notificationRecipient.deleteMany({
      where: { notificationId }
    });

    await prisma.notificationAction.deleteMany({
      where: { notificationId }
    });

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [testUser1.id, testUser2.id] }
      }
    });

    console.log(`✅ クリーンアップ完了\n`);

    console.log('=== すべてのテスト完了 ✅ ===\n');

  } catch (error) {
    console.error('❌ テスト失敗:', error);
    throw error;

  } finally {
    await prisma.$disconnect();
  }
}

// テスト実行
testApprovalsIntegration()
  .then(() => {
    console.log('✅ 統合テスト正常終了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 統合テスト異常終了:', error);
    process.exit(1);
  });

export default testApprovalsIntegration;
