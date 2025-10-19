# VoiceDrive MySQL移行 + Idea Tracking統合提案書

**文書番号**: PROP-IT-2025-1019-001
**提案日**: 2025年10月19日
**提案者**: VoiceDriveチーム
**宛先**: 医療システムチーム
**件名**: Phase 1.2（MySQL移行）とIdea Tracking Phase 1の統合実施提案
**重要度**: 🟡 中
**ステータス**: 提案中

---

## 📋 エグゼクティブサマリー

Phase 1.2（VoiceDrive MySQL移行、10/6-10/12実施予定）において、**Idea Tracking (Project Mode)** のPhase 1（スキーマ拡張）を同時実施することを提案します。

**核心メリット**:
- ✅ 一度のマイグレーションで完結（複数回のDB変更を回避）
- ✅ 医療システム側の追加作業ゼロ
- ✅ ダウンタイム最小化
- ✅ 開発効率向上

**医療システムチームへの影響**: **なし**（確認のみ）

---

## 🎯 提案内容

### 現在の計画（Phase 1.2のみ）

**Week 6（10/6-10/12）**:
```
VoiceDriveチーム作業:
- 10/6-10/7: MySQL環境準備
- 10/8-10/9: SQLite → MySQL移行
- 10/10-10/11: 統合テスト再実施
```

### 提案後の計画（Phase 1.2 + Idea Tracking Phase 1統合）

**Week 6（10/6-10/12）**:
```
VoiceDriveチーム作業:
- 10/6-10/7: MySQL環境準備 + Idea Tracking schema.prisma拡張
- 10/8-10/9: SQLite → MySQL移行 + Idea Tracking DB拡張
- 10/10-10/11: 統合テスト再実施 + Idea Tracking確認
```

**追加所要時間**: 合計2時間（Week 6の作業範囲内）

---

## 🔄 統合実施の詳細

### 10/6-10/7（環境準備）

**既存作業**:
- MySQL接続情報取得
- .env.production.mysql設定

**追加作業**（+30分）:
- schema.prismaにIdea Tracking用フィールド追加
  - Post.projectScore（Int）
  - Post.currentProjectLevelStartedAt（DateTime）
  - Post.lastProjectLevelUpgrade（DateTime）
  - Post.totalEngagements（Int）
  - Post.stronglySupportCount〜stronglyOpposeCount（Int×5）
- ProjectLevelHistoryテーブル追加

### 10/8-10/9（DB移行）

**既存作業**:
- SQLiteデータエクスポート
- MySQLスキーマ作成
- データインポート

**追加作業**（同時実施、追加時間なし）:
- Idea Tracking用フィールドもマイグレーションに含める
- ProjectLevelHistoryテーブル作成

### 10/10-10/11（統合テスト）

**既存作業**:
- MySQL接続確認
- 基本CRUD確認
- パフォーマンステスト

**追加作業**（+1時間）:
- projectScore, projectLevelフィールド書き込み確認
- ProjectLevelHistory書き込み確認
- インデックス動作確認

---

## 📊 統合schema.prisma（変更箇所）

### Postテーブル拡張

```prisma
model Post {
  // ... 既存フィールド ...

  // 議題モード用（既存）
  agendaScore        Int?                        @default(0)
  agendaLevel        String?

  // 🆕 プロジェクトモード用（Idea Tracking追加）
  projectScore                      Int?      @default(0) @map("project_score")
  projectLevel                      String?   @map("project_level")  // ✅ 既存あり
  currentProjectLevelStartedAt      DateTime? @map("current_project_level_started_at")
  lastProjectLevelUpgrade           DateTime? @map("last_project_level_upgrade")

  // エンゲージメント統計（キャッシュ）
  totalEngagements                  Int       @default(0) @map("total_engagements")
  stronglySupportCount              Int       @default(0) @map("strongly_support_count")
  supportCount                      Int       @default(0) @map("support_count")
  neutralCount                      Int       @default(0) @map("neutral_count")
  opposeCount                       Int       @default(0) @map("oppose_count")
  stronglyOpposeCount               Int       @default(0) @map("strongly_oppose_count")

  // リレーション
  projectLevelHistory  ProjectLevelHistory[]

  // インデックス
  @@index([projectScore])
  @@index([currentProjectLevelStartedAt])
}
```

### ProjectLevelHistoryテーブル新規作成

