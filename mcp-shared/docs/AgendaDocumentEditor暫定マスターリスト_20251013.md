# AgendaDocumentEditor コンポーネント 暫定マスターリスト

**作成日**: 2025年10月13日
**対象コンポーネント**: src/components/proposal/AgendaDocumentEditor.tsx
**対象ユーザー**: Level 9以上（課長・部長・施設長・経営層）

---

## 1. マスターデータ管理境界の定義

### 1.1 基本方針
議題提案書エディター機能は**VoiceDrive固有の提案管理機能**であるため、ほぼすべてのデータをVoiceDriveが管理します。医療職員管理システムからは、ユーザー名・部署名などの**参照用マスターデータ**のみを取得します。

---

## 2. VoiceDriveが管理するデータ

### 2.1 提案書類マスター
**テーブル名**: `ProposalDocument`
**管理システム**: VoiceDrive
**データソース**: VoiceDrive DB（Prisma ORM）

| フィールド名 | 型 | 説明 | 入力方法 |
|-------------|-----|------|---------|
| id | String | 提案書類ID（主キー） | 自動生成（cuid） |
| postId | String | 元の提案（Post）ID | ProposalEscalationEngineから自動設定 |
| title | String | 議題名 | 手動入力（必須） |
| agendaLevel | String | 議題レベル | 自動判定（'施設議題', '法人議題'等） |
| createdById | String | 作成者ID | ログインユーザーから自動設定 |
| status | String | ステータス | 初期値: 'draft'、手動/自動変更 |
| summary | String | 要約 | ProposalEscalationEngineから自動生成 |
| background | String | 背景・現状の課題 | 手動入力（エディターで編集可） |
| objectives | String | 目的 | 手動入力（エディターで編集可） |
| expectedEffects | String | 期待される効果 | 手動入力（エディターで編集可） |
| concerns | String | 懸念事項 | ProposalEscalationEngineから自動生成 |
| counterMeasures | String | 対策案 | 手動入力（エディターで編集可） |
| voteAnalysis | Json | 投票分析データ | ProposalEscalationEngineから自動生成 |
| commentAnalysis | Json | コメント分析データ | ProposalEscalationEngineから自動生成 |
| relatedInfo | Json? | 関連情報 | 任意入力 |
| managerNotes | String? | 管理者メモ | 手動入力（管理者のみ） |
| additionalContext | String? | 追加コンテキスト | 手動入力 |
| recommendationLevel | String? | 推奨レベル | ProposalEscalationEngineから自動設定 |
| targetCommittee | String? | 対象委員会 | ProposalEscalationEngineから自動判定 |
| submittedDate | DateTime? | 提出日 | 提出ボタン押下時に自動設定 |
| submittedById | String? | 提出者ID | 提出ボタン押下時に自動設定 |
| committeeDecision | Json? | 委員会決定内容 | 委員会承認後に入力 |
| createdAt | DateTime | 作成日時 | 自動生成 |
| updatedAt | DateTime | 更新日時 | 自動更新 |
| lastModifiedDate | DateTime | 最終編集日時 | 自動更新 |

**データ取得API**: `GET /api/proposal-documents/:documentId`
**データ作成API**: `POST /api/proposal-documents`
**データ更新API**: `PUT /api/proposal-documents/:documentId`

---

### 2.2 提案書類監査ログマスター
**テーブル名**: `ProposalAuditLog`
**管理システム**: VoiceDrive
**データソース**: VoiceDrive DB（Prisma ORM）

| フィールド名 | 型 | 説明 | 入力方法 |
|-------------|-----|------|---------|
| id | String | 監査ログID（主キー） | 自動生成（cuid） |
| documentId | String | 提案書類ID（外部キー） | 親レコードから自動設定 |
| action | String | アクション種別 | 自動設定（'CREATED', 'UPDATED', 'SUBMITTED', 'EXPORTED'） |
| userId | String | 実行者ID | ログインユーザーから自動設定 |
| userName | String | 実行者名 | **医療システムのユーザーマスターから取得** |
| userLevel | Int | 実行者権限レベル | **医療システムのユーザーマスターから取得** |
| changedFields | Json | 変更されたフィールド | 変更検出ロジックで自動生成 |
| previousValues | Json? | 変更前の値 | 変更検出ロジックで自動保存 |
| newValues | Json? | 変更後の値 | 変更検出ロジックで自動保存 |
| ipAddress | String? | IPアドレス | リクエストから自動取得 |
| userAgent | String? | User Agent | リクエストから自動取得 |
| timestamp | DateTime | 実行日時 | 自動生成 |

