# Phase 2 顔写真統合 - VoiceDrive側実装計画書

**文書ID**: VD-IMPL-PHOTO-2025-001
**作成日**: 2025年10月21日
**対象期間**: 2025年11月第1-3週
**担当**: VoiceDriveチーム
**関連文書**:
- phase2-profile-photo-integration-inquiry-20251021.md
- phase2-medical-system-response-photo-integration-20251021.md

---

## 1. 実装概要

### 1.1 目的
医療職員管理システム（職位カルテシステム）から顔写真データを受信し、VoiceDriveのプロフィール・投稿UIに自動反映させる。

### 1.2 採用方式
**Option B（URL参照方式）** を採用

- 医療システム側が既に300人分の顔写真をAWS S3に保存済み
- CloudFront CDN経由で永続的なURLを提供
- VoiceDrive側は写真URLのみを保存

### 1.3 データフロー
```
HR部門（入職時撮影）
  ↓
医療システム（Sharp処理: 400x400 JPEG）
  ↓
AWS S3保存
  ↓
CloudFront CDN
  ↓
Webhook送信（profilePhotoUrl）
  ↓
VoiceDrive（URL保存 → Avatar表示）
```

---

## 2. 技術仕様

### 2.1 データベース拡張

#### 2.1.1 Userテーブルの拡張
**ファイル**: `prisma/schema.prisma`

```prisma
model User {
  id                    Int       @id @default(autoincrement())
  staffId               String    @unique
  fullName              String
  email                 String    @unique

  // 既存フィールド...

  // 🆕 追加フィールド
  profilePhotoUrl       String?   // CloudFront CDN URL
  profilePhotoUpdatedAt DateTime? // 写真更新日時

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### 2.1.2 マイグレーション実行
```bash
npx prisma migrate dev --name add_profile_photo_url
npx prisma generate
```

### 2.2 Webhook受信エンドポイント

#### 2.2.1 新規エンドポイント
**ファイル**: `src/routes/apiRoutes.ts`

```typescript
// 🆕 追加ルート
router.post('/api/webhooks/medical-system/employee',
  validateWebhookSignature,  // HMAC検証ミドルウェア
  handleEmployeeWebhook       // ハンドラー
);
```

#### 2.2.2 HMAC署名検証ミドルウェア
**ファイル**: `src/middleware/webhookAuth.ts`（新規作成）

```typescript
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const WEBHOOK_SECRET = process.env.MEDICAL_WEBHOOK_SECRET!;

export const validateWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature or timestamp' });
  }

  // タイムスタンプ検証（5分以内）
  const now = Date.now();
  const requestTime = parseInt(timestamp, 10);
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'Request too old' });
  }

  // HMAC検証
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};
```

#### 2.2.3 Webhookハンドラー
**ファイル**: `src/controllers/webhookController.ts`（新規作成）

```typescript
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface EmployeeWebhookPayload {
  eventType: 'employee.created' | 'employee.photo.updated' | 'employee.photo.deleted';
  staffId: string;
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
  photoUpdatedAt?: string;
}

