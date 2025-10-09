# InterviewStation 暫定マスターリスト

**文書番号**: IS-MASTER-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**宛先**: 医療職員管理システムチーム
**目的**: 面談ステーション機能実装のためのAPI要求・実装計画
**参照文書**:
- [InterviewStation_DB要件分析_20251009.md](./InterviewStation_DB要件分析_20251009.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 📋 エグゼクティブサマリー

### 概要

面談ステーション（InterviewStation）は、医療職員が**面談予約・管理・サマリ閲覧**を行う超重要ページです。

**VoiceDriveチームからの要求**:
- ✅ 医療システム側で**9つのAPI**を実装
- ✅ 医療システム側で**3つのWebhook**を実装
- ✅ データ管理責任分界点定義書に100%準拠

### データ管理責任の原則

| データ項目 | VoiceDrive | 医療システム | 連携方法 |
|-----------|-----------|-------------|---------|
| 面談予約リクエスト | ✅ 収集・送信 | 受信・確定 | API |
| おまかせ予約（AI調整） | UI提供のみ | ✅ AI処理・提案生成 | API + リアルタイム通知 |
| 面談実施記録 | キャッシュ | ✅ マスタ | Webhook |
| 面談サマリ（AI分析） | キャッシュ | ✅ NotebookLM生成 | Webhook |
| 面談タイプ定義 | ❌ | ✅ マスタ | API |
| リマインダー設定 | ✅ 計算・送信 | 雇用状況提供 | API |

**重要**: 面談の**実施記録・AI分析・サマリ**は100%医療システム管轄。VoiceDriveは予約UIと配信プラットフォームとして機能。

---

## 🔌 医療システムへのAPI要求リスト

### 必須API（Phase 1: 11月18日〜11月26日）

#### API-INT-1: 面談予約受付

**エンドポイント**: `POST /api/interviews/reservations`

**目的**: VoiceDriveからの即時予約を受け付ける

**優先度**: 🔴 最高

**リクエスト例**:
```json
{
  "staffId": "OH-NS-2024-001",
  "type": "support",
  "supportCategory": "career_support",
  "supportTopic": "career_path",
  "urgency": "medium",
  "preferredDates": ["2025-10-15", "2025-10-16"],
  "preferredTimeSlots": ["morning", "afternoon"],
  "notes": "キャリアパスについて相談したい",
  "source": "voicedrive",
  "timestamp": "2025-10-09T14:30:00Z"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "requestId": "REQ-2025-1009-001",
    "interviewId": "INT-2025-1009-001",
    "status": "pending",
    "estimatedConfirmation": "2025-10-09T18:00:00Z"
  }
}
```

**期待される処理**:
1. 空き時間確認
2. 面談者自動割り当て
3. Interview（実施記録）テーブルに保存
4. VoiceDriveにWebhook通知（Webhook-INT-1）

**見積工数**: 3日
**依存関係**: なし

---

#### API-INT-2: おまかせ予約申込受付

**エンドポイント**: `POST /api/interviews/assisted-booking`

**目的**: AI調整が必要な複雑な予約リクエストを受け付ける

**優先度**: 🔴 最高

**リクエスト例**:
```json
{
  "staffId": "OH-NS-2024-001",
  "requestType": "support",
  "topic": "キャリア相談",
  "details": "今後のキャリアパスについて悩んでいます",
  "category": "career_path",
  "urgencyLevel": "this_week",
  "preferredDates": ["2025-10-15", "2025-10-16", "2025-10-17"],
  "unavailableDates": ["2025-10-18"],
  "timePreference": {
    "morning": true,
    "afternoon": true,
    "evening": false,
    "anytime": false
  },
  "interviewerPreference": {
    "genderPreference": "no_preference",
    "specialtyPreference": "キャリア開発",
    "anyAvailable": false
  },
  "minDuration": 30,
  "maxDuration": 60,
  "additionalRequests": "できれば静かな場所でお願いします",
  "source": "voicedrive",
  "timestamp": "2025-10-09T14:30:00Z"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "requestId": "ABR-2025-1009-001",
    "estimatedCompletionTime": "1時間以内",
    "status": "accepted"
  }
}
```

**期待される処理**:
1. AI調整開始（最適な面談者選定）
2. 3つの提案パターン生成（ProposalPattern）
3. ステータス: `pending_review` → `proposals_ready`
4. VoiceDriveにリアルタイム通知（Webhook-INT-3）

**見積工数**: 5日（AI調整ロジック含む）
**依存関係**: NotebookLM API、面談者マスタ

---

#### API-INT-3: 調整中リクエスト取得

**エンドポイント**: `GET /api/interviews/pending-requests/{staffId}`

**目的**: 職員のおまかせ予約調整中リストを取得

**優先度**: 🔴 最高

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ABR-2025-1009-001",
      "status": "proposals_ready",
      "interviewType": "career_support",
      "urgencyLevel": "this_week",
      "createdAt": "2025-10-09T14:30:00Z",
      "updatedAt": "2025-10-09T15:45:00Z",
      "estimatedCompletion": "2025-10-09T16:00:00Z"
    }
  ]
}
```

**見積工数**: 1日
**依存関係**: API-INT-2

---

#### API-INT-4: 提案候補取得

**エンドポイント**: `GET /api/interviews/proposals/{requestId}`

**目的**: AI調整完了後の3つの提案候補を取得

**優先度**: 🔴 最高

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "requestId": "ABR-2025-1009-001",
    "proposals": [
      {
        "id": "PROP-001",
        "interviewer": {
          "id": "HR-001",
          "name": "山田 太郎",
          "title": "人事部 キャリア開発担当",
          "department": "人事部",
          "experience": "キャリア相談10年の経験"
        },
        "schedule": {
          "date": "2025-10-15",
          "time": "10:00-11:00",
          "duration": 60,
          "location": "人事部 面談室A",
          "format": "face_to_face"
        },
        "staffFriendlyDisplay": {
          "summary": "あなたの相談内容に詳しいキャリア開発専門担当者です",
          "highlights": [
            "キャリア相談専門",
            "10年の経験",
            "ご希望の時間に対応可能"
          ]
        },
        "aiReasoning": {
          "matchingScore": 0.95,
          "matchingFactors": [
            "専門分野一致",
            "時間帯適合",
            "経験豊富"
          ],
          "alternativeOptions": ["2025-10-16 14:00-15:00"],
          "notes": "最も適合度が高い候補です"
        }
      },
      {
        "id": "PROP-002",
        "interviewer": { /* ... */ },
        "schedule": { /* ... */ },
        "staffFriendlyDisplay": { /* ... */ }
      },
      {
        "id": "PROP-003",
        "interviewer": { /* ... */ },
        "schedule": { /* ... */ },
        "staffFriendlyDisplay": { /* ... */ }
      }
    ]
  }
}
```

