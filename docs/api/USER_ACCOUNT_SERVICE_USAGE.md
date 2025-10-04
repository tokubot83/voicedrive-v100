# UserAccountService 使用ガイド

**作成日**: 2025年10月4日
**対象**: VoiceDriveシステム開発者
**目的**: 25レベル権限システム統合ユーザー作成サービスの使用方法

---

## 📋 概要

`UserAccountService`は医療システムAPIと統合した新規ユーザー作成・権限レベル管理サービスです。

### 主要機能

1. **新規ユーザー作成**（医療システムAPIで権限レベル自動計算）
2. **既存ユーザーの権限レベル再計算**
3. **全ユーザーのバッチ再計算**
4. **フォールバック機能**（API障害時の簡易計算）

---

## 🚀 基本的な使用方法

### 1. 新規ユーザー作成

```typescript
import { userAccountService } from '@/services/UserAccountService';

// 使用例1: 一般職員（経験年数ベース）
const result1 = await userAccountService.createUser({
  employeeId: 'STAFF_001',
  email: 'yamada@example.com',
  name: '山田花子',
  department: '看護部',
  facilityId: 'obara-hospital',
  position: 'なし',
  experienceYears: 1,
  canPerformLeaderDuty: false,
  professionCategory: 'nursing',
}, 'jwt-token-here');

console.log(result1);
// {
//   success: true,
//   userId: 'user_123',
//   user: {
//     id: 'user_123',
//     employeeId: 'STAFF_001',
//     accountType: 'NEW_STAFF',
//     permissionLevel: 1.0,
//     canPerformLeaderDuty: false,
//   },
//   fallbackUsed: false
// }
```

### 2. 看護職リーダー可（0.5刻みレベル）

```typescript
// 使用例2: 看護職リーダー業務可能
const result2 = await userAccountService.createUser({
  employeeId: 'STAFF_002',
  email: 'sato@example.com',
  name: '佐藤太郎',
  department: '看護部',
  facilityId: 'obara-hospital',
  position: 'なし',
  experienceYears: 2,
  canPerformLeaderDuty: true,  // リーダー業務可
  professionCategory: 'nursing',
}, 'jwt-token-here');

console.log(result2);
// {
//   success: true,
//   user: {
//     accountType: 'JUNIOR_STAFF_LEADER',
//     permissionLevel: 2.5,  // 2.0 + 0.5
//     canPerformLeaderDuty: true,
//   }
// }
```

### 3. 役職付き職員

```typescript
// 使用例3: 統括主任（施設別調整あり）
const result3 = await userAccountService.createUser({
  employeeId: 'STAFF_003',
  email: 'tanaka@example.com',
  name: '田中美穂',
  department: 'リハビリ科',
  facilityId: 'tategami-rehabilitation',
  position: '統括主任',  // 立神リハビリで特別Level 7
  experienceYears: 15,
  professionCategory: 'rehabilitation',
}, 'jwt-token-here');

console.log(result3);
// {
//   success: true,
//   user: {
//     accountType: 'DEPUTY_MANAGER',
//     permissionLevel: 7.0,  // 施設別調整適用
//   }
// }
```

### 4. 特別権限レベル

```typescript
// 使用例4: 産業医（レベル98）
const result4 = await userAccountService.createUser({
  employeeId: 'STAFF_098',
  email: 'industrial-physician@example.com',
  name: '産業医太郎',
  department: '健康管理室',
  isOccupationalPhysician: true,  // 産業医フラグ
}, 'jwt-token-here');

console.log(result4);
// {
//   success: true,
//   user: {
//     accountType: 'OCCUPATIONAL_PHYSICIAN',
//     permissionLevel: 98,
//   }
// }

// 使用例5: システム管理者（レベル99）
const result5 = await userAccountService.createUser({
  employeeId: 'ADMIN_001',
  email: 'admin@example.com',
  name: 'システム管理者',
  department: 'IT部',
  isSystemAdmin: true,  // システム管理者フラグ
}, 'jwt-token-here');

console.log(result5);
// {
//   success: true,
//   user: {
//     accountType: 'SYSTEM_ADMIN',
//     permissionLevel: 99,
//   }
// }
```

---

## 🔄 既存ユーザーの権限レベル再計算

### 単一ユーザーの再計算

```typescript
// 経験年数や役職変更後に権限レベルを再計算
const result = await userAccountService.recalculateUserPermissionLevel(
  'STAFF_001',
  'jwt-token-here'
);

console.log(result);
// {
//   success: true,
//   permissionLevel: 3.0  // 更新後のレベル
// }
```

### 全ユーザーのバッチ再計算

```typescript
// マイグレーション後など、全ユーザーの権限レベルを一括再計算
const result = await userAccountService.recalculateAllUsersPermissionLevels(
  'jwt-token-here',
  10  // バッチサイズ（10件ずつ処理）
);

console.log(result);
// {
//   success: true,
//   totalUsers: 750,
//   successCount: 745,
//   failedCount: 5,
//   errors: [
//     { employeeId: 'STAFF_999', error: 'APIタイムアウト' }
//   ]
// }
```

---

## 🛡️ フォールバック機能

### API障害時の動作

医療システムAPIが応答しない場合、自動的に簡易計算で暫定レベルを返します。

```typescript
// API障害時もユーザー作成は継続
const result = await userAccountService.createUser({
  employeeId: 'STAFF_001',
  email: 'test@example.com',
  name: 'テストユーザー',
  position: '主任',
  experienceYears: 5,
}, 'jwt-token-here');

console.log(result);
// {
//   success: true,
//   user: {
//     permissionLevel: 6.0,  // フォールバック計算結果
//   },
//   fallbackUsed: true  // フォールバック機能使用
// }
```

### フォールバック計算ルール

