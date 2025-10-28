import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 委員会設定マスターデータ投入
 * - 議題ステータス（5件）
 * - 優先度レベル（4件）
 * - 議題タイプ（5件）
 * - システム設定（10件）
 */
export async function seedCommitteeSettings() {
  console.log('🏛️  委員会設定マスターデータ投入開始...');

  // 1. 議題ステータスマスター
  console.log('  📋 議題ステータス投入中...');
  const statuses = [
    {
      id: 'cas_pending',
      statusId: 'pending',
      name: '審議待ち',
      color: '#FFA500',
      enabled: true,
      displayOrder: 1,
      description: '委員会での審議を待っている状態',
    },
    {
      id: 'cas_in_review',
      statusId: 'in_review',
      name: '審議中',
      color: '#2196F3',
      enabled: true,
      displayOrder: 2,
      description: '委員会で現在審議中の状態',
    },
    {
      id: 'cas_approved',
      statusId: 'approved',
      name: '承認',
      color: '#4CAF50',
      enabled: true,
      displayOrder: 3,
      description: '委員会で承認された状態',
    },
    {
      id: 'cas_rejected',
      statusId: 'rejected',
      name: '却下',
      color: '#F44336',
      enabled: true,
      displayOrder: 4,
      description: '委員会で却下された状態',
    },
    {
      id: 'cas_on_hold',
      statusId: 'on_hold',
      name: '保留',
      color: '#9E9E9E',
      enabled: true,
      displayOrder: 5,
      description: '判断を保留している状態',
    },
  ];

  for (const status of statuses) {
    await prisma.committeeAgendaStatus.upsert({
      where: { statusId: status.statusId },
      update: status,
      create: status,
    });
  }
  console.log(`  ✅ 議題ステータス ${statuses.length}件 投入完了`);

  // 2. 優先度レベルマスター
  console.log('  🔥 優先度レベル投入中...');
  const priorities = [
    {
      id: 'cpl_critical',
      priorityId: 'critical',
      name: '緊急',
      color: '#F44336',
      enabled: true,
      displayOrder: 1,
      description: '即座に対応が必要な最優先事項',
    },
    {
      id: 'cpl_high',
      priorityId: 'high',
      name: '高',
      color: '#FF9800',
      enabled: true,
      displayOrder: 2,
      description: '早期の対応が必要な重要事項',
    },
    {
      id: 'cpl_normal',
      priorityId: 'normal',
      name: '通常',
      color: '#2196F3',
      enabled: true,
      displayOrder: 3,
      description: '通常の優先度で対応する事項',
    },
    {
      id: 'cpl_low',
      priorityId: 'low',
      name: '低',
      color: '#9E9E9E',
      enabled: true,
      displayOrder: 4,
      description: '時間に余裕がある事項',
    },
  ];

  for (const priority of priorities) {
    await prisma.committeePriorityLevel.upsert({
      where: { priorityId: priority.priorityId },
      update: priority,
      create: priority,
    });
  }
  console.log(`  ✅ 優先度レベル ${priorities.length}件 投入完了`);

  // 3. 議題タイプマスター
  console.log('  📑 議題タイプ投入中...');
  const types = [
    {
      id: 'cat_committee_proposal',
      typeId: 'committee_proposal',
      name: '委員会提案',
      enabled: true,
      displayOrder: 1,
      description: '委員会メンバーからの提案事項',
    },
    {
      id: 'cat_facility_policy',
      typeId: 'facility_policy',
      name: '施設方針',
      enabled: true,
      displayOrder: 2,
      description: '施設の運営方針に関する事項',
    },
    {
      id: 'cat_hr',
      typeId: 'hr',
      name: '人事',
      enabled: true,
      displayOrder: 3,
      description: '人事異動・採用・評価に関する事項',
    },
    {
      id: 'cat_budget',
      typeId: 'budget',
      name: '予算',
      enabled: true,
      displayOrder: 4,
      description: '予算申請・承認に関する事項',
    },
    {
      id: 'cat_equipment',
      typeId: 'equipment',
      name: '設備',
      enabled: true,
      displayOrder: 5,
      description: '設備導入・更新に関する事項',
    },
  ];

  for (const type of types) {
    await prisma.committeeAgendaType.upsert({
      where: { typeId: type.typeId },
      update: type,
      create: type,
    });
  }
  console.log(`  ✅ 議題タイプ ${types.length}件 投入完了`);

  // 4. システム設定（会議スケジュール）
  console.log('  📅 会議スケジュール設定投入中...');
  const meetingSettings = [
    {
      id: 'css_meeting_day',
      category: 'meeting',
      settingKey: 'defaultMeetingDay',
      settingValue: '第2木曜日',
      valueType: 'string',
      description: 'デフォルト会議開催日',
    },
    {
      id: 'css_meeting_time',
      category: 'meeting',
      settingKey: 'defaultMeetingTime',
      settingValue: '14:00',
      valueType: 'string',
      description: 'デフォルト会議開始時刻',
    },
    {
      id: 'css_meeting_duration',
      category: 'meeting',
      settingKey: 'meetingDurationMinutes',
      settingValue: '120',
      valueType: 'number',
      description: '会議時間（分）',
    },
    {
      id: 'css_agenda_deadline',
      category: 'meeting',
      settingKey: 'agendaSubmissionDeadlineDays',
      settingValue: '7',
      valueType: 'number',
      description: '議題提出期限（会議の何日前）',
    },
    {
      id: 'css_minutes_deadline',
      category: 'meeting',
      settingKey: 'minutesPublishDeadlineDays',
      settingValue: '3',
      valueType: 'number',
      description: '議事録公開期限（会議後何日以内）',
    },
  ];

  for (const setting of meetingSettings) {
    await prisma.committeeSystemSetting.upsert({
      where: {
        category_settingKey: {
          category: setting.category,
          settingKey: setting.settingKey,
        },
      },
      update: setting,
      create: setting,
    });
  }
  console.log(`  ✅ 会議スケジュール設定 ${meetingSettings.length}件 投入完了`);

  // 5. システム設定（承認フロー）
  console.log('  ✅ 承認フロー設定投入中...');
  const approvalSettings = [
    {
      id: 'css_require_approval',
      category: 'approval',
      settingKey: 'requireApproval',
      settingValue: 'true',
      valueType: 'boolean',
      description: '議題提出時の承認を必須にする',
    },
    {
      id: 'css_min_approver_level',
      category: 'approval',
      settingKey: 'minApproverLevel',
      settingValue: '8',
      valueType: 'number',
      description: '承認者の最低権限レベル',
    },
    {
      id: 'css_approval_deadline',
      category: 'approval',
      settingKey: 'approvalDeadlineHours',
      settingValue: '48',
      valueType: 'number',
      description: '承認期限（時間）',
    },
    {
      id: 'css_auto_approve',
      category: 'approval',
      settingKey: 'autoApproveAfterDeadline',
      settingValue: 'false',
      valueType: 'boolean',
      description: '期限超過後の自動承認',
    },
    {
      id: 'css_notify_email',
      category: 'approval',
      settingKey: 'notifyApproverByEmail',
      settingValue: 'true',
      valueType: 'boolean',
      description: '承認者へのメール通知',
    },
  ];

  for (const setting of approvalSettings) {
    await prisma.committeeSystemSetting.upsert({
      where: {
        category_settingKey: {
          category: setting.category,
          settingKey: setting.settingKey,
        },
      },
      update: setting,
      create: setting,
    });
  }
  console.log(`  ✅ 承認フロー設定 ${approvalSettings.length}件 投入完了`);

  console.log('🎉 委員会設定マスターデータ投入完了！');
  console.log(`   合計: ${statuses.length + priorities.length + types.length + meetingSettings.length + approvalSettings.length}件`);
}

// 単独実行用
const isMainModule = process.argv[1]?.includes('05-committee-settings');
if (isMainModule) {
  seedCommitteeSettings()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