**重要**: `staffFriendlyDisplay`は職員向けに簡素化された説明文。技術用語を使わず、自然な日本語で推薦理由を記載。

**見積工数**: 2日（簡素化ロジック含む）
**依存関係**: API-INT-2

---

#### API-INT-5: 提案候補選択確定

**エンドポイント**: `POST /api/interviews/confirm-choice`

**目的**: 職員が選択した提案候補を確定

**優先度**: 🔴 最高

**リクエスト例**:
```json
{
  "requestId": "ABR-2025-1009-001",
  "selectedProposalId": "PROP-001",
  "staffFeedback": "この時間が都合良いです",
  "confirmationSource": "staff_selection",
  "timestamp": "2025-10-09T16:00:00Z"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "interviewId": "INT-2025-1009-050",
    "bookingDate": "2025-10-15T10:00:00Z",
    "status": "confirmed"
  }
}
```

**期待される処理**:
1. 選択された提案を正式予約に確定
2. Interview（実施記録）テーブルに保存
3. VoiceDriveにWebhook通知（Webhook-INT-1）

**見積工数**: 2日
**依存関係**: API-INT-4

---

#### API-INT-6: おまかせ予約キャンセル

**エンドポイント**: `POST /api/interviews/cancel-assisted`

**目的**: おまかせ予約をキャンセル

**優先度**: 🟡 中

**リクエスト例**:
```json
{
  "requestId": "ABR-2025-1009-001",
  "reason": "急な業務が入ったため",
  "cancelledBy": "staff",
  "timestamp": "2025-10-09T17:00:00Z"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "message": "おまかせ予約をキャンセルしました"
}
```

**見積工数**: 1日
**依存関係**: API-INT-2

---

#### API-INT-7: 面談履歴取得

**エンドポイント**: `GET /api/interviews/history/{staffId}`

**目的**: 職員の面談履歴を取得（VoiceDriveのInterviewテーブルと同期）

**優先度**: 🟡 中

