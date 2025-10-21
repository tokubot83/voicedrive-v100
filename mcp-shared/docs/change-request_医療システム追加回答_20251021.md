# キャリアコース変更申請 追加質問への回答

**文書番号**: MED-RES-2025-1021-002
**作成日**: 2025年10月21日
**作成者**: ClaudeCode（医療システムチーム）
**対象**: VoiceDriveチーム
**参照文書**: VD-RES-2025-1021-001（VoiceDrive回答）

---

## 📋 エグゼクティブサマリー

VoiceDriveチームからいただいた追加質問3件に対する回答です。

### 回答サマリー

| 質問 | 回答 |
|------|------|
| **API認証方式** | Supabase JWT認証を使用（既存と同じ） |
| **Phase 5-4スケジュール** | 2025年10月28日～11月8日（実働7日） |
| **Mock API利用** | 即座に利用可能（エンドポイント提供） |

---

## 1. 追加質問1への回答: API認証方式について

### 回答: Supabase JWT認証を使用

**認証方式**: VoiceDriveの既存Supabase JWT認証をそのまま使用可能です。

#### 認証フロー

```typescript
// VoiceDrive側の実装例
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ユーザーログイン
const { data: { session } } = await supabase.auth.getSession();

// 医療システムAPIへのリクエスト
const response = await fetch('https://medical.example.com/api/career-course/change-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`, // Supabase JWT
  },
  body: JSON.stringify({
    currentCourseCode: 'B',
    requestedCourseCode: 'D',
    changeReason: 'special_pregnancy',
    reasonDetail: '...'
  })
});
```

#### 医療システム側の検証処理

```typescript
// src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';

export async function verifySupabaseToken(token: string) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}
```

#### 必要なヘッダー

| ヘッダー名 | 値 | 必須 |
|-----------|---|------|
| `Authorization` | `Bearer {supabase_jwt}` | ✅ 必須 |
| `Content-Type` | `application/json` | ✅ 必須（POST時） |

#### トークン検証方法

1. **Supabase Service Role Keyを使用**
   - 医療システム側でSupabase Service Role Keyを設定
   - `supabase.auth.getUser(token)` でトークン検証
   - ユーザー情報（employeeId等）を取得

2. **環境変数設定（医療システム側）**
   ```env
   # .env.production
   SUPABASE_URL=https://[project-id].supabase.co
   SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
   ```

3. **ユーザー情報とemployeeIdの紐付け**
   - Supabaseユーザー: `user.id`
   - 医療システム職員: `Employee.id`
   - 紐付けテーブル: `SystemAccount` テーブル（既存）

   ```typescript
   // ユーザー情報からemployeeIdを取得
   const systemAccount = await prisma.systemAccount.findUnique({
     where: {
       systemName_accountId: {
         systemName: 'voicedrive',
         accountId: user.id // Supabase user.id
       }
     }
   });

   const employeeId = systemAccount.employeeId;
   ```

#### VoiceDrive側の実装例（完全版）

```typescript
// src/services/careerCourseService.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MEDICAL_API_BASE_URL = process.env.NEXT_PUBLIC_MEDICAL_API_URL!;

