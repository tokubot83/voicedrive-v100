# VoiceDrive 組織構造拡張 - マイグレーション計画書

**作成日**: 2025-10-12
**対象**: 組織構造の柔軟化・モード共通基盤の構築
**影響範囲**: DB構築前の準備（既存データなし）

---

## 📋 目次

1. [概要](#概要)
2. [マイグレーション戦略](#マイグレーション戦略)
3. [Phase 1: 施設・組織マスター構築](#phase-1-施設組織マスター構築)
4. [Phase 2: モード別設定の分離](#phase-2-モード別設定の分離)
5. [Phase 3: 既存データの移行](#phase-3-既存データの移行)
6. [Phase 4: 動作確認とテスト](#phase-4-動作確認とテスト)
7. [ロールバック計画](#ロールバック計画)
8. [チェックリスト](#チェックリスト)

---

## 概要

### 🎯 目的

- **モード共通の組織基盤**: 議題モードとプロジェクトモードで同じ組織情報を使用
- **柔軟な投票グループ**: 小規模部門の統合、職種別投票などに対応
- **レベル99による管理**: 組織構造・閾値・ルールを動的に変更可能

### ⚠️ 重要な前提条件

**✅ 現在はDB構築前のため、既存データの移行は不要**

- 新規テーブル追加のみ
- 既存テーブルへのフィールド追加
- データ損失のリスクなし

---

## マイグレーション戦略

### 段階的アプローチ（4 Phase）

```
Phase 1: 施設・組織マスター構築
  ↓
Phase 2: モード別設定の分離
  ↓
Phase 3: 既存データの移行（本番稼働後のみ）
  ↓
Phase 4: 動作確認とテスト
```

### 実施タイミング

- **推奨**: DB構築前（今すぐ）
- **理由**: 既存データがないため、自由に設計変更可能

---

## Phase 1: 施設・組織マスター構築

### 🎯 目標

施設・部門・セクションの階層構造を構築

### 📝 実施内容

#### 1.1 新規テーブルの作成

```sql
-- 1. Facility（施設マスター）
CREATE TABLE facilities (
  id VARCHAR(25) PRIMARY KEY,
  facility_code VARCHAR(50) UNIQUE NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  facility_type VARCHAR(50) NOT NULL,
  corporation_id VARCHAR(50) NOT NULL,
  corporation_name VARCHAR(100) NOT NULL,
  total_staff_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility_code (facility_code),
  INDEX idx_corporation (corporation_id, is_active)
);

-- 2. OrganizationStructure（組織構造マスター）
CREATE TABLE organization_structures (
  id VARCHAR(25) PRIMARY KEY,
  facility_id VARCHAR(25) NOT NULL,
  department_id VARCHAR(100) UNIQUE NOT NULL,
  department_code VARCHAR(50) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  department_type VARCHAR(50) NOT NULL,
  section_id VARCHAR(100) UNIQUE,
  section_code VARCHAR(50),
  section_name VARCHAR(100),
  section_type VARCHAR(50),
  parent_dept_id VARCHAR(100),
  level INT NOT NULL,
  hierarchy_path VARCHAR(255),
  staff_count INT DEFAULT 0,
  voting_group_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_dept_id) REFERENCES organization_structures(department_id) ON DELETE SET NULL,
  INDEX idx_facility_dept (facility_id, department_id),
  INDEX idx_dept_active (department_id, is_active),
  INDEX idx_voting_group (voting_group_id),
  INDEX idx_parent (parent_dept_id)
);

-- 3. VotingGroup（投票グループ）
CREATE TABLE voting_groups (
  id VARCHAR(25) PRIMARY KEY,
  group_id VARCHAR(100) UNIQUE NOT NULL,
  group_code VARCHAR(50) NOT NULL,
  group_name VARCHAR(100) NOT NULL,
  group_display_name VARCHAR(150) NOT NULL,
  facility_id VARCHAR(25) NOT NULL,
  member_department_ids JSON NOT NULL,
  total_staff_count INT DEFAULT 0,
  agenda_mode_enabled BOOLEAN DEFAULT TRUE,
  project_mode_enabled BOOLEAN DEFAULT TRUE,
  group_type VARCHAR(50) DEFAULT 'standard',
  description TEXT,
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
  INDEX idx_facility_group (facility_id, is_active),
  INDEX idx_group_id (group_id),
  INDEX idx_group_type (group_type)
);

-- 4. JobCategory（職種マスター）
CREATE TABLE job_categories (
  id VARCHAR(25) PRIMARY KEY,
  category_code VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  category_name_en VARCHAR(100),
  profession VARCHAR(50) NOT NULL,
  job_function VARCHAR(50) NOT NULL,
  requires_license BOOLEAN DEFAULT FALSE,
  license_type VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profession (profession)
);
```

#### 1.2 初期データの投入

```sql
-- 施設マスターの初期データ
INSERT INTO facilities (id, facility_code, facility_name, facility_type, corporation_id, corporation_name, created_by) VALUES
('fac_kobara', 'kobara_hospital', '小原病院', 'hospital', 'espoir_medical', 'エスポワール医療グループ', 'LEVEL_99'),
('fac_tategami', 'tategami_rehab', '立神リハビリテーション温泉病院', 'rehab_facility', 'espoir_medical', 'エスポワール医療グループ', 'LEVEL_99'),
('fac_espoir', 'espoir_tategami', 'エスポワール立神', 'senior_care', 'espoir_medical', 'エスポワール医療グループ', 'LEVEL_99');

-- 職種マスターの初期データ
INSERT INTO job_categories (id, category_code, category_name, category_name_en, profession, job_function, requires_license) VALUES
('job_nurse', 'nurse', '看護師', 'Nurse', 'nursing', 'clinical', TRUE),
('job_nurse_assistant', 'nursing_assistant', '看護補助者', 'Nursing Assistant', 'nursing', 'clinical', FALSE),
('job_pt', 'pt', '理学療法士', 'Physical Therapist', 'rehabilitation', 'clinical', TRUE),
('job_ot', 'ot', '作業療法士', 'Occupational Therapist', 'rehabilitation', 'clinical', TRUE),
('job_st', 'st', '言語聴覚士', 'Speech Therapist', 'rehabilitation', 'clinical', TRUE),
('job_pharmacist', 'pharmacist', '薬剤師', 'Pharmacist', 'pharmacy', 'clinical', TRUE),
('job_clerk', 'clerk', '医療クラーク', 'Medical Clerk', 'administrative', 'administrative', FALSE),
('job_doctor', 'doctor', '医師', 'Doctor', 'medical', 'clinical', TRUE),
('job_admin', 'admin_staff', '事務職員', 'Administrative Staff', 'administrative', 'administrative', FALSE);
```

#### 1.3 医療チームからの組織情報収集

**必要な情報**:

1. **小原病院の組織構造**
   ```
   看護部
     - 3階病棟
     - 4階病棟
     - 外来
     - 手術室

   診療技術部
     - リハビリテーション室
     - 検査室
     - 放射線科

   診療支援部
     - 医事課
     - 地域連携室

   薬剤部

   事務部
     - 総務課
     - 経理課

   医局
     - 内科
     - 整形外科
     - リハビリテーション科
   ```

2. **立神リハビリテーション温泉病院の組織構造**
   ```
   リハビリテーション部
   医療療養病棟
   温泉療法科
   事務部
   ```

3. **各部門の人数**

#### 1.4 組織データの投入スクリプト

```typescript
// scripts/seed-organization-structure.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrganizationStructure() {
  // 小原病院の組織構造
  await prisma.organizationStructure.createMany({
    data: [
      // 看護部
      {
        id: 'org_kobara_nursing',
        facilityId: 'fac_kobara',
        departmentId: 'nursing_dept_kobara',
        departmentCode: 'nursing_dept',
        departmentName: '看護部',
        departmentType: 'clinical',
        level: 2,
        staffCount: 80,
        createdBy: 'LEVEL_99'
      },
      // 看護部 > 3階病棟
      {
        id: 'org_kobara_nursing_ward3f',
        facilityId: 'fac_kobara',
        departmentId: 'nursing_dept_kobara',
        departmentCode: 'nursing_dept',
        departmentName: '看護部',
        departmentType: 'clinical',
        sectionId: 'ward_3f_kobara',
        sectionCode: 'ward_3f',
        sectionName: '3階病棟',
        sectionType: 'inpatient',
        parentDeptId: 'nursing_dept_kobara',
        level: 3,
        staffCount: 20,
        createdBy: 'LEVEL_99'
      },
      // リハビリテーション科
      {
        id: 'org_kobara_rehab',
        facilityId: 'fac_kobara',
        departmentId: 'rehab_dept_kobara',
        departmentCode: 'rehab_dept',
        departmentName: 'リハビリテーション科',
        departmentType: 'clinical',
        level: 2,
        staffCount: 25,
        createdBy: 'LEVEL_99'
      },
      // 診療支援部
      {
        id: 'org_kobara_diagnostic',
        facilityId: 'fac_kobara',
        departmentId: 'diagnostic_support_dept_kobara',
        departmentCode: 'diagnostic_support_dept',
        departmentName: '診療支援部',
        departmentType: 'support',
        level: 2,
        staffCount: 5,
        createdBy: 'LEVEL_99'
      },
      // 薬剤部
      {
        id: 'org_kobara_pharmacy',
        facilityId: 'fac_kobara',
        departmentId: 'pharmacy_dept_kobara',
        departmentCode: 'pharmacy_dept',
        departmentName: '薬剤部',
        departmentType: 'clinical',
        level: 2,
        staffCount: 3,
        createdBy: 'LEVEL_99'
      },
      // 事務部
      {
        id: 'org_kobara_admin',
        facilityId: 'fac_kobara',
        departmentId: 'admin_dept_kobara',
        departmentCode: 'admin_dept',
        departmentName: '事務部',
        departmentType: 'administrative',
        level: 2,
        staffCount: 8,
        createdBy: 'LEVEL_99'
      }
    ]
  });

  // 投票グループの作成（小規模部門統合）
  await prisma.votingGroup.create({
    data: {
      id: 'vg_kobara_medical_support',
      groupId: 'medical_support_group_kobara',
      groupCode: 'medical_support_group',
      groupName: '診療・薬剤・事務グループ',
      groupDisplayName: '診療支援・薬剤・事務部',
      facilityId: 'fac_kobara',
      memberDepartmentIds: JSON.stringify([
        'diagnostic_support_dept_kobara',
        'pharmacy_dept_kobara',
        'admin_dept_kobara'
      ]),
      totalStaffCount: 16,
      groupType: 'small_dept_merged',
      description: '人数の関係で統合運用',
      reason: '各部門5-8名の少人数のため、グループ化することで議題化を促進',
      createdBy: 'LEVEL_99'
    }
  });

  // voting_group_id の更新
  await prisma.organizationStructure.updateMany({
    where: {
      departmentId: {
        in: [
          'diagnostic_support_dept_kobara',
          'pharmacy_dept_kobara',
          'admin_dept_kobara'
        ]
      }
    },
    data: {
      votingGroupId: 'medical_support_group_kobara'
    }
  });

  console.log('✅ 組織構造のシード完了');
}

seedOrganizationStructure()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Phase 2: モード別設定の分離

### 🎯 目標

議題モードとプロジェクトモードの設定を独立管理

### 📝 実施内容

#### 2.1 議題モード設定テーブル

```sql
-- AgendaModeConfig（部門別）
CREATE TABLE agenda_mode_configs (
  id VARCHAR(25) PRIMARY KEY,
  department_id VARCHAR(100) UNIQUE NOT NULL,
  score_thresholds JSON NOT NULL,
  voting_scope_rules JSON NOT NULL,
  committee_settings JSON,
  approval_flow JSON,
  notification_settings JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES organization_structures(department_id) ON DELETE CASCADE,
  INDEX idx_dept_active (department_id, is_active)
);

-- AgendaModeGroupConfig（グループ別）
CREATE TABLE agenda_mode_group_configs (
  id VARCHAR(25) PRIMARY KEY,
  voting_group_id VARCHAR(100) UNIQUE NOT NULL,
  group_score_thresholds JSON NOT NULL,
  voting_scope_rules JSON NOT NULL,
  committee_settings JSON,
  approval_flow JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (voting_group_id) REFERENCES voting_groups(group_id) ON DELETE CASCADE,
  INDEX idx_group_active (voting_group_id, is_active)
);
```

#### 2.2 プロジェクトモード設定テーブル

```sql
-- ProjectModeConfig（部門別）
CREATE TABLE project_mode_configs (
  id VARCHAR(25) PRIMARY KEY,
  department_id VARCHAR(100) UNIQUE NOT NULL,
  score_thresholds JSON NOT NULL,
  team_formation_rules JSON NOT NULL,
  visibility_rules JSON NOT NULL,
  milestone_settings JSON,
  budget_approval_settings JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES organization_structures(department_id) ON DELETE CASCADE,
  INDEX idx_dept_active (department_id, is_active)
);

-- ProjectModeGroupConfig（グループ別）
CREATE TABLE project_mode_group_configs (
  id VARCHAR(25) PRIMARY KEY,
  voting_group_id VARCHAR(100) UNIQUE NOT NULL,
  group_score_thresholds JSON NOT NULL,
  team_formation_rules JSON NOT NULL,
  visibility_rules JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (voting_group_id) REFERENCES voting_groups(group_id) ON DELETE CASCADE,
  INDEX idx_group_active (voting_group_id, is_active)
);
```

#### 2.3 初期設定データの投入

```typescript
// scripts/seed-mode-configs.ts

// 看護部の議題モード設定
await prisma.agendaModeConfig.create({
  data: {
    id: 'amc_nursing_kobara',
    departmentId: 'nursing_dept_kobara',
    scoreThresholds: JSON.stringify({
      pending: 30,
      deptReview: 50,
      deptAgenda: 50,
      facilityAgenda: 100,
      corpReview: 300,
      corpAgenda: 600
    }),
    votingScopeRules: JSON.stringify({
      scopeType: 'location_based',
      rules: [
        {
          scoreRange: '0-29',
          scope: 'section',
          criteria: ['sectionId'],
          description: '同じ病棟のみ'
        },
        {
          scoreRange: '30-99',
          scope: 'department',
          criteria: ['departmentId'],
          description: '看護部全体'
        },
        {
          scoreRange: '100+',
          scope: 'facility',
          criteria: ['facilityId'],
          description: '施設全体'
        }
      ]
    }),
    committeeSettings: JSON.stringify({
      autoSubmit: true,
      targetCommittee: 'operations_committee',
      submitThreshold: 100
    }),
    createdBy: 'LEVEL_99'
  }
});

// リハビリ科の議題モード設定（職種ベース）
await prisma.agendaModeConfig.create({
  data: {
    id: 'amc_rehab_kobara',
    departmentId: 'rehab_dept_kobara',
    scoreThresholds: JSON.stringify({
      pending: 30,
      deptReview: 50,
      deptAgenda: 50,
      facilityAgenda: 100
    }),
    votingScopeRules: JSON.stringify({
      scopeType: 'profession_based',
      rules: [
        {
          scoreRange: '0-29',
          scope: 'job_category',
          criteria: ['jobCategory'],
          description: '同じ職種のみ（PT同士、OT同士）'
        },
        {
          scoreRange: '30-99',
          scope: 'department',
          criteria: ['departmentId'],
          description: 'リハビリ科全体（PT+OT+ST）'
        },
        {
          scoreRange: '100+',
          scope: 'facility',
          criteria: ['facilityId'],
          description: '施設全体'
        }
      ]
    }),
    createdBy: 'LEVEL_99'
  }
});

// 診療・薬剤・事務グループの議題モード設定
await prisma.agendaModeGroupConfig.create({
  data: {
    id: 'amgc_medical_support_kobara',
    votingGroupId: 'medical_support_group_kobara',
    groupScoreThresholds: JSON.stringify({
      pending: 30,
      deptReview: 50,
      deptAgenda: 50,
      facilityAgenda: 100
    }),
    votingScopeRules: JSON.stringify({
      scopeType: 'voting_group_based',
      rules: [
        {
          scoreRange: '0-99',
          scope: 'voting_group',
          criteria: ['votingGroupId'],
          description: 'グループ内全員（16名）'
        },
        {
          scoreRange: '100+',
          scope: 'facility',
          criteria: ['facilityId'],
          description: '施設全体'
        }
      ]
    }),
    createdBy: 'LEVEL_99'
  }
});
```

---

## Phase 3: 既存データの移行

### ⚠️ 注意

**現時点ではDB構築前のため、このフェーズは不要**

将来、本番稼働後にスキーマ変更が必要になった場合のみ実施：

```sql
-- User テーブルへのフィールド追加
ALTER TABLE users
  ADD COLUMN facility_id VARCHAR(25),
  ADD COLUMN primary_department_id VARCHAR(100),
  ADD COLUMN primary_section_id VARCHAR(100),
  ADD COLUMN voting_group_id VARCHAR(100),
  ADD COLUMN job_category VARCHAR(50),
  ADD COLUMN job_title VARCHAR(100),
  ADD COLUMN secondary_department_ids JSON;

-- 既存の department フィールドから新フィールドへの移行
UPDATE users
SET
  facility_id = 'fac_kobara',  -- デフォルト施設
  primary_department_id = CONCAT(department, '_kobara'),
  job_category = 'unknown'
WHERE department IS NOT NULL;

-- 旧フィールドのリネーム（後方互換）
ALTER TABLE users CHANGE COLUMN department legacy_department VARCHAR(255);

-- Post テーブルへのフィールド追加
ALTER TABLE posts
  ADD COLUMN system_mode VARCHAR(50) DEFAULT 'AGENDA_MODE',
  ADD COLUMN author_facility_id VARCHAR(25),
  ADD COLUMN author_department_id VARCHAR(100),
  ADD COLUMN author_section_id VARCHAR(100),
  ADD COLUMN author_voting_group_id VARCHAR(100),
  ADD COLUMN author_job_category VARCHAR(50),
  ADD COLUMN agenda_level VARCHAR(50),
  ADD COLUMN agenda_scope VARCHAR(50),
  ADD COLUMN project_level VARCHAR(50),
  ADD COLUMN project_scope VARCHAR(50);

-- 既存投稿データの移行
UPDATE posts p
JOIN users u ON p.author_id = u.id
SET
  p.author_facility_id = u.facility_id,
  p.author_department_id = u.primary_department_id,
  p.author_voting_group_id = u.voting_group_id,
  p.author_job_category = u.job_category;
```

---

## Phase 4: 動作確認とテスト

### 4.1 データ整合性チェック

```typescript
// scripts/validate-organization-structure.ts

async function validateOrganizationStructure() {
  const prisma = new PrismaClient();

  // 1. 施設マスターのチェック
  const facilities = await prisma.facility.findMany();
  console.log(`✅ 施設数: ${facilities.length}`);

  // 2. 組織構造のチェック
  const departments = await prisma.organizationStructure.findMany({
    where: { level: 2 }  // 部門レベル
  });
  console.log(`✅ 部門数: ${departments.length}`);

  // 3. 投票グループのチェック
  const votingGroups = await prisma.votingGroup.findMany();
  console.log(`✅ 投票グループ数: ${votingGroups.length}`);

  // 4. モード設定のチェック
  const agendaConfigs = await prisma.agendaModeConfig.findMany();
  console.log(`✅ 議題モード設定数: ${agendaConfigs.length}`);

  // 5. リレーションのチェック
  const deptWithGroup = await prisma.organizationStructure.findMany({
    where: { votingGroupId: { not: null } },
    include: { votingGroup: true }
  });
  console.log(`✅ グループ所属部門数: ${deptWithGroup.length}`);

  await prisma.$disconnect();
}
```

### 4.2 ユニットテスト

```typescript
// tests/organization-structure.test.ts

describe('OrganizationStructure', () => {
  it('施設の作成ができる', async () => {
    const facility = await prisma.facility.create({
      data: {
        id: 'test_facility',
        facilityCode: 'test_facility',
        facilityName: 'テスト施設',
        facilityType: 'hospital',
        corporationId: 'test_corp',
        corporationName: 'テスト法人',
        createdBy: 'test_user'
      }
    });

    expect(facility.facilityCode).toBe('test_facility');
  });

  it('投票グループに部門を追加できる', async () => {
    const votingGroup = await prisma.votingGroup.create({
      data: {
        groupId: 'test_group',
        groupCode: 'test_group',
        groupName: 'テストグループ',
        groupDisplayName: 'テストグループ',
        facilityId: 'fac_kobara',
        memberDepartmentIds: JSON.stringify(['dept1', 'dept2']),
        createdBy: 'test_user'
      }
    });

    expect(votingGroup.groupId).toBe('test_group');
  });

  it('議題モード設定が取得できる', async () => {
    const config = await prisma.agendaModeConfig.findUnique({
      where: { departmentId: 'nursing_dept_kobara' }
    });

    expect(config).toBeTruthy();
    expect(config?.scoreThresholds).toBeTruthy();
  });
});
```

---

## ロールバック計画

### 緊急時の対応

```sql
-- 全ての新規テーブルを削除
DROP TABLE IF EXISTS project_mode_group_configs;
DROP TABLE IF EXISTS project_mode_configs;
DROP TABLE IF EXISTS agenda_mode_group_configs;
DROP TABLE IF EXISTS agenda_mode_configs;
DROP TABLE IF EXISTS job_categories;
DROP TABLE IF EXISTS voting_groups;
DROP TABLE IF EXISTS organization_structures;
DROP TABLE IF EXISTS facilities;

-- User, Post テーブルから追加フィールドを削除
ALTER TABLE users
  DROP COLUMN facility_id,
  DROP COLUMN primary_department_id,
  DROP COLUMN primary_section_id,
  DROP COLUMN voting_group_id,
  DROP COLUMN job_category,
  DROP COLUMN job_title,
  DROP COLUMN secondary_department_ids;

ALTER TABLE posts
  DROP COLUMN system_mode,
  DROP COLUMN author_facility_id,
  DROP COLUMN author_department_id,
  DROP COLUMN author_section_id,
  DROP COLUMN author_voting_group_id,
  DROP COLUMN author_job_category,
  DROP COLUMN agenda_level,
  DROP COLUMN agenda_scope,
  DROP COLUMN project_level,
  DROP COLUMN project_scope;
```

---

## チェックリスト

### Phase 1: 施設・組織マスター構築

- [ ] Prismaスキーマに新規モデルを追加
- [ ] マイグレーションファイルの生成 `npx prisma migrate dev --name add_organization_structure`
- [ ] 施設マスターの初期データ投入
- [ ] 職種マスターの初期データ投入
- [ ] 医療チームから組織情報を収集
- [ ] 組織構造データの投入スクリプト実行
- [ ] 投票グループの作成
- [ ] データ整合性チェック

### Phase 2: モード別設定の分離

- [ ] 議題モード設定テーブルの作成
- [ ] プロジェクトモード設定テーブルの作成
- [ ] 各部門の議題モード設定を投入
- [ ] グループの議題モード設定を投入
- [ ] 各部門のプロジェクトモード設定を投入（将来）
- [ ] 設定データの確認

### Phase 3: 既存データの移行（本番稼働後のみ）

- [ ] 既存データのバックアップ
- [ ] User テーブルへのフィールド追加
- [ ] 既存ユーザーデータの移行
- [ ] Post テーブルへのフィールド追加
- [ ] 既存投稿データの移行
- [ ] 旧フィールドのリネーム
- [ ] データ整合性チェック

### Phase 4: 動作確認とテスト

- [ ] データ整合性チェックスクリプトの実行
- [ ] ユニットテストの実行
- [ ] 統合テストの実行
- [ ] 議題モードの動作確認
- [ ] プロジェクトモードの動作確認
- [ ] レベル99管理画面の動作確認

### 最終確認

- [ ] パフォーマンステスト
- [ ] セキュリティチェック
- [ ] ドキュメント更新
- [ ] 医療チームへの報告

---

## 実施スケジュール（推奨）

### Week 1: 準備

- **Day 1-2**: 医療チームから組織情報を収集
- **Day 3**: Prismaスキーマの統合
- **Day 4-5**: マイグレーション実行とデータ投入

### Week 2: 実装

- **Day 1-2**: AgendaLevelEngine の改修
- **Day 3-4**: ProjectLevelEngine の改修
- **Day 5**: レベル99管理画面の実装

### Week 3: テスト

- **Day 1-2**: ユニットテスト
- **Day 3-4**: 統合テスト
- **Day 5**: 医療チームレビュー

---

## 問い合わせ先

- **技術担当**: VoiceDrive開発チーム
- **組織情報**: 医療システムチーム
- **レビュー**: レベル99管理者

---

**最終更新**: 2025-10-12
**ステータス**: レビュー待ち