**クエリパラメータ**:
- `status`: confirmed, completed, cancelled
- `limit`: 取得件数（デフォルト: 50）
- `offset`: オフセット

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "interviewId": "INT-2025-1009-050",
      "requestId": "REQ-2025-1009-001",
      "interviewType": "career_support",
      "interviewCategory": "career_path",
      "bookingDate": "2025-10-15T10:00:00Z",
      "timeSlot": {
        "startTime": "10:00",
        "endTime": "11:00"
      },
      "interviewerId": "HR-001",
      "interviewerName": "山田 太郎",
      "status": "completed",
      "conductedAt": "2025-10-15T10:00:00Z",
      "duration": 55,
      "location": "人事部 面談室A",
      "format": "face_to_face"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

**見積工数**: 2日
**依存関係**: API-INT-1, API-INT-5

---

### オプションAPI（Phase 2: 12月2日〜12月10日）

#### API-INT-8: 雇用状況取得

**エンドポイント**: `GET /api/employees/{staffId}/employment-status`

**目的**: リマインダー機能のための雇用状況取得

**優先度**: 🟢 低（Phase 2）

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "employeeId": "OH-NS-2024-001",
    "employmentStatus": "regular_employee",
    "hireDate": "2020-04-01",
    "lastInterviewDate": "2025-09-15",
    "nextScheduledDate": null,
    "workPattern": "day_shift"
  }
}
```

**見積工数**: 1日
**依存関係**: Employee テーブル

---

#### API-INT-9: 面談タイプマスタ取得

**エンドポイント**: `GET /api/interviews/types`

**目的**: 面談タイプ・カテゴリのマスタデータ取得

**優先度**: 🟢 低（Phase 2）

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "interviewTypes": [
      {
        "id": "new_employee_monthly",
        "name": "新入職員月次面談",
        "classification": "regular",
        "requiresCategory": false,
        "mandatoryFor": ["new_employee"],
        "intervalDays": 30
      },
      {
        "id": "career_support",
        "name": "キャリア系面談",
        "classification": "support",
        "requiresCategory": true,
        "categories": [
          {
            "id": "career_path",
            "name": "キャリアパス"
          },
          {
            "id": "skill_development",
            "name": "スキル開発"
          }
        ]
      }
    ]
  }
}
```

**見積工数**: 2日
**依存関係**: InterviewTypeMaster テーブル

---

## 🔔 医療システムからのWebhook要求リスト

### 必須Webhook（Phase 1）

#### Webhook-INT-1: 面談予約確定通知

**エンドポイント**: `POST https://voicedrive.ai/api/webhooks/interview-booked`

**目的**: 面談予約が確定したことをVoiceDriveに通知

**優先度**: 🔴 最高

**送信タイミング**: 面談予約確定時（即時）

**リクエスト例**:
```json
{
  "eventType": "interview.booked",
  "timestamp": "2025-10-09T15:00:00Z",
  "data": {
    "interviewId": "INT-2025-1009-050",
    "requestId": "REQ-2025-1009-001",
    "staffId": "OH-NS-2024-001",
    "interviewType": "career_support",
    "interviewCategory": "career_path",
    "bookingDate": "2025-10-15T10:00:00Z",
    "timeSlot": {
      "startTime": "10:00",
      "endTime": "11:00"
    },
    "interviewerId": "HR-001",
    "interviewerName": "山田 太郎",
    "status": "confirmed"
  }
}
```

**VoiceDrive側の処理**:
1. Interview テーブルに保存
2. リアルタイム通知発火: `interviewConfirmed`
3. InterviewStation ダッシュボード更新

**セキュリティ**:
- HMAC-SHA256署名必須
- タイムスタンプ検証（±5分以内）

**見積工数**: 2日
**依存関係**: API-INT-1, API-INT-5

---

#### Webhook-INT-2: 面談サマリ配信

**エンドポイント**: `POST https://voicedrive.ai/api/webhooks/interview-result`

**目的**: 面談実施後のAI分析サマリをVoiceDriveに配信

**優先度**: 🔴 最高

**送信タイミング**: 面談実施後、NotebookLM分析完了時

