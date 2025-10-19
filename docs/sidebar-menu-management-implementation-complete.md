# サイドバーメニュー管理機能 実装完了報告書

**文書番号**: VD-IMPL-SIDEBAR-2025-1019-001
**作成日**: 2025年10月19日
**ステータス**: ✅ **実装完了**

---

## 📋 実装サマリー

VoiceDriveのサイドバーメニュー（共通メニュー、議題モード、プロジェクト化モード）を**データベース駆動**で管理できる機能を実装しました。

システム管理者（レベルX）が、**コード変更なし**でブラウザ上からメニュー項目の表示/非表示、デバイス別表示制御、順序変更などを設定できます。

---

## 🎯 実装内容

### 1. データベーススキーマ

#### `sidebar_menu_configs` テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String | 主キー（CUID） |
| menuItemId | String | メニュー項目ID（例: `personal_station`） |
| menuCategory | String | カテゴリ（`agenda`, `project`, `common`） |
| menuSubcategory | String? | サブカテゴリ（`station`, `info`, `management`） |
| icon | String | アイコン（Emoji） |
| label | String | ラベル |
| path | String | URL パス |
| description | String? | ツールチップ用説明 |
| isVisible | Boolean | 表示フラグ |
| displayOrder | Int | 表示順序 |
| showOnDesktop | Boolean | PC版で表示 |
| showOnMobile | Boolean | スマホ版で表示 |
| showOnTablet | Boolean | タブレット版で表示 |
| visibleForLevels | String? | 権限レベル制限（JSON） |
| showNewBadge | Boolean | NEWバッジ表示 |
| newBadgeUntil | DateTime? | NEWバッジ表示期限 |
| showBadge | Boolean | バッジ表示 |
| badgeType | String? | バッジタイプ（`count`, `dot`, `custom`） |
| adminNotes | String? | 管理者メモ |
| isCustom | Boolean | カスタム項目か |
| isSystem | Boolean | システム項目（削除不可） |

**ユニーク制約**: `(menuItemId, menuCategory)`

---

### 2. 初期データ（11項目）

#### ステーション系（5項目）

| # | アイコン | ラベル | URL | 表示 | 備考 |
|---|---------|-------|-----|------|------|
| 1 | 🏠 | パーソナルステーション | `/personal-station` | ✅ | システム標準 |
| 2 | 🤝 | 面談ステーション | `/interview-station` | ✅ | Phase 20実装済み |
| 3 | 💼 | キャリア選択ステーション | `/career-selection-station` | ✅ | Phase 22実装予定 |
| 4 | 🩺 | 健康ステーション | `/health-station` | ❌ | ベータ版（非表示） |
| 5 | 📊 | 評価ステーション | `/evaluation-station` | ❌ | 2025年4月導入予定（非表示） |

#### 情報・設定系（4項目）

| # | アイコン | ラベル | URL | PC | スマホ | 備考 |
|---|---------|-------|-----|-----|-------|------|
| 6 | 📖 | 使い方ガイド | `/user-guide` | ✅ | ✅ | - |
| 7 | 🛡️ | コンプライアンス窓口 | `/compliance-guide` | ✅ | ❌ | スマホ非表示 |
| 8 | 🔔 | 通知 | `/notifications` | ✅ | ✅ | バッジ: 未読件数 |
| 9 | ⚙️ | 設定 | `/settings` | ✅ | ✅ | - |

#### 管理系（2項目）

| # | アイコン | ラベル | URL | 権限レベル | 備考 |
|---|---------|-------|-----|-----------|------|
| 10 | 📊 | エグゼクティブダッシュボード | `/dashboard/executive` | 12以上 | - |
| 11 | 🔧 | システム運用 | `/admin/system-operations` | Xのみ | - |

---

### 3. APIエンドポイント

#### GET `/api/sidebar-menu/configs`
メニュー設定一覧取得

**クエリパラメータ**:
- `category`: `agenda` | `project` | `common`（オプション）
- `permissionLevel`: ユーザーの権限レベル（フィルタリング用）

**レスポンス例**:
```json
{
  "success": true,
  "configs": [
    {
      "id": "clx1234567890",
      "menuItemId": "personal_station",
      "menuCategory": "common",
      "icon": "🏠",
      "label": "パーソナルステーション",
      "path": "/personal-station",
      "isVisible": true,
      "displayOrder": 1,
      "showOnDesktop": true,
      "showOnMobile": true,
      "showOnTablet": true
    }
  ],
  "total": 11
}
```

#### GET `/api/sidebar-menu/configs/:id`
特定メニュー設定取得

#### POST `/api/sidebar-menu/configs`
メニュー設定作成（カスタム項目追加）

**権限**: レベルXのみ

#### PATCH `/api/sidebar-menu/configs/:id`
メニュー設定更新

**権限**: レベルXのみ

#### DELETE `/api/sidebar-menu/configs/:id`
メニュー設定削除

**権限**: レベルXのみ
**制限**: システム項目（`isSystem: true`）は削除不可

#### PATCH `/api/sidebar-menu/configs/bulk-update`
一括更新（並び替え用）

---

### 4. Reactフック

#### `useSidebarMenuConfigs`
DBからメニュー設定を取得

```typescript
const { configs, loading, error } = useSidebarMenuConfigs({
  category: 'common',
  permissionLevel: 14,
});
```

#### `useDeviceType`
デバイスタイプ判定（`mobile` | `tablet` | `desktop`）

#### `filterConfigsByDevice`
デバイスタイプでフィルタリング

---

### 5. UI実装

