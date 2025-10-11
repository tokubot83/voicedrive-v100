# ProgressDashboard（進捗ダッシュボード）医療システム確認結果

**確認日**: 2025年10月11日
**対象ページ**: ProgressDashboard（進捗ダッシュボード）
**確認者**: 医療職員管理システム開発チーム
**ドキュメントID**: MED-SYS-CONFIRM-PROGRESS-DASHBOARD-20251011
**ステータス**: ✅ 確認完了 - 医療システム側新規実装不要

---

## 1. エグゼクティブサマリー

### 1.1 確認結論

**医療職員管理システム側の新規実装は不要です。**

- ❌ **新規API実装**: 不要
- ❌ **新規テーブル作成**: 不要
- ❌ **既存API拡張**: 不要
- ✅ **既存APIの利用**: facilities/departments/employees（既存APIをそのまま使用）

### 1.2 理由

ProgressDashboardは**複数部署・施設全体のプロジェクト進捗を俯瞰的に管理する機能**であり、VoiceDrive内部のプロジェクト管理機能です。医療システムは施設マスター・部門マスター・職員情報の提供のみを行います（既存APIで対応可能）。

#### 機能概要
```
プロジェクト一覧表示（VoiceDrive管理）
  ↓
マイルストーン管理（VoiceDrive管理）
  ↓
チームメンバー管理（VoiceDrive管理）
  ↓
進捗計算・遅延判定（VoiceDrive管理）
  ↓
統計サマリー表示（VoiceDrive管理）

医療システムの役割：
- 施設マスター提供（GET /api/v2/facilities - 既存API）
- 部門マスター提供（GET /api/v2/departments - 既存API）
- 職員情報提供（GET /api/v2/employees/{id} - 既存API）
```

### 1.3 データ責任分担

| 項目 | VoiceDrive | 医療システム |
|------|-----------|------------|
| プロジェクト情報（Post） | ✅ 100% | ❌ なし |
| マイルストーン（ProjectMilestone） | ✅ 100% | ❌ なし |
| チームメンバー（ProjectTeamMember） | ✅ 100% | ❌ なし |
| 進捗計算 | ✅ 100% | ❌ なし |
| 遅延判定 | ✅ 100% | ❌ なし |
| 施設マスター | キャッシュのみ | ✅ マスタ管理 |
| 部門マスター | キャッシュのみ | ✅ マスタ管理 |
| 職員情報 | キャッシュのみ | ✅ マスタ管理 |

---

## 2. 医療システム連携分析

### 2.1 使用する既存API

| API | 用途 | 頻度 | 備考 |
|-----|------|------|------|
| GET /api/v2/facilities | 施設マスター取得 | 初回読み込み時 | プロジェクトレベル判定・施設名表示 |
| GET /api/v2/departments | 部門マスター取得 | 初回読み込み時 | プロジェクトレベル判定・部門名表示 |
| GET /api/v2/employees/{id} | 職員情報取得 | 必要時 | チームメンバー詳細表示、権限確認 |

### 2.2 APIの使用目的

#### 2.2.1 GET /api/v2/facilities

**使用箇所**:
- プロジェクト一覧表示時の施設名表示
- プロジェクトレベル判定（FACILITY/ORGANIZATION）

**呼び出しパターン**:
```typescript
// 初回読み込み時に全施設取得してキャッシュ
const response = await fetch('/api/v2/facilities', {
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'X-API-Key': API_KEY
  }
});

const facilities = await response.json();
// VoiceDrive内部でキャッシュ保持（日次更新）
```

**想定呼び出し頻度**: 1日1回（キャッシュ更新時）

**レスポンス期待値**:
```json
{
  "data": [
    {
      "id": "facility-001",
      "name": "東京第一病院",
      "code": "TKH001",
      "type": "hospital"
    }
  ]
}
```

#### 2.2.2 GET /api/v2/departments

**使用箇所**:
- プロジェクト一覧表示時の部門名表示
- プロジェクトレベル判定（DEPARTMENT）

