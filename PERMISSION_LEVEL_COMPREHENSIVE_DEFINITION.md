# 8段階権限レベル 完全定義（面談予約機能統合版）

## 権限レベル定義

### LEVEL 1: 一般従業員
- **役職**: 一般職員、スタッフ
- **権限**:
  - 基本的な投稿・投票権限
  - 自分の投稿の閲覧・編集
  - フリースペースへの投稿
  - 面談予約の申請
- **承認権限**: なし
- **予算上限**: なし
- **プロジェクトスコープ**: チーム内のみ
- **メンバー選定**: 参加者としてのみ

### LEVEL 2: チーフ・主任
- **役職**: チーフ、主任、リーダー
- **権限**:
  - チーム内のプロジェクト管理権限
  - チーム投稿のモデレート
  - チームメンバーの基本的な選定
- **承認権限**: チーム内プロジェクトの初期承認
- **予算上限**: 10万円
- **プロジェクトスコープ**: チーム内
- **ワークフロー**: TEAM_LEAD_APPROVAL

### LEVEL 3: 係長・マネージャー
- **役職**: 係長、マネージャー、主査
- **権限**:
  - 部門内プロジェクトの承認権限
  - 部門投稿の閲覧・モデレート
  - 部門分析ダッシュボード閲覧
- **承認権限**: 部門内プロジェクトの承認
- **予算上限**: 50万円
- **プロジェクトスコープ**: チーム、部門
- **ワークフロー**: MANAGER_APPROVAL

### LEVEL 4: 課長
- **役職**: 課長、室長
- **権限**:
  - 部門レベルのプロジェクト最終承認権限
  - 予算管理権限
  - 部門全体の投稿閲覧
  - 戦略提案カテゴリへの重点参加（60%ウェイト）
- **承認権限**: 部門プロジェクトの最終承認
- **予算上限**: 200万円
- **プロジェクトスコープ**: チーム、部門
- **ワークフロー**: SECTION_CHIEF_APPROVAL

### LEVEL 5: 人財統括本部 戦略企画・統括管理部門（新規追加）
- **役職**: 
  - 戦略企画部門 常勤事務員
  - 統括管理部門 常勤事務員
  - 面談予約1次窓口担当者
- **権限**:
  - 面談予約システムの管理画面フルアクセス
  - 面談スケジュール管理・変更権限
  - 時間枠のブロック・解除権限
  - 予約統計レポート閲覧
  - 緊急面談枠の設定
  - 面談者アサイン権限
- **承認権限**: 面談関連の運用承認
- **予算上限**: なし（面談運用に特化）
- **プロジェクトスコープ**: 人事関連プロジェクトのサポート

### LEVEL 6: 人財統括本部 キャリア支援部門員（更新）
- **役職**: 
  - キャリア支援部門員
  - 面談実施者
  - キャリアコンサルタント
- **権限**:
  - 面談予約管理画面の閲覧権限
  - 自分が担当する面談の詳細閲覧・編集
  - 面談記録の作成・更新
  - キャリア相談レポート作成
  - 職員プロフィール閲覧（面談準備用）
- **承認権限**: キャリア開発プログラムの提案
- **予算上限**: 100万円（研修・育成関連）
- **プロジェクトスコープ**: 人材育成関連プロジェクト

### LEVEL 7: 人財統括本部 部門長（更新）
- **役職**:
  - 人財統括本部 キャリア支援部門長（面談実施責任者）
  - 人財統括本部 人材開発部門長
  - 人財統括本部 業務革新部門長
- **権限**:
  - 面談予約システム全体の監督権限
  - 面談ポリシーの策定・変更
  - 面談実施者の指名・変更
  - HR関連プロジェクトの統括管理
  - 人事ポリシー管理
  - タレント分析閲覧
  - 施設横断的な調整権限
- **承認権限**: 
  - 施設レベルプロジェクトのHR観点承認
  - 人材関連施策の承認
- **予算上限**: 500万円
- **プロジェクトスコープ**: チーム、部門、施設
- **ワークフロー**: HR_DEPT_HEAD_APPROVAL, HR_DEPT_HEAD_REVIEW

### LEVEL 8: 人財統括本部 統括管理部門長（既存）
- **役職**: 人財統括本部統括管理部門長
- **権限**:
  - 全社人事戦略の企画・実行権限
  - 組織設計権限
  - パフォーマンス管理
  - 戦略的人事計画策定
  - ユーザー管理権限
- **承認権限**: 施設レベルプロジェクトの戦略的承認
- **予算上限**: 1000万円
- **プロジェクトスコープ**: チーム、部門、施設
- **ワークフロー**: HR_GENERAL_MANAGER_APPROVAL, HR_GENERAL_MANAGER_REVIEW

