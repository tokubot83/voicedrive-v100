# UserManagementPage 暫定マスターリスト

**文書番号**: UMP-MASTER-2025-1026-001
**作成日**: 2025年10月26日
**作成者**: VoiceDriveチーム
**対象ページ**: UserManagementPage (admin/)
**参照文書**: UserManagementPage_DB要件分析_20251026.md

---

## 📋 サマリー

### データ項目総数
- **全31項目**
- 医療システムマスター: **15項目** (48%)
- VoiceDriveマスター: **16項目** (52%)
- 医療システムからキャッシュ: **15項目**

### 責任分担の原則
🔵 **医療システム**: 職員基本情報、組織情報、雇用情報、権限情報
🟢 **VoiceDrive**: 同期管理、VoiceDrive活動データ、VoiceDrive固有設定

---

## 📊 全データ項目マスターリスト

| # | データ項目 | フィールド名 | データ型 | マスター | 表示箇所 | 編集可否 | 備考 |
|---|----------|------------|---------|---------|---------|---------|------|
| **1. 基本情報** |
| 1-1 | VoiceDrive内部ID | `User.id` | String | 🟢 VD | テーブル（エクスポートのみ） | ❌ | cuid() |
| 1-2 | 職員ID | `User.employeeId` | String | 🔵 MS | - | ❌ | 医療システムID、VDキャッシュ |
| 1-3 | 氏名 | `User.name` | String | 🔵 MS | テーブル、検索 | ❌ | VDキャッシュ、Webhook同期 |
| 1-4 | メールアドレス | `User.email` | String | 🔵 MS | テーブル、検索 | ❌ | VDキャッシュ、Webhook同期 |
| 1-5 | 部署 | `User.department` | String? | 🔵 MS | テーブル、検索、フィルター | ❌ | VDキャッシュ、Webhook同期 |
| 1-6 | 役職 | `User.position` | String? | 🔵 MS | テーブル | ❌ | VDキャッシュ、Webhook同期 |
| 1-7 | 施設ID | `User.facilityId` | String? | 🔵 MS | - | ❌ | VDキャッシュ、Webhook同期 |
| **2. 権限情報** |
| 2-1 | 権限レベル | `User.permissionLevel` | Decimal | 🔵 MS | テーブル、フィルター、統計カード | ❌ | 1.0-25.0、V3評価から算出 |
| 2-2 | アカウント種別 | `User.accountType` | String | 🔵 MS | - | ❌ | NEW_STAFF, MID_CAREER等 |
| 2-3 | リーダー資格 | `User.canPerformLeaderDuty` | Boolean | 🔵 MS | - | ❌ | V3評価から算出 |
| 2-4 | 職種カテゴリ | `User.professionCategory` | String? | 🔵 MS | - | ❌ | nurse, doctor等 |
| 2-5 | 上司ID | `User.parentId` | String? | 🔵 MS | - | ❌ | 組織階層 |
| **3. 雇用情報** |
| 3-1 | 有効/無効 | `User.isActive` | Boolean | 🔵 MS | テーブル、フィルター、統計カード | ❌ | 退職時false、Webhook同期 |
| 3-2 | 退職フラグ | `User.isRetired` | Boolean | 🔵 MS | - | ❌ | デフォルトfalse |
| 3-3 | 退職日 | `User.retirementDate` | DateTime? | 🔵 MS | - | ❌ | 退職時設定、Webhook同期 |
| **4. 同期管理（🆕 Phase 2追加）** |
| 4-1 | 同期ステータス | `User.syncStatus` | Enum | 🟢 VD | テーブル | ❌ | synced/pending/error/never_synced |
| 4-2 | 最終同期日時 | `User.lastSyncedAt` | DateTime? | 🟢 VD | テーブル | ❌ | MM/DD HH:mm表示 |
| 4-3 | 同期エラーメッセージ | `User.syncErrorMessage` | String? | 🟢 VD | テーブル | ❌ | エラー時のみ20文字まで表示 |
| **5. VoiceDrive活動データ** |
| 5-1 | 最終ログイン日時 | `User.lastLoginAt` | DateTime? | 🟢 VD | テーブル | ❌ | MM/DD HH:mm表示 |
| 5-2 | ログイン回数 | `User.loginCount` | Int | 🟢 VD | - | ❌ | デフォルト0 |
| 5-3 | 作成日時 | `User.createdAt` | DateTime | 🟢 VD | エクスポートのみ | ❌ | VD登録日時 |
| 5-4 | 更新日時 | `User.updatedAt` | DateTime | 🟢 VD | - | ❌ | 自動更新 |
| **6. VoiceDrive固有設定（🆕 Phase 3準備完了）** |
| 6-1 | メール通知設定 | `voiceDriveSettings.emailNotifications` | Boolean | 🟢 VD | 設定モーダル | ✅ | デフォルトtrue |
| 6-2 | プッシュ通知設定 | `voiceDriveSettings.pushNotifications` | Boolean | 🟢 VD | 設定モーダル | ✅ | デフォルトtrue |
| 6-3 | 週次ダイジェスト | `voiceDriveSettings.weeklyDigest` | Boolean | 🟢 VD | 設定モーダル | ✅ | デフォルトtrue |
| 6-4 | テーマ設定 | `voiceDriveSettings.theme` | Enum | 🟢 VD | 設定モーダル | ✅ | light/dark/auto |
| **7. 統計データ（計算値）** |
| 7-1 | 総ユーザー数 | (計算値) | Int | 🟢 VD | 統計カード | - | users.length |
| 7-2 | アクティブユーザー数 | (計算値) | Int | 🟢 VD | 統計カード | - | isActive=trueのカウント |
| 7-3 | 無効ユーザー数 | (計算値) | Int | 🟢 VD | 統計カード | - | isActive=falseのカウント |
| 7-4 | 管理者数 | (計算値) | Int | 🟢 VD | 統計カード | - | permissionLevel>=10のカウント |

