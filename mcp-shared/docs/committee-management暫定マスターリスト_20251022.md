# committee-management 暫定マスターリスト

**文書番号**: MASTER-CM-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: `/committee-management` (CommitteeManagementPage)
**URL**: https://voicedrive-v100.vercel.app/committee-management
**権限レベル**: Level 7以上

---

## 📋 ページ概要

### 基本情報
| 項目 | 内容 |
|-----|------|
| ページ名 | 委員会管理ページ |
| ルート | `/committee-management` |
| コンポーネント | `src/pages/CommitteeManagementPage.tsx` |
| 主要サービス | `CommitteeSubmissionService`, `ManagementCommitteeService` |
| 必要権限 | Level 7以上（主任・係長以上） |
| レイアウト | サイドバー付きレイアウト |

### 機能概要
医療施設における委員会の統合管理ページ。委員会への提出リクエストの承認・却下、議題管理、会議スケジュール管理、委員会運営を一元的に管理する。

### 主要な4つのタブ
1. **提出承認** - 委員会提出リクエストの承認・却下（Level 8以上）
2. **議題一覧** - 委員会で審議される議題の一覧・検索・フィルタリング
3. **カレンダー** - 委員会の会議スケジュール管理
4. **委員会一覧** - 登録されている委員会の情報表示

---

## 🎯 権限レベル別機能

| 権限レベル | 役職例 | 利用可能機能 |
|-----------|-------|------------|
| Level 7-9 | 主任・係長 | 議題閲覧、委員会情報閲覧、提出リクエスト作成 |
| Level 8+ | 課長・看護師長以上 | 提出リクエスト承認・却下、議題閲覧、委員会情報閲覧 |
| Level 10+ | 運営委員会メンバー | 全機能利用可能（会議スケジュール作成、委員会情報編集） |

---

## 📊 データベーステーブル構成

### 主要テーブル一覧

| # | テーブル名 | 用途 | ステータス | データ管理責任 |
|---|----------|------|----------|-------------|
| 1 | CommitteeSubmissionRequest | 提出リクエスト管理 | ✅ 実装済み | VoiceDrive |
| 2 | ProposalDocument | 議題提案書 | ✅ 実装済み | VoiceDrive |
| 3 | ManagementCommitteeAgenda | 委員会議題 | ✅ 実装済み | VoiceDrive |
| 4 | CommitteeInfo | 委員会マスタ | ✅ 実装済み | VoiceDrive |
| 5 | CommitteeMember | 委員会メンバー | ✅ 実装済み | VoiceDrive（医療システムから同期） |
| 6 | CommitteeMeeting | 会議スケジュール | ✅ 実装済み | VoiceDrive |
| 7 | User | 職員情報（キャッシュ） | ✅ 実装済み | 医療システム（VoiceDriveはキャッシュ） |

---

## 📁 ファイル構成

### コンポーネント
```
src/pages/CommitteeManagementPage.tsx          # メインページ (843行)
```

### サービス
```
src/services/CommitteeSubmissionService.ts     # 提出リクエスト管理 (218行)
src/services/ManagementCommitteeService.ts     # 議題・委員会・会議管理 (370行)
src/services/ProposalDocumentGenerator.ts      # 議題提案書生成
```

### 型定義
```
src/types/committee.ts                         # 委員会関連型定義 (167行)
src/types/proposalDocument.ts                  # 議題提案書型定義 (170行)
```

---

## 🔄 データフロー

### フロー1: 提出リクエスト承認フロー

```
[Level 7職員]
    ↓ 議題提案書作成
[ProposalDocument]
    ↓ status = 'ready'
[Level 7職員]
    ↓ 提出リクエスト作成
[CommitteeSubmissionRequest]
    ↓ status = 'pending'
[Level 8管理職]
    ↓ 承認 or 却下
[CommitteeSubmissionRequest]
    ├→ approved: 委員会に提出
    └→ rejected: 却下理由付きで差し戻し
```

