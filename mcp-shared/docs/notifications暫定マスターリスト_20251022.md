# notifications 暫定マスターリスト

**文書番号**: MASTER-NF-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: `/notifications` (NotificationsPage)
**URL**: https://voicedrive-v100.vercel.app/notifications
**権限レベル**: 全職員（Level 1以上）

---

## 📋 ページ概要

### 基本情報
| 項目 | 内容 |
|-----|------|
| ページ名 | 通知センターページ |
| ルート | `/notifications` |
| コンポーネント | `src/pages/NotificationsPage.tsx` |
| 主要サービス | `NotificationService` |
| 必要権限 | Level 1以上（全職員） |
| レイアウト | サイドバー付きレイアウト |

### 機能概要
医療施設職員向けの統合通知センター。人事お知らせ、面談・予約、評価、議題・提案、研修、シフト、プロジェクト、システム通知など、職員に関わる全ての通知を一元管理する。

### 主要な9つの通知カテゴリー
1. **人事お知らせ** (`hr_announcement`) - 人事異動、賞与、労務関連の重要なお知らせ
2. **面談・予約** (`interview`) - 面談予約、日程変更、確定通知
3. **評価** (`evaluation`) - 評価期間、フィードバック、評価結果
4. **議題・提案** (`proposal`) - 投稿の進捗、委員会決定、採用通知
5. **研修・教育** (`training`) - 研修案内、受講期限、修了証明
6. **シフト・勤務** (`shift`) - シフト公開、変更、調整依頼
7. **プロジェクト** (`project`) - プロジェクト進捗、タスク、マイルストーン
8. **システム** (`system`) - メンテナンス、機能追加、障害情報
9. **調査** (`survey`) - アンケート依頼、回答期限（現状未実装）

---

## 🔴 重要：現在の実装状態

### ⚠️ 現状の問題点
- **モックデータを使用**: NotificationsPage.tsxは**ハードコードされたモックデータ**で動作中
- **DB接続なし**: データベーステーブルは全て実装済みだが、**APIが未実装**のため接続されていない
- **リアルタイム更新なし**: 医療システムからのWebhook通知が未実装

### ✅ 実装済み
- データベーステーブル（全て実装済み）
- フロントエンド画面（モックデータで動作中）
- NotificationService（通知送信・音響アラート・ブラウザ通知）

### ❌ 未実装（優先実装事項）
- GET /api/notifications API（通知一覧取得）
- PUT /api/notifications/{id}/read API（既読マーク）
- POST /api/webhooks/notification-received（医療システムからのWebhook）
- DB ↔ 画面の連携ロジック

---

## 🎯 権限レベル別機能

| 権限レベル | 役職例 | 利用可能機能 |
|-----------|-------|------------|
| Level 1-3 | 一般職員 | 通知閲覧、既読マーク、カテゴリーフィルター |
| Level 4-6 | 主任・リーダー | 上記 + 部下への通知送信 |
| Level 7-9 | 課長・看護師長 | 上記 + 部門全体への通知送信 |
| Level 10+ | 施設長・管理職 | 上記 + 全職員への通知送信、通知統計閲覧 |
| Level 99 | システム管理者 | 全機能 + システム通知送信 |

---

## 📊 データベーステーブル構成

### 主要テーブル一覧

| # | テーブル名 | 用途 | ステータス | データ管理責任 |
|---|----------|------|----------|-------------|
| 1 | Notification | 通知マスタ | ✅ 実装済み | 混在（VoiceDrive + 医療システム） |
| 2 | NotificationRecipient | 通知受信者・既読管理 | ✅ 実装済み | VoiceDrive |
| 3 | NotificationAction | 通知アクション履歴 | ✅ 実装済み | VoiceDrive |
| 4 | NotificationSettings | 職員別通知設定 | ✅ 実装済み | VoiceDrive |
| 5 | EvaluationNotification | 評価通知（専用） | ✅ 実装済み | 医療システム |
| 6 | User | 職員情報（キャッシュ） | ✅ 実装済み | 医療システム（VoiceDriveはキャッシュ） |

---

## 📁 ファイル構成

### コンポーネント
```
src/pages/NotificationsPage.tsx               # メインページ (366行)
```

### サービス
```
src/services/NotificationService.ts           # 通知管理サービス (890行)
src/services/AppBadgeService.ts               # アプリバッジ管理
src/services/WebSocketNotificationService.ts  # WebSocket通知（Phase 4実装）
```

