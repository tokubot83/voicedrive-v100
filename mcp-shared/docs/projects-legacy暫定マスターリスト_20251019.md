# Projects Legacy ページ DB統合 暫定マスターリスト

**文書番号**: PL-ML-2025-1019-001
**作成日**: 2025年10月19日
**作成者**: VoiceDriveチーム
**対象ページ**: `/projects-legacy` (ProjectListPage)
**ステータス**: 📋 実装チェックリスト
**実装予定**: 2025年12月1日～12月17日（Phase 2完了後）

---

## 📊 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **目的** | ProjectsLegacyページのDB統合（デモデータからの脱却） |
| **対象コンポーネント** | ProjectListPage.tsx (376行) |
| **現状** | 100%ハードコードデータ（getDemoProjects） |
| **ゴール** | Prisma経由でPost/Projectテーブルから動的データ取得 |
| **総工数** | 15日 |
| **コスト** | ¥600,000 |
| **優先度** | 🟡 中（Phase 2完了後に実施） |

---

## ✅ 実装チェックリスト

### Phase 1: スキーマ拡張（3日）

#### ✅ 1-1. Postテーブル拡張

- [ ] **プロジェクト実行管理フィールドを追加**
  ```prisma
  // schema.prisma の Post モデルに追加
  projectStatus                     String?   @map("project_status")
  projectProgress                   Float?    @default(0) @map("project_progress")
  projectStartDate                  DateTime? @map("project_start_date")
  projectEndDate                    DateTime? @map("project_end_date")
  projectDepartment                 String?   @map("project_department")
  projectFacilityId                 String?   @map("project_facility_id")
  projectFacilityName               String?   @map("project_facility_name")
  projectParticipants               Int?      @default(0) @map("project_participants")
  ```

- [ ] **マイグレーションファイル生成**
  ```bash
  npx prisma migrate dev --name add_project_execution_fields
  ```

- [ ] **マイグレーション実行（開発環境）**
  ```bash
  npx prisma db push
  ```

#### ✅ 1-2. Projectテーブル調整

- [ ] **Post変換用フィールドを追加**
  ```prisma
  // schema.prisma の Project モデルに追加
  convertedToPostId  String?   @unique @map("converted_to_post_id")
  conversionDate     DateTime? @map("conversion_date")

  // リレーション追加
  convertedPost      Post?     @relation("ConvertedFromProject", fields: [convertedToPostId], references: [id])
  ```

- [ ] **Post側にリレーション追加**
  ```prisma
  // Post モデルに追加
  convertedFromProject Project? @relation("ConvertedFromProject")
  ```

#### ✅ 1-3. インデックス最適化

- [ ] **プロジェクト検索用インデックス追加**
  ```prisma
  // Post モデル内
  @@index([projectLevel, projectStatus])
  @@index([projectFacilityId, projectStatus])
  @@index([projectDepartment, projectStatus])
  @@index([projectScore, projectLevel])
  ```

#### ✅ 1-4. マイグレーション検証

- [ ] **スキーマ整合性チェック**
  ```bash
  npx prisma validate
  ```

- [ ] **Prisma Clientの再生成**
  ```bash
  npx prisma generate
  ```

- [ ] **マイグレーション履歴確認**
  ```bash
  npx prisma migrate status
  ```

---

### Phase 2: ProjectService拡張（5日）

#### ✅ 2-1. プロジェクト一覧取得メソッド

- [ ] **listActiveProjects() メソッド実装**
  - ファイル: `src/api/db/projectService.ts`
  - 機能: Post中心のプロジェクト一覧取得
  - フィルタ: status, category, priority, userId, role, facilityId, department

- [ ] **convertPostToProjectListItem() ヘルパー実装**
  - Post → ProjectListItem 変換ロジック
  - teamMembers, approvals, milestones の集約

- [ ] **determineUserRole() ヘルパー実装**
  - ユーザーの役割判定（owner | participant | viewer）
  - ProjectTeamMember との照合

- [ ] **determinePriority() ヘルパー実装**
  - projectLevel と projectScore から priority を算出
  - 'urgent' | 'high' | 'medium' | 'low'

#### ✅ 2-2. プロジェクト詳細取得メソッド

