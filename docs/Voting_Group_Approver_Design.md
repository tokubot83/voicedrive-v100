# 投票グループ承認者設計書

**作成日**: 2025-10-12
**バージョン**: 1.0.0
**ステータス**: 実装完了

---

## 📋 概要

投票グループで複数部門を統合した場合の**プロジェクト承認者決定ロジック**を実装しました。

### 背景

小規模部門（例: 診療支援部5名、薬剤部3名、事務部8名）を1つの投票グループ（16名）に統合した場合、各部門に部長（Level 10）が存在するため、誰がプロジェクト承認者になるかが不明確でした。

---

## 🎯 設計方針

### Option 1: 代表承認者指定（採用）

投票グループ作成時に**代表承認者を1名指定**する方式

**メリット**:
- シンプルで分かりやすい
- 承認プロセスが明確
- Level 99が柔軟に設定可能
- ローテーション機能で公平性確保

**デメリット**:
- 初期設定が必要

### 代替案（不採用）

- **Option 2**: 合議制（全員承認） → 承認が遅延
- **Option 3**: 最上位者が承認 → 組織によって基準が曖昧

---

## 🗄️ データベース設計

### VotingGroup モデル拡張

```prisma
model VotingGroup {
  id                String   @id @default(cuid())
  groupId           String   @unique
  groupName         String
  memberDepartmentIds Json

  // 🆕 承認者管理フィールド
  primaryApproverId String?  @map("primary_approver_id")  // 代表承認者のユーザーID
  approverRotation  Json?    @map("approver_rotation")    // ローテーション設定

  // Relations
  primaryApprover   User?    @relation("VotingGroupPrimaryApprover", ...)

  @@index([primaryApproverId])
}
```

### approverRotation JSON構造

```typescript
{
  "enabled": true,
  "pattern": "monthly",  // monthly | quarterly | project_based
  "members": [
    "user_tanaka_dept_head",
    "user_suzuki_dept_head",
    "user_sato_dept_head"
  ],
  "currentIndex": 0,      // 現在の担当者インデックス
  "lastRotated": "2025-10-01T00:00:00Z"
}
```

---

## 🔐 権限ロジック

### 承認者の決定フロー

```typescript
// ProjectPermissionService.ts

getPermission(user: User, projectLevel: ProjectLevel, votingGroup?: VotingGroup): ProjectPermission {

  // 1. ローテーション機能が有効な場合、現在の担当者を判定
  let currentApproverId = votingGroup.primaryApproverId;

  if (votingGroup.approverRotation?.enabled) {
    const rotation = votingGroup.approverRotation;
    const currentIndex = rotation.currentIndex || 0;
    currentApproverId = rotation.members[currentIndex];
  }

  // 2. 代表承認者（または現在のローテーション担当者）
  if (currentApproverId && user.id === currentApproverId) {
    return {
      canView: true,
      canApprove: true,  // ✅ 承認権限あり
      canComment: true,
      canFormTeam: true,
      badge: '✅ 代表承認者（診療支援・薬剤・事務グループ）'
    };
  }

  // 3. グループメンバー部門長（承認者以外）
  if (userLevel === 10 && votingGroup.memberDepartmentIds.includes(user.department)) {
    return {
      canView: true,
      canApprove: false,  // ❌ 承認権限なし
      canComment: true,   // ✅ アドバイス・コメント可能
      badge: '👥 グループメンバー部長（閲覧・助言）'
    };
  }

  // 4. 上位監督者（事務長・院長など）
  // ...
}
```

---

## 📊 承認権限マトリクス

### 小原病院「診療支援・薬剤・事務」統合グループの例

| ユーザー | 役職 | Level | 承認権限 | 閲覧 | コメント | バッジ |
|---------|------|-------|---------|------|---------|-------|
| **田中部長** | 診療支援部長（代表） | 10 | ✅ あり | ✅ | ✅ | ✅ 代表承認者 |
| 鈴木部長 | 薬剤部長 | 10 | ❌ なし | ✅ | ✅ | 👥 メンバー部長 |
| 佐藤部長 | 事務部長 | 10 | ❌ なし | ✅ | ✅ | 👥 メンバー部長 |
| 山田事務長 | 事務長 | 11 | ❌ なし | ✅ | ✅ | 👁️ 上位者 |
| 高橋院長 | 院長 | 13 | ❌ なし | ✅ | ❌ | 📖 参考閲覧 |

