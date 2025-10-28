# InterviewSettingsPage 確認質問回答書

**回答日**: 2025-10-28
**回答者**: VoiceDrive開発チーム
**対象文書**: InterviewSettings_医療システム確認結果_20251028.md
**ステータス**: ✅ **回答完了**

---

## 📋 目次

1. [回答サマリー](#回答サマリー)
2. [質問1: データ連携方式](#質問1-データ連携方式)
3. [質問2: 医療システムへの通知要否](#質問2-医療システムへの通知要否)
4. [質問3: マスター更新時の対応](#質問3-マスター更新時の対応)
5. [質問4: 新規面談タイプ追加時の対応](#質問4-新規面談タイプ追加時の対応)
6. [質問5: カスタム名称の使用範囲](#質問5-カスタム名称の使用範囲)
7. [質問6: 無効化された面談タイプの既存予約](#質問6-無効化された面談タイプの既存予約)
8. [質問7: スケジュール設定の影響範囲](#質問7-スケジュール設定の影響範囲)
9. [次のステップ](#次のステップ)

---

## 1. 回答サマリー

| # | 質問内容 | 回答 | 実装への影響 |
|---|---------|------|------------|
| 1 | データ連携方式 | **A) JSON直接読み込み** | ✅ 影響なし |
| 2 | 医療システムへの通知要否 | **A) 不要** | ✅ 影響なし |
| 3 | マスター更新時の対応 | **A) AI_SUMMARY.md記載（手動）** | ✅ 影響なし |
| 4 | 新規タイプ追加時の対応 | **A) 自動的に有効化** | ✅ 影響なし |
| 5 | カスタム名称の使用範囲 | **表示のみ（内部処理は医療システムID使用）** | ⚠️ 仕様明確化 |
| 6 | 無効化後の既存予約 | **B) そのまま実施される + 警告表示** | ⚠️ 追加ロジック必要 |
| 7 | スケジュール設定の影響範囲 | **全施設共通（Phase 1）** | ✅ 影響なし |

**実装への影響**:
- 質問1-4: 推奨回答を採用（実装変更なし）
- 質問5-7: 仕様を明確化（追加実装あり）

---

## 2. 質問1: データ連携方式

### 質問
mcp-shared/config/interview-types.json を直接読み込む方式でよろしいでしょうか？

### 回答
✅ **A) JSON直接読み込み（推奨）を採用します**

### 理由
1. **シンプル**: ファイル読み込みのみで実装可能
2. **API不要**: 医療システム側の負担ゼロ
3. **リアルタイム**: ファイル更新時に即反映
4. **低頻度更新**: 面談タイプマスターの更新頻度が低い（年1-2回）

### 実装方針
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

### 将来の拡張
現時点ではJSON直接読み込みで十分ですが、以下の場合は医療システムAPIへの切り替えを検討：
- マスター更新頻度が月1回以上に増加
- バージョン管理・履歴管理が必要になった場合
- リアルタイム同期が必要になった場合

---

## 3. 質問2: 医療システムへの通知要否

### 質問
面談タイプの有効化/無効化を変更した際、医療システムへの通知は必要でしょうか？

### 回答
✅ **A) 不要（VoiceDrive独自設定なので通知不要）を採用します**

### 理由
1. **運用設定**: 有効化/無効化はVoiceDrive側の運用上の設定
2. **医療システムへの影響なし**: 医療システムはマスターデータを提供するのみ
3. **独立性**: VoiceDrive側で完結する設定変更

### 実装方針
- 面談タイプ有効化/無効化変更時は、VoiceDrive側の`AuditService`にのみログ記録
- 医療システムへの通知は行わない
- `InterviewTypeConfig`テーブルにのみ保存

### 監査ログ例
```typescript
AuditService.log({
  userId: user.id,
  action: 'INTERVIEW_TYPE_CONFIG_UPDATED',
  details: {
    interviewTypeId: 'new_employee_monthly',
    enabled: false,
    reason: 'Level 99による一時無効化'
  },
  severity: 'medium'
});
```

---

## 4. 質問3: マスター更新時の対応

### 質問
医療システムが面談タイプマスター（interview-types.json）を更新した際、VoiceDrive側への通知方法はどうしますか？

### 回答
✅ **A) mcp-shared/docs/AI_SUMMARY.mdに記載（手動）を採用します**

### 理由
1. **低頻度更新**: 年1-2回の更新頻度であり、手動連絡で十分
2. **現行方式継続**: 既存のMCP連携方式を維持
3. **シンプル**: Webhook実装等の追加コストが不要

### 運用フロー
```
医療システム管理者
  ↓ interview-types.json 更新
mcp-shared/config/interview-types.json
  ↓ AI_SUMMARY.md に記載
mcp-shared/docs/AI_SUMMARY.md
  ↓ VoiceDriveチームが確認
VoiceDrive開発チーム
  ↓ InterviewTypeConfig テーブル確認
  ↓ 新規タイプがあれば自動有効化（質問4参照）
運用継続
```

### AI_SUMMARY.md 記載例
```markdown
## 2025-XX-XX: 面談タイプマスター更新

**更新内容**:
- 新規面談タイプ追加: 「管理職向け年次面談」（ID: `manager_annual`）
- 既存タイプ変更: 「新入職員月次面談」の頻度を「月1回」→「隔週1回」に変更

**VoiceDrive側対応**:
- 新規タイプは自動的に有効化されます（enabled=true）
- Level 99が必要に応じて無効化可能

**対応期限**: なし（自動反映）
```

### 将来の拡張
以下の場合は自動通知（Webhook）の検討：
- マスター更新頻度が月1回以上に増加
- 即座の反映が必要な変更が発生
- 複数システムへの一斉通知が必要

---

## 5. 質問4: 新規面談タイプ追加時の対応

### 質問
医療システムが新しい面談タイプを追加した場合、VoiceDrive側で自動的に有効化されてよろしいでしょうか？

### 回答
✅ **A) 自動的に有効化される（enabled = true）を採用します**

