# 人事お知らせUI変更に関する連携ドキュメント

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム ご担当者様**

---

## 1. 変更概要

VoiceDriveの人事お知らせページのUIを簡素化し、ユーザー体験を改善しました。
この変更により、職員カルテシステムとの連携APIに影響が生じる可能性があるため、ご連絡いたします。

## 2. 変更の背景

### 問題点
- **ボタンの重複**：アクションボタン（例：「📊 アンケートフォームへ」）と応答ボタン（例：「アンケートに回答する」）が並んでおり、ユーザーが混乱
- **統計情報の過剰表示**：「✅ 応答 234」「📊 実行 189」などの管理情報が一般ユーザーに表示され、認知負荷が高い
- **管理優先のUI**：人事部の既読管理のためだけに、ユーザー体験が犠牲になっていた

### 解決策
- 応答ボタンを削除し、アクションボタンのみに統一
- アクションボタンクリック時に自動で応答記録
- 統計情報は非表示（職員カルテシステム側で管理）

---

## 3. 具体的な変更内容

### 3.1 UI変更

#### Before（変更前）
```
┌─────────────────────────────────────┐
│ 【アンケート】職場環境改善調査      │
│                                     │
│ [📊 アンケートフォームへ]           │ ← アクションボタン
│ [アンケートに回答する]              │ ← 応答ボタン（削除）
│                                     │
│ ✅ 応答 234  📊 実行 189           │ ← 統計表示（削除）
└─────────────────────────────────────┘
```

#### After（変更後）
```
┌─────────────────────────────────────┐
│ 【アンケート】職場環境改善調査      │
│                                     │
│ [📊 アンケートフォームへ]           │ ← アクションボタンのみ
│                                     │
│ 👤 人事部 アンケート管理チーム      │ ← フッター情報のみ
└─────────────────────────────────────┘
```

### 3.2 データモデル変更

#### `HRAnnouncement`型の変更

```typescript
// Before
{
  requireResponse: true,          // ← false に変更
  responseType: 'acknowledged',
  responseText: 'アンケートに回答する',  // ← 削除
  responseRequired: false,        // ← 削除
  stats: {
    delivered: 450,
    responses: 234,               // ← 非表示（送信は継続）
    completions: 189
  }
}

// After
{
  requireResponse: false,         // ← 変更
  responseType: 'acknowledged',   // ← 自動記録用に維持
  // responseText: 削除
  // responseRequired: 削除
  stats: {
    delivered: 450,
    completions: 189              // ← responses は非表示
  }
}
```

### 3.3 動作変更

#### 応答記録のタイミング

**Before（変更前）**
1. ユーザーが「アンケートに回答する」ボタンをクリック
2. `onResponse(announcementId, 'acknowledged')` 実行
3. フォームには別途遷移する必要がある

**After（変更後）**
1. ユーザーが「📊 アンケートフォームへ」ボタンをクリック
2. `onResponse(announcementId, 'acknowledged')` を**自動実行**
3. 同時にフォームへ遷移

```typescript
// HRMessageBubble.tsx の変更
const handleActionClick = async () => {
  if (!announcement.actionButton) return;

  setIsActionLoading(true);

  // ← 新規追加：アクションボタンクリック時に自動で応答記録
  if (onResponse && announcement.responseType) {
    await onResponse(announcement.id, announcement.responseType);
  }

  // アクション実行（フォーム遷移など）
  // ...
};
```

---

## 4. API連携への影響

### 4.1 `sendAnnouncementToMedicalTeam` の影響

`MedicalIntegrationService.ts:89`で送信されるペイロード：

```typescript
const payload = {
  // ...
  requireResponse: announcement.requireResponse,  // ← true → false に変更
  // ...
};
```

### 4.2 職員カルテシステム側で必要な対応

#### ケース1：`requireResponse`フラグを参照している場合

**影響あり** - 以下の処理を見直す必要があります：
- 応答必須判定ロジック
- 未応答者へのリマインダー送信
- 既読管理ダッシュボード

**対応案：**
```typescript
// VoiceDrive側で新フィールドを追加
{
  requireResponse: false,           // UI上は非表示
  autoTrackResponse: true,          // アクション実行時に自動記録
  trackingMethod: 'action_click'    // 記録方法
}
```

#### ケース2：`stats.responses`を参照している場合

**影響なし** - VoiceDrive側ではUI非表示にしただけで、データ送信は継続
- 統計データは引き続き送信されます
- 職員カルテシステム側のダッシュボードは変更不要

---

## 5. 互換性の考慮

### 5.1 後方互換性

現在のAPIスキーマは維持されています：

| フィールド | 変更前 | 変更後 | 送信継続 |
|-----------|--------|--------|----------|
| `requireResponse` | `true` | `false` | ✅ |
| `responseType` | `'acknowledged'` | `'acknowledged'` | ✅ |
| `responseText` | `'アンケートに...'` | `undefined` | ✅ |
| `stats.responses` | `234` | （非表示） | ✅ |
| `stats.completions` | `189` | `189` | ✅ |

