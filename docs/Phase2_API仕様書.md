# Phase 2 API仕様書

**Version**: 1.0.0
**作成日**: 2025年9月25日
**ベースURL**: `https://api.voicedrive.ohara-hospital.jp/v1`

## 1. 認証・権限管理API

### 1.1 ログイン
```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "staffId": "STAFF001",
    "name": "佐藤 花子",
    "email": "sato.hanako@ohara-hospital.jp",
    "accountLevel": 1.5,
    "facility": "小原病院",
    "department": "内科病棟",
    "position": "",
    "profession": "看護師",
    "canPerformLeaderDuty": true
  }
}

Response: 401 Unauthorized
{
  "error": {
    "code": "AUTH_FAILED",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

### 1.2 権限情報取得
```http
GET /users/permissions/{staffId}
Authorization: Bearer {token}

Response: 200 OK
{
  "staffId": "STAFF001",
  "level": 1.5,
  "baseLevel": 1,
  "nursingLeaderBonus": true,
  "calculatedLevel": 1.5,
  "metadata": {
    "label": "新人看護師（リーダー可）",
    "description": "入職1年目でリーダー業務可能",
    "features": [
      "アイデア投稿",
      "部署内投票"
    ],
    "menus": ["dashboard", "ideaVoice", "voting"],
    "color": "#22C55E"
  }
}
```

### 1.3 トークンリフレッシュ
```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 2. 議題提出API

### 2.1 議題提出
```http
POST /proposals/submit
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "title": "夜勤体制の改善提案",
  "description": "現在の夜勤体制について...",
  "category": "業務改善",
  "attachments": [
    {
      "filename": "proposal.pdf",
      "url": "/uploads/2025/09/proposal.pdf"
    }
  ],
  "tags": ["看護部", "勤務体制", "労働環境"]
}

Response: 201 Created
{
  "proposalId": "PROP-2025-001234",
  "title": "夜勤体制の改善提案",
  "submittedBy": {
    "staffId": "STAFF001",
    "name": "佐藤 花子",
    "department": "内科病棟"
  },
  "submittedAt": "2025-10-01T10:30:00Z",
  "category": "業務改善",
  "initialScore": 0,
  "departmentSize": 25,
  "sizeMultiplier": 0.8,
  "currentStatus": "OPEN",
  "votingScope": "department"
}
```

### 2.2 エスカレーション状況取得
```http
GET /proposals/{proposalId}/escalation
Authorization: Bearer {token}

Response: 200 OK
{
  "proposalId": "PROP-2025-001234",
  "rawScore": 45,
  "departmentSize": 25,
  "sizeMultiplier": 0.8,
  "adjustedScore": 56.25,
  "currentLevel": 2,
  "votingScope": "department",
  "nextThreshold": 50,
  "nextThresholdScope": "facility",
  "targetCommittee": null,
  "escalationHistory": [
    {
      "timestamp": "2025-10-01T11:00:00Z",
      "fromScore": 0,
      "toScore": 30,
      "event": "THRESHOLD_REACHED",
      "level": 1
    }
  ]
}
```

### 2.3 議題一覧取得
```http
GET /proposals?scope={scope}&status={status}&category={category}
Authorization: Bearer {token}

Parameters:
- scope: "department" | "facility" | "corporation" | "all"
- status: "OPEN" | "IN_COMMITTEE" | "CLOSED" | "IMPLEMENTED"
- category: "医療安全" | "感染対策" | "業務改善" | "戦略提案"
- page: number (default: 1)
- limit: number (default: 20)

Response: 200 OK
{
  "proposals": [
    {
      "proposalId": "PROP-2025-001234",
      "title": "夜勤体制の改善提案",
      "submittedBy": "佐藤 花子",
      "department": "内科病棟",
      "submittedAt": "2025-10-01T10:30:00Z",
      "category": "業務改善",
      "currentScore": 56.25,
      "votingScope": "department",
      "voteCount": 15,
      "status": "OPEN"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

### 2.4 委員会提出
```http
POST /proposals/{proposalId}/submit-to-committee
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "committeeId": "SAFETY_COMMITTEE",
  "additionalNotes": "緊急性が高いため早期審議を希望"
}

