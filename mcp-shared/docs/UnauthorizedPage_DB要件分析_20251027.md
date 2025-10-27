# UnauthorizedPageページ DB要件分析

**文書番号**: DB-REQ-2025-1027-003
**作成日**: 2025年10月27日
**対象ページ**: https://voicedrive-v100.vercel.app/unauthorized (UnauthorizedPage)
**参照文書**:
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [NotFoundPage_DB要件分析_20251027.md](./NotFoundPage_DB要件分析_20251027.md)

---

## 📋 分析サマリー

### 結論
UnauthorizedPageは**権限エラー表示ページ**であり、基本的にはNotFoundPageと同様の静的ページですが、**現在のユーザーの権限情報を表示**するという点で若干異なります。

### ✅ 現在の状態
- **主要機能**: アクセス権限エラーメッセージの表示
- **動的要素**: ユーザーの権限レベルとアカウントタイプの表示
- **データソース**: デモモード（`useDemoMode`フック経由）
- **データベース連携**: 現時点ではデモデータのみ（実データ連携は未実装）

### 🎯 ページの性質

| 特性 | NotFoundPage | UnauthorizedPage |
|-----|-------------|-----------------|
| **ページタイプ** | 完全静的 | 半動的（ユーザー情報表示） |
| **ユーザー情報表示** | なし | あり（権限レベル、アカウントタイプ） |
| **データソース** | なし | デモモード（将来は実データ） |
| **データベース要否** | 不要 | 🟡 部分的に必要 |

---

## 🔍 詳細分析

### 1. ページ構造（4-30行目）

#### 実装内容

```typescript
const UnauthorizedPage = () => {
  const { userLevel, userRole, accountType } = usePermissions();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        {/* エラーアイコン */}
        <div className="text-9xl mb-4">🚫</div>

        {/* エラーメッセージ */}
        <h1 className="text-3xl font-bold text-white mb-4">アクセス権限がありません</h1>
        <p className="text-gray-400 mb-2">
          このページにアクセスするには適切な権限が必要です。
        </p>

        {/* 現在の権限レベル表示 */}
        <p className="text-gray-500 text-sm mb-8">
          現在の権限レベル: {accountType} (Level {userLevel})
        </p>

        {/* ホームリンク */}
        <Link to="/" className="...">
          ホーム
        </Link>
      </div>
    </div>
  );
};
```

#### 必要なデータソース

| 表示項目 | データソース | 現在の実装 | 将来の実装 | データ管理責任 | 状態 |
|---------|------------|-----------|-----------|--------------|------|
| エラーメッセージ | ハードコード | 静的テキスト | 静的テキスト | VoiceDrive | ✅ OK |
| `accountType` | `usePermissions` | デモデータ | User.accountType | 医療システム | 🟡 **要実装** |
| `userLevel` | `usePermissions` | デモデータ | User.permissionLevel | 医療システム | 🟡 **要実装** |
| ホームリンク | react-router | ローカル | ローカル | VoiceDrive | ✅ OK |

**評価**: 🟡 基本動作可能だが、デモデータから実データへの切り替えが必要

---

### 2. usePermissionsフックの分析（usePermissions.ts）

#### 現在の実装（1-94行目）

```typescript
export const usePermissions = (): UsePermissionsReturn => {
  const { currentUser: demoUser } = useDemoMode();  // デモモードから取得
  const [isLoading, setIsLoading] = useState(true);

  // ... 権限チェック機能

  return {
    hasPermission,
    hasAnyPermission,
    canViewUser,
    canApproveBudget,
    getNextApprover,
    userLevel: demoUser?.permissionLevel || 1,      // デモユーザーから取得
    userRole: demoUser?.role || 'employee',          // デモユーザーから取得
    accountType: demoUser?.accountType || 'STAFF',   // デモユーザーから取得
    isLoading,
    currentUser: demoUser || null
  };
};
```

#### データフロー（現在）

```
UnauthorizedPage
  ↓ usePermissions()
useDemoMode()
  ↓ currentUser
DemoModeProvider
  ↓ useState<DemoUser>
demoUsers配列（ハードコード）
  ↓
デモデータ表示
```

#### データフロー（将来）

```
UnauthorizedPage
  ↓ usePermissions()
useAuth() または useUser()
  ↓ currentUser
VoiceDrive User（キャッシュ）
  ↓ Webhook同期
医療システム Employee（マスタ）
  ↓
実データ表示
```

---