- [ ] **getProjectById() メソッド拡張**
  - Post + Project の統合取得
  - teamMembers, milestones, approvals の全情報取得

#### ✅ 2-3. プロジェクト統計メソッド

- [ ] **getProjectStats() メソッド実装**
  ```typescript
  {
    participants: number;
    milestones: { total: number; completed: number };
    approvalStatus: string;
    currentApprover: string;
  }
  ```

#### ✅ 2-4. エラーハンドリング

- [ ] **try-catch追加**
- [ ] **日本語エラーメッセージ対応**
- [ ] **ロギング追加**

#### ✅ 2-5. 単体テスト

- [ ] **listActiveProjects() テスト**
  - 正常系: フィルタなし
  - 正常系: status フィルタ
  - 正常系: myRole フィルタ
  - 異常系: 不正なフィルタ

- [ ] **convertPostToProjectListItem() テスト**
  - Post → ProjectListItem 変換精度

---

### Phase 3: APIエンドポイント実装（3日）

#### ✅ 3-1. GET /api/projects

- [ ] **ファイル作成**: `src/pages/api/projects/index.ts`
- [ ] **認証チェック実装** (next-auth)
- [ ] **クエリパラメータ処理**
  - `status`, `category`, `priority`, `myRole`, `facilityId`, `department`
- [ ] **ProjectService.listActiveProjects() 呼び出し**
- [ ] **レスポンス整形**

#### ✅ 3-2. GET /api/projects/my

- [ ] **ファイル作成**: `src/pages/api/projects/my.ts`
- [ ] **認証チェック実装**
- [ ] **ユーザーIDでフィルタ**
- [ ] **ProjectService.listActiveProjects(userId) 呼び出し**

#### ✅ 3-3. GET /api/projects/:id

- [ ] **ファイル作成**: `src/pages/api/projects/[id].ts`
- [ ] **認証チェック実装**
- [ ] **ProjectService.getProjectById() 呼び出し**
- [ ] **404エラーハンドリング**

#### ✅ 3-4. GET /api/projects/:id/team

- [ ] **ファイル作成**: `src/pages/api/projects/[id]/team.ts`
- [ ] **ProjectTeamMember 取得**
- [ ] **ユーザー情報の JOIN**

#### ✅ 3-5. GET /api/projects/:id/approvals

- [ ] **ファイル作成**: `src/pages/api/projects/[id]/approvals.ts`
- [ ] **ProjectApproval 取得**
- [ ] **時系列ソート**

#### ✅ 3-6. APIドキュメント作成

- [ ] **OpenAPI仕様書作成** (`docs/api/projects.yaml`)
- [ ] **エンドポイント一覧表**
- [ ] **リクエスト/レスポンス例**

---

### Phase 4: ProjectListPage統合（2日）

#### ✅ 4-1. データ取得ロジック実装

- [ ] **useEffect で API呼び出し**
  ```typescript
  useEffect(() => {
    loadProjects();
  }, [statusFilter, categoryFilter, roleFilter]);
  ```

- [ ] **loadProjects() 関数実装**
  ```typescript
  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      // ...
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };
  ```

#### ✅ 4-2. ローディング状態管理

- [ ] **Loading spinner 追加**
- [ ] **スケルトンUI実装**（任意）

#### ✅ 4-3. エラー状態管理

- [ ] **エラーメッセージ表示**
- [ ] **リトライ機能**

#### ✅ 4-4. デモデータ削除

- [ ] **getDemoProjects() 削除**
- [ ] **ハードコード配列削除** (lines 78-145)
- [ ] **interface Project のインポート先変更**

#### ✅ 4-5. フィルタ機能連携

- [ ] **statusFilter → API クエリパラメータ**
- [ ] **categoryFilter → API クエリパラメータ**
- [ ] **roleFilter → API クエリパラメータ**

---

### Phase 5: テストとデバッグ（2日）

#### ✅ 5-1. 統合テスト

- [ ] **フィルタなしでプロジェクト一覧取得**
  - 期待: projectLevel='TEAM'以上の全Post取得

- [ ] **status='active' でフィルタ**
  - 期待: projectStatus='active' のみ

