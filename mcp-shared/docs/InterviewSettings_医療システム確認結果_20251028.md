# InterviewSettingsPage 医療システム確認結果書

**作成日**: 2025-10-28
**対象ページ**: InterviewSettingsPage（VoiceDrive側）
**分析者**: 医療職員カルテシステム開発チーム
**確認結果**: ✅ **医療システム側対応不要（マスター管理のみ）**

---

## 📋 目次

1. [確認概要](#確認概要)
2. [分析結果](#分析結果)
3. [責任分界点の確認](#責任分界点の確認)
4. [医療システム側の役割](#医療システム側の役割)
5. [VoiceDrive側の実装要件](#voicedrive側の実装要件)
6. [連携仕様](#連携仕様)
7. [確認事項と質問](#確認事項と質問)

---

## 1. 確認概要

### VoiceDrive側からの依頼内容

VoiceDriveチームがInterviewSettingsPage（面談設定ページ）のDB構築を計画しており、医療システム側で対応が必要か確認要請を受けました。

**依頼書類**:
- `InterviewSettingsPage暫定マスターリスト_20251028.md`
- `InterviewSettingsPage_DB要件分析_20251028.md`

### 確認結論

✅ **医療システム側で追加実装は不要**

**理由**:
1. 面談タイプマスターは既に医療システムが管理中（`mcp-shared/config/interview-types.json`）
2. スケジュール設定・予約制限設定はVoiceDrive独自の運用ルール（VoiceDrive完全管理）
3. 医療システムは**読み取り専用の参照元**として機能（変更・追加不要）

---

## 2. 分析結果

### 2-1. 既存ファイルの確認

医療システム側で既に管理している面談タイプマスター:

| ファイル | 場所 | 内容 | 最終更新 |
|---------|------|------|---------|
| `interview-types.json` | `mcp-shared/config/` | 面談タイプマスター（共有） | 2025-08-10 |

**内容**:
- 面談分類（classifications）: 3種類（定期・特別・サポート）
- 面談タイプ（interviewTypes）: 10種類
- 面談カテゴリ（categories）: 3カテゴリ×計12サブカテゴリ

### 2-2. VoiceDrive側の要件

| データ種別 | 内容 | 管理責任 | 医療システム対応 |
|-----------|------|---------|----------------|
| **面談タイプマスター** | 10種類の面談タイプ定義 | 🔴 **医療システム** | ✅ **対応済み** |
| **面談分類** | 定期・特別・サポート | 🔴 **医療システム** | ✅ **対応済み** |
| **面談カテゴリ** | キャリア・職場環境・個別相談 | 🔴 **医療システム** | ✅ **対応済み** |
| **面談タイプ有効化設定** | VoiceDrive側でON/OFF管理 | 🟦 **VoiceDrive** | ❌ **不要** |
| **スケジュール設定** | 開始時刻、終了時刻、枠数等 | 🟦 **VoiceDrive** | ❌ **不要** |
| **予約制限設定** | 予約上限、キャンセル期限等 | 🟦 **VoiceDrive** | ❌ **不要** |

---

## 3. 責任分界点の確認

### 3-1. データ管理責任

```
┌─────────────────────────────────────────────────────────────┐
│                   医療システム管理範囲                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 面談タイプマスター（interview-types.json）               │   │
│  │  - 面談分類（3種類）                                    │   │
│  │  - 面談タイプ（10種類）                                 │   │
│  │  - 面談カテゴリ（12サブカテゴリ）                       │   │
│  │  - 各タイプの基本属性（頻度、対象、トリガー等）          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓ 参照（READ ONLY）                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   VoiceDrive管理範囲                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 面談タイプ有効化設定（InterviewTypeConfig）             │   │
│  │  - enabled（有効/無効フラグ）                          │   │
│  │  - displayOrder（表示順序）                           │   │
│  │  - customName（独自呼称、オプション）                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ スケジュール設定（InterviewSystemSetting: schedule）    │   │
│  │  - startTime（開始時刻）                               │   │
│  │  - endTime（終了時刻）                                 │   │
│  │  - slotDuration（1回の時間）                          │   │
│  │  - maxSlotsPerDay（1日の枠数）                        │   │
│  │  - nightShiftSlots（夜勤者特別時間帯）                 │   │
│  │  - advanceBookingDays（予約可能期間）                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 予約制限設定（InterviewSystemSetting: restriction）     │   │
│  │  - newEmployeeRequired（新入職員面談必須）              │   │
│  │  - 各種予約上限（月間・年間）                           │   │
│  │  - cancellationDeadlineHours（キャンセル期限）         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3-2. 更新権限

| データ項目 | 更新権限 | 更新頻度 | 更新手段 |
|-----------|---------|---------|---------|
| **面談タイプマスター** | 医療システム管理者 | 低頻度（年1-2回） | JSONファイル直接編集 |
| **有効化設定** | VoiceDrive Level 99 | 月1回程度 | InterviewSettingsPage |
| **スケジュール設定** | VoiceDrive Level 99 | 週1回程度 | InterviewSettingsPage |
| **予約制限設定** | VoiceDrive Level 99 | 月1回程度 | InterviewSettingsPage |

---

## 4. 医療システム側の役割

### 4-1. 現状の役割

✅ **面談タイプマスター管理**（対応済み）

**場所**: `mcp-shared/config/interview-types.json`

**内容**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-08-10",
  "classifications": [...],
  "interviewTypes": [...],
  "categories": {...}
}
```

### 4-2. 今回の対応

✅ **追加実装不要**

**理由**:
1. 既に必要なマスターデータが存在
2. VoiceDrive側の要件を100%満たしている
3. ファイル形式・データ構造が仕様に合致
4. `mcp-shared/config/`経由でVoiceDrive側から参照可能

---

## 5. VoiceDrive側の実装要件

### 5-1. 新規テーブル（2個）

#### テーブル1: InterviewTypeConfig

```prisma
model InterviewTypeConfig {
  id             String   @id @default(cuid())
  interviewTypeId String  @unique @map("interview_type_id")  // 医療システムのID参照
  enabled        Boolean  @default(true)
  displayOrder   Int?     @default(0) @map("display_order")
  customName     String?  @map("custom_name")
  notes          String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("interview_type_configs")
}
```

**初期データ**: 10件（面談タイプIDを医療システムから参照）

#### テーブル2: InterviewSystemSetting

```prisma
model InterviewSystemSetting {
  id           String   @id @default(cuid())
  category     String                                     // 'schedule' or 'restriction'
  settingKey   String   @map("setting_key")
  settingValue String   @map("setting_value")
  valueType    String   @map("value_type")                // 'string', 'number', 'boolean', 'time'
  description  String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@unique([category, settingKey])
  @@map("interview_system_settings")
}
```

**初期データ**: 12件（スケジュール6件 + 予約制限6件）

### 5-2. 新規API（6個）

| エンドポイント | メソッド | 用途 |
|--------------|---------|------|
| `/api/interview/settings/types` | GET | 面談タイプ設定一覧取得（医療マスター+VoiceDrive設定マージ） |
| `/api/interview/settings/types` | PUT | 面談タイプ有効化設定更新 |
| `/api/interview/settings/schedule` | GET | スケジュール設定取得 |
| `/api/interview/settings/schedule` | PUT | スケジュール設定更新 |
| `/api/interview/settings/restrictions` | GET | 予約制限設定取得 |
| `/api/interview/settings/restrictions` | PUT | 予約制限設定更新 |

### 5-3. 実装スケジュール（VoiceDrive側）

| Phase | 作業内容 | 工数 | 状態 |
|-------|---------|------|------|
| **Phase 1** | DB設計・テーブル作成 | 4.5時間 | ⏳ 提案中 |
| **Phase 2** | API実装（6エンドポイント） | 8時間 | ⏳ 提案中 |
| **Phase 3** | フロントエンド統合 | 5時間 | ⏳ 提案中 |
| **合計** | - | **17.5時間** | ⏳ 提案中 |

---

## 6. 連携仕様

### 6-1. データ取得方法

#### 方式A: mcp-shared/config/interview-types.json 直接読み込み（推奨）

**VoiceDrive側実装例**:
```typescript
// VoiceDrive側: src/lib/medical-interview-types.ts
import interviewConfig from '../../../mcp-shared/config/interview-types.json';

export function getMedicalInterviewTypes() {
  return interviewConfig.interviewTypes;
}

export function getMedicalClassifications() {
  return interviewConfig.classifications;
}

export function getMedicalCategories() {
  return interviewConfig.categories;
}
```

**メリット**:
- ✅ シンプル（ファイル読み込みのみ）
- ✅ リアルタイム反映（ファイル更新時）
- ✅ API不要（医療システム側の負担ゼロ）

**デメリット**:
- ⚠️ バージョン管理が弱い
- ⚠️ 履歴管理なし

### 6-2. データマージロジック（VoiceDrive側実装）

```typescript
// VoiceDrive側: src/pages/api/interview/settings/types.ts
import interviewConfig from '../../../../mcp-shared/config/interview-types.json';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // 1. 医療システムのマスターを取得
  const medicalTypes = interviewConfig.interviewTypes;

  // 2. VoiceDriveの有効化設定を取得
  const configs = await prisma.interviewTypeConfig.findMany();

  // 3. マージ
  const mergedTypes = medicalTypes.map((type) => {
    const config = configs.find((c) => c.interviewTypeId === type.id);
    return {
      id: type.id,
      name: type.name,
      frequency: type.frequency,
      classification: type.classification,
      enabled: config?.enabled ?? true,
      displayOrder: config?.displayOrder ?? type.sortOrder,
      customName: config?.customName,
    };
  });

  return Response.json({ types: mergedTypes });
}
```

---

## 7. 確認事項と質問

### 7-1. VoiceDriveチームへの確認事項

#### ✅ 確認事項1: データ連携方式

**質問**: mcp-shared/config/interview-types.json を直接読み込む方式でよろしいでしょうか？

**選択肢**:
- A) JSON直接読み込み（推奨）
  - メリット: シンプル、API不要
  - デメリット: バージョン管理が弱い
- B) 医療システムAPIから取得（将来実装）
  - メリット: バージョン管理可能
  - デメリット: API実装が必要

**推奨**: 方式A（JSON直接読み込み）

---

#### ✅ 確認事項2: 医療システムへの通知要否

**質問**: 面談タイプの有効化/無効化を変更した際、医療システムへの通知は必要でしょうか？

**選択肢**:
- A) 不要（VoiceDrive独自設定なので通知不要）← **推奨**
- B) 必要（医療システムで統計を取りたい）

**推奨**: 不要（VoiceDrive側の運用設定であり、医療システムには影響なし）

---

#### ✅ 確認事項3: マスター更新時の対応

**質問**: 医療システムが面談タイプマスター（interview-types.json）を更新した際、VoiceDrive側への通知方法はどうしますか？

**選択肢**:
- A) mcp-shared/docs/AI_SUMMARY.mdに記載（手動）← **現行方式**
- B) Webhook通知（将来実装）
- C) 自動同期（将来実装）

