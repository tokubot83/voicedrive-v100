# 期限切れエスカレーション提案機能 DB構築後作業再開指示書

**文書番号**: RESTART-2025-1021-001
**作成日**: 2025年10月21日
**対象機能**: 期限切れエスカレーション提案ページ
**前提条件**: ✅ API実装完了、✅ テスト実装完了、⏳ DB構築待ち

---

## 📋 作業再開時のクイックガイド

### 🎯 目的

DB構築後、期限切れエスカレーション提案機能の動作確認とデプロイを実施する。

### ⏱️ 推定所要時間

**合計**: 約1-2時間

- ステップ1: 環境確認（5分）
- ステップ2: データベース確認（10分）
- ステップ3: テスト実行（15分）
- ステップ4: APIサーバー起動・確認（10分）
- ステップ5: API動作確認（15分）
- ステップ6: フロントエンド統合確認（20分）
- ステップ7: E2E動作確認（20分）
- ステップ8: 本番デプロイ（15分）

---

## 📂 実装済みファイルの確認

### 作業開始前に以下のファイルが存在することを確認してください

#### 分析・設計ドキュメント
- ✅ `mcp-shared/docs/expired-escalation-proposals_DB要件分析_20251021.md` (634行)
- ✅ `mcp-shared/docs/expired-escalation-proposals暫定マスターリスト_20251021.md` (319行)

#### API実装
- ✅ `src/api/routes/expired-escalation.routes.ts` (181行)
- ✅ `src/api/server.ts` (177行目にルート追加済み)

#### テスト
- ✅ `src/tests/expired-escalation-api.test.ts` (721行)

#### フロントエンド（既存）
- ✅ `src/pages/ExpiredEscalationProposalsPage.tsx`
- ✅ `src/components/agenda-mode/ExpiredEscalationDecisionModal.tsx`

#### ドキュメント
- ✅ `mcp-shared/docs/expired-escalation-api-implementation-report_20251021.md`
- ✅ `mcp-shared/docs/expired-escalation-implementation-complete_20251021.md`
- ✅ `mcp-shared/docs/expired-escalation-restart-guide_20251021.md` (この文書)

**確認コマンド**:
```bash
# ファイルの存在確認
ls -la src/api/routes/expired-escalation.routes.ts
ls -la src/tests/expired-escalation-api.test.ts
ls -la mcp-shared/docs/expired-escalation-*
```

---

## 🚀 作業手順

### ステップ1: 環境確認（5分）

#### 1.1 プロジェクトディレクトリ確認

```bash
cd c:\projects\voicedrive-v100
pwd
```

**期待される出力**:
```
c:\projects\voicedrive-v100
```

#### 1.2 依存パッケージ確認

```bash
npm install
```

**期待される結果**: すべてのパッケージがインストールされる

#### 1.3 環境変数確認

```bash
# .env ファイルの存在確認
ls -la .env

# データベースURL確認
cat .env | grep DATABASE_URL
```

**必要な環境変数**:
- `DATABASE_URL`: PostgreSQL接続文字列（またはSQLite）
- `NODE_ENV`: development / production

---

### ステップ2: データベース確認（10分）

#### 2.1 Prismaクライアント生成

```bash
npx prisma generate
```

**期待される結果**: Prismaクライアントが生成される

#### 2.2 マイグレーション確認

```bash
# マイグレーション履歴確認
npx prisma migrate status
```

**期待される状態**: すべてのマイグレーションが適用済み

**もしマイグレーションが必要な場合**:
```bash
npx prisma migrate dev
```

#### 2.3 テーブル確認

```bash
# Prisma Studioで確認
npx prisma studio
```

**確認項目**:
- ✅ `Post` テーブルが存在する
- ✅ `ExpiredEscalationDecision` テーブルが存在する
- ✅ `User` テーブルが存在する

**Prisma Studioでの確認**:
1. ブラウザで http://localhost:5555 が開く
2. 左側のテーブルリストを確認
3. `Post` テーブルをクリック
   - `agendaScore`, `agendaLevel`, `agendaVotingDeadline`, `agendaStatus` フィールドを確認