**リクエスト例**:
```json
{
  "eventType": "interview.result_ready",
  "timestamp": "2025-10-15T11:30:00Z",
  "data": {
    "interviewId": "INT-2025-1009-050",
    "requestId": "REQ-2025-1009-001",
    "completedAt": "2025-10-15T11:00:00Z",
    "duration": 55,
    "summary": "キャリアパスについて詳細な相談を行いました。職員は現在の業務に充実感を感じつつも、将来的には管理職を目指したいという希望を持っています。",
    "keyPoints": [
      "現在の業務に満足しているが、キャリアアップを希望",
      "管理職に必要なスキルについて関心が高い",
      "3年以内のステップアップを目標としている"
    ],
    "actionItems": [
      {
        "description": "管理職向け研修プログラムの受講",
        "dueDate": "2025-11-01"
      },
      {
        "description": "OJTでのリーダーシップ経験",
        "dueDate": "2025-12-31"
      }
    ],
    "followUpRequired": true,
    "followUpDate": "2026-01-15",
    "feedbackToEmployee": "あなたの将来へのビジョンが明確で、素晴らしいと感じました。次回の面談では、実際の研修プログラムの進捗を確認しましょう。",
    "nextRecommendations": {
      "suggestedNextInterview": "career_support",
      "suggestedTopics": [
        "管理職研修の進捗確認",
        "リーダーシップスキルの振り返り"
      ]
    }
  }
}
```

**VoiceDrive側の処理**:
1. InterviewResult テーブルに保存
2. InterviewStation 履歴タブに「サマリ受信済み」バッジ表示

**セキュリティ**:
- HMAC-SHA256署名必須
- タイムスタンプ検証（±5分以内）

**見積工数**: 3日（NotebookLM連携含む）
**依存関係**: NotebookLM API、Interview実施記録

---

#### Webhook-INT-3: おまかせ予約進捗通知

**エンドポイント**: `POST https://voicedrive.ai/api/webhooks/assisted-booking-update`

**目的**: おまかせ予約の進捗をリアルタイム通知

**優先度**: 🔴 最高

**送信タイミング**: AI調整ステータス変更時（リアルタイム）

**リクエスト例**:
```json
{
  "eventType": "assisted_booking.status_changed",
  "timestamp": "2025-10-09T15:45:00Z",
  "data": {
    "requestId": "ABR-2025-1009-001",
    "staffId": "OH-NS-2024-001",
    "oldStatus": "pending_review",
    "newStatus": "proposals_ready",
    "message": "面談候補をご用意しました！"
  }
}
```

**VoiceDrive側の処理**:
1. AssistedBookingRequest テーブル更新
2. リアルタイム通知発火: `assistedBookingUpdate` / `proposalReady`
3. PendingBookingCard に「提案候補を見る」ボタン表示

**セキュリティ**:
- HMAC-SHA256署名必須
- タイムスタンプ検証（±5分以内）

**見積工数**: 2日（WebSocket/SSE実装含む）
**依存関係**: API-INT-2

---

## 📅 実装スケジュール提案

### Phase 1: 基本機能（11月18日〜11月26日）- 最優先

| タスク | 担当 | 工数 | 期日 |
|-------|------|------|------|
| **Week 1 (11/18-11/22)** | | | |
| API-INT-1: 面談予約受付 | 医療システム | 3日 | 11/20 |
| API-INT-2: おまかせ予約申込 | 医療システム | 5日 | 11/22 |
| Webhook-INT-1: 面談予約確定通知 | 医療システム | 2日 | 11/22 |
| VoiceDrive: Interview拡張 | VoiceDrive | 2日 | 11/20 |
| VoiceDrive: AssistedBookingRequest作成 | VoiceDrive | 2日 | 11/22 |
| **Week 2 (11/25-11/26)** | | | |
| API-INT-3: 調整中リクエスト取得 | 医療システム | 1日 | 11/25 |
| API-INT-4: 提案候補取得 | 医療システム | 2日 | 11/26 |
| API-INT-5: 提案候補選択確定 | 医療システム | 2日 | 11/26 |
| API-INT-6: おまかせ予約キャンセル | 医療システム | 1日 | 11/26 |
| API-INT-7: 面談履歴取得 | 医療システム | 2日 | 11/26 |
| Webhook-INT-2: 面談サマリ配信 | 医療システム | 3日 | 11/26 |
| Webhook-INT-3: おまかせ予約進捗通知 | 医療システム | 2日 | 11/26 |

**Phase 1 合計工数**:
- 医療システム: **23日**
- VoiceDrive: **4日**

### Phase 2: リマインダー機能（12月2日〜12月10日）

| タスク | 担当 | 工数 | 期日 |
|-------|------|------|------|
| API-INT-8: 雇用状況取得 | 医療システム | 1日 | 12/3 |
| API-INT-9: 面談タイプマスタ取得 | 医療システム | 2日 | 12/5 |
| VoiceDrive: InterviewReminder作成 | VoiceDrive | 3日 | 12/6 |
| VoiceDrive: リマインダー計算ロジック | VoiceDrive | 2日 | 12/10 |

