# InterviewBookingPage 方針決定のお知らせ

**宛先**: 医療職員管理システム開発チーム
**発信**: VoiceDrive開発チーム
**日付**: 2025年10月13日
**件名**: InterviewBookingPage存続決定とDB構築方針のご連絡

---

## 📋 通知内容

DB構築前の設計見直しを実施した結果、**InterviewBookingPageは削除せず、DB構築を進める**ことに決定いたしました。

---

## 🎯 決定理由

### 1. InterviewStationとの機能分担が明確

| ページ | 役割 | データフロー |
|-------|------|------------|
| **InterviewBookingPage** | 面談**予約申請・管理** | VoiceDrive主導 |
| **InterviewStation** | 面談**結果閲覧** | 医療システムから受信 |

**両ページは補完関係**にあり、どちらも必要です。

### 2. データ管理責任が明確

- **VoiceDrive（マスタ）**: 面談予約・スケジューリング
- **医療システム（マスタ）**: 面談実施記録・AI分析結果
- **連携方式**: Webhook双方向連携

### 3. 既に詳細な設計完了

以下のドキュメントで詳細設計が完了しています：
- `InterviewBookingPage_DB要件分析_20251013.md`
- `InterviewBookingPage暫定マスターリスト_20251013.md`

---

## 🔧 実装計画

### Phase 1: 基本予約機能（2025-11-14 ~ 2025-11-27）

**VoiceDrive側**:
1. Interviewテーブル拡張（20フィールド追加）
2. Interviewer, TimeSlot, InterviewScheduleConfigテーブル新規作成
3. API-6実装（予約通知送信: VD→MS）
4. API-7受信実装（予約確定通知: MS→VD）

**医療システム側（依頼事項）**:
1. ✅ **API-5**: 職員連絡先取得API実装
   - エンドポイント: `GET /api/employees/{employeeId}/contact`
   - レスポンス: employeeId, name, email, **phone**, facility, department, position

2. ✅ **API-7**: 面談予約確定Webhook送信実装
   - エンドポイント: `POST /api/webhooks/interview-reservation-confirmed`
   - タイミング: 人財統括本部が予約確定時

### Phase 2: キャンセル・変更機能（2025-11-28 ~ 2025-12-04）

**VoiceDrive側**:
1. API-8実装（キャンセル通知送信）
2. API-9実装（変更リクエスト通知送信）
3. API-10受信実装（変更承認通知）

**医療システム側（依頼事項）**:
1. ✅ **API-8**: キャンセル通知受信処理
2. ✅ **API-9**: 変更リクエスト受信処理
3. ✅ **API-10**: 変更承認Webhook送信実装

### Phase 3: 管理機能・統計（2025-12-05 ~ 2025-12-11）

VoiceDrive側のみで完結（医療システム側の作業なし）

---

## 📊 必要なAPI一覧

### 医療システムが提供すべきAPI

| API | エンドポイント | タイミング | 優先度 | 実装予定 |
|-----|-------------|----------|-------|---------|
| API-5 | GET /api/employees/{id}/contact | 予約申請時 | 🔴 最高 | Phase 1 |
| API-7 | POST /webhooks/interview-reservation-confirmed | 予約確定時 | 🔴 最高 | Phase 1 |
| API-8 | POST /medical/interviews/notify-cancellation | キャンセル時 | 🟡 高 | Phase 2 |
| API-9 | POST /medical/interviews/notify-reschedule-request | 変更申請時 | 🟡 高 | Phase 2 |
| API-10 | POST /webhooks/interview-reschedule-approved | 変更承認時 | 🟡 高 | Phase 2 |

### VoiceDriveが提供するAPI

| API | エンドポイント | タイミング | Phase |
|-----|-------------|----------|-------|
| API-6 | POST /medical/interviews/notify-reservation | 予約申請時 | Phase 1 |

**詳細仕様**: `InterviewBookingPage_DB要件分析_20251013.md` を参照

---

## ⚠️ 既知の問題と対応

### PermissionLevel表記の不統一（修正完了）

**問題**:
- デモデータ生成で数値直接指定（7, 6等）が使用されていた

**対応**:
- ✅ 修正完了（2025-10-13）
- `PermissionLevel.LEVEL_7`, `PermissionLevel.LEVEL_6` 形式に統一

**影響**: なし（デモ環境のみの問題）

---

## 🤝 ご協力のお願い

### Phase 1開始前（2025-11-14まで）

1. **API-5の実装着手**
   - 職員連絡先取得API（特に**phone**フィールドの追加）

2. **API-7の実装着手**
   - 予約確定Webhook送信機能

3. **API仕様の最終確認**
   - `InterviewBookingPage_DB要件分析_20251013.md` のAPI仕様をレビュー
   - 不明点・変更要望があればご連絡ください

### Phase 2開始前（2025-11-28まで）

1. **API-8, 9, 10の実装着手**
   - キャンセル・変更関連のWebhook処理

---

## 📞 お問い合わせ

ご質問や懸念事項がございましたら、お気軽にお問い合わせください。

**VoiceDriveチーム**
- Slack: #voicedrive-integration
- 担当: システム開発チーム

---

今後とも、VoiceDriveと医療職員管理システムの円滑な統合運営のため、引き続きよろしくお願いいたします。

---

**VoiceDrive開発チーム**
2025年10月13日
