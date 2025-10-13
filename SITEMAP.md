# VoiceDrive システム サイトマップ

## 概要
VoiceDriveは医療職員の声を集め、組織改善につなげるシステムです。
本文書は全ページの構造とアクセス権限を示します。

---

## 🏠 メインナビゲーション

### ホーム (`/`)
- **ページ**: HomePage
- **権限**: 全ユーザー
- **説明**: システムのトップページ

### プロフィール (`/profile`)
- **ページ**: ProfilePage
- **権限**: 全ユーザー
- **説明**: ユーザープロフィール管理

---

## 📊 ダッシュボード (`/dashboard`)

### 個人ダッシュボード (`/dashboard/personal`)
- **権限**: Level 1 (完全一致)
- **説明**: 一般職員向けダッシュボード

### チームリーダーダッシュボード (`/dashboard/team-leader`)
- **権限**: Level 2 (完全一致)
- **説明**: チームリーダー向けダッシュボード

### 部門ダッシュボード (`/dashboard/department`)
- **権限**: Level 3 (完全一致)
- **説明**: 部門管理者向けダッシュボード

### 施設ダッシュボード (`/dashboard/facility`)
- **権限**: Level 4 (完全一致)
- **説明**: 施設管理者向けダッシュボード

### 人事管理ダッシュボード (`/dashboard/hr-management`)
- **権限**: Level 5 (完全一致)
- **説明**: 人事部門向けダッシュボード

### 戦略ダッシュボード (`/dashboard/strategic`)
- **権限**: Level 6 (完全一致)
- **説明**: 戦略企画部門向けダッシュボード

### 法人ダッシュボード (`/dashboard/corporate`)
- **権限**: Level 7 (完全一致)
- **説明**: 法人本部向けダッシュボード

### 役員ダッシュボード (`/dashboard/executive`)
- **権限**: Level 8 (完全一致)
- **説明**: 経営層向けダッシュボード

### 統合法人ダッシュボード (`/dashboard/integrated-corporate`)
- **権限**: Level 5+
- **説明**: 統合型法人ダッシュボード

---

## 👥 職員ダッシュボード (`/staff-dashboard`)

### 部門職員ダッシュボード (`/staff-dashboard/department`)
- **権限**: Level 3+
- **説明**: 部門職員向けダッシュボード

### 施設職員ダッシュボード (`/staff-dashboard/facility`)
- **権限**: Level 4+
- **説明**: 施設職員向けダッシュボード

### 法人職員ダッシュボード (`/staff-dashboard/corporate`)
- **権限**: Level 5+
- **説明**: 法人職員向けダッシュボード

---

## 🏥 管理機能

### チーム管理 (`/team-management`)
- **権限**: Level 2+
- **説明**: チームメンバー管理

### 部門概要 (`/department-overview`)
- **権限**: Level 3+
- **説明**: 部門全体の状況確認

### 予算管理 (`/budget`)
- **権限**: Level 4+
- **説明**: 予算管理・コントロール

### 権限管理 (`/authority`)
- **権限**: Level 3+
- **説明**: アクセス権限管理

---

## 👨‍💼 人事機能

### 人事ダッシュボード (`/hr-dashboard`)
- **権限**: Level 5+
- **説明**: 人事部門メインダッシュボード

### 人事機能 (`/interview-management`, `/policy-management`, `/talent-analytics`)
- **権限**: Level 8+
- **説明**: 面談管理、方針管理、タレント分析

### タレント分析 (`/talent`)
- **権限**: Level 5+
- **説明**: 人材データ分析

### 人事お知らせ (`/hr-announcements`)
- **権限**: 全ユーザー
- **説明**: 人事部からのお知らせ

### ストレスチェックデモ (`/stress-check-demo`)
- **権限**: 全ユーザー
- **説明**: ストレスチェック機能デモ

### 面談ステーション (`/interview-station`)
- **権限**: 全ユーザー
- **説明**: 面談予約・管理

### 面談管理 (`/interview-management`)
- **権限**: Level 5+
- **説明**: 面談全体の管理（人事向け）

### 退職処理 (`/retirement-processing`)
- **権限**: Level 6+
- **説明**: 退職手続き管理
- **サブページ**:
  - `/retirement-processing/step1/:processId` - アカウント無効化
  - `/retirement-processing/step2/:processId` - 権限取り消し
  - `/retirement-processing/step4/:processId` - 完了通知

---

## 📈 戦略・分析機能

### 戦略企画 (`/strategic-planning`)
- **権限**: Level 6+
- **説明**: 中長期戦略の企画

### 組織開発 (`/org-development`)
- **権限**: Level 6+
- **説明**: 組織開発・改善

### パフォーマンス分析 (`/performance`)
- **権限**: Level 6+
- **説明**: 組織パフォーマンス分析

### 施設管理 (`/facility-management`)
- **権限**: Level 7+
- **説明**: 施設全体の管理

### 戦略概要 (`/strategic-overview`)
- **権限**: Level 7+
- **説明**: 戦略の全体俯瞰