### フロー2: 議題審議フロー

```
[委員会提出]
    ↓
[ManagementCommitteeAgenda]
    ↓ status = 'pending'
[委員会会議]
    ↓ 審議
[ManagementCommitteeAgenda]
    ├→ approved: 実施決定
    ├→ rejected: 却下
    └→ deferred: 保留
```

### フロー3: 会議スケジュール管理フロー

```
[事務局]
    ↓ 会議登録
[CommitteeMeeting]
    ↓ status = 'scheduled'
[通知送信]
    ↓ 会議当日
[CommitteeMeeting]
    ↓ status = 'in_progress'
[議事録入力]
    ↓
[CommitteeMeeting]
    ↓ status = 'completed'
[医療システムへ通知]
```

---

## 🗂️ タブ別詳細仕様

### タブ1: 提出承認（Submission Requests）

#### 画面レイアウト
```
┌─────────────────────────────────────────┐
│ 📊 統計サマリー                          │
│ 承認待ち: 3  承認済み: 12                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [⏳ 承認待ち] [📋 全て]                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📄 夜勤体制の見直しと人員配置最適化       │
│ ⏳ 承認待ち                              │
│ 👤 山田花子 (Level 7)                    │
│ 🏛️ 運営委員会                           │
│ 📅 2025-10-15                            │
│                                         │
│ [✅ 承認] [❌ 却下]  (Level 8以上のみ)   │
└─────────────────────────────────────────┘
```

#### 表示項目
| 項目 | データソース | 備考 |
|-----|------------|------|
| 提案タイトル | ProposalDocument.title | |
| ステータス | CommitteeSubmissionRequest.status | 承認待ち/承認済み/却下 |
| リクエスト作成者 | User.name | キャッシュ |
| 権限レベル | User.permissionLevel | キャッシュ |
| 提出先委員会 | CommitteeSubmissionRequest.targetCommittee | |
| リクエスト日 | CommitteeSubmissionRequest.requestedDate | |
| 承認者/却下者 | CommitteeSubmissionRequest.reviewedBy | status != 'pending' の場合 |
| コメント | CommitteeSubmissionRequest.reviewNotes | 承認コメント・却下理由 |

#### 操作
- **承認** (Level 8以上):
  - コメント入力（任意）
  - status → 'approved'
  - ProposalDocument → Committee提出
- **却下** (Level 8以上):
  - 却下理由入力（必須）
  - status → 'rejected'

---

### タブ2: 議題一覧（Agenda）

#### 画面レイアウト
```
┌─────────────────────────────────────────┐
│ 🔍 検索バー                              │
│ [議題タイトル、提案者、説明で検索...]     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ フィルター:                              │
│ [全ステータス ▼] [全優先度 ▼] [全タイプ ▼] │
│ [フィルタークリア]                       │
│                                         │
│ 📝 6件の議題                             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 夜勤体制の見直しと人員配置最適化          │
│ ✅ 承認  🔥 高  👥 人事                  │
│                                         │
│ 説明: 夜勤帯の看護師配置を見直し...      │
│ 👤 看護部 (看護部)  📅 2025-09-15       │
│ ✅ 決定: 2025-09-28                     │
│ 🏢 影響部署: 看護部, 医事課              │
│ 💰 予算: ¥500,000                       │
│                                         │
│ 決定事項:                                │
│ 2025年11月から試験運用開始。3ヶ月後に... │
└─────────────────────────────────────────┘
```

#### フィルター機能
| フィルター | 選択肢 |
|----------|-------|
| ステータス | 全ステータス / 審議待ち / 審議中 / 承認 / 却下 / 保留 |
| 優先度 | 全優先度 / 緊急 / 高 / 通常 / 低 |
| 議題タイプ | 全タイプ / 委員会提案 / 施設方針 / 人事 / 予算 / 設備 / その他 |
| 検索クエリ | 自由テキスト（タイトル、説明、提案者） |

