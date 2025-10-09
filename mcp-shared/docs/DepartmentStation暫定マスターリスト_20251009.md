# DepartmentStation 暫定マスターリスト

**作成日**: 2025年10月9日
**対象ページ**: DepartmentStationPage
**送付先**: 医療職員管理システムチーム
**優先度**: HIGH (Group 1: Core Pages)

---

## 📋 概要

DepartmentStationPageは部門単位の活動状況を可視化する管理ページです。現在は100%デモデータで動作しており、**医療システムとの新規API連携およびVoiceDrive内部の集計機能実装が必要**です。

### 主な発見事項
- 🔴 医療システムAPI連携が未実装（部門メンバー、部門統計）
- 🔴 VoiceDrive Postテーブルが存在しない（部門投稿機能が動作不可）
- 🟡 Projectテーブルに不足フィールドあり（members, deadline）

---

## 🎯 医療システムチームへの要求事項

### A. 新規API実装要求（2件）

#### API-3: 部門メンバー一覧取得

**基本情報**:
- **エンドポイント**: `GET /employees/department/{departmentCode}`
- **メソッド**: GET
- **認証**: JWT Bearer Token
- **実装優先度**: 🔴 **CRITICAL** (Phase 1)
- **実装期限**: 2025年11月7日

**リクエスト**:
```http
GET /employees/department/medical_care_ward HTTP/1.1
Authorization: Bearer {jwt_token}
```

**Query Parameters** (optional):
```typescript
activeOnly?: boolean  // trueの場合、退職者を除外（デフォルト: true）
```

**レスポンス**:
```json
{
  "departmentCode": "medical_care_ward",
  "departmentName": "医療療養病棟",
  "members": [
    {
      "employeeId": "EMP-2025-001",
      "name": "山田 太郎",
      "position": "看護師",
      "accountType": "NEW_STAFF",
      "permissionLevel": 1.0,
      "facilityId": "tategami_hospital",
      "facilityName": "たてがみ病院",
      "experienceYears": 3.5,
      "isActive": true
    }
  ],
  "totalMembers": 25,
  "activeMembers": 23,
  "lastUpdated": "2025-10-09T10:00:00Z"
}
```

**使用箇所**:
- 部門メンバータブ（メンバー一覧表示）
- 部門概要タブ（総メンバー数表示）

**エラーレスポンス**:
- `404 Not Found`: 部門コードが存在しない
- `401 Unauthorized`: JWT認証失敗
- `403 Forbidden`: 部門情報閲覧権限なし

---

#### API-4: 部門統計情報取得

**基本情報**:
- **エンドポイント**: `GET /departments/{departmentCode}/statistics`
- **メソッド**: GET
- **認証**: JWT Bearer Token
- **実装優先度**: 🟡 **HIGH** (Phase 1)
- **実装期限**: 2025年11月7日

**リクエスト**:
```http
GET /departments/medical_care_ward/statistics HTTP/1.1
Authorization: Bearer {jwt_token}
```

**Query Parameters** (optional):
```typescript
includeHistorical?: boolean  // 過去の統計も含めるか（デフォルト: false）
```

**レスポンス**:
```json
{
  "departmentCode": "medical_care_ward",
  "departmentName": "医療療養病棟",
  "totalMembers": 25,
  "activeMembers": 23,
  "retiredMembers": 2,
  "permissionLevelDistribution": [
    { "level": 1, "count": 15, "percentage": 60.0 },
    { "level": 2, "count": 5, "percentage": 20.0 },
    { "level": 3, "count": 3, "percentage": 12.0 },
    { "level": 6, "count": 2, "percentage": 8.0 }
  ],
  "averageExperienceYears": 5.3,
  "experienceDistribution": [
    { "range": "0-2年", "count": 5 },
    { "range": "3-5年", "count": 8 },
    { "range": "6-10年", "count": 7 },
    { "range": "11年以上", "count": 5 }
  ],
  "staffTurnoverRate": 8.5,
  "lastCalculated": "2025-10-09T02:00:00Z"
}
```

**使用箇所**:
- 部門概要タブ（総メンバー数）
- 部門分析タブ（アクティブメンバー数、権限レベル分布）

**計算ロジック仕様**:
```typescript
// 権限レベル分布
permissionLevelDistribution = groupBy(members, 'permissionLevel').map(group => ({
  level: group.key,
  count: group.length,
  percentage: (group.length / totalMembers) * 100
}));

// 平均経験年数
averageExperienceYears = sum(members.map(m => m.experienceYears)) / totalMembers;
```

