// データベース初期データ投入スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 データベース初期化開始...');

  // ========================================
  // ユーザー作成
  // ========================================

  // 会長
  const chairman = await prisma.user.create({
    data: {
      employeeId: 'EMP001',
      email: 'chairman@medical.jp',
      name: '山田 太郎',
      department: '経営戦略室',
      facilityId: 'FACILITY_HQ',
      role: '会長',
      accountType: 'CHAIRMAN',
      permissionLevel: 1,
      stakeholderCategory: 'management',
      position: '会長',
      hierarchyLevel: 1,
    }
  });

  // 人事総務部長
  const hrDirector = await prisma.user.create({
    data: {
      employeeId: 'EMP002',
      email: 'hr.director@medical.jp',
      name: '佐藤 花子',
      department: '人事総務部',
      facilityId: 'FACILITY_HQ',
      role: '部長',
      accountType: 'HR_DEPARTMENT_HEAD',
      permissionLevel: 4,
      parentId: chairman.id,
      stakeholderCategory: 'management',
      position: '人事総務部長',
      hierarchyLevel: 2,
    }
  });

  // 一般職員
  const staff1 = await prisma.user.create({
    data: {
      employeeId: 'EMP100',
      email: 'nurse.tanaka@medical.jp',
      name: '田中 看護師',
      department: '看護部',
      facilityId: 'FACILITY_HOSPITAL_1',
      role: '看護師',
      accountType: 'STAFF',
      permissionLevel: 13,
      parentId: hrDirector.id,
      stakeholderCategory: 'frontline',
      position: '看護師',
      hierarchyLevel: 5,
    }
  });

  const staff2 = await prisma.user.create({
    data: {
      employeeId: 'EMP101',
      email: 'doctor.suzuki@medical.jp',
      name: '鈴木 医師',
      department: '内科',
      facilityId: 'FACILITY_HOSPITAL_1',
      role: '医師',
      accountType: 'STAFF',
      permissionLevel: 13,
      parentId: hrDirector.id,
      stakeholderCategory: 'frontline',
      position: '内科医',
      hierarchyLevel: 5,
    }
  });

  console.log('✅ ユーザー作成完了');

  // ========================================
  // 通知作成
  // ========================================

  await prisma.notification.createMany({
    data: [
      {
        category: 'announcement',
        priority: 'high',
        title: '新しい感染予防ガイドライン',
        content: '冬季における感染症予防対策を更新しました。全職員は必ず確認してください。',
        target: 'all',
        senderId: hrDirector.id,
        status: 'sent',
        sentAt: new Date(),
        recipientCount: 4,
      },
      {
        category: 'training',
        priority: 'normal',
        title: '医療安全研修のお知らせ',
        content: '来月の医療安全研修の日程が決定しました。',
        target: 'doctors',
        senderId: hrDirector.id,
        status: 'sent',
        sentAt: new Date(),
        recipientCount: 1,
      },
      {
        category: 'survey',
        subcategory: 'satisfaction',
        priority: 'normal',
        title: '職員満足度調査2025',
        content: '年次職員満足度調査を実施します。締切は9月30日です。',
        target: 'all',
        senderId: chairman.id,
        status: 'pending',
        recipientCount: 4,
      }
    ]
  });

  console.log('✅ 通知作成完了');

  // ========================================
  // 面談予約作成
  // ========================================

  await prisma.interview.createMany({
    data: [
      {
        employeeId: staff1.id,
        category: 'BASIC',
        type: 'regular_1on1',
        topic: '今後のキャリアプランについて',
        preferredDate: new Date('2025-09-25'),
        urgencyLevel: 'next_week',
        status: 'pending',
      },
      {
        employeeId: staff2.id,
        category: 'SUPPORT',
        type: 'stress_management',
        topic: '業務負荷の調整について相談',
        preferredDate: new Date('2025-09-23'),
        urgencyLevel: 'this_week',
        status: 'scheduled',
        scheduledDate: new Date('2025-09-23T14:00:00'),
        interviewerName: '産業カウンセラー',
      }
    ]
  });

  console.log('✅ 面談予約作成完了');

  // ========================================
  // 評価データ作成
  // ========================================

  await prisma.evaluation.create({
    data: {
      employeeId: staff1.id,
      period: '2025-H1',
      evaluationType: 'self',
      overallScore: 85,
      categoryScores: {
        performance: 88,
        teamwork: 85,
        innovation: 82,
        leadership: 83
      },
      selfAssessment: '今期は新人教育に力を入れ、チーム全体のスキル向上に貢献できました。',
      achievements: [
        '新人教育プログラムの改善',
        '感染対策マニュアルの更新',
        'チーム内コミュニケーションの活性化'
      ],
      status: 'submitted',
      submittedAt: new Date(),
    }
  });

  console.log('✅ 評価データ作成完了');

  // ========================================
  // アンケート作成
  // ========================================

  const survey = await prisma.survey.create({
    data: {
      title: '職場環境改善アンケート2025',
      description: '職場環境をより良くするためのご意見をお聞かせください',
      category: 'workenv',
      createdById: hrDirector.id,
      targetAudience: 'all',
      deadline: new Date('2025-09-30'),
      isAnonymous: true,
      questions: [
        {
          id: 'q1',
          type: 'rating',
          question: '現在の職場環境に満足していますか？',
          scale: 5
        },
        {
          id: 'q2',
          type: 'text',
          question: '改善してほしい点があれば教えてください'
        }
      ],
      status: 'active',
      publishedAt: new Date(),
    }
  });

  // アンケート回答
  await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      respondentId: null, // 匿名
      answers: {
        q1: 4,
        q2: '休憩室の設備を充実させてほしい'
      },
      score: 4,
      submittedAt: new Date(),
    }
  });

  console.log('✅ アンケート作成完了');

  // ========================================
  // プロジェクト作成
  // ========================================

  await prisma.project.create({
    data: {
      title: '職員満足度向上プロジェクト',
      description: 'ES（従業員満足度）を向上させるための包括的な取り組み',
      category: 'improvement',
      proposerId: hrDirector.id,
      objectives: [
        '職員満足度を20%向上',
        '離職率を10%削減',
        'エンゲージメントスコアの改善'
      ],
      expectedOutcomes: [
        '働きやすい職場環境の実現',
        '生産性の向上',
        '採用競争力の強化'
      ],
      budget: 5000000,
      status: 'approved',
      priority: 'high',
      approvalLevel: 2,
      progressRate: 25,
    }
  });

  console.log('✅ プロジェクト作成完了');

  // ========================================
  // フィードバック作成
  // ========================================

  await prisma.feedback.create({
    data: {
      senderId: staff1.id,
      receiverId: hrDirector.id,
      type: 'praise',
      category: 'performance',
      content: '新人教育プログラムの改善により、新人の定着率が大幅に向上しました。素晴らしい取り組みでした。',
      importance: 'high',
      isAnonymous: false,
      status: 'sent',
    }
  });

  console.log('✅ フィードバック作成完了');

  // ========================================
  // 監査ログ作成
  // ========================================

  await prisma.auditLog.createMany({
    data: [
      {
        userId: hrDirector.id,
        action: 'CREATE',
        entityType: 'Notification',
        entityId: 'notif_001',
        newValues: { title: '新しい感染予防ガイドライン' },
      },
      {
        userId: staff1.id,
        action: 'UPDATE',
        entityType: 'Evaluation',
        entityId: 'eval_001',
        oldValues: { status: 'draft' },
        newValues: { status: 'submitted' },
      }
    ]
  });

  console.log('✅ 監査ログ作成完了');

  // ========================================
  // サイドバーメニュー設定
  // ========================================

  // ステーション系メニュー
  await prisma.sidebarMenuConfig.createMany({
    data: [
      {
        menuItemId: 'personal_station',
        menuCategory: 'common',
        menuSubcategory: 'station',
        icon: '🏠',
        label: 'パーソナルステーション',
        path: '/personal-station',
        description: '面談予約、評価、キャリア情報を確認できます',
        isVisible: true,
        displayOrder: 1,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: true,
        adminNotes: 'システム標準項目',
      },
      {
        menuItemId: 'interview_station',
        menuCategory: 'common',
        menuSubcategory: 'station',
        icon: '🤝',
        label: '面談ステーション',
        path: '/interview-station',
        description: '面談予約・履歴を管理できます',
        isVisible: true,
        displayOrder: 2,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: true,
        adminNotes: 'Phase 20実装済み',
      },
      {
        menuItemId: 'career_selection_station',
        menuCategory: 'common',
        menuSubcategory: 'station',
        icon: '💼',
        label: 'キャリア選択ステーション',
        path: '/career-selection-station',
        description: 'キャリアコース選択・変更申請ができます',
        isVisible: true,
        displayOrder: 3,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: true,
        adminNotes: 'Phase 22実装予定',
      },
      {
        menuItemId: 'health_station',
        menuCategory: 'common',
        menuSubcategory: 'station',
        icon: '🩺',
        label: '健康ステーション',
        path: '/health-station',
        description: 'ストレスチェック・健康診断結果を確認',
        isVisible: false,
        displayOrder: 4,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: false,
        adminNotes: 'ベータ版として人事部門のみ先行公開予定。2026年1月から全職員公開予定。',
      },
      {
        menuItemId: 'evaluation_station',
        menuCategory: 'common',
        menuSubcategory: 'station',
        icon: '📊',
        label: '評価ステーション',
        path: '/evaluation-station',
        description: '目標設定・評価・フィードバックを管理できます',
        isVisible: false,
        displayOrder: 5,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: false,
        adminNotes: '評価制度は2025年4月導入予定。人事部門の準備完了後に表示を有効化。',
      },
    ],
  });

  // 情報・設定系メニュー
  await prisma.sidebarMenuConfig.createMany({
    data: [
      {
        menuItemId: 'user_guide',
        menuCategory: 'common',
        menuSubcategory: 'info',
        icon: '📖',
        label: '使い方ガイド',
        path: '/user-guide',
        description: 'VoiceDriveの使い方を確認',
        isVisible: true,
        displayOrder: 10,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: true,
      },
      {
        menuItemId: 'compliance_guide',
        menuCategory: 'common',
        menuSubcategory: 'info',
        icon: '🛡️',
        label: 'コンプライアンス窓口',
        path: '/compliance-guide',
        description: '内部通報・相談窓口',
        isVisible: true,
        displayOrder: 11,
        showOnDesktop: true,
        showOnMobile: false, // スマホのみ非表示
        showOnTablet: true,
        isSystem: true,
      },
      {
        menuItemId: 'notifications',
        menuCategory: 'common',
        menuSubcategory: 'info',
        icon: '🔔',
        label: '通知',
        path: '/notifications',
        description: '新着通知を確認',
        isVisible: true,
        displayOrder: 12,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        showBadge: true,
        badgeType: 'count',
        isSystem: true,
      },
      {
        menuItemId: 'settings',
        menuCategory: 'common',
        menuSubcategory: 'info',
        icon: '⚙️',
        label: '設定',
        path: '/settings',
        description: 'アカウント設定・プライバシー設定',
        isVisible: true,
        displayOrder: 13,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        isSystem: true,
      },
    ],
  });

  // 管理系メニュー
  await prisma.sidebarMenuConfig.createMany({
    data: [
      {
        menuItemId: 'executive_dashboard',
        menuCategory: 'common',
        menuSubcategory: 'management',
        icon: '📊',
        label: 'エグゼクティブダッシュボード',
        path: '/dashboard/executive',
        description: '経営指標・分析レポート',
        isVisible: true,
        displayOrder: 20,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        visibleForLevels: JSON.stringify(['12', '13', '14', '15', '16', '17', '18', 'X']),
        isSystem: true,
      },
      {
        menuItemId: 'system_operations',
        menuCategory: 'common',
        menuSubcategory: 'management',
        icon: '🔧',
        label: 'システム運用',
        path: '/admin/system-operations',
        description: 'システム管理・設定',
        isVisible: true,
        displayOrder: 21,
        showOnDesktop: true,
        showOnMobile: true,
        showOnTablet: true,
        visibleForLevels: JSON.stringify(['X']),
        isSystem: true,
      },
    ],
  });

  console.log('✅ サイドバーメニュー設定作成完了');
  console.log('🎉 データベース初期化完了！');
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });