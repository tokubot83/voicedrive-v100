# 投票グループ承認者機能実装完了通知

**文書番号**: VD-IMPL-2025-1012-002
**作成日**: 2025年10月12日
**作成者**: VoiceDrive開発チーム
**宛先**: 医療職員管理システム開発チーム
**重要度**: 🟡 中（情報共有）

---

## 📋 エグゼクティブサマリー

VoiceDrive側で**投票グループ承認者指定機能**を実装しました。
この機能は**VoiceDrive内部のロジックのみ**のため、**医療システム側での対応は不要**ですが、情報共有のためご報告いたします。

### 結論

✅ **医療システム側での対応: 不要**
✅ **データ管理責任: 明確化済み**
✅ **影響範囲: VoiceDrive内部のみ**

---

## 🎯 実装の背景

### 課題

投票グループで複数部門を統合した場合（例: 診療支援部5名+薬剤部3名+事務部8名 = 16名）、各部門に部長（Level 10）が存在するため、**プロジェクト承認者が不明確**でした。

| 部門 | 部長 | 権限レベル | 問題 |
|-----|------|----------|------|
| 診療支援部 | 田中部長 | Level 10 | 3人とも同じLevel |
| 薬剤部 | 鈴木部長 | Level 10 | 誰が承認者？ |
| 事務部 | 佐藤部長 | Level 10 | 承認プロセス不明確 |

### 解決策

**代表承認者指定 + ローテーション機能**を実装しました。

---

## 🔧 実装内容

### 1. データベーススキーマ拡張

#### VotingGroupテーブルに追加したフィールド

```prisma
model VotingGroup {
  // ... 既存フィールド

  // 🆕 承認者管理フィールド（2025-10-12追加）
  primaryApproverId String?  // 代表承認者のユーザーID
  approverRotation  Json?    // ローテーション設定

  // Relations
  primaryApprover   User?    @relation("VotingGroupPrimaryApprover", ...)
}
```

#### approverRotation JSON構造

```json
{
  "enabled": true,
  "pattern": "monthly",  // monthly | quarterly | project_based
  "members": [
    "user_tanaka_dept_head",
    "user_suzuki_dept_head",
    "user_sato_dept_head"
  ],
  "currentIndex": 0,
  "lastRotated": "2025-10-01T00:00:00Z"
}
```

### 2. 承認権限ロジック

#### ProjectPermissionService拡張

```typescript
// 投票グループの承認者権限判定
getPermission(user: User, projectLevel: ProjectLevel, votingGroup?: VotingGroup): ProjectPermission {

  // 代表承認者（または現在のローテーション担当者）
  if (currentApproverId && user.id === currentApproverId) {
    return {
      canApprove: true,  // ✅ 承認権限あり
      badge: '✅ 代表承認者（診療支援・薬剤・事務グループ）'
    };
  }

  // グループメンバー部門長（承認者以外）
  if (userLevel === 10 && votingGroup.memberDepartmentIds.includes(user.department)) {
    return {
      canApprove: false,  // ❌ 承認権限なし
      canComment: true,   // ✅ アドバイス・コメント可能
      badge: '👥 グループメンバー部長（閲覧・助言）'
    };
  }
}
```

### 3. 承認権限マトリクス

| ユーザー | 役職 | Level | 承認権限 | 閲覧 | コメント | バッジ |
|---------|------|-------|---------|------|---------|-------|
| **田中部長** | 診療支援部長（代表） | 10 | ✅ あり | ✅ | ✅ | ✅ 代表承認者 |
| 鈴木部長 | 薬剤部長 | 10 | ❌ なし | ✅ | ✅ | 👥 メンバー部長 |
| 佐藤部長 | 事務部長 | 10 | ❌ なし | ✅ | ✅ | 👥 メンバー部長 |

---

## 📊 データ管理責任

### データ管理責任分界点（更新済み）

