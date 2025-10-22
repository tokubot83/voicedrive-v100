# BoardDecisionFollow ページ 暫定マスターリスト

**作成日**: 2025年10月13日
**対象ページ**: https://voicedrive-v100.vercel.app/board-decision-follow
**対象ユーザー**: Level 18（理事長・法人事務局長）

---

## 1. マスターデータ管理境界の定義

### 1.1 基本方針
理事会決定フォロー機能は**VoiceDrive固有の法人レベル管理機能**であるため、ほぼすべてのデータをVoiceDriveが管理します。医療職員管理システムからは、施設名・部署名・ユーザー名などの**参照用マスターデータ**のみを取得します。

---

## 2. VoiceDriveが管理するデータ

### 2.1 理事会決定事項マスター
**テーブル名**: `BoardDecision`
**管理システム**: VoiceDrive
**データソース**: VoiceDrive DB（Prisma ORM）

| フィールド名 | 型 | 説明 | 入力方法 |
|-------------|-----|------|---------|
| id | String | 決定事項ID（主キー） | 自動生成（cuid） |
| boardMeetingId | String | 理事会会議ID | 手動入力 |
| meetingDate | DateTime | 理事会開催日 | 手動入力（日付選択） |
| title | String | 決定事項タイトル | 手動入力 |
| category | String | カテゴリー | 選択式（人事制度、経営方針、施設整備、システム導入、その他） |
| description | String | 詳細説明 | 手動入力（テキストエリア） |
| decision | String | 決定内容 | 手動入力（テキストエリア） |
| implementationDeadline | DateTime | 実施期限 | 手動入力（日付選択） |
| responsibleDept | String | 責任部署名 | **医療システムの部署マスターから選択** |
| responsibleDeptId | String? | 責任部署ID | 部署選択時に自動設定 |
| affectedFacilities | Json | 対象施設（配列） | **医療システムの施設マスターから複数選択** |
| status | String | ステータス | **自動計算**（on_track, at_risk, delayed, completed） |
| progress | Int | 進捗率（0-100） | **自動計算**（マイルストーン・施設実施状況から） |
| lastUpdate | DateTime | 最終更新日時 | 自動更新 |
| createdAt | DateTime | 作成日時 | 自動生成 |

**データ取得API**: `GET /api/board-decisions`
**データ作成API**: `POST /api/board-decisions`

---

### 2.2 マイルストーンマスター
**テーブル名**: `BoardDecisionMilestone`
**管理システム**: VoiceDrive
**データソース**: VoiceDrive DB（Prisma ORM）

| フィールド名 | 型 | 説明 | 入力方法 |
|-------------|-----|------|---------|
| id | String | マイルストーンID（主キー） | 自動生成（cuid） |
| boardDecisionId | String | 親決定事項ID（外部キー） | 親レコード作成時に自動設定 |
| title | String | マイルストーンタイトル | 手動入力 |
| deadline | DateTime | 期限 | 手動入力（日付選択） |
| status | String | ステータス | 選択式（pending, in_progress, completed, delayed） |
| assignee | String | 担当者名 | **医療システムのユーザーマスターから選択** |
| assigneeId | String? | 担当者ID | ユーザー選択時に自動設定 |
| sortOrder | Int | 表示順序 | 手動入力（数値） |
| completedAt | DateTime? | 完了日時 | ステータス=completedの場合に自動設定 |
| createdAt | DateTime | 作成日時 | 自動生成 |
| updatedAt | DateTime | 更新日時 | 自動更新 |

**データ更新API**: `PUT /api/board-decision-milestones/:milestoneId`

**更新時の自動処理**:
- マイルストーンのステータス更新
- **親決定事項の進捗率を自動再計算**
- **親決定事項のステータスを自動更新**

---

### 2.3 施設別実施状況マスター
**テーブル名**: `BoardDecisionFacilityImplementation`
**管理システム**: VoiceDrive
**データソース**: VoiceDrive DB（Prisma ORM）