### 型定義
```
src/types/notification.ts                     # 通知関連型定義
src/types/medicalSystemIntegration.ts         # 医療システム統合型定義
```

---

## 🔄 データフロー

### フロー1: VoiceDrive内部通知（議題進捗など）

```
[VoiceDriveシステム]
    ↓ イベント発生（例: 議題が100点到達）
[NotificationService]
    ↓ 通知生成
[Notification] テーブル
    ↓ INSERT
[NotificationRecipient] テーブル
    ↓ INSERT（対象職員分）
[WebSocket通知]
    ↓ リアルタイム配信
[ブラウザ通知 + 音響アラート]
    ↓
[NotificationsPage]
    ↓ GET /api/notifications
[通知一覧表示]
```

### フロー2: 医療システムからの通知（人事・評価など）

```
[医療システム]
    ↓ イベント発生（例: 評価期間開始）
[POST /api/webhooks/notification-received]
    ↓ Webhook受信
[VoiceDrive API Server]
    ↓ 通知データ変換
[Notification] テーブル
    ↓ INSERT
[NotificationRecipient] テーブル
    ↓ INSERT（対象職員分）
[WebSocket通知]
    ↓ リアルタイム配信
[ブラウザ通知 + 音響アラート]
    ↓
[NotificationsPage]
    ↓ GET /api/notifications
[通知一覧表示]
```

### フロー3: 既読マークフロー

```
[職員]
    ↓ 通知クリック
[NotificationsPage]
    ↓ markAsRead(notificationId)
[PUT /api/notifications/{id}/read]
    ↓
[NotificationRecipient]
    ↓ isRead = true, readAt = NOW()
[AppBadgeService]
    ↓ バッジ数更新
[画面更新]
```

---

## 🗂️ カテゴリー別詳細仕様

### カテゴリー1: 人事お知らせ (`hr_announcement`)

#### 送信元
- 医療システム（人事システム）
- 経営管理部門

#### 通知例
- 賞与支給日のお知らせ
- 人事異動の発令
- 就業規則の変更
- 勤務制度の改定

#### 優先度
- `critical`: 緊急の人事情報（即日対応必要）
- `high`: 重要なお知らせ（1週間以内に確認）
- `medium`: 通常のお知らせ
- `low`: 参考情報

#### データソース
| フィールド | データ元 |
|----------|---------|
| 通知内容 | 医療システム（人事データベース） |
| 対象職員 | 医療システム（職員マスタ） |
| 発信者 | 医療システム（人事部門） |

---

### カテゴリー2: 面談・予約 (`interview`)

#### 送信元
- VoiceDriveシステム（面談予約システム）
- 医療システム（面談管理システム）

#### 通知例
- 面談予約確定のお知らせ
- 面談日程の提案
- 面談日時変更の通知
- 面談キャンセルの通知
- 面談サマリ完成のお知らせ

#### 優先度
- `high`: 予約確定、日時変更
- `medium`: サマリ完成、リマインダー

#### データソース
| フィールド | データ元 |
|----------|---------|
| 面談情報 | VoiceDrive（BookingRequest, InterviewResult） |
| 職員情報 | 医療システム（職員マスタ） |

---

### カテゴリー3: 評価 (`evaluation`)

#### 送信元
- 医療システム（人事評価システム）

#### 通知例
- 評価期間開始のお知らせ
- 上司からのフィードバック
- 評価結果の確定通知
- 自己評価入力期限のリマインダー

#### 優先度
- `high`: 評価期間開始、フィードバック受信
- `medium`: リマインダー

#### データソース
| フィールド | データ元 |
|----------|---------|
| 評価情報 | 医療システム（評価データベース） |
| 評価者情報 | 医療システム（職員マスタ） |

---

### カテゴリー4: 議題・提案 (`proposal`)

#### 送信元
- VoiceDriveシステム（議題管理システム）

#### 通知例
- 議題が正式採用されました
- 投稿が100点に到達しました（施設議題化）
- 委員会で承認されました
- 期限到達提案の判断が必要です

#### 優先度
- `high`: 議題採用、委員会決定、期限到達判断
- `medium`: スコア到達、進捗更新

#### データソース
| フィールド | データ元 |
|----------|---------|
| 投稿情報 | VoiceDrive（Post, VoteScore） |
| 委員会情報 | VoiceDrive（ManagementCommitteeAgenda） |
| 期限到達情報 | VoiceDrive（ExpiredEscalation） |

