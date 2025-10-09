# HRAnnouncements 暫定マスターリスト

**文書番号**: VD-MASTER-HRANNOUNCEMENTS-2025-1009-001
**作成日**: 2025年10月9日
**対象**: 医療職員管理システムチーム
**目的**: HRAnnouncements機能に必要なマスターデータおよびAPI要求の共有
**参照文書**: [HRAnnouncements_DB要件分析_20251009.md](./HRAnnouncements_DB要件分析_20251009.md)

---

## 📋 概要

VoiceDrive HRAnnouncementsページ（人事お知らせ配信）とHRManagementDashboard（人事統括ダッシュボード）の実装に必要なマスターデータとAPI要求をまとめました。

- 🔵 **医療システムAPI**: 10種類（お知らせ配信、人事統括指標）
- 🟢 **VoiceDrive側実装**: 5テーブル（キャッシュ、配信記録、既読、アクション、統計）
- 🔄 **双方向連携**: お知らせ配信（医療→VD）、統計送信（VD→医療）
- 🎯 **配信対象**: 全職員・部署・施設・役職・個人の5パターン

---

## 🎯 医療システムAPI要求一覧

### API-7: お知らせ配信API（新規）

**エンドポイント**: `POST https://voicedrive/api/v1/hr-announcements/receive`

**現状**: ❌ 未実装（医療システム側から送信）

**目的**: 人事部が作成したお知らせをVoiceDriveに配信

**リクエスト例**:
```json
{
  "medicalAnnouncementId": "HR-2025-1009-001",
  "title": "【アンケート】職場環境改善に関する意識調査のお願い",
  "content": "医療チームと人事部の連携により...",
  "category": "survey",
  "priority": "medium",
  "surveySubCategory": "workenv",
  "authorId": "hr_survey",
  "authorName": "アンケート管理チーム",
  "authorDepartment": "人事部 × 医療チーム",
  "publishAt": "2025-10-08T09:00:00Z",
  "expiresAt": "2025-01-31T23:59:59Z",
  "targetType": "global",
  "requireResponse": false,
  "responseType": "acknowledged",
  "actionButton": {
    "text": "📊 アンケートフォームへ",
    "url": "/survey/workplace-improvement",
    "type": "internal"
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "voicedriveAnnouncementId": "ann_12345",
    "status": "published",
    "publishedAt": "2025-10-08T09:00:00Z",
    "estimatedDelivery": 450
  }
}
```

**データソース**:
- 医療システム: `HRAnnouncement` テーブル（新規）
- VoiceDrive: `AnnouncementCache` テーブル（新規）

**優先度**: 🔴 HIGH
**納期希望**: Phase 9（2026年1月実装予定）

---

### API-8: 部署メンバー取得API（既存API流用想定）

**エンドポイント**: `GET /api/employees/department/{departmentId}`

**現状**: ⚠️ DepartmentStation API-3と同じ（流用可能性あり）

**目的**: 部署単位配信時に対象メンバーを取得

**レスポンス例**:
```json
{
  "department": {
    "departmentId": "medical_care_ward",
    "departmentName": "医療療養病棟",
    "memberCount": 12
  },
  "members": [
    {
      "employeeId": "OH-NS-2024-001",
      "name": "山田 太郎",
      "position": "主任",
      "status": "active"
    }
  ]
}
```

**データソース**:
- `Employee` テーブル
- `Department` テーブル

**優先度**: 🔴 HIGH（配信対象解決に必須）
**納期希望**: Phase 9

**確認事項**: DepartmentStation API-3を流用可能か？

---

### API-9: 施設メンバー取得API（新規）

**エンドポイント**: `GET /api/employees/facility/{facilityId}`

**現状**: ❌ 未実装

**目的**: 施設単位配信時に対象メンバーを取得

**レスポンス例**:
```json
{
  "facility": {
    "facilityId": "main_hospital",
    "facilityName": "本院",
    "memberCount": 230
  },
  "members": [
    {
      "employeeId": "OH-NS-2024-001",
      "name": "山田 太郎",
      "department": "内科",
      "position": "主任",
      "status": "active"
    }
  ]
}
```

