# VoiceDrive MySQL移行完了 & 職員カルテシステム対応依頼

**文書番号**: VD-MCP-2025-1008-001
**作成日**: 2025年10月8日
**作成者**: VoiceDriveチーム
**宛先**: 医療システムチーム（職員カルテシステム）
**重要度**: 🟡 中（Week 6作業に影響）
**回答期限**: 2025年10月10日

---

## 📢 要約

VoiceDrive側のMySQL移行準備が完了しました（コード実装完了、環境構築待ち）。
職員カルテシステムでも同様の対応をお願いいたします。

**目的**: ライトセイル統合環境でのMySQL共通基盤確立

---

## 1. VoiceDrive側完了内容

### 1.1 実施済み項目（2025年10月8日完了）

| 項目 | 内容 | コミット | 状態 |
|------|------|---------|------|
| **環境変数バリデーション** | `validateEnv.ts` 実装 | 74fb6cc | ✅ 完了 |
| **Prisma Schema変更** | `provider = "mysql"` | f9db560 | ✅ 完了 |
| **環境変数設定** | `.env`, `.env.production` 更新 | f9db560 | ✅ 完了 |
| **移行ガイド作成** | `MySQL_Migration_Guide.md` | 0b17d07 | ✅ 完了 |
| **完了報告書** | 準備完了報告 | 3be6b51 | ✅ 完了 |

### 1.2 成果物

| ファイル名 | 行数 | 説明 |
|-----------|------|------|
| `src/config/validateEnv.ts` | 172行 | 環境変数バリデーション |
| `docs/MySQL_Migration_Guide.md` | 292行 | 移行手順書（両チーム共通） |
| `docs/VoiceDrive_MySQL_Migration_Preparation_Report_20251008.md` | 294行 | 完了報告書 |

**合計**: 758行の実装 + ドキュメント

### 1.3 作業時間

- **予定**: 45分
- **実績**: 45分
- **差異**: なし

---

## 2. 職員カルテシステムへの依頼内容

### 2.1 依頼概要

VoiceDriveと同様の対応を職員カルテシステムでも実施いただきたく、お願い申し上げます。

**目的**:
- ✅ ライトセイル統合環境での運用準備
- ✅ MySQL共通データベース基盤の確立
- ✅ Phase 2（SSO統合）の技術的準備

### 2.2 具体的な作業内容

#### ① 環境変数バリデーション実装（15分）

**ファイル**: `src/config/validateEnv.ts`（新規作成）

**参考実装**: `voicedrive-v100/src/config/validateEnv.ts`

**必須環境変数**（職員カルテシステム用）:
```typescript
const envConfig = {
  DATABASE_URL: {
    required: true,
    validate: (value) => value.startsWith('mysql://')
  },
  JWT_SECRET: {
    required: process.env.NODE_ENV === 'production',
    validate: (value) => value.length >= 32
  },
  VOICEDRIVE_API_URL: {
    required: true
  },
  VOICEDRIVE_API_TOKEN: {
    required: true
  },
  LLM_OLLAMA_ENDPOINT: {
    required: false,  // Phase 1.5実装後に必須化
    defaultValue: 'http://localhost:11434'
  }
};
```

**起動時呼び出し**（例）:
```typescript
// src/api/server.ts の先頭に追加
import { validateEnvironment } from '../config/validateEnv';

// 環境変数バリデーション（起動前にチェック）
validateEnvironment();
```

**効果**:
- ❌ Before: 本番環境で設定ミス → サービス開始後に障害発生
- ✅ After: 起動時エラー検出 → 即座に修正（1分）

---

#### ② Prisma Schema変更（5分）

**ファイル**: `prisma/schema.prisma`

**変更内容**:
```diff
datasource db {
-  provider = "sqlite"
+  provider = "mysql"
   url      = env("DATABASE_URL")
}
```

---

#### ③ 環境変数設定（5分）

**ファイル**: `.env`（開発環境）

```env
# MySQL接続（ローカル開発用）
DATABASE_URL="mysql://root:password@localhost:3306/staff_card_dev"

# SQLite（旧設定・バックアップ用）
# DATABASE_URL="file:./dev.db"
```

**ファイル**: `.env.production`（本番環境）

```env
# MySQL接続（AWS Lightsail統合環境）
DATABASE_URL="mysql://staff_card_user:${DB_PASSWORD}@medical-integrated.lightsail.aws:3306/staff_card_prod"
```

---

#### ④ マイグレーション実行（環境構築後、10分）

```bash
# 既存SQLiteマイグレーション削除
rm -rf prisma/migrations/
rm prisma/dev.db

# MySQLマイグレーション初期化
npx prisma migrate dev --name init
npx prisma generate
```

