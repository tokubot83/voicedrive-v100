# TeamLeaderDashboard DB要件分析

**文書番号**: VD-DB-TEAMLEADER-2025-1009-001（訂正版）
**作成日**: 2025年10月9日
**訂正日**: 2025年10月9日
**対象ページ**: TeamLeaderDashboard（現場リーダーダッシュボード）
**対象ファイル**: `src/components/dashboards/TeamLeaderDashboard.tsx` (255行)
**URL**: https://voicedrive-v100.vercel.app/team-leader
**優先度**: 🔴 HIGH
**グループ**: 1 (コアページ)
**ステータス**: ✅ 分析完了（Option B採用に訂正）

---

## ⚠️ 訂正履歴

**訂正理由**: 医療システムチームから既に回答済みの**Option B（Team = Department、API-3流用）**を見落とし、矛盾する内容を記載していました。

**訂正内容**:
- ❌ 削除: API-5、API-6の新規実装要求
- ✅ 変更: DepartmentStation API-3を流用
- ✅ 追加: Option B採用の明記

---

## 📋 エグゼクティブサマリー

### 分析結果概要

TeamLeaderDashboardはLEVEL_2権限（主任・師長）専用のチーム管理画面です。データ管理責任分界点定義書に基づき分析した結果：

- ✅ **新規テーブル**: 不要（ApprovalTask既に実装済み）
- ✅ **不足フィールド**: なし
- ✅ **医療システムAPI要求**: なし（**Option B採用: DepartmentStation API-3を流用**）
- ✅ **VoiceDrive集計機能**: 3つ実装必要
- 🔵 **データ依存度**: 医療システム 30%（API-3のみ）、VoiceDrive 70%

### 主要機能

1. **チーム統計** - メンバー数、チーム効率、承認待ち件数
2. **チームメンバー一覧** - メンバー情報、ステータス、パフォーマンス（**DepartmentStation API-3流用**）
3. **承認待ちタスク** - 予算申請、研修申請等の承認管理
4. **最近の活動** - チーム内の最新活動ログ
5. **チームモラル** - 満足度、目標達成率（**Phase 8.6で実装予定**）

---

## 🎯 ページ機能詳細分析

### 機能1: チーム統計 (lines 103-135)

#### 表示項目

| 項目 | 変数 | データソース | 管理責任 | API |
|------|------|------------|---------|-----|
| チームメンバー数 | `teamMetrics.memberCount` | Department | 🔵 医療システム | **API-3流用** |
| チーム効率 | `teamMetrics.teamEfficiency` | ApprovalTask完了率 | 🟢 VoiceDrive | VD集計 |
| 承認待ち件数 | `teamMetrics.pendingApprovals` | ApprovalTask集計 | 🟢 VoiceDrive | VD集計 |

#### 現状の問題

```typescript
// TeamLeaderDashboard.tsx:13-20
const teamMetrics = {
  memberCount: 12,          // ❌ ハードコード
  teamEfficiency: 84,       // ❌ ハードコード
  pendingApprovals: 5,      // ❌ ハードコード
};
```

---

### 機能2: チームメンバー一覧 (lines 139-171)

#### 現状の問題

```typescript
// TeamLeaderDashboard.tsx:22-27
const teamMembers = [
  { id: 1, name: '山田太郎', role: 'シニアエンジニア', status: 'active', performance: 92 },
  // ❌ 完全にハードコード
];
```

---

### 機能3: 承認待ちタスク (lines 174-201)

✅ **ApprovalTaskテーブル既に実装済み**（ComposeForm分析時に追加）

必要な実装: DB集計ロジック

---

### 機能4: チームモラル (lines 224-246)

医療システムAPI-6が必要（満足度、目標達成率等）

---

## 🔍 Option B採用による実装方針

### 決定事項: Team = Department のエイリアス

医療システムチームからの回答（Response_TeamLeaderDashboard_Confirmation_20251009.md）に基づき、**Option B**を採用します。

**Option B**: Team = Department のエイリアス

| 概念 | 医療システム | VoiceDrive表示 |
|------|------------|---------------|
| Team | Department（部門） | "チーム"として表示 |
| TeamLeader | permissionLevel >= 2.0 | "チームリーダー"として表示 |
| チームメンバー | 同じDepartmentのEmployee | **DepartmentStation API-3で取得** |

### 使用API

**DepartmentStation API-3（既存）**:

```json
GET /api/employees/department/{departmentId}

{
  "department": {
    "departmentId": "medical_care_ward",
    "departmentName": "医療療養病棟",
    "memberCount": 12
  },
  "members": [
    {
      "employeeId": "OH-NS-2024-001",
      "name": "山田 太郎",
      "position": "主任",
      "permissionLevel": 2.0,
      "accountType": "MANAGER",
      "status": "active"
    }
  ]
}
```

**VoiceDrive側での変換**:

```typescript
// API-3を呼び出し、"team"として扱う
const departmentData = await medicalSystemAPI.getDepartmentMembers(user.department);

const teamMembers = departmentData.members.map(member => ({
  ...member,
  role: member.position,  // positionをroleとして表示
  performance: member.permissionLevel * 10  // 暫定的に算出
}));
```

### 削除された要求

- ❌ **API-5削除**: チームメンバー情報取得（API-3で代替）
- ⏸️ **API-6保留**: チームモラル情報（Phase 8.6で実装予定）

### コスト削減効果

- ✅ 医療システム側実装: **ゼロ**
- ✅ 開発工数削減: **5人日**
- ✅ 開発コスト削減: **¥225,000**

---

## 📦 VoiceDrive DB変更要件

### 結論: ❌ 変更不要

ApprovalTaskテーブルは既に実装済み。

---

## 🛠️ 実装優先順位（Option B採用版）

### Phase 8.5: TeamLeaderDashboard実装（11月18日〜26日）

**VoiceDrive側実装**:

1. **TeamLeaderService.ts 実装**
   - getPendingApprovals() - 承認待ちタスク集計
   - respondToApproval() - 承認/却下操作
   - getRecentActivities() - 最近の活動集計
   - getTeamMetrics() - チーム統計算出

2. **TeamLeaderDashboard.tsx 修正**
   - DepartmentStation API-3を呼び出してチームメンバー表示
   - ApprovalTaskテーブルから承認待ちタスク表示
   - Post/Vote/ApprovalTaskから最近の活動表示
   - チームモラルセクションをコメントアウト（Phase 8.6まで非表示）

**医療システム側実装**: **なし**（API-3既存流用）

---

### Phase 8.6: チームモラル機能（12月1日〜15日）

**医療システム側実装**:
- API-6実装（チームモラル情報取得）

**VoiceDrive側実装**:
- チームモラルセクションの表示実装

---

**文書終了**

最終更新: 2025年10月9日（訂正版）
訂正理由: Option B採用を反映（医療システムチームからの指摘による）