- [ ] **myRole='owner' でフィルタ**
  - 期待: 自分がプロジェクトリーダーのもののみ

- [ ] **複数フィルタ組み合わせ**
  - 期待: AND条件で絞り込み

#### ✅ 5-2. パフォーマンステスト

- [ ] **100件のプロジェクトでのレスポンスタイム測定**
  - 目標: < 500ms

- [ ] **N+1問題チェック**
  - Prisma query ログ確認

- [ ] **メモリ使用量チェック**

#### ✅ 5-3. エラーハンドリングテスト

- [ ] **API エラー時の UI 表示**
- [ ] **ネットワークエラー時の挙動**
- [ ] **タイムアウト処理**

#### ✅ 5-4. UI/UXテスト

- [ ] **フィルタ変更時のUI更新**
- [ ] **ページネーション動作**（実装する場合）
- [ ] **ソート機能動作**

#### ✅ 5-5. ブラウザ互換性テスト

- [ ] **Chrome**
- [ ] **Firefox**
- [ ] **Safari**
- [ ] **Edge**

---

## 🗂️ ファイル別チェックリスト

### スキーマファイル

| ファイル | 作業内容 | ステータス |
|---------|---------|-----------|
| `prisma/schema.prisma` | Postテーブル拡張（8フィールド追加） | ⏳ 未着手 |
| `prisma/schema.prisma` | Projectテーブル調整（2フィールド追加） | ⏳ 未着手 |
| `prisma/schema.prisma` | インデックス追加（4箇所） | ⏳ 未着手 |

### サービスファイル

| ファイル | 作業内容 | ステータス |
|---------|---------|-----------|
| `src/api/db/projectService.ts` | listActiveProjects() 実装 | ⏳ 未着手 |
| `src/api/db/projectService.ts` | convertPostToProjectListItem() 実装 | ⏳ 未着手 |
| `src/api/db/projectService.ts` | determineUserRole() 実装 | ⏳ 未着手 |
| `src/api/db/projectService.ts` | determinePriority() 実装 | ⏳ 未着手 |
| `src/api/db/projectService.ts` | getProjectStats() 実装 | ⏳ 未着手 |

### APIファイル

| ファイル | 作業内容 | ステータス |
|---------|---------|-----------|
| `src/pages/api/projects/index.ts` | GET /api/projects 実装 | ⏳ 未着手 |
| `src/pages/api/projects/my.ts` | GET /api/projects/my 実装 | ⏳ 未着手 |
| `src/pages/api/projects/[id].ts` | GET /api/projects/:id 実装 | ⏳ 未着手 |
| `src/pages/api/projects/[id]/team.ts` | GET /api/projects/:id/team 実装 | ⏳ 未着手 |
| `src/pages/api/projects/[id]/approvals.ts` | GET /api/projects/:id/approvals 実装 | ⏳ 未着手 |

### コンポーネントファイル

| ファイル | 作業内容 | ステータス |
|---------|---------|-----------|
| `src/pages/ProjectListPage.tsx` | loadProjects() 実装 | ⏳ 未着手 |
| `src/pages/ProjectListPage.tsx` | デモデータ削除 | ⏳ 未着手 |
| `src/pages/ProjectListPage.tsx` | ローディング状態管理 | ⏳ 未着手 |
| `src/pages/ProjectListPage.tsx` | エラー状態管理 | ⏳ 未着手 |

### ドキュメント

| ファイル | 作業内容 | ステータス |
|---------|---------|-----------|
| `docs/api/projects.yaml` | OpenAPI仕様書作成 | ⏳ 未着手 |
| `README.md` | Projects Legacy DB統合の説明追加 | ⏳ 未着手 |

---

## 🔧 技術的詳細

### 1. Prisma Query 例

#### プロジェクト一覧取得（Post中心）