**推奨**: 方式A（現行方式で継続）

**理由**: 面談タイプマスターの更新頻度が低い（年1-2回）ため、手動連絡で十分

---

#### ✅ 確認事項4: 新規面談タイプ追加時の対応

**質問**: 医療システムが新しい面談タイプを追加した場合、VoiceDrive側で自動的に有効化されてよろしいでしょうか？

**選択肢**:
- A) 自動的に有効化される（enabled = true）← **推奨**
- B) デフォルトで無効（enabled = false）
- C) Level 99に確認後に有効化

**推奨**: 方式A（自動的に有効化）

**理由**:
- 医療システムが追加したタイプは業務上必要なため、デフォルトで有効が自然
- Level 99が不要と判断した場合、後からInterviewSettingsPageで無効化可能

---

### 7-2. 医療システム側からの質問

#### ❓ 質問1: カスタム名称の使用範囲

**質問**: VoiceDrive側で `customName`（独自呼称）を設定した場合、どの画面で使用されますか？

**想定回答例**:
- InterviewSettingsPageの表示のみ
- 面談予約画面でも使用される
- レポート画面でも使用される

**確認理由**: 医療システムのマスター名称とVoiceDrive独自名称の使い分けを明確にしたい

---

#### ❓ 質問2: 無効化された面談タイプの既存予約