**呼び出しパターン**:
```typescript
// 初回読み込み時に全部門取得してキャッシュ
const response = await fetch('/api/v2/departments', {
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'X-API-Key': API_KEY
  }
});

const departments = await response.json();
// VoiceDrive内部でキャッシュ保持（日次更新）
```

**想定呼び出し頻度**: 1日1回（キャッシュ更新時）

**レスポンス期待値**:
```json
{
  "data": [
    {
      "id": "dept-001",
      "facilityId": "facility-001",
      "name": "看護部",
      "code": "NURS"
    }
  ]
}
```

#### 2.2.3 GET /api/v2/employees/{id}

**使用箇所**:
- チームメンバー詳細情報表示
- ユーザー権限レベル確認（Level 10+チェック）

**呼び出しパターン**:
```typescript
// 必要時に個別取得（User.permissionLevelがキャッシュされていない場合）
const response = await fetch(`/api/v2/employees/${employeeId}`, {
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'X-API-Key': API_KEY
  }
});

const employee = await response.json();
// 権限レベル確認に使用
```

**想定呼び出し頻度**: 必要時のみ（VoiceDrive User テーブルにキャッシュ済みのため稀）

**レスポンス期待値**:
```json
{
  "data": {
    "id": "emp-001",
    "name": "山田太郎",
    "facilityId": "facility-001",
    "departmentId": "dept-001",
    "position": "部長",
    "level": 10
  }
}
```

### 2.3 新規API不要の理由

**結論**: ProgressDashboardページは **既存医療システムAPIのみで完結** します。

**理由**:
- ✅ 施設マスター・部門マスター・職員情報は既存APIで取得可能
- ✅ プロジェクトデータはすべてVoiceDrive内部で管理
- ✅ 進捗計算・遅延判定はVoiceDrive内部で実施
- ✅ 権限レベル（User.permissionLevel）は既にキャッシュ済み

### 2.4 医療システムAPIへの負荷影響分析

#### 2.4.1 予想負荷

| API | 呼び出し頻度 | 同時アクセス数（想定） | 負荷レベル |
|-----|------------|---------------------|----------|
| GET /api/v2/facilities | 1日1回 | 1-5 | 極小 ⭕ |
| GET /api/v2/departments | 1日1回 | 1-5 | 極小 ⭕ |
| GET /api/v2/employees/{id} | 必要時のみ | 1-10 | 極小 ⭕ |

#### 2.4.2 キャッシング戦略

VoiceDrive側で以下のキャッシュを実装予定：

```typescript
// キャッシュ期限: 24時間
const CACHE_TTL = 86400; // 1日

// 施設マスターキャッシュ
await redis.setex('facilities:all', CACHE_TTL, JSON.stringify(facilities));

// 部門マスターキャッシュ
await redis.setex('departments:all', CACHE_TTL, JSON.stringify(departments));
```

**効果**: 医療システムAPIへの呼び出しを **99%削減**

---

## 3. VoiceDrive側実装要件

### 3.1 データベース設計（優先度: 🔴 最高）

#### 3.1.1 新規テーブル（2個）

**ProjectMilestone（プロジェクトマイルストーン）**

| フィールド | 型 | 説明 |
|-----------|---|------|
| id | String | マイルストーンID |
| projectId | String | プロジェクトID（Post.id） |
| title | String | マイルストーン名 |
| description | String? | 説明 |
| dueDate | DateTime | 期限日時 |
| completedAt | DateTime? | 完了日時 |
| completedBy | String? | 完了者ID（User.id） |
| status | String | ステータス（pending/in_progress/completed/cancelled） |
| order | Int | 表示順序 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**ProjectTeamMember（プロジェクトチームメンバー）**

| フィールド | 型 | 説明 |
|-----------|---|------|
| id | String | メンバーID |
| projectId | String | プロジェクトID（Post.id） |
| userId | String | ユーザーID（User.id） |
| role | String | 役割（leader/sub_leader/member/observer） |
| joinedAt | DateTime | 参加日時 |
| leftAt | DateTime? | 退出日時 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### 3.1.2 既存テーブル拡張（1個）

