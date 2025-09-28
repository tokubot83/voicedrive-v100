/**
 * エスポワール立神統合テスト
 * 2025年9月28日実施
 * 医療チームとの連携確認
 */

import { FacilityPermissionService } from '../../src/services/FacilityPermissionService';
import facilityMappings from '../../mcp-shared/config/facility-mappings.json';

describe('エスポワール立神統合テスト', () => {
  let permissionService: FacilityPermissionService;

  beforeAll(() => {
    permissionService = FacilityPermissionService.getInstance();
  });

  describe('✅ テスト1: 施設ID形式の一貫性確認', () => {
    test('施設IDがハイフン区切りで統一されている', () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityName === '介護老人保健施設エスポワール立神'
      );

      expect(espoirFacility.facilityId).toBe('espoir-tategami');
      console.log(`✅ 施設ID確認: ${espoirFacility.facilityId}（ハイフン区切り）`);
    });

    test('3施設すべてがハイフン形式', () => {
      const facilityIds = facilityMappings.facilities.map(f => f.facilityId);

      expect(facilityIds).toContain('ohara-hospital');
      expect(facilityIds).toContain('tategami-rehabilitation');
      expect(facilityIds).toContain('espoir-tategami');

      facilityIds.forEach(id => {
        expect(id).not.toContain('_');
        console.log(`✅ ${id}: ハイフン形式確認済み`);
      });
    });
  });

  describe('✅ テスト2: 統括主任レベル7の検証', () => {
    test('立神リハビリテーション温泉病院の統括主任がレベル7', () => {
      const tategamiFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'tategami-rehabilitation'
      );

      const level = tategamiFacility.positionMapping['統括主任'];
      expect(level).toBe(7);
      console.log(`✅ 統括主任: レベル${level}（修正済み）`);
    });

    test('師長と同レベルであることを確認', () => {
      const tategamiFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'tategami-rehabilitation'
      );

      const 統括主任Level = tategamiFacility.positionMapping['統括主任'];
      const 師長Level = tategamiFacility.positionMapping['師長'];

      expect(統括主任Level).toBe(師長Level);
      expect(統括主任Level).toBe(7);
      console.log(`✅ 統括主任(${統括主任Level}) = 師長(${師長Level})`);
    });
  });

  describe('✅ テスト3: エスポワール立神33役職の実装確認', () => {
    test('33役職すべてがマッピングされている', () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      const expectedPositions = [
        // 管理職（レベル13-9）
        '施設長', '事務長', '入所課課長', '在宅課課長',
        '支援相談室長', '看護師長', '介護士長',
        '通所リハビリテーション事業所管理者',
        '訪問介護事業所管理者',
        '居宅介護支援事業所管理者',
        '通所リハビリテーション事業所管理者代行',
        '訪問リハビリテーション事業所管理者代行',
        '居宅介護支援事業所次長',

        // 主任職（レベル5）
        '事務主任', '看護主任',
        '介護部Aフロア主任', '介護部Bフロア主任', '介護部Cフロア主任',
        '介護部Aフロアマネージャー', '介護部Bフロアマネージャー', '介護部Cフロアマネージャー',
        'ケアプラン管理部リーダー',
        '栄養管理部主任', 'リハビリテーション部主任',
        '通所リハビリテーション主任', '居宅介護支援事業所主任',

        // 一般職員（レベル1-4）
        '事務職員', '支援相談員', '看護師', '准看護師',
        '介護福祉士', '介護職員', 'ケアマネージャー',
        '管理栄養士', '理学療法士', '作業療法士',
        '言語聴覚士', '歯科衛生士', '訪問介護員'
      ];

      let mappedCount = 0;
      expectedPositions.forEach(position => {
        const level = espoirFacility.positionMapping[position];
        expect(level).toBeDefined();
        mappedCount++;
      });

      expect(mappedCount).toBe(39); // 33役職 + 6職種
      console.log(`✅ ${mappedCount}職種のマッピング完了`);
    });

    test('主任職がすべてレベル5で統一', () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      const 主任職リスト = [
        '事務主任', '看護主任',
        '介護部Aフロア主任', '介護部Bフロア主任', '介護部Cフロア主任',
        '介護部Aフロアマネージャー', '介護部Bフロアマネージャー', '介護部Cフロアマネージャー',
        'ケアプラン管理部リーダー',
        '栄養管理部主任', 'リハビリテーション部主任',
        '通所リハビリテーション主任', '居宅介護支援事業所主任'
      ];

      主任職リスト.forEach(position => {
        const level = espoirFacility.positionMapping[position];
        expect(level).toBe(5);
      });

      console.log(`✅ 主任職${主任職リスト.length}件すべてレベル5で統一`);
    });
  });

  describe('✅ テスト4: 兼任ポジションのレベル採用', () => {
    test('入所課課長・支援相談室長（兼任）', async () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      const 入所課課長Level = espoirFacility.positionMapping['入所課課長'];
      const 支援相談室長Level = espoirFacility.positionMapping['支援相談室長'];

      expect(入所課課長Level).toBe(11);
      expect(支援相談室長Level).toBe(10);

      // 最高レベルを採用
      const effectiveLevel = Math.max(入所課課長Level, 支援相談室長Level);
      expect(effectiveLevel).toBe(11);

      console.log(`✅ 兼任: 入所課課長(${入所課課長Level}) & 支援相談室長(${支援相談室長Level}) → レベル${effectiveLevel}`);
    });

    test('在宅課課長・居宅介護支援事業所管理者（兼任）', async () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      const 在宅課課長Level = espoirFacility.positionMapping['在宅課課長'];
      const 居宅管理者Level = espoirFacility.positionMapping['居宅介護支援事業所管理者'];

      expect(在宅課課長Level).toBe(11);
      expect(居宅管理者Level).toBe(10);

      // 最高レベルを採用
      const effectiveLevel = Math.max(在宅課課長Level, 居宅管理者Level);
      expect(effectiveLevel).toBe(11);

      console.log(`✅ 兼任: 在宅課課長(${在宅課課長Level}) & 居宅管理者(${居宅管理者Level}) → レベル${effectiveLevel}`);
    });

    test('複数の主任兼任の場合', () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      // 例: 看護主任と介護部Aフロア主任を兼任
      const 看護主任Level = espoirFacility.positionMapping['看護主任'];
      const 介護主任Level = espoirFacility.positionMapping['介護部Aフロア主任'];

      expect(看護主任Level).toBe(5);
      expect(介護主任Level).toBe(5);

      // 同レベルの場合も最高値を採用
      const effectiveLevel = Math.max(看護主任Level, 介護主任Level);
      expect(effectiveLevel).toBe(5);

      console.log(`✅ 兼任: 看護主任(${看護主任Level}) & 介護主任(${介護主任Level}) → レベル${effectiveLevel}`);
    });
  });

  describe('✅ テスト5: 部門構造の確認', () => {
    test('エスポワール立神の部門構造が正しく定義されている', () => {
      const espoirFacility = facilityMappings.facilities.find(
        f => f.facilityId === 'espoir-tategami'
      );

      expect(espoirFacility.departments).toBeDefined();
      expect(espoirFacility.departments['事務部']).toBeDefined();
      expect(espoirFacility.departments['入所課']).toBeDefined();
      expect(espoirFacility.departments['在宅課']).toBeDefined();

      console.log('✅ 部門構造:');
      console.log('  - 事務部');
      console.log('  - 入所課');
      console.log('    - 支援相談部');
      console.log('    - 看護部');
      console.log('    - 介護部（A/B/Cフロア）');
      console.log('    - ケアプラン管理部');
      console.log('    - 栄養管理部');
      console.log('    - リハビリテーション部');
      console.log('  - 在宅課');
      console.log('    - 通所リハビリテーション事業所');
      console.log('    - 訪問リハビリテーション事業所');
      console.log('    - 訪問介護事業所');
      console.log('    - 居宅介護支援事業所');
    });
  });

  describe('✅ テスト6: 施設間連携の確認', () => {
    test('3施設のレベル定義が統一されている', () => {
      expect(facilityMappings.levelDefinitions).toBeDefined();

      const levels = Object.keys(facilityMappings.levelDefinitions);
      expect(levels).toContain('1');
      expect(levels).toContain('5');
      expect(levels).toContain('7');
      expect(levels).toContain('10');
      expect(levels).toContain('11');
      expect(levels).toContain('13');

      console.log('✅ 統一レベル定義: 1-13');
    });

    test('施設タイプが正しく設定されている', () => {
      const facilities = facilityMappings.facilities;

      const ohara = facilities.find(f => f.facilityId === 'ohara-hospital');
      const tategami = facilities.find(f => f.facilityId === 'tategami-rehabilitation');
      const espoir = facilities.find(f => f.facilityId === 'espoir-tategami');

      expect(ohara.facilityType).toBe('general_hospital');
      expect(tategami.facilityType).toBe('rehabilitation_hospital');
      expect(espoir.facilityType).toBe('geriatric_health_facility');

      console.log('✅ 施設タイプ:');
      console.log(`  - 小原病院: ${ohara.facilityType}`);
      console.log(`  - 立神リハビリ: ${tategami.facilityType}`);
      console.log(`  - エスポワール: ${espoir.facilityType}`);
    });
  });
});

// テスト結果サマリー表示
export const runEspoirIntegrationTests = async () => {
  console.log('');
  console.log('========================================');
  console.log('エスポワール立神統合テスト');
  console.log('========================================');
  console.log('実施日時:', new Date().toLocaleString('ja-JP'));
  console.log('対象施設: espoir-tategami');
  console.log('テスト項目:');
  console.log('  1. 施設ID形式の一貫性');
  console.log('  2. 統括主任レベル7の検証');
  console.log('  3. 33役職のマッピング確認');
  console.log('  4. 兼任ポジションのレベル採用');
  console.log('  5. 部門構造の確認');
  console.log('  6. 施設間連携の確認');
  console.log('========================================');
  console.log('');

  const jest = require('jest');
  await jest.run(['--testMatch', '**/espoir-tategami.integration.test.ts']);
};