**質問**: 面談タイプを無効化した後、そのタイプで既に予約済みの面談はどう扱われますか？

**想定対応**:
- A) キャンセルされる
- B) そのまま実施される
- C) Level 99に警告が表示される

**確認理由**: データ整合性の確認

---

#### ❓ 質問3: スケジュール設定の影響範囲

**質問**: スケジュール設定（開始時刻、終了時刻等）は全施設共通ですか？それとも施設別ですか？

**想定回答例**:
- 全施設共通（1つの設定値）
- 施設別（小原病院、立神リハビリ、エスポワール立神で別々）

**確認理由**: 将来的な拡張性の確認

---

### 7-3. 対応が必要な場合

以下のいずれかに該当する場合、医療システム側で追加対応が必要です：

| 条件 | 対応内容 | 優先度 |
|-----|---------|--------|
| VoiceDrive側がAPI取得を希望 | 面談タイプマスターAPI実装 | 低 |
| マスター更新時の自動通知が必要 | Webhook実装 | 低 |
| バージョン管理・履歴管理が必要 | DBテーブル化 + API実装 | 低 |

**現時点での判断**: すべて「低優先度」（現行方式で問題なし）

---

## 📝 まとめ

### 医療システム側

✅ **追加実装不要**

**現状維持**:
- 面談タイプマスター管理（`mcp-shared/config/interview-types.json`）
- VoiceDrive側からの参照を許可（READ ONLY）

