# Phase 2 スクリーンショット取得手順

**目的**: キックオフMTG（10/28）で医療システムチームにPhase 2の成果をデモするため

**作成日**: 2025年10月26日

---

## 📸 取得するスクリーンショット

### 1. SystemMonitorPage - 医療システム連携タブ（全体）
**ファイル名**: `01-integration-tab-overview.png`

**手順**:
1. ブラウザで http://localhost:3001 にアクセス
2. 管理者アカウントでログイン（Level 99）
3. サイドバーから「システム監視」をクリック
4. 「医療システム連携」タブをクリック
5. ページ全体をスクリーンショット

**確認項目**:
- ✅ 「医療システム連携監視（Phase 2 - 20項目）」タイトルが表示
- ✅ 接続性ステータスカードが表示
- ✅ Webhook受信統計カードが表示
- ✅ データ同期統計カードが表示

---

### 2. 接続性ステータス（拡大）
**ファイル名**: `02-connectivity-status.png`

**手順**:
1. 「接続性ステータス」カードにズーム
2. スクリーンショット

**確認項目**:
- ✅ Webhookエンドポイント健全性ステータス（healthy/warning/critical）
- ✅ 最終Webhook受信日時
- ✅ 最終受信からの経過時間
- ✅ エラー率トレンド（improving/stable/degrading）

---

### 3. Webhook受信統計（拡大）
**ファイル名**: `03-webhook-stats.png`

**手順**:
1. 「Webhook受信統計（24時間）」カードにズーム
2. スクリーンショット

**確認項目**:
- ✅ 24時間以内の受信件数
- ✅ イベントタイプ別統計
  - employee.created
  - employee.photo.updated
  - employee.photo.deleted
- ✅ 各イベントの件数、成功率、平均処理時間

---

### 4. データ同期統計（拡大）
**ファイル名**: `04-data-sync-stats.png`

**手順**:
1. 「データ同期統計」カードにズーム
2. スクリーンショット

**確認項目**:
- ✅ 総ユーザー数
- ✅ 写真あり職員数
- ✅ 写真同期率（%）
- ✅ 24時間以内の同期件数

---

### 5. 直近のエラーリスト（エラーがある場合）
**ファイル名**: `05-recent-errors.png`

**手順**:
1. エラーがある場合、「直近のエラー」カードをスクリーンショット
2. エラーがない場合はスキップ

**確認項目**:
- ✅ エラーのタイムスタンプ
- ✅ イベントタイプ
- ✅ エラーメッセージ

---

### 6. 他のタブ（概要）
**ファイル名**: `06-overview-tab.png`

**手順**:
1. 「概要」タブをクリック
2. ページ全体をスクリーンショット

**目的**: Phase 1（VoiceDrive単独監視50項目）も動作していることを示す

---

## 📂 保存場所

全てのスクリーンショットを以下のフォルダに保存してください：

```
mcp-shared/docs/screenshots/phase2/
├── 01-integration-tab-overview.png
├── 02-connectivity-status.png
├── 03-webhook-stats.png
├── 04-data-sync-stats.png
├── 05-recent-errors.png（オプション）
└── 06-overview-tab.png
```

---

## 🎯 スクリーンショット後の確認

### チェックリスト

- [ ] 全てのスクリーンショットが高解像度（1920x1080以上推奨）
- [ ] UI要素が明確に読める
- [ ] 個人情報が含まれていない（テストデータのみ）
- [ ] ファイル名が統一されている
- [ ] `mcp-shared/docs/screenshots/phase2/`に保存されている

### デモ資料への添付

1. キックオフMTG用のスライド作成（オプション）
2. `SystemMonitorPage_VoiceDrive回答書_20251026.md`に画像リンクを追加（オプション）

---

## 💡 補足情報

### SystemMonitorPageへのアクセス

**URL**: http://localhost:3001/admin/system-monitor

**必要な権限**: Level 99（管理者）

**テストアカウント**:
- Email: `admin@voicedrive.local`
- Password: （開発環境のデフォルトパスワード）
- Level: 99

### Phase 2で実装した20項目

#### Webhook受信統計（10項目）
1. 24時間以内の受信件数
2. イベントタイプ別件数（employee.created）
3. イベントタイプ別件数（employee.photo.updated）
4. イベントタイプ別件数（employee.photo.deleted）
5. イベントタイプ別成功率
6. イベントタイプ別平均処理時間
7. 署名検証失敗件数
8. 処理エラー件数
9. 重複イベント件数
10. 最終受信日時・平均処理時間

#### データ同期統計（5項目）
11. 総ユーザー数
12. 写真あり職員数
13. 写真同期率（%）
14. 24時間以内の同期件数
15. 同期エラー件数・最終同期日時

#### 接続性監視（5項目）
16. Webhookエンドポイント健全性ステータス
17. 最終Webhook受信日時
18. 最終受信からの経過時間
19. エラー率トレンド（improving/stable/degrading）
20. 直近エラーリスト（timestamp, eventType, errorMessage）

---

**作成者**: VoiceDriveチーム
**最終更新**: 2025年10月26日
**用途**: キックオフMTG（10/28）デモ資料