---

## 🔄 データフロー詳細

### フロー1: 医療システム → VoiceDrive（Webhook）

**トリガーイベント**:
- 職員入社
- 職員情報変更（部署異動、昇進、権限変更）
- 職員退職

**同期対象フィールド**（15項目）:
1. `employeeId`
2. `name`
3. `email`
4. `department`
5. `position`
6. `facilityId`
7. `permissionLevel`
8. `accountType`
9. `canPerformLeaderDuty`
10. `professionCategory`
11. `parentId`
12. `isActive`
13. `isRetired`
14. `retirementDate`
15. `updatedAt`

**Webhookペイロード例**:
```json
{
  "eventType": "employee.updated",
  "timestamp": "2025-10-26T10:00:00Z",
  "employeeId": "EMP-2025-001",
  "data": {
    "name": "山田太郎",
    "email": "yamada@example.com",
    "department": "看護部",
    "position": "看護師",
    "facilityId": "obara-hospital",
    "permissionLevel": 6.0,
    "accountType": "NEW_STAFF",
    "canPerformLeaderDuty": false,
    "professionCategory": "nurse",
    "parentId": "EMP-2020-015",
    "isActive": true,
    "isRetired": false,
    "retirementDate": null
  }
}
```

**VoiceDrive処理**:
```typescript
// Webhook受信時
await prisma.user.update({
  where: { employeeId: data.employeeId },
  data: {
    name: data.name,
    email: data.email,
    department: data.department,
    position: data.position,
    permissionLevel: data.permissionLevel,
    isActive: data.isActive,
    retirementDate: data.retirementDate,
    syncStatus: 'synced',
    lastSyncedAt: new Date(),
    syncErrorMessage: null
  }
});
```

---

### フロー2: VoiceDrive → 医療システム（API呼び出し）

**トリガー**:
- 個別ユーザー同期ボタンクリック
- 全ユーザー一括同期ボタンクリック
- 定期バッチ（日次 03:00 JST）

**APIエンドポイント**:
1. `GET /api/employees/{employeeId}` - 個別取得
2. `GET /api/employees` - 全件取得（ページング）

**リクエスト例**:
```http
GET /api/employees/EMP-2025-001
Authorization: Bearer {jwt_token}
```