**データ取得API**: `GET /api/proposal-documents/:documentId/audit-logs`

**監査ログ作成タイミング**:
- 提案書類作成時（action: 'CREATED'）
- セクション編集・保存時（action: 'UPDATED'）
- 委員会提出時（action: 'SUBMITTED'）
- PDF/Wordエクスポート時（action: 'EXPORTED'）

---

### 2.3 委員会情報マスター（将来実装）
**テーブル名**: `CommitteeInfo`（未実装、現在はProposalEscalationEngineにハードコード）
**管理システム**: VoiceDrive
**データソース**: ProposalEscalationEngine（サービス層）

**現在のハードコードデータ**:
| 委員会名 | スケジュール | 施設 | 対象カテゴリー |
|---------|------------|------|---------------|
| 医療安全管理委員会 | 第2火曜日 | 小原病院 | 医療安全、患者安全、インシデント対策 |
| 感染対策委員会 | 第3水曜日 | 小原病院 | 感染対策、衛生管理、感染予防 |
| 業務改善委員会 | 第4木曜日 | 小原病院 | 業務改善、効率化、コスト削減 |
| 小原病院運営委員会 | 月2回（第2・第4月曜日） | 小原病院 | 施設運営、戦略提案、組織改革 |
| 病院意思決定会議 | 月1回（第1金曜日） | 小原病院 | 経営判断、重要決定、投資案件 |

**将来的なDB化の必要性**: 中（他施設展開時に必須）

---

## 3. 医療職員管理システムから取得するマスターデータ

### 3.1 ユーザーマスター
**テーブル名**: `User`（VoiceDrive側にも同期済み）
**管理システム**: 医療職員管理システム → VoiceDriveに同期済み
**VoiceDriveでの取得方法**: VoiceDrive DB（同期済みUserテーブル）

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | ユーザーID | ProposalDocument.createdById, submittedById |
| name | String | ユーザー名 | ProposalAuditLog.userName（表示用） |
| permissionLevel | Int | 権限レベル | ProposalAuditLog.userLevel、権限チェック用 |
| department | String | 所属部署 | 提案者情報表示用 |
| facilityId | String | 所属施設ID | 権限チェック用 |

**参照タイミング**:
- 提案書類作成時（作成者情報）
- 編集時（編集権限チェック）
- 監査ログ作成時（実行者情報）

**キャッシュ方針**:
- Userテーブルは医療システムと自動同期されているため、追加のキャッシュ処理不要
- 監査ログには実行時のユーザー名・レベルをスナップショットとして保存

---

### 3.2 部署マスター
**テーブル名**: `Department`（医療職員管理システム側）
**管理システム**: 医療職員管理システム
**VoiceDriveでの取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | 部署ID | 部署フィルター用 |
| name | String | 部署名 | ProposalDocumentの提案者部署表示用 |
| facilityId | String | 所属施設ID | フィルタリング用 |
| active | Boolean | 有効フラグ | フィルタリング用 |

**参照タイミング**:
- 提案書類表示時（提案者部署名表示）
- 委員会メンバー選択時

**キャッシュ方針**:
- 部署名はUserテーブルの`department`フィールドにキャッシュ済み
- 追加のキャッシュ不要

---

### 3.3 施設マスター
**テーブル名**: `Facility`（医療職員管理システム側）
**管理システム**: 医療職員管理システム
**VoiceDriveでの取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | 施設ID | 権限チェック用 |
| name | String | 施設名 | 委員会情報表示用 |
| code | String | 施設コード | フィルタリング用 |
| active | Boolean | 有効フラグ | フィルタリング用 |

**参照タイミング**:
- 委員会情報表示時（委員会所属施設名）
- 権限チェック時（提案書類がユーザーの施設に属するか）

