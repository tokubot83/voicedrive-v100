# VoiceDrive 組織構造実装 - アクションプラン

**作成日**: 2025-10-12
**ステータス**: ✅ 医療チーム回答受領済み、実装開始可能
**優先度**: 🔴 最高

---

## 📋 医療チームからの回答サマリー

### ✅ 確定した情報

#### 1. 施設情報（3施設）

| 施設 | コード | 種別 | 職員数 | 状態 |
|------|--------|------|--------|------|
| 小原病院 | `obara-hospital` | 病院 | 約80名 | ✅ Phase 3完了 |
| 立神リハビリ | `tategami-rehabilitation` | 病院 | 約100名 | ✅ Phase 3完了 |
| エスポワール立神 | `espoir-tategami` | 老健 | 約150名 | ✅ 実装完了 |

**合計職員数**: 約330名

#### 2. 組織構造

**小原病院**（6部門）:
- 看護部（約30名）
- 診療技術部（約15名）
- 診療支援部（約5名）
- 薬剤部（約3名）
- 事務部（約8名）
- 医局（約10名）
- 栄養科（約3名）

**立神リハビリ**（6部門）:
- リハビリテーション部（約40名）- PT/OT/ST
- 看護部（約30名）
- 温泉療法科（約5名）
- 事務部（約15名）
- 栄養科（約5名）
- 薬剤部（約3名）
- 医局（約10名）

**エスポワール立神**（2課体制）:
- 入所課（約80名）- 6配下部門
- 在宅課（約40名）- 4配下事業所
- 事務部（約10名）

#### 3. 投票スコープの決定

| 部門タイプ | スコープ | 該当部門 |
|-----------|---------|---------|
| **配置場所ベース** | A | 看護部、介護部、在宅課事業所 |
| **職種ベース** | B | リハビリ科、診療技術部、医局 |
| **部門全体ベース** | C | 薬剤部、事務部、診療支援部、温泉療法科 |

#### 4. 重要な決定事項

✅ **投票グループ**: 当面不要（各部門の人数が十分）
✅ **スコア閾値**: デフォルト設定を採用
✅ **委員会マスター**: DB構築後に詳細化
✅ **追加職種**: 5職種を追加（ケアマネ、SW、介護福祉士等）

---

## 🎯 実装計画（即座に開始可能）

### Phase 1: 初期データ投入（1-2日）

#### 1.1 施設マスターデータ作成

```typescript
// scripts/seed/01-facilities.ts

const facilities = [
  {
    id: 'fac_obara',
    facilityCode: 'obara-hospital',
    facilityName: '小原病院',
    facilityType: 'hospital',
    corporationId: 'kouseikai',
    corporationName: '医療法人厚生会',
    totalStaffCount: 80,
    totalBedCount: 60,
    createdBy: 'LEVEL_99'
  },
  {
    id: 'fac_tategami',
    facilityCode: 'tategami-rehabilitation',
    facilityName: '立神リハビリテーション温泉病院',
    facilityType: 'hospital',
    corporationId: 'kouseikai',
    corporationName: '医療法人厚生会',
    totalStaffCount: 100,
    totalBedCount: 90,
    createdBy: 'LEVEL_99'
  },
  {
    id: 'fac_espoir',
    facilityCode: 'espoir-tategami',
    facilityName: '介護老人保健施設エスポワール立神',
    facilityType: 'nursing_home',
    corporationId: 'kouseikai',
    corporationName: '医療法人厚生会',
    totalStaffCount: 150,
    createdBy: 'LEVEL_99'
  }
];
```

#### 1.2 組織構造データ作成

```typescript
// scripts/seed/02-organization-structure.ts

// 小原病院の組織構造
const obaraOrganizations = [
  // 看護部
  {
    id: 'org_obara_nursing',
    facilityId: 'fac_obara',
    departmentId: 'nursing_dept_obara',
    departmentCode: 'nursing_dept',
    departmentName: '看護部',
    departmentType: 'clinical',
    level: 2,
    staffCount: 30,
    createdBy: 'LEVEL_99'
  },
  // 看護部 > 3階病棟
  {
    id: 'org_obara_nursing_ward3f',
    facilityId: 'fac_obara',
    departmentId: 'nursing_dept_obara',
    departmentCode: 'nursing_dept',
    departmentName: '看護部',
    departmentType: 'clinical',
    sectionId: 'ward_3f_obara',
    sectionCode: 'ward_3f',
    sectionName: '3階病棟',
    sectionType: 'inpatient',
    parentDeptId: 'nursing_dept_obara',
    level: 3,
    staffCount: 10,
    createdBy: 'LEVEL_99'
  },
  // 診療技術部 > リハビリテーション室
  {
    id: 'org_obara_medtech_rehab',
    facilityId: 'fac_obara',
    departmentId: 'medical_technology_dept_obara',
    departmentCode: 'medical_technology_dept',
    departmentName: '診療技術部',
    departmentType: 'clinical',
    sectionId: 'rehab_room_obara',
    sectionCode: 'rehab_room',
    sectionName: 'リハビリテーション室',
    sectionType: 'therapy',
    parentDeptId: 'medical_technology_dept_obara',
    level: 3,
    staffCount: 10,
    createdBy: 'LEVEL_99'
  }
  // ... 他の部門・セクション
];
```