| 条件 | 計算方法 |
|-----|---------|
| 経験年数のみ | 1年目→1, 2-3年目→2, 4-10年目→3, 11年以上→4 |
| 役職あり | 役職マッピング表から取得（経験年数より優先） |
| 看護職リーダー可 | 基本レベル + 0.5（Level 1-4のみ） |

---

## 🧪 テスト実装

### ユニットテスト例

```typescript
import { userAccountService } from '@/services/UserAccountService';

describe('UserAccountService', () => {
  it('看護職リーダー可の場合、0.5加算される', async () => {
    const result = await userAccountService.createUser({
      employeeId: 'TEST_001',
      email: 'test@example.com',
      name: 'テスト',
      experienceYears: 2,
      canPerformLeaderDuty: true,
      professionCategory: 'nursing',
    }, 'test-token');

    expect(result.success).toBe(true);
    expect(result.user?.permissionLevel).toBe(2.5);
    expect(result.user?.accountType).toBe('JUNIOR_STAFF_LEADER');
  });

  it('フォールバック機能が動作する', async () => {
    // 医療システムAPIを無効化してテスト
    const result = await userAccountService.createUser({
      employeeId: 'TEST_002',
      email: 'test2@example.com',
      name: 'テスト2',
      position: '師長',
    }, 'invalid-token');

    expect(result.success).toBe(true);
    expect(result.fallbackUsed).toBe(true);
    expect(result.user?.permissionLevel).toBe(8.0);
  });
});
```

---

## ⚠️ 注意事項

### 1. JWTトークンの管理

```typescript
// ❌ 悪い例: トークンをハードコード
const result = await userAccountService.createUser(data, 'hardcoded-token');

// ✅ 良い例: 環境変数またはセッションから取得
const token = process.env.MEDICAL_API_TOKEN || req.session.token;
const result = await userAccountService.createUser(data, token);
```

### 2. エラーハンドリング

```typescript
// ✅ 必ずエラーチェックを実施
const result = await userAccountService.createUser(data, token);

if (!result.success) {
  console.error('ユーザー作成失敗:', result.error);
  // エラー処理
  return;
}

// 成功時の処理
console.log('ユーザー作成成功:', result.user);
```

### 3. フォールバック使用の通知

```typescript
if (result.fallbackUsed) {
  console.warn('⚠️ フォールバック機能使用: 医療システムAPIで再計算を推奨');
  // 後でバッチ再計算を実行
}
```

---

## 🔌 医療システムAPIとの通信

### リクエスト例

```http
POST http://localhost:3000/api/v1/calculate-level
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "staffId": "STAFF_001",
  "facilityId": "obara-hospital",
  "position": "主任",
  "experienceYears": 5,
  "canPerformLeaderDuty": false,
  "profession": "nursing"
}
```

### レスポンス例

```json
{
  "staffId": "STAFF_001",
  "facilityId": "obara-hospital",
  "position": "主任",
  "accountLevel": 6.0,
  "accountType": "CHIEF",
  "canPerformLeaderDuty": false,
  "professionCategory": "nursing",
  "breakdown": {
    "baseLevel": 6,
    "leaderDutyAdjustment": 0,
    "facilityAdjustment": 0,
    "finalLevel": 6.0
  }
}
```

---

## 📊 レベル一覧表

### 基本18レベル

| Level | アカウントタイプ | 日本語名 |
|-------|---------------|---------|
| 1 | NEW_STAFF | 新人（1年目） |
| 2 | JUNIOR_STAFF | 若手（2-3年目） |
| 3 | MIDLEVEL_STAFF | 中堅（4-10年目） |
| 4 | VETERAN_STAFF | ベテラン（11年以上） |
| 5 | DEPUTY_CHIEF | 副主任 |
| 6 | CHIEF | 主任 |
| 7 | DEPUTY_MANAGER | 副師長・副科長 |
| 8 | MANAGER | 師長・科長・課長 |
| 9 | DEPUTY_DIRECTOR | 副部長 |
| 10 | DIRECTOR | 部長・医局長 |
| 11 | ADMINISTRATIVE_DIRECTOR | 事務長 |
| 12 | VICE_PRESIDENT | 副院長 |
| 13 | PRESIDENT | 院長・施設長 |
| 14 | HR_STAFF | 人事部門員 |
| 15 | HR_MANAGER | 人事各部門長 |
| 16 | STRATEGIC_PLANNING_STAFF | 戦略企画部門員 |
| 17 | STRATEGIC_PLANNING_MANAGER | 戦略企画部門長 |
| 18 | BOARD_MEMBER | 理事 |

### 看護職専用レベル

| Level | アカウントタイプ | 条件 |
|-------|---------------|------|
| 1.5 | NEW_STAFF_LEADER | 1年目 + リーダー可 |
| 2.5 | JUNIOR_STAFF_LEADER | 2-3年目 + リーダー可 |
| 3.5 | MIDLEVEL_STAFF_LEADER | 4-10年目 + リーダー可 |
| 4.5 | VETERAN_STAFF_LEADER | 11年以上 + リーダー可 |

### 特別権限レベル

| Level | アカウントタイプ | 用途 |
|-------|---------------|------|
| 97 | HEALTH_CHECKUP_STAFF | 健診担当者（ストレスチェック実施者） |
| 98 | OCCUPATIONAL_PHYSICIAN | 産業医 |
| 99 | SYSTEM_ADMIN | システム管理者 |

---

## 📞 サポート

### 医療システムチームへの問い合わせ

- API仕様の詳細: medical-api@example.com
- 統合テスト: medical-integration@example.com

### VoiceDriveチーム

- 実装サポート: voicedrive-dev@example.com

---

**最終更新**: 2025年10月4日
**次のアクション**: Step 3（既存データ移行）の実施