**レスポンス例**:
```json
{
  "employeeId": "EMP-2025-001",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "department": "看護部",
  "position": "看護師",
  "facilityId": "obara-hospital",
  "permissionLevel": 6.0,
  "accountType": "NEW_STAFF",
  "canPerformLeaderDuty": false,
  "professionCategory": "nurse",
  "parentId": "EMP-2020-015",
  "isActive": true,
  "isRetired": false,
  "retirementDate": null,
  "hireDate": "2025-04-01",
  "yearsOfService": 0.6,
  "updatedAt": "2025-10-26T10:00:00Z"
}
```

---

### フロー3: VoiceDrive内部処理

**トリガー**:
- ユーザーログイン
- VoiceDrive固有設定変更

**更新対象フィールド**（7項目）:
1. `lastLoginAt` - ログイン時に更新
2. `loginCount` - ログイン時にインクリメント
3. `syncStatus` - 同期処理時に更新
4. `lastSyncedAt` - 同期成功時に更新
5. `syncErrorMessage` - 同期エラー時に設定
6. `voiceDriveSettings` - ユーザーが設定変更時に更新
7. `updatedAt` - 自動更新（Prisma）

**処理例**:
```typescript
// ログイン時
await prisma.user.update({
  where: { id: userId },
  data: {
    lastLoginAt: new Date(),
    loginCount: { increment: 1 }
  }
});

// VoiceDrive固有設定変更時
await prisma.user.update({
  where: { id: userId },
  data: {
    voiceDriveSettings: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      theme: 'dark'
    }
  }
});
```

---

## 🔍 データ項目詳細仕様

### 1. 基本情報

#### 1-1. VoiceDrive内部ID
- **フィールド**: `User.id`
- **型**: `String` (cuid())
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: CSVエクスポートのみ
- **編集可否**: ❌ 不可
- **備考**: VoiceDrive内部で使用、医療システムには公開しない

---

#### 1-2. 職員ID
- **フィールド**: `User.employeeId`
- **型**: `String` (UNIQUE)
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **備考**: 医療システムが発行、VoiceDriveはキャッシュのみ
- **例**: `EMP-2025-001`, `OH-NS-2024-001`

---

#### 1-3. 氏名
- **フィールド**: `User.name`
- **型**: `String` (NOT NULL)
- **マスター**: 🔵 医療システム
- **表示箇所**: テーブル、検索フィルター
- **編集可否**: ❌ 不可（医療システムで編集）
- **同期方法**: Webhook `employee.updated`
- **例**: `山田太郎`, `佐藤花子`

---

#### 1-4. メールアドレス
- **フィールド**: `User.email`
- **型**: `String` (UNIQUE)
- **マスター**: 🔵 医療システム
- **表示箇所**: テーブル、検索フィルター
- **編集可否**: ❌ 不可（医療システムで編集）
- **同期方法**: Webhook `employee.updated`
- **例**: `yamada@obara-hospital.jp`

---

#### 1-5. 部署
- **フィールド**: `User.department`
- **型**: `String?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: テーブル、検索フィルター
- **編集可否**: ❌ 不可（医療システムで編集）
- **同期方法**: Webhook `employee.department_changed`
- **例**: `看護部`, `リハビリテーション科`, `医事課`

---

#### 1-6. 役職
- **フィールド**: `User.position`
- **型**: `String?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: テーブル
- **編集可否**: ❌ 不可（医療システムで編集）
- **同期方法**: Webhook `employee.updated`
- **例**: `看護師`, `主任`, `師長`, `システム管理者`

---

