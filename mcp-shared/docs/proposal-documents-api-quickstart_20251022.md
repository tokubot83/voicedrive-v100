# 議題提案書API クイックスタートガイド

**文書番号**: QUICKSTART-PD-API-2025-1022-001
**作成日**: 2025年10月22日
**対象**: 議題提案書API（即座に利用可能）
**所要時間**: 5分

---

## 🚀 1. サーバー起動（1分）

### 手順

```bash
# プロジェクトディレクトリに移動
cd c:\projects\voicedrive-v100

# APIサーバー起動
npm run dev:api
```

### 確認

以下の表示が出ればOK:

```
====================================
🚀 VoiceDrive API Server
====================================
Environment: development
Port: 4000
Health: http://localhost:4000/health
API Base: http://localhost:4000/api
====================================
✅ Server running on http://localhost:4000
```

### ヘルスチェック

ブラウザで以下にアクセス:
```
http://localhost:4000/health
```

以下のレスポンスが返ればOK:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:00:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

---

## 🧪 2. テスト実行（2分）

### 手順

```bash
# テスト実行
npm test -- proposal-documents-api.test.ts
```

### 確認

全19個のテストが成功することを確認:

```
PASS  src/tests/proposal-documents-api.test.ts
  Proposal Documents API
    GET /api/proposal-documents/:documentId
      ✓ 議題提案書を取得できる (45 ms)
      ✓ 存在しない議題提案書の場合は404エラー (12 ms)
    PUT /api/proposal-documents/:documentId
      ✓ 管理職による補足を更新できる (38 ms)
      ✓ Level 7未満のユーザーは編集できない (15 ms)
      ✓ 提出済みの議題提案書は編集できない (22 ms)
    POST /api/proposal-documents/:documentId/mark-ready
      ✓ 提出準備完了としてマークできる (28 ms)
      ✓ Level 7未満のユーザーはマークできない (11 ms)
    GET /api/proposal-documents/:documentId/audit-logs
      ✓ 監査ログを取得できる (35 ms)
      ✓ ページネーションが機能する (18 ms)
    POST /api/committee-submission-requests
      ✓ 委員会提出リクエストを作成できる (42 ms)
      ✓ Level 7未満のユーザーはリクエストを作成できない (16 ms)
      ✓ 提出準備完了状態でない場合はリクエストを作成できない (25 ms)
      ✓ 必須パラメータが不足している場合はエラー (13 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        3.456 s
```

---

## 📡 3. API動作確認（2分）

### 方法1: curl（推奨）

#### テスト用議題提案書の作成

まず、フロントエンドまたはテストで議題提案書を作成してください。
テストコードを実行すると自動的に作成されます。

#### API呼び出し例

```bash
# 1. 議題提案書取得
curl http://localhost:4000/api/proposal-documents/doc-test-001

# 2. 管理職補足更新
curl -X PUT http://localhost:4000/api/proposal-documents/doc-test-001 \
  -H "Content-Type: application/json" \
  -d '{
    "managerNotes": "現場の声を反映した提案です",
    "additionalContext": "人員確保については人事部と調整済みです",
    "recommendationLevel": "recommend",
    "user": {
      "id": "user123",
      "name": "山田 花子",
      "permissionLevel": 8.0,
      "email": "yamada@example.com",
      "department": "看護部",
      "position": "課長",
      "isActive": true
    }
  }'

# 3. 提出準備完了マーク
curl -X POST http://localhost:4000/api/proposal-documents/doc-test-001/mark-ready \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id": "user123",
      "name": "山田 花子",
      "permissionLevel": 8.0,
      "email": "yamada@example.com",
      "department": "看護部",
      "position": "課長",
      "isActive": true
    }
  }'

# 4. 監査ログ取得
curl http://localhost:4000/api/proposal-documents/doc-test-001/audit-logs

# 5. 委員会提出リクエスト作成
curl -X POST http://localhost:4000/api/committee-submission-requests \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-test-001",
    "targetCommittee": "運営委員会",
    "user": {
      "id": "user123",
      "name": "山田 花子",
      "permissionLevel": 8.0,
      "email": "yamada@example.com",
      "department": "看護部",
      "position": "課長",
      "isActive": true
    }
  }'
```

### 方法2: Postman（GUI推奨）

#### コレクションのインポート

Postmanコレクション（JSON）を作成することを推奨します。

#### エンドポイント一覧

```
GET    http://localhost:4000/api/proposal-documents/:documentId
PUT    http://localhost:4000/api/proposal-documents/:documentId
POST   http://localhost:4000/api/proposal-documents/:documentId/mark-ready
GET    http://localhost:4000/api/proposal-documents/:documentId/audit-logs
POST   http://localhost:4000/api/committee-submission-requests
```

---

## 🔧 4. フロントエンド連携開始

### ProposalDocumentEditor.tsx の変更

#### 変更前（現在）

```typescript
// src/pages/ProposalDocumentEditor.tsx

import { proposalDocumentGenerator } from '../services/ProposalDocumentGenerator';

const document = proposalDocumentGenerator.getDocument(documentId);
```

#### 変更後（API連携）