### 理由
1. **業務必要性**: 医療システムが追加したタイプは業務上必要
2. **柔軟性**: Level 99が後からInterviewSettingsPageで無効化可能
3. **運用効率**: 手動有効化の手間を省く

### 実装ロジック

#### API側（GET /api/interview/settings/types）
```typescript
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
      // ⭐ config が存在しない場合は自動的に enabled: true
      enabled: config?.enabled ?? true,
      displayOrder: config?.displayOrder ?? type.sortOrder,
      customName: config?.customName,
      isNew: !config, // 新規追加タイプのフラグ
    };
  });

  return Response.json({ types: mergedTypes });
}
```

#### UI側（InterviewSettingsPage）
```typescript
// 新規タイプには「NEW」バッジを表示
{type.isNew && (
  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
    NEW
  </span>
)}
```

### 運用フロー
```
医療システム
  ↓ 新規面談タイプ追加（例: manager_annual）
interview-types.json 更新
  ↓
VoiceDrive API
  ↓ GET /api/interview/settings/types 呼び出し時
  ↓ InterviewTypeConfig テーブルに該当IDなし
  ↓ enabled: true として自動有効化
InterviewSettingsPage
  ↓ 「NEW」バッジ付きで表示
  ↓ Level 99 が確認
  ↓ 必要に応じて無効化
運用継続
```

---

## 6. 質問5: カスタム名称の使用範囲

### 質問
VoiceDrive側で `customName`（独自呼称）を設定した場合、どの画面で使用されますか？

### 回答
✅ **表示のみで使用（内部処理は医療システムID使用）**

### 使用範囲

#### ✅ customName を使用する場所
1. **InterviewSettingsPage**: カスタム名称の設定・表示
2. **面談予約画面**: ユーザーが選択する際の表示名
3. **面談詳細画面**: 予約済み面談の表示名
4. **通知メール**: 「〇〇面談の予約が確定しました」の〇〇部分

#### ❌ customName を使用しない場所
1. **データベース保存**: `interviewTypeId` として医療システムのIDを保存
2. **API通信**: 医療システムの標準IDを使用
3. **レポート・統計**: 医療システムのマスター名称を使用
4. **監査ログ**: 医療システムの標準名称を併記

### 実装例

#### UI表示
```typescript
// 面談予約画面
function InterviewTypeSelector({ types }: Props) {
  return (
    <select>
      {types.map((type) => (
        <option key={type.id} value={type.id}>
          {/* カスタム名称がある場合はそれを表示 */}
          {type.customName || type.name}
          {/* 医療システム名称も併記 */}
          {type.customName && (
            <span className="text-gray-500 text-sm">
              （{type.name}）
            </span>
          )}
        </option>
      ))}
    </select>
  );
}
```

#### データベース保存
```typescript
// 面談予約作成
await prisma.interview.create({
  data: {
    // ⭐ 医療システムIDを保存（customNameは保存しない）
    interviewTypeId: 'new_employee_monthly',
    // ...
  }
});
```

### データ整合性の確保
- **表示**: カスタム名称を使用（ユーザーフレンドリー）
- **内部処理**: 医療システムIDを使用（データ整合性）
- **レポート**: 医療システム標準名称を使用（統計・比較可能）

---

## 7. 質問6: 無効化された面談タイプの既存予約

### 質問
面談タイプを無効化した後、そのタイプで既に予約済みの面談はどう扱われますか？

### 回答
✅ **B) そのまま実施される + C) Level 99に警告が表示される**

### 理由
1. **既存予約の尊重**: すでに予約されている面談はユーザーとの約束
2. **運用の柔軟性**: 過去の予約に影響を与えない
3. **安全性**: Level 99に警告を表示し、意図しない無効化を防ぐ

