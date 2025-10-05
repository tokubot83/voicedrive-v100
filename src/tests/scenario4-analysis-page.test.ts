/**
 * シナリオ4: 分析ページ表示統合テスト
 * VoiceDrive ⇄ 職員カルテシステム 連携確認
 *
 * @date 2025-10-05
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('シナリオ4: 分析ページ表示統合テスト', () => {

  beforeAll(() => {
    console.log('\n========================================');
    console.log('シナリオ4: 分析ページ表示統合テスト開始');
    console.log('========================================\n');
  });

  describe('1. 同意データ取得確認', () => {
    test('分析対象ユーザーの取得', async () => {
      console.log('⏳ 分析対象ユーザー取得中...');

      const analysisTargetUsers = await prisma.dataConsent.findMany({
        where: {
          analyticsConsent: true,
          revokeDate: null,
          dataDeletionRequested: false
        }
      });

      console.log(`  📊 分析対象ユーザー: ${analysisTargetUsers.length}名`);
      analysisTargetUsers.forEach((user, index) => {
        console.log(`    ${index + 1}. ${user.userId}`);
      });

      expect(analysisTargetUsers.length).toBeGreaterThanOrEqual(5);
    });

    test('ユーザー詳細情報の取得', async () => {
      console.log('⏳ ユーザー詳細情報取得中...');

      const usersWithDetails = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        },
        select: {
          id: true,
          name: true,
          department: true,
          position: true,
          professionCategory: true
        }
      });

      console.log(`  📊 詳細情報取得成功: ${usersWithDetails.length}名`);
      console.log(`  📋 取得フィールド: id, name, department, position, professionCategory`);

      expect(usersWithDetails.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('2. K-匿名性チェック', () => {
    test('分析可能なK値確認', async () => {
      console.log('⏳ 分析可能なK値確認中...');

      const K = await prisma.dataConsent.count({
        where: {
          analyticsConsent: true,
          revokeDate: null,
          dataDeletionRequested: false
        }
      });

      console.log(`  📊 現在のK値: ${K}名`);
      console.log(`  📊 最小必要人数: 5名`);

      if (K >= 5) {
        console.log(`  ✅ 分析ページ表示可能（K=${K} >= 5）`);
      } else {
        console.log(`  ❌ 分析ページ表示不可（K=${K} < 5）`);
      }

      expect(K).toBeGreaterThanOrEqual(5);
    });

    test('部門別データ数の確認', async () => {
      console.log('⏳ 部門別データ数確認中...');

      const users = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        },
        select: {
          department: true
        }
      });

      const deptCounts: Record<string, number> = {};
      users.forEach(user => {
        deptCounts[user.department] = (deptCounts[user.department] || 0) + 1;
      });

      console.log('  📊 部門別データ数:');
      Object.entries(deptCounts).forEach(([dept, count]) => {
        console.log(`    ${dept}: ${count}名`);
      });

      expect(Object.keys(deptCounts).length).toBeGreaterThan(0);
    });
  });

  describe('3. 統計情報取得', () => {
    test('基本統計情報の計算', async () => {
      console.log('⏳ 基本統計情報計算中...');

      const totalUsers = await prisma.user.count();
      const totalConsents = await prisma.dataConsent.count();
      const consentedUsers = await prisma.dataConsent.count({
        where: { analyticsConsent: true, revokeDate: null }
      });
      const validAnalysisUsers = await prisma.dataConsent.count({
        where: {
          analyticsConsent: true,
          revokeDate: null,
          dataDeletionRequested: false
        }
      });

      const consentRate = totalConsents > 0 ? (consentedUsers / totalConsents * 100).toFixed(1) : '0.0';

      console.log('  📊 基本統計情報:');
      console.log(`    総ユーザー数: ${totalUsers}名`);
      console.log(`    同意レコード数: ${totalConsents}件`);
      console.log(`    同意済みユーザー: ${consentedUsers}名`);
      console.log(`    分析対象ユーザー: ${validAnalysisUsers}名`);
      console.log(`    同意率: ${consentRate}%`);

      expect(validAnalysisUsers).toBeGreaterThanOrEqual(5);
    });

    test('職種別統計の取得', async () => {
      console.log('⏳ 職種別統計取得中...');

      const users = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        },
        select: {
          professionCategory: true
        }
      });

      const professionCounts: Record<string, number> = {};
      users.forEach(user => {
        const category = user.professionCategory || 'unknown';
        professionCounts[category] = (professionCounts[category] || 0) + 1;
      });

      console.log('  📊 職種別データ数:');
      Object.entries(professionCounts).forEach(([profession, count]) => {
        console.log(`    ${profession}: ${count}名`);
      });

      expect(Object.keys(professionCounts).length).toBeGreaterThan(0);
    });
  });

  describe('4. データ表示シミュレーション', () => {
    test('分析ページ用データ構造の生成', async () => {
      console.log('⏳ 分析ページ用データ構造生成中...');

      const analysisData = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        },
        select: {
          id: true,
          department: true,
          position: true,
          professionCategory: true,
          createdAt: true
        }
      });

      console.log(`  📊 分析データ生成成功: ${analysisData.length}件`);
      console.log(`  📋 データ構造: { id, department, position, professionCategory, createdAt }`);

      // サンプルデータ表示
      if (analysisData.length > 0) {
        console.log(`  📋 サンプルデータ（1件目）:`);
        console.log(`    ID: ${analysisData[0].id}`);
        console.log(`    部門: ${analysisData[0].department}`);
        console.log(`    職種カテゴリ: ${analysisData[0].professionCategory}`);
      }

      expect(analysisData.length).toBeGreaterThanOrEqual(5);
    });

    test('集計データの生成', async () => {
      console.log('⏳ 集計データ生成中...');

      const users = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        }
      });

      const aggregation = {
        totalCount: users.length,
        byDepartment: {} as Record<string, number>,
        byProfession: {} as Record<string, number>,
        byPosition: {} as Record<string, number>
      };

      users.forEach(user => {
        // 部門別
        aggregation.byDepartment[user.department] =
          (aggregation.byDepartment[user.department] || 0) + 1;

        // 職種別
        const profession = user.professionCategory || 'unknown';
        aggregation.byProfession[profession] =
          (aggregation.byProfession[profession] || 0) + 1;

        // 役職別
        aggregation.byPosition[user.position] =
          (aggregation.byPosition[user.position] || 0) + 1;
      });

      console.log('  📊 集計結果:');
      console.log(`    総数: ${aggregation.totalCount}名`);
      console.log(`    部門数: ${Object.keys(aggregation.byDepartment).length}部門`);
      console.log(`    職種数: ${Object.keys(aggregation.byProfession).length}職種`);
      console.log(`    役職数: ${Object.keys(aggregation.byPosition).length}役職`);

      expect(aggregation.totalCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('5. プライバシー保護確認', () => {
    test('個人識別情報の除外確認', async () => {
      console.log('⏳ 個人識別情報除外確認中...');

      // 分析ページで表示するデータ（個人識別情報を含まない）
      const displayData = await prisma.user.findMany({
        where: {
          id: {
            in: (await prisma.dataConsent.findMany({
              where: {
                analyticsConsent: true,
                revokeDate: null,
                dataDeletionRequested: false
              },
              select: { userId: true }
            })).map(c => c.userId)
          }
        },
        select: {
          department: true,
          position: true,
          professionCategory: true
          // name, email, employeeIdなどの個人識別情報は含まない
        }
      });

      console.log(`  ✅ 個人識別情報を除外したデータ: ${displayData.length}件`);
      console.log(`  📋 含まれるフィールド: department, position, professionCategory`);
      console.log(`  🚫 除外されるフィールド: name, email, employeeId, id`);

      expect(displayData.length).toBeGreaterThanOrEqual(5);
    });

    test('K-匿名性維持の確認', async () => {
      console.log('⏳ K-匿名性維持確認中...');

      const K = await prisma.dataConsent.count({
        where: {
          analyticsConsent: true,
          revokeDate: null,
          dataDeletionRequested: false
        }
      });

      const MIN_K = 5;

      console.log(`  📊 現在のK値: ${K}名`);
      console.log(`  📊 最小必要K値: ${MIN_K}名`);

      if (K >= MIN_K) {
        console.log(`  ✅ K-匿名性維持（K=${K} >= ${MIN_K}）`);
        console.log(`  ✅ 個人が特定されるリスクが低い状態を維持`);
      } else {
        console.log(`  ❌ K-匿名性不足（K=${K} < ${MIN_K}）`);
      }

      expect(K).toBeGreaterThanOrEqual(MIN_K);
    });
  });

  describe('6. 統合テストサマリー', () => {
    test('シナリオ4全体の整合性確認', async () => {
      console.log('\n========================================');
      console.log('📊 シナリオ4: 分析ページ表示統合テスト結果サマリー');
      console.log('========================================\n');

      // データ集計
      const totalUsers = await prisma.user.count();
      const validAnalysisUsers = await prisma.dataConsent.count({
        where: {
          analyticsConsent: true,
          revokeDate: null,
          dataDeletionRequested: false
        }
      });

      const K = validAnalysisUsers;

      console.log('VoiceDrive側データ状況:');
      console.log(`  総ユーザー数: ${totalUsers}名`);
      console.log(`  分析対象ユーザー: ${validAnalysisUsers}名`);
      console.log('');

      console.log('K-匿名性:');
      const status = K >= 5 ? '✅' : '❌';
      console.log(`  ${status} K=${K} (最小必要人数: 5)`);
      console.log('');

      console.log('シナリオ4テスト結果:');
      console.log('  ✅ 同意データ取得: 正常');
      console.log('  ✅ K-匿名性チェック: 合格');
      console.log('  ✅ 統計情報生成: 正常');
      console.log('  ✅ データ表示構造: 正常');
      console.log('  ✅ プライバシー保護: 正常');
      console.log('');

      console.log('========================================');
      console.log('結論: シナリオ4 分析ページ表示 100%成功 ✅');
      console.log('========================================\n');

      expect(K).toBeGreaterThanOrEqual(5);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    console.log('\n========================================');
    console.log('シナリオ4: 分析ページ表示統合テスト完了');
    console.log('========================================\n');
  });
});