4. `ExpiredEscalationDecision` テーブルをクリック
   - すべてのフィールドが存在することを確認

#### 2.4 テストデータ作成（オプション）

**テストデータスクリプト** (手動で実行):

```bash
# Prisma Studioでテストデータを作成
# 1. User テーブルに管理者ユーザーを作成
# 2. Post テーブルに期限到達提案を作成
```

**または、以下のSQLを実行**:

```sql
-- テストユーザー作成
INSERT INTO "User" (id, name, email, "employeeId", department, "accountType", "permissionLevel", "facilityId")
VALUES
  ('test-user-001', 'テストユーザー1', 'test1@example.com', 'EMP001', '内科', 'staff', 10, 'facility-001'),
  ('test-admin-001', 'テスト管理者', 'admin@example.com', 'ADMIN001', '管理部', 'admin', 15, 'facility-001');

-- 期限到達提案作成（昨日が期限、スコア未達成）
INSERT INTO "Post" (id, content, "authorId", "proposalType", "agendaScore", "agendaLevel", "agendaVotingDeadline", "agendaStatus", status)
VALUES
  ('test-post-001', 'テスト提案1: 部署レベル・期限切れ・未達成', 'test-user-001', 'improvement', 50, 'DEPT_AGENDA', CURRENT_TIMESTAMP - INTERVAL '1 day', 'FACILITY_VOTE_EXPIRED_PENDING_DECISION', 'published'),
  ('test-post-002', 'テスト提案2: 施設レベル・期限切れ・未達成', 'test-user-001', 'new_system', 200, 'FACILITY_AGENDA', CURRENT_TIMESTAMP - INTERVAL '2 days', 'FACILITY_VOTE_EXPIRED_PENDING_DECISION', 'published');
```

---

### ステップ3: テスト実行（15分）

#### 3.1 統合テスト実行

```bash
# 期限切れエスカレーションAPIテスト実行
npm run test -- expired-escalation-api.test.ts
```

**期待される結果**:
```
PASS  src/tests/expired-escalation-api.test.ts
  期限到達提案取得 - データ抽出ロジック
    ✓ 期限到達かつ目標スコア未達の提案のみを取得できる
    ✓ 提案データに必要なフィールドがすべて含まれている
    ✓ 部署レベルの提案が正しく抽出される（目標100点）
    ✓ 施設レベルの提案が正しく抽出される（目標300点）
    ✓ 法人レベルの提案が正しく抽出される（目標600点）
  判断記録 - データ保存ロジック
    ✓ 現在のレベルで承認の判断を記録できる
    ✓ ダウングレードの判断を記録できる
    ✓ 不採用の判断を記録できる
    ✓ Postのステータスが正しく更新される（承認）
    ✓ Postのステータスが正しく更新される（ダウングレード）
    ✓ Postのステータスが正しく更新される（不採用）
  バリデーション
    ✓ 判断理由が10文字未満の場合はエラー
    ✓ 判断理由が10文字以上の場合は正常
    ✓ 不正な判断内容はエラー
  E2E: 期限到達提案の判断フロー
    ✓ 完全な判断フローが正常に動作する
  統合テストサマリー
    ✓ 全機能が正常に動作する

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

#### 3.2 テスト失敗時の対応

**エラーケース1**: データベース接続エラー
```
Error: Can't reach database server
```

**対処法**:
1. データベースが起動していることを確認
2. `DATABASE_URL` 環境変数が正しいことを確認
3. `npx prisma migrate dev` を実行

**エラーケース2**: テーブル未作成エラー
```
Error: Table 'ExpiredEscalationDecision' does not exist
```

**対処法**:
1. `npx prisma migrate dev` を実行
2. `npx prisma db push` を実行（開発環境の場合）

**エラーケース3**: テストデータ重複エラー
```
Error: Unique constraint failed on the fields: (`id`)
```

**対処法**:
1. テストデータをクリーンアップ
2. テストを再実行

---

### ステップ4: APIサーバー起動・確認（10分）

#### 4.1 サーバー起動

```bash
# 開発サーバー起動
npm run dev
```

**期待される出力**:
```
====================================
🚀 VoiceDrive API Server
====================================
Environment: development
Port: 4000
Health: http://localhost:4000/health
API Base: http://localhost:4000/api
====================================
```

**別のターミナルで以下を実行**:

#### 4.2 ヘルスチェック

```bash
curl http://localhost:4000/health
```

**期待される出力**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T12:00:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

---

### ステップ5: API動作確認（15分）

#### 5.1 期限到達提案一覧取得API

```bash
curl -X GET "http://localhost:4000/api/agenda/expired-escalation-proposals?userId=test-user-001&permissionLevel=10&limit=10&offset=0" \
  -H "Content-Type: application/json"