### LEVEL 9: 部長・本部長（旧LEVEL 7）
- **役職**: 施設長、事業部長、本部長
- **権限**:
  - 施設全体のプロジェクト承認
  - 戦略決定権限
  - 予算配分権限
  - 施設間調整権限
  - ワークフロー強制承認権限
- **承認権限**: 施設・組織レベルプロジェクトの承認
- **予算上限**: 2000万円
- **プロジェクトスコープ**: 全スコープ（戦略除く）
- **ワークフロー**: DIRECTOR_APPROVAL, DIRECTOR_REVIEW

### LEVEL 10: 役員・経営層（旧LEVEL 8）
- **役職**: 取締役、執行役員、CEO、CFO
- **権限**:
  - 全社レベルの最終意思決定権限
  - 戦略的プロジェクト承認
  - エグゼクティブオーバーライド
  - ガバナンス管理
- **承認権限**: すべてのプロジェクト
- **予算上限**: 無制限
- **プロジェクトスコープ**: 全スコープ
- **ワークフロー**: EXECUTIVE_APPROVAL, BOARD_APPROVAL

## ワークフローステージと必要権限レベル

### チームプロジェクト
1. AUTO_PROJECT (システム自動)
2. TEAM_LEAD_APPROVAL (LEVEL 2)
3. MANAGER_APPROVAL (LEVEL 3)
4. IMPLEMENTATION

### 部門プロジェクト
1. AUTO_PROJECT (システム自動)
2. MANAGER_APPROVAL (LEVEL 3)
3. SECTION_CHIEF_APPROVAL (LEVEL 4)
4. IMPLEMENTATION

### 施設プロジェクト
1. AUTO_PROJECT (システム自動)
2. SECTION_CHIEF_APPROVAL (LEVEL 4)
3. HR_DEPT_HEAD_APPROVAL (LEVEL 7)
4. HR_GENERAL_MANAGER_APPROVAL (LEVEL 8)
5. BUDGET_APPROVAL (LEVEL 8)
6. DIRECTOR_APPROVAL (LEVEL 9)
7. IMPLEMENTATION

### 組織プロジェクト
1. AUTO_PROJECT (システム自動)
2. HR_DEPT_HEAD_REVIEW (LEVEL 7)
3. HR_GENERAL_MANAGER_REVIEW (LEVEL 8)
4. DIRECTOR_APPROVAL (LEVEL 9)
5. EXECUTIVE_APPROVAL (LEVEL 10)
6. BUDGET_ALLOCATION (LEVEL 9/CFO)
7. IMPLEMENTATION

### 戦略プロジェクト
1. AUTO_PROJECT (システム自動)
2. DIRECTOR_REVIEW (LEVEL 9)
3. EXECUTIVE_APPROVAL (LEVEL 10)
4. BOARD_APPROVAL (LEVEL 10)
5. STRATEGIC_ALLOCATION (LEVEL 10/CEO)
6. IMPLEMENTATION

## メンバー選定における役割

### 選定権限者として
- LEVEL 1-2: 選定権限なし（参加者のみ）
- LEVEL 3-4: 基本的選定（部門内）
- LEVEL 5-6: 面談関連の人員調整
- LEVEL 7-8: 協議的選定、AI支援選定の承認
- LEVEL 9-10: 戦略的選定、緊急選定の実行

### 4カテゴリ別の重み付け
- **業務改善**: 全レベル参加（現場重視）
- **コミュニケーション**: 全レベル参加（バランス型）
- **イノベーション**: LEVEL 3以上推奨（専門性重視）
- **戦略提案**: LEVEL 4以上60%ウェイト（管理職中心）

## 面談予約機能の権限マトリクス

| 機能 | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|------|----|----|----|----|----|----|----|----|----|----|
| 面談予約申請 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 自分の予約確認 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 予約管理画面 | - | - | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| スケジュール変更 | - | - | - | - | ✓ | - | ✓ | ✓ | ✓ | ✓ |
| 時間枠管理 | - | - | - | - | ✓ | - | ✓ | ✓ | - | - |
| 面談実施 | - | - | - | - | - | ✓ | ✓ | - | - | - |
| 面談記録作成 | - | - | - | - | - | ✓ | ✓ | - | - | - |
| 統計レポート | - | - | - | - | ✓ | - | ✓ | ✓ | ✓ | ✓ |

## システムメニュー表示権限

### LEVEL 5（戦略企画・統括管理部門）専用メニュー
- 面談予約管理
- スケジュール管理
- 予約統計
- 時間枠設定

### LEVEL 6（キャリア支援部門員）追加メニュー
- 面談予定一覧
- 面談記録管理
- キャリア相談履歴

### LEVEL 7（部門長）追加メニュー
- HR ダッシュボード
- ポリシー管理
- タレント分析
- 面談システム設定

この10段階権限システムにより、面談予約機能を含む人財統括本部の業務が効率的に運用され、各レベルに応じた適切な権限管理が実現されます。