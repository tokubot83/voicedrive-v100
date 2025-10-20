# Phase 6 期限到達判断履歴機能 - 統合テスト計画書

**作成日**: 2025年10月20日
**作成元**: VoiceDriveチーム
**テスト対象**: 医療職員カルテシステム × VoiceDrive Phase 6連携
**テスト種別**: α版統合テスト
**スケジュール**: 2025年10月25日（金）実施予定

---

## 📋 目的

VoiceDriveの期限到達判断履歴機能と医療職員カルテシステムのPhase 1-5実装が正常に統合されることを確認する。

---

## 🎯 テスト範囲

### 統合対象コンポーネント

#### VoiceDrive側（完了済み）
- ✅ **バックエンドAPI** (`src/api/expiredEscalationDecision.ts`)
  - `recordExpiredEscalationDecision()` - 判断記録
  - `getExpiredEscalationHistory()` - 判断履歴取得
  - `getExpiredEscalationProposals()` - 判断待ち提案一覧

- ✅ **APIルート** (`src/routes/apiRoutes.ts`)
  - `GET /api/agenda/expired-escalation-proposals`
  - `POST /api/agenda/expired-escalation-decisions`
  - `GET /api/agenda/expired-escalation-history`

- ✅ **フロントエンドUI**
  - 期限到達判断モーダル ([ExpiredEscalationDecisionModal.tsx](src/components/agenda-mode/ExpiredEscalationDecisionModal.tsx))
  - 判断待ち提案一覧ページ ([ExpiredEscalationProposalsPage.tsx](src/pages/ExpiredEscalationProposalsPage.tsx))
  - 判断履歴ページ ([ExpiredEscalationHistoryPage.tsx](src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx))

#### 医療職員カルテシステム側（Phase 1-5完了済み）
- ✅ **データベーススキーマ** - `expired_escalation_decisions` テーブル
- ✅ **判断記録保存API** - POST `/api/expired-escalation/record`
- ✅ **判断履歴取得API** - GET `/api/expired-escalation/history`
- ✅ **権限フィルタリング** - LEVEL 1-99対応
- ✅ **統計計算機能** - サマリー統計生成

---

## 🧪 テストシナリオ

### テストシナリオ1: 判断履歴取得API連携

**目的**: VoiceDriveから医療システムの判断履歴を正常に取得できることを確認

#### 前提条件
- 医療システムに10件のテストデータが登録済み（`mcp-shared/test-data/expired-escalation-history.json`）
- VoiceDrive APIサーバーが起動中（http://localhost:3003）
- 医療システムAPIサーバーが起動中（http://localhost:3000）
- テストユーザーの権限レベルが設定済み（LEVEL 5以上）

#### テスト手順

**Step 1: APIエンドポイント疎通確認**
```bash
# VoiceDrive API健全性チェック
curl -X GET http://localhost:3003/health

# 期待レスポンス
{
  "status": "healthy",
  "timestamp": "2025-10-25T09:00:00.000Z",
  "service": "VoiceDrive API Server",
  "version": "1.0.0"
}
```

**Step 2: 判断履歴取得テスト（権限レベル5）**
```bash
# テストユーザー: 高橋美咲（LEVEL 5, 医療技術部）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?startDate=2025-09-01&endDate=2025-10-31&limit=50&offset=0" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL5" \
  -H "Content-Type: application/json"
```