#### 表示項目
| 項目 | データソース |
|-----|------------|
| 議題タイトル | ManagementCommitteeAgenda.title |
| ステータスバッジ | ManagementCommitteeAgenda.status |
| 優先度バッジ | ManagementCommitteeAgenda.priority |
| 議題タイプバッジ | ManagementCommitteeAgenda.agendaType |
| 説明 | ManagementCommitteeAgenda.description |
| 提案者 | ManagementCommitteeAgenda.proposedBy |
| 提案部署 | ManagementCommitteeAgenda.proposerDepartment |
| 提案日 | ManagementCommitteeAgenda.proposedDate |
| 決定日 | ManagementCommitteeAgenda.decidedDate |
| 影響部署 | ManagementCommitteeAgenda.impactDepartments |
| 予算 | ManagementCommitteeAgenda.estimatedCost |
| 決定事項 | ManagementCommitteeAgenda.decisionNotes |

---

### タブ3: カレンダー（Calendar）

#### 画面レイアウト
```
┌─────────────────────────────────────────┐
│ 📅 会議スケジュール                       │
│ [◀] 2025年10月 [▶]  [今月]              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ ┌──────┐                                │
│ │ 10月 │ 運営委員会                       │
│ │  15  │ ⏰ 14:00  📍 本館3F 会議室A      │
│ │ (火) │ ✅ 予定   📋 審議予定議題: 3件   │
│ └──────┘                                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📊 今月の統計                            │
│ 予定会議数: 3件                          │
│ 審議予定議題: 9件                        │
│ 完了会議: 0件                            │
└─────────────────────────────────────────┘
```

#### 表示項目
| 項目 | データソース |
|-----|------------|
| 委員会名 | CommitteeMeeting.committeeName |
| 開催日時 | CommitteeMeeting.date |
| 会場 | CommitteeMeeting.venue |
| ステータス | CommitteeMeeting.status (予定/進行中/完了/中止) |
| 審議予定議題数 | CommitteeMeeting.agendaCount |
| 議長 | CommitteeMeeting.chairperson |

#### 統計情報
- 予定会議数: COUNT(status = 'scheduled')
- 審議予定議題: SUM(agendaCount WHERE status = 'scheduled')
- 完了会議: COUNT(status = 'completed')

---

### タブ4: 委員会一覧（Committees）

#### 画面レイアウト
```
┌──────────────────┬──────────────────┐
│ 🏛️ 運営委員会      │ 🏛️ 医療安全委員会  │
│ 病院運営の最高意思 │ 医療安全の推進と... │
│ 決定機関          │                  │
│                  │                  │
│ メンバー数: 12名   │ メンバー数: 10名   │
│ 総開催回数: 48回   │ 総開催回数: 52回   │
│                  │                  │
│ 委員長: 院長       │ 委員長: 副院長     │
│ 審議中議題: 5件    │ 審議中議題: 3件    │
│ 次回開催:10/15(火) │ 次回開催:10/12(土) │
│                  │                  │
│ [📝 議題を見る]   │ [📝 議題を見る]   │
└──────────────────┴──────────────────┘
┌─────────────────────────────────────────┐
│ 🗂️ 委員会活動サマリー                     │
│ 総委員会数: 8                             │
│ 総メンバー数: 67名                        │
│ 審議中議題: 24件                          │
│ 予定会議: 7件                             │
└─────────────────────────────────────────┘
```

#### 表示項目
| 項目 | データソース |
|-----|------------|
| 委員会名 | CommitteeInfo.name |
| 説明 | CommitteeInfo.description |
| メンバー数 | CommitteeInfo.memberCount |
| 総開催回数 | CommitteeInfo.totalMeetings |
| 委員長 | CommitteeInfo.chairperson |
| 次回開催日 | CommitteeInfo.nextMeetingDate |
| 審議中議題数 | CommitteeInfo.activeAgendas |