```typescript
const projects = await prisma.post.findMany({
  where: {
    projectLevel: {
      in: ['TEAM', 'DEPARTMENT', 'FACILITY', 'ORGANIZATION', 'STRATEGIC']
    },
    projectStatus: filters?.status,
    proposalType: filters?.category,
    projectFacilityId: filters?.facilityId,
    projectDepartment: filters?.department,
    // myRole フィルタ
    projectTeamMembers: {
      some: {
        userId: filters?.userId,
        role: filters?.role === 'owner' ? 'プロジェクトリーダー' : undefined,
      }
    }
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        department: true,
        permissionLevel: true,
      }
    },
    projectTeamMembers: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          }
        }
      }
    },
    projectMilestones: {
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        completedAt: true,
      }
    },
    projectApprovals: {
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        action: true,
        approverName: true,
        isEmergencyOverride: true,
        createdAt: true,
      }
    },
  },
  orderBy: [
    { projectLevel: 'desc' },
    { projectScore: 'desc' },
    { createdAt: 'desc' },
  ],
});
```

### 2. API レスポンス形式

#### GET /api/projects

```json
{
  "success": true,
  "data": [
    {
      "id": "post-123",
      "title": "新人教育プログラムの体系化",
      "description": "新人教育プログラムの体系化とメンター制度の導入を提案します",
      "status": "active",
      "progress": 65,
      "startDate": "2025-07-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z",
      "participants": 8,
      "department": "看護部",
      "facility": "小原病院",
      "category": "operational",
      "priority": "high",
      "myRole": "owner",
      "projectLevel": "DEPARTMENT",
      "isEmergencyEscalated": false,
      "escalatedBy": null,
      "escalatedDate": null,
      "approvalStatus": "approved",
      "currentApprover": "田中 美津子"
    }
  ],
  "count": 1,
  "page": 1,
  "totalPages": 1
}
```

### 3. Post → ProjectListItem 変換ロジック

```typescript
function convertPostToProjectListItem(post: Post, currentUserId: string): ProjectListItem {
  const latestApproval = post.projectApprovals[0];
  const teamMembers = post.projectTeamMembers || [];

  // タイトル抽出（最初の100文字）
  const title = post.content.split('\n')[0].substring(0, 100);

  // priority 判定
  const priority = determinePriority(post.projectLevel, post.projectScore);

  // myRole 判定
  const myRole = determineUserRole(post, teamMembers, currentUserId);

  return {
    id: post.id,
    title,
    description: post.content,
    status: post.projectStatus || 'active',
    progress: post.projectProgress || 0,
    startDate: post.projectStartDate?.toISOString(),
    endDate: post.projectEndDate?.toISOString(),
    participants: teamMembers.length,
    department: post.projectDepartment || post.author.department,
    facility: post.projectFacilityName,
    category: post.proposalType,
    priority,
    myRole,
    projectLevel: post.projectLevel,
    isEmergencyEscalated: latestApproval?.isEmergencyOverride || false,
    escalatedBy: latestApproval?.approverName,
    escalatedDate: latestApproval?.createdAt?.toISOString(),
    approvalStatus: latestApproval?.action || 'pending',
    currentApprover: latestApproval?.approverName,
  };
}

function determinePriority(projectLevel: string, projectScore: number): string {
  if (projectLevel === 'STRATEGIC' || projectLevel === 'ORGANIZATION') {
    return 'urgent';
  }
  if (projectLevel === 'FACILITY') {
    return 'high';
  }
  if (projectScore >= 200) {
    return 'high';
  }
  if (projectScore >= 100) {
    return 'medium';
  }
  return 'low';
}

function determineUserRole(
  post: Post,
  teamMembers: ProjectTeamMember[],
  userId: string
): 'owner' | 'participant' | 'viewer' {
  // 投稿者自身
  if (post.authorId === userId) {
    return 'owner';
  }

  // チームメンバーチェック
  const membership = teamMembers.find(m => m.userId === userId);
  if (!membership) {
    return 'viewer';
  }

  // プロジェクトリーダー
  if (membership.role === 'プロジェクトリーダー') {
    return 'owner';
  }

  return 'participant';
}
```

---

## 📅 実装スケジュール詳細

### 12月1日（月）～ 12月3日（水）: Phase 1

| 日付 | 作業内容 | 成果物 |
|------|---------|--------|
| 12/1 | Postテーブル拡張設計 | スキーマ設計書 |
| 12/2 | マイグレーションファイル作成・実行 | マイグレーション完了 |
| 12/3 | インデックス最適化・検証 | Prisma Client 再生成 |

