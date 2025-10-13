# InterviewBookingPage VoiceDriveチーム回答書

**文書番号**: VD-RESPONSE-2025-1013-003
**作成日**: 2025年10月13日
**作成者**: VoiceDriveチーム
**宛先**: 医療システムチーム
**件名**: InterviewBookingPage 確認事項への回答

---

## 📌 エグゼクティブサマリー

医療システムチームからの確認結果書（MEDICAL-RESPONSE-2025-1013-003）を受領しました。**全面的な協力承認**に心より感謝申し上げます。

本文書では、医療システムチームから提示された3つの確認事項に対する回答を記載します。

---

## ✅ 確認事項への回答

### 6.1 API-5のレスポンス仕様

**質問**: API-5のレスポンスに含める`phoneNumber`について、以下のどちらを返すべきか？

**VoiceDriveチームの回答**: ✅ **選択肢C（両方を返す）を希望します**

**理由**:
1. **緊急連絡時の柔軟性**: 面談キャンセルや変更時に、職員への緊急連絡が必要になる場合があります
2. **勤務時間帯の考慮**:
   - 勤務中 → 内線番号（院内PHS）で連絡
   - 勤務外 → 個人携帯電話で連絡
3. **職員の選択肢**: 職員が予約申請時にどちらの連絡先を優先するか選択できるようにしたい

**提案するレスポンス仕様**:
```json
{
  "employeeId": "EMP-2024-001",
  "employeeName": "山田太郎",
  "email": "yamada.taro@obara-hospital.jp",
  "phoneNumber": "090-1234-5678",           // 個人携帯電話
  "internalPhoneNumber": "内線2200",         // 院内PHS・内線
  "preferredContactMethod": "internal",      // "internal" or "mobile" or "email"
  "facilityId": "obara-hospital",
  "departmentId": "nursing-dept-01",
  "positionId": "staff-nurse"
}
```

**追加フィールドの説明**:
- `phoneNumber`: 個人携帯電話番号（任意、登録されていない場合はnull）
- `internalPhoneNumber`: 院内PHS・内線番号（必須）
- `preferredContactMethod`: 優先連絡方法（職員が設定、デフォルト: "internal"）

**代替案**: 両方の実装が困難な場合は、`internalPhoneNumber`のみでも構いません。

---

### 6.2 Webhook認証方式

**質問**: VoiceDriveから医療システムへのWebhook通知（API-6, API-8, API-9）の認証方式

**VoiceDriveチームの回答**: ✅ **選択肢A（Bearer Token認証）を希望します**

**理由**:
1. **既存システムとの統一**: Phase 3～19のWebhookと認証方式を統一することで、実装・保守コストを削減
2. **実装の容易性**: 既存のJWT認証インフラを再利用可能
3. **セキュリティの一貫性**: 全システムで同じ認証方式を使用することで、セキュリティ監査が容易

**実装仕様**:
```http
POST /api/medical/interviews/notify-reservation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventType": "interview.reservation_created",
  "timestamp": "2025-10-13T14:30:00Z",
  "data": { ... }
}
```

**JWT Payload**:
```json
{
  "iss": "voicedrive-system",
  "sub": "webhook-service",
  "aud": "medical-system",
  "exp": 1728835800,
  "iat": 1728832200,
  "jti": "webhook_abc123"
}
```

**確認事項**:
- JWT署名アルゴリズム: HS256（既存と同じ）
- Token有効期限: 1時間
- Token発行: VoiceDrive側のWebhookサービス
- Token検証: 医療システム側

---

### 6.3 面談データの参照権限

**質問**: VoiceDrive側で予約された面談データを、医療システム側の既存の面談記録システムと統合するか？

**VoiceDriveチームの回答**: ✅ **選択肢A（統合する）を希望します**

**理由**:
1. **シングルソースオブトゥルース**: 面談記録を1箇所で管理することで、データの整合性を保つ
2. **人財統括本部の利便性**: 人財統括本部が医療システムの面談記録画面で全ての面談データを一元管理できる
3. **レポート・分析の容易性**: 予約データと実施記録を統合することで、面談実施率等の分析が容易

