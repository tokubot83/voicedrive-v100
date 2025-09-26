# Phase 3 本番デプロイチェックリスト

**デプロイ予定日**: 2025年10月4日（金）
**バージョン**: v3.0.0-facility-permission
**リリース名**: Phase 3 - 施設別権限管理システム

---

## 事前準備（10/3までに完了）

### 環境設定

- [ ] 本番環境URL確定
  - [ ] VoiceDrive API: `https://api.voicedrive.jp`
  - [ ] 医療システムAPI: `https://medical.example.jp/api/v1`
  - [ ] Webhook URL: `https://api.voicedrive.jp/webhooks/medical`

- [ ] 認証情報設定
  - [ ] 本番用Bearer Token発行
  - [ ] Webhook署名シークレット設定
  - [ ] 管理画面アクセス権限設定

- [ ] SSL証明書確認
  - [ ] VoiceDrive側証明書
  - [ ] 医療システム側証明書
  - [ ] 証明書有効期限確認（>30日）

### データベース準備

- [ ] バックアップ取得
  ```bash
  # 実行コマンド
  npm run backup:production
  # 保存先: backups/prod-backup-20251004-pre-deploy.sql
  ```

- [ ] マイグレーションファイル準備
  ```sql
  -- migrations/20251004-phase3-facility-permissions.sql
  ALTER TABLE staff ADD COLUMN facility_id VARCHAR(50);
  ALTER TABLE staff ADD COLUMN position_level DECIMAL(3,1);
  CREATE INDEX idx_facility_position ON staff(facility_id, position);
  ```

- [ ] ロールバックスクリプト準備
  ```sql
  -- rollback/20251004-phase3-rollback.sql
  ALTER TABLE staff DROP COLUMN facility_id;
  ALTER TABLE staff DROP COLUMN position_level;
  DROP INDEX idx_facility_position;
  ```

### コード準備

- [ ] 最新コードのマージ
  ```bash
  git checkout main
  git pull origin main
  git merge feature/phase3-facility-permissions
  ```

- [ ] タグ付け
  ```bash
  git tag -a v3.0.0 -m "Phase 3: 施設別権限管理システム"
  git push origin v3.0.0
  ```

- [ ] ビルド確認
  ```bash
  npm run build
  npm run test
  npm run lint
  ```

---

## デプロイ当日（10/4）

### 9:00 - 事前確認

- [ ] システム稼働状況確認
  - [ ] 現行システム正常稼働
  - [ ] エラーログなし
  - [ ] リソース使用率正常

- [ ] 関係者への連絡
  - [ ] デプロイ開始通知（Slack）
  - [ ] メンテナンス告知確認

### 10:00 - デプロイ開始

#### Step 1: メンテナンスモード移行
- [ ] メンテナンス画面表示
  ```bash
  npm run maintenance:enable
  ```
- [ ] ユーザーセッション確認
- [ ] 実行中プロセス完了待機（最大5分）

#### Step 2: バックアップ
- [ ] 本番DBバックアップ
  ```bash
  npm run backup:production --tag pre-phase3
  ```
- [ ] 設定ファイルバックアップ
  ```bash
  cp .env.production .env.production.backup-20251004
  ```

#### Step 3: デプロイ実行

**VoiceDrive側**
- [ ] 新バージョンデプロイ
  ```bash
  npm run deploy:production
  ```
- [ ] 環境変数更新
  ```bash
  # .env.production に追加
  MEDICAL_API_URL=https://medical.example.jp/api/v1
  MEDICAL_API_TOKEN=[本番トークン]
  DEFAULT_FACILITY_ID=obara-hospital
  TATEGAMI_FACILITY_ID=tategami-rehabilitation
  ```
- [ ] マイグレーション実行
  ```bash
  npm run migrate:production
  ```

**医療システム側**
- [ ] API更新確認
- [ ] Webhook設定確認
- [ ] テストデータ削除

### 11:00 - 動作確認

#### 基本機能確認
- [ ] ログイン機能
- [ ] 権限計算API疎通
- [ ] 施設選択機能
- [ ] 役職表示確認

#### Phase 3機能確認
- [ ] 統括主任レベル7
  - [ ] テストユーザー: PROD_TATE_001
  - [ ] 期待値: Level 7
  - [ ] 実測値: ___

- [ ] 施設間権限変換
  - [ ] 小原→立神: Level 10 → 9
  - [ ] 立神→小原: Level 7 → 8

- [ ] Webhook受信
  - [ ] テストイベント送信
  - [ ] 受信ログ確認
  - [ ] 処理結果確認

#### パフォーマンス確認
- [ ] API応答時間 (<500ms)
- [ ] ページロード時間 (<3s)
- [ ] 同時接続数テスト (>100)

### 11:30 - メンテナンスモード解除

- [ ] メンテナンスモード解除
  ```bash
  npm run maintenance:disable
  ```
- [ ] トップページアクセス確認
- [ ] エラーログ確認

### 12:00 - 完了報告

- [ ] デプロイ完了通知（Slack）
- [ ] 関係者へのメール送信
- [ ] ドキュメント更新

---

## モニタリング（デプロイ後24時間）

### 12:00-18:00（初日）
- [ ] 15分ごとのヘルスチェック
- [ ] エラーログ監視
- [ ] パフォーマンスメトリクス確認

### 翌日（10/5）
- [ ] 24時間レポート作成
- [ ] 問題点の洗い出し
- [ ] 改善点の記録

---

## ロールバック手順（緊急時）

### 判断基準
以下のいずれかが発生した場合、即座にロールバック：
- [ ] 権限計算が正常動作しない
- [ ] システム全体がダウン
- [ ] データ不整合の発生

### ロールバック実行
1. メンテナンスモード有効化
   ```bash
   npm run maintenance:enable
   ```

2. 前バージョンに戻す
   ```bash
   npm run deploy:rollback --version v2.9.0
   ```

3. DBロールバック
   ```bash
   npm run migrate:rollback --to 20250925
   ```

4. 設定ファイル復元
   ```bash
   cp .env.production.backup-20251004 .env.production
   ```

5. サービス再起動
   ```bash
   npm run restart:production
   ```

6. 動作確認後、メンテナンス解除

---

## 連絡先

### 緊急連絡先

**VoiceDriveチーム**
- リード: [氏名] - 090-xxxx-xxxx
- サブ: [氏名] - 080-xxxx-xxxx
- Slack: #phase3-deploy

**医療システムチーム**
- リード: [氏名] - 090-yyyy-yyyy
- サブ: [氏名] - 080-yyyy-yyyy
- Slack: #medical-system

### エスカレーション
1. 各チームリード
2. プロジェクトマネージャー
3. 部門責任者

---

## 承認

- [ ] VoiceDriveチームリード承認
- [ ] 医療システムチームリード承認
- [ ] プロジェクトマネージャー承認
- [ ] リリース判定会議承認

**最終更新**: 2025年10月1日 10:00
**次回確認**: 2025年10月3日 15:00