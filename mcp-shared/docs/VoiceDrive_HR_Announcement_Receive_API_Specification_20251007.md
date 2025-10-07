# VoiceDrive 人事お知らせ受信API仕様書

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム ご担当者様**
**Version：1.0.0**

---

## 1. 概要

職員カルテシステムからVoiceDriveへ、人事お知らせを送信するためのAPI仕様です。

### 1.1 送信タイミング

- **即時公開**：お知らせ作成後すぐに配信
- **予約公開**：指定日時に自動配信
- **下書き保存**：公開前の一時保存

### 1.2 配信内容

- ✅ お知らせ本文（タイトル・内容）
- ✅ カテゴリ・優先度
- ✅ 配信対象（全職員・部門別・個人別）
- ✅ アクションボタン設定
- ❌ 双方向メッセージ機能（不要）

---

## 2. APIエンドポイント仕様

### 2.1 エンドポイント

```
POST https://api.voicedrive.example.com/api/hr-announcements
```

### 2.2 認証

```http
Authorization: Bearer {API_TOKEN}
Content-Type: application/json
X-Source-System: medical-staff-system
```

**認証方式**：
- Bearer Token認証
- システム識別ヘッダー（`X-Source-System`）

---

## 3. リクエストフォーマット

### 3.1 基本構造

```typescript
interface HRAnnouncementRequest {
  // お知らせ基本情報
  title: string;                    // タイトル（最大500文字）
  content: string;                  // 本文（最大5000文字）
  category: 'announcement' | 'interview' | 'training' | 'survey' | 'other';
  priority: 'low' | 'medium' | 'high';

  // 配信対象
  targetType: 'all' | 'departments' | 'individuals' | 'positions';
  targetDepartments?: string[];     // 部門別配信（例: ["看護部", "医局"]）
  targetIndividuals?: string[];     // 個人別配信（例: ["staff_001", "staff_002"]）
  targetPositions?: string[];       // 役職別配信（例: ["主任", "師長"]）

  // アクションボタン設定
  hasActionButton: boolean;
  actionButton?: {
    type: 'interview_reservation' | 'survey_response' | 'training_apply' | 'health_check' | 'custom';
    label: string;                  // ボタンラベル（例: "面談を予約する"）
    url?: string;                   // カスタムURL（type='custom'の場合）
    config?: {
      // アンケートの場合
      surveyId?: string;
      // 面談予約の場合
      interviewTypeId?: string;
      // 研修申込の場合
      trainingId?: string;
    };
  };

  // VoiceDrive側の設定
  requireResponse: boolean;         // 固定: false（双方向メッセージ不要）
  autoTrackResponse: boolean;       // 固定: true（自動応答記録）

  // 公開設定
  scheduledPublishAt?: string;      // 予約公開日時（ISO 8601形式）
  expiresAt?: string;               // 有効期限（ISO 8601形式）

  // メタデータ
  metadata: {
    sourceSystem: 'medical-staff-system';
    sourceAnnouncementId: string;   // 職員カルテシステム側のID
    createdBy: string;              // 作成者ID
    createdAt: string;              // 作成日時（ISO 8601形式）
  };
}
```

### 3.2 具体例

#### 例1：全職員向けアンケート

```json
{
  "title": "【アンケート】職場環境改善に関する意識調査のお願い",
  "content": "職員の皆様へ\n\n働きやすい職場環境を目指し、定期的な意識調査を実施しております。\n5分程度で回答できますので、ぜひご協力をお願いいたします。\n\n回答期限：10月15日（月）まで\n\n人事部",
  "category": "survey",
  "priority": "medium",
  "targetType": "all",
  "hasActionButton": true,
  "actionButton": {
    "type": "survey_response",
    "label": "アンケートに回答する",
    "config": {
      "surveyId": "survey_20251007_001"
    }
  },
  "requireResponse": false,
  "autoTrackResponse": true,
  "expiresAt": "2025-10-15T23:59:59.000Z",
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "sourceAnnouncementId": "ann_20251007_001",
    "createdBy": "hr_admin_001",
    "createdAt": "2025-10-07T09:00:00.000Z"
  }
}
```