**期待レスポンス**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "requestedAt": "2025-10-25T09:00:00.000Z",
      "totalCount": 1,
      "apiVersion": "1.0.0"
    },
    "summary": {
      "totalDecisions": 1,
      "approvalCount": 0,
      "downgradeCount": 1,
      "rejectCount": 0,
      "averageAchievementRate": 91.7,
      "averageDaysOverdue": 20
    },
    "decisions": [
      {
        "id": "cmgye7zi2000ds5d073bvcua5",
        "postId": "cmgyc6px5000ds55k94uhku4r",
        "postContent": "【テスト】法人全体の人材育成体系の統一...",
        "decision": "downgrade",
        "deciderName": "高橋美咲",
        "achievementRate": 91.7,
        "daysOverdue": 20
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 50,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

**検証項目**:
- ✅ HTTPステータスコード: 200
- ✅ `success: true`
- ✅ `metadata` オブジェクトが存在
- ✅ `summary` 統計が正しく計算されている
- ✅ `decisions` 配列に1件のみ（本人が判断した案件のみ）
- ✅ `pagination` オブジェクトが存在

---

**Step 3: 判断履歴取得テスト（権限レベル18）**
```bash
# テストユーザー: 山田太郎（LEVEL 18, 法人統括事務局長）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?startDate=2025-09-01&endDate=2025-10-31&limit=50&offset=0" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL18" \
  -H "Content-Type: application/json"
```

**期待レスポンス**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "requestedAt": "2025-10-25T09:00:00.000Z",
      "totalCount": 10,
      "apiVersion": "1.0.0"
    },
    "summary": {
      "totalDecisions": 10,
      "approvalCount": 6,
      "downgradeCount": 2,
      "rejectCount": 2,
      "averageAchievementRate": 65.0,
      "averageDaysOverdue": 11.9
    },
    "decisions": [
      // 全10件のデータ
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 10,
      "itemsPerPage": 50,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

**検証項目**:
- ✅ HTTPステータスコード: 200
- ✅ `decisions` 配列に全10件が含まれる（法人全体の権限）
- ✅ サマリー統計が全データから計算されている
  - 承認率: 60%（6件 / 10件）
  - 平均到達率: 65.0%
  - 平均期限超過日数: 11.9日

---

### テストシナリオ2: 判断記録API連携

**目的**: VoiceDriveから医療システムへ判断を記録できることを確認

#### テスト手順

**Step 1: 判断待ち提案一覧取得**
```bash
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-proposals?limit=10&offset=0" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL7" \
  -H "Content-Type: application/json"
```

**期待レスポンス**:
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "postId": "POST_TEST_001",
        "postContent": "【テスト】夜勤看護師の休憩時間確保について",
        "currentScore": 80,
        "targetScore": 100,
        "achievementRate": 80,
        "daysOverdue": 5,
        "agendaLevel": "escalated_to_dept"
      }
    ],
    "total": 1
  }
}
```

**Step 2: 判断を記録**
```bash
curl -X POST "http://localhost:3003/api/agenda/expired-escalation-decisions" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL7" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_TEST_001",
    "decision": "approve_at_current_level",
    "decisionReason": "到達率80%で、現在のレベルでの実施が適切と判断しました。職員の積極的な参加が見られ、十分な意義があると考えます。",
    "currentScore": 80,
    "targetScore": 100,
    "agendaLevel": "escalated_to_dept",
    "proposalType": "kaizen",
    "department": "看護部"
  }'
```

**期待レスポンス**:
```json
{
  "success": true,
  "data": {
    "decisionId": "NEW_DECISION_ID_001"
  }
}
```

**検証項目**:
- ✅ HTTPステータスコード: 200
- ✅ `success: true`
- ✅ `decisionId` が返却される
- ✅ 医療システムDB内にデータが保存されている
- ✅ 投稿のステータスが更新されている

---

### テストシナリオ3: 権限フィルタリング検証

**目的**: 権限レベルに応じたデータフィルタリングが正常に動作することを確認

#### テストケース

| 権限レベル | ユーザー | 期待される結果 |
|-----------|---------|---------------|
| LEVEL 1-4 | 一般職員 | 自分が提案した案件のみ表示 |
| LEVEL 5-6 | 主任クラス | 自分が判断した案件のみ表示 |
| LEVEL 7-8 | 師長・課長クラス | 所属部署全体の案件を表示 |
| LEVEL 9-13 | 部長〜院長クラス | 施設全体の案件を表示 |
| LEVEL 14-18 | 法人本部クラス | 法人全体の案件を表示 |
| LEVEL 99 | システム管理者 | 全データを表示 |

#### テスト手順

各権限レベルのテストユーザーでログインし、以下を確認：
```bash
# LEVEL 1: 一般職員
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL1"

# LEVEL 7: 副師長
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL7"

