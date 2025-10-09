# 決定会議ページ DB要件分析

**文書番号**: DM-DB-REQ-2025-1010-001
**作成日**: 2025年10月10日
**作成者**: VoiceDriveチーム
**目的**: 決定会議ページのDB要件を明確化し、医療システムとの責任分界を定義
**重要度**: 🔴 最重要
**関連文書**: データ管理責任分界点定義書_20251008.md

---

## 📋 エグゼクティブサマリー

### 背景
- 決定会議ページは**既に実装完了**（566行、デモデータ、権限制御Level 13）
- **院長・施設長専用**ページ（運営委員会からの議題を最終決定）
- 現在は**デモデータのみ**でDB未統合
- CommitteeManagement方式と同様のDB構築とAPI連携が必要

### 実装状況
- ✅ UI完全実装（[DecisionMeetingPage.tsx](src/pages/DecisionMeetingPage.tsx):566行）
- ✅ 型定義完備（[src/types/decisionMeeting.ts](src/types/decisionMeeting.ts):105行）
- ✅ サービス層実装（[src/services/DecisionMeetingService.ts](src/services/DecisionMeetingService.ts):377行）
- ❌ DB未構築（schema.prismaに決定会議関連テーブル無し）
- ❌ 医療システムAPI連携未実装

### DB構築方針
1. **VoiceDrive管轄データ**: 議題内容、ステータス、決定記録、議事録
2. **医療システム連携**: 職員情報（提案者、決定者、出席者）、部署マスタ
3. **データ管理責任**: データ管理責任分界点定義書に準拠
4. **委員会管理との関連**: ManagementCommitteeAgendaからの昇格フロー

---

## 🎯 ページ機能分析

### 対象URL
- **本番URL**: https://voicedrive-v100.vercel.app/decision-meeting
- **権限レベル**: Level 13（院長・施設長専用）
- **ソースファイル**: [src/pages/DecisionMeetingPage.tsx](src/pages/DecisionMeetingPage.tsx)

### ヘッダー統計サマリー

**表示項目**（5つのCard）:
1. **総議題数** (totalAgendas) - 全議題数、今月決定件数
2. **審議待ち** (pendingCount) - 審議待ち議題数、緊急議題数
3. **承認済み** (approvedCount) - 承認済み議題数、承認率
4. **却下** (rejectedCount) - 却下議題数、保留件数
5. **平均決定日数** (averageDecisionDays) - 提案から決定までの平均日数

**データソース**:
- ✅ VoiceDrive管轄: 全て集計値（DB集計またはキャッシュ）

---

### タブ機能

#### タブ1: 審議待ち（Pending）
- `status === 'pending'` の議題一覧
- 「審議を開始」ボタン → `status`を`in_review`に更新

#### タブ2: 審議中（In Review）
- `status === 'in_review'` の議題一覧
- 承認・却下・保留の3つのアクション可能

#### タブ3: 今月決定（This Month）
- 今月（`decidedDate`が当月）の議題一覧
- 承認・却下・保留の全てを含む

#### タブ4: 全議題（All）
- 全ての議題一覧
- 優先度順（urgent → high → normal → low）、日付順でソート

---

### 議題詳細モーダル

**表示項目**:
1. **概要**: title, description
2. **背景・経緯**: background
3. **提案元情報**: proposedBy, proposerDepartment, proposedDate, scheduledDate
4. **影響分析**: departments, estimatedCost, implementationPeriod, expectedEffect
5. **議事録**: attendees, discussion, concerns, conditions
6. **決定内容**: decidedBy, decidedDate, decisionNotes

**アクションボタン**（審議待ち・審議中のみ）:
- ✅ **承認** - `handleApprove()`: status → 'approved', decidedDate設定
- ⏸️ **保留** - `handleDefer()`: status → 'deferred', 保留理由入力
- ❌ **却下** - `handleReject()`: status → 'rejected', 却下理由入力

---

## 📊 データ管理責任マトリクス

### カテゴリ1: 決定会議議題（DecisionAgenda）

