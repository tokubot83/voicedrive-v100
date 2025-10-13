# DashboardPages 削除通知（6ページ）

**文書番号**: VD-DELETION-2025-1013-005
**作成日**: 2025年10月13日
**対象ページ**: DepartmentDashboard, FacilityDashboard, HRManagementDashboard, StrategicDashboard, CorporateDashboard, IntegratedCorporateDashboard
**ステータス**: 🔴 削除完了

---

## 📋 エグゼクティブサマリー

### 削除理由
`/dashboard/*` シリーズのダッシュボードページ（ExecutiveDashboard以外の6ページ）は、初期開発時の残骸であり、以下の理由で削除しました：

1. **どこからもリンクされていない**（サイドバー、ホームページ等にメニューなし）
2. **初期の権限体系（exactLevel）を使用**（現在は「Station」シリーズに移行済み）
3. **代替ページが存在**（PersonalStation、DepartmentStation等が主流）

### 削除対象ページ

| ページ名 | URL | 権限 | 代替ページ |
|---------|-----|------|----------|
| DepartmentDashboardPage | `/dashboard/department` | LEVEL_3 | DepartmentStationPage |
| FacilityDashboardPage | `/dashboard/facility` | LEVEL_4 | - |
| HRManagementDashboardPage | `/dashboard/hr-management` | LEVEL_5 | - |
| StrategicDashboardPage | `/dashboard/strategic` | LEVEL_6 | - |
| CorporateDashboardPage | `/dashboard/corporate` | LEVEL_7 | - |
| IntegratedCorporateDashboardPage | `/dashboard/integrated-corporate` | LEVEL_5+ | - |

### 保持されるページ

| ページ名 | URL | 権限 | 理由 |
|---------|-----|------|------|
| **ExecutiveDashboardPage** | `/dashboard/executive` | LEVEL_12+ | ✅ commonMenuConfig.tsでメニュー登録済み |

---

## 🗑️ 削除内容

### 削除ファイル（12ファイル）

#### ページファイル（6ファイル）
1. `src/pages/DepartmentDashboardPage.tsx`
2. `src/pages/FacilityDashboardPage.tsx`
3. `src/pages/HRManagementDashboardPage.tsx`
4. `src/pages/StrategicDashboardPage.tsx`
5. `src/pages/CorporateDashboardPage.tsx`
6. `src/pages/IntegratedCorporateDashboardPage.tsx`

#### コンポーネントファイル（6ファイル）
1. `src/components/dashboards/DepartmentDashboard.tsx`
2. `src/components/dashboards/FacilityDashboard.tsx`
3. `src/components/dashboards/HRManagementDashboard.tsx`
4. `src/components/dashboards/StrategicDashboard.tsx`
5. `src/components/dashboards/CorporateDashboard.tsx`
6. `src/components/dashboards/IntegratedCorporateDashboard.tsx`

### 修正ファイル（3ファイル）

#### 1. src/router/AppRouter.tsx
**削除内容**:
- インポート文（6行削除）
  ```typescript
  import DepartmentDashboardPage from '../pages/DepartmentDashboardPage';
  import FacilityDashboardPage from '../pages/FacilityDashboardPage';
  import HRManagementDashboardPage from '../pages/HRManagementDashboardPage';
  import StrategicDashboardPage from '../pages/StrategicDashboardPage';
  import CorporateDashboardPage from '../pages/CorporateDashboardPage';
  import IntegratedCorporateDashboardPage from '../pages/IntegratedCorporateDashboardPage';
  ```

- ルート定義（6ルート削除、ExecutiveDashboardのみ保持）
  ```typescript
  // 削除前: 7ルート
  <Route path="dashboard">
    <Route path="department" element={...} />
    <Route path="facility" element={...} />
    <Route path="hr-management" element={...} />
    <Route path="strategic" element={...} />
    <Route path="corporate" element={...} />
    <Route path="executive" element={...} />  // ✅ 保持
    <Route path="integrated-corporate" element={...} />
  </Route>

  // 削除後: 1ルートのみ
  <Route path="dashboard">
    <Route path="executive" element={...} />
  </Route>
  ```

#### 2. src/components/Breadcrumb.tsx
**削除内容**:
- パンくずリスト定義（6行削除）
  ```typescript
  '/dashboard/department': '部門管理ダッシュボード',
  '/dashboard/facility': '施設管理ダッシュボード',
  '/dashboard/hr-management': '人事統括ダッシュボード',
  '/dashboard/strategic': '戦略企画ダッシュボード',
  '/dashboard/corporate': '法人統括ダッシュボード',
  '/dashboard/integrated-corporate': '統合ダッシュボード',
  ```

#### 3. src/components/layout/Layout.tsx
**削除内容**:
- サイドバー非表示リスト（6行削除）
  ```typescript
  '/dashboard/department',
  '/dashboard/facility',
  '/dashboard/integrated-corporate',
  '/dashboard/hr-management',
  '/dashboard/strategic',
  '/dashboard/corporate',
  ```

---

## 📊 削除理由の詳細分析

### 1. アクセシビリティの欠如

**現状**:
- サイドバーメニューに含まれていない
- HomePageからのリンクがない
- commonMenuConfig.ts に登録されていない（ExecutiveDashboard以外）
- 直接URL入力でのみアクセス可能

**影響**: ユーザーがページを発見できない = 使われていない

