# 委員会管理ページ 暫定マスターリスト

**文書番号**: CM-MASTER-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**目的**: 委員会管理ページの実装完了に向けた作業一覧
**関連文書**: CommitteeManagement_DB要件分析_20251009.md

---

## 📋 プロジェクト概要

### 現状
- ✅ UI完全実装済み（4タブ、840行）
- ✅ 型定義完備（167行）
- ✅ サービス層実装（370行）
- ❌ **DB未統合**（デモデータのみ）
- ❌ **医療システムAPI未連携**

### 目標
委員会管理ページを**本番運用可能な状態**にする

### 推定作業時間
**合計: 6日間**（DB構築3日 + API連携2日 + UI統合1日）

---

## ✅ 作業リスト

### Phase 1: DB構築（3日間）

#### 1.1 schema.prisma更新 ⏱️ 2時間

**担当**: VoiceDriveチーム
**優先度**: 🔴 最高
**依存**: なし

**作業内容**:
- [ ] `ManagementCommitteeAgenda`モデル追加
- [ ] `CommitteeInfo`モデル追加
- [ ] `CommitteeMember`モデル追加
- [ ] `CommitteeMeeting`モデル追加
- [ ] `CommitteeSubmissionRequest`モデル追加
- [ ] `User`モデルにリレーション追加
- [ ] `Post`モデルにリレーション追加

**ファイル**:
- `prisma/schema.prisma`

**検証方法**:
```bash
npx prisma format
npx prisma validate
```

---

#### 1.2 Prisma Migration実行 ⏱️ 30分

**担当**: VoiceDriveチーム
**優先度**: 🔴 最高
**依存**: 1.1完了

**作業内容**:
- [ ] マイグレーションファイル生成
```bash
npx prisma migrate dev --name add_committee_management_tables
```
- [ ] マイグレーション実行確認
- [ ] Prisma Client再生成
```bash
npx prisma generate
```

**検証方法**:
```bash
npx prisma studio  # テーブル確認
```

---

#### 1.3 デモデータ投入 ⏱️ 3時間

**担当**: VoiceDriveチーム
**優先度**: 🟡 中
**依存**: 1.2完了

**作業内容**:
- [ ] デモデータ投入スクリプト作成（`scripts/seed-committee-data.ts`）
  - [ ] 委員会8件（運営、医療安全、感染対策、教育、業務改善、倫理、災害対策、褥瘡対策）
  - [ ] 議題6件（夜勤体制、電子カルテ、職員食堂、新人教育、感染対策備品、Wi-Fi増強）
  - [ ] 会議スケジュール3件
  - [ ] 提出承認リクエスト3件
  - [ ] 委員会メンバー30件
- [ ] シードスクリプト実行
```bash
npx tsx scripts/seed-committee-data.ts
```

**デモデータ詳細**:

**委員会**:
| 委員会名 | メンバー数 | 委員長 | 次回開催 |
|---------|----------|--------|---------|
| 運営委員会 | 12 | 院長 | 2025-10-15 |
| 医療安全委員会 | 10 | 副院長 | 2025-10-12 |
| 感染対策委員会 | 8 | 感染管理認定看護師 | 2025-10-18 |
| 教育委員会 | 7 | 看護部長 | 2025-10-20 |
| 業務改善委員会 | 9 | 事務長 | 2025-10-14 |
| 倫理委員会 | 6 | 医局長 | 2025-10-22 |
| 災害対策委員会 | 8 | 副院長 | 2025-10-25 |
| 褥瘡対策委員会 | 5 | 皮膚・排泄ケア認定看護師 | 2025-10-19 |

