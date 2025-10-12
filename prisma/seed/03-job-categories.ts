/**
 * 職種マスターデータ - シードスクリプト
 *
 * 医療チームからの確定情報に基づく職種の登録
 * 既存職種 + 追加依頼5職種を含む
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedJobCategories() {
  console.log('👨‍⚕️ 職種マスターデータの登録開始...');

  const jobCategories = [
    // ========================================
    // 医師系
    // ========================================
    {
      jobCategoryCode: 'doctor',
      jobCategoryName: '医師',
      jobCategoryGroup: 'medical',
      requiresLicense: true,
      sortOrder: 1,
      isActive: true,
      metadata: {
        licenseType: '医師免許',
        description: '診療・治療を行う医師'
      }
    },

    // ========================================
    // 看護系
    // ========================================
    {
      jobCategoryCode: 'nurse',
      jobCategoryName: '看護師',
      jobCategoryGroup: 'nursing',
      requiresLicense: true,
      sortOrder: 10,
      isActive: true,
      metadata: {
        licenseType: '看護師免許',
        description: '患者の看護を行う'
      }
    },
    {
      jobCategoryCode: 'assistant_nurse',
      jobCategoryName: '准看護師',
      jobCategoryGroup: 'nursing',
      requiresLicense: true,
      sortOrder: 11,
      isActive: true,
      metadata: {
        licenseType: '准看護師免許',
        description: '医師・看護師の指示のもと看護を行う'
      }
    },
    {
      jobCategoryCode: 'nursing_assistant',
      jobCategoryName: '看護補助者',
      jobCategoryGroup: 'nursing',
      requiresLicense: false,
      sortOrder: 12,
      isActive: true,
      metadata: {
        description: '看護師の補助業務を行う'
      }
    },

    // ========================================
    // リハビリテーション系
    // ========================================
    {
      jobCategoryCode: 'physical_therapist',
      jobCategoryName: '理学療法士',
      jobCategoryGroup: 'rehabilitation',
      requiresLicense: true,
      sortOrder: 20,
      isActive: true,
      metadata: {
        licenseType: '理学療法士免許',
        abbreviation: 'PT',
        description: '運動療法・物理療法を行う'
      }
    },
    {
      jobCategoryCode: 'occupational_therapist',
      jobCategoryName: '作業療法士',
      jobCategoryGroup: 'rehabilitation',
      requiresLicense: true,
      sortOrder: 21,
      isActive: true,
      metadata: {
        licenseType: '作業療法士免許',
        abbreviation: 'OT',
        description: '作業活動を通じた機能回復訓練を行う'
      }
    },
    {
      jobCategoryCode: 'speech_therapist',
      jobCategoryName: '言語聴覚士',
      jobCategoryGroup: 'rehabilitation',
      requiresLicense: true,
      sortOrder: 22,
      isActive: true,
      metadata: {
        licenseType: '言語聴覚士免許',
        abbreviation: 'ST',
        description: '言語・聴覚・嚥下のリハビリを行う'
      }
    },

    // ========================================
    // 介護系（新規追加）
    // ========================================
    {
      jobCategoryCode: 'certified_care_worker',
      jobCategoryName: '介護福祉士',
      jobCategoryGroup: 'nursing_care',
      requiresLicense: true,
      sortOrder: 30,
      isActive: true,
      metadata: {
        licenseType: '介護福祉士資格',
        description: '専門的な介護業務を行う国家資格保持者',
        addedDate: '2025-10-12',
        requestedBy: 'medical_team'
      }
    },
    {
      jobCategoryCode: 'care_worker',
      jobCategoryName: '介護職員',
      jobCategoryGroup: 'nursing_care',
      requiresLicense: false,
      sortOrder: 31,
      isActive: true,
      metadata: {
        description: '介護業務全般を行う職員'
      }
    },

    // ========================================
    // 相談・支援系（新規追加）
    // ========================================
    {
      jobCategoryCode: 'care_manager',
      jobCategoryName: 'ケアマネージャー',
      jobCategoryGroup: 'care_management',
      requiresLicense: true,
      sortOrder: 40,
      isActive: true,
      metadata: {
        licenseType: '介護支援専門員資格',
        description: 'ケアプラン作成・介護サービス調整を行う',
        addedDate: '2025-10-12',
        requestedBy: 'medical_team'
      }
    },
    {
      jobCategoryCode: 'social_worker',
      jobCategoryName: '社会福祉士',
      jobCategoryGroup: 'care_management',
      requiresLicense: true,
      sortOrder: 41,
      isActive: true,
      metadata: {
        licenseType: '社会福祉士資格',
        abbreviation: 'SW',
        description: '福祉相談・支援を行う',
        addedDate: '2025-10-12',
        requestedBy: 'medical_team'
      }
    },
    {
      jobCategoryCode: 'msw',
      jobCategoryName: '医療ソーシャルワーカー',
      jobCategoryGroup: 'care_management',
      requiresLicense: true,
      sortOrder: 42,
      isActive: true,
      metadata: {
        licenseType: '社会福祉士資格',
        abbreviation: 'MSW',
        description: '医療機関での患者・家族の相談支援を行う'
      }
    },

    // ========================================
    // 栄養系（新規追加）
    // ========================================
    {
      jobCategoryCode: 'registered_dietitian',
      jobCategoryName: '管理栄養士',
      jobCategoryGroup: 'nutrition',
      requiresLicense: true,
      sortOrder: 50,
      isActive: true,
      metadata: {
        licenseType: '管理栄養士免許',
        description: '栄養管理・指導を行う上級資格',
        addedDate: '2025-10-12',
        requestedBy: 'medical_team'
      }
    },
    {
      jobCategoryCode: 'dietitian',
      jobCategoryName: '栄養士',
      jobCategoryGroup: 'nutrition',
      requiresLicense: true,
      sortOrder: 51,
      isActive: true,
      metadata: {
        licenseType: '栄養士免許',
        description: '栄養業務全般を行う',
        addedDate: '2025-10-12',
        requestedBy: 'medical_team'
      }
    },

    // ========================================
    // 医療技術系
    // ========================================
    {
      jobCategoryCode: 'pharmacist',
      jobCategoryName: '薬剤師',
      jobCategoryGroup: 'medical_technology',
      requiresLicense: true,
      sortOrder: 60,
      isActive: true,
      metadata: {
        licenseType: '薬剤師免許',
        description: '調剤・服薬指導を行う'
      }
    },
    {
      jobCategoryCode: 'radiologist',
      jobCategoryName: '診療放射線技師',
      jobCategoryGroup: 'medical_technology',
      requiresLicense: true,
      sortOrder: 61,
      isActive: true,
      metadata: {
        licenseType: '診療放射線技師免許',
        description: '放射線検査・治療を行う'
      }
    },
    {
      jobCategoryCode: 'clinical_technologist',
      jobCategoryName: '臨床検査技師',
      jobCategoryGroup: 'medical_technology',
      requiresLicense: true,
      sortOrder: 62,
      isActive: true,
      metadata: {
        licenseType: '臨床検査技師免許',
        description: '臨床検査業務を行う'
      }
    },

    // ========================================
    // 事務・管理系
    // ========================================
    {
      jobCategoryCode: 'medical_clerk',
      jobCategoryName: '医療事務',
      jobCategoryGroup: 'administration',
      requiresLicense: false,
      sortOrder: 70,
      isActive: true,
      metadata: {
        description: '医療事務業務を行う'
      }
    },
    {
      jobCategoryCode: 'him',
      jobCategoryName: '診療情報管理士',
      jobCategoryGroup: 'administration',
      requiresLicense: false,
      sortOrder: 71,
      isActive: true,
      metadata: {
        certificationType: '認定資格',
        abbreviation: 'HIM',
        description: '診療記録管理・データ分析を行う'
      }
    },
    {
      jobCategoryCode: 'general_clerk',
      jobCategoryName: '一般事務',
      jobCategoryGroup: 'administration',
      requiresLicense: false,
      sortOrder: 72,
      isActive: true,
      metadata: {
        description: '一般事務業務を行う'
      }
    },
    {
      jobCategoryCode: 'manager',
      jobCategoryName: '管理職',
      jobCategoryGroup: 'management',
      requiresLicense: false,
      sortOrder: 80,
      isActive: true,
      metadata: {
        description: '管理業務を行う'
      }
    },

    // ========================================
    // その他
    // ========================================
    {
      jobCategoryCode: 'support_staff',
      jobCategoryName: '支援スタッフ',
      jobCategoryGroup: 'support',
      requiresLicense: false,
      sortOrder: 90,
      isActive: true,
      metadata: {
        description: '各種支援業務を行うスタッフ'
      }
    }
  ];

  let createdCount = 0;
  let updatedCount = 0;
  let addedCount = 0;

  for (const jobCategory of jobCategories) {
    const existing = await prisma.jobCategory.findUnique({
      where: { jobCategoryCode: jobCategory.jobCategoryCode }
    });

    if (existing) {
      await prisma.jobCategory.update({
        where: { jobCategoryCode: jobCategory.jobCategoryCode },
        data: {
          ...jobCategory,
          updatedAt: new Date()
        }
      });
      updatedCount++;
      console.log(`  ✏️  ${jobCategory.jobCategoryName} (更新)`);
    } else {
      await prisma.jobCategory.create({
        data: jobCategory
      });
      createdCount++;

      // 新規追加された職種をカウント
      if (jobCategory.metadata && 'addedDate' in jobCategory.metadata) {
        addedCount++;
        console.log(`  🆕 ${jobCategory.jobCategoryName} (新規追加 - 医療チーム依頼)`);
      } else {
        console.log(`  ✅ ${jobCategory.jobCategoryName} (新規)`);
      }
    }
  }

  console.log(`\n✨ 職種マスター登録完了: ${createdCount}件新規, ${updatedCount}件更新`);
  console.log(`   📋 新規追加職種: ${addedCount}件（医療チームからの依頼分）\n`);

  return { createdCount, updatedCount, addedCount };
}

// 直接実行の場合
if (require.main === module) {
  seedJobCategories()
    .then(() => {
      console.log('✅ 職種シードデータ投入完了');
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
