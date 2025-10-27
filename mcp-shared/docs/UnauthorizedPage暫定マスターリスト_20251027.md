# UnauthorizedPage 暫定マスターリスト

**作成日**: 2025年10月27日
**対象ページ**: UnauthorizedPage (`src/pages/UnauthorizedPage.tsx`)
**目的**: 医療職員管理システムとの連携要件を明確化し、共通DB構築完了後の円滑な統合を実現する

---

## 📋 エグゼクティブサマリー

### 現状
- UnauthorizedPageは権限エラー表示ページ
- 現在のユーザーの権限レベルとアカウントタイプを表示
- デモモード（`useDemoMode`）で動作中
- 実データへの対応には認証システムの実装が必要

### 必要な対応
1. **医療システムからのAPI提供**: **0件**（認証APIは別途必要）
2. **医療システムからのWebhook通知**: **0件**
3. **VoiceDrive DB追加**: **0件**（既存Userテーブルで対応可能）
4. **確認事項**: **1件**（認証方式の確認）

### 優先度
**Priority: MEDIUM（認証システム実装時）**

### 結論
**UnauthorizedPageは既存のUserテーブルで動作可能ですが、実データ表示には認証システムの実装が前提条件です。**

---

## 🔗 医療システムへの依頼内容

### A. API提供依頼（認証関連）

#### API-AUTH: 職員認証API

**注意**: これはUnauthorizedPage専用ではなく、**VoiceDrive全体の認証システム**に必要なAPIです。

**エンドポイント**:
```
POST /api/v2/auth/authenticate
```

**必要な理由**:
- VoiceDriveへのログイン時に医療システムの認証情報を検証
- 職員IDとパスワードの照合
- 認証成功時に職員基本情報を返却

**リクエスト例**:
```json
{
  "email": "yamada.taro@hospital.local",
  "password": "hashed_password_here"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "employeeId": "EMP2024001",
  "employee": {
    "employeeId": "EMP2024001",
    "name": "山田 太郎",
    "email": "yamada.taro@hospital.local",
    "permissionLevel": 3.5,
    "accountType": "STAFF",
    "role": "nurse",
    "department": "外科",
    "facilityId": "FAC001"
  }
}
```

**エラーレスポンス例**:
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "メールアドレスまたはパスワードが正しくありません"
}
```

**セキュリティ**:
- HTTPS必須
- パスワードはbcryptでハッシュ化
- Rate Limit: 5 req/min/IP（ブルートフォース対策）
- 連続失敗でアカウントロック（5回失敗で30分ロック）

---

### B. Webhook通知依頼

#### ❌ Webhook不要

UnauthorizedPageは権限情報の表示のみなので、専用のWebhook通知は不要です。

ただし、以下のWebhookは**VoiceDrive全体**で必要（PersonalStationと共通）:
- `employee.updated`: 職員情報更新通知（権限レベル変更含む）

---

## 🗄️ VoiceDrive DB構築計画書への追加内容

### C. 新規テーブル追加

#### ❌ 新規テーブル不要

UnauthorizedPageは既存の`User`テーブルで動作可能です。

---

### D. 既存テーブル確認

#### User テーブル（既存）

UnauthorizedPageに必要なフィールド：

```prisma
model User {
  id              String      @id @default(cuid())
  employeeId      String      @unique @map("employee_id")

  // UnauthorizedPageで表示される権限情報
  permissionLevel Float       @map("permission_level")    // ✅ 既存
  accountType     String      @map("account_type")        // ✅ 既存
  role            String?                                  // ✅ 既存（表示なし）

  // その他の基本情報
  name            String
  email           String      @unique

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  @@map("users")
}
```

**評価**: ✅ 必要なフィールドはすべて存在（追加不要）

---

## 🔄 実装要件

### E. VoiceDrive側の実装（認証システム）

#### E-1: useAuthフック実装（新規）

**ファイル**: `src/hooks/useAuth.ts`

**目的**: 現在のログインユーザーを管理

**実装内容**:
```typescript
import { useState, useEffect } from 'react';
import { User } from '@prisma/client';

interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // 医療システムの認証APIを呼び出す
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    await fetchCurrentUser();
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout
  };
};
```

---

#### E-2: usePermissionsフック修正

**ファイル**: `src/hooks/usePermissions.ts`

**現在**:
```typescript
export const usePermissions = (): UsePermissionsReturn => {
  const { currentUser: demoUser } = useDemoMode();  // デモモード

  return {
    userLevel: demoUser?.permissionLevel || 1,
    accountType: demoUser?.accountType || 'STAFF',
    // ...
  };
};
```

**修正後**:
```typescript
export const usePermissions = (): UsePermissionsReturn => {
  // 環境変数でデモモードと本番モードを切り替え
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

  const { currentUser: demoUser } = useDemoMode();  // デモモード
  const { currentUser: realUser } = useAuth();      // 本番モード（新規）

  const currentUser = isDemoMode ? demoUser : realUser;

  return {
    userLevel: currentUser?.permissionLevel || 1,
    accountType: currentUser?.accountType || 'STAFF',
    // ...
  };
};
```

---

#### E-3: 認証APIエンドポイント実装（新規）

**ファイル**: `src/api/auth.ts`

##### GET /api/auth/me

```typescript
/**
 * 現在のログインユーザー情報を取得
 */