### 予算企画 (`/budget-planning`)
- **権限**: Level 7+
- **説明**: 予算の企画立案

### 役員レポート (`/executive-reports`)
- **権限**: Level 7+
- **説明**: 役員向けレポート

### 役員概要 (`/executive-overview`)
- **権限**: Level 8
- **説明**: 経営層向け概要ダッシュボード

### 戦略イニシアチブ (`/strategic-initiatives`)
- **権限**: Level 8
- **説明**: 戦略的施策管理

### 組織分析 (`/organization-analytics`)
- **権限**: Level 8
- **説明**: 組織全体の分析

### 理事会レポート (`/board-reports`)
- **権限**: Level 8
- **説明**: 理事会向けレポート

### ガバナンス (`/governance`)
- **権限**: Level 8
- **説明**: ガバナンス管理

### 分析機能 (`/analytics`)
- **権限**: Level 7+
- **説明**: 総合分析ダッシュボード

---

## 📊 詳細分析ページ（フルワイド）

### 世代別分析 (`/generational-analysis`)
- **権限**: Level 7+
- **説明**: 全体の世代別データ分析

### 部門世代別分析 (`/department-generational-analysis`)
- **権限**: Level 3+
- **説明**: 部門単位の世代別分析

### 階層別分析 (`/hierarchical-analysis`)
- **権限**: Level 5+
- **説明**: 組織階層別分析

### ユーザー分析 (`/user-analysis`)
- **権限**: Level 3+
- **説明**: ユーザー行動分析

### 職種別分析 (`/professional-analysis`)
- **権限**: Level 5+
- **説明**: 職種別データ分析

---

## 🎙️ 声の収集機能

### 内部通報 (`/whistleblowing`)
- **権限**: 全ユーザー
- **説明**: コンプライアンス通報システム

### マイレポート (`/my-reports`)
- **権限**: 全ユーザー
- **説明**: 自分の通報履歴

### マイレポート詳細 (`/my-reports/:id`)
- **権限**: 全ユーザー
- **説明**: 通報の詳細確認

### 投稿作成 (`/compose/:type`)
- **権限**: 全ユーザー
- **説明**: アイデア・フリーボイス等の投稿

### アイデアボイスガイド (`/idea-voice-guide`)
- **権限**: 全ユーザー
- **説明**: アイデアボイスの使い方

### アイデアボイス進捗 (`/idea-voice/progress`)
- **権限**: Level 1+
- **説明**: アイデアボイスの進捗追跡

### 提案書作成 (`/idea-voice/proposal`)
- **権限**: Level 5+
- **説明**: AI提案書生成

### 提案書管理 (`/proposal-management`)
- **権限**: Level 3.5+
- **説明**: 提案書の管理画面

### 提案書編集 (`/proposal-document/:documentId`)
- **権限**: Level 3.5+
- **説明**: 提案書編集画面

### 委員会提出承認 (`/committee-submission-approval`)
- **権限**: Level 8+
- **説明**: 委員会提出の最終承認

### フリーボイスガイド (`/free-voice-guide`)
- **権限**: 全ユーザー
- **説明**: フリーボイスの使い方

### コンプライアンスガイド (`/compliance-guide`)
- **権限**: 全ユーザー
- **説明**: コンプライアンス通報ガイド

---

## 🗳️ 投票・評価機能

### 投票システムガイド (`/voting-system-guide`)
- **権限**: 全ユーザー
- **説明**: 投票システムの使い方

### 職員投票ガイド (`/staff-voting-guide`)
- **権限**: 全ユーザー
- **説明**: 職員向け投票ガイド

### 評価通知 (`/evaluation/notifications`)
- **権限**: 全ユーザー
- **説明**: 評価に関する通知

### 評価ステーション (`/evaluation-station`)
- **権限**: Level 1-3のみ
- **説明**: 評価対象者向けポータル
- **サブページ**:
  - `/evaluation-station/notifications` - 評価通知
  - `/evaluation-station/notifications/:id` - 評価通知詳細（未実装）
  - `/evaluation-station/history` - 評価履歴（未実装）
  - `/evaluation-station/appeals` - 不服申立
  - `/evaluation-station/appeals/new` - 新規不服申立
  - `/evaluation-station/interviews` - 面談予約
  - `/evaluation-station/interviews/new` - 新規面談予約

### 不服申立V3 (`/appeal-v3`)
- **権限**: 全ユーザー
- **説明**: 評価に対する不服申立

---

## 💼 プロジェクト管理

### プロジェクト一覧 (`/projects`)
- **権限**: 全ユーザー
- **説明**: プロジェクト一覧（拡張版）

### プロジェクト一覧（旧） (`/projects-legacy`)
- **権限**: 全ユーザー
- **説明**: プロジェクト一覧（旧版）

### マイプロジェクト (`/my-projects`)
- **権限**: 全ユーザー
- **説明**: 自分が参加するプロジェクト

### プロジェクト詳細 (`/project/:projectId`)
- **権限**: 全ユーザー
- **説明**: プロジェクト詳細ページ（フルワイド）

