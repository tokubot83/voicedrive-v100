# システム連携アーキテクチャ図

## 現在のアーキテクチャ（Phase 1: フロントエンド開発段階）

```mermaid
graph TB
    subgraph "Staff Medical System"
        SMS_UI[React UI<br/>職員医療管理]
        SMS_Local[ローカルストレージ]
        SMS_UI --> SMS_Local
    end
    
    subgraph "MCP Server 共有層"
        MCP_Config[設定ファイル<br/>interview-types.json]
        MCP_Types[型定義<br/>TypeScript Interfaces]
        MCP_Docs[ドキュメント<br/>AI_SUMMARY.md]
        MCP_Sync[同期ステータス<br/>sync-status.json]
    end
    
    subgraph "VoiceDrive System"
        VD_UI[React UI<br/>法人SNS]
        VD_Local[ローカルストレージ]
        VD_UI --> VD_Local
    end
    
    SMS_UI <--> MCP_Config
    SMS_UI <--> MCP_Types
    VD_UI <--> MCP_Config
    VD_UI <--> MCP_Types
    
    MCP_Sync -.->|監視| MCP_Config
    MCP_Sync -.->|監視| MCP_Types
    MCP_Docs -.->|自動生成| MCP_Sync
```

## 将来のアーキテクチャ（Phase 2: 統合運用段階）

```mermaid
graph TB
    subgraph "フロントエンド層"
        SMS_UI[Staff Medical UI<br/>職員医療管理]
        VD_UI[VoiceDrive UI<br/>法人SNS]
        Mobile[モバイルアプリ<br/>（将来）]
    end
    
    subgraph "API Gateway層"
        Gateway[API Gateway<br/>認証・ルーティング]
        Auth[認証サービス<br/>シングルサインオン]
    end
    
    subgraph "マイクロサービス層"
        Interview_API[面談予約API<br/>v1/v2]
        Staff_API[職員情報API]
        Analytics_API[データ分析API]
        Notification_API[通知API]
    end
    
    subgraph "共通データベース層"
        DB[(統合DB)]
        Cache[(Redis Cache)]
    end
    
    subgraph "イベント駆動層"
        EventBus[イベントバス<br/>リアルタイム同期]
        Queue[メッセージキュー<br/>非同期処理]
    end
    
    SMS_UI --> Gateway
    VD_UI --> Gateway
    Mobile --> Gateway
    
    Gateway --> Auth
    Gateway --> Interview_API
    Gateway --> Staff_API
    Gateway --> Analytics_API
    
    Interview_API --> DB
    Staff_API --> DB
    Analytics_API --> DB
    Notification_API --> Queue
    
    Interview_API --> Cache
    Staff_API --> Cache
    
    Interview_API --> EventBus
    EventBus --> Notification_API
    EventBus --> Analytics_API
    
    Queue --> Notification_API
```

## データフロー例

### 1. 面談予約フロー
```mermaid
sequenceDiagram
    participant User as ユーザー
    participant UI as フロントエンド
    participant API as API Gateway
    participant Auth as 認証
    participant Interview as 面談API
    participant DB as データベース
    participant Event as イベントバス
    participant Notify as 通知サービス
    
    User->>UI: 面談予約リクエスト
    UI->>API: POST /api/bookings
    API->>Auth: トークン検証
    Auth-->>API: 認証OK
    API->>Interview: 予約作成
    Interview->>DB: 予約データ保存
    DB-->>Interview: 保存完了
    Interview->>Event: 予約作成イベント
    Event->>Notify: 通知送信
    Interview-->>API: 予約ID返却
    API-->>UI: レスポンス
    UI-->>User: 予約完了表示
    Notify-->>User: メール/プッシュ通知
```

### 2. データ分析フロー
```mermaid
sequenceDiagram
    participant Manager as 管理者
    participant UI as ダッシュボード
    participant API as API Gateway
    participant Analytics as 分析API
    participant Cache as キャッシュ
    participant DB as データベース
    
    Manager->>UI: 分析レポート要求
    UI->>API: GET /api/analytics/report
    API->>Analytics: レポート生成
    Analytics->>Cache: キャッシュ確認
    
    alt キャッシュヒット
        Cache-->>Analytics: キャッシュデータ
    else キャッシュミス
        Analytics->>DB: データ集計
        DB-->>Analytics: 集計結果
        Analytics->>Cache: キャッシュ保存
    end
    
    Analytics-->>API: レポートデータ
    API-->>UI: JSON応答
    UI-->>Manager: グラフ表示
```

## 技術スタック

### 現在使用中
- **フロントエンド**: React, TypeScript, Tailwind CSS
- **状態管理**: ローカルストレージ
- **共有層**: MCPサーバー, JSON/TypeScript

### 将来導入予定
- **バックエンド**: Node.js/Express or FastAPI
- **データベース**: PostgreSQL
- **キャッシュ**: Redis
- **メッセージキュー**: RabbitMQ or AWS SQS
- **認証**: Auth0 or Keycloak
- **API Gateway**: Kong or AWS API Gateway
- **監視**: Prometheus + Grafana

## セキュリティ考慮事項

```mermaid
graph LR
    subgraph "セキュリティレイヤー"
        WAF[WAF<br/>Webアプリケーションファイアウォール]
        SSL[SSL/TLS<br/>暗号化通信]
        CORS[CORS<br/>クロスオリジン制御]
        RateLimit[レート制限<br/>DDoS対策]
        Audit[監査ログ<br/>アクセス記録]
    end
    
    subgraph "認証・認可"
        JWT[JWT トークン]
        RBAC[ロールベース<br/>アクセス制御]
        MFA[多要素認証]
    end
    
    subgraph "データ保護"
        Encrypt[データ暗号化<br/>保存時・転送時]
        Mask[個人情報<br/>マスキング]
        Backup[定期バックアップ]
    end
```

## スケーラビリティ戦略

1. **水平スケーリング**: マイクロサービスの複数インスタンス展開
2. **負荷分散**: ロードバランサーによるトラフィック分散
3. **データベース**: リードレプリカ、シャーディング
4. **キャッシング**: 多層キャッシュ戦略（CDN、Redis、アプリケーション）
5. **非同期処理**: メッセージキューによる重い処理の分離

## 移行計画

### Phase 1（現在）✅
- フロントエンド開発
- MCPサーバー経由の設定共有
- 型定義の統一

### Phase 2（次期）
- バックエンドAPI開発
- 共通データベース構築
- 認証システム実装

### Phase 3（将来）
- マイクロサービス化
- イベント駆動アーキテクチャ
- リアルタイム同期
- モバイルアプリ対応