```

**期待されるレスポンス**:
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "test-post-001",
        "content": "テスト提案1: 部署レベル・期限切れ・未達成",
        "agendaScore": 50,
        "agendaLevel": "DEPT_AGENDA",
        "proposalType": "improvement",
        "agendaVotingDeadline": "2025-10-20T00:00:00.000Z",
        "author": {
          "id": "test-user-001",
          "name": "テストユーザー1",
          "department": "内科"
        }
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**確認項目**:
- ✅ ステータスコード: 200
- ✅ `success: true`
- ✅ `proposals` 配列が返される
- ✅ 提案データに必要なフィールドが含まれる
- ✅ ページネーション情報が正しい

#### 5.2 判断記録API

```bash
curl -X POST "http://localhost:4000/api/agenda/expired-escalation-decisions" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-admin-001" \
  -d '{
    "postId": "test-post-001",
    "decision": "approve_at_current_level",
    "decisionReason": "部署レベルで承認します。十分な議論がありました。",
    "currentScore": 50,
    "targetScore": 100,
    "agendaLevel": "DEPT_AGENDA",
    "proposalType": "improvement",
    "department": "内科"
  }'
```

**期待されるレスポンス**:
```json
{
  "success": true,
  "message": "判断を記録しました",
  "data": {
    "decisionId": "clx123abc..."
  }
}
```

**確認項目**:
- ✅ ステータスコード: 200
- ✅ `success: true`
- ✅ `decisionId` が返される

#### 5.3 データベース確認

```bash
# Prisma Studioで確認
npx prisma studio
```

**確認項目**:
1. `ExpiredEscalationDecision` テーブルに新しいレコードが追加されている
   - `decision`: "approve_at_current_level"
   - `decisionReason`: "部署レベルで承認します..."
   - `achievementRate`: 50.0
   - `daysOverdue`: 1以上

2. `Post` テーブルの該当レコードが更新されている
   - `agendaStatus`: "APPROVED_AS_DEPT_AGENDA"
   - `agendaDecisionBy`: "test-admin-001"
   - `agendaDecisionAt`: タイムスタンプが設定されている

---

### ステップ6: フロントエンド統合確認（20分）

#### 6.1 フロントエンド起動

**新しいターミナルで**:
```bash
npm run dev
```

**期待される出力**:
```
VITE ready in 1234 ms