export async function submitCareerCourseChangeRequest(data: {
  currentCourseCode: string;
  requestedCourseCode: string;
  changeReason: string;
  reasonDetail: string;
  requestedEffectiveDate: string;
  attachments?: string[];
}) {
  // 認証トークン取得
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // 医療システムAPIへリクエスト
  const response = await fetch(`${MEDICAL_API_BASE_URL}/api/career-course/change-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return await response.json();
}
```

---

## 2. 追加質問2への回答: Phase 5-4スケジュールについて

### 回答: 2025年10月28日（月）～ 11月8日（金）

#### 詳細スケジュール

| フェーズ | 期間 | 作業内容 | 完了予定日 | VoiceDrive参加 |
|---------|------|---------|-----------|---------------|
| **Phase 5-4a**: DB構築 | 10/28-10/29（2日） | マイグレーション実行、初期データ投入 | 10/29（火） | ❌ |
| **Phase 5-4b**: API実装 | 10/30-11/1（3日） | API DB接続、Prismaクエリ実装 | 11/1（金） | ❌ |
| **Phase 5-4c**: ファイル処理 | 11/4-11/5（2日） | Supabase Storage統合 | 11/5（火） | ❌ |
| **Phase 5-4d**: 統合テスト | 11/6-11/8（3日） | VoiceDrive連携テスト | 11/8（金） | ✅ **参加必須** |

#### マイルストーン

| 日付 | マイルストーン | VoiceDrive側の作業 |
|------|--------------|-------------------|
| **10/29（火）** | DB構築完了 | - |
| **11/1（金）** | API実装完了 | - |
| **11/5（火）** | ファイルストレージ統合完了 | - |
| **11/6（水）** | **統合テスト開始** | ✅ VoiceDrive側のUI接続開始 |
| **11/7（木）** | 統合テスト実施 | ✅ 動作確認・バグ報告 |
| **11/8（金）** | **統合テスト完了** | ✅ 最終確認・承認 |

#### VoiceDrive側の参加が必要なマイルストーン

##### 11/6（水）9:00 - 統合テストキックオフ

**目的**: VoiceDrive側UIと医療システムAPIの接続確認

**参加者**:
- VoiceDriveチーム: プロジェクトリード、技術担当
- 医療システムチーム: API担当、テスト担当

**アジェンダ**:
1. API仕様の最終確認
2. 認証フロー確認
3. エラーハンドリング確認
4. テストシナリオ共有

##### 11/7（木）終日 - 統合テスト実施

**テスト内容**:
1. コース変更申請フロー（正常系）
2. ファイルアップロード
3. バリデーションエラー
4. 認証エラー
5. ネットワークエラー

**VoiceDrive側の作業**:
- `ChangeRequestPage.tsx` のAPI接続
- エラーハンドリングの実装
- ローディング状態の実装

##### 11/8（金）15:00 - 統合テスト完了報告

**目的**: テスト結果の報告と承認

**成果物**:
- 統合テスト報告書
- 既知の問題リスト
- リリース判定

#### スケジュール調整

**質問**: 上記スケジュールでVoiceDrive側の都合は問題ありませんか？

調整が必要な場合はお知らせください。

---

## 3. 追加質問3への回答: Mock APIの利用可能性について

### 回答: 即座に利用可能

#### Mock APIエンドポイント

**ベースURL**: `http://localhost:3000` （医療システム開発サーバー）

または

**ベースURL**: `https://medical-dev.example.com` （医療システムDev環境）

#### 利用可能なエンドポイント

##### 1. コース定義一覧取得

```
GET /api/career-courses/definitions
```

**レスポンス例**:
```json
[
  {
    "id": "1",
    "courseCode": "A",
    "courseName": "Aコース（全面協力型）",
    "description": "部署・施設間異動に全面協力。管理職候補。基本給×1.2",
    "departmentTransferAvailable": true,
    "facilityTransferAvailable": "full",
    "relocationRequired": true,
    "nightShiftAvailable": "required",
    "managementTrack": true,
    "baseSalaryMultiplier": 1.2,
    "isActive": true,
    "displayOrder": 1
  },
  {
    "id": "2",
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "description": "施設内の部署異動に対応。管理職候補。基本給×1.1",
    "baseSalaryMultiplier": 1.1,
    // ...
  }
]
```

##### 2. マイページ情報取得

```
GET /api/my-page
```

**レスポンス例**:
```json
{
  "id": "EMP2024001",
  "name": "山田 太郎",
  "position": "看護師",
  "department": "内科",
  "facility": "小原病院",
  "employeeId": "OH-NS-2024-001",
  "joinDate": "2024-04-01",
  "careerCourse": {
    "courseCode": "B",
    "courseName": "Bコース（施設内協力型）",
    "effectiveFrom": "2024-04-01",
    "nextChangeAvailableDate": "2025-04-01"
  }
}
```

##### 3. コース変更申請送信

```
POST /api/career-course/change-request
```

**リクエスト例**:
```json
{
  "currentCourseCode": "B",
  "requestedCourseCode": "D",
  "changeReason": "special_pregnancy",
  "reasonDetail": "妊娠により夜勤対応が困難なため",
  "requestedEffectiveDate": "2025-11-01",
  "attachments": []
}
```

**レスポンス例（成功）**:
```json
{
  "id": "ccr-2025-001",
  "staffId": "OH-NS-2024-001",
  "approvalStatus": "pending",
  "createdAt": "2025-10-21T10:30:00Z",
  "message": "コース変更申請を受け付けました。人事部の審査をお待ちください。"
}
```

**レスポンス例（エラー）**:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "年1回の変更制限に達しています",
    "details": {
      "nextChangeAvailableDate": "2025-04-01"
    }
  }
}
```

##### 4. 申請履歴取得

```
GET /api/career-course/my-requests
```

**レスポンス例**:
```json
[
  {
    "id": "ccr-2025-001",
    "currentCourseCode": "B",
    "requestedCourseCode": "D",
    "changeReason": "special_pregnancy",
    "requestedEffectiveDate": "2025-11-01",
    "approvalStatus": "pending",
    "createdAt": "2025-10-21T10:30:00Z"
  }
]
```

#### Mock API仕様書

**場所**: `docs/Phase5_API仕様書_VoiceDrive連携.md`

または、OpenAPI仕様書を作成予定:
- `docs/openapi/career-course-api.yaml`

#### 利用可能期間

**開始**: 即時（2025年10月21日～）
**終了**: Phase 5-4d完了まで（2025年11月8日）

Phase 5-4d完了後は実DBに接続されたAPIに切り替わります。

#### モックデータの内容

**職員データ**:
- 山田 太郎（OH-NS-2024-001）: Bコース → Dコース変更申請
- 佐藤 花子（OH-NS-2024-002）: Aコース → Bコース変更申請
- 鈴木 次郎（OH-NS-2024-003）: Cコース → Aコース変更申請

**コース定義**:
- A, B, C, D 4コース（Phase 5実装計画書通り）

#### Mock APIの起動方法

```bash
# 医療システムリポジトリ
cd staff-medical-system

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# Mock APIが http://localhost:3000 で起動
```

#### VoiceDrive側での使用方法

```typescript
// .env.local
NEXT_PUBLIC_MEDICAL_API_URL=http://localhost:3000

