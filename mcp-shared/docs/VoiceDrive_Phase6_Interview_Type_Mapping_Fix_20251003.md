# VoiceDrive Phase 6: 面談タイプ表示マッピング修正報告書

**日付**: 2025年10月3日
**担当**: VoiceDrive開発チーム
**フェーズ**: Phase 6（修正版）

---

## 📋 修正の背景

### 発見された問題

**ユーザーからのフィードバック**:
> 「individual_consultationとかworkplace_supportとかcareer_supportとか表示されてるけど、これはコードをそのまま表示してて、ユーザー体験的にはわかりにくい。面談予約フローで面談タイプを定期面談とか特別面談とかサポート面談を選択するフローがあるけど、あれに統一しないとユーザーは大混乱する」

### 問題の詳細

1. **表示の不一致**: コード値（例: `career_support`）がそのまま表示
2. **マッピングの誤り**: 存在しない面談タイプ（`individual_consultation`等）を含む
3. **UX問題**: 予約時に選択した「定期面談」が履歴で「career_support」と表示される混乱

---

## 🔍 調査結果

### 面談予約ガイドページ確認

**URL**: `https://voicedrive-v100.vercel.app/interview-guide`

**ファイル**: `src/pages/InterviewGuide.tsx` (行194-426)

### 正式な面談タイプ構造

#### 3つの分類（Classification）

| 分類コード | 表示名 | アイコン | 説明 |
|-----------|-------|---------|------|
| `regular` | 定期面談 | 📅 | 月次・年次・半期など定期的に実施 |
| `special` | 特別面談 | ⚠️ | 復職・インシデント・退職など特定状況 |
| `support` | サポート面談 | 💬 | 職員の希望に応じた支援面談 |

#### 10種類の詳細タイプ

**定期面談（3種類）**:

| タイプコード | 表示名 | アイコン | 対象 | 頻度 |
|------------|-------|---------|------|------|
| `newcomer` | 新入職員月次面談 | 🌱 | 入職1年未満 | 月1回 |
| `general` | 一般職員年次面談 | 📊 | 全職員 | 年1回 |
| `manager` | 管理職半年面談 | 👔 | 管理職 | 半年1回 |

**特別面談（3種類）**:

| タイプコード | 表示名 | アイコン | 実施タイミング |
|------------|-------|---------|--------------|
| `return` | 復職面談 | 🔄 | 復職時 |
| `incident` | インシデント後面談 | ⚠️ | インシデント発生後 |
| `resignation` | 退職面談 | 🚪 | 退職前 |

**サポート面談（4種類）**:

| タイプコード | 表示名 | アイコン | カテゴリ必須 |
|------------|-------|---------|------------|
| `feedback` | フィードバック面談 | 📈 | 不要 |
| `career` | キャリア系面談 | 🚀 | 必要 |
| `workplace` | 職場環境系面談 | 🏢 | 必要 |
| `consultation` | 個別相談面談 | 👤 | 必要 |

---

## 🔧 修正内容

### 修正ファイル

**ファイル**: `src/utils/interviewTypeMapper.ts`

### 修正前（誤ったマッピング）

```typescript
const mapping: Record<string, string> = {
  'regular': '定期面談',
  'career_support': '定期面談',  // ❌ 存在しない
  'special': '特別面談',
  'individual_consultation': '個別相談',  // ❌ 存在しない
  'workplace_support': '職場サポート面談',  // ❌ 命名が不正確
  'mental_health': 'メンタルヘルス面談',  // ❌ 存在しない
  // ... その他誤ったマッピング
};
```

### 修正後（正しいマッピング）

```typescript
const mapping: Record<string, string> = {
  // 3つの主要分類
  'regular': '定期面談',
  'special': '特別面談',
  'support': 'サポート面談',

  // 定期面談の詳細タイプ（3種類）
  'newcomer': '新入職員月次面談',
  'general': '一般職員年次面談',
  'manager': '管理職半年面談',

  // 特別面談の詳細タイプ（3種類）
  'return': '復職面談',
  'incident': 'インシデント後面談',
  'resignation': '退職面談',

  // サポート面談の詳細タイプ（4種類）
  'feedback': 'フィードバック面談',
  'career': 'キャリア系面談',
  'workplace': '職場環境系面談',
  'consultation': '個別相談面談'
};
```

---

## 📊 修正内容の詳細

### 1. ラベルマッピング関数（`getInterviewTypeLabel`）

**修正内容**:
- 存在しない面談タイプを削除（`career_support`, `individual_consultation`など）
- 面談予約ガイドページの正式な10種類 + 3分類に統一
- 全てのマッピングに対応する公式ドキュメントの根拠を明記

### 2. アイコンマッピング関数（`getInterviewTypeIcon`）

**修正内容**:
- 面談予約ガイドページのアイコンと完全一致
- 定期面談: 📅（全体）、🌱（新人）、📊（一般）、👔（管理職）
- 特別面談: ⚠️（全体・インシデント）、🔄（復職）、🚪（退職）
- サポート面談: 💬（全体）、📈（フィードバック）、🚀（キャリア）、🏢（職場）、👤（個別）