### プロジェクト追跡 (`/project-tracking`)
- **権限**: Level 1+
- **説明**: プロジェクトモード進捗追跡

### プロジェクト承認 (`/project-approval`)
- **権限**: Level 3.5+
- **説明**: プロジェクト承認画面

---

## 🏢 ステーション（ポータル）

### 個人ステーション (`/personal-station`)
- **権限**: 全ユーザー
- **説明**: 個人向けポータル（フルワイド）

### 部門ステーション (`/department-station`)
- **権限**: Level 3+
- **説明**: 部門向けポータル（フルワイド）

### セクションステーション (`/section-station`)
- **権限**: Level 4+
- **説明**: セクション向けポータル（フルワイド）

### ヘルスステーション (`/health-station`)
- **権限**: 全ユーザー
- **説明**: 健康管理ポータル

### キャリア選択ステーション (`/career-selection-station`)
- **権限**: 全ユーザー
- **説明**: キャリア選択ポータル
- **サブページ**:
  - `/career-selection-station/change-request` - 異動希望申請
  - `/career-selection-station/my-requests` - 自分の申請履歴

---

## ⚙️ 管理者機能

### システム設定 (`/admin/system-settings`)
- **権限**: Level 6+
- **説明**: システム全体設定

### ユーザー管理 (`/admin/users`)
- **権限**: Level 5+
- **説明**: ユーザー管理画面

### モード切替 (`/admin/mode-switcher`)
- **権限**: Level 99 (超管理者)
- **説明**: システムモード切替

### ユーザー管理（管理者） (`/admin/user-management`)
- **権限**: Level 99 (超管理者)
- **説明**: 超管理者向けユーザー管理

### システムモニター (`/admin/system-monitor`)
- **権限**: Level 99 (超管理者)
- **説明**: システム監視画面

### 監査ログ (`/admin/audit-logs`)
- **権限**: Level 5+
- **説明**: システム監査ログ

---

## 📋 その他機能

### 承認 (`/approvals`)
- **権限**: Level 3+
- **説明**: 各種承認業務

### 通知 (`/notifications`)
- **権限**: 全ユーザー
- **説明**: システム通知一覧

### 設定 (`/settings`)
- **権限**: 全ユーザー
- **説明**: 個人設定

### プライバシーポリシー (`/privacy-policy`)
- **権限**: 全ユーザー
- **説明**: プライバシーポリシー

### 方針管理 (`/policy`)
- **権限**: Level 5+
- **説明**: 組織方針管理

### ユーザーガイド (`/user-guide`)
- **権限**: 全ユーザー
- **説明**: システム利用ガイド

### 提案管理ガイド (`/proposal-management-guide`)
- **権限**: 全ユーザー
- **説明**: 提案管理の使い方

### 面談ガイド (`/interview-guide`)
- **権限**: 全ユーザー
- **説明**: 面談システムの使い方

---

## 🧪 デモ・テストページ（開発環境のみ）

### APIテストパネル (`/api-test`)
- **権限**: 全ユーザー（開発環境のみ）
- **説明**: 医療システムAPI連携テスト

### テストサマリー受信 (`/test-summary-receiver`)
- **権限**: 全ユーザー（開発環境のみ）
- **説明**: テスト結果受信画面

### タイムラインデモ (`/demo/time-axis`)
- **権限**: 全ユーザー
- **説明**: タイムライン表示デモ

### 階層表示デモ (`/demo/hierarchy`)
- **権限**: 全ユーザー
- **説明**: 組織階層表示デモ

### プログレッシブ表示デモ (`/demo/progressive-visibility`)
- **権限**: 全ユーザー
- **説明**: 段階的表示機能デモ

---

## ❌ エラーページ

### 権限不足 (`/unauthorized`)
- **説明**: アクセス権限不足時の表示

### ページが見つかりません (`/404`)
- **説明**: 存在しないページへのアクセス時

### 全ての未定義パス (`/*`)
- **説明**: 未定義のパスは `/404` にリダイレクト

---

## 📝 権限レベル一覧

| レベル | 役割 | 説明 |
|--------|------|------|
| Level 1 | 一般職員 | 基本的な機能にアクセス可能 |
| Level 2 | チームリーダー | チーム管理機能が追加 |
| Level 3 | 部門管理者 | 部門レベルの管理機能が追加 |
| Level 3.5 | 部門管理者+ | 提案・プロジェクト承認権限追加 |
| Level 4 | 施設管理者 | 施設レベルの管理機能が追加 |
| Level 5 | 人事部門 | 人事関連機能が追加 |
| Level 6 | 戦略企画部門 | 戦略・企画機能が追加 |
| Level 7 | 法人本部 | 法人全体の管理機能が追加 |
| Level 8 | 経営層 | 最高レベルの管理・閲覧権限 |
| Level 99 | 超管理者 | システム全体の設定・管理権限 |

---

**生成日時**: 2025年8月10日
**システムバージョン**: Phase 2統合版
**ドキュメント形式**: Markdown
