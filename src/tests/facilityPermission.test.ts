/**
 * 施設別権限管理 ユニットテスト
 * Phase 3 内部テスト
 */

import { facilityPermissionService } from '../services/FacilityPermissionService';
import { getPermissionLevel, getPositionDisplayName } from '../config/facilityPositionMapping';
import { tategamiTestStaffData, facilityTransferTestCases } from '../data/tategamiTestData';

describe('施設別権限レベル計算テスト', () => {

  beforeEach(() => {
    // キャッシュクリア
    facilityPermissionService.clearAllCache();
  });

  describe('立神リハビリテーション温泉病院の役職マッピング', () => {

    it('院長の権限レベルが13であること', () => {
      const level = getPermissionLevel('tategami_rehabilitation', '院長');
      expect(level).toBe(13);
    });

    it('統括主任の権限レベルが7であること（調整後）', () => {
      const level = getPermissionLevel('tategami_rehabilitation', '統括主任');
      expect(level).toBe(7);  // 6→7に調整済み
    });

    it('総師長の権限レベルが10であること', () => {
      const level = getPermissionLevel('tategami_rehabilitation', '総師長');
      expect(level).toBe(10);
    });

    it('介護主任と看護主任が同じレベル5であること', () => {
      const kaigo = getPermissionLevel('tategami_rehabilitation', '介護主任');
      const kango = getPermissionLevel('tategami_rehabilitation', '看護主任');
      expect(kaigo).toBe(5);
      expect(kango).toBe(5);
      expect(kaigo).toBe(kango);
    });

    it('薬局長の権限レベルが8であること', () => {
      const level = getPermissionLevel('tategami_rehabilitation', '薬局長');
      expect(level).toBe(8);
    });
  });

  describe('施設間権限レベル変換', () => {

    it('小原病院から立神への異動時の権限調整', () => {
      const adjustedLevel = facilityPermissionService.translatePermissionLevel(
        10,  // 小原病院の薬剤部長
        'kohara_hospital',
        'tategami_rehabilitation'
      );
      expect(adjustedLevel).toBe(9);  // 大規模→中規模で-1
    });

    it('立神から小原病院への異動時の権限調整', () => {
      const adjustedLevel = facilityPermissionService.translatePermissionLevel(
        7,  // 立神の統括主任
        'tategami_rehabilitation',
        'kohara_hospital'
      );
      expect(adjustedLevel).toBe(8);  // 中規模→大規模で+1
    });

    it('同規模施設間の異動では権限レベル変更なし', () => {
      const adjustedLevel = facilityPermissionService.translatePermissionLevel(
        5,
        'tategami_rehabilitation',
        'tategami_rehabilitation'
      );
      expect(adjustedLevel).toBe(5);  // 変更なし
    });
  });

  describe('権限キャッシュ管理', () => {

    it('権限レベルがキャッシュされること', async () => {
      const staffId = 'TATE_007';
      const facilityId = 'tategami_rehabilitation';

      // 初回取得
      const level1 = await facilityPermissionService.getEffectivePermissionLevel(
        staffId,
        '統括主任',
        facilityId
      );
      expect(level1).toBe(7);

      // 2回目はキャッシュから取得
      const level2 = await facilityPermissionService.getEffectivePermissionLevel(
        staffId,
        '統括主任',
        facilityId
      );
      expect(level2).toBe(level1);
    });

    it('キャッシュ無効化が機能すること', async () => {
      const staffId = 'TATE_007';
      const facilityId = 'tategami_rehabilitation';

      // 初回取得
      await facilityPermissionService.getEffectivePermissionLevel(
        staffId,
        '統括主任',
        facilityId
      );

      // キャッシュ無効化
      facilityPermissionService.invalidateStaffCache(staffId, facilityId);

      // デバッグ情報確認
      const debug = facilityPermissionService.getDebugInfo();
      expect(debug.cacheSize).toBe(0);
    });
  });

  describe('経験年数による権限レベル計算', () => {

    it('新人（1年未満）がレベル1', () => {
      const level = getPermissionLevel(
        'tategami_rehabilitation',
        '看護師',
        0
      );
      expect(level).toBe(1);
    });

    it('若手（2-3年）がレベル2', () => {
      const level = getPermissionLevel(
        'tategami_rehabilitation',
        '看護師',
        2
      );
      expect(level).toBe(2);
    });

    it('中堅（4-10年）がレベル3', () => {
      const level = getPermissionLevel(
        'tategami_rehabilitation',
        '看護師',
        5
      );
      expect(level).toBe(3);
    });

    it('ベテラン（11年以上）がレベル4', () => {
      const level = getPermissionLevel(
        'tategami_rehabilitation',
        '看護師',
        15
      );
      expect(level).toBe(4);
    });

    it('リーダー業務可能な看護師は+0.5', () => {
      const level = getPermissionLevel(
        'tategami_rehabilitation',
        '看護師',
        5,
        true  // リーダー業務可
      );
      expect(level).toBe(3.5);
    });
  });

  describe('施設別役職表示名', () => {

    it('立神の総師長が正しく表示される', () => {
      const displayName = getPositionDisplayName(
        'tategami_rehabilitation',
        '総師長'
      );
      expect(displayName).toBe('総師長');
    });

    it('小原病院の看護部長が正しく表示される', () => {
      const displayName = getPositionDisplayName(
        'kohara_hospital',
        '看護部長'
      );
      expect(displayName).toBe('看護部長');
    });

    it('存在しない役職はそのまま返される', () => {
      const displayName = getPositionDisplayName(
        'tategami_rehabilitation',
        '存在しない役職'
      );
      expect(displayName).toBe('存在しない役職');
    });
  });

  describe('施設別権限の取得', () => {

    it('立神の全役職リストが取得できる', () => {
      const positions = facilityPermissionService.getFacilityPositions(
        'tategami_rehabilitation'
      );

      expect(positions).toContainEqual(
        expect.objectContaining({
          position: '院長',
          permissionLevel: 13
        })
      );

      expect(positions).toContainEqual(
        expect.objectContaining({
          position: '統括主任',
          permissionLevel: 7
        })
      );

      // 権限レベル降順でソートされていること
      const levels = positions.map(p => p.permissionLevel);
      const sortedLevels = [...levels].sort((a, b) => b - a);
      expect(levels).toEqual(sortedLevels);
    });

    it('推奨役職が正しく取得できる', () => {
      const suggestions = facilityPermissionService.getSuggestedPositions(
        'tategami_rehabilitation',
        7  // レベル7付近の役職
      );

      const suggestedPositions = suggestions.map(s => s.position);
      expect(suggestedPositions).toContain('統括主任');
      expect(suggestedPositions).toContain('師長');
    });
  });
});

describe('施設間異動シナリオテスト', () => {

  facilityTransferTestCases.forEach(testCase => {
    it(testCase.description, () => {
      const adjustedLevel = facilityPermissionService.translatePermissionLevel(
        testCase.fromLevel,
        testCase.fromFacility,
        testCase.toFacility
      );

      expect(adjustedLevel).toBe(testCase.expectedLevel);
    });
  });
});

describe('テストデータの整合性確認', () => {

  it('全テストスタッフの権限レベルが正しく設定されている', () => {
    tategamiTestStaffData.forEach(staff => {
      const mappedLevel = getPermissionLevel(
        'tategami_rehabilitation',
        staff.position,
        staff.experienceYears
      );

      // 役職に基づく権限レベルが一致すること
      if (staff.position !== '看護師' && staff.position !== '介護職員') {
        expect(mappedLevel).toBe(staff.accountLevel);
      }
    });
  });

  it('統括主任のテストデータがレベル7になっている', () => {
    const tokatsu = tategamiTestStaffData.find(
      staff => staff.position === '統括主任'
    );
    expect(tokatsu?.accountLevel).toBe(7);
  });
});