#### 1-7. 施設ID
- **フィールド**: `User.facilityId`
- **型**: `String?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **同期方法**: Webhook `employee.updated`
- **例**: `obara-hospital`, `obara-clinic-1`

---

### 2. 権限情報

#### 2-1. 権限レベル
- **フィールド**: `User.permissionLevel`
- **型**: `Decimal` (1.0 - 25.0)
- **マスター**: 🔵 医療システム（V3評価から算出）
- **表示箇所**: テーブル、権限レベルフィルター、統計カード（管理者数）
- **編集可否**: ❌ 不可（医療システムで自動算出）
- **同期方法**: Webhook `employee.permission_changed`
- **特殊値**: `99.0` = Level X（システム管理者）
- **表示形式**: バッジ（色分け）
  - Level X (99): 紫
  - Level 18: 赤
  - Level 13: オレンジ
  - Level 10: 黄
  - Level 8: 緑
  - Level 6: 青
  - その他: グレー

---

#### 2-2. アカウント種別
- **フィールド**: `User.accountType`
- **型**: `String`
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **値**: `NEW_STAFF`, `MID_CAREER`, `LEADER`, `MANAGER`, `EXECUTIVE`

---

#### 2-3. リーダー資格
- **フィールド**: `User.canPerformLeaderDuty`
- **型**: `Boolean`
- **マスター**: 🔵 医療システム（V3評価から算出）
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **デフォルト**: `false`

---

#### 2-4. 職種カテゴリ
- **フィールド**: `User.professionCategory`
- **型**: `String?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **値**: `nurse`, `doctor`, `therapist`, `admin`, `support`

---