| フィールド名 | 型 | 説明 | 入力方法 |
|-------------|-----|------|---------|
| id | String | 実施状況ID（主キー） | 自動生成（cuid） |
| boardDecisionId | String | 親決定事項ID（外部キー） | 親レコード作成時に自動設定 |
| facilityId | String | 施設ID | **医療システムの施設マスターから取得** |
| facilityName | String | 施設名（キャッシュ） | 施設ID選択時に自動設定 |
| status | String | ステータス | 選択式（not_started, in_progress, completed） |
| progress | Int | 進捗率（0-100） | 手動入力（スライダー） |
| note | String? | 備考 | 手動入力（テキストエリア、任意） |
| lastUpdate | DateTime | 最終更新日時 | 自動更新 |
| createdAt | DateTime | 作成日時 | 自動生成 |

**データ取得API**: `GET /api/board-decisions/:decisionId/facility-implementations`
**データ更新API**: `PUT /api/board-decision-facility-implementations/:implementationId`

**更新時の自動処理**:
- 施設実施状況の更新
- **親決定事項の進捗率を自動再計算**（全施設の平均進捗率）
- **親決定事項のステータスを自動更新**

---

## 3. 医療職員管理システムから取得するマスターデータ

### 3.1 施設マスター
**テーブル名**: `Facility`（医療職員管理システム側）
**管理システム**: 医療職員管理システム
**VoiceDriveでの取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | 施設ID | BoardDecision.affectedFacilities, FacilityImplementation.facilityId |
| name | String | 施設名 | FacilityImplementation.facilityName（キャッシュ） |
| code | String | 施設コード | 表示用 |
| active | Boolean | 有効フラグ | フィルタリング用 |

**参照タイミング**:
- 理事会決定事項作成時（対象施設選択）
- 施設別実施状況自動生成時
- 施設名表示時

**キャッシュ方針**:
- 施設名は`FacilityImplementation.facilityName`にキャッシュ
- 施設マスターの更新時にキャッシュを再同期（バッチ処理）

---

### 3.2 部署マスター
**テーブル名**: `Department`（医療職員管理システム側）
**管理システム**: 医療職員管理システム
**VoiceDriveでの取得方法**: MCPサーバー経由でキャッシュ済みデータを参照

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | 部署ID | BoardDecision.responsibleDeptId |
| name | String | 部署名 | BoardDecision.responsibleDept（キャッシュ） |
| facilityId | String | 所属施設ID | フィルタリング用 |
| active | Boolean | 有効フラグ | フィルタリング用 |

**参照タイミング**:
- 理事会決定事項作成時（責任部署選択）
- 部署名表示時

**キャッシュ方針**:
- 部署名は`BoardDecision.responsibleDept`にキャッシュ
- 部署マスターの更新時にキャッシュを再同期（バッチ処理）

---

### 3.3 ユーザーマスター
**テーブル名**: `User`（VoiceDrive側にも存在）
**管理システム**: 医療職員管理システム → VoiceDriveに同期済み
**VoiceDriveでの取得方法**: VoiceDrive DB（同期済みUserテーブル）

| フィールド名 | 型 | 説明 | VoiceDriveでの用途 |
|-------------|-----|------|-------------------|
| id | String | ユーザーID | Milestone.assigneeId |
| name | String | ユーザー名 | Milestone.assignee（キャッシュ） |
| department | String | 所属部署 | 表示用 |
| facilityId | String | 所属施設ID | フィルタリング用 |

**参照タイミング**:
- マイルストーン作成時（担当者選択）
- 担当者名表示時

**キャッシュ方針**:
- ユーザー名は`Milestone.assignee`にキャッシュ
- Userテーブルは医療システムと自動同期されているため、追加のキャッシュ処理不要

---

## 4. データフロー図

### 4.1 理事会決定事項作成フロー