**データソース**:
- `Employee` テーブル（`facilityId`フィールド）
- `Facility` テーブル

**優先度**: 🟡 MEDIUM
**納期希望**: Phase 9

---

### API-10: 役職メンバー取得API（新規）

**エンドポイント**: `GET /api/employees/position/{positionId}`

**現状**: ❌ 未実装

**目的**: 役職単位配信時に対象メンバーを取得（例: 全主任、全部長）

**レスポンス例**:
```json
{
  "position": {
    "positionId": "chief_nurse",
    "positionName": "主任",
    "memberCount": 45
  },
  "members": [
    {
      "employeeId": "OH-NS-2024-001",
      "name": "山田 太郎",
      "department": "内科",
      "facility": "本院",
      "status": "active"
    }
  ]
}
```

**データソース**:
- `Employee` テーブル（`position`フィールド）
- `Position` テーブル

**優先度**: 🟡 MEDIUM
**納期希望**: Phase 9

---

### API-11: 人事統括指標 - 従業員数API（新規）

**エンドポイント**: `GET /api/hr/metrics/employee-count`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardで総従業員数・新規採用数を表示

**レスポンス例**:
```json
{
  "totalEmployees": 1250,
  "newHires": {
    "thisMonth": 15,
    "ytd": 120
  },
  "byDepartment": {
    "医療部門": 450,
    "看護部門": 380,
    "管理部門": 220,
    "技術部門": 200
  },
  "byFacility": {
    "本院": 850,
    "分院": 400
  }
}
```

**データソース**:
- `Employee` テーブル

**優先度**: 🟢 LOW（HRManagementDashboard用）
**納期希望**: Phase 10以降（2026年2月〜）

---

### API-12: 人事統括指標 - 離職率API（新規）

**エンドポイント**: `GET /api/hr/metrics/turnover-rate`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardで離職率を表示

**レスポンス例**:
```json
{
  "overallRate": 8.5,
  "targetRate": 10.0,
  "byDepartment": {
    "医療部門": 6.2,
    "看護部門": 7.8,
    "管理部門": 9.5,
    "技術部門": 5.3
  },
  "trend": {
    "thisYear": 8.5,
    "lastYear": 9.2,
    "improvement": 0.7
  }
}
```

**データソース**:
- `Employee` テーブル（`terminationDate`フィールド）

**優先度**: 🟢 LOW
**納期希望**: Phase 10以降

---

### API-13: 人事統括指標 - 従業員満足度API（新規）

**エンドポイント**: `GET /api/hr/metrics/employee-satisfaction`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardで従業員満足度を表示

**レスポンス例**:
```json
{
  "overallScore": 82,
  "trend": {
    "thisQuarter": 82,
    "lastQuarter": 79,
    "improvement": 3
  },
  "byCategory": {
    "workEnvironment": 85,
    "compensation": 78,
    "careerDevelopment": 81,
    "workLifeBalance": 84
  }
}
```

**データソース**:
- `Survey` テーブル（従業員満足度調査）
- `SurveyResponse` テーブル

**優先度**: 🟢 LOW
**納期希望**: Phase 10以降

---

### API-14: 人事統括指標 - 研修完了統計API（新規）

**エンドポイント**: `GET /api/hr/metrics/training-stats`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardで研修完了数・予定数を表示

**レスポンス例**:
```json
{
  "totalCompleted": 2850,
  "totalScheduled": 420,
  "completionRate": 87.2,
  "byProgram": [
    {
      "programName": "リーダーシップ研修",
      "participants": 45,
      "completed": 35,
      "completionRate": 78,
      "satisfactionScore": 92
    },
    {
      "programName": "技術スキル向上",
      "participants": 120,
      "completed": 102,
      "completionRate": 85,
      "satisfactionScore": 88
    }
  ]
}
```

