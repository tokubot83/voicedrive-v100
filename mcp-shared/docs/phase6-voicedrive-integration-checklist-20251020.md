# Phase 6 統合テスト - VoiceDrive側確認チェックリスト

**作成日**: 2025年10月20日
**対象**: VoiceDriveチーム
**目的**: 医療職員カルテシステムとの統合テスト実施前の確認事項

---

## 📋 統合テスト準備チェックリスト

### 1. API実装確認 ✅

#### 1.1 エンドポイント存在確認

- [x] `GET /api/agenda/expired-escalation-history` - 判断履歴取得
- [x] `POST /api/agenda/expired-escalation-decisions` - 判断記録
- [x] `GET /api/agenda/expired-escalation-proposals` - 判断待ち提案一覧

**確認方法**:
```bash
# サーバーが起動していることを確認
curl http://localhost:3003/health
```

#### 1.2 レスポンス形式確認

- [x] `GetHistoryResponse` インターフェースが実装済み
  - `metadata` オブジェクト（requestedAt, totalCount, apiVersion）
  - `summary` オブジェクト（統計情報）
  - `decisions` 配列
  - `pagination` オブジェクト

**実装場所**: [src/api/expiredEscalationDecision.ts:70-93](src/api/expiredEscalationDecision.ts#L70-L93)

**確認方法**:
```bash
# レスポンス形式をテスト
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**期待されるレスポンス構造**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "requestedAt": "2025-10-20T12:00:00.000Z",
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
    "decisions": [ ... ],
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

---

### 2. 認証・認可確認 🔐

#### 2.1 Bearer Token認証

医療システム側が使用するBearer Token:
```
ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
```

**確認事項**:
- [ ] このトークンがVoiceDrive側で有効か確認
- [ ] トークンの有効期限を確認
- [ ] トークンがテスト環境用であることを確認

**確認方法**:
```bash
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9" \
  -H "Content-Type: application/json"
```

**期待結果**:
- HTTPステータス: 200 OK（認証成功）
- HTTPステータス: 401 Unauthorized（認証失敗の場合、トークンを更新）

#### 2.2 権限レベル別フィルタリング

**実装場所**: [src/api/expiredEscalationDecision.ts:319-389](src/api/expiredEscalationDecision.ts#L319-L389)

**確認テストケース**:

| 権限レベル | 期待される動作 | テストコマンド |
|-----------|---------------|---------------|
| LEVEL 1-4 | アクセス不可（空の結果） | `permissionLevel=1` |
| LEVEL 5-6 | 自分の判断履歴のみ | `permissionLevel=5&userId=test-user-5` |
| LEVEL 7-8 | 部署全体の履歴 | `permissionLevel=7&departmentId=看護部` |
| LEVEL 9-13 | 施設全体の履歴 | `permissionLevel=11&facilityId=facility-1` |
| LEVEL 14-15 | 法人全体の履歴 | `permissionLevel=14` |
| LEVEL 99 | 全データ | `permissionLevel=99` |

**テスト例（LEVEL 5）**:
```bash
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-consent-user-001&permissionLevel=5" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9" \
  -H "Content-Type: application/json"
```

**期待結果**: ユーザー `test-consent-user-001` が判断者として記録されているデータのみ返される

---

### 3. CORS設定確認 🌐

#### 3.1 許可されたオリジン

**実装場所**: [src/api/server.ts](src/api/server.ts)

**確認事項**:
- [x] `http://localhost:3000` が許可されている（医療システム開発環境）
- [x] `credentials: true` が設定されている

**確認方法**:
```bash
# Preflightリクエスト確認
curl -X OPTIONS "http://localhost:3003/api/agenda/expired-escalation-history" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -v
```

**期待されるレスポンスヘッダー**:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

### 4. テストデータ確認 📊

#### 4.1 テストデータ投入状況

**データファイル**: [mcp-shared/test-data/expired-escalation-history.json](mcp-shared/test-data/expired-escalation-history.json)

**確認事項**:
- [x] テストデータが10件存在
- [x] 以下の判断タイプが含まれる：
  - `approve_at_current_level`: 6件
  - `downgrade`: 2件
  - `reject`: 2件

**確認方法**:
```bash
# データベースの判断履歴件数を確認
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99&limit=100" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**: `metadata.totalCount` が10件

#### 4.2 テストユーザー存在確認

以下のテストユーザーがデータベースに存在することを確認:

| ユーザーID | 名前 | 権限レベル | 部署 |
|----------|------|-----------|------|
| test-consent-user-001 | 田中太郎 | LEVEL 5 | 看護部 |
| test-consent-user-002 | 佐藤花子 | LEVEL 8 | 看護部 |
| test-affairs-1 | 事務長テスト | LEVEL 11 | 総務部 |
| cmfs8u4i50002s5qsisvztx4f | 佐藤 花子 | LEVEL 15 | 人事総務部 |
| cmfs8u4hx0000s5qs2dv42m45 | 山田 太郎 | LEVEL 18 | 経営戦略室 |

---

### 5. エラーハンドリング確認 ⚠️

#### 5.1 認証エラー

**テスト**:
```bash
# 無効なトークンでアクセス
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json"
```

**期待結果**:
- HTTPステータス: 401 Unauthorized
- エラーメッセージが含まれる

#### 5.2 必須パラメータ不足

**テスト**:
```bash
# userIdを省略
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?permissionLevel=99" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**:
- HTTPステータス: 400 Bad Request
- エラーメッセージ: "必須パラメータが不足しています"

#### 5.3 不正な権限レベル

**テスト**:
```bash
# 不正な権限レベル（100）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=100" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**:
- HTTPステータス: 400 Bad Request
- エラーメッセージ: "不正な権限レベルです"

---

### 6. パフォーマンス確認 ⚡

#### 6.1 レスポンスタイム

**目標**: 500ms以内

**確認方法**:
```bash
# レスポンスタイムを測定
time curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**: 500ms以内

#### 6.2 同時リクエスト処理

**確認方法**:
```bash
# 10件の同時リクエストを送信
for i in {1..10}; do
  curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user-$i&permissionLevel=99" \
    -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9" &
done
wait
```

**期待結果**: 全てのリクエストが正常に処理される

---

### 7. ページネーション確認 📄

#### 7.1 ページ分割動作

**テスト**:
```bash
# 1ページ目（5件ずつ）
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99&limit=5&offset=0" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"

# 2ページ目
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99&limit=5&offset=5" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**:
- 1ページ目: `pagination.currentPage = 1`, `decisions`配列に5件
- 2ページ目: `pagination.currentPage = 2`, `decisions`配列に5件
- `pagination.hasNextPage` が正しい値

---

### 8. 日付フィルタ確認 📅

#### 8.1 日付範囲フィルタ

**テスト**:
```bash
# 2025年10月1日〜10月31日
curl -X GET "http://localhost:3003/api/agenda/expired-escalation-history?userId=test-user&permissionLevel=99&startDate=2025-10-01&endDate=2025-10-31" \
  -H "Authorization: Bearer ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9"
```

**期待結果**: 指定期間内のデータのみ返される

---

### 9. ログ出力確認 📝

#### 9.1 正常系ログ

**確認場所**: APIサーバーのコンソール出力

**期待されるログ**:
```
[ExpiredEscalationAPI] 履歴取得成功: userId=test-user, permissionLevel=99, 件数=10
```

#### 9.2 エラー系ログ

**確認場所**: APIサーバーのコンソール出力

**期待されるログ**:
```
[ExpiredEscalationAPI] 履歴取得エラー: Error: ...
```

---

### 10. 統合テスト実施準備 🚀

#### 10.1 環境変数設定

医療システムチームに以下の情報を提供:

```env
VOICEDRIVE_DECISION_HISTORY_API_URL=http://localhost:3003/api/agenda/expired-escalation-history
VOICEDRIVE_BEARER_TOKEN=ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
VOICEDRIVE_API_TIMEOUT=10000
VOICEDRIVE_API_RETRY_COUNT=3
```

#### 10.2 APIサーバー起動確認

**起動コマンド**:
```bash
npm run dev:api
# または
npm run dev
```

**確認方法**:
```bash
curl http://localhost:3003/health
```

**期待されるレスポンス**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "service": "VoiceDrive API Server",
  "version": "1.0.0"
}
```

---

## ✅ 統合テスト準備完了の判定基準

以下の全項目がチェック完了していること:

### 必須項目（Critical）

- [x] **APIエンドポイントが3つとも実装済み**
- [x] **レスポンス形式が仕様通り**（metadata + summary + decisions + pagination）
- [ ] **Bearer Token認証が動作する**
- [x] **CORS設定が正しい**（`http://localhost:3000`が許可）
- [x] **テストデータが10件存在**
- [x] **権限レベル別フィルタが実装済み**

### 推奨項目（High）

- [x] **エラーハンドリングが実装済み**
- [x] **ページネーションが動作する**
- [ ] **レスポンスタイムが500ms以内**
- [ ] **ログ出力が正常**

### オプション項目（Medium）

- [ ] **同時リクエスト処理が正常**
- [ ] **日付フィルタが動作する**
- [ ] **パフォーマンステストを実施済み**

---

## 📞 医療システムチームへの連絡事項

### 統合テスト開始前に共有する情報

1. **APIエンドポイント**
   ```
   http://localhost:3003/api/agenda/expired-escalation-history
   ```

2. **Bearer Token**
   ```
   ce89550c2e57e5057402f0dd0c6061a9bc3d5f2835e1f3d67dcce99551c2dcb9
   ```

3. **サポートされるクエリパラメータ**
   - `userId` (必須)
   - `permissionLevel` (必須)
   - `facilityId` (オプション)
   - `departmentId` (オプション)
   - `startDate` (オプション)
   - `endDate` (オプション)
   - `limit` (オプション、デフォルト50)
   - `offset` (オプション、デフォルト0)

4. **テスト環境の稼働時間**
   - 平日 9:00-18:00（JST）
   - 統合テスト実施日: 2025年10月21日-22日は終日稼働

5. **問い合わせ先**
   - Slack: `#phase6-integration-testing`
   - 緊急時: プロジェクトリード

---

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 問題1: 認証エラー（401 Unauthorized）

**原因**: Bearer Tokenが無効または期限切れ

**解決方法**:
1. トークンを再生成
2. 医療システムチームに新しいトークンを共有
3. `.env.local`を更新

#### 問題2: CORS エラー

**原因**: `http://localhost:3000`が許可されていない

**解決方法**:
1. [src/api/server.ts](src/api/server.ts)のCORS設定を確認
2. `origin`配列に`http://localhost:3000`が含まれていることを確認
3. サーバーを再起動

#### 問題3: データが返ってこない

**原因**: 権限レベルに応じたフィルタリングが動作している

**解決方法**:
1. `permissionLevel=99`で全データが取得できるか確認
2. テストユーザーの権限レベルを確認
3. データベースにテストデータが存在するか確認

#### 問題4: レスポンスが遅い

**原因**: データベースクエリが最適化されていない

**解決方法**:
1. データベースインデックスを確認
2. クエリパフォーマンスを計測
3. 必要に応じてクエリを最適化

---

## 📊 統合テスト当日のチェックリスト

### テスト開始前（9:00-10:00）

- [ ] VoiceDrive APIサーバーが起動している
- [ ] 医療職員カルテシステムが起動している
- [ ] 両チームのメンバーがSlackに参加している
- [ ] テストデータが投入されている
- [ ] ログ監視環境が準備できている

### テスト中（10:00-17:00）

- [ ] 各テストシナリオの結果を記録
- [ ] 発見した不具合をその場でSlackに報告
- [ ] 重大な問題が発生した場合は即座にエスカレーション

### テスト終了後（17:00-18:00）

- [ ] テスト結果をまとめる
- [ ] 不具合リストを作成
- [ ] 次回テスト（β版）の日程を調整
- [ ] テスト結果報告書を作成

---

**最終更新**: 2025年10月20日
**ステータス**: ✅ レビュー完了
**次のアクション**: 医療システムチームと統合テスト日程調整
