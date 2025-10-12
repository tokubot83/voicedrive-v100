/**
 * 議題モード設定 - シードスクリプト
 *
 * 医療チームからの確定情報に基づく各部門の議題モード設定
 * - スコア閾値: デフォルト値を採用
 * - 投票スコープ: パターンA/B/Cに応じた設定
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// デフォルトスコア閾値（医療チーム承認済み）
const DEFAULT_SCORE_THRESHOLDS = {
  pending: 30,           // 0-29点: 検討中
  deptReview: 50,        // 30-49点: 部署検討
  deptAgenda: 100,       // 50-99点: 部署議題
  facilityAgenda: 300,   // 100-299点: 施設議題
  corpReview: 600,       // 300-599点: 法人検討
  corpAgenda: 1000       // 600点以上: 法人議題
};

export async function seedAgendaModeConfigs() {
  console.log('⚙️  議題モード設定の登録開始...');

  // ========================================
  // パターンA: location_based（配置先単位）
  // 看護部門向け - 病棟・外来単位で投票
  // ========================================
  const patternA_VotingScopeRules = {
    scopeType: 'location_based',
    description: '配置先（病棟・外来等）単位での段階的投票権拡大',
    rules: [
      {
        scoreRange: '0-29',
        level: 'PENDING',
        scope: 'section',
        scopeDescription: '配置先（病棟・外来等）のみ',
        criteria: ['sectionId'],
        example: '3階病棟の看護師のみ投票可能'
      },
      {
        scoreRange: '30-99',
        level: 'DEPT_REVIEW_AND_AGENDA',
        scope: 'department',
        scopeDescription: '部門全体',
        criteria: ['departmentId'],
        example: '看護部全体で投票可能'
      },
      {
        scoreRange: '100-299',
        level: 'FACILITY_AGENDA',
        scope: 'facility',
        scopeDescription: '施設全体',
        criteria: ['facilityCode'],
        example: '施設内全職員が投票可能'
      },
      {
        scoreRange: '300+',
        level: 'CORP_LEVEL',
        scope: 'corporation',
        scopeDescription: '法人全体',
        criteria: ['corporationId'],
        example: '法人内全職員が投票可能'
      }
    ]
  };

  // ========================================
  // パターンB: profession_based（職種単位）
  // リハビリテーション部門向け - PT/OT/ST単位で投票
  // ========================================
  const patternB_VotingScopeRules = {
    scopeType: 'profession_based',
    description: '職種（PT/OT/ST等）単位での段階的投票権拡大',
    rules: [
      {
        scoreRange: '0-29',
        level: 'PENDING',
        scope: 'profession',
        scopeDescription: '同一職種のみ',
        criteria: ['jobCategoryCode'],
        example: '理学療法士（PT）のみ投票可能'
      },
      {
        scoreRange: '30-99',
        level: 'DEPT_REVIEW_AND_AGENDA',
        scope: 'department',
        scopeDescription: '部門全体（全職種）',
        criteria: ['departmentId'],
        example: 'リハビリ部門全体（PT/OT/ST）で投票可能'
      },
      {
        scoreRange: '100-299',
        level: 'FACILITY_AGENDA',
        scope: 'facility',
        scopeDescription: '施設全体',
        criteria: ['facilityCode'],
        example: '施設内全職員が投票可能'
      },
      {
        scoreRange: '300+',
        level: 'CORP_LEVEL',
        scope: 'corporation',
        scopeDescription: '法人全体',
        criteria: ['corporationId'],
        example: '法人内全職員が投票可能'
      }
    ]
  };

  // ========================================
  // パターンC: department_based（部門単位）
  // 少数部門向け - 最初から部門全体で投票
  // ========================================
  const patternC_VotingScopeRules = {
    scopeType: 'department_based',
    description: '部門単位での投票（少数部門向け）',
    rules: [
      {
        scoreRange: '0-99',
        level: 'DEPT_ALL_LEVELS',
        scope: 'department',
        scopeDescription: '部門全体（最初から）',
        criteria: ['departmentId'],
        example: '部門全体で最初から投票可能'
      },
      {
        scoreRange: '100-299',
        level: 'FACILITY_AGENDA',
        scope: 'facility',
        scopeDescription: '施設全体',
        criteria: ['facilityCode'],
        example: '施設内全職員が投票可能'
      },
      {
        scoreRange: '300+',
        level: 'CORP_LEVEL',
        scope: 'corporation',
        scopeDescription: '法人全体',
        criteria: ['corporationId'],
        example: '法人内全職員が投票可能'
      }
    ]
  };

  // ========================================
  // 議題モード設定データ
  // ========================================
  const agendaModeConfigs = [
    // 小原病院（10部門）
    {
      id: 'amc_nursing_obara',
      departmentId: 'nursing_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternA_VotingScopeRules, // パターンA
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_rehabilitation_obara',
      departmentId: 'rehabilitation_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternB_VotingScopeRules, // パターンB
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_medical_support_obara',
      departmentId: 'medical_support_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules, // パターンC
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_pharmacy_obara',
      departmentId: 'pharmacy_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_administration_obara',
      departmentId: 'administration_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_nutrition_obara',
      departmentId: 'nutrition_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_medical_affairs_obara',
      departmentId: 'medical_affairs_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_outpatient_obara',
      departmentId: 'outpatient_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_ward_obara',
      departmentId: 'ward_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_general_affairs_obara',
      departmentId: 'general_affairs_dept_obara',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },

    // 立神リハビリテーション温泉病院（7部門）
    {
      id: 'amc_rehabilitation_tategami',
      departmentId: 'rehabilitation_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternB_VotingScopeRules, // パターンB
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_nursing_tategami',
      departmentId: 'nursing_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternA_VotingScopeRules, // パターンA
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_medical_ward_tategami',
      departmentId: 'medical_ward_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules, // パターンC
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_spa_therapy_tategami',
      departmentId: 'spa_therapy_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_management_tategami',
      departmentId: 'management_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_nutrition_tategami',
      departmentId: 'nutrition_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_support_staff_tategami',
      departmentId: 'support_staff_dept_tategami',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },

    // エスポワール立神（6部門）
    {
      id: 'amc_nursing_care_espoir',
      departmentId: 'nursing_care_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternA_VotingScopeRules, // パターンA
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_rehabilitation_espoir',
      departmentId: 'rehabilitation_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternB_VotingScopeRules, // パターンB
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_care_management_espoir',
      departmentId: 'care_management_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules, // パターンC
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_nutrition_espoir',
      departmentId: 'nutrition_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_administration_espoir',
      departmentId: 'administration_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternC_VotingScopeRules,
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    },
    {
      id: 'amc_nursing_espoir',
      departmentId: 'nursing_dept_espoir',
      ...DEFAULT_SCORE_THRESHOLDS,
      votingScopeRules: patternA_VotingScopeRules, // パターンA
      committeeSubmissionEnabled: true,
      committeeSubmissionThreshold: 100,
      isActive: true
    }
  ];

  let createdCount = 0;
  let updatedCount = 0;
  let patternACount = 0;
  let patternBCount = 0;
  let patternCCount = 0;

  for (const config of agendaModeConfigs) {
    // パターン統計
    const scopeType = config.votingScopeRules.scopeType;
    if (scopeType === 'location_based') patternACount++;
    else if (scopeType === 'profession_based') patternBCount++;
    else if (scopeType === 'department_based') patternCCount++;

    const existing = await prisma.agendaModeConfig.findUnique({
      where: { departmentId: config.departmentId }
    });

    if (existing) {
      await prisma.agendaModeConfig.update({
        where: { departmentId: config.departmentId },
        data: {
          ...config,
          updatedAt: new Date()
        }
      });
      updatedCount++;
      console.log(`  ✏️  ${config.departmentId} - ${scopeType} (更新)`);
    } else {
      await prisma.agendaModeConfig.create({
        data: config
      });
      createdCount++;
      console.log(`  ✅ ${config.departmentId} - ${scopeType} (新規)`);
    }
  }

  console.log(`\n✨ 議題モード設定登録完了: ${createdCount}件新規, ${updatedCount}件更新`);
  console.log(`   📊 投票スコープパターン内訳:`);
  console.log(`      - パターンA (location_based): ${patternACount}部門`);
  console.log(`      - パターンB (profession_based): ${patternBCount}部門`);
  console.log(`      - パターンC (department_based): ${patternCCount}部門\n`);

  return {
    createdCount,
    updatedCount,
    patternACount,
    patternBCount,
    patternCCount
  };
}

// 直接実行の場合
if (require.main === module) {
  seedAgendaModeConfigs()
    .then(() => {
      console.log('✅ 議題モード設定シードデータ投入完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ エラー発生:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