**⚠️ 注意**: MySQL環境構築後に実施

---

#### ⑤ 統合テスト実行（環境構築後、30分）

```bash
npm run test:integration
```

**期待結果**: 全テスト成功

---

#### ⑥ 開発サーバー起動確認（環境構築後、5分）

```bash
npm run dev
curl http://localhost:3000/api/health
```

**期待されるレスポンス**: `{"status":"healthy"}`

---

### 2.3 総作業時間

**コード実装**: 約25分
**環境構築後作業**: 約45分
**合計**: 約1時間10分

---

## 3. 共同確認ミーティング提案

### 3.1 日時

**2025年10月11日（金）15:00-15:30（30分）**

### 3.2 議題

| 確認項目 | VoiceDrive | 職員カルテ | 確認方法 |
|---------|-----------|-----------|---------|
| **MySQL接続** | ✅ | ✅ | `SHOW DATABASES;` |
| **コード実装完了** | ✅ | ✅ | Gitコミット確認 |
| **環境変数設定** | ✅ | ✅ | `.env`設定確認 |
| **移行ガイド確認** | ✅ | ✅ | ドキュメント確認 |
| **マスタープラン更新** | - | - | Phase 1.2追加 |

### 3.3 成果物

- 両システムMySQL移行準備完了確認書
- マスタープラン更新版（Phase 1.2追加）

---

## 4. マスタープラン更新依頼

### 4.1 追加セクション提案

**Phase 1.2: データベースMySQL統一【新規追加】🆕**

以下の内容をマスタープランに追加いただきたく、お願い申し上げます：

```markdown
## Phase 1.2: データベースMySQL統一【新規追加】🆕

### 実施期間: 1週間（Phase 1.5 Week 6と並行）

### 1.2.1 概要

両システム（VoiceDrive + 職員カルテ）のデータベースをMySQLに統一し、
ライトセイル統合環境での運用準備を完了します。

### 1.2.2 実装内容

#### VoiceDriveチーム
- ✅ 環境変数バリデーション実装（10/8完了）
- ✅ Prisma MySQL移行準備（10/8完了）
- ✅ 移行ガイド作成（10/8完了）
- ⏳ MySQL環境構築後にマイグレーション実行

#### 医療チーム（職員カルテ）
- ⏳ 環境変数バリデーション実装（10/9-10/10予定）
- ⏳ Prisma MySQL移行準備（10/9-10/10予定）
- ⏳ MySQL環境構築後にマイグレーション実行

### 1.2.3 共同確認

- **日時**: 10/11（金）15:00-15:30
- **議題**:
  - MySQL移行準備完了確認
  - 環境構築後の作業フロー確認
  - Phase 2（SSO統合）準備確認

### 1.2.4 成果物

| ドキュメント | ファイル名 | 作成者 | 状態 |
|------------|-----------|--------|------|
| **移行ガイド** | `MySQL_Migration_Guide.md` | VoiceDrive | ✅ 完了 |
| **VoiceDrive完了報告** | `VoiceDrive_MySQL_Migration_Preparation_Report_20251008.md` | VoiceDrive | ✅ 完了 |
| **職員カルテ完了報告** | `StaffCard_MySQL_Migration_Preparation_Report_202510xx.md` | 医療チーム | ⏳ 予定 |
| **共同確認書** | `MySQL_Migration_Joint_Confirmation_20251011.md` | 両チーム | ⏳ 予定 |

### 1.2.5 MySQL環境構築後のスケジュール

```
Week 6（10/6-10/12）:
├─ 10/6-10/8: 両チームのコード実装（完了）
├─ 10/9-10/10: 医療チーム実装（予定）
├─ 10/10: ライトセイル統合インスタンス構築開始
├─ 10/11 15:00: 共同確認ミーティング
└─ 10/12: マスタープラン更新完了

Week 7（10/13-10/19）:
├─ 統合インスタンス構築完了
├─ MySQL環境セットアップ
├─ 両システムのマイグレーション実行
└─ 統合テスト実行
```

### 1.2.6 技術的確認事項

#### 型変換（SQLite → MySQL）

| Prisma型 | SQLite型 | MySQL型 | Prisma対応 |
|---------|---------|--------|-----------|
| String | TEXT | VARCHAR/TEXT | ✅ 自動変換 |
| Int | INTEGER | INT | ✅ 自動変換 |
| Boolean | INTEGER (0/1) | TINYINT(1) | ✅ 自動変換 |
| Decimal | REAL | DECIMAL(65,30) | ✅ 自動変換 |
| DateTime | TEXT | DATETIME(3) | ✅ 自動変換 |

#### 接続設定確認

**VoiceDrive**:
```env
DATABASE_URL="mysql://voicedrive_user:password@medical-integrated.lightsail.aws:3306/voicedrive_prod"
```

**職員カルテ**:
```env
DATABASE_URL="mysql://staff_card_user:password@medical-integrated.lightsail.aws:3306/staff_card_prod"
```

**統合インスタンス**:
- ホスト: `medical-integrated.lightsail.aws`
- MySQL: 8.0
- メモリ配分: 2.5GB
- 文字コード: utf8mb4
```