**Phase 2 合計工数**:
- 医療システム: **3日**
- VoiceDrive: **5日**

---

## 💰 コスト見積もり

### 医療システム側の実装コスト

**Phase 1: 基本機能**
- API実装（7本）: 23日 × ¥80,000 = **¥1,840,000**
- Webhook実装（3本）: 含む
- 合計: **¥1,840,000**

**Phase 2: リマインダー機能**
- API実装（2本）: 3日 × ¥80,000 = **¥240,000**
- 合計: **¥240,000**

**総計**: **¥2,080,000**（26日分）

### VoiceDrive側の実装コスト

**Phase 1: 基本機能**
- DB拡張・テーブル作成: 4日
- Webhook受信処理: 含む
- 合計: 4日

**Phase 2: リマインダー機能**
- InterviewReminder実装: 5日
- 合計: 5日

**総計**: 9日分（自社リソース）

---

## ✅ 成功基準

### 機能要件

- ✅ 即時予約が医療システムに送信され、Webhook経由で確定通知を受信できる
- ✅ おまかせ予約が医療システムで調整され、3つの提案候補を受信・表示できる
- ✅ 面談実施後、AI分析サマリがWebhook経由で配信され、履歴タブに表示される
- ✅ リマインダーが雇用状況に応じて自動送信される

### 非機能要件

- ✅ データ管理責任分界点定義書に100%準拠
- ✅ Webhook受信時のHMAC署名検証
- ✅ リアルタイム通知の平均遅延時間 < 3秒
- ✅ API応答時間 < 500ms（95パーセンタイル）

---

## 📝 医療システムチームへの質問・確認事項

### 1. AI調整機能（おまかせ予約）について

- ❓ NotebookLM APIは既に利用可能ですか？
- ❓ 面談者マスタ（Interviewer）テーブルは実装済みですか？
- ❓ AI調整のマッチングロジックは医療システム側で実装可能ですか？
- ❓ 3つの提案パターン生成の所要時間はどのくらいを想定していますか？

### 2. 面談サマリ配信について

- ❓ NotebookLMでの面談分析は自動実行されますか？
- ❓ サマリ生成後、VoiceDriveへのWebhook送信は自動ですか？手動ですか？
- ❓ `feedbackToEmployee`（職員向けフィードバック）の生成ロジックは？

### 3. リアルタイム通知について

- ❓ WebSocket / Server-Sent Events のどちらを使用しますか？
- ❓ 通知基盤は医療システム側に既にありますか？

### 4. 実装スケジュールについて

- ❓ Phase 1（11/18-11/26）のスケジュールは実現可能ですか？
- ❓ リソース確保は問題ありませんか？
- ❓ 優先順位の調整が必要なAPIはありますか？

### 5. コストについて

- ❓ 見積コスト（¥2,080,000 / 26日）は承認可能ですか？
- ❓ Phase 2（リマインダー機能）は後回しにできますか？

---

## 🔗 関連ドキュメント

### VoiceDriveチームが作成済み

1. **InterviewStation_DB要件分析_20251009.md**
   - データ管理責任分界点の詳細
   - VoiceDrive側のDB設計
   - 全データフローの図解

2. **データ管理責任分界点定義書_20251008.md**
   - 医療システム ↔ VoiceDrive間のデータ管理責任
   - Single Source of Truth原則
   - API連携・Webhook仕様

3. **本文書（InterviewStation暫定マスターリスト）**
   - 医療システムへのAPI要求一覧
   - 実装スケジュール・コスト見積もり

### 医療システムチームへのお願い

上記3つのドキュメントを確認いただき、以下をご回答ください：

1. ✅ API要求（9本）は実装可能か
2. ✅ Webhook要求（3本）は実装可能か
3. ✅ 実装スケジュール（Phase 1: 11/18-11/26）は実現可能か
4. ✅ コスト見積もり（¥2,080,000）は承認可能か
5. ✅ 質問・確認事項への回答

**回答期限**: 2025年10月12日（金）17:00

---

## 📞 連絡先

**VoiceDriveチーム**:
- プロジェクトリード: [連絡先]
- 技術担当: [連絡先]
- Slack: #phase2-integration

**医療システムチーム**:
- [連絡先を記載]

---

**文書終了**

最終更新: 2025年10月9日
次回更新予定: 医療システムチームからの回答受領後（10/12予定）