```prisma
model ProjectLevelHistory {
  id                String    @id @default(cuid())
  postId            String    @map("post_id")
  fromLevel         String?   @map("from_from_level")
  toLevel           String    @map("to_level")
  fromScore         Int?      @map("from_score")
  toScore           Int       @map("to_score")
  triggeredBy       String?   @map("triggered_by")
  triggeringUserId  String?   @map("triggering_user_id")
  upgradedAt        DateTime  @default(now()) @map("upgraded_at")
  notes             String?
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  post              Post      @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([toLevel])
  @@index([upgradedAt])
  @@index([triggeredBy])
  @@map("project_level_history")
}
```

**データ量試算**:
- Postテーブル: +10フィールド（既存テーブルへの追加）
- ProjectLevelHistoryテーブル: 約10,000レコード（5年間想定）
- 推定データ量: 約5MB

---

## ✅ 医療システムチームへの影響

### 追加作業: **なし**

| 作業カテゴリ | 医療チーム | VoiceDriveチーム |
|------------|-----------|-----------------|
| **DB設計** | 確認のみ | スキーマ拡張実施 |
| **マイグレーション** | 不要 | 統合実施 |
| **API実装** | 不要（既存API流用） | Phase 2以降で実装 |
| **テスト** | 結果確認のみ | テスト実施 |

### 確認事項のみ

**10/11（金）15:00 共同確認ミーティング**で以下を確認：

1. ✅ MySQL接続確認（既存確認事項）
2. ✅ データ移行完了確認（既存確認事項）
3. ✅ 統合テスト結果確認（既存確認事項）
4. 🆕 **Idea Tracking用フィールド確認**（追加1分）
   - projectScoreフィールド存在確認
   - ProjectLevelHistoryテーブル存在確認
5. ✅ パフォーマンス確認（既存確認事項）

---

## 🎯 統合実施の理由

### 1. **一度のマイグレーションで完結**

**現状のリスク**（統合しない場合）:
- Week 6: MySQL移行
- Week 8-10（別途）: Idea Tracking Phase 1実施
- **合計2回のマイグレーション** → データ不整合リスク

**統合後のメリット**:
- Week 6: MySQL移行 + Idea Tracking Phase 1
- **1回のマイグレーションで完結** → リスク最小化

### 2. **医療システム側の追加作業ゼロ**

**Idea Trackingの特性**:
- ✅ 医療システム側のDB追加不要
- ✅ 医療システム側の新規API実装不要
- ✅ 既存API（職員情報、権限レベルマスタ）のみで対応可能

**参照**: 医療システムチーム作成文書
- [idea-tracking-project-mode_医療システム確認結果_20251019.md](./idea-tracking-project-mode_医療システム確認結果_20251019.md)
- [IdeaTracking_Implementation_Strategy_20251019.md](./IdeaTracking_Implementation_Strategy_20251019.md)

### 3. **開発効率向上**

| 項目 | 別々実施 | 統合実施 | 削減効果 |
|-----|---------|---------|---------|
| schema.prisma変更回数 | 2回 | 1回 | 50%削減 |
| Prisma Client再生成 | 2回 | 1回 | 50%削減 |
| マイグレーション実行 | 2回 | 1回 | 50%削減 |
| 統合テスト実施 | 2回 | 1回 | 50%削減 |
| ダウンタイム | 2回分 | 1回分 | 50%削減 |

### 4. **スケジュールへの影響なし**

| Week | 作業内容 | 所要時間 |
|------|---------|---------|
| **Week 6（統合前）** | MySQL移行のみ | 5日間 |
| **Week 6（統合後）** | MySQL移行 + Idea Tracking Phase 1 | **5日間**（変更なし） |

**理由**: Idea Tracking Phase 1の追加作業（合計2時間）はWeek 6の作業時間内で吸収可能

---

## 📅 統合スケジュール詳細

### Day 1-2（10/6-10/7、環境準備）

**既存作業**（5時間）:
```bash
# MySQL接続情報取得
MYSQL_HOST=<UNIFIED_INSTANCE_IP>
MYSQL_PORT=3306
MYSQL_DATABASE=voicedrive_production
MYSQL_USER=voicedrive_user
MYSQL_PASSWORD=<secure_password>

# .env.production.mysql設定
cd voicedrive-v100
cat > .env.production.mysql << 'EOF'
DB_TYPE=mysql
MYSQL_HOST=<UNIFIED_INSTANCE_IP>
...
EOF
```