### ローテーション有効時（月次）

| 月 | 担当承認者 | 他の部門長 |
|----|-----------|-----------|
| **10月** | 田中部長（診療支援） | 鈴木・佐藤: 閲覧・助言のみ |
| **11月** | 鈴木部長（薬剤） | 田中・佐藤: 閲覧・助言のみ |
| **12月** | 佐藤部長（事務） | 田中・鈴木: 閲覧・助言のみ |
| **1月** | 田中部長（診療支援） | 鈴木・佐藤: 閲覧・助言のみ |

---

## 🔄 ローテーション機能

### ローテーションパターン

#### 1. 月次ローテーション（`monthly`）
- 毎月1日に自動ローテーション
- 3名の部長が順番に担当

#### 2. 四半期ローテーション（`quarterly`）
- 3ヶ月ごとにローテーション
- 長期的な責任感を持てる

#### 3. プロジェクトベース（`project_based`）
- プロジェクト完了時にローテーション
- プロジェクト単位で担当を明確化

### ローテーション実行

```typescript
// ProjectPermissionService.ts

rotateApprover(votingGroup: VotingGroup): VotingGroup {
  if (!votingGroup.approverRotation?.enabled) {
    return votingGroup;
  }

  const rotation = votingGroup.approverRotation;
  const nextIndex = ((rotation.currentIndex || 0) + 1) % rotation.members.length;

  return {
    ...votingGroup,
    approverRotation: {
      ...rotation,
      currentIndex: nextIndex,
      lastRotated: new Date().toISOString()
    }
  };
}
```

---

## 💡 使用例

### 設定例1: 固定代表承認者

```json
{
  "groupId": "medical_support_group_obara",
  "groupName": "診療支援・薬剤・事務統合グループ",
  "memberDepartmentIds": [
    "medical_support_dept_obara",
    "pharmacy_dept_obara",
    "administration_dept_obara"
  ],
  "primaryApproverId": "user_tanaka_dept_head",
  "approverRotation": null
}
```

**結果**: 田中部長が常に承認者

### 設定例2: 月次ローテーション

```json
{
  "groupId": "medical_support_group_obara",
  "groupName": "診療支援・薬剤・事務統合グループ",
  "memberDepartmentIds": [
    "medical_support_dept_obara",
    "pharmacy_dept_obara",
    "administration_dept_obara"
  ],
  "primaryApproverId": "user_tanaka_dept_head",
  "approverRotation": {
    "enabled": true,
    "pattern": "monthly",
    "members": [
      "user_tanaka_dept_head",
      "user_suzuki_dept_head",
      "user_sato_dept_head"
    ],
    "currentIndex": 0,
    "lastRotated": "2025-10-01T00:00:00Z"
  }
}
```

**結果**:
- 10月: 田中部長
- 11月: 鈴木部長
- 12月: 佐藤部長
- 1月: 田中部長（ループ）

---

## 🔧 管理機能（Level 99）

### 投票グループ管理画面

Level 99管理者が設定できる項目：

1. **代表承認者の指定**
   - ドロップダウンでメンバー部門長から選択
   - 即座に反映

2. **ローテーション設定**
   - ON/OFF切り替え
   - パターン選択（月次/四半期/プロジェクトベース）
   - メンバー順序の設定

3. **手動ローテーション実行**
   - 緊急時に次の担当者へ切り替え
   - 履歴記録

### 設定画面UI（イメージ）