### 実装ロジック

#### Phase 1: 無効化時の警告表示
```typescript
// InterviewSettingsPage.tsx
async function handleToggleEnabled(typeId: string, newEnabled: boolean) {
  if (!newEnabled) {
    // 無効化する場合は既存予約をチェック
    const existingBookings = await fetch(
      `/api/interview/check-bookings?typeId=${typeId}`
    ).then(res => res.json());

    if (existingBookings.count > 0) {
      const confirmed = window.confirm(
        `このタイプには既に${existingBookings.count}件の予約があります。\n` +
        `無効化しても既存の予約はそのまま実施されます。\n` +
        `新規予約のみが停止されます。\n\n` +
        `本当に無効化しますか？`
      );

      if (!confirmed) return;
    }
  }

  // 無効化実行
  await updateInterviewTypeConfig(typeId, { enabled: newEnabled });
}
```

#### Phase 2: 既存予約の表示
```typescript
// 面談予約一覧画面
function InterviewBookingList({ bookings }: Props) {
  return (
    <table>
      {bookings.map((booking) => {
        const typeConfig = getInterviewTypeConfig(booking.interviewTypeId);
        const isDisabled = !typeConfig?.enabled;

        return (
          <tr key={booking.id}>
            <td>
              {booking.interviewTypeName}
              {/* 無効化されたタイプには警告バッジ */}
              {isDisabled && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  ⚠️ 無効化済み
                </span>
              )}
            </td>
            <td>{booking.scheduledDate}</td>
            <td>
              {/* 既存予約はそのまま実施可能 */}
              <button>詳細を見る</button>
            </td>
          </tr>
        );
      })}
    </table>
  );
}
```

#### Phase 3: 新規予約の停止
```typescript
// 面談予約作成画面
function InterviewTypeSelector({ types }: Props) {
  return (
    <select>
      {types
        .filter((type) => type.enabled) // ⭐ 有効なタイプのみ表示
        .map((type) => (
          <option key={type.id} value={type.id}>
            {type.customName || type.name}
          </option>
        ))}
    </select>
  );
}
```

### 運用フロー
```
Level 99 管理者
  ↓ 面談タイプを無効化
InterviewSettingsPage
  ↓ 既存予約チェック
  ↓ 「3件の予約があります。そのまま実施されます」警告表示
Level 99 確認
  ↓ 無効化確定
InterviewTypeConfig.enabled = false
  ↓
【既存予約】
  ↓ そのまま表示・実施可能
  ↓ 「⚠️ 無効化済み」バッジ付き

【新規予約】
  ↓ 選択肢に表示されない
  ↓ 新規予約不可
```

---

## 8. 質問7: スケジュール設定の影響範囲

### 質問
スケジュール設定（開始時刻、終了時刻等）は全施設共通ですか？それとも施設ごとに個別設定が必要ですか？

### 回答
✅ **全施設共通（Phase 1）、将来的に施設別対応を検討**

### 理由
1. **実装の簡素化**: Phase 1では全施設共通で十分
2. **運用の統一性**: VoiceDrive全体で統一された面談時間帯
3. **拡張性確保**: 将来的に施設別対応が可能な設計

### 実装方針

#### Phase 1: 全施設共通設定（現在）
```prisma
// 全施設共通の設定
model InterviewSystemSetting {
  id           String   @id @default(cuid())
  category     String   // 'schedule' or 'restriction'
  settingKey   String   @map("setting_key")
  settingValue String   @map("setting_value")
  valueType    String   @map("value_type")
  description  String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@unique([category, settingKey])
  @@map("interview_system_settings")
}
```

**設定例**:
- 開始時刻: 13:40（全施設共通）
- 終了時刻: 17:00（全施設共通）
- 1回の時間: 30分（全施設共通）

#### Phase 2: 施設別対応（将来）
```prisma
// 施設別設定に拡張
model InterviewSystemSetting {
  id           String   @id @default(cuid())
  facilityId   String?  @map("facility_id")  // ⭐ 追加
  category     String
  settingKey   String   @map("setting_key")
  settingValue String   @map("setting_value")
  valueType    String   @map("value_type")
  description  String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // facilityId が null の場合は全施設共通
  // facilityId が存在する場合は施設別設定
  @@unique([facilityId, category, settingKey])
  @@map("interview_system_settings")
}
```

### 取得ロジック（Phase 2）
```typescript
// 施設別設定 → 全施設共通設定の順で取得
async function getInterviewScheduleSettings(facilityId?: string) {
  const settings = await prisma.interviewSystemSetting.findMany({
    where: {
      category: 'schedule',
      OR: [
        { facilityId: facilityId }, // 施設別設定
        { facilityId: null }        // 全施設共通設定
      ]
    }
  });

  // 施設別設定が優先、なければ全施設共通設定を使用
  const merged = mergeSettings(settings, facilityId);
  return merged;
}
```

