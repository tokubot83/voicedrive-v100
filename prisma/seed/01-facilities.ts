/**
 * 施設マスターデータ - シードスクリプト
 *
 * 医療チームからの確定情報に基づく3施設の登録
 * - 小原病院
 * - 立神リハビリテーション温泉病院
 * - エスポワール立神
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFacilities() {
  console.log('🏥 施設マスターデータの登録開始...');

  const facilities = [
    {
      facilityCode: 'obara-hospital',
      facilityName: '小原病院',
      facilityType: 'hospital',
      totalStaffCount: 80,
      totalBedCount: 60,
      address: '佐賀県鳥栖市',
      establishedYear: 1950,
      corporationId: 'oharakai',
      isActive: true,
      metadata: {
        description: '地域密着型の急性期病院',
        specialties: ['内科', '外科', 'リハビリテーション'],
        certifications: ['病院機能評価認定'],
        organizationStructure: 'matrix', // マトリクス組織
        votingGroupsEnabled: false // 初期は個別部門運用
      }
    },
    {
      facilityCode: 'tategami-rehabilitation',
      facilityName: '立神リハビリテーション温泉病院',
      facilityType: 'rehabilitation_hospital',
      totalStaffCount: 100,
      totalBedCount: 90,
      address: '佐賀県鳥栖市立神町',
      establishedYear: 1980,
      corporationId: 'oharakai',
      isActive: true,
      metadata: {
        description: 'リハビリテーション専門病院',
        specialties: [
          'リハビリテーション科',
          '温泉療法科',
          '医療療養病棟'
        ],
        certifications: [
          '回復期リハビリテーション病棟',
          '温泉利用プログラム型健康増進施設'
        ],
        organizationStructure: 'functional', // 機能別組織
        votingGroupsEnabled: false
      }
    },
    {
      facilityCode: 'espoir-tategami',
      facilityName: 'エスポワール立神',
      facilityType: 'nursing_home',
      totalStaffCount: 150,
      totalBedCount: 0, // 介護施設のため病床ではなく定員
      address: '佐賀県鳥栖市立神町',
      establishedYear: 2010,
      corporationId: 'oharakai',
      isActive: true,
      metadata: {
        description: '介護老人保健施設',
        specialties: ['介護サービス', 'リハビリテーション'],
        certifications: ['介護老人保健施設認可'],
        organizationStructure: 'simple', // シンプルな組織構造
        votingGroupsEnabled: false,
        capacityType: 'nursing_home_capacity',
        totalCapacity: 100 // 入所定員
      }
    }
  ];

  let createdCount = 0;
  let updatedCount = 0;

  for (const facility of facilities) {
    const existing = await prisma.facility.findUnique({
      where: { facilityCode: facility.facilityCode }
    });

    if (existing) {
      // 既存データを更新
      await prisma.facility.update({
        where: { facilityCode: facility.facilityCode },
        data: {
          ...facility,
          updatedAt: new Date()
        }
      });
      updatedCount++;
      console.log(`  ✏️  ${facility.facilityName} (更新)`);
    } else {
      // 新規登録
      await prisma.facility.create({
        data: facility
      });
      createdCount++;
      console.log(`  ✅ ${facility.facilityName} (新規)`);
    }
  }

  console.log(`\n✨ 施設マスター登録完了: ${createdCount}件新規, ${updatedCount}件更新\n`);

  return { createdCount, updatedCount };
}

// 直接実行の場合
if (require.main === module) {
  seedFacilities()
    .then(() => {
      console.log('✅ 施設シードデータ投入完了');
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
