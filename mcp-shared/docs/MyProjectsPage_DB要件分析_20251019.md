# MyProjectsPageページ DB要件分析

**文書番号**: DB-REQ-2025-1019-002
**作成日**: 2025年10月19日
**対象ページ**: https://voicedrive-v100.vercel.app/MyProjectsPage
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)

---

## 📋 分析サマリー

### 結論
MyProjectsPageは**現在デモデータで動作**しており、**Prisma schema上のProjectテーブルが存在しない**ため、本番運用には**プロジェクト管理用の包括的なDBスキーマ追加が必須**です。

### 🔴 重大な不足項目（即対応必要）

1. **`Project`テーブル完全不足**
   - MyProjectsPage全体がdemoProjects配列に依存（src/data/demo/projects.ts）
   - VoiceDrive Prisma schemaに`Project`モデルが存在しない
   - プロジェクト管理機能が本番DBに未実装

2. **`ProjectTeamMember`関連テーブル不足**
   - teamMembers情報を格納するテーブルがない
   - 仮選出中メンバー(provisionalMembers)の管理テーブルがない

3. **`ProjectWorkflowStage`テーブル不足**
   - 承認フロー(workflowStages)を管理するテーブルがない
   - 現在審査中のステージ判定ができない

4. **`ProjectMilestone`テーブル不足**
   - マイルストーン管理テーブルがない
   - 進捗管理ができない

---

## 🔍 詳細分析

### 1. 統計カード（174-211行目）

#### 表示内容
```typescript
// 提案済みプロジェクト数
{projectGroups.find(g => g.title === '提案したプロジェクト')?.projects.length || 0}

// 承認待ちプロジェクト数
{projectGroups.find(g => g.title === '承認待ちプロジェクト')?.projects.length || 0}

// 参加中プロジェクト数
{projectGroups.find(g => g.title === '参加中プロジェクト')?.projects.length || 0}

// 仮選出中プロジェクト数
{projectGroups.find(g => g.title === '仮選出中プロジェクト')?.projects.length || 0}
```

#### 必要なデータソース

| 統計項目 | データ管理責任 | 現在の状態 | 必要なテーブル | 状態 |
|---------|--------------|-----------|--------------|------|
| 提案済み数 | VoiceDrive | ❌ デモデータ | `Project` | 🔴 **要追加** |
| 承認待ち数 | VoiceDrive | ❌ デモデータ | `Project` + `ProjectWorkflowStage` | 🔴 **要追加** |
| 参加中数 | VoiceDrive | ❌ デモデータ | `Project` + `ProjectTeamMember` | 🔴 **要追加** |
| 仮選出中数 | VoiceDrive | ❌ デモデータ | `Project` + `ProjectProvisionalMember` | 🔴 **要追加** |

#### ロジック詳細

**提案済み（42-43行目）**:
```typescript
const proposedProjects = demoProjects.filter(p => p.createdBy === activeUser.id);
```
→ **必要**: `Project.createdBy`フィールド

**承認待ち（45-51行目）**:
```typescript
const approvingProjects = demoProjects.filter(p =>
  (p.workflowStages || []).some(w =>
    w.approver === activeUser.id &&
    w.status === 'in_progress'
  )
);
```
→ **必要**: `ProjectWorkflowStage`テーブル

**参加中（53-58行目）**:
```typescript
const participatingProjects = demoProjects.filter(p =>
  (p.teamMembers || []).some(member => member.userId === activeUser.id) &&
  p.status !== 'completed' &&
  p.status !== 'rejected'
);
```
→ **必要**: `ProjectTeamMember`テーブル、`Project.status`

---

### 2. プロジェクトリスト表示（280-325行目）

#### 表示内容
```typescript
{project.title}                              // プロジェクトタイトル
{getStatusBadge(project.status)}             // ステータスバッジ
{project.description}                        // 説明文
{initiator?.name || '不明'}                  // 提案者名
{project.createdAt.toLocaleDateString('ja-JP')} // 作成日
{currentWorkflow.name}                       // 現在の承認ステージ
{project.provisionalMembers?.length || 0}    // 仮選出メンバー数
```

#### 必要なデータソース

| 表示項目 | VoiceDrive | 医療システム | データ管理責任 | 状態 |
|---------|-----------|-------------|--------------|------|
| `title` | ❌ | ❌ | VoiceDrive | 🔴 **Project不足** |
| `status` | ❌ | ❌ | VoiceDrive | 🔴 **Project不足** |
| `description` | ❌ | ❌ | VoiceDrive | 🔴 **Project不足** |
| `createdBy` | ❌ | ❌ | VoiceDrive | 🔴 **Project不足** |
| `createdByName` | キャッシュ | ✅ マスタ | 医療システム | ✅ OK（Userから） |
| `workflowStages` | ❌ | ❌ | VoiceDrive | 🔴 **テーブル不足** |
| `teamMembers` | ❌ | ❌ | VoiceDrive | 🔴 **テーブル不足** |
| `provisionalMembers` | ❌ | ❌ | VoiceDrive | 🔴 **テーブル不足** |

**評価**: 🔴 **全てのプロジェクト関連テーブルが不足**

---

## 📋 必要な追加テーブル一覧

### VoiceDrive側で追加が必要（🔴 優先度: 最高）

**A. Project（プロジェクトマスタ）** - MyProjectsPage 42-330行目

**B. ProjectTeamMember（チームメンバー）** - MyProjectsPage 53-58行目

**C. ProjectProvisionalMember（仮選出メンバー）** - MyProjectsPage 60-64行目、311-315行目

**D. ProjectWorkflowStage（承認フロー）** - MyProjectsPage 45-51行目、282-309行目

**E. ProjectMilestone（マイルストーン）** - 将来のProjectDetailPage

---

### 医療システム側で追加が必要

#### 評価: ❌ **不要**

**理由**:
- プロジェクト管理は100%VoiceDrive管轄
- 医療システムは統計情報のみ取得（API経由）

---

## 🎯 実装優先順位

### Phase 1: 最小限の動作（3-5日）

1. 🔴 Projectテーブル追加
2. 🔴 ProjectTeamMemberテーブル追加
3. 🔴 ProjectWorkflowStageテーブル追加
4. 🔴 ProjectProvisionalMemberテーブル追加
5. 🔴 Prisma migrate実行
6. 🔴 Project CRUD API実装
7. 🔴 MyProjectsPageの修正（demoProjects → 実DB）

**このPhaseで動作する機能**:
- ✅ 統計カード（実データ）
- ✅ プロジェクト一覧（実データ）
- ✅ プロジェクトグループ分け（実データ）

---

### Phase 2: マイルストーン対応（2-3日）

1. 🟡 ProjectMilestoneテーブル追加
2. 🟡 Milestone CRUD API実装
3. 🟡 進捗計算ロジック実装

---

### Phase 3: 高度な機能（3-4日）

1. 🟢 ProjectVoteテーブル追加
2. 🟢 スコアリングエンジン実装
3. 🟢 投票機能実装

---

## ✅ チェックリスト

### VoiceDrive側の実装

#### Phase 1
- [ ] Projectテーブル追加（Prisma schema）
- [ ] ProjectTeamMemberテーブル追加
- [ ] ProjectWorkflowStageテーブル追加
- [ ] ProjectProvisionalMemberテーブル追加
- [ ] Prisma migrate実行
- [ ] Project CRUD API実装
- [ ] MyProjectsPageの修正

---

**文書終了**

最終更新: 2025年10月19日
バージョン: 1.0
次回レビュー: Phase 1実装後