**議題**:
| タイトル | タイプ | ステータス | 優先度 | 予算 |
|---------|--------|-----------|-------|------|
| 夜勤体制の見直しと人員配置最適化 | personnel | approved | high | ¥500,000 |
| 電子カルテシステムのUI改善 | equipment | in_review | high | ¥2,000,000 |
| 職員食堂のメニュー拡充と営業時間延長 | facility_policy | pending | normal | ¥300,000 |
| 新人教育プログラムの見直し | committee_proposal | approved | urgent | ¥800,000 |
| 感染対策用備品の増設 | budget | deferred | high | ¥1,500,000 |
| 院内Wi-Fiの増強と5G対応 | equipment | rejected | normal | ¥5,000,000 |

**検証方法**:
```bash
npx prisma studio  # データ確認
```

---

#### 1.4 ManagementCommitteeService.ts DB版移行 ⏱️ 4時間

**担当**: VoiceDriveチーム
**優先度**: 🔴 最高
**依存**: 1.3完了

**作業内容**:
- [ ] デモデータ削除（`initializeDemoData()`）
- [ ] Prisma Client統合
- [ ] `getAgendas()`をDB版に変更
- [ ] `getCommittees()`をDB版に変更
- [ ] `getMeetings()`をDB版に変更
- [ ] `getStats()`をDB版に変更
- [ ] エラーハンドリング追加

**変更ファイル**:
- `src/services/ManagementCommitteeService.ts`

**実装例**:
```typescript
import { PrismaClient } from '@prisma/client';

export class ManagementCommitteeService {
  private static instance: ManagementCommitteeService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public async getAgendas(filters?: {
    status?: string;
    priority?: string;
    agendaType?: string;
    searchQuery?: string;
  }): Promise<ManagementCommitteeAgenda[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.agendaType) where.agendaType = filters.agendaType;

    if (filters?.searchQuery) {
      where.OR = [
        { title: { contains: filters.searchQuery } },
        { description: { contains: filters.searchQuery } },
        { proposedBy: { contains: filters.searchQuery } }
      ];
    }

    const agendas = await this.prisma.managementCommitteeAgenda.findMany({
      where,
      orderBy: { proposedDate: 'desc' }
    });

    return agendas;
  }

  // ... 他のメソッドも同様にDB版に変更
}
```

**検証方法**:
```bash
npm run dev  # 開発サーバー起動
# ブラウザで https://voicedrive-v100.vercel.app/committee-management を確認
```

---

#### 1.5 統合テスト（CRUD操作） ⏱️ 2時間

**担当**: VoiceDriveチーム
**優先度**: 🟡 中
**依存**: 1.4完了

**作業内容**:
- [ ] 議題作成テスト
- [ ] 議題一覧取得テスト
- [ ] 議題更新テスト（ステータス変更）
- [ ] 議題削除テスト
- [ ] フィルター機能テスト（3軸同時）
- [ ] 検索機能テスト
- [ ] 統計サマリーテスト

**テストファイル**:
- `tests/committee-management.test.ts`

**実装例**:
```typescript
import { managementCommitteeService } from '../src/services/ManagementCommitteeService';

describe('CommitteeManagement Service', () => {
  test('議題一覧取得', async () => {
    const agendas = await managementCommitteeService.getAgendas();
    expect(agendas.length).toBeGreaterThan(0);
  });

  test('フィルター: ステータス = pending', async () => {
    const agendas = await managementCommitteeService.getAgendas({ status: 'pending' });
    expect(agendas.every(a => a.status === 'pending')).toBe(true);
  });

  // ... 他のテストケース
});
```

---

### Phase 2: 医療システムAPI連携（2日間）

#### 2.1 医療システムAPI仕様書作成 ⏱️ 2時間

**担当**: VoiceDriveチーム + 医療チーム
**優先度**: 🔴 最高
**依存**: Phase 1完了

**作業内容**:
- [ ] API仕様書作成（`mcp-shared/docs/CommitteeManagement_API仕様書_20251009.md`）
  - [ ] エンドポイント定義
  - [ ] リクエスト/レスポンス例
  - [ ] 認証方式
  - [ ] エラーコード定義

**必要なAPI**:
1. `GET /api/employees/{employeeId}` - 職員情報取得
2. `POST /api/employees/batch` - 職員情報一括取得
3. `GET /api/departments` - 部署マスタ取得

