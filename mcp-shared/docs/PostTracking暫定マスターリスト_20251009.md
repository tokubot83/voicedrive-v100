# 投稿追跡 暫定マスターリスト（VoiceDrive → 医療システム API要求リスト）

**文書番号**: PT-ML-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**対象機能**: 投稿追跡（個人・部署・施設・法人）
**ステータス**: 医療システムチーム確認待ち

---

## 📋 エグゼクティブサマリー

### 目的

VoiceDrive「投稿追跡機能」において、医療職員管理システムに提供を依頼するAPI・Webhookのリストです。

### 重要な前提

**投稿追跡データはVoiceDrive 100%管轄**のため、医療システムへのAPI要求は**最小限**です。

- ✅ **必要なAPI**: 職員マスタ参照のみ（2種類）
- ✅ **必要なWebhook**: 組織改編通知のみ（1種類）
- ✅ **不要なもの**: 投稿データ、投票データ、コメントデータの連携（VoiceDrive完結）

### コスト概算

| 項目 | 工数（人日） | 単価 | 金額 |
|-----|------------|------|------|
| API-PT-M-1: 職員情報取得API | 2日 | ¥80,000 | ¥160,000 |
| API-PT-M-2: 部署メンバー一覧取得API | 3日 | ¥80,000 | ¥240,000 |
| Webhook-PT-M-1: 組織改編通知 | 5日 | ¥80,000 | ¥400,000 |
| 結合テスト | 2日 | ¥80,000 | ¥160,000 |
| **合計** | **12日** | - | **¥960,000** |

---

## 🔌 必要なAPI（医療システム → VoiceDrive）

### API-PT-M-1: 職員情報取得API

**優先度**: 🔴 高（Phase 1必須）

**目的**: 投稿追跡画面で職員名・部署・権限レベルを表示するため

**エンドポイント**: `GET /api/employees/:employeeId`

**Request Headers**:
```
Authorization: Bearer <VoiceDrive側JWT>
X-API-Version: 1.0
```

**Path Parameters**:
- `employeeId` (string, required): 職員ID（例: OH-NS-2024-001）

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": "OH-NS-2024-001",
    "name": "山田太郎",
    "email": "yamada@example.com",
    "department": "看護部",
    "departmentId": "dept-001",
    "facility": "小原病院",
    "facilityId": "fac-001",
    "position": "看護師長",
    "permissionLevel": 8,
    "employmentStatus": "regular_employee",
    "hireDate": "2020-04-01",
    "isRetired": false,
    "avatar": "https://medical-system.example.com/avatars/yamada.jpg"
  }
}
```

**Response (Not Found)**:
```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "指定された職員IDが見つかりません。"
  }
}
```

**必要な理由**:
- 投稿者名・部署を画面に表示
- 権限レベルに応じた閲覧制御
- アバター画像の表示

**使用箇所**:
- IdeaVoiceTracking.tsx (投稿カード表示)
- TrackingPostCard.tsx (投稿者情報表示)

**実装工数**: 2日

---

### API-PT-M-2: 部署メンバー一覧取得API

**優先度**: 🟡 中（Phase 3: 動的閾値機能で使用）

**目的**: 動的閾値計算のため、部署のメンバー数を取得

**エンドポイント**: `GET /api/departments/:departmentId/members`

**Request Headers**:
```
Authorization: Bearer <VoiceDrive側JWT>
X-API-Version: 1.0
```

**Path Parameters**:
- `departmentId` (string, required): 部署ID（例: dept-001）

**Query Parameters**:
- `includeRetired` (boolean, optional): 退職者を含むか（デフォルト: false）
- `activeOnly` (boolean, optional): アクティブメンバーのみ（デフォルト: false）
- `activeDays` (number, optional): アクティブ判定期間（日数、デフォルト: 30）

**Response**:
```json
{
  "success": true,
  "data": {
    "departmentId": "dept-001",
    "departmentName": "看護部",
    "facilityId": "fac-001",
    "facilityName": "小原病院",
    "totalMembers": 30,
    "activeMembers": 25,
    "members": [
      {
        "employeeId": "OH-NS-2024-001",
        "name": "山田太郎",
        "position": "看護師長",
        "permissionLevel": 8,
        "isActive": true,
        "hireDate": "2020-04-01",
        "isRetired": false
      },
      {
        "employeeId": "OH-NS-2024-002",
        "name": "佐藤花子",
        "position": "看護師",
        "permissionLevel": 5,
        "isActive": true,
        "hireDate": "2021-04-01",
        "isRetired": false
      }
      // ... 他のメンバー
    ]
  }
}
```

**必要な理由**:
- 動的閾値計算（メンバー数比率方式）
- 部署分析画面での統計表示
- アクティブメンバー数の把握

**使用箇所**:
- AgendaLevelThresholdService.ts (閾値計算)
- DepartmentPostingAnalytics.tsx (部署分析)

**実装工数**: 3日

---

## 📡 必要なWebhook（医療システム → VoiceDrive）

### Webhook-PT-M-1: 組織改編通知

**優先度**: 🟡 中（Phase 3: 動的閾値機能で使用）

**目的**: 部署統合・分割・人数変動時に動的閾値を再計算

**エンドポイント（VoiceDrive側）**: `POST https://voicedrive.ai/api/webhooks/organization-changed`

