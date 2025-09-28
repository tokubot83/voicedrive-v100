# エスポワール立神統合 本番環境デプロイ手順書

**作成日**: 2025年9月28日
**対象**: VoiceDrive & 医療システム開発チーム
**バージョン**: 1.0

---

## 📋 前提条件

### 必要な権限
- [ ] 本番環境へのSSHアクセス権限
- [ ] GitHubリポジトリのメンテナー権限
- [ ] AWSコンソールへのアクセス権限
- [ ] データベース管理者権限

### 事前確認
- [ ] 統合テストが100%成功している
- [ ] 医療チームからの承認を取得済み
- [ ] バックアップスケジュールの確認

---

## 🚀 デプロイ手順

### Phase 1: 準備作業（10分）

#### 1.1 バックアップ作成
```bash
# 本番データベースのバックアップ
pg_dump -h production-db.example.com -U voicedrive_prod \
  -d voicedrive_production > backup_$(date +%Y%m%d_%H%M%S).sql

# 設定ファイルのバックアップ
cp -r /app/config /app/config.backup.$(date +%Y%m%d_%H%M%S)
```

#### 1.2 メンテナンスモード有効化
```bash
# メンテナンス画面を表示
touch /app/maintenance.flag

# Slackに通知
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"🔧 VoiceDrive: メンテナンス開始（エスポワール立神統合）"}'
```

---

### Phase 2: コード展開（15分）

#### 2.1 最新コードの取得
```bash
cd /app/voicedrive
git fetch origin main
git checkout main
git pull origin main

# タグ付け
git tag -a "v3.1.0-espoir-integration" -m "エスポワール立神統合"
git push origin --tags
```

#### 2.2 依存関係の更新
```bash
npm ci --production
npm run build
```

#### 2.3 設定ファイルの配置
```bash
# MCPサーバー共有設定をコピー
cp mcp-shared/config/facility-mappings.json /app/config/
cp mcp-shared/interfaces/facility.interface.ts /app/src/interfaces/

# 環境変数の確認
cat .env.production | grep FACILITY
```

---

### Phase 3: データベース更新（10分）

#### 3.1 施設マスタ更新
```sql
-- 新規施設追加
INSERT INTO facilities (
  facility_id,
  facility_name,
  facility_type,
  scale,
  created_at,
  updated_at
) VALUES (
  'espoir-tategami',
  '介護老人保健施設エスポワール立神',
  'geriatric_health_facility',
  'medium',
  NOW(),
  NOW()
);
```

#### 3.2 役職マッピング追加
```sql
-- 33役職分のINSERT文を実行
-- （別ファイル: position_mappings.sql参照）
\i /app/sql/espoir_position_mappings.sql

-- 確認
SELECT COUNT(*) FROM position_mappings
WHERE facility_id = 'espoir-tategami';
-- Expected: 39
```

---

### Phase 4: サービス再起動（5分）

#### 4.1 アプリケーションサーバー
```bash
# PM2を使用している場合
pm2 reload voicedrive --update-env

# systemdを使用している場合
sudo systemctl restart voicedrive
```

#### 4.2 ワーカープロセス
```bash
pm2 reload voicedrive-worker
```

#### 4.3 キャッシュクリア
```bash
redis-cli FLUSHDB
```

---

### Phase 5: 動作確認（15分）

#### 5.1 ヘルスチェック
```bash
# APIエンドポイント確認
curl https://voicedrive.com/api/health

# 施設データ取得確認
curl https://voicedrive.com/api/facilities/espoir-tategami \
  -H "Authorization: Bearer $API_TOKEN"
```

#### 5.2 統合テスト実行
```bash
# 本番環境用テスト
npm run test:production:espoir

# Expected output:
# ✅ 施設ID確認: espoir-tategami
# ✅ 39職種マッピング確認
# ✅ 統括主任レベル7確認
# ✅ 兼任ポジション処理確認
```

#### 5.3 ログ確認
```bash
# エラーログ確認
tail -f /var/log/voicedrive/error.log

# アクセスログ確認
tail -f /var/log/voicedrive/access.log
```

---

### Phase 6: メンテナンス終了（5分）

#### 6.1 メンテナンスモード解除
```bash
rm /app/maintenance.flag
```

#### 6.2 通知送信
```bash
# Slack通知
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"✅ VoiceDrive: メンテナンス完了（エスポワール立神統合成功）"}'

# 医療チームへの通知
echo "エスポワール立神統合完了" | \
  mail -s "VoiceDrive統合完了通知" medical-team@example.com
```

---

## 🔄 ロールバック手順

問題が発生した場合の復旧手順：

### 1. 即座にメンテナンスモード有効化
```bash
touch /app/maintenance.flag
```

### 2. 前バージョンに戻す
```bash
git checkout v3.0.0
npm ci --production
npm run build
```

### 3. データベースをリストア
```bash
psql -h production-db.example.com -U voicedrive_prod \
  -d voicedrive_production < backup_YYYYMMDD_HHMMSS.sql
```

### 4. サービス再起動
```bash
pm2 reload voicedrive --update-env
```

### 5. インシデント報告
```bash
# インシデントレポート作成
cat > incident_report.md << EOF
日時: $(date)
影響: エスポワール立神統合
原因: [記入]
対応: ロールバック実施
EOF
```

---

## ✅ チェックリスト

### デプロイ前
- [ ] テスト環境での動作確認完了
- [ ] 医療チームの承認取得
- [ ] バックアップ作成完了
- [ ] メンテナンス時間の周知完了

### デプロイ後
- [ ] 全APIエンドポイントの疎通確認
- [ ] エスポワール立神データの取得確認
- [ ] 権限レベルの動作確認
- [ ] エラーログの確認（エラーなし）
- [ ] パフォーマンス指標の確認

### 最終確認
- [ ] 医療チームへの完了報告
- [ ] ドキュメントの更新
- [ ] 次回デプロイ計画の策定

---

## 📞 緊急連絡先

- **技術リード**: 080-xxxx-xxxx
- **医療システム担当**: 090-xxxx-xxxx
- **インフラ担当**: 070-xxxx-xxxx
- **Slackチャンネル**: #emergency-deploy

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|--------|
| 1.0 | 2025-09-28 | 初版作成 | VoiceDrive Team |

---

**重要**: このデプロイは医療システムと連携して実施する必要があります。
単独でのデプロイは避け、必ず両チームで調整の上実施してください。