**🆕 追加作業**（+30分）:
```bash
# schema.prisma拡張
cd voicedrive-v100/prisma

# Postテーブル拡張（10フィールド追加）
nano schema.prisma

# ProjectLevelHistoryテーブル追加
nano schema.prisma

# マイグレーションファイル生成（実行は10/8）
npx prisma migrate dev --create-only --name add-project-tracking
```

### Day 3-4（10/8-10/9、DB移行）

**既存作業**（10時間）:
```bash
# SQLiteからデータエクスポート
npm run db:export:sqlite

# MySQLスキーマ作成
npm run db:migrate:mysql

# データインポート
npm run db:import:mysql

# データ整合性確認
npm run db:verify:mysql
```

**🆕 追加作業**（同時実施、追加時間ゼロ）:
```bash
# 上記マイグレーションにIdea Tracking用テーブル・フィールドが自動的に含まれる
# ProjectLevelHistoryテーブルが自動作成される
# Postテーブルに10フィールドが自動追加される
```

### Day 5-6（10/10-10/11、統合テスト）

**既存作業**（8時間）:
```bash
# MySQL接続テスト
npm run test:db:connection:mysql

# 基本CRUD操作テスト
npm run test:db:crud:mysql

# 統合テスト再実施
npm run test:integration:auth
npm run test:integration:post
npm run test:integration:notification
npm run test:integration:report

# パフォーマンステスト
npm run test:performance:mysql
```

**🆕 追加作業**（+1時間）:
```bash
# Idea Trackingフィールド確認
npm run test:idea-tracking:fields

# ProjectLevelHistory書き込み確認
npm run test:idea-tracking:history

# インデックス動作確認
npm run test:idea-tracking:performance
```

---

## 🔍 共同確認ミーティング（10/11金曜15:00）

### 既存確認事項（Phase 1.2）

1. ✅ MySQL接続確認（医療チーム）
2. ✅ データ移行完了確認（VoiceDriveチーム）
3. ✅ 統合テスト結果確認（VoiceDriveチーム）
4. ✅ パフォーマンス確認（両チーム）

### 🆕 追加確認事項（Idea Tracking）

**所要時間**: +1分

5. 🆕 **Idea Tracking用フィールド確認**（VoiceDriveチーム報告）
   - projectScoreフィールド存在確認
   - currentProjectLevelStartedAt存在確認
   - ProjectLevelHistoryテーブル存在確認
   - インデックス動作確認

**確認方法**:
```sql
-- MySQL接続後
USE voicedrive_production;

-- Postテーブル確認
DESCRIBE posts;
-- → project_score, current_project_level_started_at 等が存在するか

-- ProjectLevelHistoryテーブル確認
DESCRIBE project_level_history;

-- インデックス確認
SHOW INDEX FROM posts WHERE Key_name LIKE '%project%';
SHOW INDEX FROM project_level_history;
```

**期待結果**:
- ✅ Postテーブルに10フィールド追加済み
- ✅ ProjectLevelHistoryテーブル作成済み
- ✅ インデックス作成済み

---

## 📊 成功指標

### 技術指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| **MySQL移行成功率** | 100% | データ整合性チェック |
| **Idea Trackingフィールド作成成功率** | 100% | スキーマ確認 |
| **ProjectLevelHistory作成成功率** | 100% | テーブル存在確認 |
| **統合テスト成功率** | 100% | テストスイート実行 |
| **MySQL応答時間** | < 50ms（95%） | パフォーマンステスト |
| **Idea Trackingクエリ応答時間** | < 100ms（95%） | インデックステスト |

### ビジネス指標

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| **マイグレーション完了時刻** | 10/9 18:00以内 | 作業ログ |
| **ダウンタイム** | < 2時間 | システムログ |
| **データ損失** | 0件 | データ整合性チェック |

---

## 🚨 リスクと対策

### 想定リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| schema.prisma拡張ミス | 🟡 MEDIUM | 事前レビュー、バックアップ保持 |
| マイグレーション失敗 | 🔴 HIGH | SQLiteバックアップ保持、ロールバック手順準備 |
| テスト追加による遅延 | 🟢 LOW | +1時間のバッファ確保済み |
| 統合による複雑化 | 🟢 LOW | 明確な作業分離、ドキュメント整備 |

### ロールバック手順

万が一、統合実施時に問題が発生した場合：