**Request Headers**:
```
Content-Type: application/json
X-Webhook-Signature: <HMAC-SHA256署名>
X-Event-Type: organization.changed
X-Event-ID: evt-2025-1009-001
X-Timestamp: 2025-10-09T10:00:00Z
```

**Request Body**:
```json
{
  "eventType": "organization.changed",
  "eventId": "evt-2025-1009-001",
  "timestamp": "2025-10-09T10:00:00Z",
  "data": {
    "changeType": "department_merge", // department_merge | department_split | member_transfer | department_rename
    "affectedDepartments": [
      {
        "departmentId": "dept-001",
        "departmentName": "看護部（旧）",
        "action": "merged_into", // merged_into | split_from | renamed | member_count_changed
        "newDepartmentId": "dept-new-001",
        "newDepartmentName": "統合看護部",
        "oldMemberCount": 30,
        "newMemberCount": 55,
        "effectiveDate": "2025-10-01"
      },
      {
        "departmentId": "dept-002",
        "departmentName": "外来看護部（旧）",
        "action": "merged_into",
        "newDepartmentId": "dept-new-001",
        "newDepartmentName": "統合看護部",
        "oldMemberCount": 25,
        "newMemberCount": 55,
        "effectiveDate": "2025-10-01"
      }
    ],
    "reason": "組織再編により看護部と外来看護部を統合",
    "administratorId": "ADMIN-001",
    "administratorName": "人事部長"
  }
}
```

**VoiceDrive側レスポンス（成功）**:
```json
{
  "success": true,
  "receivedAt": "2025-10-09T10:00:05Z",
  "processedEventId": "evt-2025-1009-001",
  "actions": [
    {
      "action": "threshold_recalculated",
      "departmentId": "dept-new-001",
      "oldThreshold": {
        "DEPT_REVIEW": 30,
        "DEPT_AGENDA": 50
      },
      "newThreshold": {
        "DEPT_REVIEW": 40,
        "DEPT_AGENDA": 68
      }
    },
    {
      "action": "agenda_level_reevaluated",
      "affectedPosts": 23,
      "levelChanges": [
        {
          "postId": "post-001",
          "oldLevel": "DEPT_AGENDA",
          "newLevel": "DEPT_REVIEW",
          "reason": "閾値変更により降格"
        }
      ]
    },
    {
      "action": "notifications_sent",
      "notificationCount": 23,
      "recipients": ["affected_post_authors"]
    }
  ]
}
```

**VoiceDrive側レスポンス（エラー）**:
```json
{
  "success": false,
  "receivedAt": "2025-10-09T10:00:05Z",
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Webhook署名が無効です。"
  }
}
```

**VoiceDrive側の処理フロー**:
```
Webhook受信
  ↓
署名検証（HMAC-SHA256）
  ↓
イベントID重複チェック（既に処理済みか）
  ↓
部署メンバー数を再取得（API-PT-M-2を呼び出し）
  ↓
動的閾値を再計算
  ↓
既存投稿の議題レベルを再判定
  ↓ (レベル変動があった場合)
AgendaLevelHistory に記録
  ↓
投稿者に通知（「組織改編により議題レベルが変更されました」）
  ↓
レスポンス返却
```

**セキュリティ要件**:
- HMAC-SHA256署名検証（共通シークレットキー使用）
- イベントID重複チェック（冪等性保証）
- タイムスタンプ検証（5分以内のリクエストのみ受理）

**必要な理由**:
- 組織改編時の動的閾値自動調整
- 既存投稿の議題レベル再評価
- 職員への透明性確保（通知）

**実装工数**: 5日（VoiceDrive側受信処理含む）

---

## 📅 実装スケジュール

### Phase 1: 個人追跡基本機能（2025年11月11日-11月18日）

**VoiceDrive側作業**:
- Post モデル拡張
- AgendaLevelHistory テーブル作成
- PostActivityEvent テーブル作成
- 個人追跡API実装（8種類）
- フロントエンド実装

**医療システム側要求**:
- ✅ **API-PT-M-1**: 職員情報取得API（必須）
  - 実装期限: **2025年11月15日**
  - 理由: 投稿者情報表示に必須