#### 統計サマリー
- 総委員会数: COUNT(CommitteeInfo)
- 総メンバー数: SUM(CommitteeInfo.memberCount)
- 審議中議題: SUM(CommitteeInfo.activeAgendas)
- 予定会議: COUNT(nextMeetingDate > NOW())

---

## 🔌 API仕様

### VoiceDrive提供API（医療システム向け）

#### 1. 委員会議題取得
```http
GET /api/committees/{committeeId}/agendas
Authorization: Bearer {jwt_token}

Query Parameters:
  - status: pending | in_review | approved | rejected | deferred
  - priority: urgent | high | normal | low
  - limit: number (default: 50)
  - offset: number (default: 0)

Response 200:
{
  "agendas": [
    {
      "id": "agenda-1",
      "title": "夜勤体制の見直しと人員配置最適化",
      "status": "approved",
      "priority": "high",
      ...
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 50,
    "offset": 0
  },
  "stats": {
    "pending": 5,
    "in_review": 3,
    "approved": 12,
    "rejected": 2,
    "deferred": 2
  }
}
```

#### 2. 提出リクエスト統計
```http
GET /api/committee-submissions/stats
Authorization: Bearer {jwt_token}

Query Parameters:
  - startDate: ISO 8601 date (optional)
  - endDate: ISO 8601 date (optional)

Response 200:
{
  "pending": 3,
  "approved": 45,
  "rejected": 12,
  "total": 60,
  "byCommittee": [
    {
      "committeeName": "運営委員会",
      "pending": 1,
      "approved": 15,
      "rejected": 3
    },
    ...
  ],
  "byMonth": [
    {
      "month": "2025-10",
      "pending": 3,
      "approved": 8,
      "rejected": 2
    },
    ...
  ]
}
```

---

### 医療システム提供API（VoiceDrive向け）

#### 1. 部署マスタ取得
```http
GET /api/departments
Authorization: Bearer {jwt_token}

Query Parameters:
  - facilityId: string (optional)
  - includeInactive: boolean (default: false)

Response 200:
{
  "departments": [
    {
      "id": "dept-001",
      "name": "内科",
      "facilityId": "obara-hospital",
      "parentDepartmentId": null,
      "isActive": true,
      "employeeCount": 45
    },
    ...
  ]
}
```

#### 2. 会議室マスタ取得
```http
GET /api/meeting-rooms
Authorization: Bearer {jwt_token}

Query Parameters:
  - facilityId: string (optional)

Response 200:
{
  "rooms": [
    {
      "id": "room-001",
      "name": "本館3F 会議室A",
      "capacity": 20,
      "facilityId": "obara-hospital",
      "equipment": ["プロジェクター", "ホワイトボード", "TV会議システム"]
    },
    ...
  ]
}
```

#### 3. 職員情報取得（キャッシュ更新用）
```http
GET /api/employees/{employeeId}
Authorization: Bearer {jwt_token}

Response 200:
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田 花子",
  "department": "内科",
  "position": "看護師",
  "permissionLevel": 7.0,
  "email": "hanako.yamada@obara-hospital.jp"
}
```

---

### Webhook仕様

#### 1. 会議結果通知（VoiceDrive → 医療システム）
```http
POST {medical_system_url}/api/webhooks/committee-meeting-completed
Content-Type: application/json
X-VoiceDrive-Signature: sha256=...

Body:
{
  "eventType": "committee.meeting.completed",
  "timestamp": "2025-10-15T16:00:00Z",
  "data": {
    "meetingId": "meeting-001",
    "committeeName": "運営委員会",
    "date": "2025-10-15T14:00:00Z",
    "agendasDiscussed": 3,
    "decisionsCount": 2,
    "meetingMinutes": "..."
  }
}
```

#### 2. 職員情報更新（医療システム → VoiceDrive）
```http
POST {voicedrive_url}/api/webhooks/employee-updated
Content-Type: application/json
X-Medical-System-Signature: sha256=...

Body:
{
  "eventType": "employee.department_changed",
  "timestamp": "2025-10-15T10:00:00Z",
  "data": {
    "employeeId": "OH-NS-2024-001",
    "department": "外科",
    "previousDepartment": "内科",
    "effectiveDate": "2025-10-01"
  }
}
```