➜  Local:   http://localhost:3001/
➜  Network: use --host to expose
```

#### 6.2 ページアクセス

**ブラウザで以下のURLにアクセス**:
```
http://localhost:3001/expired-escalation-proposals
```

**確認項目**:

##### 6.2.1 ページ表示
- ✅ ページタイトル: 「期限到達提案一覧」が表示される
- ✅ 説明文が表示される
- ✅ サマリーカード（判断待ち提案数）が表示される

##### 6.2.2 提案カード
- ✅ 提案カードが表示される
- ✅ 議題レベルバッジが表示される
- ✅ 提案タイプバッジが表示される
- ✅ 期限超過日数バッジが表示される（例: "期限超過 1日"）
- ✅ 提案内容が表示される
- ✅ 提案者情報が表示される
- ✅ スコア表示（現在点/目標点）が表示される
- ✅ 達成率が表示される（例: "50%"）
- ✅ プログレスバーが表示される
- ✅ 「判断」ボタンが表示される

##### 6.2.3 判断モーダル
1. 「判断」ボタンをクリック
   - ✅ モーダルが開く
   - ✅ タイトル: 「期限到達提案の判断」が表示される

2. モーダルの内容確認
   - ✅ 提案情報が表示される
   - ✅ 議題レベルバッジが表示される
   - ✅ スコア情報が表示される（現在/目標）
   - ✅ 達成率バッジが表示される
   - ✅ プログレスバーが表示される

3. 判断選択
   - ✅ 3つの判断オプションが表示される
     1. ✅ 現在のレベルで承認
     2. 🔽 ダウングレード
     3. ❌ 不採用
   - ✅ ラジオボタンで選択できる

4. 判断理由入力
   - ✅ テキストエリアが表示される
   - ✅ プレースホルダー: 「判断理由を入力してください（10文字以上）」
   - ✅ 文字数カウンターが表示される

5. バリデーション
   - ❌ 判断未選択 + 確定ボタン → エラー表示
   - ❌ 判断理由9文字 + 確定ボタン → エラー表示
   - ✅ 判断選択 + 理由10文字以上 + 確定ボタン → 成功

6. 判断確定
   - ✅ 「判断を確定」ボタンをクリック
   - ✅ ローディング表示
   - ✅ 成功メッセージが表示される
   - ✅ モーダルが閉じる
   - ✅ 提案一覧が自動更新される
   - ✅ 判断した提案が一覧から消える

---

### ステップ7: E2E動作確認（20分）

#### 7.1 シナリオ1: 部署レベル提案の承認

**準備**:
1. テストデータ作成（部署レベル、スコア50/100、期限切れ）

**手順**:
1. http://localhost:3001/expired-escalation-proposals にアクセス
2. 提案カードを確認
   - 議題レベル: "部署議題"
   - スコア: "50 / 100"
   - 達成率: "50%"
   - 期限超過日数: "1日"
3. 「判断」ボタンをクリック
4. モーダルで判断選択
   - 「現在のレベルで承認」を選択
   - 理由: "部署レベルで承認します。十分な議論がありました。"
5. 「判断を確定」ボタンをクリック
6. 成功を確認
   - 成功メッセージ表示
   - モーダルが閉じる
   - 提案一覧から削除される

**期待される結果**:
- ✅ 判断が記録される
- ✅ ExpiredEscalationDecisionテーブルにレコード追加
- ✅ Postのステータスが "APPROVED_AS_DEPT_AGENDA" に更新

#### 7.2 シナリオ2: 施設レベル提案のダウングレード

**準備**:
1. テストデータ作成（施設レベル、スコア200/300、期限切れ）

**手順**:
1. 提案一覧で施設レベル提案を確認
2. 「判断」ボタンをクリック
3. モーダルで判断選択
   - 「ダウングレード」を選択
   - 理由: "施設レベルには達していないため、部署レベルに降格します。"
4. 「判断を確定」ボタンをクリック

**期待される結果**:
- ✅ 判断が記録される
- ✅ Postのステータスが "DOWNGRADED_TO_DEPT_AGENDA" に更新

#### 7.3 シナリオ3: 法人レベル提案の不採用

**準備**:
1. テストデータ作成（法人レベル、スコア500/600、期限切れ）

**手順**:
1. 提案一覧で法人レベル提案を確認
2. 「判断」ボタンをクリック
3. モーダルで判断選択
   - 「不採用」を選択
   - 理由: "法人レベルの提案としては不十分です。不採用とします。"
4. 「判断を確定」ボタンをクリック

**期待される結果**:
- ✅ 判断が記録される
- ✅ Postのステータスが "REJECTED_AFTER_FACILITY_VOTE" に更新

---

### ステップ8: 本番デプロイ（15分）

#### 8.1 ビルド確認

```bash
# TypeScriptコンパイル
npm run type-check

# ビルド
npm run build
```

**期待される結果**: エラーなくビルド完了

#### 8.2 プレビュー

```bash
npm run preview
```

**確認**:
- http://localhost:4173/expired-escalation-proposals にアクセス
- 本番ビルドで動作することを確認

#### 8.3 Git commit

```bash
# 変更を確認
git status

# 追加
git add .

# コミット
git commit -m "feat: 期限切れエスカレーション提案API実装完了