**サンプル仕様**:
```yaml
GET /api/employees/{employeeId}:
  summary: 職員情報取得
  parameters:
    - name: employeeId
      in: path
      required: true
      schema:
        type: string
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
            properties:
              employeeId: { type: string }
              name: { type: string }
              department: { type: string }
              position: { type: string }
              permissionLevel: { type: number }
```

---

#### 2.2 VoiceDrive側API呼び出しロジック実装 ⏱️ 3時間

**担当**: VoiceDriveチーム
**優先度**: 🔴 最高
**依存**: 2.1完了

**作業内容**:
- [ ] API Client作成（`src/services/MedicalSystemAPIClient.ts`）
- [ ] 職員情報取得関数実装
- [ ] 部署マスタ取得関数実装
- [ ] エラーハンドリング実装
- [ ] リトライロジック実装

**実装ファイル**:
- `src/services/MedicalSystemAPIClient.ts`

**実装例**:
```typescript
export class MedicalSystemAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.MEDICAL_SYSTEM_API_URL || '';
    this.apiKey = process.env.MEDICAL_SYSTEM_API_KEY || '';
  }

  async getEmployee(employeeId: string): Promise<EmployeeInfo> {
    const response = await fetch(`${this.baseUrl}/api/employees/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.statusText}`);
    }

    return await response.json();
  }

  async getEmployeesBatch(employeeIds: string[]): Promise<EmployeeInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/employees/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employeeIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch employees batch: ${response.statusText}`);
    }

    const data = await response.json();
    return data.employees;
  }

  async getDepartments(): Promise<Department[]> {
    const response = await fetch(`${this.baseUrl}/api/departments`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.departments;
  }
}

export const medicalSystemAPI = new MedicalSystemAPIClient();
```

---

#### 2.3 キャッシュ戦略実装 ⏱️ 2時間

**担当**: VoiceDriveチーム
**優先度**: 🟡 中
**依存**: 2.2完了

**作業内容**:
- [ ] 職員情報キャッシュロジック実装
- [ ] キャッシュ有効期限設定（1時間）
- [ ] キャッシュ無効化機能実装
- [ ] 部署マスタキャッシュ実装（日次更新）

**実装方針**:
```typescript
// 職員情報キャッシュ（メモリ）
const employeeCache = new Map<string, { data: EmployeeInfo, expiry: number }>();

export async function getEmployeeWithCache(employeeId: string): Promise<EmployeeInfo> {
  const cached = employeeCache.get(employeeId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const employee = await medicalSystemAPI.getEmployee(employeeId);
  employeeCache.set(employeeId, {
    data: employee,
    expiry: Date.now() + 3600000 // 1時間
  });

  return employee;
}
```

---

#### 2.4 医療システム側API実装 ⏱️ 4時間

**担当**: 医療チーム
**優先度**: 🔴 最高
**依存**: 2.1完了

**作業内容**:
- [ ] `GET /api/employees/{employeeId}`実装
- [ ] `POST /api/employees/batch`実装
- [ ] `GET /api/departments`実装
- [ ] JWT認証実装
- [ ] レート制限実装

**実装場所**:
- 医療システムAPIサーバー

**テストデータ**:
```json
// 職員情報サンプル
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "department": "内科",
  "position": "看護師",
  "permissionLevel": 6.0
}