#### 2-5. 上司ID
- **フィールド**: `User.parentId`
- **型**: `String?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **備考**: 組織階層、承認フロー用

---

### 3. 雇用情報

#### 3-1. 有効/無効
- **フィールド**: `User.isActive`
- **型**: `Boolean`
- **マスター**: 🔵 医療システム
- **表示箇所**: テーブル、ステータスフィルター、統計カード
- **編集可否**: ❌ 不可（医療システムで管理）
- **デフォルト**: `true`
- **変更タイミング**: 退職時に`false`
- **同期方法**: Webhook `employee.retired`
- **表示形式**: バッジ
  - 有効: 緑色 `bg-green-500/20 text-green-400`
  - 無効: 赤色 `bg-red-500/20 text-red-400`

---

#### 3-2. 退職フラグ
- **フィールド**: `User.isRetired`
- **型**: `Boolean`
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **デフォルト**: `false`
- **備考**: `isActive`と同期（退職時に両方`false`/`true`）

---

#### 3-3. 退職日
- **フィールド**: `User.retirementDate`
- **型**: `DateTime?` (NULL可)
- **マスター**: 🔵 医療システム
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可
- **同期方法**: Webhook `employee.retired`

---

### 4. 同期管理（🆕 Phase 2追加）

#### 4-1. 同期ステータス
- **フィールド**: `User.syncStatus`
- **型**: `Enum('synced', 'pending', 'error', 'never_synced')`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: テーブル（同期状態列）
- **編集可否**: ❌ 不可（自動更新）
- **デフォルト**: `'never_synced'`
- **値の意味**:
  - `synced`: 医療システムと同期済み（緑）
  - `pending`: 同期待ち（黄）
  - `error`: 同期エラー（赤）
  - `never_synced`: 未同期（グレー）
- **表示形式**: アイコン付きバッジ
  - `synced`: ✅ CheckCircle（緑）
  - `error`: ❌ XCircle（赤）
  - `pending`: ⏳ Clock（黄）
  - `never_synced`: ⚠️ AlertTriangle（グレー）

---

#### 4-2. 最終同期日時
- **フィールド**: `User.lastSyncedAt`
- **型**: `DateTime?` (NULL可)
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: テーブル（同期状態列の下）
- **編集可否**: ❌ 不可（自動更新）
- **更新タイミング**: 同期成功時
- **表示形式**: `MM/DD HH:mm`（例: `10/26 14:30`）

---

#### 4-3. 同期エラーメッセージ
- **フィールド**: `User.syncErrorMessage`
- **型**: `String?` (NULL可)
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: テーブル（エラー時のみ、20文字まで）
- **編集可否**: ❌ 不可（自動設定）
- **設定タイミング**: 同期エラー時
- **例**: `Webhook署名検証エラー`, `APIタイムアウト`, `データ形式エラー`

---

### 5. VoiceDrive活動データ

#### 5-1. 最終ログイン日時
- **フィールド**: `User.lastLoginAt`
- **型**: `DateTime?` (NULL可)
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: テーブル（最終ログイン列）
- **編集可否**: ❌ 不可（自動更新）
- **更新タイミング**: ユーザーログイン時
- **表示形式**: `MM/DD HH:mm`（例: `10/05 14:30`）
- **NULL時の表示**: `-`

---

#### 5-2. ログイン回数
- **フィールド**: `User.loginCount`
- **型**: `Int`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可（自動インクリメント）
- **デフォルト**: `0`
- **更新タイミング**: ユーザーログイン時に+1

---

#### 5-3. 作成日時
- **フィールド**: `User.createdAt`
- **型**: `DateTime`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: CSVエクスポートのみ
- **編集可否**: ❌ 不可（自動設定）
- **デフォルト**: `now()`
- **備考**: VoiceDriveへの登録日時

---

#### 5-4. 更新日時
- **フィールド**: `User.updatedAt`
- **型**: `DateTime`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 非表示（内部参照のみ）
- **編集可否**: ❌ 不可（自動更新）
- **更新タイミング**: レコード更新時（Prisma `@updatedAt`）

---

### 6. VoiceDrive固有設定（🆕 Phase 3準備完了）

#### 6-1. メール通知設定
- **フィールド**: `voiceDriveSettings.emailNotifications`
- **型**: `Boolean`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 設定モーダル
- **編集可否**: ✅ **可**（ユーザー自身が編集）
- **デフォルト**: `true`
- **説明**: アイデアボイスへのフィードバック、コメント通知をメールで受信

---

#### 6-2. プッシュ通知設定
- **フィールド**: `voiceDriveSettings.pushNotifications`
- **型**: `Boolean`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 設定モーダル
- **編集可否**: ✅ **可**（ユーザー自身が編集）
- **デフォルト**: `true`
- **説明**: ブラウザプッシュ通知の有効/無効

---

#### 6-3. 週次ダイジェスト
- **フィールド**: `voiceDriveSettings.weeklyDigest`
- **型**: `Boolean`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 設定モーダル
- **編集可否**: ✅ **可**（ユーザー自身が編集）
- **デフォルト**: `true`
- **説明**: 毎週月曜朝に先週のサマリーメールを受信

---

#### 6-4. テーマ設定
- **フィールド**: `voiceDriveSettings.theme`
- **型**: `Enum('light', 'dark', 'auto')`
- **マスター**: 🟢 VoiceDrive
- **表示箇所**: 設定モーダル
- **編集可否**: ✅ **可**（ユーザー自身が編集）
- **デフォルト**: `'auto'`
- **説明**: UIテーマ（ライト/ダーク/自動）

---

### 7. 統計データ（計算値）

#### 7-1. 総ユーザー数
- **計算式**: `users.length`
- **表示箇所**: 統計カード
- **データソース**: VoiceDrive `User`テーブル

---

#### 7-2. アクティブユーザー数
- **計算式**: `users.filter(u => u.isActive).length`
- **表示箇所**: 統計カード
- **データソース**: VoiceDrive `User.isActive`

---

#### 7-3. 無効ユーザー数
- **計算式**: `users.filter(u => !u.isActive).length`
- **表示箇所**: 統計カード
- **データソース**: VoiceDrive `User.isActive`

---

#### 7-4. 管理者数
- **計算式**: `users.filter(u => u.permissionLevel >= 10).length`
- **表示箇所**: 統計カード
- **データソース**: VoiceDrive `User.permissionLevel`

---

## 📋 Prisma Schema拡張案

```prisma
model User {
  id                            String                          @id @default(cuid())
  employeeId                    String                          @unique
  email                         String                          @unique
  name                          String
  department                    String?
  facilityId                    String?
  role                          String?
  avatar                        String?
  accountType                   String
  permissionLevel               Decimal
  canPerformLeaderDuty          Boolean                         @default(false)
  professionCategory            String?
  parentId                      String?
  budgetApprovalLimit           Float?
  stakeholderCategory           String?
  position                      String?
  expertise                     Int?
  hierarchyLevel                Int?
  isRetired                     Boolean                         @default(false)
  retirementDate                DateTime?
  anonymizedId                  String?
  createdAt                     DateTime                        @default(now())
  updatedAt                     DateTime                        @updatedAt
  lastLoginAt                   DateTime?
  loginCount                    Int                             @default(0)

  // 🆕 Phase 2: 同期管理フィールド
  syncStatus                    SyncStatus                      @default(never_synced) @map("sync_status")
  lastSyncedAt                  DateTime?                       @map("last_synced_at")
  syncErrorMessage              String?                         @map("sync_error_message")

  // 🆕 Phase 3: VoiceDrive固有設定
  voiceDriveSettings            Json?                           @map("voicedrive_settings")

  // ... 既存リレーション

  @@index([syncStatus])
  @@map("users")
}

