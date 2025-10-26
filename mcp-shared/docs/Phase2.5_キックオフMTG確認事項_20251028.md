# Phase 2.5 キックオフミーティング確認事項

**日時**: 2025年10月28日（月）10:00
**参加者**: VoiceDriveチーム、医療システムチーム
**目的**: Phase 2.5ステージング環境統合の準備確認

---

## ✅ VoiceDriveチームから報告する内容

### 1. 実装完了報告
- [x] UI実装完了（SystemMonitorPageEnhanced拡張）
- [x] Webhook差分検出アラート実装
- [x] 面談実施率監視UI実装
- [x] モックサーバー実装・動作確認完了
- [x] 型定義100%互換性確認完了
- [x] mainブランチへpush完了

### 2. 共有する成果物
- [x] 実装完了通知書（`VoiceDrive_Phase2.5_UI実装完了通知_20251026.md`）
- [x] 型定義ファイル（`src/types/medicalSystem.types.ts`）
- [x] モックサーバーコード（`src/services/MockMedicalSystemServer.ts`）
- [x] 統合テスト結果（`Phase2.5_統合テスト結果_20251026.md`）

### 3. デモ準備
- [ ] SystemMonitorPageEnhancedのデモ（ブラウザ）
- [ ] モックサーバーとの連携デモ
- [ ] Webhook差分検出アラートのデモ
- [ ] 面談実施率監視のデモ

---

## 📋 医療システムチームに確認すること

### 1. ステージング環境情報（最優先）

#### 1.1 APIベースURL
```bash
# 確認項目
MEDICAL_SYSTEM_API_URL="https://staging-medical.example.com"

# 質問事項:
- ステージング環境のベースURLは何ですか？
- ポート番号は80/443以外を使用しますか？
- HTTPSは有効ですか？（推奨: Yes）
```

#### 1.2 APIキー
```bash
# 確認項目
MEDICAL_SYSTEM_API_KEY="vd-staging-api-key-XXXXXXXX"

# 質問事項:
- ステージング環境用APIキーを発行済みですか？
- APIキーの形式は？（例: Bearer Token）
- APIキーの有効期限はありますか？
- ローテーション（定期更新）は必要ですか？
```

#### 1.3 Webhook署名検証シークレット
```bash
# 確認項目
MEDICAL_SYSTEM_WEBHOOK_SECRET="staging-webhook-secret-XXXXXXXX"

# 質問事項:
- Webhook署名検証用のシークレットキーは発行済みですか？
- 署名アルゴリズムはHMAC-SHA256ですか？
- シークレットキーの長さは32文字以上ですか？
```

---

### 2. API仕様確認

#### 2.1 API 1: Webhook送信統計
```
GET /api/voicedrive/webhook-stats
```

**確認事項**:
- [ ] エンドポイントパスは `/api/voicedrive/webhook-stats` で確定ですか？
- [ ] クエリパラメータ（startDate, endDate）は実装済みですか？
- [ ] レスポンス形式はVoiceDrive型定義と100%一致していますか？
- [ ] レート制限は100 req/min/IPですか？

**テスト用cURLコマンド**:
```bash
curl -X GET "https://staging-medical.example.com/api/voicedrive/webhook-stats" \
  -H "Authorization: Bearer vd-staging-api-key-XXXXXXXX" \
  -H "X-VoiceDrive-System-ID: voicedrive-v100"
```

#### 2.2 API 2: 面談完了統計
```
GET /api/voicedrive/interview-completion-stats
```

**確認事項**:
- [ ] エンドポイントパスは `/api/voicedrive/interview-completion-stats` で確定ですか？
- [ ] クエリパラメータ（startDate, endDate）は実装済みですか？
- [ ] レスポンス形式はVoiceDrive型定義と100%一致していますか？
- [ ] 面談タイプ別統計（byInterviewType）は実装済みですか？

**テスト用cURLコマンド**:
```bash
curl -X GET "https://staging-medical.example.com/api/voicedrive/interview-completion-stats" \
  -H "Authorization: Bearer vd-staging-api-key-XXXXXXXX" \
  -H "X-VoiceDrive-System-ID: voicedrive-v100"
```

#### 2.3 ヘルスチェック
```
GET /api/health
```

**確認事項**:
- [ ] ヘルスチェックエンドポイントは実装済みですか？
- [ ] 認証不要でアクセスできますか？

---

### 3. 認証・セキュリティ

#### 3.1 認証方式
```
Authorization: Bearer <API_KEY>
X-VoiceDrive-System-ID: voicedrive-v100
```

**確認事項**:
- [ ] Bearer Token認証で確定ですか？
- [ ] `X-VoiceDrive-System-ID` ヘッダーは必須ですか？
- [ ] 他に必要なヘッダーはありますか？

#### 3.2 IP制限
**確認事項**:
- [ ] VoiceDriveステージング環境のIPアドレスをホワイトリストに追加する必要がありますか？
- [ ] VoiceDrive本番環境のIPアドレスも事前に共有が必要ですか？