#### 1.3 職種マスターデータ作成

```typescript
// scripts/seed/03-job-categories.ts

const jobCategories = [
  // 既存職種
  { categoryCode: 'nurse', categoryName: '看護師', profession: 'nursing', requiresLicense: true },
  { categoryCode: 'pt', categoryName: '理学療法士', profession: 'rehabilitation', requiresLicense: true },
  // ... 他の既存職種

  // 追加職種（エスポワール立神用）
  {
    categoryCode: 'care_manager',
    categoryName: 'ケアマネージャー',
    profession: 'care_management',
    jobFunction: 'administrative',
    requiresLicense: true,
    licenseType: 'national',
    createdBy: 'LEVEL_99'
  },
  {
    categoryCode: 'social_worker',
    categoryName: 'ソーシャルワーカー',
    profession: 'social_work',
    jobFunction: 'support',
    requiresLicense: true,
    licenseType: 'national',
    createdBy: 'LEVEL_99'
  },
  {
    categoryCode: 'certified_care_worker',
    categoryName: '介護福祉士',
    profession: 'care',
    jobFunction: 'clinical',
    requiresLicense: true,
    licenseType: 'national',
    createdBy: 'LEVEL_99'
  },
  {
    categoryCode: 'registered_dietitian',
    categoryName: '管理栄養士',
    profession: 'nutrition',
    jobFunction: 'clinical',
    requiresLicense: true,
    licenseType: 'national',
    createdBy: 'LEVEL_99'
  },
  {
    categoryCode: 'dietitian',
    categoryName: '栄養士',
    profession: 'nutrition',
    jobFunction: 'clinical',
    requiresLicense: true,
    licenseType: 'prefectural',
    createdBy: 'LEVEL_99'
  }
];
```

#### 1.4 議題モード設定データ作成

```typescript
// scripts/seed/04-agenda-mode-configs.ts

// 小原病院・看護部の設定（配置場所ベース）
const obaraNursingConfig = {
  id: 'amc_nursing_obara',
  departmentId: 'nursing_dept_obara',
  scoreThresholds: {
    pending: 30,
    deptReview: 50,
    deptAgenda: 50,
    facilityAgenda: 100,
    corpReview: 300,
    corpAgenda: 600
  },
  votingScopeRules: {
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
  },
  committeeSettings: {
    autoSubmit: true,
    targetCommittee: 'nursing_committee',
    submitThreshold: 100
  },
  createdBy: 'LEVEL_99'
};

// 小原病院・リハビリ室の設定（職種ベース）
const obaraRehabConfig = {
  id: 'amc_rehab_obara',
  departmentId: 'medical_technology_dept_obara',
  scoreThresholds: {
    pending: 30,
    deptReview: 50,
    deptAgenda: 50,
    facilityAgenda: 100
  },
  votingScopeRules: {
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
        description: '診療技術部全体'
      },
      {
        scoreRange: '100+',
        scope: 'facility',
        criteria: ['facilityId'],
        description: '施設全体'
      }
    ]
  },
  createdBy: 'LEVEL_99'
};

// 小原病院・薬剤部の設定（部門全体ベース）
const obaraPharmacyConfig = {
  id: 'amc_pharmacy_obara',
  departmentId: 'pharmacy_dept_obara',
  scoreThresholds: {
    pending: 30,
    deptReview: 50,
    deptAgenda: 50,
    facilityAgenda: 100
  },
  votingScopeRules: {
    scopeType: 'department_based',
    rules: [
      {
        scoreRange: '0-99',
        scope: 'department',
        criteria: ['departmentId'],
        description: '薬剤部全体（少人数のため最初から部門全体）'
      },
      {
        scoreRange: '100+',
        scope: 'facility',
        criteria: ['facilityId'],
        description: '施設全体'
      }
    ]
  },
  createdBy: 'LEVEL_99'
};
```