---

### B. 確認事項（3件）

#### 確認-1: API-3 レスポンス仕様の詳細

**質問1**: `avatar`フィールドは含まれますか？
- **Option A**: ✅ YES → VoiceDriveはそのまま使用
- **Option B**: ❌ NO → VoiceDrive User.avatarから補完

**質問2**: `departmentName`（部門名）は含まれますか？
- **Option A**: ✅ YES → 表示に使用
- **Option B**: ❌ NO → VoiceDrive側でマッピング必要

**質問3**: `permissionLevel`は25レベル体系（1.0〜18.0、DECIMAL型）ですか？
- **Option A**: ✅ YES → そのまま使用
- **Option B**: ❌ NO → マッピング必要

**回答期限**: 2025年11月1日

---

#### 確認-2: API-4 統計計算の定義

**質問1**: `activeMembers`の定義は？
- **Option A**: 退職していない職員（isRetired=false）
- **Option B**: 過去30日間にログインした職員
- **Option C**: その他（具体的に記述してください）

**質問2**: `permissionLevelDistribution`は1〜18の全レベルを返しますか？
- **Option A**: ✅ YES（count=0も含む） → グラフ表示に便利
- **Option B**: ❌ NO（count>0のみ） → VoiceDrive側で補完

**質問3**: 統計の更新頻度は？
- **Option A**: リアルタイム（APIリクエスト毎に計算）
- **Option B**: 日次バッチ（02:00 JST）
- **Option C**: その他

**回答期限**: 2025年11月1日

---

#### 確認-3: 部門コードの標準化

**質問1**: VoiceDrive User.departmentの値は、医療システムの部門コードと一致していますか？
- **Option A**: ✅ YES → そのまま使用可能
- **Option B**: ❌ NO → マッピングテーブル必要

**質問2**: 部門コードの形式は？
- 例: `"medical_care_ward"`, `"nursing_dept"`, `"001"`, etc.
- 現在のVoiceDrive User.departmentの値: 文字列型（例: "医療療養病棟"）

**質問3**: 部門マスタはWebhookで同期されますか？
- **Option A**: ✅ YES → Webhook仕様を共有してください
- **Option B**: ❌ NO → 手動同期プロセス必要

**回答期限**: 2025年11月1日

---

## 🗄️ VoiceDriveチームの対応事項

### C. VoiceDriveデータベース実装（Phase 1: 11月7-8日）

#### C-1. Postテーブル新規作成（🔴 CRITICAL）

**理由**: 部門投稿機能の実装に必須。現在デモデータのみで動作。

**スキーマ定義**:
```prisma
model Post {
  id              String    @id @default(cuid())
  authorId        String
  authorName      String?   // キャッシュ用（医療システムから取得）
  content         String    @db.Text
  category        String    // 改善提案, 質問相談, お知らせ, その他
  type            String    // personal, department, organization
  visibility      String    // private, department, facility, organization
  department      String?
  facilityId      String?
  tags            Json?     // タグ配列
  attachments     Json?     // 添付ファイル情報
  status          String    @default("active") // active, archived, deleted, flagged
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  voteHistory     VoteHistory[]

  // インデックス
  @@index([authorId])
  @@index([department])
  @@index([facilityId])
  @@index([category])
  @@index([type])
  @@index([visibility])
  @@index([status])
  @@index([createdAt])
}
```

**影響範囲**:
- VoteHistoryテーブル: `postId`の外部キー制約が必要
- Userテーブル: `posts Post[]` リレーション追加

**マイグレーションコマンド**:
```bash
npx prisma migrate dev --name add_post_model
```

---

#### C-2. Projectテーブル拡張（🟡 推奨、Phase 2: 11月11-15日）

**現在の問題**:
- `members` フィールドがない（メンバー数が取得不可）
- `deadline` フィールドがない（期限が取得不可）
- `timeline` がJson型（暫定的にdeadlineを含む）

**提案する修正**:
```prisma
model Project {
  // ... 既存フィールド

  // 🆕 追加フィールド
  deadline         DateTime?  // プロジェクト期限
  department       String?    // 主管部門

  // 🆕 リレーション追加
  members          ProjectMember[]  // プロジェクトメンバー
}

// 🆕 新規テーブル
model ProjectMember {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  role        String?  // プロジェクトリーダー, メンバー, アドバイザー, etc.
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  isActive    Boolean  @default(true)
  contribution Float   @default(0)  // 貢献度（0-100）

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([isActive])
}
```