#### 例2：特定部門向け面談案内

```json
{
  "title": "【医療チーム連携】ストレスチェック結果に基づく面談のご案内",
  "content": "先日実施したストレスチェックの結果に基づき、産業医との面談をご案内いたします。\n\nご自身の健康管理のため、ぜひご活用ください。\n\n【面談可能日時】\n・10月10日（木） 14:00-17:00\n・10月12日（土） 10:00-12:00\n\n産業保健室",
  "category": "interview",
  "priority": "high",
  "targetType": "departments",
  "targetDepartments": ["看護部", "医局"],
  "hasActionButton": true,
  "actionButton": {
    "type": "interview_reservation",
    "label": "面談を予約する",
    "config": {
      "interviewTypeId": "stress_check_followup"
    }
  },
  "requireResponse": false,
  "autoTrackResponse": true,
  "scheduledPublishAt": "2025-10-07T08:00:00.000Z",
  "expiresAt": "2025-10-12T23:59:59.000Z",
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "sourceAnnouncementId": "ann_20251007_002",
    "createdBy": "hr_admin_002",
    "createdAt": "2025-10-07T07:00:00.000Z"
  }
}
```

#### 例3：個人向け評価通知

```json
{
  "title": "【人事評価】評価結果が確定しました",
  "content": "田中様\n\n2024年度下期の人事評価結果が確定しました。\n\n評価結果の詳細は、面談にてご説明させていただきます。\n\n人事部",
  "category": "announcement",
  "priority": "high",
  "targetType": "individuals",
  "targetIndividuals": ["staff_tanaka_001"],
  "hasActionButton": true,
  "actionButton": {
    "type": "interview_reservation",
    "label": "評価面談を予約する",
    "config": {
      "interviewTypeId": "performance_review"
    }
  },
  "requireResponse": false,
  "autoTrackResponse": true,
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "sourceAnnouncementId": "ann_20251007_003",
    "createdBy": "hr_admin_001",
    "createdAt": "2025-10-07T10:00:00.000Z"
  }
}
```

#### 例4：カスタムURLアクション

```json
{
  "title": "【研修】医療安全研修の受講について",
  "content": "全職員を対象とした医療安全研修（eラーニング）の受講期間が始まりました。\n\n受講期限：10月31日（木）まで\n\n教育研修部",
  "category": "training",
  "priority": "medium",
  "targetType": "all",
  "hasActionButton": true,
  "actionButton": {
    "type": "custom",
    "label": "研修ページを開く",
    "url": "https://elearning.hospital.example.com/course/medical-safety-2025"
  },
  "requireResponse": false,
  "autoTrackResponse": true,
  "expiresAt": "2025-10-31T23:59:59.000Z",
  "metadata": {
    "sourceSystem": "medical-staff-system",
    "sourceAnnouncementId": "ann_20251007_004",
    "createdBy": "training_admin_001",
    "createdAt": "2025-10-07T09:30:00.000Z"
  }
}
```

---

## 4. レスポンスフォーマット

### 4.1 成功レスポンス（201 Created）

```json
{
  "success": true,
  "data": {
    "voicedriveAnnouncementId": "vd_ann_20251007_12345",
    "status": "published",
    "publishedAt": "2025-10-07T10:00:00.000Z",
    "estimatedDelivery": 450,
    "targetedUsers": [
      {
        "department": "看護部",
        "count": 280
      },
      {
        "department": "医局",
        "count": 120
      },
      {
        "department": "事務部",
        "count": 50
      }
    ]
  },
  "message": "お知らせを正常に作成しました"
}
```

### 4.2 エラーレスポンス

#### 認証エラー（401 Unauthorized）

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証トークンが無効です"
  }
}
```

#### バリデーションエラー（400 Bad Request）

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "リクエストボディが不正です",
    "details": [
      {
        "field": "title",
        "message": "タイトルは必須です"
      },
      {
        "field": "content",
        "message": "本文は5000文字以内で入力してください"
      }
    ]
  }
}
```