---

### Phase 2: スキーマ統合とマイグレーション（2-3日）

#### 2.1 既存schema.prismaへの統合

```bash
# 1. バックアップ作成
cp prisma/schema.prisma prisma/schema.prisma.backup

# 2. 新規スキーマを既存スキーマに統合
# schema_organization_extension.prismaの内容を
# schema.prismaにマージ

# 3. マイグレーション生成
npx prisma migrate dev --name add_organization_structure

# 4. マイグレーション実行確認
npx prisma migrate status
```

#### 2.2 シードデータ投入

```bash
# 1. シードスクリプト実行
npm run seed:organization

# 2. データ確認
npx prisma studio
```

---

### Phase 3: AgendaLevelEngine改修（3-4日）

#### 3.1 組織構造対応の改修

```typescript
// src/systems/agenda/engines/AgendaLevelEngine.ts

class AgendaLevelEngine {

  /**
   * 組織構造に基づく権限判定（改修版）
   */
  async getAgendaPermissions(
    post: Post,
    currentUser: User,
    currentScore: number
  ): Promise<AgendaPermissions> {

    // 1. 投稿者の部門設定を取得
    const deptConfig = await prisma.agendaModeConfig.findUnique({
      where: { departmentId: post.authorDepartmentId }
    });

    // 2. スコアに応じたルールを取得
    const rule = this.getRuleForScore(deptConfig.votingScopeRules, currentScore);

    // 3. ルールタイプに応じた権限判定
    switch (rule.scope) {
      case 'section':
        return this.checkSectionPermission(post, currentUser);

      case 'job_category':
        return this.checkJobCategoryPermission(post, currentUser);

      case 'department':
        return this.checkDepartmentPermission(post, currentUser);

      case 'facility':
        return this.checkFacilityPermission(post, currentUser);

      case 'corporation':
        return this.checkCorporationPermission(post, currentUser);
    }
  }

  /**
   * セクション単位の権限チェック
   */
  private checkSectionPermission(post: Post, user: User): AgendaPermissions {
    const canVote = post.authorSectionId === user.primarySectionId;

    return {
      canView: true,
      canVote,
      canComment: canVote,
      visibilityScope: '同じセクション内のみ',
      permissionReason: canVote ? undefined : '他セクションのため投票不可'
    };
  }

  /**
   * 職種単位の権限チェック
   */
  private checkJobCategoryPermission(post: Post, user: User): AgendaPermissions {
    const canVote = post.authorJobCategory === user.jobCategory;

    return {
      canView: true,
      canVote,
      canComment: canVote,
      visibilityScope: '同じ職種のみ',
      permissionReason: canVote ? undefined : '他職種のため投票不可'
    };
  }

  // ... 他の権限チェックメソッド
}
```

---

### Phase 4: レベル99管理画面（簡易版）（2-3日）

#### 4.1 組織マスター管理画面

```typescript
// src/pages/admin/OrganizationMasterAdmin.tsx

export const OrganizationMasterAdmin: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationStructure[]>([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">組織マスター管理</h1>

      {/* 施設一覧 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">施設一覧</h2>
        {facilities.map(facility => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </section>

      {/* 組織構造 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">組織構造</h2>
        <OrganizationTree organizations={organizations} />
      </section>

      {/* 議題モード設定 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">議題モード設定</h2>
        <AgendaModeConfigEditor />
      </section>
    </div>
  );
};
```

---

## 📊 実装タイムライン

### Week 1（10/14-10/20）

| 日付 | タスク | 担当 | 状態 |
|------|--------|------|------|
| 10/14 | シードデータスクリプト作成 | Dev1 | 🔵 Ready |
| 10/15 | スキーマ統合 | Dev1 | 🔵 Ready |
| 10/16 | マイグレーション実行 | Dev1 | 🔵 Ready |
| 10/17 | シードデータ投入 | Dev1 | 🔵 Ready |
| 10/18 | データ確認・修正 | Dev1 | 🔵 Ready |

### Week 2（10/21-10/27）

| 日付 | タスク | 担当 | 状態 |
|------|--------|------|------|
| 10/21 | AgendaLevelEngine改修開始 | Dev2 | 🔵 Ready |
| 10/22 | 権限チェックロジック実装 | Dev2 | 🔵 Ready |
| 10/23 | ユニットテスト作成 | Dev2 | 🔵 Ready |
| 10/24 | 統合テスト実施 | Dev2 | 🔵 Ready |
| 10/25 | バグ修正 | Dev2 | 🔵 Ready |