export const handleEmployeeWebhook = async (req: Request, res: Response) => {
  try {
    const payload: EmployeeWebhookPayload = req.body;

    switch (payload.eventType) {
      case 'employee.created':
        await handleEmployeeCreated(payload);
        break;
      case 'employee.photo.updated':
        await handlePhotoUpdated(payload);
        break;
      case 'employee.photo.deleted':
        await handlePhotoDeleted(payload);
        break;
      default:
        return res.status(400).json({ error: 'Unknown event type' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 新規職員アカウント作成
async function handleEmployeeCreated(payload: EmployeeWebhookPayload) {
  const existingUser = await prisma.user.findUnique({
    where: { staffId: payload.staffId }
  });

  if (existingUser) {
    // 既存ユーザーの場合は写真URLのみ更新
    await prisma.user.update({
      where: { staffId: payload.staffId },
      data: {
        profilePhotoUrl: payload.profilePhotoUrl,
        profilePhotoUpdatedAt: payload.photoUpdatedAt
          ? new Date(payload.photoUpdatedAt)
          : new Date()
      }
    });
  } else {
    // 新規アカウント作成
    await prisma.user.create({
      data: {
        staffId: payload.staffId,
        fullName: payload.fullName,
        email: payload.email,
        profilePhotoUrl: payload.profilePhotoUrl,
        profilePhotoUpdatedAt: payload.photoUpdatedAt
          ? new Date(payload.photoUpdatedAt)
          : new Date(),
        // デフォルト値
        password: crypto.randomBytes(32).toString('hex'), // 仮パスワード（初回ログイン時変更）
        role: 'staff',
        isActive: true
      }
    });
  }
}

// 写真更新
async function handlePhotoUpdated(payload: EmployeeWebhookPayload) {
  await prisma.user.update({
    where: { staffId: payload.staffId },
    data: {
      profilePhotoUrl: payload.profilePhotoUrl,
      profilePhotoUpdatedAt: new Date()
    }
  });
}

// 写真削除
async function handlePhotoDeleted(payload: EmployeeWebhookPayload) {
  await prisma.user.update({
    where: { staffId: payload.staffId },
    data: {
      profilePhotoUrl: null,
      profilePhotoUpdatedAt: new Date()
    }
  });
}
```

### 2.3 Avatarコンポーネント修正

#### 2.3.1 Avatar.tsx の修正
**ファイル**: `src/components/common/Avatar.tsx`

```typescript
import React from 'react';
import { User } from '@prisma/client';

interface AvatarProps {
  user: Pick<User, 'fullName' | 'profilePhotoUrl'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl'
};

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizeClass = sizeClasses[size];

  // CloudFront URLが存在する場合は画像表示
  if (user.profilePhotoUrl) {
    return (
      <img
        src={user.profilePhotoUrl}
        alt={`${user.fullName}のプロフィール写真`}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-300 dark:border-slate-600 ${className}`}
        onError={(e) => {
          // 画像読み込み失敗時はイニシャル表示にフォールバック
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  // フォールバック: イニシャル表示
  const initial = user.fullName.charAt(0);
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initial}
    </div>
  );
};
```

#### 2.3.2 使用箇所の確認
以下のコンポーネントでAvatarを使用しているため、自動的に写真表示が適用される：

- `src/pages/ProfilePage.tsx` - プロフィールページ
- `src/components/posts/PostCard.tsx` - 投稿カード
- `src/components/common/Header.tsx` - ヘッダー
- `src/pages/SettingsPage.tsx` - 設定ページ

### 2.4 環境変数設定

**ファイル**: `.env`

```bash
# 🆕 Webhook認証用シークレット（医療チームと共有）
MEDICAL_WEBHOOK_SECRET=your-shared-secret-key-here

# 既存の環境変数...
DATABASE_URL="file:./dev.db"
```

---

## 3. 実装スケジュール

### Week 1（11月第1週: 11/4-11/8）

#### Day 1-2: データベース拡張
- [ ] Prismaスキーマ修正
- [ ] マイグレーション実行
- [ ] 開発環境でのテスト

#### Day 3-4: Webhook受信機能
- [ ] `webhookAuth.ts` ミドルウェア実装
- [ ] `webhookController.ts` ハンドラー実装
- [ ] `/api/webhooks/medical-system/employee` ルート追加
- [ ] HMAC署名検証のユニットテスト

#### Day 5: Avatar コンポーネント修正
- [ ] `Avatar.tsx` の画像URL対応
- [ ] エラーハンドリング実装（画像読み込み失敗時のフォールバック）

### Week 2（11月第2週: 11/11-11/15）

#### Day 1-2: 統合テスト準備
- [ ] Webhook送信テストスクリプト作成
- [ ] モックデータ準備（テスト用CloudFront URL）
- [ ] 医療チームとのWebhook疎通確認

#### Day 3-4: 統合テスト実行
- [ ] `employee.created` イベントテスト
- [ ] `employee.photo.updated` イベントテスト
- [ ] `employee.photo.deleted` イベントテスト
- [ ] HMAC署名検証テスト
- [ ] タイムスタンプ検証テスト（古いリクエスト拒否）

#### Day 5: 既存ユーザー確認
- [ ] 既存300人のアカウントと写真URLのマッピング確認
- [ ] 重複アカウント防止ロジック確認

### Week 3（11月第3週: 11/18-11/22）

#### Day 1-2: 本番環境準備
- [ ] 本番データベースマイグレーション
- [ ] 環境変数設定（本番Webhook Secret）
- [ ] CloudFront URLのCORS設定確認

#### Day 3: 既存300人の写真データ移行
- [ ] 医療チームから一括Webhook送信受信
- [ ] 全アカウントの `profilePhotoUrl` 更新確認
- [ ] Avatar表示確認（全ページ）

#### Day 4: 最終確認
- [ ] プロフィールページでの写真表示確認
- [ ] 投稿UIでの投稿者アイコン表示確認
- [ ] ヘッダーのユーザーアイコン表示確認
- [ ] 設定ページでの写真表示確認

#### Day 5: リリース
- [ ] 本番環境デプロイ
- [ ] 医療チームへ完了報告
- [ ] ユーザー向けアナウンス（顔写真自動反映開始）

---

## 4. テスト計画

### 4.1 ユニットテスト

#### 4.1.1 Webhook署名検証テスト
**ファイル**: `tests/middleware/webhookAuth.test.ts`

```typescript
import { validateWebhookSignature } from '../../src/middleware/webhookAuth';
import crypto from 'crypto';

describe('Webhook署名検証', () => {
  const secret = 'test-secret';
  process.env.MEDICAL_WEBHOOK_SECRET = secret;

  it('正しい署名を検証できる', () => {
    const timestamp = Date.now().toString();
    const payload = { eventType: 'employee.created', staffId: 'EMP-001' };
    const signature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + JSON.stringify(payload))
      .digest('hex');

    // テスト実装...
  });

  it('不正な署名を拒否する', () => {
    // テスト実装...
  });

  it('古いタイムスタンプを拒否する（5分以上前）', () => {
    // テスト実装...
  });
});
```

#### 4.1.2 Webhookハンドラーテスト
**ファイル**: `tests/controllers/webhookController.test.ts`

```typescript
describe('Webhookハンドラー', () => {
  it('employee.created で新規アカウントを作成する', async () => {
    // テスト実装...
  });

  it('employee.created で既存アカウントの写真URLを更新する', async () => {
    // テスト実装...
  });

  it('employee.photo.updated で写真URLを更新する', async () => {
    // テスト実装...
  });

  it('employee.photo.deleted で写真URLをnullにする', async () => {
    // テスト実装...
  });
});
```

### 4.2 統合テスト

#### 4.2.1 Webhook送信テストスクリプト
**ファイル**: `scripts/test-webhook-employee.ts`

```typescript
import crypto from 'crypto';
import fetch from 'node-fetch';

const WEBHOOK_SECRET = process.env.MEDICAL_WEBHOOK_SECRET!;
const VOICEDRIVE_URL = 'http://localhost:3001';

async function sendTestWebhook(eventType: string) {
  const timestamp = Date.now().toString();
  const payload = {
    eventType,
    staffId: 'EMP-TEST-001',
    fullName: 'テスト太郎',
    email: 'test@example.com',
    profilePhotoUrl: 'https://d1234567890.cloudfront.net/employees/EMP-TEST-001.jpg',
    photoUpdatedAt: new Date().toISOString()
  };

  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(timestamp + JSON.stringify(payload))
    .digest('hex');

  const response = await fetch(`${VOICEDRIVE_URL}/api/webhooks/medical-system/employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': signature,
      'x-webhook-timestamp': timestamp
    },
    body: JSON.stringify(payload)
  });

  console.log(`Status: ${response.status}`);
  console.log(`Response: ${await response.text()}`);
}

// テスト実行
sendTestWebhook('employee.created');
```

### 4.3 E2Eテスト

#### 4.3.1 テストシナリオ
1. 医療チームからWebhook送信（新規職員）
2. VoiceDriveで新規アカウント作成確認
3. プロフィールページで写真表示確認
4. 投稿作成後、投稿カードで写真表示確認
5. 写真更新Webhook送信
6. 各ページで写真更新確認
7. 写真削除Webhook送信
8. イニシャル表示にフォールバック確認

---

## 5. セキュリティ対策

### 5.1 Webhook認証
- ✅ HMAC-SHA256署名検証
- ✅ タイムスタンプ検証（5分以内のリクエストのみ受け付け）
- ✅ 秘密鍵の環境変数管理（Gitにコミットしない）

### 5.2 画像URL検証
- ✅ CloudFront CDNドメインの検証（ホワイトリスト方式）
- ✅ HTTPS通信のみ許可
- ✅ 画像読み込み失敗時のフォールバック処理

### 5.3 CORS設定
医療チーム側でCloudFront CDNに以下のCORS設定が必要：

```json
{
  "AllowedOrigins": ["https://voicedrive.example.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

---

## 6. エラーハンドリング

### 6.1 想定エラーと対処

| エラーケース | 対処方法 |
|------------|---------|
| Webhook署名不正 | 401エラー返却、ログ記録、医療チームへ通知 |
| タイムスタンプ期限切れ | 401エラー返却、ログ記録 |
| 画像URL読み込み失敗 | イニシャル表示にフォールバック |
| CloudFront CDNダウン | キャッシュされたイニシャル表示で継続 |
| データベース接続エラー | 500エラー返却、リトライ機構 |
| 重複staffId | 既存アカウント更新（upsert処理） |

### 6.2 ログ記録

**ファイル**: `src/utils/webhookLogger.ts`

```typescript
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../../logs');

export function logWebhookEvent(
  eventType: string,
  staffId: string,
  status: 'success' | 'error',
  details?: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    staffId,
    status,
    details
  };

  const logFile = path.join(LOG_DIR, `webhook-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}
```

---

## 7. パフォーマンス最適化

### 7.1 画像最適化
医療チーム側で実施済み：
- Sharp処理: 400x400ピクセル
- JPEG圧力: 品質85
- ファイルサイズ: 平均150KB

### 7.2 CDNキャッシュ
CloudFront設定：
- キャッシュTTL: 24時間
- 画像更新時は新しいURLで配信（キャッシュバスティング）

### 7.3 データベースクエリ最適化
```typescript
// staffIdにインデックスが既に存在するため、高速検索可能
await prisma.user.findUnique({
  where: { staffId: payload.staffId }
});
```

---

## 8. コスト分析

### 8.1 開発コスト
| 項目 | 工数 | 単価 | 小計 |
|-----|------|------|------|
| データベース拡張 | 2日 | ¥50,000/日 | ¥100,000 |
| Webhook実装 | 3日 | ¥50,000/日 | ¥150,000 |
| Avatarコンポーネント修正 | 1日 | ¥50,000/日 | ¥50,000 |
| 統合テスト | 3日 | ¥50,000/日 | ¥150,000 |
| 本番移行 | 2日 | ¥50,000/日 | ¥100,000 |
| **合計** | **11日** | - | **¥550,000** |

### 8.2 運用コスト
- データベースストレージ: URL文字列のみ（約200バイト/人）
- 300人 × 200バイト = 60KB → **無視できるレベル**
- 追加サーバーコスト: **¥0/月**

### 8.3 医療チーム側コスト（参考）
- 開発費: ¥260,000
- 運用費: ¥500/月（S3 + CloudFront）

### 8.4 合計プロジェクトコスト
- 開発費: ¥550,000（VD） + ¥260,000（医療） = **¥810,000**
- 運用費: **¥500/月**

---

## 9. リスク管理

### 9.1 技術的リスク

| リスク | 影響度 | 対策 |
|-------|-------|------|
| CloudFront CDN障害 | 中 | イニシャル表示でフォールバック |
| Webhook配信失敗 | 高 | 医療チーム側でリトライ機構実装 |
| 画像形式非対応 | 低 | JPEGのみに統一（仕様確定済み） |
| データベースマイグレーション失敗 | 高 | バックアップ取得、ロールバック手順準備 |

### 9.2 スケジュールリスク

| リスク | 対策 |
|-------|------|
| 医療チームとの調整遅延 | 10/30調整会議で早期合意 |
| 統合テスト環境準備遅延 | Week 1で早期着手 |
| 本番移行時の予期せぬエラー | Week 2で十分な統合テスト |

---

## 10. 成果物

### 10.1 コードファイル
- ✅ `prisma/schema.prisma` - Userテーブル拡張
- ✅ `src/middleware/webhookAuth.ts` - HMAC署名検証
- ✅ `src/controllers/webhookController.ts` - Webhookハンドラー
- ✅ `src/routes/apiRoutes.ts` - Webhookルート追加
- ✅ `src/components/common/Avatar.tsx` - 画像URL対応
- ✅ `src/utils/webhookLogger.ts` - ログ記録

### 10.2 テストファイル
- ✅ `tests/middleware/webhookAuth.test.ts`
- ✅ `tests/controllers/webhookController.test.ts`
- ✅ `scripts/test-webhook-employee.ts`

### 10.3 ドキュメント
- ✅ この実装計画書
- ✅ API仕様書（Webhook受信エンドポイント）
- ✅ 医療チームへの返信書（次に作成）

---

## 11. 医療チームとの連携事項

### 11.1 必要な情報
1. **Webhook Secret共有** - HMAC署名生成用の秘密鍵
2. **CloudFrontドメイン** - CORS設定・ホワイトリスト登録用
3. **テスト用CloudFront URL** - 統合テスト用のサンプル画像URL
4. **本番Webhook送信タイミング** - 11/18-11/20の具体的な日時

### 11.2 依頼事項
1. **CloudFront CORS設定** - VoiceDriveドメインの許可
2. **Webhookリトライ機構** - 配信失敗時の再送処理
3. **一括Webhook送信** - 既存300人分のデータ送信（11/18-11/20）
4. **テスト環境での疎通確認** - Week 2（11/11-11/15）

---

## 12. 次のアクション

### 即座に実施
- [ ] 医療チームへ返信書を送付（この後作成）
- [ ] 10/30調整会議の議題確認

### Week 1開始前（11/1-11/3）
- [ ] Webhook Secret受領
- [ ] CloudFrontドメイン受領
- [ ] 開発環境準備完了確認

### Week 1開始時（11/4）
- [ ] Prismaマイグレーション実行
- [ ] Webhook実装開始

---

## 付録A: Webhook仕様詳細

### A.1 エンドポイント
```
POST https://voicedrive.example.com/api/webhooks/medical-system/employee
```

### A.2 リクエストヘッダー
```
Content-Type: application/json
x-webhook-signature: <HMAC-SHA256 署名>
x-webhook-timestamp: <UnixタイムスタンプMilliseconds>
```

### A.3 リクエストボディ（employee.created）
```json
{
  "eventType": "employee.created",
  "staffId": "EMP-2025-001",
  "fullName": "山田太郎",
  "email": "yamada@hospital.example.com",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/EMP-2025-001.jpg",
  "photoUpdatedAt": "2025-04-01T09:00:00Z"
}
```

### A.4 リクエストボディ（employee.photo.updated）
```json
{
  "eventType": "employee.photo.updated",
  "staffId": "EMP-2025-001",
  "profilePhotoUrl": "https://d1234567890.cloudfront.net/employees/EMP-2025-001.jpg",
  "photoUpdatedAt": "2025-05-15T14:30:00Z"
}
```

### A.5 リクエストボディ（employee.photo.deleted）
```json
{
  "eventType": "employee.photo.deleted",
  "staffId": "EMP-2025-001",
  "photoDeletedAt": "2025-05-20T10:00:00Z"
}
```

### A.6 レスポンス（成功）
```json
{
  "success": true
}
```
**ステータスコード**: 200

### A.7 レスポンス（エラー）
```json
{
  "error": "Invalid signature"
}
```
**ステータスコード**: 401（認証エラー）、400（不正なリクエスト）、500（サーバーエラー）

---

## 付録B: データベーススキーマ詳細

### B.1 変更前
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  staffId               String    @unique
  fullName              String
  email                 String    @unique
  password              String
  role                  String    @default("staff")
  isActive              Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### B.2 変更後
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  staffId               String    @unique
  fullName              String
  email                 String    @unique
  password              String
  role                  String    @default("staff")
  isActive              Boolean   @default(true)

  // 🆕 顔写真関連フィールド
  profilePhotoUrl       String?   // CloudFront CDN URL
  profilePhotoUpdatedAt DateTime? // 写真更新日時

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### B.3 マイグレーションSQL（自動生成）
```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "profilePhotoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "profilePhotoUpdatedAt" DATETIME;
```

---

## 改訂履歴

| 版 | 日付 | 変更内容 | 作成者 |
|----|------|---------|--------|
| 1.0 | 2025-10-21 | 初版作成 | VoiceDriveチーム |

---

**承認欄**

- VoiceDriveチームリーダー: ________________ 日付: ______
- 医療システムチームリーダー: ________________ 日付: ______

---

**END OF DOCUMENT**