```
[理事長/法人事務局長]
        ↓
[決定事項作成フォーム]
        ↓
[医療システムマスター参照]
  - 施設マスター（対象施設選択）
  - 部署マスター（責任部署選択）
  - ユーザーマスター（担当者選択）
        ↓
[POST /api/board-decisions]
        ↓
[VoiceDrive DB書き込み]
  1. BoardDecision作成
  2. BoardDecisionMilestone一括作成
  3. BoardDecisionFacilityImplementation自動生成
        ↓
[完了通知]
```

---

### 4.2 マイルストーン更新フロー

```
[担当者/管理者]
        ↓
[マイルストーンステータス変更]
        ↓
[PUT /api/board-decision-milestones/:id]
        ↓
[VoiceDrive DB更新 + 自動計算]
  1. Milestoneステータス更新
  2. completedAt自動設定（完了時）
  3. 親BoardDecisionの進捗率再計算
  4. 親BoardDecisionのステータス自動更新
        ↓
[更新完了 + 親レコード更新結果返却]
```

---

### 4.3 施設別実施状況更新フロー

```
[施設管理者]
        ↓
[施設実施状況更新フォーム]
        ↓
[PUT /api/board-decision-facility-implementations/:id]
        ↓
[VoiceDrive DB更新 + 自動計算]
  1. FacilityImplementation更新
  2. 親BoardDecisionの進捗率再計算（全施設の平均）
  3. 親BoardDecisionのステータス自動更新
        ↓
[更新完了 + 親レコード更新結果返却]
```

---

## 5. 自動計算ロジックまとめ

### 5.1 進捗率（progress）の自動計算

#### 計算方法A: マイルストーンベース
```typescript
完了済みマイルストーン数 ÷ 総マイルストーン数 × 100
```

#### 計算方法B: 施設実施状況ベース
```typescript
全施設の進捗率の合計 ÷ 施設数
```

#### 採用ロジック
```typescript
if (施設実施状況が存在する) {
  return Math.min(マイルストーンベース, 施設ベース);
} else {
  return マイルストーンベース;
}
```

---

### 5.2 ステータス（status）の自動決定

```typescript
if (progress === 100) {
  return 'completed';
}

if (現在日時 > 実施期限) {
  return 'delayed';
}

if (遅延マイルストーンが存在) {
  return 'at_risk';
}

const 期待進捗率 = 実施期限までの経過日数に基づく計算;

if (progress < 期待進捗率 - 20) {
  return 'at_risk';
}

return 'on_track';
```

---

## 6. マスターデータ同期方針

### 6.1 施設マスター
- **同期方法**: MCPサーバー経由で医療システムの施設マスターを参照
- **キャッシュ**: `FacilityImplementation.facilityName`
- **更新頻度**: 日次バッチ処理で施設名キャッシュを更新

### 6.2 部署マスター
- **同期方法**: MCPサーバー経由で医療システムの部署マスターを参照
- **キャッシュ**: `BoardDecision.responsibleDept`
- **更新頻度**: 日次バッチ処理で部署名キャッシュを更新

### 6.3 ユーザーマスター
- **同期方法**: 既存のUser同期機構（医療システム → VoiceDrive）
- **キャッシュ**: `Milestone.assignee`
- **更新頻度**: リアルタイム同期（医療システム側のユーザー更新時）

---

## 7. データ整合性チェック

### 7.1 孤立レコードの検出
**対象**: `BoardDecisionMilestone`, `BoardDecisionFacilityImplementation`

**チェックロジック**:
```sql
-- 親決定事項が存在しないマイルストーン
SELECT * FROM BoardDecisionMilestone m
LEFT JOIN BoardDecision d ON m.boardDecisionId = d.id
WHERE d.id IS NULL;

-- 親決定事項が存在しない施設実施状況
SELECT * FROM BoardDecisionFacilityImplementation f
LEFT JOIN BoardDecision d ON f.boardDecisionId = d.id
WHERE d.id IS NULL;
```