| データ項目 | VoiceDrive | 医療システム | 提供方法 | 備考 |
|-----------|-----------|-------------|---------|------|
| 議題ID（id） | ✅ マスタ | - | - | VoiceDrive発行 |
| タイトル・説明（title, description） | ✅ マスタ | - | - | VoiceDrive管轄 |
| 背景（background） | ✅ マスタ | - | - | VoiceDrive管轄 |
| 議題タイプ（type） | ✅ マスタ | - | - | VoiceDrive定義 |
| ステータス（status） | ✅ マスタ | - | - | VoiceDrive管理 |
| 優先度（priority） | ✅ マスタ | - | - | VoiceDrive判定 |
| 提案者（proposedBy） | キャッシュ | ✅ マスタ | API | 委員会名または職員名 |
| 提案者部署（proposerDepartment） | キャッシュ | ✅ マスタ | API | 部署マスタ参照 |
| 提案日（proposedDate） | ✅ マスタ | - | - | VoiceDrive管理 |
| 審議予定日（scheduledDate） | ✅ マスタ | - | - | VoiceDrive管理 |
| 決定者（decidedBy） | キャッシュ | ✅ マスタ | API | 院長名取得 |
| 決定日（decidedDate） | ✅ マスタ | - | - | VoiceDrive管理 |
| 決定理由（decisionNotes） | ✅ マスタ | - | - | VoiceDrive管理 |
| 影響部署（impact.departments） | キャッシュ | ✅ マスタ | API | 部署マスタ検証 |
| 予算影響（impact.estimatedCost） | ✅ マスタ | - | - | VoiceDrive入力 |
| 実施期間（impact.implementationPeriod） | ✅ マスタ | - | - | VoiceDrive入力 |
| 期待効果（impact.expectedEffect） | ✅ マスタ | - | - | VoiceDrive入力 |
| 出席者（meetingMinutes.attendees） | キャッシュ | ✅ マスタ | API | 職員名リスト |
| 議論内容（meetingMinutes.discussion） | ✅ マスタ | - | - | VoiceDrive管理 |
| 懸念事項（meetingMinutes.concerns） | ✅ マスタ | - | - | VoiceDrive管理 |
| 承認条件（meetingMinutes.conditions） | ✅ マスタ | - | - | VoiceDrive管理 |
| タグ（tags） | ✅ マスタ | - | - | VoiceDrive管理 |

**方針**:
- 議題の内容・ステータス・決定情報・議事録は**VoiceDriveが管轄**
- 職員情報（提案者、決定者、出席者）は**医療システムからAPI取得**してキャッシュ
- 部署情報は**医療システム部署マスタ**で検証

---

## 🏗️ 必要なDBテーブル設計

### テーブル1: DecisionMeetingAgenda（決定会議議題）

```prisma
model DecisionMeetingAgenda {
  id                      String    @id @default(cuid())

  // 基本情報
  title                   String
  type                    String    // 'committee_proposal' | 'facility_policy' | 'personnel' | 'budget' | 'equipment' | 'other'
  description             String
  background              String    // 背景・経緯

  // 提案元情報
  proposedBy              String    // 提案者（委員会名または職員名）（キャッシュ）
  proposedDate            DateTime
  proposerDepartment      String    // 提案者部署（キャッシュ）
  proposerId              String?   // User.id（提案者が個人の場合）

  // ステータス
  status                  String    @default("pending") // 'pending' | 'in_review' | 'approved' | 'rejected' | 'deferred'
  priority                String    @default("normal")  // 'urgent' | 'high' | 'normal' | 'low'

  // 審議情報
  scheduledDate           DateTime? // 審議予定日
  decidedDate             DateTime? // 決定日
  decidedBy               String?   // 決定者名（キャッシュ）
  deciderId               String?   // User.id
  decision                String?   // 'approved' | 'rejected' | 'deferred'
  decisionNotes           String?   // 決定理由・コメント

  // 影響分析
  impactDepartments       Json      // string[] - 影響を受ける部署
  impactEstimatedCost     Float?    // 予算影響
  impactImplementationPeriod String? // 実施期間
  impactExpectedEffect    String    // 期待される効果

  // 関連資料
  attachments             Json?     // Attachment[] - 関連資料

  // 議事録
  meetingAttendeesRaw     Json?     // string[] - 出席者名（キャッシュ）
  meetingAttendees        Json?     // string[] - 出席者employeeId
  meetingDiscussion       String?   // 議論内容
  meetingConcerns         Json?     // string[] - 懸念事項
  meetingConditions       Json?     // string[] - 承認条件

  // メタデータ
  tags                    Json?     // string[]
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  // リレーション
  proposerUser            User?     @relation("DecisionProposer", fields: [proposerId], references: [id])
  deciderUser             User?     @relation("DecisionDecider", fields: [deciderId], references: [id])

  // 委員会管理との連携（将来実装）
  relatedCommitteeAgendaId String?  // ManagementCommitteeAgenda.id（委員会議題からの昇格）
  relatedCommitteeAgenda   ManagementCommitteeAgenda? @relation("CommitteeToDecisionEscalation", fields: [relatedCommitteeAgendaId], references: [id])

  @@index([proposerId])
  @@index([deciderId])
  @@index([status])
  @@index([priority])
  @@index([type])
  @@index([proposedDate])
  @@index([decidedDate])
  @@index([relatedCommitteeAgendaId])
}
```