**データソース**:
- `TrainingProgram` テーブル
- `TrainingParticipant` テーブル
- `TrainingSurvey` テーブル

**優先度**: 🟢 LOW
**納期希望**: Phase 10以降

---

### API-15: 人事統括指標 - タレントパイプラインAPI（新規）

**エンドポイント**: `GET /api/hr/metrics/talent-pipeline`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardでタレントパイプラインを表示

**レスポンス例**:
```json
{
  "pipeline": [
    {
      "level": "エグゼクティブ",
      "current": 8,
      "candidates": 3,
      "readiness": 85
    },
    {
      "level": "シニアマネジメント",
      "current": 24,
      "candidates": 12,
      "readiness": 78
    },
    {
      "level": "ミドルマネジメント",
      "current": 86,
      "candidates": 45,
      "readiness": 82
    },
    {
      "level": "スペシャリスト",
      "current": 156,
      "candidates": 89,
      "readiness": 91
    }
  ]
}
```

**データソース**:
- `Employee` テーブル（`hierarchyLevel`フィールド）
- `SuccessionPlan` テーブル
- `V3Assessment` テーブル

**優先度**: 🟢 LOW
**納期希望**: Phase 10以降

---

### API-16: 人事統括指標 - 採用パイプラインAPI（新規）

**エンドポイント**: `GET /api/hr/metrics/recruitment-pipeline`

**現状**: ❌ 未実装

**目的**: HRManagementDashboardで採用パイプラインを表示

**レスポンス例**:
```json
{
  "positions": [
    {
      "position": "看護師",
      "openings": 12,
      "applications": 85,
      "interviews": 23,
      "offers": 5,
      "conversionRate": 5.9
    },
    {
      "position": "医師",
      "openings": 5,
      "applications": 32,
      "interviews": 12,
      "offers": 2,
      "conversionRate": 6.3
    }
  ]
}
```

**データソース**:
- `Recruitment` テーブル
- `RecruitmentApplication` テーブル

**優先度**: 🟢 LOW
**納期希望**: Phase 10以降

---

## 🔄 VoiceDrive → 医療システム（統計送信Webhook）

### Webhook-1: お知らせ統計送信（日次バッチ）

**エンドポイント**: `POST https://medical-system/api/v1/hr-announcements/{announcementId}/stats`

**実装**: 🟢 VoiceDrive側が送信

**送信頻度**: 日次（深夜2:00 JST）

**リクエスト例**:
```json
{
  "event": "stats.daily",
  "timestamp": "2025-10-09T02:00:00Z",
  "announcement": {
    "medicalAnnouncementId": "HR-2025-1009-001",
    "title": "【アンケート】職場環境改善に関する意識調査のお願い",
    "category": "survey",
    "priority": "medium"
  },
  "stats": {
    "totalDelivered": 450,
    "totalRead": 189,
    "totalActioned": 89,
    "totalCompleted": 67,
    "readRate": 42.0,
    "actionRate": 19.8,
    "completionRate": 14.9,
    "departmentStats": {
      "内科": {
        "delivered": 45,
        "read": 23,
        "actioned": 12,
        "completed": 8
      }
    },
    "facilityStats": {
      "本院": {
        "delivered": 230,
        "read": 112,
        "actioned": 56,
        "completed": 42
      }
    }
  }
}
```

**データソース**:
- VoiceDrive: `AnnouncementStats` テーブル

**優先度**: 🔴 HIGH
**納期希望**: Phase 9

---

### Webhook-2: アクション実行通知（即時）

**エンドポイント**: `POST https://medical-system/api/v1/hr-announcements/actions`

**実装**: 🟢 VoiceDrive側が送信

**送信頻度**: 即時（アクション実行時）

**リクエスト例**:
```json
{
  "event": "action.executed",
  "timestamp": "2025-10-09T10:15:30Z",
  "announcement": {
    "medicalAnnouncementId": "HR-2025-1009-001"
  },
  "action": {
    "actionId": "act_67890",
    "userId": "OH-NS-2024-001",
    "userName": "山田 太郎",
    "department": "内科",
    "actionType": "survey_response",
    "status": "completed"
  }
}
```