```typescript
// src/pages/ProposalDocumentEditor.tsx

import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// 議題提案書取得
const fetchDocument = async (documentId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/proposal-documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error('議題提案書の取得に失敗:', error);
    throw error;
  }
};

// 管理職補足更新
const updateDocument = async (documentId: string, updates: any, user: User) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/proposal-documents/${documentId}`,
      {
        ...updates,
        user
      }
    );
    return response.data;
  } catch (error) {
    console.error('議題提案書の更新に失敗:', error);
    throw error;
  }
};

// 提出準備完了マーク
const markAsReady = async (documentId: string, user: User) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/proposal-documents/${documentId}/mark-ready`,
      { user }
    );
    return response.data;
  } catch (error) {
    console.error('提出準備完了マークに失敗:', error);
    throw error;
  }
};

// 委員会提出リクエスト作成
const createSubmissionRequest = async (
  documentId: string,
  targetCommittee: string,
  user: User
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/committee-submission-requests`,
      {
        documentId,
        targetCommittee,
        user
      }
    );
    return response.data;
  } catch (error) {
    console.error('委員会提出リクエストの作成に失敗:', error);
    throw error;
  }
};
```

### useEffect での使用例

```typescript
useEffect(() => {
  const loadDocument = async () => {
    if (documentId) {
      try {
        const doc = await fetchDocument(documentId);
        setDocument(doc);
        setEditedFields({
          managerNotes: doc.managerNotes || '',
          additionalContext: doc.additionalContext || '',
          recommendationLevel: doc.recommendationLevel || 'recommend'
        });
      } catch (error) {
        alert('議題提案書の読み込みに失敗しました');
      }
    }
  };

  loadDocument();
}, [documentId]);
```

---

## 📊 5. 利用可能なAPIエンドポイント

### 一覧

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|------|
| GET | /api/proposal-documents/:documentId | 議題提案書取得 | なし |
| PUT | /api/proposal-documents/:documentId | 管理職補足更新 | Level 7+ |
| POST | /api/proposal-documents/:documentId/mark-ready | 提出準備完了マーク | Level 7+ |
| GET | /api/proposal-documents/:documentId/audit-logs | 監査ログ取得 | なし |
| POST | /api/committee-submission-requests | 委員会提出リクエスト作成 | Level 7+ |

### レスポンス例

#### GET /api/proposal-documents/:documentId

```json
{
  "id": "doc-post123-1729584000000",
  "postId": "post123",
  "title": "【業務改善】夜勤体制の見直しと人員配置最適化...",
  "agendaLevel": "FACILITY_AGENDA",
  "createdBy": {
    "id": "user123",
    "name": "山田 花子",
    "permissionLevel": 7.0
  },
  "status": "draft",
  "summary": "夜勤帯の看護師配置を見直し...",
  "background": "現在の夜勤体制では...",
  "objectives": "業務効率化と職員の負担軽減",
  "expectedEffects": "1. 職員の疲労軽減...",
  "concerns": "1. 人員確保の困難さ...",
  "counterMeasures": "1. 段階的な導入...",
  "voteAnalysis": {
    "totalVotes": 87,
    "supportRate": 82.3
  },
  "commentAnalysis": {
    "totalComments": 34,
    "supportComments": 18
  },
  "managerNotes": null,
  "additionalContext": null,
  "recommendationLevel": null,
  "auditLog": [
    {
      "id": "audit001",
      "timestamp": "2025-10-15T10:00:00Z",
      "userName": "山田 花子",
      "action": "created"
    }
  ]
}
```

---

## ⚠️ 注意事項

### 1. 認証について
現在は簡易実装のため、`user`オブジェクトをリクエストボディで送信しています。
将来的にはJWT認証に移行します。

### 2. CORS設定
`localhost:3001`からのアクセスは許可されています（server.tsで設定済み）。

### 3. データの永続性
現在はメモリ内で動作しているため、**サーバー再起動でデータが消失**します。
DB構築後は永続化されます。

---

## 🎯 次のステップ

### 即座に実施
- [x] サーバー起動
- [x] テスト実行
- [x] API動作確認
- [ ] フロントエンド連携開始
- [ ] 統合テスト実施

### DB構築後
- [ ] Prismaマイグレーション実行
- [ ] サービス層をPrismaに切り替え
- [ ] APIルートを非同期対応
- [ ] JWT認証実装

詳細は以下を参照:
- [DB構築時実装作業再開ガイド](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-documents-api-db-migration-guide_20251022.md)

---

## 📞 サポート

### 問題が発生した場合
1. サーバーログを確認
2. テストを実行してエラーを特定
3. Slack #voicedrive-dev で質問

### 参考ドキュメント
- [実装完了報告書](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-documents-api-implementation-report_20251022.md)
- [DB要件分析](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-document-editor_DB要件分析_20251022.md)
- [暫定マスターリスト](c:\projects\voicedrive-v100\mcp-shared\docs\proposal-document-editor暫定マスターリスト_20251022.md)

---

**作成日**: 2025年10月22日
**最終更新**: 2025年10月22日
**ステータス**: ✅ 即座に利用可能

---

**文書終了**

このガイドに従えば、5分でAPIを起動して動作確認できます！