---

### カテゴリー5: 研修・教育 (`training`)

#### 送信元
- 医療システム（研修管理システム）

#### 通知例
- 必須研修のリマインダー
- 研修受講期限のお知らせ
- 研修修了証明書発行
- 新しい研修コースの案内

#### 優先度
- `high`: 必須研修期限、受講期限
- `medium`: 新規コース案内

#### データソース
| フィールド | データ元 |
|----------|---------|
| 研修情報 | 医療システム（研修データベース） |
| 受講状況 | 医療システム（研修管理システム） |

---

### カテゴリー6: シフト・勤務 (`shift`)

#### 送信元
- 医療システム（勤怠管理システム）

#### 通知例
- シフト表公開のお知らせ
- シフト変更の通知
- シフト調整依頼
- 勤務時間変更の連絡

#### 優先度
- `high`: 緊急シフト変更、調整依頼
- `medium`: シフト公開、通常変更

#### データソース
| フィールド | データ元 |
|----------|---------|
| シフト情報 | 医療システム（勤怠データベース） |
| 職員情報 | 医療システム（職員マスタ） |

---

### カテゴリー7: プロジェクト (`project`)

#### 送信元
- VoiceDriveシステム（プロジェクト管理機能）
- 医療システム（プロジェクト管理システム）

#### 通知例
- プロジェクト参加の招待
- タスクの割り当て
- マイルストーン達成
- プロジェクト完了

#### 優先度
- `high`: タスク割り当て、期限間近
- `medium`: 進捗更新、マイルストーン

#### データソース
| フィールド | データ元 |
|----------|---------|
| プロジェクト情報 | VoiceDrive（Project） |
| タスク情報 | VoiceDrive（Task） |

---

### カテゴリー8: システム (`system`)

#### 送信元
- VoiceDriveシステム
- 医療システム（システム管理）

#### 通知例
- システムメンテナンスのお知らせ
- 新機能追加の案内
- システム障害の通知
- バージョンアップのお知らせ

#### 優先度
- `critical`: 緊急メンテナンス、障害
- `medium`: 定期メンテナンス
- `low`: 新機能案内

#### データソース
| フィールド | データ元 |
|----------|---------|
| システム情報 | VoiceDrive（システム管理） |
| メンテナンス情報 | 医療システム（運用管理） |

---

### カテゴリー9: 調査 (`survey`)

#### 送信元
- VoiceDriveシステム（アンケート機能）
- 医療システム（調査システム）

#### 通知例
- 職員満足度調査の依頼
- アンケート回答期限のリマインダー
- 調査結果の共有

#### 優先度
- `high`: 必須回答アンケート
- `medium`: 任意回答アンケート

#### データソース
| フィールド | データ元 |
|----------|---------|
| アンケート情報 | VoiceDrive（Survey） |
| 回答状況 | VoiceDrive（SurveyResponse） |

---

## 📺 画面レイアウト

### メインビュー
```
┌─────────────────────────────────────────┐
│ 🔔 通知センター                          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [📋全て 4] [📅面談 1] [📢人事 0]        │
│ [💡議題 1] [⚙️システム 0] [🎓研修 1]   │
│ [⏰シフト 0] [🚀プロジェクト 0] [📊評価 1] │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📅 面談・予約                            │
│ 5分前                                   │
│ 🔵 面談予約確定のお知らせ                │
│ 1月25日（土）14:00からの面談予約が       │
│ 確定しました                            │
│ ⚠️ 重要な通知です                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📊 評価                                 │
│ 30分前                                  │
│ 🔵 評価期間開始のお知らせ                │
│ 2025年第1四半期の評価が開始されました。  │
│ 期限は2月15日までです                   │
│ ⚠️ 重要な通知です                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 💡 議題・提案                            │
│ 2時間前                                 │
│ 🔵 議題が正式採用されました              │
│ あなたの提案「業務改善システム導入」が   │
│ 経営会議で採択され、正式議題として進行... │
│ ⚠️ 重要な通知です                       │
└─────────────────────────────────────────┘
```