// 🆕 同期ステータスEnum
enum SyncStatus {
  synced
  pending
  error
  never_synced
}
```

---

## 🎯 実装チェックリスト

### Phase 1: 同期基盤構築（2週間）

#### Week 1: DB・サービス実装
- [ ] Prisma schema拡張
  - [ ] `syncStatus` Enum追加
  - [ ] `User.syncStatus`, `User.lastSyncedAt`, `User.syncErrorMessage`追加
  - [ ] `User.voiceDriveSettings` JSON追加
- [ ] マイグレーション実行
- [ ] `MedicalSystemClient.ts`実装
  - [ ] `getAllEmployees()`
  - [ ] `getEmployee(employeeId)`
- [ ] `UserSyncService.ts`実装
  - [ ] `syncSingleUser(userId)`
  - [ ] `syncAllUsers()`

#### Week 2: API・UI統合
- [ ] `userManagementRoutes.ts`実装
  - [ ] `GET /api/admin/users`
  - [ ] `POST /api/admin/users/:userId/sync`
  - [ ] `POST /api/admin/users/sync-all`
- [ ] UserManagementPage API統合
  - [ ] `loadUsers()`をAPI呼び出しに変更
  - [ ] `handleSyncSingleUser()`を実装
  - [ ] `handleSyncAllUsers()`を実装
- [ ] エラーハンドリング実装
- [ ] 統合テスト

---

### Phase 2: Webhook統合（1週間）

#### Week 3: Webhook実装
- [ ] Webhook受信エンドポイント
  - [ ] `POST /api/webhooks/employee-created`
  - [ ] `POST /api/webhooks/employee-updated`
  - [ ] `POST /api/webhooks/employee-retired`
- [ ] HMAC-SHA256署名検証
- [ ] Webhook処理ロジック
  - [ ] `User.upsert()`
  - [ ] `syncStatus='synced'`設定
- [ ] リトライ機構
- [ ] 統合テスト

---

### Phase 3: VoiceDrive固有設定（1週間）

#### Week 4: 設定機能実装
- [ ] 設定編集モーダルUI実装
- [ ] 設定API実装
  - [ ] `PUT /api/users/:userId/settings`
- [ ] デフォルト値設定
- [ ] 通知システム連携
- [ ] テーマシステム連携
- [ ] 統合テスト

---

## 📞 関連ドキュメント

| ドキュメント | ファイルパス | 作成日 |
|------------|------------|--------|
| **DB要件分析** | `mcp-shared/docs/UserManagementPage_DB要件分析_20251026.md` | 10/26 |
| **暫定マスターリスト** | `mcp-shared/docs/UserManagementPage暫定マスターリスト_20251026.md` | 10/26 |
| **データ管理責任分界点定義書** | `mcp-shared/docs/データ管理責任分界点定義書_20251008.md` | 10/8 |
| **PersonalStation DB要件分析** | `mcp-shared/docs/PersonalStation_DB要件分析_20251008.md` | 10/8 |
| **Dashboard DB要件分析** | `mcp-shared/docs/Dashboard_DB要件分析_20251009.md` | 10/9 |

---

**文書終了**

最終更新: 2025年10月26日
作成者: VoiceDriveチーム
次回レビュー: Phase 1実装開始時