**Post（プロジェクト管理フィールド追加）**

| 新規フィールド | 型 | 説明 |
|--------------|---|------|
| projectDueDate | DateTime? | プロジェクト期限 |
| projectLevel | String? | プロジェクトレベル（team/department/facility/organization） |
| projectProgress | Int? | 進捗率（0-100） |

#### 3.1.3 パフォーマンス最適化インデックス

```sql
-- Post: プロジェクト一覧取得用複合インデックス
CREATE INDEX "Post_type_status_createdAt_idx"
ON "Post"("type", "status", "createdAt" DESC);

-- Post: 期限ソート用
CREATE INDEX "Post_projectDueDate_idx"
ON "Post"("project_due_date");

-- Post: プロジェクトレベルフィルタリング用
CREATE INDEX "Post_projectLevel_idx"
ON "Post"("project_level");

-- ProjectMilestone: プロジェクトID絞り込み用
CREATE INDEX "ProjectMilestone_projectId_idx"
ON "project_milestones"("project_id");

-- ProjectTeamMember: プロジェクトID絞り込み用
CREATE INDEX "ProjectTeamMember_projectId_idx"
ON "project_team_members"("project_id");
```

### 3.2 VoiceDrive側API（3個）

1. **GET /api/progress-dashboard/projects** - プロジェクト一覧取得
2. **GET /api/progress-dashboard/stats** - 統計サマリー取得
3. **GET /api/progress-dashboard/projects/:projectId/milestones** - マイルストーン一覧取得

### 3.3 権限ベースアクセス制御

#### 3.3.1 アクセス権限レベル

**対象ユーザー**: Level 10+（部長以上）

| ユーザーレベル | アクセス範囲 | 説明 |
|--------------|------------|------|
| Level 10（部長） | 自部門のみ | 自部門のプロジェクトのみ表示 |
| Level 11（事務長） | 自施設のみ | 自施設のプロジェクトのみ表示 |
| Level 12（副院長） | 自施設のみ | 自施設のプロジェクトのみ表示 |
| Level 13+（院長・理事） | 全施設 | 全施設のプロジェクトを表示可能 |

#### 3.3.2 アクセス制御ロジック

```typescript
// Level 10（部長）: 自部門のみ
if (user.level === 10) {
  where.author = {
    facilityId: user.facilityId,
    departmentId: user.departmentId
  };
}

// Level 11-12（事務長・副院長）: 自施設のみ
else if (user.level >= 11 && user.level < 13) {
  where.author = {
    facilityId: user.facilityId
  };
}

// Level 13+（院長・理事）: 全施設アクセス可能
// フィルタなし
```

### 3.4 進捗計算・遅延判定ロジック

#### 3.4.1 進捗率計算

```typescript
// マイルストーン完了率から自動計算
const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
const totalMilestones = project.milestones.length;

const progress = totalMilestones > 0
  ? Math.round((completedMilestones / totalMilestones) * 100)
  : project.projectProgress || 0;
```

#### 3.4.2 遅延判定

```typescript
// 期限日時 < 現在日時 && status !== 'completed'
const now = new Date();
const isDelayed = project.projectDueDate &&
                 project.projectDueDate < now &&
                 project.status !== 'completed';
```

---

## 4. 確認チェックリスト

### 4.1 医療システム側確認事項

| 項目 | 状態 | 備考 |
|------|------|------|
| 既存API `/api/v2/facilities` 利用可能 | ✅ 確認済 | そのまま使用可能 |
| 既存API `/api/v2/departments` 利用可能 | ✅ 確認済 | そのまま使用可能 |
| 既存API `/api/v2/employees/{id}` 利用可能 | ✅ 確認済 | そのまま使用可能 |
| 新規API実装不要 | ✅ 確認済 | 追加APIなし |
| 新規テーブル作成不要 | ✅ 確認済 | 医療システム側DB変更なし |
| 既存APIへの負荷影響確認 | ✅ 確認済 | キャッシング戦略により影響極小 |