| データ項目 | 管理責任 | 連携方法 | 医療システムへの影響 |
|-----------|---------|---------|-------------------|
| 施設マスター | 医療システム | API（日次バッチ） | - |
| 組織構造マスター | 医療システム | API（日次バッチ） | - |
| 職種マスター | 医療システム | API（日次バッチ） | - |
| **🆕 投票グループ** | **VoiceDrive** | なし | **なし** ✅ |
| **🆕 代表承認者** | **VoiceDrive** | なし | **なし** ✅ |
| **🆕 ローテーション設定** | **VoiceDrive** | なし | **なし** ✅ |

### 重要なポイント

✅ **医療システムへの影響ゼロ**
- 投票グループはVoiceDrive内部の投票・承認ロジック
- 組織マスター（部門・施設）は引き続き医療システムが管理
- 承認者指定・ローテーションはVoiceDrive独自機能

✅ **データ境界が明確**
- 組織情報: 医療システム管轄
- 投票ルール: VoiceDrive管轄
- 境界線が明確で混乱なし

---

## 🔄 ローテーション機能

### サポートするパターン

1. **月次ローテーション（`monthly`）**
   - 毎月1日に自動切替
   - 3名の部長が順番に担当

2. **四半期ローテーション（`quarterly`）**
   - 3ヶ月ごとに切替
   - 長期的な責任感を持てる

3. **プロジェクトベース（`project_based`）**
   - プロジェクト完了時に切替
   - プロジェクト単位で担当明確化

### ローテーション例（月次）

| 月 | 担当承認者 | 他の部門長 |
|----|-----------|-----------|
| 10月 | 田中部長（診療支援） | 鈴木・佐藤: 閲覧・助言のみ |
| 11月 | 鈴木部長（薬剤） | 田中・佐藤: 閲覧・助言のみ |
| 12月 | 佐藤部長（事務） | 田中・鈴木: 閲覧・助言のみ |

---

## 📄 更新済みドキュメント

### 1. データ管理責任分界点定義書

**ファイル**: `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

**更新内容**:
- カテゴリ2組織情報に投票グループ関連を追加
- VoiceDrive独自管理と明記
- 医療システムへの影響なしを記載

### 2. 組織構造マスタープラン依頼書

**ファイル**: `mcp-shared/docs/Organization_Structure_Master_Plan_Request.md`

**更新内容**:
- データ管理責任マトリクスに追加
- 設計書へのリンク追加

### 3. 投票グループ承認者設計書

**ファイル**: `docs/Voting_Group_Approver_Design.md`（VoiceDrive側）

**内容**:
- 詳細な設計仕様
- 承認ロジックの実装詳細
- テストケース
- 使用方法

---

## 🎯 医療チームへの確認事項

### ❓ 確認1: 医療システム側での対応は不要か？

**VoiceDrive側の見解**:
- 投票グループはVoiceDrive内部の投票・承認ロジック
- 組織マスター（部門・施設）は医療システムが引き続き管理
- **医療システム側での対応は不要**と考えています

**ご確認ください**:
- [ ] この理解で正しいか
- [ ] 何か懸念点はないか
- [ ] 追加で連携が必要な情報はないか

### ❓ 確認2: データ管理責任の理解は正しいか？

**VoiceDrive側の理解**:

| データ項目 | 管理責任 | 理由 |
|-----------|---------|------|
| 部門マスター | 医療システム | 組織の真実の情報源 |
| 職員マスター | 医療システム | 職員情報の真実の情報源 |
| 投票グループ | VoiceDrive | VoiceDrive独自の投票単位設定 |
| 代表承認者 | VoiceDrive | VoiceDrive独自の承認フロー |

**ご確認ください**:
- [ ] この責任分担で問題ないか
- [ ] データ管理責任分界点定義書の更新内容に問題ないか

### ❓ 確認3: 共通DB構築時の影響は？

**VoiceDrive側の見解**:
- 投票グループテーブルはVoiceDrive管轄
- 医療システムのテーブル設計には影響なし
- API連携の変更も不要

**ご確認ください**:
- [ ] 共通DB構築時に考慮すべき点はないか
- [ ] テーブル配置（VoiceDrive領域 vs 医療システム領域）に問題ないか

---

## 📅 実装スケジュール

### 完了済み項目（2025-10-12）

- ✅ Prismaスキーマ拡張（primaryApproverId、approverRotation追加）
- ✅ ProjectPermissionService拡張
- ✅ 承認権限ロジック実装
- ✅ ローテーション機能実装
- ✅ 設計ドキュメント作成
- ✅ データ管理責任分界点定義書更新
- ✅ GitHubにコミット・プッシュ完了

### 保留項目（共通DB構築時）

- ⏸️ Level 99管理画面UI実装
- ⏸️ 自動ローテーションバッチ処理
- ⏸️ 通知機能（担当者変更時）
- ⏸️ 監査ログ記録

---

## 🔍 テストケース（参考）

### Case 1: 代表承認者のみが承認可能

```typescript
const votingGroup = {
  groupId: 'medical_support_group_obara',
  groupName: '診療支援・薬剤・事務グループ',
  memberDepartmentIds: ['medical_support_dept', 'pharmacy_dept', 'administration_dept'],
  primaryApproverId: 'user_tanaka',
  approverRotation: null
};