### 3. 必要なユーザー情報

#### 表示される権限情報

| 情報項目 | usePermissions戻り値 | VoiceDrive User | 医療システム Employee | データ管理責任 |
|---------|---------------------|----------------|---------------------|--------------|
| `userLevel` | ✅ 返却 | `permissionLevel` | `permissionLevel` | 医療システム |
| `accountType` | ✅ 返却 | `accountType` | `accountType` | 医療システム |
| `userRole` | ✅ 返却（表示なし） | `role` | `role` | 医療システム |

**評価**: すべて既存のフィールドで対応可能（新規フィールド追加不要）

---

## 📊 データ要件マトリックス

### 3ページ比較

| 項目 | NotFoundPage | UnauthorizedPage | PersonalStation |
|-----|-------------|-----------------|----------------|
| **ページタイプ** | 完全静的 | 半動的 | 完全動的 |
| **ユーザー情報表示** | なし | 権限レベルのみ | 詳細プロフィール |
| **データベーステーブル** | 不要 | User（既存） | User + 複数 |
| **新規テーブル追加** | 不要 | 不要 | 2件必要 |
| **新規フィールド追加** | 不要 | 不要 | 1件必要 |
| **API呼び出し** | なし | 間接的（認証時） | 複数（直接） |
| **医療システム依存** | なし | 低（権限情報のみ） | 高（マスタデータ） |
| **実装状態** | 完成 | デモモード実装済み | 要追加実装 |

---

## 🎯 必要なデータベーステーブル

### A. 新規テーブル追加

**結論**: **不要**

UnauthorizedPageは既存の`User`テーブルのフィールドのみで動作可能です。

---

### B. 既存テーブル確認

#### User テーブル（既存）

UnauthorizedPageに必要なフィールド：

```prisma
model User {
  id              String      @id @default(cuid())
  employeeId      String      @unique @map("employee_id")

  // 権限情報（UnauthorizedPageで表示）
  permissionLevel Float       @map("permission_level")    // ✅ 既存
  accountType     String      @map("account_type")        // ✅ 既存
  role            String?                                  // ✅ 既存

  // その他の基本情報
  name            String
  email           String      @unique
  // ... その他のフィールド

  @@map("users")
}
```

**評価**: ✅ 必要なフィールドはすべて存在（追加不要）

---

## 📋 実装要件

### Phase 1: デモモードから実データへの移行

#### 現在の課題

UnauthorizedPageは現在、以下の点でデモモードに依存しています：

1. **ユーザー情報の取得**: `useDemoMode()`から取得
2. **デモデータ**: `demoUsers`配列（ハードコード）
3. **認証なし**: 実際のログイン処理が未実装

#### 実装すべき変更

##### 1. usePermissionsフックの修正

**現在**:
```typescript
export const usePermissions = (): UsePermissionsReturn => {
  const { currentUser: demoUser } = useDemoMode();  // デモモードから取得

  return {
    userLevel: demoUser?.permissionLevel || 1,
    accountType: demoUser?.accountType || 'STAFF',
    // ...
  };
};
```

**将来**:
```typescript
export const usePermissions = (): UsePermissionsReturn => {
  // 本番環境では実際の認証システムから取得
  const { currentUser } = useAuth();  // 🆕 実装が必要

  return {
    userLevel: currentUser?.permissionLevel || 1,
    accountType: currentUser?.accountType || 'STAFF',
    // ...
  };
};
```

##### 2. useAuthフックの実装（新規）

```typescript
// src/hooks/useAuth.ts（新規作成）
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
    // セッションから現在のユーザーを取得
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
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
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

##### 3. 認証APIエンドポイントの実装（新規）

```typescript
// src/api/auth.ts（新規作成）

/**
 * GET /api/auth/me
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
      role: true,
      // ... その他の必要なフィールド
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
}

/**
 * POST /api/auth/login
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
    // 初回ログイン時: 医療システムから職員情報を取得してUserを作成
    const employeeData = await medicalSystemAPI.getEmployee(authResult.employeeId);
    user = await prisma.user.create({
      data: {
        employeeId: employeeData.employeeId,
        name: employeeData.name,
        email: employeeData.email,
        permissionLevel: employeeData.permissionLevel,
        accountType: employeeData.accountType,
        role: employeeData.role,
        // ... その他のフィールド
      }
    });
  }

  // セッションを作成
  await createSession(req, res, user.id);

  res.json({ success: true, user });
}

/**
 * POST /api/auth/logout
 * ログアウト処理
 */