#### 3.3 エラーレスポンス形式
**確認事項**:
- [ ] 401 Unauthorized時のレスポンス形式は？
- [ ] 403 Forbidden時のレスポンス形式は？
- [ ] 500 Internal Server Error時のレスポンス形式は？
- [ ] タイムアウト設定は何秒ですか？（VoiceDrive側: 10秒）

---

### 4. データ仕様確認

#### 4.1 日時フォーマット
**確認事項**:
- [ ] ISO 8601形式（例: `2025-10-28T10:00:00.000Z`）で確定ですか？
- [ ] タイムゾーンはUTCですか？それともJST（+09:00）ですか？

#### 4.2 数値フォーマット
**確認事項**:
- [ ] パーセンテージは0-100の数値ですか？（例: 90.0）
- [ ] 小数点以下の桁数に制限はありますか？

#### 4.3 文字列エンコーディング
**確認事項**:
- [ ] UTF-8で確定ですか？
- [ ] 日本語（面談タイプ名など）は正しくエンコードされていますか？

---

### 5. パフォーマンス・スケール

#### 5.1 レスポンスタイム
**確認事項**:
- [ ] 95パーセンタイルで300ms以内を保証できますか？
- [ ] データ量が増加した場合のパフォーマンス低下対策はありますか？

#### 5.2 レート制限
**確認事項**:
- [ ] レート制限は100 req/min/IPで確定ですか？
- [ ] VoiceDriveは5秒ごと（12 req/min）にポーリングする予定です。問題ありませんか？
- [ ] レート制限超過時のレスポンス（429 Too Many Requests）はどのような形式ですか？

---

### 6. テストデータ準備

#### 6.1 ステージング環境のテストデータ
**確認事項**:
- [ ] Webhook送信ログのテストデータは100件以上ありますか？
- [ ] 面談予約データのテストデータは50件以上ありますか？
- [ ] 各種エラーシナリオ（失敗、リトライ、無断欠席など）のテストデータはありますか？

#### 6.2 データリセット
**確認事項**:
- [ ] テストデータをリセットする方法はありますか？
- [ ] リセット権限はVoiceDriveチームにも付与されますか？

---

### 7. 統合テストスケジュール調整

#### Week 2（11/4-11/8）: ステージング環境統合
**確認事項**:
- [ ] 11/4（月）からステージング環境統合テストを開始できますか？
- [ ] 医療システムチームの担当者は誰ですか？（Slack/Email連絡先）
- [ ] エラー発生時のエスカレーション先は？

#### Week 4（11/18-22）: 正式統合テスト
**確認事項**:
- [ ] 統合テストシナリオ（20テストケース）を確認しましたか？
- [ ] Day 1（11/18）は両チームとも参加可能ですか？
- [ ] テスト実施時間帯は？（例: 10:00-17:00）

---

### 8. 監視・アラート

#### 8.1 ステータス監視
**確認事項**:
- [ ] 医療システムAPIのステータスページはありますか？
- [ ] 計画メンテナンス時の事前通知方法は？

#### 8.2 障害時の連絡体制
**確認事項**:
- [ ] 障害発生時の連絡先（24時間対応）は？
- [ ] Slackチャンネル `#medical-voicedrive-integration` は設定済みですか？
- [ ] 重大障害（P1）の定義と対応SLAは？

---

### 9. 本番環境への移行（Week 5以降）

#### 9.1 本番環境APIキー
**確認事項**:
- [ ] 本番環境APIキーの発行タイミングは？（Week 4終了後？）
- [ ] 本番環境とステージング環境で設定の違いはありますか？

#### 9.2 ロールバック計画
**確認事項**:
- [ ] Phase 2.5ロールバック時の手順は？
- [ ] データ同期のロールバック方法は？

---

## 📝 議事録テンプレート

### 決定事項

| 項目 | 内容 | 担当 | 期日 |
|------|------|------|------|
| ステージングURL | `https://___________` | 医療システム | - |
| APIキー | `vd-staging-___________` | 医療システム | 10/28 |
| Webhookシークレット | `staging-webhook-___________` | 医療システム | 10/28 |
| 統合テスト開始日 | 11/4（月） | 両チーム | - |
| 担当者連絡先 | Slack: `@___________` | 医療システム | - |

### 次回アクション

| アクション | 担当 | 期日 |
|-----------|------|------|
| APIキー発行 | 医療システム | 10/28 EOD |
| .env.staging設定 | VoiceDrive | 10/29 |
| ステージング環境疎通確認 | VoiceDrive | 10/30 |
| 統合テスト準備完了 | 両チーム | 11/1 |

---

## ✅ VoiceDrive側の準備完了項目

- [x] UI実装完了
- [x] 型定義作成
- [x] MedicalSystemClient実装
- [x] モックサーバー実装
- [x] 統合テスト（モック）実行・合格
- [x] .env.staging.template作成
- [ ] デモ準備（10/28朝）
- [ ] ステージング環境設定（10/28 MTG後）

---

**最終更新**: 2025年10月26日
**次回更新**: キックオフミーティング後（10月28日）