#### サーバーエラー（500 Internal Server Error）

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "サーバー内部エラーが発生しました"
  }
}
```

---

## 5. バリデーションルール

### 5.1 必須フィールド

| フィールド | 必須 | 備考 |
|-----------|------|------|
| title | ✅ | 最大500文字 |
| content | ✅ | 最大5000文字 |
| category | ✅ | 指定値のみ |
| priority | ✅ | 指定値のみ |
| targetType | ✅ | 指定値のみ |
| requireResponse | ✅ | 固定: false |
| autoTrackResponse | ✅ | 固定: true |
| metadata.sourceSystem | ✅ | 固定: 'medical-staff-system' |
| metadata.sourceAnnouncementId | ✅ | - |

### 5.2 条件付き必須フィールド

| フィールド | 条件 |
|-----------|------|
| targetDepartments | targetType='departments' の場合必須 |
| targetIndividuals | targetType='individuals' の場合必須 |
| targetPositions | targetType='positions' の場合必須 |
| actionButton | hasActionButton=true の場合必須 |

### 5.3 列挙型の値

```typescript
// カテゴリ
type Category = 'announcement' | 'interview' | 'training' | 'survey' | 'other';

// 優先度
type Priority = 'low' | 'medium' | 'high';

// 配信対象タイプ
type TargetType = 'all' | 'departments' | 'individuals' | 'positions';

// アクションボタンタイプ
type ActionButtonType =
  | 'interview_reservation'  // 面談予約
  | 'survey_response'        // アンケート回答
  | 'training_apply'         // 研修申込
  | 'health_check'           // 健康診断予約
  | 'custom';                // カスタムURL
```

---

## 6. アクションボタン設定詳細

### 6.1 面談予約（interview_reservation）

```json
{
  "hasActionButton": true,
  "actionButton": {
    "type": "interview_reservation",
    "label": "面談を予約する",
    "config": {
      "interviewTypeId": "performance_review" // 職員カルテシステムの面談タイプID
    }
  }
}
```

**VoiceDrive側の動作**：
1. ボタンクリック時、面談予約フォームを表示
2. 職員カルテシステムの`interviewTypeId`に紐づく面談タイプを取得
3. 予約完了後、職員カルテシステムのWebhookに通知

### 6.2 アンケート回答（survey_response）

```json
{
  "hasActionButton": true,
  "actionButton": {
    "type": "survey_response",
    "label": "アンケートに回答する",
    "config": {
      "surveyId": "survey_20251007_001"
    }
  }
}
```

**VoiceDrive側の動作**：
1. ボタンクリック時、アンケートフォームを表示
2. 回答完了後、統計情報に`completions`をカウント
3. 職員カルテシステムに統計送信（Webhook）

### 6.3 カスタムURL（custom）

```json
{
  "hasActionButton": true,
  "actionButton": {
    "type": "custom",
    "label": "詳細を確認する",
    "url": "https://example.com/custom-page"
  }
}
```

**VoiceDrive側の動作**：
1. ボタンクリック時、指定URLを新しいタブで開く
2. クリック数を`actions`としてカウント
3. 職員カルテシステムに統計送信（Webhook）

---

## 7. 配信対象の設定

### 7.1 全職員配信

```json
{
  "targetType": "all"
}
```

### 7.2 部門別配信

```json
{
  "targetType": "departments",
  "targetDepartments": ["看護部", "医局", "事務部"]
}
```

### 7.3 個人別配信

```json
{
  "targetType": "individuals",
  "targetIndividuals": ["staff_001", "staff_002"]
}
```

### 7.4 役職別配信

```json
{
  "targetType": "positions",
  "targetPositions": ["主任", "師長", "部長"]
}
```

---

## 8. セキュリティ

### 8.1 通信暗号化

- ✅ HTTPS必須
- ✅ TLS 1.2以上
- ❌ HTTP接続は許可しない

### 8.2 認証トークン

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- JWT形式
- 有効期限: 24時間
- 更新: リフレッシュトークンで自動更新

### 8.3 IPホワイトリスト（オプション）

職員カルテシステムのIPアドレスをホワイトリストに登録可能。

### 8.4 レート制限

推奨設定：
- 通常: 100リクエスト/分
- バースト: 1000リクエスト/時

---

## 9. 実装例（職員カルテシステム側）

### 9.1 Node.js/TypeScript

```typescript
// src/services/hrAnnouncementService.ts