### Week 3（10/28-11/3）

| 日付 | タスク | 担当 | 状態 |
|------|--------|------|------|
| 10/28 | レベル99管理画面UI実装 | Dev3 | 🔵 Ready |
| 10/29 | 組織マスター編集機能 | Dev3 | 🔵 Ready |
| 10/30 | 議題設定編集機能 | Dev3 | 🔵 Ready |
| 10/31 | 統合テスト | All | 🔵 Ready |
| 11/1-3 | バグ修正・最終確認 | All | 🔵 Ready |

---

## 🎯 医療チームからの質問への回答

### ❓ 質問1: 投票グループの動的変更

**回答**: ✅ **完全対応可能**

```typescript
// レベル99管理画面から動的変更可能
await prisma.votingGroup.create({
  data: {
    groupId: 'medical_support_group_obara',
    groupName: '診療・薬剤・栄養グループ',
    facilityId: 'fac_obara',
    memberDepartmentIds: ['diagnostic_support_dept', 'pharmacy_dept', 'nutrition_dept'],
    totalStaffCount: 11,
    createdBy: 'LEVEL_99'
  }
});

// 既存の部門設定を自動更新
await prisma.organizationStructure.updateMany({
  where: {
    departmentId: {
      in: ['diagnostic_support_dept', 'pharmacy_dept', 'nutrition_dept']
    }
  },
  data: {
    votingGroupId: 'medical_support_group_obara'
  }
});
```

**実装**: レベル99管理画面に「グループ作成」機能を実装

---

### ❓ 質問2: 施設間連携議題の扱い

**回答**: ✅ **法人レベル議題として対応**

```typescript
// スコアが300点以上で法人検討に昇格
if (score >= 300) {
  post.agendaLevel = 'CORP_REVIEW';
  post.agendaScope = 'corporation';

  // 全施設の職員が投票可能
  return {
    canView: true,
    canVote: true,  // 施設に関係なく全員投票可能
    canComment: true,
    visibilityScope: '法人内全員'
  };
}
```

**実装**: 既存のAgendaLevelEngineで対応済み

---

### ❓ 質問3: 兼任職員の投票権

**回答**: ✅ **主所属のみで投票**（二重投票防止）

```typescript
// User.primaryDepartmentId: 主所属（入所課）
// User.secondaryDepartmentIds: 副所属（["支援相談室"]）

// 投票権判定
const canVote = post.authorDepartmentId === user.primaryDepartmentId;

// 二重投票チェック
const existingVote = await prisma.vote.findUnique({
  where: {
    userId_postId: {
      userId: user.id,
      postId: post.id
    }
  }
});

if (existingVote) {
  throw new Error('既に投票済みです');
}
```

**実装**: 主所属のみで投票、副所属は閲覧のみ

---

## ✅ チェックリスト

### 実装前の確認

- [x] 医療チームからの回答受領 ✅
- [x] 施設情報の確定（3施設） ✅
- [x] 組織構造の確定（全部門） ✅
- [x] 投票スコープの決定（14部門） ✅
- [x] 追加職種の確認（5職種） ✅
- [x] 質問への回答準備 ✅

### 実装中の確認

- [ ] シードデータスクリプト作成
- [ ] スキーマ統合完了
- [ ] マイグレーション実行
- [ ] シードデータ投入
- [ ] AgendaLevelEngine改修
- [ ] ユニットテスト実施
- [ ] レベル99管理画面実装

### 実装後の確認

- [ ] 統合テスト成功
- [ ] 医療チームレビュー
- [ ] 本番環境デプロイ
- [ ] 運用マニュアル作成

---

## 📞 次のアクション

### 🔴 最優先（今週中）

1. **シードデータスクリプトの作成**
   - 3施設の施設マスター
   - 全部門の組織構造
   - 追加職種マスター
   - 議題モード設定（14部門）

2. **スキーマ統合とマイグレーション**
   - schema_organization_extension.prismaを統合
   - マイグレーション実行
   - データ投入

### 🟡 中優先（来週）

3. **AgendaLevelEngine改修**
   - 組織構造対応
   - 職種ベース投票
   - 配置場所ベース投票

4. **ユニットテスト実装**

### 🟢 低優先（再来週）

5. **レベル99管理画面実装**
6. **医療チームレビュー**

---

**作成日**: 2025-10-12
**ステータス**: ✅ 実装準備完了
**次のマイルストーン**: シードデータ投入（10/17予定）