**暫定対応**（Phase 1で使用可能）:
```typescript
// Json型からパースして取得
const getProjectDeadline = (project: Project): string | null => {
  if (project.timeline && typeof project.timeline === 'object') {
    return (project.timeline as any).deadline || null;
  }
  return null;
};

const getProjectMemberCount = (project: Project): number => {
  if (project.timeline && typeof project.timeline === 'object') {
    return (project.timeline as any).members?.length || 0;
  }
  return 0;
};
```

---

### D. VoiceDriveサービス層実装（Phase 1: 11月7-8日）

#### D-1. DepartmentStatsService.ts（~200行）

**主要機能**:
1. 部門別投稿統計（getDepartmentPostStats）
2. 部門別プロジェクト統計（getDepartmentProjectStats）
3. 部門メンバーアクティビティ統計（getDepartmentActivityStats）

**使用テーブル**:
- Post（新規作成）
- Project（既存）
- VoteHistory（既存）
- UserActivitySummary（既存）

**実装例**:
```typescript
export async function getDepartmentPostStats(
  departmentCode: string,
  timeRange: 'thisMonth' | 'lastMonth' | 'last3Months' = 'thisMonth'
): Promise<DepartmentPostStats> {
  const { startDate, endDate } = getTimeRange(timeRange);

  const totalPosts = await prisma.post.count({
    where: {
      department: departmentCode,
      createdAt: { gte: startDate, lte: endDate },
      status: 'active'
    }
  });

  const byCategory = await prisma.post.groupBy({
    by: ['category'],
    where: {
      department: departmentCode,
      createdAt: { gte: startDate, lte: endDate },
      status: 'active'
    },
    _count: { id: true }
  });

  return {
    totalPosts,
    byCategory: byCategory.map(c => ({ category: c.category, count: c._count.id })),
    // ... 他の統計
  };
}
```

---

#### D-2. DepartmentPostService.ts（~200行）

**主要機能**:
1. 部門投稿一覧取得（getDepartmentPosts）
2. 部門プロジェクト一覧取得（getDepartmentProjects）

**実装例**:
```typescript
export async function getDepartmentPosts(
  departmentCode: string,
  options?: {
    limit?: number;
    offset?: number;
    category?: string;
    sortBy?: 'newest' | 'mostVoted' | 'mostDiscussed';
  }
): Promise<DepartmentPostsResult> {
  const { limit = 20, offset = 0, category, sortBy = 'newest' } = options || {};

  const where = {
    department: departmentCode,
    status: 'active',
    ...(category && { category })
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: sortBy === 'newest' ? { createdAt: 'desc' } : { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        author: {
          select: { name: true, avatar: true, department: true, permissionLevel: true }
        },
        voteHistory: {
          select: { voteOption: true, voteWeight: true }
        }
      }
    }),
    prisma.post.count({ where })
  ]);

  return { posts, total, hasMore: offset + limit < total };
}
```

---

### E. DepartmentStationPage.tsx修正（~200行）

**修正内容**:

#### E-1. デモデータからAPI呼び出しへ変更
```typescript
// ❌ Before (現在のデモデータ)
const deptMembers = demoUsers.filter(u => u?.department === userDepartment);

// ✅ After (API-3使用)
const [deptMembers, setDeptMembers] = useState<DepartmentMember[]>([]);

useEffect(() => {
  const fetchMembers = async () => {
    if (!userDepartment) return;
    const response = await medicalSystemAPI.getDepartmentMembers(userDepartment);
    setDeptMembers(response.members);
  };
  fetchMembers();
}, [userDepartment]);
```

#### E-2. 統計情報の取得
```typescript
const [deptStats, setDeptStats] = useState<DepartmentStatistics | null>(null);
const [projectStats, setProjectStats] = useState<DepartmentProjectStats | null>(null);
const [postStats, setPostStats] = useState<DepartmentPostStats | null>(null);

useEffect(() => {
  if (!userDepartment) return;

  const fetchDepartmentData = async () => {
    try {
      // API-4で部門統計取得
      const stats = await medicalSystemAPI.getDepartmentStatistics(userDepartment);
      setDeptStats(stats);

      // VoiceDrive内部で集計
      const projStats = await getDepartmentProjectStats(userDepartment);
      setProjectStats(projStats);

      const postStats = await getDepartmentPostStats(userDepartment, 'thisMonth');
      setPostStats(postStats);
    } catch (error) {
      console.error('Failed to fetch department data:', error);
    }
  };

  fetchDepartmentData();
}, [userDepartment]);
```

---

## 📅 実装スケジュール