---

## 🔗 医療システムAPI連携要件

### API 1: 職員情報取得（既存API流用）

**エンドポイント**: `GET /api/employees/{employeeId}`

**用途**:
- 決定者（decidedBy）情報取得（院長名）
- 提案者（proposedBy）情報取得（委員会メンバー等）
- 出席者（meetingMinutes.attendees）情報取得

**レスポンス例**:
```json
{
  "employeeId": "OH-DR-2020-001",
  "name": "徳留 幸輝",
  "department": "院長室",
  "position": "院長",
  "permissionLevel": 25.0
}
```

---

### API 2: 部署マスタ取得（既存API流用）

**エンドポイント**: `GET /api/departments`

**用途**:
- 影響部署（impact.departments）検証
- 提案者部署（proposerDepartment）検証

**レスポンス例**:
```json
{
  "departments": [
    { "id": "medical_care_ward", "name": "内科", "facilityId": "obara-hospital" },
    { "id": "surgical_ward", "name": "外科", "facilityId": "obara-hospital" }
  ]
}
```

---

### API 3: 複数職員情報一括取得（既存API流用）

**エンドポイント**: `POST /api/employees/batch`

**用途**:
- 出席者リスト（meetingMinutes.attendees）の職員情報を一括取得

**リクエスト例**:
```json
{
  "employeeIds": ["OH-DR-2020-001", "OH-DR-2020-002", "OH-NS-2020-005"]
}
```

**レスポンス例**:
```json
{
  "employees": [
    { "employeeId": "OH-DR-2020-001", "name": "徳留 幸輝", "department": "院長室", "position": "院長" },
    { "employeeId": "OH-DR-2020-002", "name": "田中 次郎", "department": "副院長室", "position": "副院長" }
  ]
}
```

---

## 🚧 不足項目まとめ

### A. DBテーブル（schema.prisma）
1. ❌ `DecisionMeetingAgenda` - 決定会議議題

### B. Userモデルへの追加リレーション
```prisma
model User {
  // 既存フィールド...

  // 決定会議追加リレーション
  decisionProposals       DecisionMeetingAgenda[] @relation("DecisionProposer")
  decisionsDecided        DecisionMeetingAgenda[] @relation("DecisionDecider")
}
```

### C. ManagementCommitteeAgendaへの追加リレーション（将来実装）
```prisma
model ManagementCommitteeAgenda {
  // 既存フィールド...

  // 決定会議への昇格
  escalatedToDecision     DecisionMeetingAgenda[] @relation("CommitteeToDecisionEscalation")
}
```

### D. 医療システムAPI
- ✅ API-2（職員情報単体） - PersonalStation API流用
- ✅ API-CM-1（職員情報バッチ） - CommitteeManagement API流用
- ✅ API-8（部署マスタ） - DepartmentStation API流用

**追加API**: なし（全て既存API流用）

---

## 📅 実装ロードマップ