**データソース**:
- VoiceDrive: `AnnouncementAction` テーブル

**優先度**: 🟡 MEDIUM
**納期希望**: Phase 9

---

## 📊 マスターデータ提供依頼

### 既存マスターデータ（医療システム側で既に保持）

| マスター名 | 用途 | 提供形式 | 優先度 |
|----------|------|---------|-------|
| Department（部署） | 部署単位配信の対象選択 | API-8経由 | 🔴 HIGH |
| Facility（施設） | 施設単位配信の対象選択 | API-9経由 | 🟡 MEDIUM |
| Position（役職） | 役職単位配信の対象選択 | API-10経由 | 🟡 MEDIUM |
| Employee（職員） | 個人単位配信の対象選択 | 既存API-1経由 | ✅ 提供済み |

### 新規マスターデータ（医療システム側で新規作成が必要）

| マスター名 | 用途 | テーブル設計 | 優先度 |
|----------|------|------------|-------|
| **HRAnnouncement** | お知らせマスター | 下記参照 | 🔴 HIGH |

#### HRAnnouncementテーブル設計例（医療システム側）

```sql
CREATE TABLE HRAnnouncement (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  -- announcement, interview, training, survey, other
  priority VARCHAR(20) NOT NULL,  -- low, medium, high
  survey_sub_category VARCHAR(50), -- satisfaction, workenv, education, welfare, system, event, other

  author_id VARCHAR(50) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_department VARCHAR(100) NOT NULL,

  publish_at DATETIME NOT NULL,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,

  require_response BOOLEAN DEFAULT FALSE,
  response_type VARCHAR(50),      -- acknowledged, completed, custom
  response_text VARCHAR(255),

  target_type VARCHAR(50) NOT NULL, -- global, departments, facilities, individuals, positions
  target_departments JSON,
  target_facilities JSON,
  target_individuals JSON,
  target_positions JSON,

  has_action_button BOOLEAN DEFAULT FALSE,
  action_button_text VARCHAR(100),
  action_button_url VARCHAR(255),
  action_button_type VARCHAR(50),  -- internal, external, medical_system

  attachments JSON,

  created_by VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_publish_at (publish_at),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_target_type (target_type)
);
```

---

## ✅ 実装チェックリスト

### Phase 9: HRAnnouncements基本実装（2026年1月）

#### 医療システム側

- [ ] HRAnnouncement テーブル実装
- [ ] お知らせ作成管理画面実装
- [ ] API-7: お知らせ配信API実装
- [ ] API-8: 部署メンバー取得API確認（DepartmentStation API-3流用可能か？）
- [ ] API-9: 施設メンバー取得API実装
- [ ] API-10: 役職メンバー取得API実装
- [ ] Webhook-1受信: 統計受信エンドポイント実装
- [ ] Webhook-2受信: アクション通知受信エンドポイント実装

#### VoiceDrive側

- [ ] AnnouncementCache テーブル実装
- [ ] AnnouncementDelivery テーブル実装
- [ ] AnnouncementRead テーブル実装
- [ ] AnnouncementAction テーブル実装
- [ ] AnnouncementStats テーブル実装
- [ ] お知らせ受信API実装（API-7のエンドポイント提供）
- [ ] 配信対象解決ロジック実装（5パターン）
- [ ] Webhook-1送信: 日次統計送信バッチ実装
- [ ] Webhook-2送信: アクション通知送信実装
- [ ] HRAnnouncementsPage.tsx修正（モックデータ削除）

### Phase 10: HRManagementDashboard実装（2026年2月〜）

#### 医療システム側

- [ ] API-11: 従業員数API実装
- [ ] API-12: 離職率API実装
- [ ] API-13: 従業員満足度API実装
- [ ] API-14: 研修完了統計API実装
- [ ] API-15: タレントパイプラインAPI実装
- [ ] API-16: 採用パイプラインAPI実装