**Phase 1スケジュール**:
```
11/11 (月) - VoiceDrive: DB設計・マイグレーション
11/12 (火) - VoiceDrive: API実装開始
11/13 (水) - 医療システム: API-PT-M-1 実装開始
11/14 (木) - 医療システム: API-PT-M-1 テスト
11/15 (金) - 医療システム: API-PT-M-1 デプロイ ⭐
11/16 (土) - VoiceDrive: 結合テスト
11/17 (日) - VoiceDrive: フロントエンド実装
11/18 (月) - VoiceDrive: Phase 1完了
```

### Phase 2: 議題レベル自動昇格（2025年11月19日-11月25日）

**VoiceDrive側作業**:
- 投票受付時の自動スコア再計算
- 議題レベル自動昇格判定
- リアルタイム通知（WebSocket）

**医療システム側要求**:
- ❌ **なし**（VoiceDrive完結）

### Phase 3: 動的閾値・組織改編対応（2025年12月以降）

**VoiceDrive側作業**:
- AgendaLevelThreshold テーブル作成
- 動的閾値計算ロジック
- 組織改編Webhook受信処理
- 管理画面実装

**医療システム側要求**:
- ✅ **API-PT-M-2**: 部署メンバー一覧取得API
  - 実装期限: **2025年12月6日**
- ✅ **Webhook-PT-M-1**: 組織改編通知
  - 実装期限: **2025年12月13日**

**Phase 3スケジュール**:
```
12/2 (月) - VoiceDrive: 閾値テーブル設計
12/3 (火) - 医療システム: API-PT-M-2 実装開始
12/4 (水) - 医療システム: API-PT-M-2 テスト
12/5 (木) - 医療システム: API-PT-M-2 デプロイ
12/6 (金) - VoiceDrive: API-PT-M-2 結合テスト ⭐
12/9 (月) - 医療システム: Webhook-PT-M-1 実装開始
12/10 (火) - 医療システム: Webhook-PT-M-1 テスト
12/11 (水) - 医療システム: Webhook-PT-M-1 デプロイ
12/12 (木) - VoiceDrive: Webhook受信処理実装
12/13 (金) - VoiceDrive: Webhook結合テスト ⭐
12/16 (月) - VoiceDrive: 管理画面実装
12/17 (火) - VoiceDrive: Phase 3完了
```

---

## 💰 コスト見積

### 内訳

| API/Webhook | 実装工数 | テスト工数 | 合計工数 | 単価 | 金額 |
|------------|---------|----------|---------|------|------|
| API-PT-M-1: 職員情報取得 | 1.5日 | 0.5日 | 2日 | ¥80,000 | ¥160,000 |
| API-PT-M-2: 部署メンバー一覧 | 2日 | 1日 | 3日 | ¥80,000 | ¥240,000 |
| Webhook-PT-M-1: 組織改編通知 | 3日 | 2日 | 5日 | ¥80,000 | ¥400,000 |
| 結合テスト（VoiceDrive側） | - | 2日 | 2日 | ¥80,000 | ¥160,000 |
| **合計** | **6.5日** | **5.5日** | **12日** | - | **¥960,000** |

### Phase別コスト

| Phase | API/Webhook | 金額 |
|-------|------------|------|
| Phase 1 | API-PT-M-1 | ¥160,000 |
| Phase 3 | API-PT-M-2 + Webhook-PT-M-1 | ¥640,000 |
| 結合テスト | - | ¥160,000 |
| **合計** | - | **¥960,000** |

---

## ✅ 成功基準

### Phase 1 成功基準

1. ✅ API-PT-M-1が正常に動作し、職員情報が取得できる
2. ✅ IdeaVoiceTracking画面で投稿者名・部署・アバターが表示される
3. ✅ 1秒以内にレスポンスが返る（パフォーマンス）
4. ✅ エラーハンドリングが適切（職員が見つからない場合など）

### Phase 3 成功基準

1. ✅ API-PT-M-2が部署メンバー数を正確に返す
2. ✅ 動的閾値が正しく計算される（10人部署は17点、30人部署は30点）
3. ✅ Webhook-PT-M-1を受信し、閾値が自動再計算される
4. ✅ 組織改編により議題レベルが変動した投稿の作成者に通知が届く
5. ✅ 冪等性が保証される（同じイベントIDのWebhookを2回受信しても1回だけ処理）

---

## ❓ 医療システムチームへの確認事項

### 1. API-PT-M-1（職員情報取得API）について

**Q1-1**: 既存の職員情報取得APIは存在しますか？
- ✅ Yes → エンドポイントとレスポンス形式を教えてください
- ❌ No → 新規実装をお願いします