```
┌─────────────────────────────────────────┐
│ 投票グループ管理                          │
├─────────────────────────────────────────┤
│                                         │
│ グループ名: 診療支援・薬剤・事務グループ  │
│                                         │
│ ■ 承認者設定                             │
│                                         │
│   代表承認者: [田中部長 ▼]               │
│                                         │
│   □ ローテーション機能を有効にする        │
│                                         │
│   パターン: ○ 月次  ○ 四半期  ○ プロジェクト│
│                                         │
│   ローテーション順序:                    │
│   1. 田中部長（診療支援部）               │
│   2. 鈴木部長（薬剤部）                  │
│   3. 佐藤部長（事務部）                  │
│                                         │
│   現在の担当: 田中部長                   │
│   次回切替: 2025-11-01                   │
│                                         │
│   [手動で次へローテーション]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📈 メリット・デメリット

### メリット

1. **明確性**
   - 誰が承認者か一目瞭然
   - 承認プロセスの遅延なし

2. **柔軟性**
   - 病院の実態に合わせて設定可能
   - Level 99が動的に変更可能

3. **公平性**
   - ローテーション機能で負担分散
   - すべての部門長が経験を積める

4. **効率性**
   - 合議制より迅速な承認
   - プロジェクト開始の遅延防止

### デメリット

1. **初期設定の手間**
   - Level 99が代表承認者を指定する必要あり
   - ローテーション設定（オプション）

2. **運用ルールの明確化**
   - いつローテーションするか（月次/四半期）
   - 緊急時の対応

---

## 🎯 実装状況

### 完了項目

- ✅ Prismaスキーマ拡張（`primaryApproverId`, `approverRotation`）
- ✅ ProjectPermissionService拡張
  - `getVotingGroupPermission()` メソッド
  - `rotateApprover()` メソッド
- ✅ 承認権限ロジック実装
- ✅ ローテーション機能実装

### 保留項目（共通DB構築時）

- ⏸️ Level 99管理画面UI実装
- ⏸️ 自動ローテーションバッチ処理
- ⏸️ 通知機能（担当者変更時）
- ⏸️ 監査ログ記録

---

## 📝 使用方法（開発者向け）

### ProjectApprovalPageでの使用例

```typescript
// src/pages/ProjectApprovalPage.tsx

import { VotingGroup } from '../services/ProjectPermissionService';

// 投票グループ情報を取得（APIから）
const votingGroup: VotingGroup | null = await fetchVotingGroup(post.votingGroupId);

// 権限チェック
const permission = projectPermissionService.getPermission(
  activeUser,
  projectLevel,
  votingGroup  // ✅ 投票グループ情報を渡す
);

if (permission.canApprove) {
  // 承認ボタン表示
  <button onClick={handleApprove}>
    {permission.badge} - プロジェクト承認
  </button>
}
```

---

## 🔍 テストケース

### Case 1: 代表承認者のみが承認可能

```typescript
const votingGroup = {
  groupId: 'test_group',
  groupName: 'テストグループ',
  memberDepartmentIds: ['dept_a', 'dept_b', 'dept_c'],
  primaryApproverId: 'user_tanaka',
  approverRotation: null
};

const tanaka = { id: 'user_tanaka', permissionLevel: 10, department: 'dept_a' };
const suzuki = { id: 'user_suzuki', permissionLevel: 10, department: 'dept_b' };

const tanakaPerm = service.getPermission(tanaka, 'DEPARTMENT', votingGroup);
const suzukiPerm = service.getPermission(suzuki, 'DEPARTMENT', votingGroup);

expect(tanakaPerm.canApprove).toBe(true);   // ✅ 承認可能
expect(suzukiPerm.canApprove).toBe(false);  // ❌ 承認不可（助言のみ）
```

### Case 2: ローテーション機能

```typescript
const votingGroup = {
  groupId: 'test_group',
  groupName: 'テストグループ',
  memberDepartmentIds: ['dept_a', 'dept_b', 'dept_c'],
  primaryApproverId: 'user_tanaka',
  approverRotation: {
    enabled: true,
    pattern: 'monthly',
    members: ['user_tanaka', 'user_suzuki', 'user_sato'],
    currentIndex: 0
  }
};

// 10月: 田中部長が承認者
let perm = service.getPermission(tanaka, 'DEPARTMENT', votingGroup);
expect(perm.canApprove).toBe(true);

// ローテーション実行
votingGroup = service.rotateApprover(votingGroup);

// 11月: 鈴木部長が承認者
perm = service.getPermission(suzuki, 'DEPARTMENT', votingGroup);
expect(perm.canApprove).toBe(true);
```

---

## 📚 関連ドキュメント

- [Organization_Structure_Master_Plan_Request.md](./Organization_Structure_Master_Plan_Request.md) - 組織構造拡張マスタープラン
- [schema.prisma](../prisma/schema.prisma#L2259-2289) - VotingGroupモデル定義
- [ProjectPermissionService.ts](../src/services/ProjectPermissionService.ts) - 承認権限サービス

---

**作成者**: VoiceDrive開発チーム
**最終更新**: 2025-10-12