// 田中部長: 承認可能
const tanakaPerm = service.getPermission(tanaka, 'DEPARTMENT', votingGroup);
expect(tanakaPerm.canApprove).toBe(true);   // ✅

// 鈴木部長: 承認不可（助言のみ）
const suzukiPerm = service.getPermission(suzuki, 'DEPARTMENT', votingGroup);
expect(suzukiPerm.canApprove).toBe(false);  // ❌
expect(suzukiPerm.canComment).toBe(true);   // ✅
```

### Case 2: ローテーション機能

```typescript
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

## 📞 次のアクション

### VoiceDrive側

1. ✅ 実装完了報告書作成（本文書）
2. ⏳ 医療チームからの回答待ち
3. ⏳ 必要に応じて追加対応

### 医療チーム様へのお願い

以下をご確認いただき、ご回答ください：

**回答期限**: 2025年10月15日（火）まで

**回答項目**:
1. [ ] 医療システム側での対応は不要か？
2. [ ] データ管理責任の理解は正しいか？
3. [ ] 共通DB構築時に考慮すべき点はないか？
4. [ ] その他、懸念点や質問はないか？

**回答方法**:
- MCPサーバー経由で返信ドキュメント作成
- または、Slack `#phase2-integration` で回答

---

## 📚 関連ドキュメント

### VoiceDrive側ドキュメント

- [Voting_Group_Approver_Design.md](../../docs/Voting_Group_Approver_Design.md) - 詳細設計書
- [Organization_Structure_Master_Plan_Request.md](./Organization_Structure_Master_Plan_Request.md) - マスタープラン依頼書
- [schema.prisma](../../prisma/schema.prisma#L2259-2289) - VotingGroupモデル定義
- [ProjectPermissionService.ts](../../src/services/ProjectPermissionService.ts) - 承認権限サービス

### 共有ドキュメント

- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ管理責任（更新済み）
- [AI_SUMMARY.md](./AI_SUMMARY.md) - 最新情報サマリー（更新済み）

---

## ✅ まとめ

### 実装完了内容

- ✅ 投票グループ承認者指定機能実装
- ✅ ローテーション機能実装（月次/四半期/プロジェクトベース）
- ✅ データ管理責任明確化

### 医療システムへの影響

- ✅ **影響なし**（VoiceDrive内部ロジックのみ）
- ✅ 組織マスターは引き続き医療システムが管理
- ✅ API連携の変更不要

### 次のステップ

1. 医療チームからの確認回答待ち
2. 問題なければ共通DB構築時に本番環境実装
3. Level 99管理画面UI実装（共通DB構築後）

---

**作成者**: VoiceDrive開発チーム
**連絡先**: VoiceDrive開発Slack #phase2-integration
**最終更新**: 2025-10-12