export async function getCurrentUser(req: Request, res: Response) {
  const session = await getSession(req);

  if (!session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      permissionLevel: true,
      accountType: true,
      role: true
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
}
```

##### POST /api/auth/login

```typescript
/**
 * ログイン処理
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  // 医療システムの認証APIを呼び出す
  const authResult = await medicalSystemAPI.authenticate(email, password);

  if (!authResult.success) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // VoiceDriveのUserテーブルでユーザーを検索または作成
  let user = await prisma.user.findUnique({
    where: { employeeId: authResult.employeeId }
  });

  if (!user) {
    // 初回ログイン時: Userを作成
    user = await prisma.user.create({
      data: {
        employeeId: authResult.employee.employeeId,
        name: authResult.employee.name,
        email: authResult.employee.email,
        permissionLevel: authResult.employee.permissionLevel,
        accountType: authResult.employee.accountType,
        role: authResult.employee.role
      }
    });
  }

  // セッションを作成
  await createSession(req, res, user.id);

  res.json({ success: true, user });
}
```

##### POST /api/auth/logout

```typescript
/**
 * ログアウト処理
 */
export async function logout(req: Request, res: Response) {
  await destroySession(req, res);
  res.json({ success: true });
}
```

---

#### E-4: セッション管理実装（新規）

**ファイル**: `src/utils/session.ts`

**推奨ライブラリ**: `express-session` + `connect-redis`

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect();

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
});

export async function getSession(req: Request) {
  return req.session;
}

export async function createSession(req: Request, res: Response, userId: string) {
  req.session.userId = userId;
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve(req.session);
    });
  });
}

export async function destroySession(req: Request, res: Response) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}
```

---

## ❓ 医療システムチームへの確認事項

### 確認-1: 認証方式の選択

**質問**:
> VoiceDriveの認証方式について、以下のどちらを希望しますか？
>
> **Option A: 医療システムの認証APIを呼び出す（推奨）**
> - メリット: 職員マスタが真実の情報源
> - メリット: パスワード管理を医療システムに一元化
> - メリット: 退職処理が即座に反映
> - デメリット: 医療システムAPIへの依存度が高い
>
> **Option B: VoiceDrive独自の認証システム**
> - メリット: 医療システムから独立して動作
> - メリット: レスポンスが高速
> - デメリット: パスワード管理が分散
> - デメリット: ユーザー情報の同期が複雑
>
> **VoiceDrive推奨**: Option A（医療システム認証API）

**期待回答**:
- ✅ Option A: 医療システム認証API実装可能
- 認証APIエンドポイント: `POST /api/v2/auth/authenticate`
- Rate Limit: 5 req/min/IP
- アカウントロック: 5回失敗で30分ロック

---

## 📅 想定スケジュール

### Phase 1: 要件確認（1週間）
- **Week 1**: 医療システムチームからの認証方式回答受領

### Phase 2: 医療システム側実装（2週間）
- **Week 2**: 認証API実装（POST /api/v2/auth/authenticate）
- **Week 3**: テスト環境構築、Rate Limit設定

### Phase 3: VoiceDrive側実装（2週間）
- **Week 4**: useAuthフック、セッション管理実装
- **Week 5**: usePermissions修正、認証APIクライアント実装

### Phase 4: 統合テスト（1週間）
- **Week 6**: E2Eテスト、セキュリティ監査

### Phase 5: 本番リリース
- **Week 7**: 段階的ロールアウト

**合計工数**: 約7週間（認証システム全体）

---

## 📊 データフロー図

### 現在のデータフロー（デモモード）

```
UnauthorizedPage
  ↓ usePermissions()
useDemoMode()
  ↓ currentUser: DemoUser
DemoModeProvider
  ↓ useState
demoUsers配列（ハードコード）
  ↓
表示: STAFF (Level 3.5)
```

**データベースアクセス**: 0回

---

### 将来のデータフロー（実データ）

```
┌─────────────────────────────────────────────────────────────┐
│                    医療職員管理システム                       │
│                                                               │
│  ┌──────────────┐                                           │
│  │   Employee   │                                           │
│  │   (Master)   │                                           │
│  └──────────────┘                                           │
│         │                                                     │
│         │ ①認証API                                          │
│         ▼                                                     │
│  ┌─────────────────────────────────────┐                   │
│  │  POST /api/v2/auth/authenticate     │                   │
│  │  - email, password検証              │                   │
│  │  - 職員基本情報返却                 │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │ HTTPS + Rate Limit
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      VoiceDrive                              │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │  POST /api/auth/login                     │               │
│  │  - 医療システム認証API呼び出し            │               │
│  │  - Userテーブル検索/作成                  │               │
│  │  - セッション作成                         │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ②User取得/作成                                    │
│         ▼                                                     │
│  ┌──────────────┐                                           │
│  │     User     │                                           │
│  │  (キャッシュ) │                                           │
│  └──────────────┘                                           │
│         │                                                     │
│         │ ③セッション確認                                   │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  GET /api/auth/me                         │               │
│  │  - セッションからユーザーID取得           │               │
│  │  - Userテーブルから情報取得               │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ④権限情報取得                                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  useAuth() → usePermissions()             │               │
│  │  - permissionLevel: 3.5                   │               │
│  │  - accountType: STAFF                     │               │
│  └──────────────────────────────────────────┘               │
│         │                                                     │
│         │ ⑤表示                                             │
│         ▼                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  UnauthorizedPage                         │               │
│  │  - アクセス権限がありません               │               │
│  │  - 現在の権限レベル: STAFF (Level 3.5)    │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ チェックリスト

### 医療システム側作業

- [ ] **確認-1**: 認証方式の選択（Option A推奨）
- [ ] **API-AUTH**: POST /api/v2/auth/authenticate 実装
- [ ] Rate Limit設定（5 req/min/IP）
- [ ] アカウントロック機能実装（5回失敗で30分）
- [ ] テスト環境でのAPI動作確認

### VoiceDrive側作業

#### Phase 1: 認証基盤
- [ ] **E-1**: useAuthフック実装
- [ ] **E-4**: セッション管理実装（express-session + Redis）
- [ ] **E-3**: GET /api/auth/me 実装
- [ ] **E-3**: POST /api/auth/login 実装
- [ ] **E-3**: POST /api/auth/logout 実装

#### Phase 2: usePermissions修正
- [ ] **E-2**: usePermissionsをuseAuthベースに変更
- [ ] デモモードと本番モードの切り替え機能
- [ ] エラーハンドリング実装

#### Phase 3: UnauthorizedPage対応
- [ ] UnauthorizedPageの実データ表示確認
- [ ] エラーハンドリングテスト
- [ ] E2Eテスト

### データベース作業

- [ ] **該当なし**: 既存のUserテーブルで対応可能

---

## 📝 補足資料

### 参照ドキュメント

1. **UnauthorizedPage DB要件分析**
   `mcp-shared/docs/UnauthorizedPage_DB要件分析_20251027.md`

2. **データ管理責任分界点定義書**
   `mcp-shared/docs/データ管理責任分界点定義書_20251008.md`

3. **NotFoundPage 暫定マスターリスト**（比較参考用）
   `mcp-shared/docs/NotFoundPage暫定マスターリスト_20251027.md`

4. **PersonalStation 暫定マスターリスト**（比較参考用）
   `mcp-shared/docs/PersonalStation暫定マスターリスト_20251008.md`

---

## 🎯 まとめ

### UnauthorizedPageの特徴

1. **半動的ページ**: 静的エラーメッセージ + 動的ユーザー権限情報
2. **既存テーブルで対応可能**: Userテーブルの既存フィールドを使用
3. **認証システムに依存**: useAuthフックの実装が前提
4. **新規テーブル不要**: PersonalStationとは異なり、追加テーブルが不要

### 3ページ比較サマリー

| 要素 | NotFoundPage | UnauthorizedPage | PersonalStation |
|-----|-------------|-----------------|----------------|
| **医療システムAPI** | 不要 | 認証API（共通） | 2件必要 |
| **Webhook通知** | 不要 | 不要 | 4件必要 |
| **新規テーブル** | 不要 | 不要 | 2件追加 |
| **新規フィールド** | 不要 | 不要 | 1件追加 |
| **確認事項** | なし | 1件（認証方式） | 3件 |
| **実装工数** | 0日（完成） | 7週間（認証含む） | 4-6週間 |

### 最終結論

**UnauthorizedPageは新規テーブルやフィールドの追加が不要ですが、実データ表示にはVoiceDrive全体の認証システム実装が必要です。**

現在はデモモードで正常に動作しており、認証システム実装後にusePermissionsフックを修正するだけで実データ対応が完了します。

認証システムはUnauthorizedPageだけでなく、**VoiceDrive全体**で必要となる基盤機能です。

---

## 🔄 更新履歴

| 日付 | 内容 | 担当 |
|------|------|------|
| 2025-10-27 | 初版作成 | AI (Claude Code) |

---

**作成者**: AI (Claude Code)
**承認待ち**: 医療システムチームからの認証方式確認回答
**次のステップ**: 認証システム実装計画書の作成

---

**文書終了**