**実行頻度**: 週次バッチ処理

---

### 7.2 施設名キャッシュの整合性チェック
**チェックロジック**:
```typescript
const implementations = await prisma.boardDecisionFacilityImplementation.findMany();
const facilities = await fetchFacilitiesFromMedicalSystem(); // MCPサーバー経由

const mismatches = implementations.filter(impl => {
  const facility = facilities.find(f => f.id === impl.facilityId);
  return facility && facility.name !== impl.facilityName;
});

if (mismatches.length > 0) {
  // キャッシュを一括更新
  await updateFacilityNameCache(mismatches);
}
```

**実行頻度**: 日次バッチ処理

---

## 8. API別マスターデータ使用一覧

| API | 使用するマスター | 用途 |
|-----|----------------|------|
| GET /api/board-decisions | - | VoiceDrive DBのみ |
| POST /api/board-decisions | 施設マスター、部署マスター、ユーザーマスター | 作成時の選択肢提供・バリデーション |
| PUT /api/board-decision-milestones/:id | ユーザーマスター | 担当者名のキャッシュ更新 |
| PUT /api/board-decision-facility-implementations/:id | 施設マスター | 施設名のキャッシュ更新 |
| GET /api/board-decisions/:id/facility-implementations | 施設マスター | 施設名の最新化 |

---

## 9. 権限レベル別アクセス制御

### 9.1 Level 18（理事長・法人事務局長）
- ✅ 全決定事項の閲覧
- ✅ 新規決定事項の作成
- ✅ 全マイルストーンの更新
- ✅ 全施設実施状況の更新

### 9.2 Level 12-13（施設経営層）
- ✅ 全決定事項の閲覧（自施設の詳細のみ）
- ❌ 新規決定事項の作成（不可）
- ✅ 自施設のマイルストーンの更新
- ✅ 自施設の実施状況の更新

### 9.3 Level 9-11（部長級）
- ✅ 自部署が責任部署の決定事項の閲覧
- ❌ 新規決定事項の作成（不可）
- ✅ 担当マイルストーンの更新
- ❌ 施設実施状況の更新（不可）

### 9.4 Level 1-8（一般職員）
- ✅ 自部署が責任部署の決定事項の閲覧（読み取り専用）
- ❌ すべての更新操作が不可

---

## 10. まとめ

### 10.1 マスターデータ管理の責任分担

| マスター | 管理システム | VoiceDriveでの扱い |
|---------|-------------|------------------|
| 理事会決定事項 | VoiceDrive | 主管理 |
| マイルストーン | VoiceDrive | 主管理 |
| 施設別実施状況 | VoiceDrive | 主管理 |
| 施設マスター | 医療職員管理システム | 参照のみ（キャッシュあり） |
| 部署マスター | 医療職員管理システム | 参照のみ（キャッシュあり） |
| ユーザーマスター | 医療職員管理システム | 同期済み（キャッシュあり） |

### 10.2 自動処理の責任範囲

| 処理内容 | 実装場所 | トリガー |
|---------|---------|---------|
| 進捗率計算 | VoiceDrive サービス層 | マイルストーン/施設実施状況更新時 |
| ステータス自動更新 | VoiceDrive サービス層 | マイルストーン/施設実施状況更新時 |
| 施設実施状況自動生成 | VoiceDrive サービス層 | 決定事項作成時 |
| 施設名キャッシュ更新 | VoiceDrive バッチ処理 | 日次 |
| 部署名キャッシュ更新 | VoiceDrive バッチ処理 | 日次 |

### 10.3 データ整合性の維持方法
- **親子関係**: Prismaのカスケード削除（onDelete: Cascade）
- **キャッシュ整合性**: 日次バッチ処理で医療システムマスターと同期
- **孤立レコード**: 週次バッチ処理で検出・警告

---

**文書作成者**: Claude (VoiceDrive開発AI)
**最終更新**: 2025年10月13日
