# EvaluationNotificationPage 暫定マスターリスト

**文書番号**: VD-MASTER-2025-1013-004
**作成日**: 2025年10月13日
**対象ページ**: EvaluationNotificationPage
**目的**: 評価通知システムに必要なマスターデータを定義

---

## 📋 目次

1. [通知ステータスマスター](#通知ステータスマスター)
2. [異議申立ステータスマスター](#異議申立ステータスマスター)
3. [評価グレードマスター](#評価グレードマスター)
4. [通知テンプレートマスター](#通知テンプレートマスター)
5. [通知優先度マスター](#通知優先度マスター)
6. [配信方法マスター](#配信方法マスター)

---

## 1. 通知ステータスマスター

### マスター名: `NotificationStatusMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 通知の配信状況管理、ステータス遷移制御

### マスターデータ

| ID | statusCode | statusName | 説明 | フロー順 | 表示色 |
|----|-----------|-----------|------|---------|--------|
| 1 | pending | 処理待ち | Webhook受信直後、送信前 | 1 | 🟡 黄色 |
| 2 | sent | 送信済み | メール/プッシュ送信完了 | 2 | 🔵 青色 |
| 3 | delivered | 配信完了 | 職員のデバイスに配信 | 3 | 🟢 緑色 |
| 4 | read | 既読 | 職員が通知を閲覧 | 4 | ⚫ グレー |
| 5 | failed | 送信失敗 | 配信エラー | 5 | 🔴 赤色 |

### ステータス遷移図

```
pending (処理待ち)
  ├─→ sent (送信済み)
  │     ├─→ delivered (配信完了)
  │     │     └─→ read (既読)
  │     └─→ failed (送信失敗)
  └─→ failed (送信失敗)
```

### TypeScript型定義

```typescript
export type NotificationStatus =
  | 'pending'    // 処理待ち
  | 'sent'       // 送信済み
  | 'delivered'  // 配信完了
  | 'read'       // 既読
  | 'failed';    // 送信失敗
```

### 表示ラベル定義

```typescript
const notificationStatusLabels: Record<NotificationStatus, string> = {
  pending: '処理待ち',
  sent: '送信済み',
  delivered: '配信完了',
  read: '既読',
  failed: '送信失敗'
};

const notificationStatusColors: Record<NotificationStatus, string> = {
  pending: '#FFC107',  // 黄色
  sent: '#2196F3',     // 青色
  delivered: '#4CAF50', // 緑色
  read: '#9E9E9E',     // グレー
  failed: '#F44336'    // 赤色
};
```

---

## 2. 異議申立ステータスマスター

### マスター名: `AppealStatusMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 評価通知からの異議申立状況の追跡

### マスターデータ

| ID | statusCode | statusName | 説明 | 表示順 | 表示色 |
|----|-----------|-----------|------|-------|--------|
| 1 | none | 未申立 | 異議申立なし | 1 | ⚫ グレー |
| 2 | submitted | 申立済み | 異議申立提出完了 | 2 | 🔵 青色 |
| 3 | in_review | 審査中 | 人財統括本部が審査中 | 3 | 🟡 黄色 |
| 4 | resolved | 解決済み | 回答完了 | 4 | 🟢 緑色 |

### TypeScript型定義

```typescript
export type AppealStatus =
  | 'none'       // 未申立
  | 'submitted'  // 申立済み
  | 'in_review'  // 審査中
  | 'resolved';  // 解決済み
```

### 表示ラベル定義

```typescript
const appealStatusLabels: Record<AppealStatus, string> = {
  none: '未申立',
  submitted: '申立済み',
  in_review: '審査中',
  resolved: '解決済み'
};

const appealStatusColors: Record<AppealStatus, string> = {
  none: '#9E9E9E',   // グレー
  submitted: '#2196F3', // 青色
  in_review: '#FFC107', // 黄色
  resolved: '#4CAF50'  // 緑色
};
```

---

## 3. 評価グレードマスター

### マスター名: `EvaluationGradeMaster`

**データソース**: VoiceDrive独自管理（コード定義、医療システムと同期）

**用途**: 評価グレードの表示、色分け、スコア範囲の定義

### 3.1 総合評価グレード（7段階）

| ID | gradeCode | gradeName | スコア範囲 | 色 | 説明 |
|----|----------|----------|-----------|----|----|
| 1 | S | S | 95-100 | 🟣 紫色 | 極めて優秀 |
| 2 | A+ | A+ | 90-94 | 🔴 赤色 | 非常に優秀 |
| 3 | A | A | 80-89 | 🟠 オレンジ | 優秀 |
| 4 | B+ | B+ | 70-79 | 🟡 黄色 | 良好 |
| 5 | B | B | 60-69 | 🟢 緑色 | 標準 |
| 6 | C | C | 50-59 | 🔵 青色 | 要改善 |
| 7 | D | D | 0-49 | ⚫ グレー | 大幅改善必要 |

### 3.2 施設内/法人内評価グレード（5段階）

| ID | gradeCode | gradeName | 相対評価 | 色 |
|----|----------|----------|---------|---|
| 1 | S | S | 上位5% | 🟣 紫色 |
| 2 | A | A | 上位20% | 🔴 赤色 |
| 3 | B | B | 上位50% | 🟡 黄色 |
| 4 | C | C | 上位80% | 🟢 緑色 |
| 5 | D | D | 下位20% | 🔵 青色 |

### TypeScript型定義

```typescript
// 総合評価グレード（7段階）
export type OverallGrade = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

// 施設内・法人内評価グレード（5段階）
export type RelativeGrade = 'S' | 'A' | 'B' | 'C' | 'D';

// グレード表示設定
export interface GradeDisplayConfig {
  grade: string;
  color: string;
  description: string;
  scoreRange?: {
    min: number;
    max: number;
  };
  relativePosition?: string;
}
```

### グレード表示設定

```typescript
// 総合評価グレード設定
const overallGradeConfig: Record<OverallGrade, GradeDisplayConfig> = {
  S: {
    grade: 'S',
    color: '#9C27B0',  // 紫色
    description: '極めて優秀',
    scoreRange: { min: 95, max: 100 }
  },
  'A+': {
    grade: 'A+',
    color: '#F44336',  // 赤色
    description: '非常に優秀',
    scoreRange: { min: 90, max: 94 }
  },
  A: {
    grade: 'A',
    color: '#FF9800',  // オレンジ
    description: '優秀',
    scoreRange: { min: 80, max: 89 }
  },
  'B+': {
    grade: 'B+',
    color: '#FFC107',  // 黄色
    description: '良好',
    scoreRange: { min: 70, max: 79 }
  },
  B: {
    grade: 'B',
    color: '#4CAF50',  // 緑色
    description: '標準',
    scoreRange: { min: 60, max: 69 }
  },
  C: {
    grade: 'C',
    color: '#2196F3',  // 青色
    description: '要改善',
    scoreRange: { min: 50, max: 59 }
  },
  D: {
    grade: 'D',
    color: '#9E9E9E',  // グレー
    description: '大幅改善必要',
    scoreRange: { min: 0, max: 49 }
  }
};

// 相対評価グレード設定
const relativeGradeConfig: Record<RelativeGrade, GradeDisplayConfig> = {
  S: {
    grade: 'S',
    color: '#9C27B0',
    description: '極めて優秀',
    relativePosition: '上位5%'
  },
  A: {
    grade: 'A',
    color: '#F44336',
    description: '優秀',
    relativePosition: '上位20%'
  },
  B: {
    grade: 'B',
    color: '#FFC107',
    description: '良好',
    relativePosition: '上位50%'
  },
  C: {
    grade: 'C',
    color: '#4CAF50',
    description: '標準',
    relativePosition: '上位80%'
  },
  D: {
    grade: 'D',
    color: '#2196F3',
    description: '要改善',
    relativePosition: '下位20%'
  }
};
```

---

## 4. 通知テンプレートマスター

### マスター名: `NotificationTemplateMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 通知メッセージの自動生成、多言語対応

### マスターデータ

| ID | templateType | templateName | 優先度 | チャネル |
|----|-------------|-------------|--------|---------|
| 1 | evaluation_disclosure | 評価結果開示 | high | email, push, sms |
| 2 | appeal_deadline_reminder | 締切リマインダー | medium | email, push |
| 3 | appeal_submitted_confirmation | 異議申立受理 | medium | email, push |
| 4 | appeal_response_available | 異議申立回答 | high | email, push, sms |

### テンプレート定義

#### テンプレート1: 評価結果開示

```typescript
{
  type: 'evaluation_disclosure',
  title: '評価結果開示のお知らせ',
  emailSubject: '【VoiceDrive】{period} 評価結果開示のお知らせ',
  emailBody: `
{employeeName} 様

{period}の評価結果が開示されました。

【評価結果】
総合スコア: {overallScore}点
総合グレード: {overallGrade}
施設内評価: {facilityGrade}
法人内評価: {corporateGrade}

【異議申立期限】
{appealDeadline}

評価結果の詳細確認や異議申立は、VoiceDriveアプリからお願いします。

▼ VoiceDriveで確認する
{actionUrl}

---
本メールは自動送信されています。
VoiceDrive - 医療職員管理システム連携
  `,
  pushTitle: '評価結果開示',
  pushBody: '{period}の評価結果が開示されました（スコア: {overallScore}点）',
  smsBody: '{period}評価結果が開示されました。VoiceDriveアプリでご確認ください。',
  actionText: 'VoiceDriveで確認する',
  actionUrl: '/evaluation/notifications/{notificationId}',
  priority: 'high'
}
```

#### テンプレート2: 締切リマインダー

```typescript
{
  type: 'appeal_deadline_reminder',
  title: '異議申立期限のリマインダー',
  emailSubject: '【VoiceDrive】{period} 異議申立期限が近づいています',
  emailBody: `
{employeeName} 様

{period}の評価に対する異議申立期限が{days}日後に迫っています。

【評価結果】
総合スコア: {overallScore}点
総合グレード: {overallGrade}

【異議申立期限】
{appealDeadline}

必要に応じて、VoiceDriveアプリから異議申立をお願いします。

▼ 異議申立を行う
{actionUrl}

---
本メールは自動送信されています。
VoiceDrive - 医療職員管理システム連携
  `,
  pushTitle: '異議申立期限リマインダー',
  pushBody: '{period}の異議申立期限が{days}日後です',
  actionText: '異議申立を行う',
  actionUrl: '/appeals/new?notificationId={notificationId}',
  priority: 'medium'
}
```

#### テンプレート3: 異議申立受理

```typescript
{
  type: 'appeal_submitted_confirmation',
  title: '異議申立受理のお知らせ',
  emailSubject: '【VoiceDrive】{period} 異議申立を受理しました',
  emailBody: `
{employeeName} 様

{period}の評価に対する異議申立を受理しました。

【申立情報】
申立ID: {appealId}
提出日時: {submittedAt}

担当者による確認後、回答いたします。
回答完了まで1～2週間程度かかる場合があります。

▼ 申立状況を確認する
{actionUrl}

---
本メールは自動送信されています。
VoiceDrive - 医療職員管理システム連携
  `,
  pushTitle: '異議申立受理',
  pushBody: '{period}の異議申立を受理しました（申立ID: {appealId}）',
  actionText: '申立状況を確認する',
  actionUrl: '/appeals/{appealId}',
  priority: 'medium'
}
```

#### テンプレート4: 異議申立回答

```typescript
{
  type: 'appeal_response_available',
  title: '異議申立回答のお知らせ',
  emailSubject: '【VoiceDrive】{period} 異議申立の回答が完了しました',
  emailBody: `
{employeeName} 様

{period}の評価異議申立に対する回答が完了しました。

【申立情報】
申立ID: {appealId}
回答日時: {respondedAt}

VoiceDriveアプリで回答内容をご確認ください。

▼ 回答を確認する
{actionUrl}

---
本メールは自動送信されています。
VoiceDrive - 医療職員管理システム連携
  `,
  pushTitle: '異議申立回答',
  pushBody: '{period}の異議申立回答が完了しました',
  smsBody: '{period}異議申立の回答が完了しました。VoiceDriveアプリでご確認ください。',
  actionText: '回答を確認する',
  actionUrl: '/appeals/{appealId}',
  priority: 'high'
}
```

### TypeScript型定義

```typescript
export enum NotificationTemplateType {
  EVALUATION_DISCLOSURE = 'evaluation_disclosure',
  APPEAL_DEADLINE_REMINDER = 'appeal_deadline_reminder',
  APPEAL_SUBMITTED_CONFIRMATION = 'appeal_submitted_confirmation',
  APPEAL_RESPONSE_AVAILABLE = 'appeal_response_available'
}

export interface NotificationTemplate {
  type: NotificationTemplateType;
  title: string;
  emailSubject: string;
  emailBody: string;
  pushTitle: string;
  pushBody: string;
  smsBody?: string;
  actionText: string;
  actionUrl: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
```

---

## 5. 通知優先度マスター

### マスター名: `NotificationPriorityMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 通知の優先度管理、送信順序制御

### マスターデータ

| ID | priorityCode | priorityName | レベル | 配信遅延 | 再試行回数 |
|----|-------------|-------------|--------|---------|----------|
| 1 | low | 低 | 1 | 最大6時間 | 1回 |
| 2 | medium | 中 | 2 | 最大1時間 | 2回 |
| 3 | high | 高 | 3 | 最大15分 | 3回 |
| 4 | urgent | 緊急 | 4 | 即座 | 5回 |

### TypeScript型定義

```typescript
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityConfig {
  priority: NotificationPriority;
  level: number;
  maxDelay: number;        // 秒
  maxRetries: number;
  description: string;
}

const priorityConfig: Record<NotificationPriority, PriorityConfig> = {
  low: {
    priority: 'low',
    level: 1,
    maxDelay: 21600,     // 6時間
    maxRetries: 1,
    description: '低優先度（統計情報等）'
  },
  medium: {
    priority: 'medium',
    level: 2,
    maxDelay: 3600,      // 1時間
    maxRetries: 2,
    description: '中優先度（リマインダー等）'
  },
  high: {
    priority: 'high',
    level: 3,
    maxDelay: 900,       // 15分
    maxRetries: 3,
    description: '高優先度（評価開示等）'
  },
  urgent: {
    priority: 'urgent',
    level: 4,
    maxDelay: 0,         // 即座
    maxRetries: 5,
    description: '緊急（異議申立回答等）'
  }
};
```

---

## 6. 配信方法マスター

### マスター名: `DeliveryMethodMaster`

**データソース**: VoiceDrive独自管理（コード定義）

**用途**: 通知配信チャネルの管理、配信制御

### マスターデータ

| ID | methodCode | methodName | 配信速度 | コスト | デフォルト |
|----|-----------|-----------|---------|-------|----------|
| 1 | email | メール | 中速 | 低 | ✅ ON |
| 2 | push | プッシュ通知 | 高速 | 無料 | ✅ ON |
| 3 | sms | SMS | 高速 | 高 | ❌ OFF |
| 4 | in_app | アプリ内通知 | 即座 | 無料 | ✅ ON |

### 配信方法の特性

| 配信方法 | 到達率 | 既読率 | リアルタイム性 | 適用場面 |
|---------|--------|--------|-------------|---------|
| メール | 95% | 60% | 中 | 詳細情報、公式記録 |
| プッシュ通知 | 85% | 80% | 高 | 緊急通知、リマインダー |
| SMS | 99% | 90% | 高 | 極めて重要な通知 |
| アプリ内通知 | 100% | 70% | 即座 | 補助的な通知 |

### TypeScript型定義

```typescript
export type DeliveryMethod = 'email' | 'push' | 'sms' | 'in_app';

interface DeliveryMethodConfig {
  method: DeliveryMethod;
  name: string;
  speed: 'instant' | 'fast' | 'medium' | 'slow';
  cost: 'free' | 'low' | 'medium' | 'high';
  defaultEnabled: boolean;
  maxMessageLength?: number;
}

const deliveryMethodConfig: Record<DeliveryMethod, DeliveryMethodConfig> = {
  email: {
    method: 'email',
    name: 'メール',
    speed: 'medium',
    cost: 'low',
    defaultEnabled: true,
    maxMessageLength: 10000
  },
  push: {
    method: 'push',
    name: 'プッシュ通知',
    speed: 'fast',
    cost: 'free',
    defaultEnabled: true,
    maxMessageLength: 200
  },
  sms: {
    method: 'sms',
    name: 'SMS',
    speed: 'fast',
    cost: 'high',
    defaultEnabled: false,
    maxMessageLength: 160
  },
  in_app: {
    method: 'in_app',
    name: 'アプリ内通知',
    speed: 'instant',
    cost: 'free',
    defaultEnabled: true,
    maxMessageLength: 500
  }
};

// 配信方法の組み合わせ
interface DeliveryMethods {
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app?: boolean;
}
```

---

## 📊 マスターデータ管理方針

### コード定義マスター（JSON/TypeScript）

以下のマスターはコード内で定義し、バージョン管理：

- ✅ 通知ステータスマスター
- ✅ 異議申立ステータスマスター
- ✅ 評価グレードマスター
- ✅ 通知テンプレートマスター
- ✅ 通知優先度マスター
- ✅ 配信方法マスター

**理由**:
- 変更頻度が低い
- システム全体に影響する
- コードレビュー・デプロイプロセスで管理

### DBテーブルマスター

以下のマスターはDBテーブルで管理し、管理画面から編集可能：

- ✅ 通知設定（NotificationSettings） - 職員ごと
- ✅ 評価通知（EvaluationNotification） - 通知ごと

**理由**:
- 変更頻度が高い
- 職員が個別に設定変更
- リアルタイムに反映する必要がある

---

## 🔄 データ同期

### 医療システムとの同期が必要なマスター

| マスター | 同期方向 | 同期方法 | 頻度 |
|---------|---------|---------|------|
| 評価グレードマスター | 医療システム → VoiceDrive | Webhook | 更新時 |
| 評価期間マスター | 医療システム → VoiceDrive | API | 日次 |

**評価通知関連マスターは同期不要**（VoiceDrive独自管理）

---

## 📝 初期データ投入SQL

### 通知設定（デフォルト値）

```sql
-- 全ユーザーにデフォルト通知設定を作成
INSERT INTO notification_settings (
  id, user_id, enable_email_notifications, enable_push_notifications,
  enable_sms_notifications, reminder_days_before, auto_mark_as_read,
  notification_start_time, notification_end_time, max_notifications_per_day,
  created_at, updated_at
)
SELECT
  CONCAT('notif_settings_', id),
  id,
  true,   -- メール通知ON
  true,   -- プッシュ通知ON
  false,  -- SMS通知OFF
  3,      -- 締切3日前にリマインダー
  false,  -- 自動既読OFF
  '09:00',
  '18:00',
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users
WHERE id NOT IN (SELECT user_id FROM notification_settings);
```

---

## 🧪 マスターデータ検証

### 検証項目

1. ✅ 通知ステータスマスターの網羅性
   - 5種類のステータスが定義されているか
   - ステータス遷移が明確か

2. ✅ 異議申立ステータスマスターの十分性
   - 4種類のステータスが定義されているか
   - 異議申立フローと整合しているか

3. ✅ 評価グレードマスターの正確性
   - 7段階（総合）と5段階（相対）が定義されているか
   - スコア範囲が重複していないか

4. ✅ 通知テンプレートマスターの完全性
   - 4種類のテンプレートが定義されているか
   - 必要なプレースホルダーが含まれているか

5. ✅ 配信方法マスターの妥当性
   - 4種類の配信方法が定義されているか
   - コスト・速度の設定が適切か

---

## 📞 連絡先

**VoiceDriveチーム**
- Slack: #voicedrive-integration
- 担当: システム開発チーム

**医療システムチーム**
- Slack: #medical-system-integration
- 担当: システム開発チーム

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
次回レビュー: Phase 1開始時