### Phase 1: 基本実装（2025年11月7日〜8日）

| チーム | タスク | 担当 | 期限 | ステータス |
|--------|--------|------|------|-----------|
| **医療システム** | 確認-1〜3の回答 | - | 11/1 | ⏳ 待機中 |
| 医療システム | API-3実装 | - | 11/7 | ⏳ 待機中 |
| 医療システム | API-4実装 | - | 11/7 | ⏳ 待機中 |
| 医療システム | 統合テスト | - | 11/8 | ⏳ 待機中 |
| **VoiceDrive** | Postテーブル作成 | - | 11/7 | ⏳ 待機中 |
| VoiceDrive | DepartmentStatsService実装 | - | 11/7 | ⏳ 待機中 |
| VoiceDrive | DepartmentPostService実装 | - | 11/7 | ⏳ 待機中 |
| VoiceDrive | DepartmentStationPage修正 | - | 11/8 | ⏳ 待機中 |
| VoiceDrive | ユニットテスト | - | 11/8 | ⏳ 待機中 |
| VoiceDrive | 統合テスト | - | 11/8 | ⏳ 待機中 |

### Phase 2: 拡張機能（2025年11月11日〜15日）任意

| チーム | タスク | 期限 |
|--------|--------|------|
| VoiceDrive | ProjectMemberテーブル作成 | 11/11 |
| VoiceDrive | Project.deadline追加 | 11/11 |
| VoiceDrive | ページネーション実装 | 11/15 |
| VoiceDrive | フィルタリング機能 | 11/15 |

---

## ✅ 完了条件

### Phase 1完了条件
- ✅ 部門メンバー一覧がAPI-3から表示される
- ✅ 部門統計（総メンバー数、アクティブメンバー）がAPI-4から表示される
- ✅ 権限レベル分布グラフがAPI-4から表示される
- ✅ 部門投稿がPostテーブルから表示される
- ✅ 部門プロジェクトがProjectテーブルから表示される
- ✅ すべての統合テストがパスする

### Phase 2完了条件（任意）
- ✅ プロジェクトメンバー数が正確に表示される
- ✅ プロジェクト期限が正確に表示される
- ✅ 部門投稿のページネーションが動作する

---

## 🚨 重要な注意事項

### 🔴 Critical Issues

#### 1. Postテーブルが存在しない
**影響**: 部門投稿機能が一切動作しない
**対応**: Phase 1でPostテーブル作成必須
**期限**: 2025年11月7日

#### 2. 医療システムAPI未実装
**影響**: 部門メンバー情報と統計が取得不可
**対応**: API-3, API-4の実装必須
**期限**: 2025年11月7日

### 🟡 High Priority Issues

#### 3. 部門コード標準化の確認
**影響**: 医療システムとVoiceDriveで部門コードが異なる可能性
**対応**: 確認-3への回答必須
**期限**: 2025年11月1日（Phase 1開始前）

#### 4. Projectスキーマの不足
**影響**: メンバー数、期限が表示できない
**暫定対応**: Json型からパース
**恒久対応**: Phase 2でスキーマ拡張

---

## 📊 実装規模見積もり

| カテゴリ | 規模 | 備考 |
|---------|------|------|
| **医療システムAPI** | 2個 (新規) | API-3, API-4 |
| **VoiceDriveサービス** | 2個 (新規) | DepartmentStatsService, DepartmentPostService |
| **データベーステーブル** | 1個 (新規) | Post |
| **実装コード量** | ~600行 | サービス層400行 + ページ修正200行 |
| **PersonalStation再利用率** | 30% | UserActivityService一部再利用可能 |

---

## 📞 問い合わせ先

**VoiceDriveチーム**:
- Slack: #phase2-integration
- 技術的な質問: プロジェクトリードまで

**医療システムチーム**:
- MCPサーバー経由で連携
- 回答はこのドキュメントへのコメントまたは別途共有ドキュメントで

---

## 📚 関連ドキュメント

- [DepartmentStation_DB要件分析_20251009.md](./DepartmentStation_DB要件分析_20251009.md) - 詳細な技術分析
- [PersonalStation_VoiceDrive実装完了報告_20251009.md](./PersonalStation_VoiceDrive実装完了報告_20251009.md) - 参考実装
- [医療システムマスタープラン](./RESPONSE-PS-DB-2025-1009-001.md) - 全体計画

---

**最終更新**: 2025年10月9日
**作成者**: Claude (AI Assistant)
**レビュー**: 未実施
**ステータス**: 🔴 **医療システムチームの回答待ち**