# LEVEL 14: 理事
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL14"
```

**検証項目**:
- ✅ 各権限レベルで適切な範囲のデータのみ取得できる
- ✅ 権限外のデータは一切含まれない
- ✅ `totalCount` が権限範囲内の件数と一致する

---

### テストシナリオ4: エラーハンドリング検証

**目的**: エラー時の適切なレスポンスを確認

#### テストケース

**Case 1: 認証エラー**
```bash
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Content-Type: application/json"
```

**期待レスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証情報が不正です"
  }
}
```

**Case 2: 必須パラメータ不足**
```bash
curl -X POST "http://localhost:3003/api/agenda/expired-escalation-decisions" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL7" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_TEST_001"
  }'
```

**期待レスポンス**:
```json
{
  "success": false,
  "error": "必須パラメータが不足しています"
}
```

**Case 3: 不正な判断タイプ**
```bash
curl -X POST "http://localhost:3003/api/agenda/expired-escalation-decisions" \
  -H "Authorization: Bearer TEST_TOKEN_LEVEL7" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_TEST_001",
    "decision": "invalid_decision_type",
    "decisionReason": "テスト理由"
  }'
```

**期待レスポンス**:
```json
{
  "success": false,
  "error": "不正な判断タイプです"
}
```

---

### テストシナリオ5: CORS設定検証

**目的**: 医療システムからVoiceDrive APIへのクロスオリジンリクエストが成功することを確認

#### テスト手順

**Step 1: Preflightリクエスト確認**
```bash
curl -X OPTIONS "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -v
```

**期待ヘッダー**:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

**Step 2: 実際のリクエスト確認**
```bash
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

**検証項目**:
- ✅ `Access-Control-Allow-Origin` ヘッダーが返却される
- ✅ `Access-Control-Allow-Credentials: true` が設定されている
- ✅ リクエストが正常に処理される（HTTPステータスコード: 200）

---

## 📊 テストデータ

### 使用するテストデータ
- **ファイル**: [mcp-shared/test-data/expired-escalation-history.json](mcp-shared/test-data/expired-escalation-history.json)
- **件数**: 10件
- **内容**:
  - 承認（approve_at_current_level）: 6件
  - ダウングレード（downgrade）: 2件
  - 不採用（reject）: 2件
  - 権限レベル: LEVEL 5, 8, 11, 15, 18
  - 部署: 看護部、医療技術部、総務部、法人本部
  - 到達率: 30% 〜 91.7%
  - 期限超過日数: 3日 〜 25日

### テストユーザー

| ユーザーID | 名前 | 権限レベル | 部署 | 用途 |
|----------|------|-----------|------|------|
| test-consent-user-001 | 田中太郎 | LEVEL 5 | 看護部 | 主任クラス権限テスト |
| test-consent-user-002 | 佐藤花子 | LEVEL 8 | 看護部 | 師長クラス権限テスト |
| test-affairs-1 | 事務長テスト | LEVEL 11 | 総務部 | 事務長クラス権限テスト |
| cmfs8u4i50002s5qsisvztx4f | 佐藤 花子 | LEVEL 15 | 人事総務部 | 法人本部クラス権限テスト |
| cmfs8u4hx0000s5qs2dv42m45 | 山田 太郎 | LEVEL 18 | 経営戦略室 | 法人統括クラス権限テスト |

---

## ✅ 合格基準

### 機能要件
- [ ] **判断履歴取得API**: 正常にデータを取得できる
- [ ] **判断記録API**: 正常に判断を記録できる
- [ ] **権限フィルタリング**: 各権限レベルで適切なデータのみ取得できる
- [ ] **レスポンス形式**: 仕様書通りの形式でレスポンスが返却される
- [ ] **統計計算**: サマリー統計が正確に計算される
- [ ] **ページネーション**: 正常にページ分割される

### 非機能要件
- [ ] **レスポンスタイム**: 500ms以内（目標値）
- [ ] **エラーハンドリング**: 適切なエラーメッセージが返却される
- [ ] **CORS設定**: クロスオリジンリクエストが正常に処理される
- [ ] **セキュリティ**: 権限外のデータは一切取得できない

### UI/UX
- [ ] **判断モーダル**: 正常に表示され、判断を記録できる
- [ ] **提案一覧ページ**: 判断待ち提案が正常に表示される
- [ ] **判断履歴ページ**: 判断履歴と統計が正常に表示される
- [ ] **通知連携**: 通知クリック時に適切なページへ遷移する

---

## 🚨 不具合発見時の対応

### 不具合報告フォーマット

```markdown
## 不具合報告

