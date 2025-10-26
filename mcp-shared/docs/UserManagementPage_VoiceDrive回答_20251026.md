# UserManagementPage VoiceDrive回答書

**文書番号**: VD-RESP-2025-1026-005
**作成日**: 2025年10月26日
**作成者**: VoiceDriveチーム
**宛先**: 医療システムチーム
**件名**: UserManagementPage API要件への回答
**参照文書**: UserManagementPage_医療システム確認結果_20251026.md

---

## 📋 エグゼクティブサマリー

医療システムチームからの確認結果報告書（UserManagementPage_医療システム確認結果_20251026.md）を受領しました。
以下、医療システムチームからの質問事項に回答いたします。

### 回答サマリー
- ✅ **API仕様**: 提案内容で承認（レスポンス構造、ページネーション、フィルタリング）
- ✅ **認証方式**: Bearer Token認証を採用（JWT）
- ✅ **Rate Limit**: 提案通り100 req/min/IPで承認
- ✅ **professionCategory**: Phase 2での実装を希望（優先度: 中）
- 🆕 **追加要望**: API-3（部署別職員リスト取得）の追加実装を希望（オプション）

---

## ✅ 医療システムチームからの質問への回答

### 質問1: API仕様の最終承認 - レスポンス構造の確認

**回答**: ✅ **提案されたレスポンス構造を承認します**

#### API-1: 全職員取得API

提案されたレスポンス構造：
```json
{
  "employees": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "totalCount": 500,
    "totalPages": 5,
    "hasNext": true
  }
}
```

**VoiceDrive側の評価**:
- ✅ ページネーション構造が明確
- ✅ `hasNext`フラグが便利（無限スクロール実装時）
- ✅ `totalCount`, `totalPages`でUI表示が容易

**変更要望**: **なし**（提案通りで問題ありません）

---

#### API-2: 個別職員取得API

提案されたレスポンス構造：
```json
{
  "employeeId": "EMP-2025-001",
  "name": "山田太郎",
  "email": "yamada@obara-hospital.jp",
  // ...（全フィールド）
  "yearsOfService": 0.6,
  "updatedAt": "2025-10-26T10:00:00Z"
}
```

**VoiceDrive側の評価**:
- ✅ 必要なフィールドがすべて含まれている
- ✅ `yearsOfService`の計算が医療システム側で実装されている（便利）
- ✅ ISO 8601形式の日時表記

**変更要望**: **なし**（提案通りで問題ありません）

---

#### Webhookペイロード仕様

提案されたペイロード構造：
```json
{
  "event": "employee.updated",
  "timestamp": "2025-10-26T10:00:00Z",
  "source": "medical-system",
  "data": {
    "employeeId": "EMP-2025-001",
    // ...（全フィールド）
  }
}
```

**VoiceDrive側の評価**:
- ✅ イベント名が明確（`employee.created`, `employee.updated`, `employee.retired`）
- ✅ タイムスタンプとソースが含まれている
- ✅ データ構造がAPI-2と一致（実装が容易）

**変更要望**: **なし**（提案通りで問題ありません）

**補足要望**:
- Webhook受信エンドポイント: `POST /api/webhooks/medical-system/employee`
- HMAC-SHA256署名検証: 引き続きPhase 2.5の方式を使用
- リトライポリシー: 医療システム側の既存実装（最大3回、1分/5分/30分間隔）を採用

---

### 質問2: 認証方式の確認 - API Key認証でOKか、JWTトークン必要か

**回答**: ✅ **Bearer Token認証（JWT）を採用します**

#### 採用理由

1. **セキュリティ**: JWTトークンは有効期限を設定できる（API Keyは永続的）
2. **権限管理**: JWTペイロードに権限情報を含められる（Level 99チェック等）
3. **監査**: ユーザーごとのAPI呼び出しを追跡可能
4. **既存実装との統合**: VoiceDriveの既存認証機構（useAuth）と統合しやすい

#### 実装方式

**医療システム側の実装**:
```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // { userId, permissionLevel, ... }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// API-1, API-2に適用
router.get('/api/v2/employees', authenticateJWT, async (req, res) => {
  // permissionLevel 99チェック
  if (req.user.permissionLevel !== 99) {
    return res.status(403).json({ error: 'Forbidden: Level 99 required' });
  }
  // ...
});
```

