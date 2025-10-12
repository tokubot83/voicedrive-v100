/**
 * 組織構造マスターデータ - シードスクリプト
 *
 * 医療チームからの確定情報に基づく組織構造の登録
 * - 小原病院: 10部門
 * - 立神リハビリテーション温泉病院: 7部門
 * - エスポワール立神: 6部門
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedOrganizationStructure() {
  console.log('🏢 組織構造マスターデータの登録開始...');

  // ========================================
  // 小原病院（10部門）
  // ========================================
  const obaraOrganizations = [
    {
      facilityCode: 'obara-hospital',
      departmentId: 'nursing_dept_obara',
      departmentName: '看護部',
      departmentType: 'nursing',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 1,
      metadata: {
        staffCount: 25,
        hasSubSections: true,
        sections: ['3階病棟', '4階病棟', '外来'],
        votingScopePattern: 'A', // location_based
        description: '看護部門（病棟・外来）'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'rehabilitation_dept_obara',
      departmentName: 'リハビリテーション科',
      departmentType: 'rehabilitation',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 2,
      metadata: {
        staffCount: 12,
        hasSubSections: false,
        professions: ['理学療法士', '作業療法士', '言語聴覚士'],
        votingScopePattern: 'B', // profession_based
        description: 'リハビリテーション部門'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'medical_support_dept_obara',
      departmentName: '診療支援部',
      departmentType: 'medical_support',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 3,
      metadata: {
        staffCount: 5,
        hasSubSections: false,
        votingScopePattern: 'C', // department_based
        description: '診療支援部門（放射線技師、臨床検査技師等）',
        note: '少数部門のため部門全体で投票'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'pharmacy_dept_obara',
      departmentName: '薬剤部',
      departmentType: 'pharmacy',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 4,
      metadata: {
        staffCount: 3,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '薬剤部門',
        note: '少数部門のため部門全体で投票'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'administration_dept_obara',
      departmentName: '事務部',
      departmentType: 'administration',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 5,
      metadata: {
        staffCount: 8,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '事務部門'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'nutrition_dept_obara',
      departmentName: '栄養科',
      departmentType: 'nutrition',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 6,
      metadata: {
        staffCount: 4,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '栄養管理部門',
        professions: ['管理栄養士', '栄養士']
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'medical_affairs_dept_obara',
      departmentName: '医療情報部',
      departmentType: 'medical_information',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 7,
      metadata: {
        staffCount: 3,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '医療情報・診療情報管理部門'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'outpatient_dept_obara',
      departmentName: '外来',
      departmentType: 'outpatient',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 8,
      metadata: {
        staffCount: 6,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '外来部門'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'ward_dept_obara',
      departmentName: '病棟',
      departmentType: 'ward',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 9,
      metadata: {
        staffCount: 10,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '病棟部門'
      }
    },
    {
      facilityCode: 'obara-hospital',
      departmentId: 'general_affairs_dept_obara',
      departmentName: '総務部',
      departmentType: 'general_affairs',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 10,
      metadata: {
        staffCount: 4,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '総務・人事部門'
      }
    }
  ];

  // ========================================
  // 立神リハビリテーション温泉病院（7部門）
  // ========================================
  const tategamiOrganizations = [
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'rehabilitation_dept_tategami',
      departmentName: 'リハビリテーション部',
      departmentType: 'rehabilitation',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 1,
      metadata: {
        staffCount: 35,
        hasSubSections: false,
        professions: ['理学療法士', '作業療法士', '言語聴覚士'],
        votingScopePattern: 'B', // profession_based
        description: 'リハビリテーション専門部門'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'nursing_dept_tategami',
      departmentName: '看護部',
      departmentType: 'nursing',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 2,
      metadata: {
        staffCount: 30,
        hasSubSections: true,
        sections: ['1階病棟', '2階病棟', '3階病棟'],
        votingScopePattern: 'A', // location_based
        description: '看護部門'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'medical_ward_dept_tategami',
      departmentName: '医療療養病棟',
      departmentType: 'medical_ward',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 3,
      metadata: {
        staffCount: 12,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '医療療養病棟'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'spa_therapy_dept_tategami',
      departmentName: '温泉療法科',
      departmentType: 'spa_therapy',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 4,
      metadata: {
        staffCount: 8,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '温泉療法専門部門'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'management_dept_tategami',
      departmentName: '経営管理',
      departmentType: 'management',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 5,
      metadata: {
        staffCount: 8,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '経営管理部門'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'nutrition_dept_tategami',
      departmentName: '栄養科',
      departmentType: 'nutrition',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 6,
      metadata: {
        staffCount: 4,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '栄養管理部門'
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      departmentId: 'support_staff_dept_tategami',
      departmentName: '支援スタッフ',
      departmentType: 'support_staff',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 7,
      metadata: {
        staffCount: 3,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '支援スタッフ部門'
      }
    }
  ];

  // ========================================
  // エスポワール立神（6部門）
  // ========================================
  const espoirOrganizations = [
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'nursing_care_dept_espoir',
      departmentName: '介護部',
      departmentType: 'nursing_care',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 1,
      metadata: {
        staffCount: 60,
        hasSubSections: true,
        sections: ['1階フロア', '2階フロア', '3階フロア'],
        votingScopePattern: 'A', // location_based
        description: '介護部門',
        professions: ['介護福祉士', '介護職員']
      }
    },
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'rehabilitation_dept_espoir',
      departmentName: 'リハビリテーション部',
      departmentType: 'rehabilitation',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 2,
      metadata: {
        staffCount: 25,
        hasSubSections: false,
        professions: ['理学療法士', '作業療法士'],
        votingScopePattern: 'B', // profession_based
        description: 'リハビリテーション部門'
      }
    },
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'care_management_dept_espoir',
      departmentName: '支援相談部',
      departmentType: 'care_management',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 3,
      metadata: {
        staffCount: 12,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '支援相談・ケアマネジメント部門',
        professions: ['ケアマネージャー', '社会福祉士']
      }
    },
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'nutrition_dept_espoir',
      departmentName: '栄養科',
      departmentType: 'nutrition',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 4,
      metadata: {
        staffCount: 8,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '栄養管理部門'
      }
    },
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'administration_dept_espoir',
      departmentName: '事務部',
      departmentType: 'administration',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 5,
      metadata: {
        staffCount: 20,
        hasSubSections: false,
        votingScopePattern: 'C',
        description: '事務管理部門'
      }
    },
    {
      facilityCode: 'espoir-tategami',
      departmentId: 'nursing_dept_espoir',
      departmentName: '看護部',
      departmentType: 'nursing',
      sectionId: null,
      sectionName: null,
      votingGroupId: null,
      isActive: true,
      sortOrder: 6,
      metadata: {
        staffCount: 25,
        hasSubSections: true,
        sections: ['1階フロア', '2階フロア', '3階フロア'],
        votingScopePattern: 'A', // location_based
        description: '看護部門'
      }
    }
  ];

  const allOrganizations = [
    ...obaraOrganizations,
    ...tategamiOrganizations,
    ...espoirOrganizations
  ];

  let createdCount = 0;
  let updatedCount = 0;

  for (const org of allOrganizations) {
    const existing = await prisma.organizationStructure.findUnique({
      where: { departmentId: org.departmentId }
    });

    if (existing) {
      await prisma.organizationStructure.update({
        where: { departmentId: org.departmentId },
        data: {
          ...org,
          updatedAt: new Date()
        }
      });
      updatedCount++;
      console.log(`  ✏️  ${org.facilityCode} - ${org.departmentName} (更新)`);
    } else {
      await prisma.organizationStructure.create({
        data: org
      });
      createdCount++;
      console.log(`  ✅ ${org.facilityCode} - ${org.departmentName} (新規)`);
    }
  }

  console.log(`\n✨ 組織構造マスター登録完了: ${createdCount}件新規, ${updatedCount}件更新`);
  console.log(`   📊 内訳: 小原病院 ${obaraOrganizations.length}部門, 立神リハビリ ${tategamiOrganizations.length}部門, エスポワール立神 ${espoirOrganizations.length}部門\n`);

  return { createdCount, updatedCount };
}

// 直接実行の場合
if (require.main === module) {
  seedOrganizationStructure()
    .then(() => {
      console.log('✅ 組織構造シードデータ投入完了');
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