### 通知詳細（クリック時）
```
┌─────────────────────────────────────────┐
│ 📅 面談・予約            [既読にする ×]  │
├─────────────────────────────────────────┤
│ 🔵 面談予約確定のお知らせ                │
│                                         │
│ 受信日時: 2025年1月20日 14:55           │
│ 優先度: 高 ⚠️                           │
│                                         │
│ 1月25日（土）14:00からの面談予約が       │
│ 確定しました。                          │
│                                         │
│ 面談者: 山田太郎                        │
│ 場所: 本館3F 面談室A                    │
│ 種別: 定期面談                          │
│                                         │
│ [詳細を見る] [カレンダーに追加]         │
└─────────────────────────────────────────┘
```

---

## 🔌 API仕様

### VoiceDrive提供API（フロントエンド向け）

#### 1. 通知一覧取得
```http
GET /api/notifications
Authorization: Bearer {jwt_token}

Query Parameters:
  - category: hr_announcement | interview | evaluation | proposal | training | shift | project | system | survey
  - isRead: boolean (optional)
  - priority: critical | high | medium | low (optional)
  - limit: number (default: 50)
  - offset: number (default: 0)

Response 200:
{
  "notifications": [
    {
      "id": "notif-001",
      "category": "interview",
      "subcategory": null,
      "priority": "high",
      "title": "面談予約確定のお知らせ",
      "content": "1月25日（土）14:00からの面談予約が確定しました",
      "target": "individual",
      "senderId": "user-123",
      "senderName": "人事部",
      "createdAt": "2025-01-20T14:55:00Z",
      "isRead": false,
      "readAt": null,
      "actionRequired": false,
      "actionUrl": "/interview/bookings/booking-001",
      "expiresAt": null
    }
  ],
  "pagination": {
    "total": 47,
    "limit": 50,
    "offset": 0
  },
  "stats": {
    "unread": 4,
    "total": 47,
    "byCategory": {
      "hr_announcement": 8,
      "interview": 12,
      "evaluation": 5,
      "proposal": 15,
      "training": 3,
      "shift": 2,
      "project": 1,
      "system": 1
    }
  }
}
```

#### 2. 通知を既読にする
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {jwt_token}

Response 200:
{
  "success": true,
  "notificationId": "notif-001",
  "readAt": "2025-01-20T15:00:00Z"
}
```

#### 3. 全ての通知を既読にする
```http
PUT /api/notifications/read-all
Authorization: Bearer {jwt_token}

Query Parameters:
  - category: string (optional) - 特定カテゴリーのみ既読にする

Response 200:
{
  "success": true,
  "markedCount": 4
}
```

---

### 医療システム提供API（VoiceDrive向け - Webhook）

#### 1. 通知受信Webhook
```http
POST {voicedrive_url}/api/webhooks/notification-received
Content-Type: application/json
X-Medical-System-Signature: sha256=...

Body:
{
  "eventType": "notification.created",
  "timestamp": "2025-01-20T14:55:00Z",
  "data": {
    "notificationType": "hr_announcement",
    "category": "hr_announcement",
    "subcategory": "bonus",
    "priority": "high",
    "title": "賞与支給日のお知らせ",
    "content": "冬季賞与は12月10日に支給予定です",
    "targetType": "all_employees",
    "targetIds": [],
    "senderId": "hr-dept-001",
    "senderName": "人事部",
    "actionRequired": false,
    "actionUrl": null,
    "expiresAt": null,
    "metadata": {
      "bonusType": "winter",
      "fiscalYear": "2025"
    }
  }
}

Response 200:
{
  "success": true,
  "notificationId": "notif-001",
  "recipientCount": 145
}
```

---

### VoiceDrive提供API（医療システム向け）

#### 1. 通知統計取得
```http
GET /api/notifications/stats
Authorization: Bearer {jwt_token}

Query Parameters:
  - startDate: ISO 8601 date (optional)
  - endDate: ISO 8601 date (optional)
  - category: string (optional)

