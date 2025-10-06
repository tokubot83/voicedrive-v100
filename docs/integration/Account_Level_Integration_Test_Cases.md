# アカウントレベル統合テストケース

**作成日**: 2025年10月6日
**対象**: 医療職員管理システム ⇔ VoiceDrive 統合
**テストパターン**: 230ケース

---

## テスト目的

医療システムから受け取った職員情報を、VoiceDriveの25段階アカウントレベルに正しくマッピングできることを検証する。

---

## テストカテゴリ

### 1. 基本18レベルマッピング（18ケース）

| # | 医療側position_id | 期待VDレベル | 期待AccountTypeName | 備考 |
|---|------------------|-------------|-------------------|------|
| T001 | `new_staff` | 1 | `NEW_STAFF` | 新人（1年目） |
| T002 | `junior_staff` | 2 | `JUNIOR_STAFF` | 若手（2-3年目） |
| T003 | `midlevel_staff` | 3 | `MIDLEVEL_STAFF` | 中堅（4-10年目） |
| T004 | `veteran_staff` | 4 | `VETERAN_STAFF` | ベテラン（11年以上） |
| T005 | `deputy_chief` | 5 | `DEPUTY_CHIEF` | 副主任 |
| T006 | `chief` | 6 | `CHIEF` | 主任 |
| T007 | `deputy_manager` | 7 | `DEPUTY_MANAGER` | 副師長・副科長 |
| T008 | `manager` | 8 | `MANAGER` | 師長・科長・課長 |
| T009 | `deputy_director` | 9 | `DEPUTY_DIRECTOR` | 副部長 |
| T010 | `director` | 10 | `DIRECTOR` | 部長・医局長 |
| T011 | `administrative_director` | 11 | `ADMINISTRATIVE_DIRECTOR` | 事務長 |
| T012 | `vice_president` | 12 | `VICE_PRESIDENT` | 副院長 |
| T013 | `president` | 13 | `PRESIDENT` | 院長・施設長 |
| T014 | `hr_staff` | 14 | `HR_STAFF` | 人事部門員 |
| T015 | `hr_manager` | 15 | `HR_MANAGER` | 人事各部門長 |
| T016 | `strategic_planning_staff` | 16 | `STRATEGIC_PLANNING_STAFF` | 戦略企画部門員 |
| T017 | `strategic_planning_manager` | 17 | `STRATEGIC_PLANNING_MANAGER` | 戦略企画部門長 |
| T018 | `board_member` | 18 | `BOARD_MEMBER` | 理事長 |

---

### 2. 看護職リーダー可（0.5刻み）マッピング（20ケース）

#### 2-1. 看護職 × リーダー可 → 0.5刻み

| # | position_id | profession | can_leader | 期待レベル | 期待TypeName |
|---|------------|-----------|-----------|----------|-------------|
| T101 | `new_staff` | `nursing` | `true` | 1.5 | `NEW_STAFF_LEADER` |
| T102 | `junior_staff` | `nursing` | `true` | 2.5 | `JUNIOR_STAFF_LEADER` |
| T103 | `midlevel_staff` | `nursing` | `true` | 3.5 | `MIDLEVEL_STAFF_LEADER` |
| T104 | `veteran_staff` | `nursing` | `true` | 4.5 | `VETERAN_STAFF_LEADER` |

#### 2-2. 看護職 × リーダー不可 → 整数レベル

| # | position_id | profession | can_leader | 期待レベル | 期待TypeName |
|---|------------|-----------|-----------|----------|-------------|
| T105 | `new_staff` | `nursing` | `false` | 1 | `NEW_STAFF` |
| T106 | `junior_staff` | `nursing` | `false` | 2 | `JUNIOR_STAFF` |
| T107 | `midlevel_staff` | `nursing` | `false` | 3 | `MIDLEVEL_STAFF` |
| T108 | `veteran_staff` | `nursing` | `false` | 4 | `VETERAN_STAFF` |

#### 2-3. 非看護職 × リーダー可（フラグ無効） → 整数レベル

