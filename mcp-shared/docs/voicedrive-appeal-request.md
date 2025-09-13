# VoiceDrive異議申し立て機能実装指示書

## 作成日: 2025-01-16
## 作成者: 医療職員管理システムチーム
## 宛先: VoiceDriveチーム

---

## 1. 実装要求概要

評価管理システムにおける「異議申し立て機能」をVoiceDrive SNS経由で受け付けるため、面談予約システムと同様の仕組みで実装をお願いします。

## 2. 背景と目的

### 背景
- 現在、評価結果に対する異議申し立ては紙ベースで行われており、処理に時間がかかる
- 職員からの申し立て内容の追跡・管理が困難
- 面談予約システムがVoiceDrive経由で成功しているため、同じ仕組みを活用したい

### 目的
- 異議申し立ての受付をデジタル化・効率化
- 申し立て状況のリアルタイム管理
- 透明性の高い審査プロセスの実現

## 3. 機能要件

### 3.1 異議申し立て受付機能

#### 必須項目
```typescript
interface AppealRequest {
  // 必須項目
  employeeId: string;           // 職員ID
  employeeName: string;          // 職員名
  evaluationPeriod: string;      // 評価期間（例: "2025年度上期"）
  appealCategory: string;        // 申し立てカテゴリー
  appealReason: string;          // 申し立て理由（詳細）
  
  // オプション項目
  originalScore?: number;        // 現在の評価点
  requestedScore?: number;       // 希望する評価点
  evidenceDocuments?: string[];  // 証拠書類（ファイルパス/URL）
  preferredContactMethod?: string; // 希望連絡方法
}
```

#### 申し立てカテゴリー
- `evaluation_criteria_misinterpretation` - 評価基準の誤解釈
- `achievement_oversight` - 成果の見落とし
- `period_error` - 評価期間の誤り  
- `calculation_error` - 点数計算の誤り
- `other` - その他

### 3.2 API エンドポイント

#### POST /api/v1/appeals/submit
異議申し立ての新規受付

**リクエスト例:**
```json
{
  "employeeId": "E001",
  "employeeName": "山田太郎",
  "evaluationPeriod": "2025年度上期",
  "appealCategory": "achievement_oversight",
  "appealReason": "研修講師として10回以上の講義を行ったが、貢献度評価に反映されていない",
  "originalScore": 73,
  "requestedScore": 80,
  "evidenceDocuments": ["講師実績リスト.pdf"]
}
```

**レスポンス例:**
```json
{
  "success": true,
  "appealId": "AP-2025-001",
  "message": "異議申し立てを受け付けました",
  "expectedResponseDate": "2025-02-01",
  "details": {
    "status": "received",
    "processedAt": "2025-01-16T10:30:00Z"
  }
}
```

#### GET /api/v1/appeals/status/{appealId}
申し立て状況の確認

#### PUT /api/v1/appeals/{appealId}/update
追加情報の提出

#### DELETE /api/v1/appeals/{appealId}/withdraw
申し立ての取り下げ

### 3.3 通知機能

#### 職員への通知
1. **受付完了通知** - 申し立て受理時
2. **追加情報要求通知** - 審査で追加情報が必要な場合
3. **審査結果通知** - 最終決定時

#### 管理者への通知
1. **新規申し立てアラート** - リアルタイム通知
2. **期限警告** - 審査期限（3週間）が近づいた場合
3. **エスカレーション通知** - 特別対応が必要な場合

### 3.4 ステータス管理

```typescript
enum AppealStatus {
  RECEIVED = 'received',           // 受理済み
  UNDER_REVIEW = 'under_review',   // 審査中
  ADDITIONAL_INFO = 'additional_info', // 追加情報待ち
  RESOLVED = 'resolved',           // 解決済み
  WITHDRAWN = 'withdrawn'          // 取り下げ
}
```

## 4. 連携仕様

### 4.1 MCP共有フォルダ構成

```
mcp-shared/
├── appeals/
│   ├── pending/           # 未処理の申し立て
│   ├── in-progress/       # 審査中
│   ├── resolved/          # 解決済み
│   └── logs/              # ログファイル
└── interfaces/
    └── appeal.interface.ts # 共通インターフェース定義
```

### 4.2 データ同期

- **同期間隔**: 5分ごと（面談予約と同じ）
- **ファイル形式**: JSON
- **文字コード**: UTF-8
- **タイムスタンプ**: ISO 8601形式

### 4.3 ログ記録

```typescript
interface AppealLog {
  timestamp: string;
  appealId: string;
  action: string;
  userId: string;
  details: any;
}
```

## 5. UI/UX要件

### 5.1 VoiceDrive SNS側の画面

1. **申し立てフォーム**
   - 評価結果確認画面から直接アクセス可能
   - カテゴリー選択はドロップダウン
   - 理由入力は必須（最低100文字）
   - ファイルアップロード機能（PDF, 画像）

2. **ステータス確認画面**
   - 申し立て履歴一覧
   - 現在の審査状況
   - 管理者からのメッセージ表示

3. **通知表示**
   - プッシュ通知対応
   - 未読バッジ表示

### 5.2 エラーハンドリング

- 申し立て期限（開示後2週間）を過ぎた場合のエラー表示
- 必須項目未入力時の警告
- ファイルサイズ制限（10MB）超過時の警告

## 6. セキュリティ要件

- 本人認証必須（VoiceDriveログイン）
- 申し立て内容の暗号化
- アクセスログの記録
- 個人情報保護法準拠

## 7. テスト要件

### 7.1 単体テスト
- API各エンドポイントの正常系/異常系
- バリデーション処理
- ステータス遷移

### 7.2 結合テスト
- VoiceDrive → MCP共有 → 管理システムの一連フロー
- 通知機能の動作確認
- 同時申し立て時の処理

### 7.3 受入テスト
- 実際の評価データを使用したテスト
- ユーザビリティテスト（職員5名程度）

## 8. 実装スケジュール（希望）

- **Phase 1（2週間）**: API実装とMCP連携
- **Phase 2（1週間）**: UI実装
- **Phase 3（1週間）**: テストと修正
- **リリース目標**: 2025年2月中旬

## 9. 参考資料

- 面談予約システムのソースコード: `/api/v1/interviews/bookings/`
- 共通インターフェース: `/mcp-shared/interfaces/`
- 既存の評価管理システム: `/src/app/evaluation-execution/`

## 10. 連絡先

- 技術担当: [担当者名]
- メール: [メールアドレス]
- 内線: [内線番号]

---

## 備考

- 面談予約システムと同じアーキテクチャを使用することで、開発期間の短縮を期待
- 将来的には、他の申請系機能（研修申込、休暇申請など）も同様の仕組みで実装予定
- 不明点があれば、随時お問い合わせください

## 更新履歴

- 2025-01-16: 初版作成