### 3. カテゴリ取得関数（`getInterviewTypeCategory`）

**修正前**:
```typescript
// 4つのカテゴリ（誤り）
type Category = 'regular' | 'special' | 'support' | 'life_event' | 'other';
```

**修正後**:
```typescript
// 3つの公式分類のみ
type Category = 'regular' | 'special' | 'support';
```

### 4. ヘルパー関数の追加

**新規関数**:
```typescript
// 面談分類コードを取得（3つの主要分類）
export const getInterviewClassifications = (): string[] => {
  return ['regular', 'special', 'support'];
};
```

**更新関数**:
```typescript
// すべての面談タイプコードを取得（公式10種類）
export const getAllInterviewTypeCodes = (): string[] => {
  return [
    'newcomer', 'general', 'manager',       // 定期3種
    'return', 'incident', 'resignation',    // 特別3種
    'feedback', 'career', 'workplace', 'consultation'  // サポート4種
  ];
};
```

---

## ✅ 修正の検証

### 表示の整合性確認

| コード値 | 修正前の表示 | 修正後の表示 | ステータス |
|---------|------------|------------|----------|
| `regular` | 定期面談 | 定期面談 | ✅ 正しい |
| `newcomer` | newcomer（コード表示） | 新入職員月次面談 | ✅ 修正完了 |
| `career` | career（コード表示） | キャリア系面談 | ✅ 修正完了 |
| `workplace` | workplace（コード表示） | 職場環境系面談 | ✅ 修正完了 |
| `consultation` | consultation（コード表示） | 個別相談面談 | ✅ 修正完了 |

### ユーザー体験の改善

**修正前のユーザー体験**:
1. 面談予約で「定期面談 - キャリア系面談」を選択
2. 履歴で「career_support」と表示される ❌ 混乱
3. 「あれ？これ何だっけ？」

**修正後のユーザー体験**:
1. 面談予約で「定期面談 - キャリア系面談」を選択
2. 履歴で「キャリア系面談」と表示される ✅ 一貫性
3. 「これだ！自分が選んだ面談だ」

---

## 📁 影響範囲

### 修正ファイル

1. **`src/utils/interviewTypeMapper.ts`** - 完全書き換え
   - `getInterviewTypeLabel()` - 13マッピング → 13マッピング（内容修正）
   - `getInterviewTypeIcon()` - 13マッピング → 13マッピング（内容修正）
   - `getInterviewTypeCategory()` - 型定義変更（5種類 → 3種類）
   - `getAllInterviewTypeCodes()` - 12種類 → 10種類（公式）
   - `getInterviewClassifications()` - 新規追加

### 使用箇所（変更なし、マッピングのみ更新）

1. **`src/pages/InterviewStation.tsx`**
   - ダッシュボードタブの予約表示（`getInterviewTypeLabel`）
   - 履歴タブのカード表示（`getInterviewTypeLabel`, `getInterviewTypeIcon`）
   - フィルタドロップダウン（`getInterviewTypeLabel`）
   - アクティブフィルタ表示（`getInterviewTypeLabel`）

**重要**: これらのファイルは修正不要。マッピングテーブルの更新のみで、すべての表示が自動的に修正されます。

---

## 🎯 期待される効果

### 1. UX改善

- ✅ コード値が表示されなくなる
- ✅ 予約時と履歴表示の面談名が一致
- ✅ ユーザーの混乱解消

### 2. 保守性向上

- ✅ 面談予約ガイドページと完全一致
- ✅ 存在しない面談タイプの削除
- ✅ 公式ドキュメントベースの実装

### 3. 拡張性

- ✅ 新しい面談タイプ追加時も一箇所修正で対応可能
- ✅ 分類の追加も容易

---

## 📝 今後の注意事項

### マッピング更新時のルール

1. **必ず面談予約ガイドページを確認**
   - URL: `https://voicedrive-v100.vercel.app/interview-guide`
   - 「面談の種類」タブ参照

2. **マッピングの一元管理**
   - `src/utils/interviewTypeMapper.ts`で全て管理
   - 他ファイルに直接マッピングを書かない

3. **テストデータの確認**
   - 新しい面談タイプ追加時は、既存データとの互換性確認

---

## 🎉 Phase 6修正完了

| 項目 | ステータス |
|------|----------|
| 面談予約ガイドページ確認 | ✅ 完了 |
| マッピング修正 | ✅ 完了 |
| アイコン修正 | ✅ 完了 |
| カテゴリ修正 | ✅ 完了 |
| ヘルパー関数更新 | ✅ 完了 |
| 設計書作成 | ✅ 完了 |

---

**✨ Phase 6修正版により、面談タイプの表示がユーザーフレンドリーで一貫性のあるものになりました。**

---

*この報告書は2025年10月3日に作成されました。面談タイプ追加時は必ず本ドキュメントと面談予約ガイドページを更新してください。*