**キャッシュ方針**:
- CommitteeInfo.facility（現在はハードコード）
- 将来的にCommitteeInfoテーブル作成時にfacilityIdをキャッシュ

---

## 4. データフロー図

### 4.1 提案書類作成フロー

```
[提案がスコア100点到達]
        ↓
[ProposalEscalationEngine]
  - determineTargetCommittee() 委員会判定
  - generateAgendaDocument() 文書自動生成
        ↓
[AgendaDocumentEditor コンポーネント起動]
        ↓
[ユーザーが編集]
  - タイトル、背景、提案内容、期待効果、予算を編集
        ↓
[保存ボタン押下]
        ↓
[POST /api/proposal-documents]
        ↓
[VoiceDrive DB書き込み]
  1. ProposalDocument作成（status: 'draft'）
  2. ProposalAuditLog作成（action: 'CREATED'）
        ↓
[完了通知]
```

---

### 4.2 提案書類編集フロー

```
[ユーザーが編集ボタン押下]
        ↓
[編集モード有効化]
        ↓
[セクション編集]
  - hasUnsavedChanges = true
        ↓
[保存ボタン押下]
        ↓
[PUT /api/proposal-documents/:id]
        ↓
[VoiceDrive DB更新 + 監査ログ作成]
  1. ProposalDocument更新
  2. lastModifiedDate更新
  3. ProposalAuditLog作成（action: 'UPDATED'）
     - changedFields: ['background', 'expectedEffects']
     - previousValues: { background: '旧値', ... }
     - newValues: { background: '新値', ... }
        ↓
[更新完了 + hasUnsavedChanges = false]
```

---

### 4.3 PDF/Wordエクスポートフロー

```
[エクスポートボタン押下]
        ↓
[フォーマット選択（PDF or Word）]
        ↓
[POST /api/proposal-documents/:id/export]
        ↓
[VoiceDrive サービス層]
  1. documentExportService.generatePDF() または generateWord()
  2. テンプレートエンジンで文書生成
  3. 一時ファイル保存（24時間有効）
  4. ProposalAuditLog作成（action: 'EXPORTED'）
        ↓
[ダウンロードURL返却]
        ↓
[ブラウザでファイルダウンロード]
```

---

## 5. 権限レベル別アクセス制御

### 5.1 Level 9-10（課長・部長）
- ✅ 自部署の提案書類の閲覧
- ✅ 自部署の提案書類の編集
- ✅ 自部署の提案書類のエクスポート
- ❌ 他部署の提案書類の編集（閲覧のみ可）

### 5.2 Level 11（施設長）
- ✅ 自施設のすべての提案書類の閲覧
- ✅ 自施設のすべての提案書類の編集
- ✅ 自施設のすべての提案書類のエクスポート
- ❌ 他施設の提案書類の編集（閲覧のみ可）

### 5.3 Level 12-17（経営層）
- ✅ 権限範囲内のすべての提案書類の閲覧
- ✅ 権限範囲内のすべての提案書類の編集
- ✅ 権限範囲内のすべての提案書類のエクスポート

### 5.4 Level 18（理事長・法人事務局長）
- ✅ すべての提案書類の閲覧
- ✅ すべての提案書類の編集
- ✅ すべての提案書類のエクスポート
- ✅ すべての監査ログの閲覧

---

## 6. 編集可能セクション一覧

### 6.1 フロントエンドで編集可能なセクション

| セクションID | ラベル | DBフィールド | 必須 | 複数行 | 権限 |
|-------------|--------|-------------|-----|--------|------|
| title | 議題名 | title | ✅ | ❌ | Level 9+ |
| background | 背景・現状の課題 | background | ❌ | ✅ | Level 9+ |
| content | 提案内容 | objectives | ✅ | ✅ | Level 9+ |
| expectedEffect | 期待される効果 | expectedEffects | ❌ | ✅ | Level 9+ |
| budget | 必要予算 | (ProposalDocument.relatedInfo内) | ❌ | ❌ | Level 9+ |
| votingSummary | 投票結果サマリー | voteAnalysis（表示のみ） | ❌ | ✅ | 自動生成 |

**注**: `votingSummary`は自動生成されるため、編集不可（表示のみ）

---

