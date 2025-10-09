# TeamLeaderDashboard 暫定マスターリスト

**文書番号**: VD-MASTER-TEAMLEADER-2025-1009-001（訂正版）
**作成日**: 2025年10月9日
**訂正日**: 2025年10月9日
**対象**: 医療職員管理システムチーム
**目的**: TeamLeaderDashboard機能に必要なマスターデータおよびAPI要求の共有
**参照文書**: [TeamLeaderDashboard_DB要件分析_20251009.md](./TeamLeaderDashboard_DB要件分析_20251009.md)

---

## ⚠️ 訂正履歴

**訂正理由**: 医療システムチームから既に回答済みの**Option B（Team = Department、API-3流用）**を見落とし、矛盾する内容を記載していました。

**訂正内容**:
- ❌ 削除: API-5、API-6の新規実装要求
- ✅ 変更: DepartmentStation API-3を流用
- ✅ 追加: Option B採用の明記
- ✅ コスト削減: ¥225,000削減を確認

---

## 📋 概要

VoiceDrive TeamLeaderDashboardページ（現場リーダーダッシュボード）の実装に必要なマスターデータとAPI要求をまとめました。

- ✅ **医療システムAPI**: なし（**Option B採用: DepartmentStation API-3流用**）
- ⏸️ **新規API**: 1つのみ（チームモラル情報、Phase 8.6で実装予定）
- ✅ **VoiceDrive側実装**: TeamLeaderService（承認タスク集計）
- 🔵 **マスターデータ**: 提供済み（追加なし）
- 💰 **コスト削減**: ¥225,000削減（API-5削除）

---

## 🎯 医療システムAPI使用方針（Option B採用）

### ✅ DepartmentStation API-3流用

**決定事項**: 医療システムチームからの回答により、**Option B（Team = Department）**を採用します。

| 概念 | 医療システム | VoiceDrive表示 |
|------|------------|---------------|
| Team | Department（部門） | "チーム"として表示 |
| TeamLeader | permissionLevel >= 2.0 | "チームリーダー"として表示 |
| チームメンバー | 同じDepartmentのEmployee | API-3で取得 |

**エンドポイント**: `GET /api/employees/department/{departmentId}`

**レスポンス例**:
```json
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
  performance: calculatePerformance(member)  // VoiceDrive側で算出
}));
```

**優先度**: ✅ 実装済み（DepartmentStationで使用中）
**追加コスト**: **¥0**（既存API流用）

---

### ⏸️ API-6: チームモラル情報（Phase 8.6で実装予定）

**エンドポイント**: `GET /api/teams/{leaderId}/morale`

**現状**: ❌ 未実装（Phase 8.6まで保留）

**レスポンス例**:
```json
{
  "moraleScore": 78.0,
  "breakdown": {
    "satisfactionRate": 78.0,
    "goalAchievementRate": 92.0,
    "communicationQuality": "good"
  }
}
```

**データソース**:
- `Interview` → 満足度
- `Goal` → 目標達成率

**優先度**: 🟡 MEDIUM
**納期希望**: Phase 8.6（12月1日〜15日）

---

## ✅ 実装チェックリスト

### Phase 8.5: TeamLeaderDashboard実装（11月18日〜26日）

#### 医療システム側

- [x] API-3提供済み（DepartmentStation流用）
- [ ] **実装不要**（Option B採用）

#### VoiceDrive側

- [ ] TeamLeaderService.ts実装
  - [ ] getPendingApprovals() - ApprovalTask集計
  - [ ] respondToApproval() - 承認/却下操作
  - [ ] getRecentActivities() - Post/Vote/ApprovalTaskから最新活動取得
  - [ ] getTeamMetrics() - チーム統計算出（効率、承認待ち件数）
- [ ] TeamLeaderDashboard.tsx修正
  - [ ] DepartmentStation API-3呼び出し実装
  - [ ] チームメンバー表示（API-3データ変換）
  - [ ] 承認待ちタスク表示（ApprovalTaskテーブル）
  - [ ] 最近の活動表示
  - [ ] チームモラルセクションをコメントアウト（Phase 8.6まで非表示）

### Phase 8.6: チームモラル機能（12月1日〜15日）

#### 医療システム側

- [ ] API-6実装（チームモラル情報取得）

#### VoiceDrive側

- [ ] チームモラルセクション実装
- [ ] API-6統合

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-10-09 | 1.0 | 初版作成 |
| 2025-10-09 | 1.1（訂正版） | Option B採用を反映、API-5削除、API-6をPhase 8.6に延期 |

---

**文書終了**

最終更新: 2025年10月9日（訂正版）
訂正理由: 医療システムチームからの回答（Option B）を反映、¥225,000コスト削減を確認
