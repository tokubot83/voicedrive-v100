# MyReportsPage 環境変数設定ガイド

**作成日**: 2025年10月26日
**対象**: VoiceDrive開発チーム
**カテゴリ**: 環境変数・設定

---

## 概要

MyReportsPage（コンプライアンス通報システム）の正常な動作に必要な環境変数を説明します。

---

## 必須環境変数

### 1. MEDICAL_SYSTEM_WEBHOOK_URL

**用途**: 医療システムへ通報を送信する際のWebhook URL

**設定例**:
```env
# 本番環境
MEDICAL_SYSTEM_WEBHOOK_URL=https://medical-system.example.com/api/webhooks/voicedrive/whistleblowing/report

# 開発環境
MEDICAL_SYSTEM_WEBHOOK_URL=http://localhost:8080/api/webhooks/voicedrive/whistleblowing/report
```

**説明**:
- VoiceDriveから医療システムへ通報データを送信するエンドポイント
- 通報受付時に自動的に呼び出されます
- タイムアウト: 10秒

---

### 2. WEBHOOK_SECRET

**用途**: Webhook署名検証用の共通秘密鍵（VoiceDrive→医療システム送信時）

**設定例**:
```env
WEBHOOK_SECRET=your-super-secret-webhook-key-here-min-32-chars
```

**要件**:
- 最低32文字以上の複雑な文字列を推奨
- 医療システムチームと同じ値を共有する必要があります
- 本番環境では環境変数管理サービス（AWS Secrets Manager等）での管理を推奨

**セキュリティ**:
- HMAC-SHA256アルゴリズムで署名を生成
- タイムスタンプベースのリプレイ攻撃防止（5分以内の有効期限）

---

### 3. MEDICAL_SYSTEM_WEBHOOK_SECRET

**用途**: Webhook署名検証用の共通秘密鍵（医療システム→VoiceDrive受信時）

**設定例**:
```env
MEDICAL_SYSTEM_WEBHOOK_SECRET=your-super-secret-webhook-key-here-min-32-chars
```

**要件**:
- WEBHOOK_SECRETと同じでも異なっても可
- 医療システムチームが使用する秘密鍵と一致する必要があります
- 最低32文字以上を推奨

**セキュリティ**:
- HMAC-SHA256アルゴリズムで署名を検証
- タイムスタンプベースのリプレイ攻撃防止（5分以内の有効期限）
- 署名検証に失敗した場合は401 Unauthorizedを返します

---

## オプション環境変数

### 4. WEBHOOK_TIMEOUT_MS

**用途**: 医療システムへのWebhook送信タイムアウト（ミリ秒）

**デフォルト値**: 10000（10秒）

**設定例**:
```env
WEBHOOK_TIMEOUT_MS=15000
```

---

### 5. WEBHOOK_MAX_AGE_MINUTES

**用途**: Webhookタイムスタンプの最大有効期限（分）

**デフォルト値**: 5（5分）

**設定例**:
```env
WEBHOOK_MAX_AGE_MINUTES=10
```

**説明**:
- リプレイ攻撃を防ぐための設定
- この期限を超えたWebhookリクエストは拒否されます

---

## 環境別設定例

### 開発環境（.env.development）

```env
# 医療システムWebhook URL（ローカル開発）
MEDICAL_SYSTEM_WEBHOOK_URL=http://localhost:8080/api/webhooks/voicedrive/whistleblowing/report

# Webhook共通秘密鍵（開発用）
WEBHOOK_SECRET=dev-webhook-secret-key-for-testing-only
MEDICAL_SYSTEM_WEBHOOK_SECRET=dev-webhook-secret-key-for-testing-only

# タイムアウト設定
WEBHOOK_TIMEOUT_MS=10000
WEBHOOK_MAX_AGE_MINUTES=5
```

---

### 本番環境（.env.production）