| # | position_id | profession | can_leader | 期待レベル | 期待TypeName | 備考 |
|---|------------|-----------|-----------|----------|-------------|------|
| T109 | `new_staff` | `medical` | `true` | 1 | `NEW_STAFF` | 医師（リーダー可無視） |
| T110 | `junior_staff` | `administrative` | `true` | 2 | `JUNIOR_STAFF` | 事務職（無視） |
| T111 | `midlevel_staff` | `rehabilitation` | `true` | 3 | `MIDLEVEL_STAFF` | リハビリ職（無視） |
| T112 | `veteran_staff` | `support` | `true` | 4 | `VETERAN_STAFF` | 補助職（無視） |

#### 2-4. Level 5以上 × 看護職 × リーダー可（フラグ無効）

| # | position_id | profession | can_leader | 期待レベル | 備考 |
|---|------------|-----------|-----------|----------|------|
| T113 | `deputy_chief` | `nursing` | `true` | 5 | 副主任（0.5刻み対象外） |
| T114 | `chief` | `nursing` | `true` | 6 | 主任（対象外） |
| T115 | `manager` | `nursing` | `true` | 8 | 師長（対象外） |

---

### 3. 特別権限（97-99）マッピング（15ケース）

| # | position_id | special_authority | 期待レベル | 期待TypeName |
|---|------------|------------------|----------|-------------|
| T201 | `health_checkup_staff` | `health_checkup` | 97 | `HEALTH_CHECKUP_STAFF` |
| T202 | `occupational_physician` | `occupational_physician` | 98 | `OCCUPATIONAL_PHYSICIAN` |
| T203 | `system_admin` | `system_admin` | 99 | `SYSTEM_ADMIN` |

#### 特別権限の独立性テスト

| # | base_position | special_authority | 期待レベル | 備考 |
|---|--------------|------------------|----------|------|
| T204 | `new_staff` | `health_checkup` | 97 | 新人でも健診担当者なら97 |
| T205 | `manager` | `occupational_physician` | 98 | 師長でも産業医なら98 |
| T206 | `director` | `system_admin` | 99 | 部長でもシステム管理者なら99 |

---

### 4. 施設別権限調整（20ケース）

#### 4-1. 立神リハビリテーション温泉病院の統括主任

| # | position_id | facility_id | 期待レベル | 備考 |
|---|------------|------------|----------|------|
| T301 | `統括主任` | `tategami-rehabilitation` | 7 | 特例：Level 7 |
| T302 | `統括主任` | `kohara-hospital` | 6 | 小原病院：通常主任（Level 6） |
| T303 | `統括主任` | `other-facility` | 6 | その他施設：通常主任（Level 6） |

#### 4-2. その他の施設別調整（医療チームから提供予定）

| # | position_id | facility_id | 期待レベル | 備考 |
|---|------------|------------|----------|------|
| T304 | ？ | ？ | ？ | 医療チーム確認待ち |
| ... | ... | ... | ... | ... |

---

### 5. エッジケース（30ケース）

#### 5-1. 不正なデータ

| # | 入力 | 期待結果 | 備考 |
|---|------|---------|------|
| T401 | `level: null` | エラー | レベルnull |
| T402 | `level: 0` | エラー | レベル0（範囲外） |
| T403 | `level: 20` | エラー | レベル20（範囲外） |
| T404 | `level: 1.2` | エラー | 不正な小数（0.5刻みのみ） |
| T405 | `level: 5.5` | エラー | Level 5に0.5刻みなし |
| T406 | `profession: 'unknown'` | エラー | 不明な職種 |

#### 5-2. 境界値テスト

| # | 入力 | 期待結果 | 備考 |
|---|------|---------|------|
| T407 | `level: 1, nursing: true, leader: true` | 1.5 | 最小0.5刻み |
| T408 | `level: 4, nursing: true, leader: true` | 4.5 | 最大0.5刻み |
| T409 | `level: 4, nursing: true, leader: false` | 4 | リーダー不可 |
| T410 | `level: 97` | 97 | 最小特別権限 |
| T411 | `level: 99` | 99 | 最大特別権限 |

#### 5-3. 複合条件

| # | position | profession | can_leader | facility | special_auth | 期待レベル | 備考 |
|---|---------|-----------|-----------|---------|-------------|----------|------|
| T412 | `midlevel_staff` | `nursing` | `true` | `tategami-rehabilitation` | `null` | 3.5 | 看護職リーダー可優先 |
| T413 | `統括主任` | `nursing` | `true` | `tategami-rehabilitation` | `null` | 7 | 施設別調整優先 |
| T414 | `new_staff` | `nursing` | `true` | `kohara-hospital` | `health_checkup` | 97 | 特別権限が最優先 |