#### VoiceDrive側

- [ ] HRManagementDashboard.tsx修正（ダミーデータ削除）
- [ ] 6つの人事統括指標API呼び出し実装

---

## 📝 確認事項

### 医療システムチームへの質問

#### 優先度1: Phase 9実装前に確認必須

1. **お知らせ作成権限**
   - 人事部のどの役職がお知らせを作成できますか？
   - 承認フローは必要ですか？（例: 部長承認後に配信）

2. **配信対象の粒度**
   - 部署・施設・役職・個人以外に必要な配信対象はありますか？
   - 例: 勤続年数別、年齢層別、専門分野別など

3. **DepartmentStation API-3の流用**
   - API-8（部署メンバー取得）としてDepartmentStation API-3を流用可能ですか？
   - それとも新規実装が必要ですか？

4. **統計データの用途**
   - VoiceDriveから送信する統計データをどのように活用しますか？
   - 人事部のダッシュボードで表示？レポート作成？

5. **アクション通知の緊急度**
   - 面談予約、ストレスチェックなどのアクションは即時通知が必要ですか？
   - それとも日次バッチで問題ないですか？

#### 優先度2: Phase 10実装前に確認

6. **HRManagementDashboardの実装時期**
   - 人事統括指標API（6種類）の実装スケジュールは？
   - Phase 9と同時実装？それとも後回し？

7. **指標の計算ロジック**
   - 離職率、満足度、研修完了率などの計算ロジックに特別な要件はありますか？
   - 医療業界特有の指標がありますか？

---

## 📅 実装スケジュール提案

| Phase | 期間 | 実装内容 | 担当 |
|-------|------|---------|------|
| **Phase 9** | 2026年1月 | HRAnnouncements基本機能 | 両チーム |
|  | 1/6-1/12 | HRAnnouncementテーブル実装、お知らせ作成管理画面 | 医療システム |
|  | 1/13-1/19 | VoiceDrive DBテーブル実装（5テーブル） | VoiceDrive |
|  | 1/20-1/26 | API-7〜10実装、Webhook受信実装 | 医療システム |
|  | 1/27-2/2 | 配信対象解決ロジック、Webhook送信実装 | VoiceDrive |
|  | 2/3-2/9 | 統合テスト | 両チーム |
| **Phase 10** | 2026年2月〜 | HRManagementDashboard | 両チーム |
|  | 2/10-2/23 | 人事統括指標API実装（6種類） | 医療システム |
|  | 2/24-3/2 | HRManagementDashboard修正 | VoiceDrive |
|  | 3/3-3/9 | 統合テスト | 両チーム |

---

## 💰 コスト見積もり

### 医療システム側実装工数

| 項目 | 工数 | 備考 |
|------|------|------|
| HRAnnouncementテーブル実装 | 2日 | MySQL DDL、マイグレーション |
| お知らせ作成管理画面 | 5日 | 人事部専用UI |
| API-7〜10実装 | 8日 | 4 API × 2日 |
| Webhook受信実装 | 4日 | 2 Webhook × 2日 |
| 人事統括指標API実装 | 12日 | 6 API × 2日 |
| **合計** | **31日** | **約¥1,240,000**（＠¥40,000/日） |

### VoiceDrive側実装工数

| 項目 | 工数 | 備考 |
|------|------|------|
| DBテーブル実装 | 3日 | 5テーブル、Prisma Migration |
| お知らせ受信API実装 | 2日 |  |
| 配信対象解決ロジック | 5日 | 5パターン実装 |
| Webhook送信実装 | 3日 | 2 Webhook実装 |
| HRAnnouncementsPage修正 | 3日 | モックデータ削除、API連携 |
| HRManagementDashboard修正 | 2日 | ダミーデータ削除、API連携 |
| **合計** | **18日** | **約¥720,000**（＠¥40,000/日） |

### 総合計

**49日（約¥1,960,000）**

---

**文書終了**

最終更新: 2025年10月9日
次回更新予定: 医療システムチームからの回答受領後