// または
NEXT_PUBLIC_MEDICAL_API_URL=https://medical-dev.example.com
```

#### 注意事項

1. **認証**
   - Mock APIは現在認証をスキップしています
   - `Authorization` ヘッダーは受け付けますが検証はしません
   - Phase 5-4b以降は実際の認証が必要になります

2. **データ永続性**
   - Mock APIはメモリ内データのため、再起動すると初期化されます
   - 申請データは保存されません

3. **レスポンス時間**
   - 実際のDB接続を模倣するため、意図的に2秒のディレイを設定しています

---

## 4. 追加情報: Phase 5-3 UIの扱いについて

VoiceDrive側がUIを使用するとの回答を受け、医療システム側のPhase 5-3 UIの扱いを以下のように決定しました。

### 決定事項

**Phase 5-3 UIは医療システム専用機能に転用**

#### 転用先

1. **人事部管理画面** - `/admin/career-courses/`
   - 申請一覧画面
   - 申請詳細・審査画面
   - 承認・却下処理画面

2. **経営層ダッシュボード** - `/dashboard/career-courses/`
   - コース別職員数統計
   - コース変更申請状況
   - 傾向分析

#### メリット

- 既存実装（900行以上）を無駄にしない
- 医療システム側でも独自のUI/UX価値を提供
- VoiceDriveとの責任分離を明確化

---

## 5. 次のステップ

### 医療システムチームの対応

1. ✅ **本回答のレビュー** - VoiceDriveチームに送付（本日中）
2. ⏳ **Mock API公開** - Dev環境URL提供（10/22までに）
3. ⏳ **OpenAPI仕様書作成** - API仕様の詳細化（10/24までに）
4. ⏳ **Phase 5-4実装開始** - 10/28（月）キックオフ

### VoiceDriveチームへの依頼

1. **スケジュール確認** - 11/6-11/8の統合テスト参加可否
2. **Mock API接続テスト** - 10/22以降、Dev環境接続確認
3. **認証フロー確認** - Supabase JWT認証の実装確認

---

## 6. 連絡先

**医療システムチーム担当:**
- プロジェクトリード: [担当者名]
- API担当: [担当者名]
- Slack: #phase5-career-course

**回答期限希望:**
可能であれば2025年10月23日（水）までにスケジュール確認のご回答をお願いします。

---

## 7. まとめ

| 質問 | 回答 | 詳細 |
|------|------|------|
| **API認証** | Supabase JWT認証 | VoiceDrive既存認証をそのまま使用可能 |
| **Phase 5-4スケジュール** | 10/28～11/8（実働7日） | 統合テストは11/6-11/8 |
| **Mock API** | 即座に利用可能 | http://localhost:3000 または Dev環境 |

VoiceDriveチームの迅速な回答に感謝いたします。
上記スケジュールと方針で実装を進めさせていただきます。

引き続きよろしくお願いいたします。

---

**改訂履歴**

| 版 | 日付 | 変更内容 | 作成者 |
|----|------|---------|--------|
| 1.0 | 2025-10-21 | 初版作成 | 医療システムチーム |