**今後の対応**:
- なし（現状のマスター管理継続のみ）

### VoiceDrive側

⏳ **実装が必要**（17.5時間）

**実装内容**:
- DB設計・テーブル作成（2テーブル）
- API実装（6エンドポイント）
- フロントエンド統合（InterviewSettingsPage）

### 確認依頼事項（VoiceDriveチームへ）

1. ✅ データ連携方式の確認（JSON直接読み込みでOK？）
2. ✅ 医療システムへの通知要否
3. ✅ マスター更新時の対応方法
4. ✅ 新規タイプ追加時の自動有効化可否
5. ❓ カスタム名称の使用範囲
6. ❓ 無効化後の既存予約の扱い
7. ❓ スケジュール設定の影響範囲（全施設共通 or 施設別）

---

## 📊 データサマリー

### 医療システム管理データ

| データ種別 | 件数 | 場所 | 更新頻度 |
|-----------|------|------|---------|
| **面談分類** | 3件 | `mcp-shared/config/interview-types.json` | 年1-2回 |
| **面談タイプ** | 10件 | 同上 | 年1-2回 |
| **面談カテゴリ** | 3カテゴリ×12サブカテゴリ | 同上 | 年1-2回 |

### VoiceDrive管理データ（予定）

| データ種別 | 件数 | テーブル | 更新頻度 |
|-----------|------|---------|---------|
| **タイプ有効化設定** | 10件 | `interview_type_configs` | 月1回 |
| **スケジュール設定** | 6件 | `interview_system_settings` | 週1回 |
| **予約制限設定** | 6件 | `interview_system_settings` | 月1回 |

---

## 🔄 連絡履歴

### 2025-10-28

- **受領**: VoiceDrive側からInterviewSettingsPage DB構築依頼書2件受領
- **分析**: 医療システム側対応必要性を分析
- **結論**: 医療システム側追加実装不要と判断
- **作成**: 本確認結果書を作成
- **共有**: mcp-shared/docs/へ配置（VoiceDriveチーム参照可能）

---

**作成日**: 2025-10-28
**最終更新**: 2025-10-28
**次のステップ**: VoiceDriveチームからの確認・承認待ち

---

**医療職員カルテシステム開発チーム（想定）**
**VoiceDrive開発チーム作成**
**2025年10月28日**