### Phase 1 での運用
**全施設共通設定**:
- 小原病院
- 立神リハビリテーション病院
- エスポワール立神

上記3施設すべてで同じスケジュール設定を使用します。

### Phase 2 への移行条件
以下のいずれかに該当する場合、施設別対応を検討：
- 施設ごとに診療時間が大きく異なる
- 施設ごとに面談運用ルールが異なる
- 施設管理者から個別設定の要望がある

---

## 9. 次のステップ

### 9-1. 実装開始可能
以下の確認が完了したため、VoiceDrive側で実装開始可能です。

**確定事項**:
- ✅ データ連携方式: JSON直接読み込み
- ✅ 医療システムへの通知: 不要
- ✅ マスター更新時の対応: AI_SUMMARY.md記載（手動）
- ✅ 新規タイプ追加時: 自動的に有効化
- ✅ カスタム名称: 表示のみで使用
- ✅ 既存予約の扱い: そのまま実施 + 警告表示
- ✅ スケジュール設定: 全施設共通（Phase 1）

### 9-2. 実装スケジュール

| Phase | 作業内容 | 工数 | 開始予定 |
|-------|---------|------|---------|
| **Phase 1** | DB設計・テーブル作成 | 4.5時間 | 即時可能 |
| **Phase 2** | API実装（6エンドポイント） | 8時間 | Phase 1完了後 |
| **Phase 3** | フロントエンド統合 | 5時間 | Phase 2完了後 |
| **合計** | - | **17.5時間** | - |

### 9-3. 追加実装項目（質問5-7に基づく）

#### 追加実装1: 既存予約チェックAPI
```typescript
// GET /api/interview/check-bookings?typeId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeId = searchParams.get('typeId');

  const count = await prisma.interview.count({
    where: {
      interviewTypeId: typeId,
      status: { in: ['scheduled', 'confirmed'] }
    }
  });

  return Response.json({ count });
}
```

**工数**: +1時間

#### 追加実装2: 無効化済みバッジ表示
```typescript
// 面談予約一覧画面に「⚠️ 無効化済み」バッジ追加
```

**工数**: +0.5時間

#### 追加実装3: カスタム名称の表示ロジック
```typescript
// 表示名: customName || name
// データベース保存: interviewTypeId（医療システムID）
```

**工数**: +1時間

**合計追加工数**: 2.5時間

### 9-4. 最終見積もり

| 項目 | 工数 |
|-----|------|
| 基本実装 | 17.5時間 |
| 追加実装（質問5-7対応） | 2.5時間 |
| **合計** | **20時間** |

### 9-5. 医療システムチームへの連絡

以下の内容を医療システムチームへ連絡：

**件名**: InterviewSettingsPage 確認質問回答完了

**本文**:
```
医療職員カルテシステム開発チーム 御中

VoiceDrive開発チームです。

InterviewSettingsPageのDB構築に関する確認質問（7項目）に回答しました。

【確認質問回答書】
mcp-shared/docs/InterviewSettings_確認質問回答_20251028.md

【回答サマリー】
- データ連携方式: JSON直接読み込み（推奨通り）
- 医療システムへの通知: 不要（推奨通り）
- マスター更新時: AI_SUMMARY.md記載（推奨通り）
- 新規タイプ追加時: 自動有効化（推奨通り）
- カスタム名称: 表示のみで使用
- 既存予約: そのまま実施 + 警告表示
- スケジュール設定: 全施設共通（Phase 1）

【医療システム側対応】
✅ 追加実装不要（現状維持で問題なし）

【VoiceDrive側実装】
⏳ 実装開始可能（見積もり: 20時間）

何かご質問があればお知らせください。

VoiceDrive開発チーム
2025-10-28
```

---

## 📊 確認質問回答サマリー

### 採用した回答

| 質問 | 採用回答 | 医療システム推奨 | 一致 |
|------|---------|----------------|------|
| 1. データ連携方式 | JSON直接読み込み | A | ✅ |
| 2. 通知要否 | 不要 | A | ✅ |
| 3. マスター更新対応 | AI_SUMMARY.md | A | ✅ |
| 4. 新規タイプ追加 | 自動有効化 | A | ✅ |
| 5. カスタム名称範囲 | 表示のみ | - | - |
| 6. 既存予約扱い | そのまま実施 + 警告 | - | - |
| 7. スケジュール範囲 | 全施設共通 | - | - |

**評価**: ✅ すべて合理的な判断、実装可能

---

**回答日**: 2025-10-28
**回答者**: VoiceDrive開発チーム
**次回レビュー**: Phase 1実装完了後
**ステータス**: ✅ 回答完了、実装開始可能