export async function logout(req: Request, res: Response) {
  await destroySession(req, res);
  res.json({ success: true });
}
```

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
UnauthorizedPage
  ↓ usePermissions()
useAuth()
  ↓ currentUser: User
GET /api/auth/me
  ↓ セッション確認
VoiceDrive User（キャッシュ）
  ↓ permissionLevel, accountType
表示: STAFF (Level 3.5)
  ↑
  │ Webhook同期（変更時）
  ↓
医療システム Employee（マスタ）
```

**データベースアクセス**: 1回（Userテーブル読み取り）

---

## 🔧 実装優先度

### Priority: 🟡 MEDIUM（認証システム実装時）

UnauthorizedPageは以下の理由により、**中程度の優先度**です：

1. **現時点では動作中**: デモモードで正常に表示される
2. **認証システムに依存**: 実データ表示には認証実装が前提
3. **新規テーブル不要**: 既存のUserテーブルで対応可能
4. **PersonalStationより優先度低**: PersonalStationの方が機能が多い

---

### 実装タイムライン

#### Phase 1: 認証システム基盤（2週間）
- [ ] useAuthフック実装
- [ ] セッション管理実装
- [ ] GET /api/auth/me 実装
- [ ] POST /api/auth/login 実装
- [ ] POST /api/auth/logout 実装
- [ ] 医療システム認証API連携

#### Phase 2: usePermissions修正（1週間）
- [ ] usePermissionsをuseAuthベースに変更
- [ ] デモモードとの切り替え機能（開発環境用）
- [ ] エラーハンドリング実装

#### Phase 3: UnauthorizedPage実データ対応（1日）
- [ ] usePermissionsの実データ表示確認
- [ ] エラーハンドリングテスト
- [ ] E2Eテスト

**合計工数**: 約3週間（認証システム全体の実装を含む）

---

## ✅ チェックリスト

### 現在の実装確認（デモモード）

- [x] UnauthorizedPageコンポーネントが存在する
- [x] usePermissionsフックが動作する
- [x] デモユーザーの権限レベルが表示される
- [x] デモユーザーのアカウントタイプが表示される
- [x] ホームへのリンクが機能する
- [x] レスポンシブデザインが適用されている

### 将来の実装（実データ対応）

- [ ] useAuthフック実装
- [ ] GET /api/auth/me 実装
- [ ] POST /api/auth/login 実装
- [ ] POST /api/auth/logout 実装
- [ ] usePermissionsをuseAuthベースに変更
- [ ] 医療システム認証API連携
- [ ] セッション管理実装
- [ ] UnauthorizedPageの実データ表示確認

### データベース作業

- [ ] **該当なし**: 既存のUserテーブルで対応可能（新規テーブル不要）

---

## 🔗 関連ドキュメント

- [データ管理責任分界点定義書](./データ管理責任分界点定義書_20251008.md)
- [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md)
- [NotFoundPage_DB要件分析_20251027.md](./NotFoundPage_DB要件分析_20251027.md)

---

## 📌 まとめ

### UnauthorizedPageの特徴

1. **半動的ページ**: 静的エラーメッセージ + 動的ユーザー情報
2. **既存テーブルで対応可能**: Userテーブルの既存フィールドを使用
3. **認証システムに依存**: useAuthフックの実装が前提
4. **新規テーブル不要**: PersonalStationとは異なり、追加テーブルが不要

### 3ページの比較サマリー

| 要素 | NotFoundPage | UnauthorizedPage | PersonalStation |
|-----|-------------|-----------------|----------------|
| **新規テーブル** | 不要 | 不要 | 2件必要 |
| **新規フィールド** | 不要 | 不要 | 1件必要 |
| **API呼び出し** | なし | 間接的（認証） | 複数（直接） |
| **医療システムAPI** | 不要 | 不要 | 2件必要 |
| **Webhook通知** | 不要 | 不要 | 4件必要 |
| **実装工数** | 0日（完成） | 3週間（認証含む） | 4-6週間 |

### 最終結論

**UnauthorizedPageは新規テーブルやフィールドの追加が不要ですが、実データ表示には認証システムの実装が必要です。**

現在はデモモードで正常に動作しており、認証システム実装後にusePermissionsフックを修正するだけで実データ対応が完了します。

---

**文書終了**

最終更新: 2025年10月27日
バージョン: 1.0
次回レビュー: 認証システム実装時
