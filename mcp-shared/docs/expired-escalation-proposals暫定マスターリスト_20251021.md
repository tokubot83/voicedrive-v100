# 期限切れエスカレーション提案ページ 暫定マスターリスト

**文書番号**: MASTER-2025-1021-002
**作成日**: 2025年10月21日
**対象ページ**: https://voicedrive-v100.vercel.app/expired-escalation-proposals
**参照文書**:
- [expired-escalation-proposals_DB要件分析_20251021.md](./expired-escalation-proposals_DB要件分析_20251021.md)
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 📋 エグゼクティブサマリー

### 実装状況
- ✅ **データベース**: 100% 実装済み（変更不要）
- ⚠️ **API**: 2つのエンドポイント実装が必要
- ✅ **フロントエンド**: 100% 実装済み（変更不要）

### データ管理責任
- ✅ **VoiceDrive**: 100% 管轄（医療システム関与不要）
- ✅ **独立機能**: 完全にVoiceDrive内部で完結

---

## 🗂️ テーブル定義

### 1. Post テーブル（既存）

**データ管理責任**: ✅ VoiceDrive

**使用フィールド**:
| フィールド名 | データ型 | 説明 | 実装状態 |
|------------|---------|------|---------|
| `id` | String | 提案ID（主キー） | ✅ 実装済み |
| `content` | String | 提案内容 | ✅ 実装済み |
| `authorId` | String | 提案者ID（外部キー） | ✅ 実装済み |
| `proposalType` | String? | 提案タイプ | ✅ 実装済み |
| `agendaScore` | Int? | 議題スコア（デフォルト: 0） | ✅ 実装済み |
| `agendaLevel` | String? | 議題レベル（DEPT/FACILITY/CORP） | ✅ 実装済み |
| `agendaVotingDeadline` | DateTime? | 投票期限 | ✅ 実装済み |
| `agendaStatus` | PostStatus? | 議題ステータス | ✅ 実装済み |

**インデックス**:
- `authorId`
- `agendaVotingDeadline`
- `agendaStatus`
- `agendaLevel`

**リレーション**:
```prisma
author                       User                          @relation("PostAuthor")
expiredEscalationDecisions   ExpiredEscalationDecision[]   @relation("ExpiredEscalationDecisions")
```

---

### 2. ExpiredEscalationDecision テーブル（既存）

**データ管理責任**: ✅ VoiceDrive

**完全定義**:
| フィールド名 | データ型 | 説明 | 実装状態 |
|------------|---------|------|---------|
| `id` | String | 判断ID（主キー） | ✅ 実装済み |
| `postId` | String | 提案ID（外部キー） | ✅ 実装済み |
| `deciderId` | String | 判断者ID（外部キー） | ✅ 実装済み |
| `decision` | String | 判断内容（approve/downgrade/reject） | ✅ 実装済み |
| `decisionReason` | String | 判断理由 | ✅ 実装済み |
| `currentScore` | Int | 判断時のスコア | ✅ 実装済み |
| `targetScore` | Int | 目標スコア | ✅ 実装済み |
| `achievementRate` | Float | 達成率（%） | ✅ 実装済み |
| `daysOverdue` | Int | 期限超過日数 | ✅ 実装済み |
| `agendaLevel` | String | 議題レベル | ✅ 実装済み |
| `proposalType` | String? | 提案タイプ | ✅ 実装済み |
| `department` | String? | 部署 | ✅ 実装済み |
| `facilityId` | String? | 施設ID | ✅ 実装済み |
| `createdAt` | DateTime | 作成日時 | ✅ 実装済み |
| `updatedAt` | DateTime | 更新日時 | ✅ 実装済み |

**判断内容の値**:
- `approve_at_current_level`: 現在のレベルで承認
- `downgrade`: ダウングレード（1つ下のレベルに降格）
- `reject`: 不採用

**インデックス**:
- `postId`
- `deciderId`
- `facilityId`
- `createdAt`
- `decision`

**リレーション**:
```prisma
post    Post @relation("ExpiredEscalationDecisions", fields: [postId], references: [id], onDelete: Cascade)
decider User @relation("ExpiredDecisions", fields: [deciderId], references: [id])
```

---

### 3. User テーブル（既存）

**データ管理責任**: 🔵 医療システム（VoiceDriveはキャッシュのみ）

**使用フィールド**:
| フィールド名 | データ型 | 説明 | データ管理責任 | 実装状態 |
|------------|---------|------|--------------|---------|
| `id` | String | ユーザーID（主キー） | 医療システム | ✅ 実装済み |
| `name` | String | 職員名 | 医療システム | ✅ 実装済み |
| `department` | String? | 部署名 | 医療システム | ✅ 実装済み |
| `facilityId` | String? | 施設ID | 医療システム | ✅ 実装済み |

**リレーション**:
```prisma
posts            Post[]                          @relation("PostAuthor")
expiredDecisions ExpiredEscalationDecision[]     @relation("ExpiredDecisions")
```