---

## 🔒 セキュリティ・権限管理

### アクセス制御マトリクス

| 機能 | Level 7-9 | Level 8-9 | Level 10+ |
|-----|----------|----------|----------|
| ページアクセス | ✅ | ✅ | ✅ |
| 提出リクエスト作成 | ✅ | ✅ | ✅ |
| 提出リクエスト承認・却下 | ❌ | ✅ | ✅ |
| 議題一覧閲覧 | ✅ | ✅ | ✅ |
| 会議スケジュール閲覧 | ✅ | ✅ | ✅ |
| 会議スケジュール作成 | ❌ | ❌ | ✅ |
| 委員会情報編集 | ❌ | ❌ | ✅ |

### データ可視性ルール

```typescript
// 提出リクエストの可視性
function canViewSubmissionRequest(user: User): boolean {
  return user.permissionLevel >= 7;
}

// 承認・却下権限
function canApproveSubmission(user: User): boolean {
  return user.permissionLevel >= 8;
}

// 会議スケジュール作成権限
function canCreateMeeting(user: User): boolean {
  return user.permissionLevel >= 10;
}

// 委員会メンバーかどうか
function isCommitteeMember(user: User, committeeId: string): boolean {
  return user.permissionLevel >= 10;
}
```

---

## 📝 データ整合性チェック

### 日次バッチチェック項目

#### 1. 委員会メンバー数の整合性
```sql
-- CommitteeInfo.memberCount が実際のメンバー数と一致するか
SELECT
  ci.id,
  ci.name,
  ci.memberCount as recorded_count,
  COUNT(cm.id) as actual_count
FROM CommitteeInfo ci
LEFT JOIN CommitteeMember cm ON cm.committeeId = ci.id AND cm.isActive = true
GROUP BY ci.id
HAVING recorded_count != actual_count;
```

#### 2. 審議中議題数の整合性
```sql
-- CommitteeInfo.activeAgendas が実際の審議中議題数と一致するか
SELECT
  ci.id,
  ci.name,
  ci.activeAgendas as recorded_count,
  COUNT(mca.id) as actual_count
FROM CommitteeInfo ci
LEFT JOIN ManagementCommitteeAgenda mca
  ON mca.targetCommittee = ci.name
  AND mca.status IN ('pending', 'in_review')
GROUP BY ci.id
HAVING recorded_count != actual_count;
```

#### 3. 会議の議題数整合性
```sql
-- CommitteeMeeting.agendaCount が実際の議題数と一致するか
SELECT
  cm.id,
  cm.committeeName,
  cm.agendaCount as recorded_count,
  COUNT(DISTINCT mca.id) as actual_count
FROM CommitteeMeeting cm
LEFT JOIN ManagementCommitteeAgenda mca
  ON DATE(mca.scheduledDate) = DATE(cm.date)
  AND mca.targetCommittee = cm.committeeName
GROUP BY cm.id
HAVING recorded_count != actual_count;
```

---

## ✅ 実装チェックリスト

### データベース
- [x] CommitteeSubmissionRequest テーブル
- [x] ProposalDocument テーブル
- [x] ManagementCommitteeAgenda テーブル
- [x] CommitteeInfo テーブル
- [x] CommitteeMember テーブル
- [x] CommitteeMeeting テーブル
- [x] User テーブル（医療システムからキャッシュ）
- [ ] 部門フィルタリング用フィールド追加（将来要件）
- [ ] MeetingMinutes テーブル作成（将来要件）

### API実装
- [ ] 委員会議題取得API（VoiceDrive→医療）
- [ ] 提出リクエスト統計API（VoiceDrive→医療）
- [ ] 部署マスタ取得API（医療→VoiceDrive）
- [ ] 会議室マスタ取得API（医療→VoiceDrive）
- [ ] 職員情報取得API（医療→VoiceDrive）
- [ ] 会議結果通知Webhook（VoiceDrive→医療）
- [ ] 職員情報更新Webhook（医療→VoiceDrive）