**Q1-2**: アバター画像のURLは提供可能ですか？
- ✅ Yes → 画像サーバーのドメインを教えてください
- ❌ No → アバター表示は後回しにします

**Q1-3**: 11月15日までの実装は可能ですか？
- ✅ Yes → Phase 1スケジュール通り進行
- ❌ No → Phase 1を延期します

### 2. API-PT-M-2（部署メンバー一覧API）について

**Q2-1**: 既存の部署メンバー一覧APIは存在しますか？
- ✅ Yes → エンドポイントとレスポンス形式を教えてください
- ❌ No → 新規実装をお願いします

**Q2-2**: アクティブメンバー判定（過去30日間の活動）は医療システム側で行えますか？
- ✅ Yes → Query Parameter `activeOnly=true` で実装
- ❌ No → VoiceDrive側で全メンバーを取得し、活動履歴を照合します

**Q2-3**: 12月6日までの実装は可能ですか？
- ✅ Yes → Phase 3スケジュール通り進行
- ❌ No → Phase 3を延期します

### 3. Webhook-PT-M-1（組織改編通知）について

**Q3-1**: 組織改編時にリアルタイムWebhook通知は可能ですか？
- ✅ Yes → 実装をお願いします
- ❌ No → VoiceDrive側で定期的にAPI-PT-M-2をポーリングします

**Q3-2**: Webhook署名検証はHMAC-SHA256で問題ありませんか？
- ✅ Yes → 共通シークレットキーを共有してください
- ❌ No → 別の署名方式を提案してください

**Q3-3**: 組織改編の種類（部署統合・分割・人数変動）を全て通知できますか？
- ✅ Yes → Request Bodyの `changeType` で区別
- ❌ No → 通知可能な変更タイプを教えてください

**Q3-4**: 12月13日までの実装は可能ですか？
- ✅ Yes → Phase 3スケジュール通り進行
- ❌ No → Phase 3を延期します

### 4. コストについて

**Q4-1**: 概算¥960,000（12日間）のコストは承認可能ですか？
- ✅ Yes → 正式な見積書を提出してください
- ❌ No → 優先順位を下げ、Phase 3を先送りします

**Q4-2**: Phase 1（¥160,000）のみ先行実装は可能ですか？
- ✅ Yes → Phase 1を先行実装し、Phase 3は後日判断
- ❌ No → 全Phase同時実装が必要

### 5. その他

**Q5-1**: VoiceDrive側のWebhook受信エンドポイントはHTTPSですか？
- ✅ Yes → https://voicedrive.ai/api/webhooks/organization-changed
- ❌ No → HTTP通信を許可してください（非推奨）

**Q5-2**: APIレート制限はありますか？
- ✅ Yes → 制限値を教えてください（例: 1000リクエスト/分）
- ❌ No → 制限なし

**Q5-3**: APIメンテナンス時間帯はありますか？
- ✅ Yes → メンテナンス時間帯を教えてください
- ❌ No → 24時間365日稼働

---

## 📝 次のステップ

### 医療システムチームへのお願い

1. **本ドキュメントのレビュー**
   - 上記の確認事項（Q1-1 ~ Q5-3）への回答をお願いします

2. **Phase 1実装の承認**
   - API-PT-M-1の実装可否と期限（11月15日）の確認をお願いします

3. **コスト承認**
   - Phase 1（¥160,000）の予算承認をお願いします

4. **技術仕様の詳細確認**
   - 既存APIがある場合、OpenAPI仕様書を共有してください
   - Webhook署名検証の共通シークレットキーを共有してください

### VoiceDriveチームの対応

1. **Phase 1先行実装**
   - 医療システム側のAPI-PT-M-1完成を待たず、モックAPIで先行実装
   - 11月15日にAPI-PT-M-1が完成次第、結合テスト実施

2. **Phase 3詳細設計**
   - 動的閾値計算ロジックの詳細設計書を作成
   - 組織改編Webhook受信処理の詳細設計書を作成

3. **結合テスト計画書作成**
   - API-PT-M-1結合テスト計画書（11月16日実施予定）
   - API-PT-M-2結合テスト計画書（12月6日実施予定）
   - Webhook-PT-M-1結合テスト計画書（12月13日実施予定）

---

## 📞 連絡先

**VoiceDriveチーム**:
- プロジェクトリード: [担当者名]
- 技術担当: [担当者名]
- Slack: #voicedrive-post-tracking
- メール: voicedrive-dev@example.com

**医療職員管理システムチーム**:
- プロジェクトリード: [担当者名]
- 技術担当: [担当者名]
- Slack: #medical-system-api
- メール: medical-system-dev@example.com

---

**文書終了**