### 4.2 VoiceDrive側確認事項

| 項目 | 状態 | 備考 |
|------|------|------|
| ProjectMilestoneテーブル作成 | ⏳ 実装予定 | schema.prisma更新済み |
| ProjectTeamMemberテーブル作成 | ⏳ 実装予定 | schema.prisma更新済み |
| Postテーブル拡張 | ⏳ 実装予定 | projectDueDate等追加済み |
| 複合インデックス追加 | ⏳ 実装予定 | 3つのインデックス追加済み |
| API実装（3エンドポイント） | ⏳ 実装予定 | 暫定マスターリストに実装例あり |
| 権限チェックロジック実装 | ⏳ 実装予定 | Level 10+チェック必須 |
| ユニットテスト作成 | ⏳ 実装予定 | 15ケース以上推奨 |
| API統合テスト作成 | ⏳ 実装予定 | 12ケース以上推奨 |

---

## 5. 実装推奨事項

### 5.1 パフォーマンス最適化（優先度: 🔴 最高）

#### 5.1.1 N+1クエリ対策

```typescript
// ❌ NG: N+1クエリ発生
const projects = await prisma.post.findMany({ where: { type: 'project' } });
for (const project of projects) {
  const milestones = await prisma.projectMilestone.findMany({
    where: { projectId: project.id }
  });
}

// ✅ OK: includeで一括取得
const projects = await prisma.post.findMany({
  where: { type: 'project' },
  include: {
    milestones: true,
    teamMembers: true,
    _count: {
      select: {
        milestones: true,
        teamMembers: true
      }
    }
  }
});
```

#### 5.1.2 医療システムAPIキャッシング

```typescript
// キャッシュ期限: 24時間
const CACHE_TTL = 86400;

async function getFacilitiesWithCache() {
  const cached = await redis.get('facilities:all');
  if (cached) {
    return JSON.parse(cached);
  }

  // 医療システムAPI呼び出し
  const response = await fetch('/api/v2/facilities');
  const facilities = await response.json();

  // キャッシュ保存
  await redis.setex('facilities:all', CACHE_TTL, JSON.stringify(facilities));

  return facilities;
}
```

### 5.2 セキュリティ対策（優先度: 🔴 最高）

#### 5.2.1 認証・認可ミドルウェア

```typescript
export const requireProgressDashboardPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '認証が必要です'
      }
    });
  }

  // Level 10+チェック
  if (user.permissionLevel < 10) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'このページは部長以上のみアクセス可能です',
        details: `User level: ${user.permissionLevel}, Required: 10+`
      }
    });
  }

  next();
};
```

#### 5.2.2 データアクセス制御

```typescript
// WHERE条件に必ず権限フィルタを含める
if (user.level === 10) {
  where.author = {
    facilityId: user.facilityId,
    departmentId: user.departmentId  // 必須
  };
}
```

### 5.3 テスト推奨事項（優先度: 🔴 最高）

#### 5.3.1 権限テスト（必須）

```typescript
describe('ProgressDashboard Permission Tests', () => {
  it('Level 9はアクセス不可', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level9Token}` }
    });
    expect(response.status).toBe(403);
  });

  it('Level 10は自部門のみアクセス可能', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level10Token}` }
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    data.data.forEach((project: any) => {
      expect(project.author.departmentId).toBe(user.departmentId);
    });
  });

  it('Level 13は全施設アクセス可能', async () => {
    const response = await fetch('/api/progress-dashboard/projects', {
      headers: { Authorization: `Bearer ${level13Token}` }
    });
    expect(response.status).toBe(200);

    const data = await response.json();
    const facilities = [...new Set(data.data.map((p: any) => p.author.facilityId))];
    expect(facilities.length).toBeGreaterThan(1);
  });
});
```

---

## 6. リスク・注意事項

### 6.1 パフォーマンスリスク（優先度: 🟠 高）