Response 200:
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "totalNotifications": 1245,
  "totalRecipients": 12450,
  "unreadCount": 487,
  "readRate": 60.9,
  "byCategory": {
    "hr_announcement": { "sent": 245, "read": 189, "readRate": 77.1 },
    "interview": { "sent": 389, "read": 312, "readRate": 80.2 },
    "evaluation": { "sent": 156, "read": 98, "readRate": 62.8 },
    "proposal": { "sent": 287, "read": 201, "readRate": 70.0 },
    "training": { "sent": 98, "read": 67, "readRate": 68.4 },
    "shift": { "sent": 45, "read": 32, "readRate": 71.1 },
    "project": { "sent": 12, "read": 8, "readRate": 66.7 },
    "system": { "sent": 13, "read": 11, "readRate": 84.6 }
  },
  "byPriority": {
    "critical": { "sent": 45, "read": 42, "readRate": 93.3 },
    "high": { "sent": 389, "read": 298, "readRate": 76.6 },
    "medium": { "sent": 678, "read": 401, "readRate": 59.1 },
    "low": { "sent": 133, "read": 46, "readRate": 34.6 }
  }
}
```

---

## 🔒 セキュリティ・権限管理

### アクセス制御マトリクス

| 機能 | Level 1-3 | Level 4-6 | Level 7-9 | Level 10+ |
|-----|----------|----------|----------|----------|
| 通知閲覧（自分宛） | ✅ | ✅ | ✅ | ✅ |
| 通知既読マーク | ✅ | ✅ | ✅ | ✅ |
| カテゴリーフィルター | ✅ | ✅ | ✅ | ✅ |
| 部下への通知送信 | ❌ | ✅ | ✅ | ✅ |
| 部門全体への通知送信 | ❌ | ❌ | ✅ | ✅ |
| 全職員への通知送信 | ❌ | ❌ | ❌ | ✅ |
| 通知統計閲覧 | ❌ | ❌ | ❌ | ✅ |
| システム通知送信 | ❌ | ❌ | ❌ | Level 99のみ |

### データ可視性ルール

```typescript
// 通知の可視性
function canViewNotification(user: User, notification: Notification): boolean {
  // 自分宛の通知は必ず見える
  if (notification.recipientIds.includes(user.id)) {
    return true;
  }

  // 全職員宛の通知は誰でも見える
  if (notification.target === 'all_employees') {
    return true;
  }

  // 部門宛の通知は同じ部門の職員が見える
  if (notification.target === 'department' &&
      notification.targetDepartment === user.department) {
    return true;
  }

  return false;
}

// 通知送信権限
function canSendNotification(user: User, targetType: string): boolean {
  if (targetType === 'all_employees') {
    return user.permissionLevel >= 10;
  }
  if (targetType === 'department') {
    return user.permissionLevel >= 7;
  }
  if (targetType === 'individual') {
    return user.permissionLevel >= 4;
  }
  return false;
}
```

---

## 📝 データ整合性チェック

### 日次バッチチェック項目

#### 1. 受信者数の整合性
```sql
-- Notification.recipientCount が実際の受信者数と一致するか
SELECT
  n.id,
  n.title,
  n.recipientCount as recorded_count,
  COUNT(nr.id) as actual_count
FROM Notification n
LEFT JOIN NotificationRecipient nr ON nr.notificationId = n.id
GROUP BY n.id
HAVING recorded_count != actual_count;
```

#### 2. 期限切れ通知の削除
```sql
-- 期限切れの通知を削除（保持期間: 90日）
DELETE FROM Notification
WHERE expiresAt IS NOT NULL
  AND expiresAt < NOW()
  AND createdAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

#### 3. 既読率の統計更新
```sql
-- 通知カテゴリー別の既読率を計算
SELECT
  n.category,
  COUNT(DISTINCT n.id) as total_notifications,
  COUNT(DISTINCT nr.id) as total_recipients,
  COUNT(DISTINCT CASE WHEN nr.isRead THEN nr.id END) as read_recipients,
  ROUND(COUNT(DISTINCT CASE WHEN nr.isRead THEN nr.id END) * 100.0 / COUNT(DISTINCT nr.id), 2) as read_rate
FROM Notification n
LEFT JOIN NotificationRecipient nr ON nr.notificationId = n.id
WHERE n.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY n.category;
```

---

## ✅ 実装チェックリスト

### データベース
- [x] Notification テーブル
- [x] NotificationRecipient テーブル
- [x] NotificationAction テーブル
- [x] NotificationSettings テーブル
- [x] EvaluationNotification テーブル
- [x] User テーブル（医療システムからキャッシュ）

### API実装
- [ ] GET /api/notifications（通知一覧取得）
- [ ] PUT /api/notifications/{id}/read（既読マーク）
- [ ] PUT /api/notifications/read-all（全既読）
- [ ] POST /api/webhooks/notification-received（医療システムからのWebhook）
- [ ] GET /api/notifications/stats（統計取得）

