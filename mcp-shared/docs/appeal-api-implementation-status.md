# 異議申し立てAPI実装ステータス

## 実装完了日: 2025-01-16

## 実装済みエンドポイント

### 1. POST /api/v1/appeals/submit
**機能**: 異議申し立ての新規受付
- VoiceDrive SNSからの申し立てを受け付け
- バリデーション（必須項目、カテゴリー、理由100文字以上）
- MCP共有フォルダへの保存
- 管理者への通知（ログ記録）
- 優先度判定（スコア差、カテゴリーによる）

### 2. GET /api/v1/appeals/submit
**機能**: 異議申し立て一覧取得
- appealIdまたはemployeeIdで検索
- MCP共有フォルダから読み込み

### 3. PUT /api/v1/appeals/submit
**機能**: 追加情報の提出
- 審査中の異議申し立てに追加情報を提出

### 4. DELETE /api/v1/appeals/submit
**機能**: 異議申し立ての取り下げ
- 申し立ての取り下げ処理
- resolvedフォルダへの移動

### 5. GET /api/v1/appeals/status/[appealId]
**機能**: 特定の異議申し立てステータス取得
- 詳細情報の取得
- コミュニケーションログの表示

### 6. PUT /api/v1/appeals/status/[appealId]
**機能**: ステータス更新
- 審査開始、情報要求、承認、却下などのステータス変更
- フォルダ間の自動移動

### 7. POST /api/v1/appeals/status/[appealId]
**機能**: コメント追加
- 審査者コメントの追加
- コミュニケーションログへの記録

## MCP共有フォルダ構造

```
mcp-shared/
├── appeals/
│   ├── pending/        # 未処理の申し立て
│   ├── in-progress/    # 審査中
│   ├── resolved/       # 解決済み
│   └── logs/           # ログファイル
└── interfaces/
    └── appeal.interface.ts  # 共通インターフェース定義
```

## インターフェース定義

### AppealRequest
```typescript
interface AppealRequest {
  employeeId: string;
  employeeName: string;
  evaluationPeriod: string;
  appealCategory: AppealCategory;
  appealReason: string;
  originalScore?: number;
  requestedScore?: number;
  evidenceDocuments?: string[];
}
```

### AppealStatus
- RECEIVED: 受理済み
- UNDER_REVIEW: 審査中
- ADDITIONAL_INFO: 追加情報待ち
- RESOLVED: 解決済み
- WITHDRAWN: 取り下げ
- REJECTED: 却下

### AppealCategory
- evaluation_criteria_misinterpretation: 評価基準の誤解釈
- achievement_oversight: 成果の見落とし
- period_error: 評価期間の誤り
- calculation_error: 点数計算の誤り
- other: その他

## ログ機能

- 全APIアクセスをログファイルに記録
- ログ保存先: `logs/appeal-integration.log`
- アクション追跡（submit, receive, review, approve, reject等）

## 統合テスト用コマンド

```bash
# 異議申し立ての送信テスト
curl -X POST http://localhost:3000/api/v1/appeals/submit \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "E001",
    "employeeName": "山田太郎",
    "evaluationPeriod": "2025年度上期",
    "appealCategory": "achievement_oversight",
    "appealReason": "研修講師として10回以上の講義を行ったが、貢献度評価に反映されていない。具体的には2025年4月から6月にかけて、新人看護師向けの基礎研修を5回、中堅看護師向けのスキルアップ研修を3回、管理者向けのリーダーシップ研修を2回実施しました。",
    "originalScore": 73,
    "requestedScore": 80
  }'

# ステータス確認
curl http://localhost:3000/api/v1/appeals/status/[appealId]

# ステータス更新（審査開始）
curl -X PUT http://localhost:3000/api/v1/appeals/status/[appealId] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "under_review",
    "userId": "admin001"
  }'
```

## VoiceDriveチームへの連携事項

1. **エンドポイント準備完了**
   - `/api/v1/appeals/submit` が稼働中
   - 面談予約システムと同じレスポンス形式

2. **必須項目**
   - employeeId, employeeName, evaluationPeriod
   - appealCategory（指定のカテゴリーから選択）
   - appealReason（100文字以上）

3. **レスポンス形式**
   ```json
   {
     "success": true,
     "appealId": "AP-2025-XXXXX-XXXX",
     "message": "異議申し立てを受け付けました",
     "expectedResponseDate": "2025-02-06"
   }
   ```

4. **同期間隔**
   - MCP共有フォルダは5分ごとに同期
   - sync-status.jsonで同期状態を確認可能

## 今後の拡張予定

1. **メール通知機能**
   - 管理者への自動メール送信
   - 職員への状態変更通知

2. **ダッシュボード統合**
   - 評価実行画面への異議申し立て状況表示
   - リアルタイムステータス更新

3. **レポート機能**
   - 月次異議申し立てレポート
   - カテゴリー別統計分析

## 備考

- 面談予約システムのアーキテクチャを踏襲
- 将来的に他の申請系機能（研修申込、休暇申請）も同様に実装予定