```bash
# 1. MySQLマイグレーションをロールバック
npx prisma migrate reset

# 2. Idea Tracking用フィールドを削除したschema.prismaに戻す
git checkout schema.prisma

# 3. 再度MySQL移行のみ実施（Idea Trackingなし）
npx prisma migrate dev --name mysql-migration-only
```

---

## 💰 コスト影響

### 開発工数

| 項目 | 別々実施 | 統合実施 | 削減効果 |
|-----|---------|---------|---------|
| **Phase 1.2（MySQL移行）** | 6日間 | 6日間 | - |
| **Idea Tracking Phase 1** | 2日間（別途） | 0日間（統合） | **2日間削減** |
| **合計** | 8日間 | **6日間** | **25%削減** |

### 開発コスト

| 項目 | 別々実施 | 統合実施 | 削減効果 |
|-----|---------|---------|---------|
| **VoiceDriveチーム人件費** | ¥400,000 | ¥300,000 | **¥100,000削減** |
| **医療システムチーム人件費** | ¥0 | ¥0 | - |
| **合計** | ¥400,000 | **¥300,000** | **25%削減** |

### 運用コスト

| 項目 | 影響 |
|-----|------|
| Lightsail統合インスタンス（16GB） | 変更なし（¥0） |
| MySQLストレージ増加 | +5MB（無視できるレベル、¥0） |

---

## 📝 関連ドキュメント

### Idea Tracking関連

**VoiceDriveチーム作成**:
- [idea-tracking_DB要件分析_20251018.md](./idea-tracking_DB要件分析_20251018.md)
- [idea-tracking暫定マスターリスト_20251018.md](./idea-tracking暫定マスターリスト_20251018.md)

**医療システムチーム作成**:
- [idea-tracking-project-mode_医療システム確認結果_20251019.md](./idea-tracking-project-mode_医療システム確認結果_20251019.md)
- [IdeaTracking_Implementation_Strategy_20251019.md](./IdeaTracking_Implementation_Strategy_20251019.md)

### Phase 1.2関連

**マスタープラン**:
- [AWS_Lightsail統合実装マスタープラン_20251010.md](./AWS_Lightsail統合実装マスタープラン_20251010.md) - Phase 1.2セクション

### 共通

- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 🔄 承認プロセス

### 承認フロー

1. **VoiceDriveチーム内承認**（10/19完了予定）
2. **医療システムチームへ提案提出**（本文書）
3. **医療システムチーム確認**（回答期限: 10/22）
   - Option A: ✅ 承認 → 統合実施
   - Option B: ❌ 不承認 → 別々実施（従来通り）
   - Option C: 🔄 条件付き承認 → 調整後実施
4. **最終決定**（10/23）

### 回答フォーマット

医療システムチームから以下の形式で回答をお願いします：

```markdown
## 医療システムチーム回答

**回答日**: 2025年10月XX日
**回答者**: [担当者名]

### 承認状況
- [ ] Option A: ✅ 承認（統合実施に同意）
- [ ] Option B: ❌ 不承認（別々実施を推奨）
- [ ] Option C: 🔄 条件付き承認（以下の条件で同意）

### 条件（Option Cの場合）
- 条件1: ...
- 条件2: ...

### コメント・懸念事項
- ...

### 確認事項
- 10/11ミーティングの参加可否: [ ] 可 [ ] 不可
- 追加確認事項の有無: [ ] あり（以下に記載） [ ] なし
```

---

## 📞 連絡先

**VoiceDriveチーム**:
- Slack: `#phase2-integration`
- MCPサーバー: `mcp-shared/docs/`
- 担当者: VoiceDriveプロジェクトリーダー

**質問・確認事項**:
- 統合実施の可否
- 10/11ミーティング議題の追加可否
- その他技術的質問

---

## ✅ 次のアクション

### VoiceDriveチーム（即時）

1. ⬜ 本提案書を医療システムチームに提出（10/19）
2. ⬜ schema.prisma拡張案の最終レビュー（10/20）
3. ⬜ マイグレーションテストの準備（10/21-10/22）

### 医療システムチーム（回答期限: 10/22）

1. ⬜ 本提案の確認・検討
2. ⬜ 承認可否の回答
3. ⬜ 10/11ミーティング参加可否の確認

### 両チーム（承認後）

1. ⬜ Week 6統合実施の最終確認（10/23）
2. ⬜ 10/6から統合作業開始

---

**本提案について、ご確認・ご検討のほどよろしくお願いいたします。**

**VoiceDriveチーム**
2025年10月19日