---

### 4. PostStatus Enum（既存）

**期限到達関連ステータス**:
```prisma
enum PostStatus {
  // 期限到達フロー
  FACILITY_VOTE_EXPIRED_PENDING_DECISION  // 施設投票期限終了・判断待ち
  DOWNGRADED_TO_DEPT_AGENDA               // 施設→部署に降格
  REJECTED_AFTER_FACILITY_VOTE            // 施設投票後に却下
}
```

---

## 🌐 API仕様

### API 1: 期限到達提案取得

**エンドポイント**: `GET /api/agenda/expired-escalation-proposals`

**実装状態**: ⚠️ **未実装**

**認証**: ✅ 必要（Bearer Token）

**リクエスト**:
```http
GET /api/agenda/expired-escalation-proposals
Authorization: Bearer {token}
```

**レスポンス**:
```typescript
{
  data: {
    proposals: [
      {
        id: string;
        content: string;
        agendaScore: number;
        agendaLevel: string;
        proposalType: string;
        department: string;
        agendaVotingDeadline: Date;
        author: {
          name: string;
          department: string;
        }
      }
    ]
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 認証エラー
- `500`: サーバーエラー

**実装ファイル**: `src/pages/api/agenda/expired-escalation-proposals.ts`

---

### API 2: 判断記録

**エンドポイント**: `POST /api/agenda/expired-escalation-decisions`

**実装状態**: ⚠️ **未実装**

**認証**: ✅ 必要（Bearer Token）

**リクエスト**:
```http
POST /api/agenda/expired-escalation-decisions
Authorization: Bearer {token}
Content-Type: application/json

{
  "postId": "clx123abc",
  "decision": "approve_at_current_level",
  "decisionReason": "理由を10文字以上で記載",
  "currentScore": 250,
  "targetScore": 300,
  "agendaLevel": "FACILITY_AGENDA",
  "proposalType": "improvement",
  "department": "内科"
}
```

**リクエストボディ**:
| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|-----|------|--------------|
| `postId` | string | ✅ | 提案ID | - |
| `decision` | string | ✅ | 判断内容 | approve_at_current_level / downgrade / reject |
| `decisionReason` | string | ✅ | 判断理由 | 10文字以上 |
| `currentScore` | number | ✅ | 現在のスコア | 0以上 |
| `targetScore` | number | ✅ | 目標スコア | 0以上 |
| `agendaLevel` | string | ✅ | 議題レベル | DEPT_AGENDA / FACILITY_AGENDA / CORP_AGENDA |
| `proposalType` | string | - | 提案タイプ | - |
| `department` | string | - | 部署 | - |

**レスポンス**:
```typescript
{
  success: true,
  message: "判断を記録しました"
}
```

**ステータスコード**:
- `200`: 成功
- `400`: バリデーションエラー
- `401`: 認証エラー
- `404`: 提案が見つからない
- `500`: サーバーエラー

**実装ファイル**: `src/pages/api/agenda/expired-escalation-decisions.ts`

---

## 🎨 フロントエンド仕様

### ページ: ExpiredEscalationProposalsPage

**ファイルパス**: `src/pages/ExpiredEscalationProposalsPage.tsx`

**実装状態**: ✅ **完全実装済み**

**主要機能**:
1. 期限到達提案一覧表示
2. 期限超過日数表示
3. スコア達成率表示
4. 判断モーダル表示

---

### コンポーネント: ExpiredEscalationDecisionModal

**ファイルパス**: `src/components/agenda-mode/ExpiredEscalationDecisionModal.tsx`

**実装状態**: ✅ **完全実装済み**

**主要機能**:
1. 提案情報表示
2. スコア情報表示
3. 判断選択（3つのオプション）
4. 判断理由入力
5. バリデーション

---

## ✅ 実装チェックリスト

### データベース
- [x] Post テーブル実装済み
- [x] ExpiredEscalationDecision テーブル実装済み
- [x] User テーブル実装済み
- [x] PostStatus Enum実装済み

**結論**: ✅ **変更不要**

---

### API
- [ ] `GET /api/agenda/expired-escalation-proposals` 実装
- [ ] `POST /api/agenda/expired-escalation-decisions` 実装

**結論**: ⚠️ **2つのAPIエンドポイント実装が必要**

---

### フロントエンド
- [x] ExpiredEscalationProposalsPage 実装済み
- [x] ExpiredEscalationDecisionModal 実装済み

**結論**: ✅ **変更不要**

---

## 🎯 次のステップ

### Phase 1: API実装（1-2時間）
1. `GET /api/agenda/expired-escalation-proposals` 実装
2. `POST /api/agenda/expired-escalation-decisions` 実装
3. 認証ミドルウェア統合

### Phase 2: テスト（30分-1時間）
1. API統合テスト
2. E2Eテスト

### Phase 3: 本番デプロイ（30分）
1. 動作確認
2. 本番デプロイ

---

**文書終了**

最終更新: 2025年10月21日
バージョン: 1.0