// 部署マスタサンプル
{
  "departments": [
    { "id": "medical_care_ward", "name": "内科", "facilityId": "obara-hospital" },
    { "id": "surgical_ward", "name": "外科", "facilityId": "obara-hospital" }
  ]
}
```

---

#### 2.5 統合テスト（API連携） ⏱️ 3時間

**担当**: VoiceDriveチーム + 医療チーム
**優先度**: 🔴 最高
**依存**: 2.2, 2.4完了

**作業内容**:
- [ ] 職員情報取得テスト（単体）
- [ ] 職員情報一括取得テスト
- [ ] 部署マスタ取得テスト
- [ ] エラーケーステスト（404, 500等）
- [ ] パフォーマンステスト（応答時間 < 500ms）

**テストファイル**:
- `tests/medical-system-api.test.ts`

**実装例**:
```typescript
describe('MedicalSystemAPI Integration', () => {
  test('職員情報取得', async () => {
    const employee = await medicalSystemAPI.getEmployee('OH-NS-2024-001');
    expect(employee.name).toBe('山田 花子');
  });

  test('職員情報一括取得', async () => {
    const employees = await medicalSystemAPI.getEmployeesBatch([
      'OH-NS-2024-001',
      'OH-NS-2024-002'
    ]);
    expect(employees.length).toBe(2);
  });

  test('エラーハンドリング: 存在しない職員', async () => {
    await expect(medicalSystemAPI.getEmployee('INVALID-ID'))
      .rejects.toThrow('Failed to fetch employee');
  });
});
```

---

### Phase 3: UI統合（1日間）

#### 3.1 CommitteeManagementPage.tsx DB接続 ⏱️ 2時間

**担当**: VoiceDriveチーム
**優先度**: 🔴 最高
**依存**: Phase 2完了

**作業内容**:
- [ ] `loadAgendas()`を非同期版に変更
- [ ] `loadCommittees()`を非同期版に変更
- [ ] `loadMeetings()`を非同期版に変更
- [ ] ローディング状態追加
- [ ] エラー表示追加

**変更ファイル**:
- `src/pages/CommitteeManagementPage.tsx`

**実装例**:
```typescript
const [agendas, setAgendas] = useState<ManagementCommitteeAgenda[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadAgendas = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await managementCommitteeService.getAgendas(agendaFilter);
    setAgendas(data);
  } catch (err) {
    setError('議題の読み込みに失敗しました');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

---

#### 3.2 リアルタイムデータ表示確認 ⏱️ 1時間

**担当**: VoiceDriveチーム
**優先度**: 🟡 中
**依存**: 3.1完了

**作業内容**:
- [ ] 議題一覧表示確認
- [ ] 検索機能確認
- [ ] フィルター機能確認（3軸同時）
- [ ] 統計サマリー確認
- [ ] 委員会一覧確認
- [ ] 会議スケジュール確認

**確認手順**:
1. `npm run dev`で開発サーバー起動
2. ブラウザで`/committee-management`にアクセス
3. 各タブの動作確認
4. 検索・フィルター動作確認

---

#### 3.3 E2Eテスト ⏱️ 2時間

**担当**: VoiceDriveチーム
**優先度**: 🟡 中
**依存**: 3.2完了

**作業内容**:
- [ ] E2Eテストシナリオ作成
- [ ] Playwrightテスト実装
- [ ] CI/CD統合

**テストファイル**:
- `e2e/committee-management.spec.ts`

**シナリオ例**:
```typescript
test('委員会管理ページ: 議題検索', async ({ page }) => {
  await page.goto('/committee-management');

  // 議題一覧タブクリック
  await page.click('text=議題一覧');

  // 検索バーに入力
  await page.fill('input[placeholder*="検索"]', '夜勤');

  // 検索結果確認
  await expect(page.locator('text=夜勤体制の見直し')).toBeVisible();
});
```

---

## 🚧 ブロッカー・依存関係

### 医療チームへの依存
1. **API実装**（2.4） - 医療チーム側の開発必須
2. **初期データ提供** - 委員会リスト、メンバー情報

### 技術的ブロッカー
1. **MySQL移行** - 現在SQLiteだが、将来的にMySQL移行予定
   - 影響: マイグレーションファイルの再作成が必要
   - 対策: MySQL移行後に再度マイグレーション実行

---

## 📊 進捗管理

### Phase 1: DB構築
- [ ] 1.1 schema.prisma更新（2時間）
- [ ] 1.2 Prisma Migration実行（30分）
- [ ] 1.3 デモデータ投入（3時間）
- [ ] 1.4 ManagementCommitteeService.ts DB版移行（4時間）
- [ ] 1.5 統合テスト（2時間）

**小計**: 11.5時間 ≈ **3日間**

---

### Phase 2: 医療システムAPI連携
- [ ] 2.1 医療システムAPI仕様書作成（2時間）
- [ ] 2.2 VoiceDrive側API呼び出しロジック実装（3時間）
- [ ] 2.3 キャッシュ戦略実装（2時間）
- [ ] 2.4 医療システム側API実装（4時間） ※医療チーム
- [ ] 2.5 統合テスト（3時間）

**小計**: 14時間 ≈ **2日間**

---

### Phase 3: UI統合
- [ ] 3.1 CommitteeManagementPage.tsx DB接続（2時間）
- [ ] 3.2 リアルタイムデータ表示確認（1時間）
- [ ] 3.3 E2Eテスト（2時間）

**小計**: 5時間 ≈ **1日間**

---

## ✅ 完了基準

### 機能要件
- [ ] 4タブ全て動作（提出承認、議題一覧、カレンダー、委員会一覧）
- [ ] 検索機能正常動作（議題タイトル、提案者、説明）
- [ ] フィルター機能正常動作（ステータス × 優先度 × タイプ）
- [ ] 承認・却下フロー正常動作（Level 8+権限チェック）
- [ ] 統計サマリー正確表示

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] データ整合性100%（医療システムと）
- [ ] エラーハンドリング完備

