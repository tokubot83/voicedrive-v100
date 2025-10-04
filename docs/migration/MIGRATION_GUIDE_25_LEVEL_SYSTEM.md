# 25レベル権限システム マイグレーションガイド

**作成日**: 2025年10月4日
**対象**: VoiceDriveシステム
**目的**: 13レベルから25種類権限システムへの移行

---

## 📋 概要

VoiceDriveシステムを医療職員管理システムの25種類権限レベル体系に統合します。

### 変更内容

| 項目 | 変更前 | 変更後 |
|-----|-------|--------|
| 権限レベル数 | 13種類 | 25種類（18基本 + 4看護職 + 3特別権限） |
| permission_level型 | INT (TINYINT) | DECIMAL(4,1) |
| accountType | 13種類のString | 25種類のString |
| 新規フィールド | - | canPerformLeaderDuty, professionCategory |

---

## 🔄 Step 1: DB設計変更（完了）

### 実施済み項目

✅ **Prismaスキーマ変更**
- `schema.prisma`（SQLite用）を更新
- `schema.mysql.prisma`（MySQL用）を更新

✅ **TypeScript型定義作成**
- `src/types/accountLevel.ts`
- 25種類の権限レベルENUM定義
- レベル↔アカウントタイプのマッピング
- 日本語表示名定義

✅ **ヘルパー関数作成**
- `src/lib/accountLevelHelpers.ts`
- レベル変換関数
- 権限チェック関数
- 旧13レベルマイグレーション関数

✅ **マイグレーションSQL作成**
- `prisma/migrations/add_25_level_system.sql`（SQLite用）
- `prisma/migrations/add_25_level_system_mysql.sql`（MySQL用）

---

## 📝 Step 2: マイグレーション実行手順

### 開発環境（SQLite）

```bash
# 1. バックアップ作成
cp prisma/dev.db prisma/dev.db.backup

# 2. マイグレーションSQL実行
sqlite3 prisma/dev.db < prisma/migrations/add_25_level_system.sql

# 3. Prismaクライアント再生成
npx prisma generate

# 4. データ確認
sqlite3 prisma/dev.db "SELECT id, employeeId, accountType, permissionLevel, canPerformLeaderDuty FROM User LIMIT 5;"
```

### 本番環境（MySQL）

```bash
# 1. バックアップ作成
mysqldump -u voicedrive_app -p voicedrive_medical_integrated > backup_$(date +%Y%m%d).sql

# 2. マイグレーションSQL実行
mysql -u voicedrive_app -p voicedrive_medical_integrated < prisma/migrations/add_25_level_system_mysql.sql

# 3. Prismaクライアント再生成
DATABASE_URL="mysql://..." npx prisma generate

# 4. データ確認
mysql -u voicedrive_app -p -e "SELECT id, employee_id, account_type, permission_level, can_perform_leader_duty FROM users LIMIT 5;" voicedrive_medical_integrated
```

---

## 🔌 Step 3: 医療システムAPI連携実装（次のステップ）

### 必要な実装

1. **医療システムAPIクライアント作成**
   - エンドポイント: `POST /api/v1/calculate-level`
   - レスポンス: `{ accountLevel: number }`

2. **アカウント作成時のAPI呼び出し**
   - 新規ユーザー作成時に医療APIで権限レベルを計算
   - フォールバック機能（API障害時）

3. **既存ユーザーの権限レベル再計算**
   - バッチ処理で全ユーザーの権限レベルを医療APIで再計算

---

## 📊 Step 4: 既存データ移行（次のステップ）

### マイグレーション対象

| 旧account_type | 新account_type | 新permission_level | 備考 |
|---------------|---------------|-------------------|------|
| STAFF | NEW_STAFF | 1.0 | 暫定Level 1（経験年数不明） |
| SUPERVISOR | CHIEF | 6.0 | 主任 |
| HEAD_NURSE | MANAGER | 8.0 | 師長 |
| DEPARTMENT_HEAD | DIRECTOR | 10.0 | 部長 |
| ADMINISTRATIVE_DIRECTOR | ADMINISTRATIVE_DIRECTOR | 11.0 | 変更なし |
| VICE_DIRECTOR | VICE_PRESIDENT | 12.0 | 副院長 |
| HOSPITAL_DIRECTOR | PRESIDENT | 13.0 | 院長 |
| HR_ADMIN_STAFF | HR_STAFF | 14.0 | 人事部門員 |
| CAREER_SUPPORT_STAFF | HR_STAFF | 14.0 | 人事部門員 |
| HR_DEPARTMENT_HEAD | HR_MANAGER | 15.0 | 人事部門長 |
| HR_GENERAL_MANAGER | STRATEGIC_PLANNING_MANAGER | 17.0 | 人事統括部門長 |
| GENERAL_ADMINISTRATIVE_DIRECTOR | BOARD_MEMBER | 18.0 | 事務局長 |
| CHAIRMAN | BOARD_MEMBER | 18.0 | 理事長 |