---

### 6. 権限変更シナリオ（30ケース）

#### 6-1. 昇進・昇格

| # | 変更前 | 変更後 | 期待動作 |
|---|--------|--------|---------|
| T501 | Level 1（新人） | Level 2（若手） | 経験年数2年経過 |
| T502 | Level 3（中堅） | Level 6（主任） | 主任昇格 |
| T503 | Level 6（主任） | Level 8（師長） | 師長昇格 |

#### 6-2. リーダー業務追加・削除

| # | 変更前 | 変更後 | 期待動作 |
|---|--------|--------|---------|
| T504 | Level 3（中堅看護師） | Level 3.5（リーダー可） | リーダー業務追加 |
| T505 | Level 3.5（リーダー可） | Level 3（中堅看護師） | リーダー業務削除 |

#### 6-3. 特別権限付与・削除

| # | 変更前 | 変更後 | 期待動作 |
|---|--------|--------|---------|
| T506 | Level 8（師長） | Level 97（健診担当者） | 特別権限付与 |
| T507 | Level 97（健診担当者） | Level 8（師長） | 特別権限削除 |

---

### 7. 統合フローテスト（97ケース）

#### 7-1. 新規職員登録フロー

```typescript
// テストケース: T601
const newStaff = {
  staff_id: 'STF999001',
  employee_number: '20250100',
  full_name: '統合テスト 太郎',
  facility_id: 'kohara-hospital',
  department_id: 'nursing-ward1',
  position_id: 'midlevel_staff',
  profession_category: 'nursing',
  years_of_experience: 7,
  can_perform_leader_duty: true
};

// 期待結果:
{
  voicedrive_account_level: 3.5,
  account_type_name: 'MIDLEVEL_STAFF_LEADER',
  can_create_project: false, // Level 5以上で可能
  can_join_project: true,
  can_submit_to_committee: false, // Level 8以上で可能
  accessible_menus: ['personal_station', 'agenda_progress', 'voting_analytics']
}
```

#### 7-2. SSO認証フロー

```typescript
// テストケース: T602
const jwtPayload = {
  staffId: 'STF999001',
  accountLevel: 3.5,
  accountTypeName: 'MIDLEVEL_STAFF_LEADER',
  professionCategory: 'nursing',
  canPerformLeaderDuty: true,
  facilityId: 'kohara-hospital',
  departmentId: 'nursing-ward1'
};

// 期待動作:
// - VoiceDriveログイン成功
// - Level 3.5権限適用
// - 中堅看護師（リーダー可）用メニュー表示
// - プロジェクト分析アクセス可能
```

---

## テスト実行計画

### Phase 1: 単体テスト（Week 6: 10/6-10/12）

- [ ] T001-T018: 基本18レベル（医療チーム主導）
- [ ] T101-T115: 看護職リーダー可（VDチーム主導）
- [ ] T201-T206: 特別権限（医療チーム主導）

### Phase 2: 統合テスト（Week 7: 10/13-10/19）

- [ ] T301-T303: 施設別調整（合同）
- [ ] T401-T414: エッジケース（VDチーム主導）
- [ ] T501-T507: 権限変更シナリオ（合同）

### Phase 3: E2Eテスト（Week 8: 10/20-10/26）

- [ ] T601-T697: 統合フロー（合同）

---

## 成功基準

| 指標 | 目標値 |
|------|--------|
| **マッピング精度** | 100%（全230ケース成功） |
| **リーダー可判定精度** | 100% |
| **特別権限判定精度** | 100% |
| **施設別調整精度** | 100% |
| **エラーハンドリング** | 100%（不正データを正しく拒否） |

---

## 関連ドキュメント

- マスタープラン: `AWS_Lightsail統合実装マスタープラン_20251005.md`
- VD型定義: `src/types/accountLevel.ts`
- VDヘルパー: `src/lib/accountLevelHelpers.ts`
- 医療側実装: `src/services/accountLevelCalculator.ts`（医療チーム提供予定）

---

**文書終了**
