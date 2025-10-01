# Webhook受信エンドポイント実装ガイド

## 概要
医療システムから審査結果を受信するWebhookエンドポイントの実装ガイドです。

ViteアプリケーションではAPI Routesがないため、バックエンドサーバー（Express等）が必要です。

## エンドポイント仕様

### URL
```
POST /api/career-course/notify
```

### リクエストヘッダー
```http
Authorization: Bearer <MEDICAL_SYSTEM_API_KEY>
X-Medical-System-Version: 1.0
Content-Type: application/json
```

### リクエストボディ

#### 承認時
```json
{
  "type": "course_change_approved",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-003",
  "approvedCourse": "A",
  "effectiveDate": "2026-04-01",
  "reviewComment": "管理職候補として適性を認めます。"
}
```

#### 却下時
```json
{
  "type": "course_change_rejected",
  "staffId": "OH-NS-2021-001",
  "requestId": "req-003",
  "rejectionReason": "現在の勤務状況から、来年度の変更が望ましいと判断しました。",
  "reviewComment": "再度、2027年4月での変更申請をご検討ください。"
}
```

### レスポンス (200 OK)
```json
{
  "success": true,
  "notificationSent": true
}
```

## Express実装例

```typescript
// server/api/career-course/notify.ts
import express from 'express';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

router.post('/notify', async (req, res) => {
  try {
    // 認証確認
    const authHeader = req.headers.authorization;
    const apiKey = process.env.MEDICAL_SYSTEM_API_KEY;

    if (authHeader !== `Bearer ${apiKey}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, staffId, requestId, approvedCourse, rejectionReason, reviewComment } = req.body;

    // 通知送信
    const notificationService = NotificationService.getInstance();

    if (type === 'course_change_approved') {
      await notificationService.sendNotification({
        staffId,
        title: 'コース変更申請が承認されました',
        body: `${approvedCourse}コースへの変更が承認されました。`,
        link: '/career-selection-station/my-requests',
        priority: 'high',
      });
    } else if (type === 'course_change_rejected') {
      await notificationService.sendNotification({
        staffId,
        title: 'コース変更申請が却下されました',
        body: `理由: ${rejectionReason}`,
        link: '/career-selection-station/my-requests',
        priority: 'normal',
      });
    }

    res.status(200).json({
      success: true,
      notificationSent: true,
    });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
```

## 環境変数

`.env`ファイルに以下を追加：

```env
# 医療システムからのWebhook認証用APIキー
MEDICAL_SYSTEM_API_KEY=vd_prod_key_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5
```

## テスト方法

### curlでのテスト
```bash
curl -X POST http://localhost:3001/api/career-course/notify \
  -H "Authorization: Bearer vd_prod_key_A8B9C2D3E4F5G6H7I8J9K0L1M2N3O4P5" \
  -H "X-Medical-System-Version: 1.0" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course_change_approved",
    "staffId": "OH-NS-2021-001",
    "requestId": "req-003",
    "approvedCourse": "A",
    "effectiveDate": "2026-04-01",
    "reviewComment": "承認します"
  }'
```

## 通知サービス統合

既存の`NotificationService`と統合する必要があります：

```typescript
// src/services/NotificationService.ts に追加

public async sendCareerCourseNotification(params: {
  staffId: string;
  type: 'approved' | 'rejected';
  requestId: string;
  course?: string;
  reason?: string;
}): Promise<void> {
  const { staffId, type, requestId, course, reason } = params;

  const notification = {
    id: `career-${Date.now()}`,
    title: type === 'approved'
      ? 'コース変更申請が承認されました'
      : 'コース変更申請が却下されました',
    message: type === 'approved'
      ? `${course}コースへの変更が承認されました。`
      : `理由: ${reason}`,
    type: type === 'approved' ? 'success' : 'warning',
    link: '/career-selection-station/my-requests',
    createdAt: new Date().toISOString(),
    read: false,
  };

  // データベースまたはlocalStorageに保存
  await this.saveNotification(staffId, notification);

  // プッシュ通知送信（オプション）
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png',
    });
  }
}
```

## 注意事項

1. **セキュリティ**
   - API Keyは必ず環境変数で管理
   - 本番環境では強力なキーに変更
   - HTTPSを使用（開発環境以外）

2. **エラーハンドリング**
   - 認証エラー: 401 Unauthorized
   - バリデーションエラー: 400 Bad Request
   - サーバーエラー: 500 Internal Server Error

3. **ログ記録**
   - すべてのWebhook受信をログに記録
   - エラー時は詳細をログ出力

4. **リトライ対応**
   - 医療システム側がリトライする可能性があるため、冪等性を保証
   - 同じrequestIdの重複通知は無視

## 今後の実装タスク

- [ ] Expressサーバーのセットアップ
- [ ] Webhook受信エンドポイントの実装
- [ ] NotificationServiceとの統合
- [ ] 通知UI（通知センター）への表示
- [ ] Webhookのログ記録機能
- [ ] テスト実装（単体テスト、統合テスト）

## 参考資料

- [医療システムAPI仕様書](../../../docs/Phase5_API仕様書_VoiceDrive連携.md)
- [NotificationService](../services/NotificationService.ts)