### ⚠️ 注意事項

- **STAFF（旧Level 1）は暫定的にNEW_STAFF（Level 1）に設定**
- 正確なレベル（1-4の区別）は経験年数が必要
- マイグレーション後、**医療システムAPIで再計算を強く推奨**

---

## 🧪 Step 5: テスト実施

### 単体テスト

```bash
# 型定義のテスト
npm run test src/types/accountLevel.test.ts

# ヘルパー関数のテスト
npm run test src/lib/accountLevelHelpers.test.ts
```

### 統合テスト

```bash
# 医療APIとの連携テスト
npm run test:integration
```

### E2Eテスト

1. 新規ユーザー作成（Level 1-18の各レベル）
2. 看護職リーダー可（Level 1.5-4.5）
3. 特別権限（Level 97-99）
4. 権限チェック機能
5. 旧データの表示確認

---

## 🔍 検証項目

### データ整合性チェック

```sql
-- SQLite
SELECT
  COUNT(*) as total_users,
  COUNT(DISTINCT permissionLevel) as unique_levels,
  MIN(permissionLevel) as min_level,
  MAX(permissionLevel) as max_level
FROM User;

-- MySQL
SELECT
  COUNT(*) as total_users,
  COUNT(DISTINCT permission_level) as unique_levels,
  MIN(permission_level) as min_level,
  MAX(permission_level) as max_level
FROM users;
```

### レベル分布確認

```sql
-- SQLite
SELECT permissionLevel, accountType, COUNT(*) as count
FROM User
GROUP BY permissionLevel, accountType
ORDER BY permissionLevel;

-- MySQL
SELECT permission_level, account_type, COUNT(*) as count
FROM users
GROUP BY permission_level, account_type
ORDER BY permission_level;
```

---

## 🚨 トラブルシューティング

### Q1: マイグレーションが失敗する

**原因**: 既存データの制約違反

**解決策**:
```bash
# SQLiteの場合
sqlite3 prisma/dev.db "PRAGMA foreign_keys = OFF;"
# マイグレーションSQL実行
sqlite3 prisma/dev.db "PRAGMA foreign_keys = ON;"
```

### Q2: 既存ユーザーの権限が不正確

**原因**: 経験年数情報不足で暫定レベル設定

**解決策**:
- Step 3で医療システムAPIを実装後、全ユーザーの権限レベルを再計算
- バッチスクリプト例:
  ```typescript
  import { prisma } from '@/lib/prisma';
  import { calculateLevelFromMedicalAPI } from '@/lib/medicalAPI';

  async function recalculateAllLevels() {
    const users = await prisma.user.findMany();
    for (const user of users) {
      const newLevel = await calculateLevelFromMedicalAPI(user.employeeId);
      await prisma.user.update({
        where: { id: user.id },
        data: { permissionLevel: newLevel }
      });
    }
  }
  ```

### Q3: 小数点レベル（1.5等）が表示されない

**原因**: フォーマット関数未使用

**解決策**:
```typescript
import { formatPermissionLevel } from '@/lib/accountLevelHelpers';

// 使用例
const formattedLevel = formatPermissionLevel(user.permissionLevel);
// 1.5 → "Level 1 (リーダー可)"
```

---

## 📅 実装スケジュール

| ステップ | 内容 | 所要時間 | 担当 | 状態 |
|---------|------|---------|------|------|
| Step 1 | DB設計変更 | 2日 | VoiceDriveチーム | ✅ 完了 |
| Step 2 | マイグレーション実行 | 1日 | VoiceDriveチーム | 📋 次回 |
| Step 3 | 医療API連携実装 | 3日 | VoiceDriveチーム | 📋 待機中 |
| Step 4 | 既存データ移行 | 2日 | VoiceDriveチーム | 📋 待機中 |
| Step 5 | 統合テスト | 2日 | 両チーム | 📋 待機中 |

---

## 📞 サポート

### 医療システムチームへの確認事項

- API仕様の詳細
- テストデータの提供
- 統合テスト環境の準備

### 連絡先

- VoiceDriveチーム: voicedrive-tech@example.com
- 医療システムチーム: medical-tech@example.com

---

**最終更新**: 2025年10月4日
**次のアクション**: Step 2マイグレーション実行の承認待ち