### 12月4日（木）～ 12月10日（水）: Phase 2

| 日付 | 作業内容 | 成果物 |
|------|---------|--------|
| 12/4 | ProjectService拡張設計 | 関数仕様書 |
| 12/5-6 | listActiveProjects() 実装 | メソッド実装完了 |
| 12/7 | ヘルパー関数実装 | ヘルパー関数完了 |
| 12/8-9 | 単体テスト作成・実行 | テストコード完成 |
| 12/10 | リファクタリング | コードレビュー完了 |

### 12月11日（木）～ 12月13日（土）: Phase 3

| 日付 | 作業内容 | 成果物 |
|------|---------|--------|
| 12/11 | GET /api/projects 実装 | API実装完了 |
| 12/12 | GET /api/projects/my 等の実装 | API実装完了 |
| 12/13 | OpenAPI仕様書作成 | ドキュメント完成 |

### 12月14日（日）～ 12月15日（月）: Phase 4

| 日付 | 作業内容 | 成果物 |
|------|---------|--------|
| 12/14 | ProjectListPage統合 | UI統合完了 |
| 12/15 | デモデータ削除・動作確認 | 統合テスト完了 |

### 12月16日（火）～ 12月17日（水）: Phase 5

| 日付 | 作業内容 | 成果物 |
|------|---------|--------|
| 12/16 | 総合テスト・バグ修正 | テストレポート |
| 12/17 | パフォーマンステスト・最終調整 | リリース準備完了 |

### 12月18日（木）: リリース

- 本番環境へのデプロイ
- リリースノート作成
- チーム内共有

---

## 🎯 成功基準

### Phase 1 完了条件

- [ ] Postテーブルに8フィールド追加完了
- [ ] Projectテーブルに2フィールド追加完了
- [ ] マイグレーション実行成功
- [ ] Prisma Client 再生成完了

### Phase 2 完了条件

- [ ] listActiveProjects() 実装完了
- [ ] 単体テスト全パス（カバレッジ > 80%）
- [ ] コードレビュー承認

### Phase 3 完了条件

- [ ] 5つのAPIエンドポイント実装完了
- [ ] OpenAPI仕様書作成完了
- [ ] APIテスト全パス

### Phase 4 完了条件

- [ ] ProjectListPageのデモデータ削除完了
- [ ] API連携動作確認
- [ ] フィルタ機能動作確認

### Phase 5 完了条件

- [ ] 統合テスト全パス
- [ ] パフォーマンステスト合格（< 500ms）
- [ ] ブラウザ互換性テスト全パス

---

## 🚨 リスク管理

### リスク追跡表

| リスク | 発生確率 | 影響度 | 対策 | 担当 | ステータス |
|--------|---------|--------|------|------|-----------|
| Post/Project概念混同 | 中 | 中 | ドキュメント整備 | VoiceDrive | ⏳ 未対応 |
| パフォーマンス劣化 | 中 | 高 | インデックス最適化 | VoiceDrive | ⏳ 未対応 |
| データ整合性問題 | 低 | 高 | マイグレーション前チェック | VoiceDrive | ⏳ 未対応 |
| スケジュール遅延 | 中 | 中 | バッファ1週間確保 | VoiceDrive | ⏳ 未対応 |

---

## 📞 連絡先とエスカレーション

**プロジェクトリード**: VoiceDriveチーム
**Slack**: `#phase2-integration`
**緊急連絡**: プロジェクトリード直通

**エスカレーション基準**:
- スケジュール遅延が2日以上
- 重大なバグ発見
- 技術的課題の解決に3日以上かかる見込み

---

## 📚 関連ドキュメント

- [projects-legacy_DB要件分析_20251019.md](./projects-legacy_DB要件分析_20251019.md)
- [idea-tracking_DB要件分析_20251018.md](./idea-tracking_DB要件分析_20251018.md)
- [AWS Lightsail統合実装マスタープラン](./AWS_Lightsail統合実装マスタープラン_20251018.md)

---

**このマスターリストは実装の進捗に合わせて更新されます。**

**最終更新**: 2025年10月19日
**次回レビュー**: 2025年12月1日（Phase 1開始前）