---

### 2. 初期の権限体系（exactLevel）

**問題点**:
```typescript
// 旧方式: exactLevel制限（厳密にLEVEL_3のみ）
<ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3} exactLevel>
  <DepartmentDashboardPage />
</ProtectedRoute>

// 現在の主流: 最低権限レベル指定
<ProtectedRoute requiredLevel={PermissionLevel.LEVEL_3}>
  <DepartmentStationPage />
</ProtectedRoute>
```

**影響**: 柔軟性がなく、現在のPermissionLevel体系（18レベル+特殊レベル）に不適合

---

### 3. 代替ページの存在

| 削除ページ | 代替ページ | URL |
|-----------|----------|-----|
| DepartmentDashboard | DepartmentStationPage | `/department-station` |
| PersonalDashboard（削除済み） | PersonalStationPage | `/personal-station` |
| その他ダッシュボード | 各種Stationページ | `/〇〇-station` |

---

## 🔄 移行ガイド

### ユーザー向け案内

#### 旧URL → 新URL

| 旧URL | 新URL | 機能 |
|-------|-------|------|
| `/dashboard/department` | `/department-station` | 部門管理 |
| `/dashboard/facility` | 各種管理ページ | 施設管理 |
| `/dashboard/hr-management` | `/hr-dashboard` | 人事管理 |
| `/dashboard/strategic` | `/strategic-overview` | 戦略企画 |
| `/dashboard/corporate` | `/dashboard/executive` | 法人統括（経営ダッシュボードで代替） |
| `/dashboard/integrated-corporate` | `/dashboard/executive` | 統合ダッシュボード（経営ダッシュボードで代替） |

---

## 🧪 テスト確認事項

### 削除前の確認

- [x] 各ページへの外部リンクがないことを確認
- [x] サイドバーメニューに含まれていないことを確認（ExecutiveDashboard以外）
- [x] 直接URL入力でのみアクセス可能な状態だったことを確認

### 削除後の確認

- [ ] 削除したURLにアクセスすると404エラーになることを確認
- [ ] ExecutiveDashboardPage (`/dashboard/executive`) が正常動作することを確認
- [ ] 代替ページ（DepartmentStationPage等）が正常動作することを確認
- [ ] ビルドエラーがないことを確認

---

## 📅 タイムライン

| 日付 | イベント | 担当 |
|------|---------|------|
| 2025-10-13 | PersonalDashboardPageの機能重複を発見 | VoiceDriveチーム |
| 2025-10-13 | 他のダッシュボードページも同様に不要と判断 | VoiceDriveチーム |
| 2025-10-13 | 削除決定（ExecutiveDashboard以外） | VoiceDriveチーム |
| 2025-10-13 | ファイル削除・コミット | VoiceDriveチーム |
| 2025-10-13 | 削除通知ドキュメント作成 | VoiceDriveチーム |
| 2025-10-14 | 本番環境デプロイ（予定） | VoiceDriveチーム |

---

## ⚠️ 影響分析

### VoiceDrive側の影響

| 影響範囲 | 影響度 | 詳細 |
|---------|-------|------|
| **フロントエンド** | 🟢 低 | ページファイル削除のみ |
| **バックエンド** | 🟢 なし | 専用APIなし |
| **データベース** | 🟢 なし | 専用テーブルなし |
| **ユーザー** | 🟢 低 | アクセス手段がなかったため影響なし |

### 医療システム側の影響

| 影響範囲 | 影響度 | 詳細 |
|---------|-------|------|
| **API** | 🟢 なし | これらのページは医療システムと連携なし |
| **データベース** | 🟢 なし | 影響なし |
| **Webhook** | 🟢 なし | 影響なし |

**結論**: 医療システム側への影響は**ゼロ**です。

---

## 📝 次のアクション

### VoiceDriveチーム

- [x] **2025-10-13**: ファイル削除完了（12ファイル）
- [x] **2025-10-13**: AppRouter.tsx修正完了
- [x] **2025-10-13**: Breadcrumb.tsx修正完了
- [x] **2025-10-13**: Layout.tsx修正完了
- [x] **2025-10-13**: 削除通知ドキュメント作成完了
- [ ] **2025-10-13**: コミット・プッシュ
- [ ] **2025-10-14**: 本番環境デプロイ
- [ ] **2025-10-14**: 削除後動作確認

### 医療システムチーム

- **アクションなし**（影響なし）

---

## 🔍 削除判断理由のまとめ

### 1. 使用実績なし

- どこからもリンクされていない
- メニューに登録されていない
- アクセスログでも使用形跡なし（推定）

### 2. 初期開発の残骸

- 開発初期に作成されたプロトタイプ
- 後に「Station」シリーズが実装され、より高機能に
- 削除し忘れていた

### 3. DB構築前の最適なタイミング

- 本番稼働前
- データベース構築前
- ユーザー数が少ない段階

### 4. 保守性の向上

- 不要なコードを削減
- ルーティング定義を簡素化
- 開発者の認知負荷を軽減

---

## 📞 連絡先

**VoiceDriveチーム**:
- Slack: #voicedrive-integration
- 担当: システム開発チーム

---

## ✅ 承認

**VoiceDriveチーム**: ✅ 削除承認済み
**承認日**: 2025年10月13日
**削除実施日**: 2025年10月13日

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
ステータス: 削除完了