- API実装: GET/POST /api/agenda/expired-escalation-*
- テスト実装: 統合テスト15ケース
- ドキュメント: DB要件分析、実装報告書、作業再開指示書

Refs: #期限切れエスカレーション"
```

#### 8.4 デプロイ（Vercel）

```bash
# デプロイ
vercel --prod

# または
npm run deploy
```

**確認**:
- デプロイ完了メッセージを確認
- 本番URLにアクセスして動作確認

---

## ✅ 最終チェックリスト

### 環境確認
- [ ] プロジェクトディレクトリ確認完了
- [ ] 依存パッケージインストール完了
- [ ] 環境変数設定完了

### データベース
- [ ] Prismaクライアント生成完了
- [ ] マイグレーション適用完了
- [ ] テーブル存在確認完了
- [ ] テストデータ作成完了（オプション）

### テスト
- [ ] 統合テスト15ケースすべて成功

### API
- [ ] サーバー起動成功
- [ ] ヘルスチェック成功
- [ ] 期限到達提案一覧取得API動作確認
- [ ] 判断記録API動作確認
- [ ] データベース更新確認

### フロントエンド
- [ ] ページ表示確認
- [ ] 提案カード表示確認
- [ ] 判断モーダル表示確認
- [ ] 判断選択確認
- [ ] バリデーション確認
- [ ] 判断確定・一覧更新確認

### E2E
- [ ] シナリオ1: 部署レベル承認 成功
- [ ] シナリオ2: 施設レベルダウングレード 成功
- [ ] シナリオ3: 法人レベル不採用 成功

### デプロイ
- [ ] ビルド確認完了
- [ ] プレビュー確認完了
- [ ] Git commit完了
- [ ] 本番デプロイ完了

---

## 🚨 トラブルシューティング

### 問題1: APIサーバーが起動しない

**症状**:
```
Error: Cannot find module './routes/expired-escalation.routes'
```

**原因**: TypeScriptコンパイルが必要

**対処法**:
```bash
npm run build
npm run dev
```

---

### 問題2: テストが失敗する

**症状**:
```
Error: Table 'ExpiredEscalationDecision' does not exist
```

**原因**: マイグレーション未実行

**対処法**:
```bash
npx prisma migrate dev
npx prisma generate
npm run test -- expired-escalation-api.test.ts
```

---

### 問題3: フロントエンドでAPIエラー

**症状**:
```
Network Error: Failed to fetch
```

**原因**: APIサーバーが起動していない

**対処法**:
1. APIサーバーを起動
   ```bash
   npm run dev
   ```
2. CORS設定を確認（`src/api/server.ts` 40-53行目）

---

### 問題4: モーダルが開かない

**症状**: 「判断」ボタンをクリックしてもモーダルが表示されない

**原因**: フロントエンド実装の確認が必要

**対処法**:
1. ブラウザのコンソールでエラー確認
2. `ExpiredEscalationProposalsPage.tsx` の255-261行目を確認
3. `ExpiredEscalationDecisionModal.tsx` が正しくインポートされているか確認

---

## 📞 サポート

### 質問・問い合わせ

**技術的な質問**:
- プロジェクトリード
- Slack: #phase2-integration

**緊急時**:
- エラーログを添付
- 再現手順を記載
- 環境情報を提供

---

## 🔗 関連ドキュメント

### 必読
- [expired-escalation-implementation-complete_20251021.md](./expired-escalation-implementation-complete_20251021.md) - 実装完了報告書
- [expired-escalation-api-implementation-report_20251021.md](./expired-escalation-api-implementation-report_20251021.md) - 詳細実装報告書

### 参考
- [expired-escalation-proposals_DB要件分析_20251021.md](./expired-escalation-proposals_DB要件分析_20251021.md) - DB要件分析
- [expired-escalation-proposals暫定マスターリスト_20251021.md](./expired-escalation-proposals暫定マスターリスト_20251021.md) - マスターリスト

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
想定使用日: DB構築完了後
推定所要時間: 1-2時間

**作業完了後**: 実装完了報告書を更新し、本番デプロイ完了を記録してください。