```env
# 医療システムWebhook URL（本番）
MEDICAL_SYSTEM_WEBHOOK_URL=https://medical-system.example.com/api/webhooks/voicedrive/whistleblowing/report

# Webhook共通秘密鍵（本番用 - AWS Secrets Managerから取得推奨）
WEBHOOK_SECRET=${WEBHOOK_SECRET_FROM_AWS}
MEDICAL_SYSTEM_WEBHOOK_SECRET=${MEDICAL_SYSTEM_WEBHOOK_SECRET_FROM_AWS}

# タイムアウト設定
WEBHOOK_TIMEOUT_MS=15000
WEBHOOK_MAX_AGE_MINUTES=5
```

---

## セキュリティ推奨事項

### 1. 秘密鍵の管理

- ✅ **DO**: 秘密鍵管理サービスを使用（AWS Secrets Manager、Azure Key Vault等）
- ✅ **DO**: 定期的なローテーション（3ヶ月に1回推奨）
- ✅ **DO**: 本番環境と開発環境で異なる鍵を使用
- ❌ **DON'T**: Gitリポジトリにハードコードしない
- ❌ **DON'T**: 簡単に推測可能な文字列を使用しない

### 2. URL検証

- 本番環境ではHTTPS URLのみ許可することを推奨
- 開発環境ではlocalhostのみ許可

### 3. タイムスタンプ検証

- WEBHOOK_MAX_AGE_MINUTESは5分以下を推奨
- リプレイ攻撃のリスクを最小化

---

## トラブルシューティング

### 問題1: 「Webhook signature verification failed」

**原因**:
- WEBHOOK_SECRETまたはMEDICAL_SYSTEM_WEBHOOK_SECRETが医療システムチームと不一致

**解決策**:
1. 医療システムチームと秘密鍵を再確認
2. 両システムで同じ値を使用していることを確認
3. タイムスタンプが正しいことを確認（サーバー時刻のずれ）

---

### 問題2: 「Webhook timestamp too old」

**原因**:
- サーバー間の時刻同期の問題
- WEBHOOK_MAX_AGE_MINUTESが短すぎる

**解決策**:
1. NTPサーバーで時刻同期を確認
2. WEBHOOK_MAX_AGE_MINUTESを延長（10分程度）

---

### 問題3: 医療システムへの送信タイムアウト

**原因**:
- WEBHOOK_TIMEOUT_MSが短すぎる
- 医療システムの応答が遅い

**解決策**:
1. WEBHOOK_TIMEOUT_MSを延長（15000ms推奨）
2. 医療システムチームに応答速度の改善を依頼

---

## 環境変数チェックリスト

実装前に以下を確認してください：

- [ ] MEDICAL_SYSTEM_WEBHOOK_URLが設定されている
- [ ] WEBHOOK_SECRETが32文字以上で設定されている
- [ ] MEDICAL_SYSTEM_WEBHOOK_SECRETが32文字以上で設定されている
- [ ] 医療システムチームと秘密鍵が一致している
- [ ] 本番環境ではHTTPS URLを使用している
- [ ] .envファイルが.gitignoreに含まれている
- [ ] 秘密鍵管理サービスを使用している（本番環境）

---

## 医療システムチームとの連携

### 共有が必要な情報

1. **VoiceDrive側のWebhook受信エンドポイント**:
   - ステータス更新: `POST /api/webhooks/medical-system/whistleblowing/status-update`
   - 対応完了通知: `POST /api/webhooks/medical-system/whistleblowing/resolution`

2. **VoiceDrive側が期待する署名ヘッダー**:
   - `X-Medical-System-Signature`: HMAC-SHA256署名
   - `X-Medical-System-Timestamp`: ISO 8601形式のタイムスタンプ

3. **VoiceDrive側の署名検証ロジック**:
   - アルゴリズム: HMAC-SHA256
   - メッセージ形式: `${timestamp}.${JSON.stringify(payload)}`
   - タイムアウト: 5分以内

---

## 関連ドキュメント

- [MyReportsPage_DB要件分析_20251026.md](./MyReportsPage_DB要件分析_20251026.md)
- [MyReportsPage暫定マスターリスト_20251026.md](./MyReportsPage暫定マスターリスト_20251026.md)
- [MyReportsPage_VoiceDrive回答書_20251026.md](./MyReportsPage_VoiceDrive回答書_20251026.md)

---

**最終更新**: 2025年10月26日
**担当**: VoiceDrive開発チーム