### Phase 1: DB構築（1日）

**Day 1**:
- [ ] schema.prisma更新（DecisionMeetingAgenda追加）
- [ ] Userモデルにリレーション追加
- [ ] ManagementCommitteeAgendaにリレーション追加（将来実装用）
- [ ] Prisma Migration実行（MySQL移行後）
- [ ] Prisma Client再生成

---

### Phase 2: サービス層DB版移行（1日）

**Day 2**:
- [ ] DecisionMeetingService.tsをDB版に変更
- [ ] デモデータ投入スクリプト作成
- [ ] 統合テスト（CRUD操作）

---

### Phase 3: API連携（0.5日）

**Day 3午前**:
- [ ] 既存API（PersonalStation, CommitteeManagement）を活用
- [ ] キャッシュ戦略実装（職員情報）
- [ ] 統合テスト（API連携）

---

### Phase 4: UI統合（0.5日）

**Day 3午後**:
- [ ] DecisionMeetingPage.tsxをDB版に接続
- [ ] リアルタイムデータ表示確認
- [ ] E2Eテスト

**合計**: 3日間

---

## ✅ 成功基準

### 機能要件
- [x] 4タブ全て動作（審議待ち、審議中、今月決定、全議題）
- [ ] 統計サマリー正確表示（総議題数、審議待ち、承認済み、却下、平均決定日数）
- [ ] 承認・却下・保留アクション動作
- [ ] 審議開始アクション動作
- [ ] 議題詳細モーダル表示

### 非機能要件
- [ ] ページ読み込み時間 < 2秒
- [ ] API応答時間 < 500ms
- [ ] データ整合性100%（医療システムと）

### データ管理
- [ ] VoiceDrive/医療システム責任分界明確
- [ ] 職員情報キャッシュ戦略確立
- [ ] 部署マスタ同期確認

---

## 🔗 委員会管理との連携（将来実装）

### 昇格フロー

```
ManagementCommitteeAgenda（運営委員会議題）
  status: 'approved' ← 委員会で承認
  decision: 'escalated_to_director' ← 院長決定が必要
    ↓
DecisionMeetingAgenda（決定会議議題）
  relatedCommitteeAgendaId: [委員会議題ID]
  proposedBy: '運営委員会'
  status: 'pending' ← 院長の審議待ち
```

**実装方針**:
- ManagementCommitteeAgendaに`escalationStatus`フィールド追加
- 委員会承認時に「院長決定が必要」フラグを設定
- DecisionMeetingAgenda作成時に`relatedCommitteeAgendaId`を設定
- 決定会議で承認・却下後、委員会議題にフィードバック

---

## 📞 医療チームへの質問事項

### 質問1: 決定会議の実施頻度

決定会議（院長による最終決定）は：

- 定例開催（月1回等）
- 議題が蓄積したら随時開催
- 緊急議題は即座に決定

どの方式を想定していますか？

---

### 質問2: 委員会議題との連携タイミング

委員会管理ページと決定会議ページの連携は：

- Phase 1（DB構築）時点で実装
- Phase 4（将来実装）として後回し
- 手動連携（委員会議題IDを手入力）

どの方式を推奨しますか？

---

### 質問3: 決定権限の範囲

Level 13（院長・施設長）専用ページですが：

- 院長のみが決定可能（Level 25）
- 副院長も決定可能（Level 20-24）
- 施設長も決定可能（Level 13+）

権限レベルの範囲を教えてください。

---

## 📚 関連文書

- [データ管理責任分界点定義書_20251008.md](mcp-shared/docs/データ管理責任分界点定義書_20251008.md)
- [DecisionMeetingPage.tsx](src/pages/DecisionMeetingPage.tsx)
- [src/types/decisionMeeting.ts](src/types/decisionMeeting.ts)
- [src/services/DecisionMeetingService.ts](src/services/DecisionMeetingService.ts)
- [CommitteeManagement_DB要件分析_20251009.md](mcp-shared/docs/CommitteeManagement_DB要件分析_20251009.md)

---

**文書終了**

最終更新: 2025年10月10日
バージョン: 1.0
承認: 未承認（レビュー待ち）
