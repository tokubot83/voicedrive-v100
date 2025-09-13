# VoiceDrive評価通知機能実装ガイド

## 概要
医療職員管理システムからVoiceDriveへの評価通知機能実装指示書です。
既存の面談予約ルート（VoiceDrive→医療システム）の逆方向版として実装します。

## 実装方式

### 1. 既存ルートとの関係
```
既存: VoiceDrive → mcp-shared → 医療システム （面談予約）
新規: 医療システム → mcp-shared → VoiceDrive （評価通知）
```

### 2. 共通DB経由のAPI設計
- **エンドポイント**: `/api/mcp-shared/evaluation-notifications`
- **認証**: 既存の面談予約と同じ認証方式
- **データ形式**: TypeScript型定義で統一

## VoiceDrive側で必要な実装

### 1. 通知受信API
```typescript
// VoiceDrive側で実装が必要な受信エンドポイント
POST /api/notifications/evaluation-received

interface NotificationReceiveRequest {
  notifications: EvaluationNotification[];
  batchId: string;
  sourceSystem: 'medical-staff-system';
}
```

### 2. 通知データ構造
既に作成済みの型定義を使用：
- `mcp-shared/interfaces/evaluation-notification.interface.ts`

### 3. 通知表示機能
VoiceDrive側で以下の機能が必要：

#### 3.1 通知一覧表示
```typescript
// 通知タイプ別の表示
- summer_provisional: 「夏季評価結果（暫定）」
- winter_provisional: 「冬季評価結果（暫定）」  
- annual_final: 「年間総合評価結果」
```

#### 3.2 評価詳細表示
```typescript
interface EvaluationDetailView {
  // 施設内評価
  facilityContribution: {
    points: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    ranking?: { position: number; total: number };
  };
  
  // 法人内評価  
  corporateContribution: {
    points: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    ranking?: { position: number; total: number };
  };
  
  // 総合評価（3月のみ）
  finalEvaluation?: {
    totalPoints: number;
    finalGrade: string;
    technicalScore: number;
  };
}
```

#### 3.3 フィードバック面談予約連携
通知から直接面談予約画面に遷移する機能：
```typescript
// 通知内のactionUrlを活用
actionUrl: '/interviews/book/feedback'
// ↓
既存の面談予約フローに「フィードバック面談」として連携
```

## 年3回の通知タイミング

### 1. 夏季評価通知（7-8月）
```typescript
notificationType: 'summer_provisional'
// 内容: 上半期組織貢献度評価25点
//      - 施設内評価（暫定）
//      - 法人内評価（暫定）
//      - 総合評価（暫定）
// 表示: すべて「暫定」として表示
// 異議申し立て期限: 通知から2週間
```

### 2. 冬季評価通知（12月）
```typescript
notificationType: 'winter_provisional'
// 内容: 組織貢献度査定50点（点数確定、段階評価は暫定）
//      - 施設内評価（暫定）
//      - 法人内評価（暫定）  
//      - 総合評価（暫定：技術評価50点待ち）
// 表示: すべて「暫定」として表示
// 異議申し立て期限: 通知から2週間
```

### 3. 最終評価通知（3月）
```typescript
notificationType: 'annual_final'
// 内容: 技術評価50点 + 総合評価100点（最終確定）
//      - 組織貢献度50点 + 技術評価50点 = 100点
//      - 施設内評価（確定）
//      - 法人内評価（確定）
//      - 総合評価（確定）
// 表示: すべて「確定」として表示
// フィードバック面談推奨
```

## 実装手順

### Step 1: VoiceDrive側の受信機能実装
1. 通知受信APIエンドポイント作成
2. 通知データの保存・管理機能
3. 既読・未読状態管理

### Step 2: UI実装
1. 通知一覧画面
2. 評価詳細表示画面
3. 面談予約への遷移機能

### Step 3: 医療システム側との連携テスト
1. mcp-shared経由での通知送信テスト
2. データ形式の整合性確認
3. 異議申し立て機能との連携確認

### Step 4: 本番環境対応
1. 認証・セキュリティ設定
2. バッチ送信機能のパフォーマンス確認
3. エラーハンドリング・リトライ機能

## セキュリティ考慮事項
- 個人評価データの暗号化
- アクセスログの記録
- 認証トークンの有効期限管理
- 通知データの自動削除ポリシー

## テスト観点
- 大量通知の同時送信性能
- ネットワーク断線時のリトライ機能
- 重複通知の排除機能
- 通知履歴の保持期間

---
**次回のmcp-shared同期で、VoiceDriveチームと連携して実装を開始予定**