### テスト
- [ ] 単体テスト合格率100%
- [ ] 統合テスト合格率100%
- [ ] E2Eテスト合格率100%

---

## 🎯 優先度判定

### 🔴 最高優先度（すぐに着手）
1. schema.prisma更新（1.1）
2. Prisma Migration実行（1.2）
3. ManagementCommitteeService.ts DB版移行（1.4）
4. 医療システムAPI仕様書作成（2.1）
5. VoiceDrive側API呼び出しロジック実装（2.2）
6. 医療システム側API実装（2.4）
7. CommitteeManagementPage.tsx DB接続（3.1）

### 🟡 中優先度（Phase 1完了後）
1. デモデータ投入（1.3）
2. 統合テスト（1.5, 2.5）
3. キャッシュ戦略実装（2.3）
4. リアルタイムデータ表示確認（3.2）
5. E2Eテスト（3.3）

---

## 📞 医療チームへの依頼事項

### 依頼1: API実装（2.4）
**期限**: Phase 1完了後（3日後）
**内容**:
- `GET /api/employees/{employeeId}`
- `POST /api/employees/batch`
- `GET /api/departments`

### 依頼2: 初期データ提供
**期限**: Phase 1完了後（3日後）
**内容**:
- 委員会リスト（8委員会）
- 委員会メンバー情報（各委員会の構成員）
- 委員長employeeId

### 依頼3: API仕様確認
**期限**: 2日以内
**内容**:
- API仕様書レビュー
- 認証方式確認
- レスポンス形式確認

---

## 📚 関連文書

- [CommitteeManagement_DB要件分析_20251009.md](mcp-shared/docs/CommitteeManagement_DB要件分析_20251009.md)
- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [CommitteeManagementPage.tsx](src/pages/CommitteeManagementPage.tsx)
- [src/types/committee.ts](src/types/committee.ts)
- [src/services/ManagementCommitteeService.ts](src/services/ManagementCommitteeService.ts)

---

## 🔄 次のアクション

### VoiceDriveチーム
1. ✅ DB要件分析完了
2. ✅ 暫定マスターリスト作成
3. ⏭️ schema.prisma更新（1.1）
4. ⏭️ 医療チームにAPI仕様書レビュー依頼

### 医療チーム
1. ⏭️ API仕様書レビュー
2. ⏭️ 初期データ準備
3. ⏭️ API実装開始

---

**文書終了**

最終更新: 2025年10月9日
バージョン: 1.0
承認: 未承認（レビュー待ち）