### 4.2 更新箇所

- **セクション**: Phase 1の直後（Phase 1.5の前）に挿入
- **更新者**: 医療システムチーム
- **更新日**: 10/11（金）共同確認後

---

## 5. 添付ファイル

| ファイル名 | 内容 | 場所 |
|-----------|------|------|
| `validateEnv.ts` | VoiceDrive実装済み環境変数バリデーション | `voicedrive-v100/src/config/` |
| `MySQL_Migration_Guide.md` | 移行手順書（両チーム共通） | `voicedrive-v100/docs/` |
| `VoiceDrive_MySQL_Migration_Preparation_Report_20251008.md` | VoiceDrive完了報告 | `voicedrive-v100/docs/` |

---

## 6. 次のステップ

### VoiceDriveチーム（完了）
- ✅ MySQL移行準備完了（10/8）
- ✅ 依頼文書作成（10/8）
- ✅ MCP経由で送信（10/8）

### 医療チーム（職員カルテ）（依頼事項）
- ⏳ 本依頼書の確認（10/8-10/9）
- ⏳ validateEnv.ts実装（10/9、15分）
- ⏳ Schema変更 + 環境変数設定（10/9、10分）
- ⏳ 移行ガイド確認（10/9、10分）
- ⏳ 共同確認ミーティング参加（10/11 15:00）
- ⏳ マスタープラン更新（10/11）

---

## 7. 技術サポート

### VoiceDriveチームによるサポート

職員カルテシステムの実装をVoiceDriveチームが全面的にサポートいたします。

**サポート内容**:
- validateEnv.ts実装の技術的質問対応
- MySQL移行時のトラブルシューティング
- 統合テスト実行支援
- コードレビュー

**連絡先**:
- Slack: #lightsail-integration
- メール: voicedrive-tech@example.com
- 緊急時: @voicedrive-lead（Slack DM）

---

## 8. リスク評価

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| 実装遅延 | 低 | 小 | VoiceDriveチームがサポート |
| マイグレーション失敗 | 低 | 中 | ロールバック手順準備済み |
| 環境変数ミス | 中 | 高 | **validateEnv.ts実装で早期検出** |
| 統合テスト失敗 | 低 | 小 | 移行ガイドに詳細手順記載 |

---

## 9. FAQ

### Q1: 実装工数はどのくらいですか？

**A1**: コード実装は約25分、環境構築後の作業は約45分、合計1時間10分です。

### Q2: 既存のSQLiteデータはどうなりますか？

**A2**: バックアップとして残します。本番データではないため、削除しても問題ありません。

### Q3: MySQL環境がまだ構築されていませんが、今実装すべきですか？

**A3**: はい。コード実装（25分）を先に完了し、MySQL環境構築後にマイグレーション実行（45分）を実施します。

### Q4: VoiceDriveの実装を参考にしてもいいですか？

**A4**: もちろんです。`voicedrive-v100/src/config/validateEnv.ts`をそのままコピーして、環境変数名を変更するだけで使用可能です。

### Q5: 統合テストは何をテストしますか？

**A5**: MySQL環境でのデータベース接続、CRUD操作、トランザクション処理等を確認します。詳細は移行ガイドに記載されています。

---

## 10. 承認

| 役割 | 氏名 | 承認日 | 署名 |
|------|------|--------|------|
| VoiceDriveチームリード | - | 2025-10-08 | - |
| 技術担当 | - | 2025-10-08 | - |

---

## 11. 参考資料

| 資料名 | 場所 |
|--------|------|
| VoiceDrive実装コミット履歴 | https://github.com/tokubot83/voicedrive-v100/commits/main |
| MySQL移行ガイド | `voicedrive-v100/docs/MySQL_Migration_Guide.md` |
| VoiceDrive完了報告書 | `voicedrive-v100/docs/VoiceDrive_MySQL_Migration_Preparation_Report_20251008.md` |
| ライトセイル統合マスタープラン | `mcp-shared/docs/AWS_Lightsail_Integration_Master_Plan_20251005.md` |

---

**文書終了**

ご確認のほど、よろしくお願いいたします。

VoiceDriveチーム
2025年10月8日