### 5.2 データフロー

```
VoiceDrive                     職員カルテシステム
─────────────────────────────────────────────────────

[アクションボタン]
      ↓
  クリック
      ↓
  自動応答記録 ──────→  [応答記録API]
      ↓                      ↓
  フォーム遷移          [配信状況DB更新]
      ↓                      ↓
  アンケート回答 ──────→  [回答記録API]
                             ↓
                     [既読率・回答率集計]
```

---

## 6. 推奨事項

### 6.1 短期対応（今すぐ可能）

**変更なし**でも動作しますが、以下を確認してください：

1. **`requireResponse: false`の処理**
   - 既存のロジックで`requireResponse === false`を「応答不要」と判定している場合は調整が必要

2. **統計ダッシュボード**
   - VoiceDrive側で非表示になっても、職員カルテシステム側では引き続き表示可能

### 6.2 中期対応（1-2週間以内を推奨）

新しいフィールド`autoTrackResponse`を導入：

```typescript
// VoiceDrive → 職員カルテシステム
{
  requireResponse: false,        // UI上の必須表示フラグ
  autoTrackResponse: true,       // 自動記録フラグ（NEW）
  trackingMethod: 'action_click' // 記録トリガー（NEW）
}
```

**メリット：**
- 明示的に「自動記録」を示せる
- 既存の`requireResponse`ロジックを維持
- 将来の拡張性が向上

### 6.3 長期対応（将来的な改善案）

**統合既読管理システム**
- ページ表示時の自動記録
- アクションボタンクリックの記録
- フォーム完了の記録

この3段階で配信効果を測定できます。

---

## 7. テスト確認項目

### 7.1 API連携テスト

- [ ] `requireResponse: false` のお知らせが正常に受信できるか
- [ ] 応答記録APIが正常に呼ばれるか
- [ ] 統計情報（`stats.responses`）が正常に記録されるか
- [ ] 既読率ダッシュボードが正常に表示されるか

### 7.2 統合テスト環境

```bash
# VoiceDrive側
npm run dev
# http://localhost:3001/hr-announcements

# 職員カルテシステム側
# APIエンドポイント確認
curl -X POST http://your-api/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "requireResponse": false,
    "responseType": "acknowledged",
    "category": "survey"
  }'
```

---

## 8. ロールバック手順

万が一、問題が発生した場合のロールバック手順：

```bash
# VoiceDrive側でコミットを戻す
git revert aa0b742  # ボタンスタイル修正
git revert 6b68649  # UI簡素化・自動応答記録
git push
```

**影響範囲：**
- `src/components/hr-announcements/HRMessageBubble.tsx`
- `src/components/hr-announcements/HRAnnouncementsPage.tsx`
- `src/styles/hr-announcements.css`

---

## 9. 質問・懸念事項

### 想定されるご質問

**Q1: 既読管理はどうなりますか？**
A1: アクションボタンクリック時に自動で応答記録されます。ページ表示のみの既読管理が必要な場合は、別途ページビュートラッキングの実装を検討します。

**Q2: 未応答者へのリマインダーは送れますか？**
A2: 可能です。`stats.responses`は引き続き記録されるため、未応答者の抽出は従来通り行えます。

**Q3: 応答率の計算に影響しますか？**
A3: 影響ありません。記録タイミングが変わっただけで、データ自体は維持されています。

**Q4: ユーザーが「確認したけどアクションしない」場合は？**
A4: この場合は未応答扱いになります。将来的にページビュートラッキングの導入を推奨します。

### ご連絡先

- **開発チーム**: VoiceDrive開発チーム
- **Slack**: #phase2-integration
- **MCPサーバー経由**: `mcp-shared/docs/` フォルダ
- **緊急連絡**: `URGENT_VOICEDRIVE_CONTACT.md` 参照

---

## 10. 変更履歴

| 日付 | コミットID | 変更内容 |
|------|-----------|----------|
| 2025-10-07 | `6b68649` | UI簡素化・自動応答記録実装 |
| 2025-10-07 | `aa0b742` | アクションボタンスタイル修正 |

---

## 11. 添付資料

### 関連ファイル
- `src/types/hr-announcements.ts` - 型定義
- `src/services/MedicalIntegrationService.ts` - API連携
- `src/components/hr-announcements/HRMessageBubble.tsx` - UI実装

### 参考ドキュメント
- `mcp-shared/docs/integration-completion-report-20250920.md` - 統合完了報告書
- `mcp-shared/docs/VoiceDrive_Notification_Implementation_Guide.md` - 通知実装ガイド

---

**本件に関するご質問やご懸念がございましたら、お気軽にご連絡ください。**
**統合テストのご協力をいただけますと幸いです。**

VoiceDrive開発チーム
2025年10月7日