**リスク**: プロジェクト数増加に伴う一覧取得クエリの遅延

**影響**:
- 1,000プロジェクト超過時: 500ms-1秒のレスポンスタイム
- マイルストーン/チームメンバーのN+1クエリ発生リスク

**対策**:
- ✅ 複合インデックスの追加
- ✅ includeでN+1クエリ回避
- ✅ limitによるページング実装

### 6.2 権限制御リスク（優先度: 🔴 最高）

**リスク**: Level 10ユーザーが他部門のプロジェクトを閲覧

**影響**:
- セキュリティインシデント
- プライバシー侵害

**対策**:
- ✅ WHERE条件に必ず権限フィルタを含める
- ✅ フロントエンドとバックエンドの両方で権限チェック
- ✅ 各権限レベルでの徹底テスト

### 6.3 医療システムAPI呼び出しリスク（優先度: 🟡 中）

**リスク**: facilities/departments APIの呼び出し頻度が高い

**影響**:
- 医療システムへの負荷増加
- レスポンスタイムの悪化

**対策**:
- ✅ VoiceDrive側でキャッシュ保持（日次更新）
- ✅ 初回読み込み時のみ医療システムAPIを呼び出し
- ✅ キャッシュ期限切れ時のみ再取得

---

## 7. 実装スケジュール

### Phase 1: DB・サービス層実装（3.5日間）

**Day 1-2**: スキーマ設計・マイグレーション
- [x] schema.prisma更新（ProjectMilestone/ProjectTeamMember追加）
- [ ] マイグレーション実行
- [ ] ProgressDashboardService 実装

**Day 3**: API実装・テスト
- [ ] API実装（3エンドポイント）
- [ ] ユニットテスト作成

### Phase 2: フロントエンド統合（2日間）

**Day 4-5**: UI実装
- [ ] useProgressDashboard() カスタムフック作成
- [ ] ProgressDashboardPage.tsx 修正
- [ ] エラーハンドリング実装

### Phase 3: テスト・デプロイ（2日間）

**Day 6-7**: テスト・デプロイ
- [ ] 統合テスト
- [ ] 権限チェックテスト
- [ ] パフォーマンステスト
- [ ] 本番デプロイ

**合計**: 9日間

---

## 8. まとめ

### 8.1 医療システム側の対応

✅ **新規実装不要**: 既存API（facilities/departments/employees）で対応可能
✅ **既存機能で対応**: 新しいエンドポイント追加は不要です

### 8.2 VoiceDrive側の実装要件

- 🔧 **新規テーブル作成**: ProjectMilestone/ProjectTeamMember（必須）
- 🔧 **Postテーブル拡張**: projectDueDate/projectLevel/projectProgress（必須）
- 🔧 **API実装**: 3エンドポイント（必須）
- 📊 **ユニットテスト**: 15ケース以上
- 📊 **API統合テスト**: 12ケース以上
- 📊 **権限テスト**: Level 10/13での動作確認（必須）

### 8.3 実装優先度

1. **Phase 1（必須）**: DB・サービス層実装 + ユニットテスト
2. **Phase 2（推奨）**: API実装 + フロントエンド統合
3. **Phase 3（必須）**: テスト + デプロイ

**推定工数**: 9日間（Phase 1-3）

---

**承認状態**: ✅ 医療システム側確認完了 - 新規実装不要
**次のアクション**: VoiceDriveチームによる実装開始

---

**添付ファイル**:
- [progress-dashboard_DB要件分析_20251011.md](./progress-dashboard_DB要件分析_20251011.md)（DB設計詳細）
- [progress-dashboard暫定マスターリスト_20251011.md](./progress-dashboard暫定マスターリスト_20251011.md)（実装例）

**関連ドキュメント**:
- `共通DB構築後_作業再開指示書_20250928.md`（更新対象）

---

**文書終了**

**最終更新**: 2025年10月11日
**次のステップ**: VoiceDriveチームからの実装承認待ち
**承認者**: 医療職員管理システム プロジェクトマネージャー