**発見日時**: YYYY-MM-DD HH:mm
**発見者**: 氏名
**重要度**: Critical / High / Medium / Low

### 再現手順
1. Step 1
2. Step 2
3. Step 3

### 期待される動作
- 期待される結果の説明

### 実際の動作
- 実際に発生した結果の説明

### エラーメッセージ（あれば）
```
エラーメッセージ全文
```

### スクリーンショット（あれば）
（画像添付）

### 環境情報
- OS: Windows / macOS / Linux
- ブラウザ: Chrome / Firefox / Safari
- Node.js バージョン: v20.x.x
- VoiceDrive バージョン: 1.0.0
```

### 報告先
- **Slack**: `#phase6-integration-testing`
- **GitHub Issues**: VoiceDriveリポジトリ
- **緊急時**: プロジェクトリード直通

---

## 📅 テストスケジュール

### α版統合テスト（2025年10月25日）

| 時間 | テスト内容 | 担当 |
|-----|----------|------|
| 09:00-10:00 | 環境セットアップ・疎通確認 | 両チーム |
| 10:00-11:00 | シナリオ1: 判断履歴取得API連携 | VoiceDrive側 |
| 11:00-12:00 | シナリオ2: 判断記録API連携 | 医療システム側 |
| 13:00-14:00 | シナリオ3: 権限フィルタリング検証 | 両チーム |
| 14:00-15:00 | シナリオ4: エラーハンドリング検証 | VoiceDrive側 |
| 15:00-16:00 | シナリオ5: CORS設定検証 | 医療システム側 |
| 16:00-17:00 | 不具合報告・対応方針決定 | 両チーム |

### β版統合テスト（2025年11月1日）
- α版で発見された不具合の修正確認
- 追加機能テスト
- パフォーマンステスト

### 本番リリース（2025年11月15日）
- β版で発見された不具合の修正確認
- 本番環境での最終確認
- ユーザー向けマニュアル確認

---

## 📝 テスト結果報告書（テンプレート）

```markdown
# Phase 6 α版統合テスト 結果報告書

**テスト実施日**: 2025年10月25日
**テスト担当**: VoiceDrive & 医療職員カルテシステムチーム
**テスト環境**: 開発環境（localhost）

## テスト結果サマリー

| シナリオ | 実施 | 合格 | 不合格 | 備考 |
|---------|-----|------|-------|------|
| シナリオ1: 判断履歴取得 | ○ | ○ | - | - |
| シナリオ2: 判断記録 | ○ | ○ | - | - |
| シナリオ3: 権限フィルタリング | ○ | ○ | - | - |
| シナリオ4: エラーハンドリング | ○ | ○ | - | - |
| シナリオ5: CORS設定 | ○ | ○ | - | - |

**総合判定**: 合格 / 条件付き合格 / 不合格

## 発見された不具合

### Critical
- （なし）

### High
- （なし）

### Medium
- （該当する場合記載）

### Low
- （該当する場合記載）

## 次回テスト（β版）への改善事項

1. 改善事項1
2. 改善事項2
3. 改善事項3

## 総評

（テスト全体の総評を記載）

---

**報告者**: 氏名
**報告日**: 2025年10月25日
```

---

## 📞 連絡先

### VoiceDriveチーム
- **Slack**: `#phase6-integration-testing`
- **技術担当**: プロジェクトリード

### 医療職員カルテシステムチーム
- **Slack**: `#medical-system-api`
- **API担当**: （担当者名）

---

## 📎 関連資料

1. [Phase 6実装完了レポート](phase6-implementation-complete.md)
2. [医療システムへの返信書](phase6-voicedrive-response-to-medical-system-20251021.md)
3. [医療システムからの実装完了報告](phase6-医療職員カルテシステムPhase1-5実装完了報告_20251021.md)
4. [テストデータ](../test-data/expired-escalation-history.json)

---

**最終更新**: 2025年10月20日
**バージョン**: 1.0
**ステータス**: ✅ レビュー準備完了