#### `EnhancedSidebar` コンポーネント
- 共通メニュー部分をDB駆動に変更
- デバイス別表示対応（PC/スマホ/タブレット）
- NEWバッジ・未読件数バッジ対応

#### `SidebarMenuManagementPage` コンポーネント
- タブ切替（共通/議題/プロジェクトモード）
- メニュー一覧テーブル表示
- 編集モーダル（全設定項目対応）

#### `SystemOperationsPage` に追加
- 🎛️ **サイドバーメニュー管理**カード追加
- URL: `/admin/sidebar-menu-management`
- カラー: ピンク
- バッジ: NEW

---

## 🚀 使い方（システム管理者向け）

### ケース1: 評価ステーションを表示する

1. `/admin/system-operations` → 「サイドバーメニュー管理」をクリック
2. 「共通メニュー」タブを選択
3. 「📊 評価ステーション」の行で「編集」ボタンをクリック
4. **「このメニュー項目を表示する」にチェック**
5. 「保存」ボタンをクリック
6. **即座に全ユーザーの共通メニューに表示される！**

### ケース2: 健康ステーションをスマホのみ非表示

1. 「🩺 健康ステーション」を編集
2. 「このメニュー項目を表示する」にチェック
3. デバイス別表示設定で「スマートフォン」のチェックを**外す**
4. 保存
5. **PC版とタブレット版のみに表示される**

### ケース3: 新機能にNEWバッジを表示

1. 該当メニュー項目を編集
2. **「NEW!」バッジを表示**にチェック
3. （将来実装: 表示期限を設定）
4. 保存
5. **メニュー項目の右にNEWバッジが表示される**

---

## 📊 実装ファイル一覧

### データベース関連
- ✅ `prisma/schema.prisma` - `SidebarMenuConfig` モデル追加
- ✅ `prisma/migrations/20251018000000_add_sidebar_menu_configs/migration.sql` - マイグレーション
- ✅ `prisma/seed/10-sidebar-menu-configs.ts` - 初期データ投入

### API関連
- ✅ `src/api/routes/sidebar-menu.routes.ts` - APIルート定義
- ✅ `src/api/server.ts` - ルート登録

### フック・ユーティリティ
- ✅ `src/hooks/useSidebarMenuConfigs.ts` - Reactフック

### UI関連
- ✅ `src/components/layout/EnhancedSidebar.tsx` - DB駆動に変更
- ✅ `src/pages/admin/SidebarMenuManagementPage.tsx` - 管理画面
- ✅ `src/pages/admin/SystemOperationsPage.tsx` - カード追加

### ルーティング
- ✅ `src/router/AppRouter.tsx` - ルート追加

---

## 🎯 実装の特徴

### 1. **Single Source of Truth**
- 全てのメニュー設定がDBに保存
- コード変更不要でリアルタイム反映

### 2. **デバイス別表示制御**
- PC、スマホ、タブレット別に表示/非表示を切り替え可能
- 例: コンプライアンス窓口はPCのみ表示

### 3. **権限レベル別表示**
- 特定の権限レベルのみに表示可能
- 例: エグゼクティブダッシュボードはレベル12以上

### 4. **段階的ロールアウト対応**
- 評価ステーション：非表示 → 人事部門のみ → 全員
- 健康ステーション：非表示 → ベータ版公開

### 5. **システム項目保護**
- `isSystem: true` の項目は削除不可
- 誤って削除してシステムが壊れることを防止

---

## 🧪 テスト項目

### 単体テスト
- [x] APIエンドポイント全機能テスト
- [ ] `useSidebarMenuConfigs` フックのテスト
- [ ] `filterConfigsByDevice` ユーティリティのテスト

### 統合テスト
- [ ] メニュー設定作成 → サイドバーに即座に反映
- [ ] メニュー設定更新 → サイドバーに即座に反映
- [ ] デバイス別表示（PC/スマホ/タブレット）
- [ ] 権限レベル別表示（レベル1, 12, X）
- [ ] システム項目の削除防止

### E2Eテスト
- [ ] システム管理者がログイン → サイドバーメニュー管理にアクセス
- [ ] 評価ステーションを表示 → 一般ユーザーの画面で確認
- [ ] コンプライアンス窓口をスマホ非表示 → スマホ版で非表示確認

---

## 📌 次のステップ

### Phase 1: 共通メニューのDB駆動化（✅ 完了）
- [x] データベーススキーマ設計
- [x] 初期データ投入
- [x] API実装
- [x] EnhancedSidebar改修
- [x] 管理画面UI

### Phase 2: 議題モード・プロジェクト化モードのDB駆動化（🔜 次回）
- [ ] 既存の `agendaMenuConfig.ts` データをDBに移行
- [ ] 既存の `projectMenuConfig.ts` データをDBに移行
- [ ] EnhancedSidebarのモード別メニューをDB駆動に変更

### Phase 3: 高度な機能（将来）
- [ ] 権限レベル別表示のUI実装（現在はJSON手入力）
- [ ] メニュー項目のドラッグ&ドロップ並び替え
- [ ] カスタムアイコン（Emoji以外）対応
- [ ] メニュー設定のインポート/エクスポート
- [ ] 変更履歴ログ

---

## 🙏 まとめ

サイドバーメニュー管理機能の実装が完了しました。

これにより、VoiceDriveの**ステーション系ページ**（評価ステーション、健康ステーション等）の公開タイミングを、システム管理者が柔軟に制御できるようになりました。

**コード変更なし、再デプロイなし**で、組織の状況に応じてメニュー項目を表示/非表示できます。

---

**VoiceDriveチーム**
**作成日**: 2025年10月19日
**文書番号**: VD-IMPL-SIDEBAR-2025-1019-001

---

**文書終了**