**提案する統合方式**:

#### 方式1: データフィードバック（推奨）

VoiceDriveから医療システムへ、予約データを定期的に送信：

```mermaid
sequenceDiagram
    participant VD as VoiceDrive
    participant MS as 医療システム

    Note over VD: 職員が予約申請
    VD->>VD: Interview.create(status: pending)
    VD->>MS: Webhook: interview.reservation_created
    MS->>MS: InterviewBooking.create()

    Note over MS: 人財統括本部が確定
    MS->>MS: InterviewBooking.confirm()
    MS->>VD: Webhook: interview.reservation_confirmed
    VD->>VD: Interview.update(status: confirmed)

    Note over MS: 面談実施・記録作成
    MS->>MS: Interview.create(実施記録)
    MS->>MS: InterviewBooking.link(interviewId)

    Note over MS: 医療システム画面で統合表示
    MS->>MS: 予約データ + 実施記録を統合表示
```

**実装内容**:
- VoiceDrive → 医療システム: Webhook（API-6, API-7, API-8, API-9, API-10）
- 医療システム: `InterviewBooking`テーブルで予約データを管理
- 医療システム: `Interview`テーブル（実施記録）と`InterviewBooking`テーブルをリレーション
- 医療システム画面: 予約データと実施記録を統合表示

**統合表示イメージ**:

医療システムの面談記録画面:
```
┌─────────────────────────────────────────────────────┐
│ 面談記録一覧                                          │
├─────────────────────────────────────────────────────┤
│ ID    │ 職員名   │ 予約日時        │ ステータス │ ソース │
├─────────────────────────────────────────────────────┤
│ INT-001 │ 山田花子 │ 2025-10-20 14:20 │ 予約確定   │ VD   │
│ INT-002 │ 佐藤太郎 │ 2025-10-21 15:00 │ 実施完了   │ MS   │
│ INT-003 │ 鈴木一郎 │ 2025-10-22 13:40 │ 予約申請中 │ VD   │
└─────────────────────────────────────────────────────┘
```

**データ管理責任**:
- **予約データ（VoiceDrive管理）**: 予約ID、予約日時、予約ステータス、時間枠情報
- **実施記録（医療システム管理）**: 面談内容、AI分析結果、NotebookLMリンク、フォローアップ

**代替案**: 統合が困難な場合は、選択肢B（分離管理）でも構いません。

---

## 📊 実装影響の整理

### 医療システム側の実装影響

| 項目 | 影響範囲 | 推定工数 |
|------|---------|---------|
| **API-5実装** | 新規エンドポイント追加 | 1～2時間 |
| **API-5フィールド追加** | `phoneNumber`, `internalPhoneNumber`, `preferredContactMethod` | +30分 |
| **Webhook受信（API-6, API-8, API-9）** | 既存機構で対応 | 2～3時間 |
| **InterviewBookingテーブル追加** | 新規テーブル（選択肢A採用時） | 3～4時間 |
| **面談記録画面統合表示** | 既存画面修正（選択肢A採用時） | 4～6時間 |

**合計工数**: 10.5～15.5時間（選択肢A採用時）

---

### VoiceDrive側の実装影響

| 項目 | 影響範囲 | 推定工数 |
|------|---------|---------|
| **Interviewテーブル拡張** | +20フィールド追加 | 4時間 |
| **新規3テーブル追加** | Interviewer, TimeSlot, InterviewScheduleConfig | 6時間 |
| **API-5呼び出し実装** | 職員連絡先取得ロジック | 2時間 |
| **Webhook送信実装** | API-6, API-8, API-9 | 8時間 |
| **JWT認証実装** | Bearer Token生成・送信 | 2時間 |
| **予約画面実装** | フロントエンド | 16時間 |
| **キャンセル・変更機能** | フロントエンド + バックエンド | 12時間 |

**合計工数**: 50時間（約6.25日）

---