Response: 200 OK
{
  "proposalId": "PROP-2025-001234",
  "committeeId": "SAFETY_COMMITTEE",
  "committeeName": "医療安全管理委員会",
  "submittedAt": "2025-10-03T14:00:00Z",
  "documentUrl": "/documents/committee/2025/10/PROP-2025-001234.pdf",
  "status": "IN_COMMITTEE"
}
```

## 3. 投票API

### 3.1 投票重み計算
```http
POST /votes/calculate-weight
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "staffId": "STAFF001",
  "proposalId": "PROP-2025-001234",
  "voteType": "😍"
}

Response: 200 OK
{
  "staffId": "STAFF001",
  "proposalId": "PROP-2025-001234",
  "voteType": "😍",
  "baseScore": 10,
  "accountLevelWeight": 1.15,
  "professionWeight": 2.5,
  "categoryAdjustment": 1.0,
  "finalScore": 28.75,
  "breakdown": {
    "accountLevel": {
      "level": 1.5,
      "weight": 1.15,
      "label": "新人看護師（リーダー可）"
    },
    "profession": {
      "type": "看護師",
      "weight": 2.5,
      "experienceBonus": 0
    },
    "category": {
      "type": "業務改善",
      "adjustment": 1.0
    }
  }
}
```

### 3.2 投票実行
```http
POST /votes/submit
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "proposalId": "PROP-2025-001234",
  "voteType": "😍",
  "comment": "この提案に全面的に賛同します"
}

Response: 201 Created
{
  "voteId": "VOTE-2025-567890",
  "proposalId": "PROP-2025-001234",
  "staffId": "STAFF001",
  "voteType": "😍",
  "weightedScore": 28.75,
  "comment": "この提案に全面的に賛同します",
  "votedAt": "2025-10-01T14:30:00Z",
  "proposalNewScore": 85.0,
  "escalationTriggered": false
}

Response: 403 Forbidden
{
  "error": {
    "code": "VOTING_NOT_ALLOWED",
    "message": "この議題への投票権限がありません",
    "details": {
      "reason": "異なる施設の議題",
      "requiredScope": "corporation",
      "userScope": "facility"
    }
  }
}
```

### 3.3 投票権限確認
```http
GET /votes/permission-check?staffId={staffId}&proposalId={proposalId}
Authorization: Bearer {token}

Response: 200 OK
{
  "canVote": true,
  "reason": "同じ部署の提案",
  "scope": "department",
  "userLevel": 1.5,
  "requiredLevel": null,
  "hasAlreadyVoted": false
}

Response: 200 OK (Cannot Vote)
{
  "canVote": false,
  "reason": "権限レベル不足",
  "scope": "corporation",
  "userLevel": 2,
  "requiredLevel": 3,
  "hasAlreadyVoted": false,
  "message": "法人レベルの議題には中堅（レベル3）以上の権限が必要です"
}
```

### 3.4 投票履歴取得
```http
GET /votes/history?staffId={staffId}&proposalId={proposalId}
Authorization: Bearer {token}