import fetch from 'node-fetch';

const VOICEDRIVE_API_ENDPOINT = process.env.VOICEDRIVE_API_ENDPOINT!;
const VOICEDRIVE_API_TOKEN = process.env.VOICEDRIVE_API_TOKEN!;

export async function sendToVoiceDrive(announcement: HRAnnouncement) {
  const response = await fetch(`${VOICEDRIVE_API_ENDPOINT}/api/hr-announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VOICEDRIVE_API_TOKEN}`,
      'X-Source-System': 'medical-staff-system'
    },
    body: JSON.stringify({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      targetType: announcement.targetType,
      targetDepartments: announcement.targetDepartments,
      hasActionButton: announcement.hasActionButton,
      actionButton: announcement.actionButton,
      requireResponse: false,
      autoTrackResponse: true,
      scheduledPublishAt: announcement.scheduledPublishAt,
      expiresAt: announcement.expiresAt,
      metadata: {
        sourceSystem: 'medical-staff-system',
        sourceAnnouncementId: announcement.id,
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt
      }
    })
  });

  if (!response.ok) {
    throw new Error(`VoiceDrive API error: ${response.status}`);
  }

  return await response.json();
}
```

### 9.2 Next.js API Route

```typescript
// src/app/api/hr-announcements/publish/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const announcement = await request.json();

  try {
    // VoiceDriveに送信
    const result = await sendToVoiceDrive(announcement);

    // DB更新
    await db.hrAnnouncements.update({
      where: { id: announcement.id },
      data: {
        voicedriveAnnouncementId: result.data.voicedriveAnnouncementId,
        sentToVoicedrive: true,
        sentToVoicedriveAt: new Date(),
        status: 'published',
        publishedAt: new Date(result.data.publishedAt)
      }
    });

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('VoiceDrive送信エラー:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SEND_FAILED' } },
      { status: 500 }
    );
  }
}
```

---

## 10. テスト手順

### 10.1 ローカルテスト

```bash
# cURLでテストリクエスト送信
curl -X POST https://staging-api.voicedrive.example.com/api/hr-announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${VOICEDRIVE_API_TOKEN}" \
  -H "X-Source-System: medical-staff-system" \
  -d '{
    "title": "【テスト】お知らせ配信テスト",
    "content": "これはテスト配信です。",
    "category": "announcement",
    "priority": "low",
    "targetType": "all",
    "hasActionButton": false,
    "requireResponse": false,
    "autoTrackResponse": true,
    "metadata": {
      "sourceSystem": "medical-staff-system",
      "sourceAnnouncementId": "test_001",
      "createdBy": "test_user",
      "createdAt": "2025-10-07T10:00:00.000Z"
    }
  }'
```

### 10.2 統合テストシナリオ

```
1. 職員カルテ: お知らせ作成
   → VoiceDrive: 201 Created

2. VoiceDrive: お知らせ表示確認
   → 期待: 配信対象の職員に表示される

3. VoiceDrive: アクションボタンクリック
   → 期待: 統計情報がWebhookで送信される

4. 職員カルテ: 統計受信確認
   → 期待: DBに統計が保存される
```

---

## 11. トラブルシューティング

### 11.1 よくあるエラー

| エラーコード | 原因 | 対処法 |
|------------|------|-------|
| UNAUTHORIZED | トークンが無効 | トークンを再発行 |
| VALIDATION_ERROR | 必須フィールド欠損 | リクエストボディを確認 |
| INTERNAL_ERROR | サーバーエラー | VoiceDriveチームに連絡 |

### 11.2 デバッグ

```bash
# リクエストボディのバリデーション
npm run validate-announcement-request

# ローカルでモックサーバー起動
npm run mock-voicedrive-api
```

---

## 12. 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-10-07 | 初版リリース |

---

## 13. サポート

**技術的な質問**：
- Slack: #phase2-integration
- メール: voicedrive-dev@example.com

**緊急時の連絡先**：
- VoiceDrive開発チーム

---

**VoiceDrive開発チーム**
**最終更新：2025年10月7日**