**VoiceDrive側の実装**:
```typescript
// src/services/MedicalSystemClient.ts
import { getAuthToken } from '../lib/auth';

export class MedicalSystemClient {
  static async getAllEmployees(params?: any) {
    const token = await getAuthToken(); // JWT取得

    const response = await axios.get(`${MEDICAL_API_BASE_URL}/api/v2/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  }
}
```

**トークン仕様**:
- **有効期限**: 1時間（アクセストークン）
- **リフレッシュトークン**: 7日間
- **ペイロード**:
  ```json
  {
    "userId": "admin-001",
    "employeeId": "EMP-2025-001",
    "permissionLevel": 99,
    "iat": 1730000000,
    "exp": 1730003600
  }
  ```

---

### 質問3: Rate Limitの妥当性 - 100 req/min/IPで十分か

**回答**: ✅ **100 req/min/IPで十分です**

#### 使用シナリオ分析

| シナリオ | 予想リクエスト数 | 頻度 | Rate Limit内か |
|---------|----------------|------|--------------|
| **UserManagementPage初回ロード** | 1リクエスト（全職員取得） | ページ開く時 | ✅ OK（1 req） |
| **個別ユーザー同期** | 1リクエスト/ユーザー | 手動クリック | ✅ OK（1 req） |
| **全ユーザー一括同期（500名）** | 1リクエスト（ページング対応） | 1日1回程度 | ✅ OK（1 req） |
| **日次バッチ同期** | 5リクエスト（100件/ページ × 5ページ） | 1日1回（03:00 JST） | ✅ OK（5 req/分） |
| **Webhook受信** | 0リクエスト（プッシュ型） | - | - |

**結論**: 100 req/min/IPで十分です。

**推奨事項**:
- Level 99管理者専用のため、同時利用は最大3-5名程度
- バッチ処理は1分間に5リクエスト程度（500件 ÷ 100件/ページ = 5リクエスト）
- 緊急時のRate Limit引き上げ手段を用意（管理画面でIP別に設定可能等）

---

### 質問4: professionCategoryの優先度 - Phase 2の実装タイミング

**回答**: 🟡 **Phase 2での実装を希望（優先度: 中）**

#### 実装タイミング

**Phase 1**: professionCategory = `null` でも問題なし
- VoiceDrive側では現状使用していない
- API-1, API-2のレスポンスに`professionCategory: null`を含めるのみ

**Phase 2**: DB構築後、余裕があれば実装
- 推定工数: 0.5日（医療システムチーム）
- VoiceDrive側の変更: なし（APIレスポンスを受け取るのみ）

**Phase 3以降**: フィルタリング機能追加時に必須
- UserManagementPageに「職種別フィルター」追加時
- 統計カードに「職種別ユーザー数」追加時

**結論**: **Phase 2で実装していただけると助かりますが、Phase 1では必須ではありません**

---

## 🆕 VoiceDrive側からの追加要望

### 追加要望1: API-3（部署別職員リスト取得）の追加実装（オプション）

**優先度**: 🟢 低（Phase 3以降でOK）

#### 背景

UserManagementPageで「部署別フィルター」を実装する際、以下の2つのアプローチがあります：

**Option A**: VoiceDrive側でフィルタリング（現状）
```typescript
// VoiceDrive側で全職員取得後にフィルタ
const allUsers = await MedicalSystemClient.getAllEmployees();
const filteredUsers = allUsers.filter(u => u.department === selectedDepartment);
```

**Option B**: 医療システム側でフィルタリング（提案）
```typescript
// 医療システムAPIで部署別に取得
const usersInDepartment = await MedicalSystemClient.getUsersByDepartment(departmentId);
```

#### API-3仕様（提案）

**エンドポイント**: `GET /api/v2/departments/{departmentId}/employees`

**リクエスト**:
```http
GET /api/v2/departments/nursing-dept/employees?page=1&limit=100
Authorization: Bearer {jwt_token}
```

**レスポンス**:
```json
{
  "departmentId": "nursing-dept",
  "departmentName": "看護部",
  "employees": [
    {
      "employeeId": "EMP-2025-001",
      "name": "山田太郎",
      // ... (API-1と同じ構造)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "totalCount": 80,
    "totalPages": 1,
    "hasNext": false
  }
}
```

**メリット**:
- 大規模組織（500名以上）でのパフォーマンス向上
- ネットワーク帯域の節約
- 医療システム側で最適化されたクエリ実行

**デメリット**:
- API実装工数増加（推定0.3日）

**VoiceDrive側の判断**: Phase 3以降で検討（現時点では不要）

---

### 追加要望2: Webhookエンドポイントの確認

**VoiceDrive側のWebhook受信エンドポイント**:
```
POST https://voicedrive-v100.vercel.app/api/webhooks/medical-system/employee
```

**ローカル開発環境**:
```
POST http://localhost:5173/api/webhooks/medical-system/employee
```

**ステージング環境**（将来）:
```
POST https://voicedrive-v100-staging.vercel.app/api/webhooks/medical-system/employee
```

**署名検証**:
- HMAC-SHA256（Phase 2.5と同じ方式）
- Secret Key: VoiceDriveチームから提供（環境変数: `MEDICAL_WEBHOOK_SECRET`）

**医療システムチームへのお願い**:
- Webhook送信先URLを環境変数化（`VOICEDRIVE_WEBHOOK_ENDPOINT`）
- 開発/ステージング/本番環境で切り替え可能に

---

## 📅 実装スケジュール（VoiceDrive側）

### Phase 1: 同期基盤構築（2週間）

**期間**: 2025年10月28日（月）〜 11月8日（金）

| 日付 | 作業内容 | 担当 | 状態 |
|------|---------|------|------|
| **Week 1: DB・サービス実装** |
| 10/28 | Prisma schema拡張（syncStatus, voiceDriveSettings） | VoiceDrive | ⏳ 準備中 |
| 10/29 | マイグレーション実行 | VoiceDrive | ⏳ 準備中 |
| 10/30-10/31 | MedicalSystemClient実装 | VoiceDrive | ⏳ 準備中 |
| 11/1 | UserSyncService実装 | VoiceDrive | ⏳ 準備中 |
| **Week 2: API・UI統合** |
| 11/4-11/5 | userManagementRoutes実装 | VoiceDrive | ⏳ 準備中 |
| 11/6 | UserManagementPage API統合 | VoiceDrive | ⏳ 準備中 |
| 11/7 | エラーハンドリング・統合テスト | VoiceDrive | ⏳ 準備中 |
| 11/8 | 医療システムチームと統合確認ミーティング | 両チーム | ⏳ 準備中 |

### Phase 2: Webhook統合（1週間）

**期間**: 2025年11月11日（月）〜 11月15日（金）

| 日付 | 作業内容 | 担当 | 状態 |
|------|---------|------|------|
| 11/11-11/12 | Webhook受信エンドポイント実装 | VoiceDrive | ⏳ 待機中 |
| 11/13 | 署名検証実装 | VoiceDrive | ⏳ 待機中 |
| 11/14 | Webhook処理ロジック実装 | VoiceDrive | ⏳ 待機中 |
| 11/15 | Webhook統合テスト（医療システムと） | 両チーム | ⏳ 待機中 |

### Phase 3: VoiceDrive固有設定（1週間）

**期間**: 2025年11月18日（月）〜 11月22日（金）

| 日付 | 作業内容 | 担当 | 状態 |
|------|---------|------|------|
| 11/18-11/19 | 設定編集モーダルUI実装 | VoiceDrive | ⏳ 待機中 |
| 11/20 | 設定API実装 | VoiceDrive | ⏳ 待機中 |
| 11/21 | 通知・テーマシステム連携 | VoiceDrive | ⏳ 待機中 |
| 11/22 | Phase 3統合テスト | VoiceDrive | ⏳ 待機中 |

---

## ✅ 医療システムチームへの確認・依頼事項

### 即座確認が必要な事項

1. **JWT Secret Keyの共有方式**
   - 提案: Slackダイレクトメッセージで共有
   - 本番環境用、ステージング環境用の2つを発行

2. **Webhook送信先URL**
   - 開発環境: `http://localhost:5173/api/webhooks/medical-system/employee`
   - 本番環境: `https://voicedrive-v100.vercel.app/api/webhooks/medical-system/employee`
   - ステージング環境（将来）: TBD

3. **Webhook Secret Keyの共有**
   - VoiceDrive側の`MEDICAL_WEBHOOK_SECRET`
   - 医療システム側の`VOICEDRIVE_WEBHOOK_SECRET`
   - 同じ値を使用（Phase 2.5と同様）

4. **統合テストの日程調整**
   - 11月8日（金）15:00-17:00 統合確認ミーティング
   - 11月15日（金）15:00-17:00 Webhook統合テスト

---

## 📊 成功指標（KPI）

VoiceDrive側で設定する成功指標：

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| **API統合** |
| API-1応答時間 | < 500ms（95%ile） | フロントエンド測定 |
| API-2応答時間 | < 200ms（95%ile） | フロントエンド測定 |
| API呼び出し成功率 | > 99% | エラーログ分析 |
| **Webhook統合** |
| Webhook受信成功率 | > 99.5% | Webhookログ分析 |
| 署名検証成功率 | 100% | 検証ログ分析 |
| データ同期遅延 | < 5秒 | タイムスタンプ比較 |
| **ユーザー体験** |
| UserManagementPage読み込み時間 | < 1秒 | フロントエンド測定 |
| 個別同期処理時間 | < 3秒 | ユーザーフィードバック |
| 一括同期処理時間 | < 10秒（500名） | バッチログ分析 |
| **データ整合性** |
| 同期成功率 | > 99% | 日次検証バッチ |
| データ不整合件数 | 0件/週 | 監査ログ |

---

## 🔗 関連ドキュメント

### VoiceDrive側ドキュメント
1. [UserManagementPage_DB要件分析_20251026.md](./UserManagementPage_DB要件分析_20251026.md) - VoiceDrive側のDB分析
2. [UserManagementPage暫定マスターリスト_20251026.md](./UserManagementPage暫定マスターリスト_20251026.md) - 全31データ項目の詳細仕様
3. [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ責任分担の基本原則

### 医療システム側ドキュメント
1. [UserManagementPage_医療システム確認結果_20251026.md](./UserManagementPage_医療システム確認結果_20251026.md) - 医療システムからの確認結果

---

## 📞 次のアクション

### VoiceDriveチームの即座対応
1. ✅ 本回答書を医療システムチームに送付（mcp-shared/docs/に保存済み）
2. ⏳ JWT Secret Keyの受領待ち（Slack DM）
3. ⏳ Webhook Secret Keyの受領待ち（Slack DM）
4. ⏳ 10/28（月）Phase 1実装開始

### 医療システムチームへのお願い
1. ⏳ 本回答書のレビュー
2. ⏳ JWT Secret Key発行・共有（開発環境用、本番環境用）
3. ⏳ Webhook Secret Key確認（Phase 2.5と同じ値でOKか）
4. ⏳ 10/28-11/1 API-1, API-2実装
5. ⏳ 11/4-11/5 Webhook実装（employee.created/updated）
6. ⏳ 11/8（金）15:00 統合確認ミーティング

---

## 🎯 まとめ

### API仕様承認
- ✅ API-1（全職員取得API）: 承認
- ✅ API-2（個別職員取得API）: 承認
- ✅ Webhookペイロード: 承認

### 認証・セキュリティ
- ✅ 認証方式: Bearer Token（JWT）を採用
- ✅ Rate Limit: 100 req/min/IPで承認
- ⏳ JWT Secret Key: 医療システムチームから受領待ち
- ⏳ Webhook Secret Key: Phase 2.5と同じ値の確認待ち

### 実装スケジュール
- **Phase 1（VoiceDrive）**: 10/28-11/8（2週間）
- **Phase 1（医療システム）**: 10/28-11/1（1週間）
- **Phase 2（両チーム）**: 11/11-11/15（1週間）
- **統合確認ミーティング**: 11/8（金）15:00-17:00

### 追加要望
- 🟡 professionCategory: Phase 2で実装希望（優先度: 中）
- 🟢 API-3（部署別職員リスト）: Phase 3以降でOK（優先度: 低）

医療システムチームのご協力に感謝いたします。引き続きよろしくお願いいたします。

---

**文書終了**

最終更新: 2025年10月26日
バージョン: 1.0
承認: VoiceDriveチーム承認済み
次回レビュー: 医療システムチームからのフィードバック受領後