### 画面実装
- [x] 通知一覧表示（現在はモックデータ）
- [x] カテゴリーフィルター
- [x] 既読・未読マーク
- [x] 優先度バッジ表示
- [x] 時間表示（相対時間）
- [x] 通知クリック時のナビゲーション
- [ ] DB連携（API接続）

### 通知機能
- [x] ブラウザ通知（NotificationService）
- [x] 音響アラート（NotificationService）
- [x] アプリバッジ（AppBadgeService）
- [ ] メール通知（未実装）
- [ ] WebSocket通知（Phase 4実装予定）

### テスト
- [ ] 通知一覧取得APIテスト
- [ ] 既読マークAPIテスト
- [ ] Webhook受信テスト
- [ ] カテゴリーフィルターテスト（全9カテゴリー）
- [ ] 優先度フィルターテスト
- [ ] 既読・未読フィルターテスト
- [ ] ページネーションテスト
- [ ] ブラウザ通知許可フローテスト
- [ ] 音響アラート再生テスト
- [ ] バッジ数更新テスト
- [ ] Level別アクセス制御テスト
- [ ] データ整合性チェックバッチテスト

---

## 🐛 既知の課題・制限事項

### 現在の制限
1. **モックデータで動作中**
   - NotificationsPage.tsxは現在ハードコードされたモックデータで動作
   - API未実装のためDB接続なし
   - **優先実装事項**: API実装とDB連携

2. **リアルタイム更新なし**
   - 医療システムからのWebhook未実装
   - 手動リロードが必要
   - WebSocket通知はPhase 4で実装予定

3. **メール通知未実装**
   - NotificationServiceにメール通知コードは存在
   - 実際の医療システムメールAPI連携が未実装

4. **通知設定機能未実装**
   - NotificationSettingsテーブルは存在
   - カテゴリー別通知ON/OFF機能が未実装

### 将来の拡張候補
1. 通知設定画面（カテゴリー別ON/OFF）
2. 通知検索機能（キーワード検索）
3. 通知のアーカイブ機能
4. 通知テンプレート管理
5. 通知送信履歴管理
6. プッシュ通知（モバイルアプリ）

---

## 📊 統計情報

### コード統計
| ファイル | 行数 | 主要機能 |
|---------|-----|---------|
| NotificationsPage.tsx | 366 | メインページ（カテゴリーフィルター、通知一覧） |
| NotificationService.ts | 890 | 通知管理（送信、音響、ブラウザ通知） |
| AppBadgeService.ts | ~200 | アプリバッジ管理 |
| notification.ts | ~100 | 型定義 |
| **合計** | **~1,556行** | |

### データベース統計
| テーブル | フィールド数 | リレーション数 |
|---------|-----------|-------------|
| Notification | 16 | 2 (User, NotificationRecipient) |
| NotificationRecipient | 6 | 2 (Notification, User) |
| NotificationAction | 7 | 2 (Notification, User) |
| NotificationSettings | 10 | 1 (User) |
| EvaluationNotification | 12 | 2 (User x2) |

### 通知カテゴリー統計（想定）
| カテゴリー | 月間送信数（想定） | 既読率目標 |
|----------|--------------|----------|
| hr_announcement | 200-300 | 85% |
| interview | 300-500 | 90% |
| evaluation | 150-200 | 95% |
| proposal | 250-400 | 80% |
| training | 100-150 | 70% |
| shift | 50-100 | 95% |
| project | 20-50 | 75% |
| system | 10-20 | 90% |
| survey | 30-50 | 60% |

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

## 🚀 優先実装ロードマップ

### Phase 1: API実装（最優先）
1. GET /api/notifications 実装
2. PUT /api/notifications/{id}/read 実装
3. NotificationsPage.tsx のDB連携
4. モックデータの削除

### Phase 2: Webhook統合
1. POST /api/webhooks/notification-received 実装
2. 医療システムとの連携テスト
3. リアルタイム通知配信

### Phase 3: 機能拡張
1. 通知設定画面実装
2. 通知検索機能
3. 通知統計ダッシュボード

### Phase 4: WebSocket統合
1. WebSocketNotificationService統合
2. リアルタイム更新機能
3. プッシュ通知対応

---

**文書終了**

最終更新: 2025年10月22日
バージョン: 1.0
ステータス: レビュー待ち
次回レビュー予定: 2025年10月29日