Response: 200 OK
{
  "votes": [
    {
      "voteId": "VOTE-2025-567890",
      "proposalId": "PROP-2025-001234",
      "proposalTitle": "夜勤体制の改善提案",
      "voteType": "😍",
      "weightedScore": 28.75,
      "votedAt": "2025-10-01T14:30:00Z"
    }
  ],
  "totalVotes": 15,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

## 4. 統計・分析API

### 4.1 部署統計
```http
GET /statistics/department/{departmentName}
Authorization: Bearer {token}

Response: 200 OK
{
  "department": "内科病棟",
  "staffCount": 25,
  "statistics": {
    "totalProposals": 45,
    "openProposals": 8,
    "implementedProposals": 12,
    "averageScore": 85.5,
    "votingParticipation": 0.76,
    "categoryBreakdown": {
      "医療安全": 12,
      "感染対策": 8,
      "業務改善": 20,
      "戦略提案": 5
    }
  }
}
```

### 4.2 投票集計
```http
GET /statistics/votes/aggregation?proposalId={proposalId}
Authorization: Bearer {token}

Response: 200 OK
{
  "proposalId": "PROP-2025-001234",
  "totalVotes": 45,
  "totalScore": 385.75,
  "voteBreakdown": {
    "😍": { "count": 15, "weightedScore": 231.5 },
    "👍": { "count": 20, "weightedScore": 120.0 },
    "🤔": { "count": 8, "weightedScore": 28.25 },
    "👎": { "count": 2, "weightedScore": 6.0 }
  },
  "departmentBreakdown": {
    "内科病棟": { "votes": 25, "score": 210.5 },
    "外科病棟": { "votes": 15, "score": 125.25 },
    "救急外来": { "votes": 5, "score": 50.0 }
  },
  "levelBreakdown": {
    "1-2.5": { "votes": 20, "score": 85.5 },
    "3-4.5": { "votes": 15, "score": 150.25 },
    "5-11": { "votes": 10, "score": 150.0 }
  }
}
```

## 5. MCPサーバー連携API

### 5.1 スタッフデータ同期
```http
POST /mcp/sync/staff
Authorization: Bearer {token}
X-MCP-Secret: {mcp_secret}

Request:
{
  "facilityId": "OHARA_HOSPITAL",
  "syncType": "FULL" | "INCREMENTAL",
  "lastSyncTime": "2025-09-25T00:00:00Z"
}

Response: 200 OK
{
  "syncId": "SYNC-2025-001",
  "syncedAt": "2025-10-01T03:00:00Z",
  "syncType": "FULL",
  "statistics": {
    "totalRecords": 450,
    "created": 5,
    "updated": 15,
    "deleted": 2,
    "errors": 0
  },
  "nextSyncScheduled": "2025-10-01T03:10:00Z"
}
```

### 5.2 Webhook受信
```http
POST /mcp/webhook/staff-update
Content-Type: application/json
X-MCP-Signature: {signature}

Request:
{
  "event": "UPDATE",
  "timestamp": "2025-10-01T10:15:00Z",
  "staffId": "STAFF001",
  "changes": {
    "accountLevel": {
      "old": 1,
      "new": 1.5
    },
    "canPerformLeaderDuty": {
      "old": false,
      "new": true
    }
  }
}

Response: 200 OK
{
  "received": true,
  "processedAt": "2025-10-01T10:15:01Z"
}
```

### 5.3 ヘルスチェック
```http
GET /mcp/health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2025-10-01T10:00:00Z",
  "services": {
    "database": "connected",
    "mcp_server": "connected",
    "cache": "connected"
  },
  "lastSync": {
    "timestamp": "2025-10-01T03:00:00Z",
    "status": "success",
    "recordsProcessed": 450
  }
}
```

## 6. エラーレスポンス

### 標準エラー形式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ（日本語）",
    "details": {},
    "timestamp": "2025-10-01T10:00:00Z",
    "traceId": "trace-id-12345"
  }
}
```

### エラーコード一覧
| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| AUTH_FAILED | 401 | 認証失敗 |
| TOKEN_EXPIRED | 401 | トークン期限切れ |
| PERMISSION_DENIED | 403 | 権限不足 |
| VOTING_NOT_ALLOWED | 403 | 投票権限なし |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | 入力検証エラー |
| DUPLICATE_VOTE | 409 | 重複投票 |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| INTERNAL_ERROR | 500 | サーバーエラー |
| MCP_SYNC_ERROR | 503 | MCP同期エラー |

## 7. レート制限

### エンドポイント別制限
| エンドポイント | 制限 |
|---------------|------|
| /auth/login | 5回/分 |
| /proposals/submit | 10回/時 |
| /votes/submit | 30回/分 |
| その他のGET | 100回/分 |
| その他のPOST/PUT/DELETE | 50回/分 |

### レート制限ヘッダー
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696165200
```

## 8. セキュリティ

### 認証方式
- JWT Bearer Token
- トークン有効期限: 1時間
- リフレッシュトークン有効期限: 7日

### CORS設定
```javascript
{
  "origin": [
    "https://voicedrive.ohara-hospital.jp",
    "https://staging.voicedrive.ohara-hospital.jp"
  ],
  "credentials": true,
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}
```

### セキュリティヘッダー
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---
最終更新: 2025年9月25日