## 📅 更新後のスケジュール

### Phase 1: 基本予約機能（2025-11-14 ～ 2025-11-27）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-11-14 | 医療システム | API-5実装完了・デプロイ |
| 2025-11-14～15 | VoiceDrive | Interviewテーブル拡張、新規3テーブル追加 |
| 2025-11-16～18 | VoiceDrive | API-5呼び出し、JWT認証実装 |
| 2025-11-19～22 | VoiceDrive | 予約画面実装 |
| 2025-11-19～21 | 医療システム | Webhook受信エンドポイント実装 |
| 2025-11-23～26 | VoiceDrive | Webhook送信実装、統合テスト準備 |
| 2025-11-27 | 両チーム | Phase 1統合テスト |

### Phase 2: キャンセル・日程変更機能（2025-11-28 ～ 2025-12-04）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-11-28～12-01 | VoiceDrive | キャンセル機能実装 |
| 2025-12-02～04 | VoiceDrive | 日程変更機能実装 |
| 2025-12-04 | 両チーム | Phase 2統合テスト |

### Phase 3: 管理者機能（2025-12-05 ～ 2025-12-11）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-12-05～08 | VoiceDrive | 管理者画面実装 |
| 2025-12-09～10 | 医療システム | 統合表示機能実装（選択肢A採用時） |
| 2025-12-11 | 両チーム | Phase 3統合テスト |

---

## 🧪 テスト計画

### 統合テスト項目

| テストケース | テスト内容 | 担当 |
|-------------|-----------|------|
| **TC-1: API-5呼び出し** | 職員連絡先取得（両方のphoneNumber含む） | VoiceDrive |
| **TC-2: JWT認証** | Bearer Token生成・検証 | 両チーム |
| **TC-3: 予約Webhook送信** | API-6送信、医療システム受信確認 | 両チーム |
| **TC-4: 予約確定Webhook受信** | API-7受信、VoiceDrive側更新確認 | 両チーム |
| **TC-5: キャンセルWebhook送信** | API-8送信、医療システム受信確認 | 両チーム |
| **TC-6: 変更リクエストWebhook** | API-9送信、医療システム受信確認 | 両チーム |
| **TC-7: 変更承認Webhook受信** | API-10受信、VoiceDrive側更新確認 | 両チーム |
| **TC-8: 統合表示確認** | 医療システム画面でVD予約データ表示 | 医療システム |

---

## 📝 次のアクション

### VoiceDriveチーム

- [x] **2025-10-13**: 確認事項への回答書作成完了
- [ ] **2025-10-14**: 医療システムチームへ回答書送付
- [ ] **2025-10-20**: 医療システムチームからの最終確認待ち
- [ ] **2025-11-01**: Phase 1開発準備開始
- [ ] **2025-11-14**: Phase 1開発開始

### 医療システムチーム（依頼事項）

- [ ] **2025-10-14**: 回答書確認
- [ ] **2025-10-20**: 最終仕様確定
- [ ] **2025-11-01**: API-5実装開始
- [ ] **2025-11-14**: API-5デプロイ完了
- [ ] **2025-11-19**: Webhook受信エンドポイント実装開始

---

## 🔗 関連ドキュメント

- **MEDICAL-RESPONSE-2025-1013-003**: InterviewBookingPage 医療システム確認結果書
- **VD-MASTER-2025-1013-002**: InterviewBookingPage 暫定マスターリスト
- **VD-DB-ANALYSIS-2025-1013-002**: InterviewBookingPage DB要件分析

---

## 📞 連絡先

**VoiceDriveチーム**:
- プロジェクトリーダー: [担当者名]
- 技術担当: [担当者名]
- Email: voicedrive-team@example.com
- Slack: #voicedrive-integration

---

## ✅ 承認

**VoiceDriveチーム**: ✅ 承認済み
**承認日**: 2025年10月13日
**次回更新予定**: 医療システムチームからの最終確認受領後（2025-10-20予定）

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
ステータス: 医療システムチーム確認待ち