## 7. 監査ログのアクション種別

| アクション | 説明 | 記録タイミング | changedFields例 |
|-----------|------|--------------|----------------|
| CREATED | 提案書類作成 | 初回作成時 | `['all_fields']` |
| UPDATED | フィールド更新 | 保存ボタン押下時 | `['background', 'expectedEffects']` |
| SUBMITTED | 委員会提出 | 提出ボタン押下時 | `['status', 'submittedDate', 'submittedById']` |
| EXPORTED | エクスポート | PDF/Word生成時 | `['format']` （例: `{format: 'pdf'}`） |

---

## 8. データ整合性チェック

### 8.1 孤立レコードの検出
**対象**: `ProposalAuditLog`

**チェックロジック**:
```sql
-- 親提案書類が存在しない監査ログ
SELECT * FROM ProposalAuditLog a
LEFT JOIN ProposalDocument d ON a.documentId = d.id
WHERE d.id IS NULL;
```

**実行頻度**: 週次バッチ処理

---

### 8.2 編集履歴の整合性チェック
**チェック内容**:
- ProposalDocumentの`lastModifiedDate`が最新の監査ログの`timestamp`と一致するか
- 監査ログの`changedFields`が実際の変更内容と一致するか

**実行頻度**: 日次バッチ処理

---

## 9. API別マスターデータ使用一覧

| API | 使用するマスター | 用途 |
|-----|----------------|------|
| GET /api/proposal-documents/:id | Userマスター | 編集権限チェック |
| PUT /api/proposal-documents/:id | Userマスター | 更新者情報取得、権限チェック |
| POST /api/proposal-documents | Userマスター、CommitteeInfo | 作成者情報、委員会情報 |
| POST /api/proposal-documents/:id/export | - | VoiceDrive DBのみ |
| GET /api/proposal-documents/:id/audit-logs | Userマスター | 監査ログの表示用ユーザー名取得 |

---

## 10. エクスポート機能の詳細

### 10.1 PDF生成
**使用ライブラリ**: PDFKit
**テンプレート**: ProposalEscalationEngineの`getDocumentTemplate()`を使用
**出力先**: 一時フォルダ（24時間後に自動削除）

### 10.2 Word生成
**使用ライブラリ**: Docx.js
**テンプレート**: ProposalEscalationEngineの`getDocumentTemplate()`を使用
**出力先**: 一時フォルダ（24時間後に自動削除）

### 10.3 ファイル命名規則
```
議題提案書_{委員会名}_{提案ID}_{YYYYMMDD}.{pdf|docx}

例: 議題提案書_医療安全管理委員会_clxxx123_20251013.pdf
```

---

## 11. まとめ

### 11.1 マスターデータ管理の責任分担

| マスター | 管理システム | VoiceDriveでの扱い |
|---------|-------------|------------------|
| 提案書類 | VoiceDrive | 主管理 |
| 監査ログ | VoiceDrive | 主管理 |
| 委員会情報 | VoiceDrive | 主管理（現在はハードコード） |
| ユーザーマスター | 医療職員管理システム | 同期済み（参照のみ） |
| 部署マスター | 医療職員管理システム | 参照のみ（User.departmentにキャッシュ） |
| 施設マスター | 医療職員管理システム | 参照のみ（CommitteeInfoにキャッシュ予定） |

### 11.2 自動処理の責任範囲

| 処理内容 | 実装場所 | トリガー |
|---------|---------|---------|
| 文書自動生成 | ProposalEscalationEngine | スコア100点到達時 |
| 委員会判定 | ProposalEscalationEngine | スコア100点到達時 |
| 監査ログ作成 | API層（proposalDocumentService） | 作成/更新/提出/エクスポート時 |
| PDF/Word生成 | documentExportService | エクスポートボタン押下時 |
| 権限チェック | API層（proposalDocumentService） | すべてのAPI呼び出し時 |

### 11.3 データ整合性の維持方法
- **親子関係**: Prismaのカスケード削除（onDelete: Cascade）
- **監査ログ**: すべての変更操作を記録
- **権限チェック**: API層で統一的に実施

---

**文書作成者**: Claude (VoiceDrive開発AI)
**最終更新**: 2025年10月13日