### 画面実装
- [x] 提出承認タブ
- [x] 議題一覧タブ
- [x] カレンダータブ
- [x] 委員会一覧タブ
- [x] フィルター機能
- [x] 検索機能
- [x] 統計サマリー表示
- [x] 権限レベル別アクセス制御

### テスト
- [ ] 提出リクエスト作成→承認フローテスト
- [ ] 提出リクエスト作成→却下フローテスト
- [ ] 議題フィルタリングテスト（全パターン）
- [ ] 議題検索テスト
- [ ] 会議スケジュール登録テスト
- [ ] 会議スケジュール月別フィルタテスト
- [ ] 委員会情報表示テスト
- [ ] Level 7アクセステスト（閲覧のみ）
- [ ] Level 8アクセステスト（承認・却下可能）
- [ ] Level 10アクセステスト（全機能）
- [ ] Level 6以下アクセス拒否テスト
- [ ] データ整合性チェックバッチテスト

---

## 🐛 既知の課題・制限事項

### 現在の制限
1. **部門フィルタリング未実装**
   - Level 8以上は全ての提出リクエストを承認・却下可能
   - 将来的に部門別に制限する可能性あり（DB構築後に検討）

2. **議事録管理が簡易的**
   - 現在は `CommitteeMeeting.meetingMinutes` に文字列として保存
   - 詳細な議事録管理（決定事項、アクションアイテム等）は将来拡張

3. **委員会メンバー情報のキャッシュ**
   - 医療システムからのWebhook連携が未実装
   - 現在はモックデータで動作

### 将来の拡張候補
1. 部門別アクセス制御
2. 詳細議事録管理（MeetingMinutesテーブル）
3. 議題の実施状況トラッキング強化
4. 委員会活動分析ダッシュボード
5. 議題の自動通知機能

---

## 📊 統計情報

### コード統計
| ファイル | 行数 | 主要機能 |
|---------|-----|---------|
| CommitteeManagementPage.tsx | 843 | メインページ（4タブ） |
| CommitteeSubmissionService.ts | 218 | 提出リクエスト管理 |
| ManagementCommitteeService.ts | 370 | 議題・委員会・会議管理 |
| committee.ts | 167 | 型定義 |
| proposalDocument.ts | 170 | 議題提案書型定義 |
| **合計** | **1,768行** | |

### データベース統計
| テーブル | フィールド数 | リレーション数 |
|---------|-----------|-------------|
| CommitteeSubmissionRequest | 9 | 3 (User x2, ProposalDocument) |
| ProposalDocument | 20+ | 2 (User x2) |
| ManagementCommitteeAgenda | 25+ | 1 (User) |
| CommitteeInfo | 10 | 3 (User, Member, Meeting) |
| CommitteeMember | 12 | 2 (User, CommitteeInfo) |
| CommitteeMeeting | 10 | 1 (CommitteeInfo) |

---

## 🔄 更新履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|-----|----------|---------|-------|
| 2025-10-22 | 1.0 | 初版作成 | VoiceDrive開発チーム |

---

## 📞 連絡先・レビュー

### 作成者
- **チーム**: VoiceDrive開発チーム
- **Slack**: #voicedrive-dev
- **メール**: voicedrive-dev@example.com

### レビュー依頼先
- **チーム**: 医療システム開発チーム
- **Slack**: #medical-system-integration
- **メール**: medical-system-dev@example.com

### 質問・フィードバック
- **MCP共有フォルダ**: `mcp-shared/docs/`
- **定例会議**: 毎週月曜 10:00-11:00
- **統合テスト**: 毎週金曜 15:00-17:00

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
ステータス: レビュー待ち
次回レビュー予定: 2025年10月29日
