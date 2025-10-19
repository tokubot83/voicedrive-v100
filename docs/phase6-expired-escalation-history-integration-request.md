# Phase 6 期限到達判断履歴機能 - 実装依頼書

**作成日**: 2025年8月10日
**依頼元**: VoiceDriveチーム
**依頼先**: 医療職員カルテシステムチーム
**連携方式**: MCPサーバー経由

---

## 📋 概要

VoiceDrive議題モードのPhase 6として、期限到達した提案の判断履歴を表示する機能を実装しました。
この機能では、職員カルテシステムに蓄積された判断履歴データをMCPサーバー経由で取得し、
ユーザーの権限レベルに応じた適切な範囲のデータを表示します。

## 🎯 目的

1. **透明性の向上**: 期限到達した提案がどのように判断されたかを可視化
2. **判断品質の向上**: 過去の判断履歴から学び、より良い意思決定を支援
3. **説明責任の強化**: 判断理由と判断者を記録し、プロセスの透明性を確保
4. **統計分析の実現**: 判断傾向を分析し、組織の意思決定プロセスを改善

## 📊 機能仕様

### 表示内容

VoiceDrive側で実装済みの表示項目：

#### サマリー統計
- 総判断件数
- 承認件数・承認率
- ダウングレード件数・比率
- 不採用件数・比率
- 平均判断日数（期限到達から判断までの日数）
- 平均到達率（目標スコアに対する達成率）

#### 判断履歴一覧（各アイテム）
- 投稿ID
- 投稿内容
- 提案タイプ
- 議題レベル（DEPT_AGENDA, DEPT_REVIEW, FACILITY_AGENDA等）
- 現在スコア
- 目標スコア
- 到達率（%）
- 期限超過日数
- 判断結果（承認/ダウングレード/不採用）
- 判断者ID
- 判断者名
- 判断者権限レベル
- 判断理由
- 判断日時
- 所属部署
- 施設ID
- 作成日時

### 権限レベル別の表示範囲

| 権限レベル | 表示範囲 | 対象ユーザー |
|-----------|---------|-------------|
| LEVEL_1-4 | 自分が提案した案件の履歴 | 一般職員 |
| LEVEL_5-6 | 自分が判断した案件の履歴 + チーム統計 | 副主任・主任 |
| LEVEL_7-8 | 所属部署全体の判断履歴と統計 | 副師長・師長、副課長・課長 |
| LEVEL_9-13 | 施設全体の判断履歴と統計 | 副部長〜院長 |
| LEVEL_14-18 | 法人全体の判断履歴と統計 | 人事部門、組織開発、理事長 |
| LEVEL_99 | 全データ（システム管理用） | システム管理者 |

## 🔌 API仕様

### エンドポイント

```
GET /api/mcp/expired-escalation-history
```

### リクエストパラメータ

```typescript
interface ExpiredEscalationHistoryRequest {
  userId: string;              // リクエストユーザーID
  permissionLevel: number;     // ユーザーの権限レベル（1-18, 99）
  facilityId?: string;         // 施設ID（LEVEL_9-13の場合）
  departmentId?: string;       // 部署ID（LEVEL_7-8の場合）
  startDate?: string;          // 集計開始日（YYYY-MM-DD）デフォルト: 30日前
  endDate?: string;            // 集計終了日（YYYY-MM-DD）デフォルト: 本日
  limit?: number;              // 取得件数上限（デフォルト: 100）
  offset?: number;             // オフセット（ページネーション用）
}
```

### レスポンス形式

```typescript
interface ExpiredEscalationHistoryResponse {
  success: boolean;
  data: {
    period: {
      startDate: string;       // 集計期間開始日
      endDate: string;         // 集計期間終了日
    };
    summary: {
      totalCount: number;                  // 総判断件数
      approvedCount: number;               // 承認件数
      downgradedCount: number;             // ダウングレード件数
      rejectedCount: number;               // 不採用件数
      approvalRate: number;                // 承認率（%）
      averageDaysToDecision: number;       // 平均判断日数
      averageAchievementRate: number;      // 平均到達率（%）
    };
    items: ExpiredEscalationHistoryItem[];
    pagination: {
      total: number;           // 総件数
      limit: number;           // ページサイズ
      offset: number;          // 現在のオフセット
      hasMore: boolean;        // 次ページの有無
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

interface ExpiredEscalationHistoryItem {
  id: string;                              // 判断履歴ID
  postId: string;                          // 投稿ID
  postContent: string;                     // 投稿内容（要約）
  proposalType: string;                    // 提案タイプ
  agendaLevel: string;                     // 議題レベル
  currentScore: number;                    // 期限到達時のスコア
  targetScore: number;                     // 目標スコア
  achievementRate: number;                 // 到達率（%）
  daysOverdue: number;                     // 期限超過日数
  decision: 'approve_at_current_level' | 'downgrade' | 'reject';  // 判断結果
  deciderId: string;                       // 判断者ID
  deciderName: string;                     // 判断者名
  deciderLevel: number;                    // 判断者権限レベル
  decisionReason: string;                  // 判断理由
  decisionAt: string;                      // 判断日時（ISO 8601）
  department: string;                      // 所属部署名
  facilityId: string;                      // 施設ID
  createdAt: string;                       // 作成日時（ISO 8601）
}
```

### エラーレスポンス

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // エラーコード
    message: string;           // エラーメッセージ
    details?: any;             // 詳細情報（任意）
  };
}
```

#### エラーコード一覧

| コード | 説明 |
|-------|------|
| `UNAUTHORIZED` | 認証エラー |
| `FORBIDDEN` | 権限不足 |
| `INVALID_PARAMETERS` | パラメータ不正 |
| `NOT_FOUND` | データが見つからない |
| `INTERNAL_ERROR` | サーバーエラー |

## 🔐 セキュリティ要件

### 1. 権限チェック

- リクエストユーザーの権限レベルを厳密にチェック
- 権限範囲外のデータへのアクセスを遮断
- 不正なpermissionLevelパラメータを拒否

### 2. データフィルタリング

権限レベルに応じた自動フィルタリング：

```typescript
// LEVEL_1-4: 自分の提案のみ
WHERE proposer_id = :userId

// LEVEL_5-6: 自分が判断した案件のみ
WHERE decider_id = :userId

// LEVEL_7-8: 所属部署のみ
WHERE department_id = :departmentId

// LEVEL_9-13: 所属施設のみ
WHERE facility_id = :facilityId

// LEVEL_14-18: 法人全体（施設フィルタなし）

// LEVEL_99: 全データ（システム管理用）
```

### 3. 個人情報保護

- 判断者名は職位名のみ表示（フルネームは不要）
- 投稿内容は要約版（100文字以内推奨）
- 機密情報を含む判断理由は権限に応じてマスキング

## 📁 データソース

### 想定されるテーブル構成

職員カルテシステム側で保持すべきデータ：

```sql
-- 期限到達判断履歴テーブル（想定）
CREATE TABLE expired_escalation_decisions (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  post_content TEXT,
  proposal_type VARCHAR(50),
  agenda_level VARCHAR(50),
  current_score INT,
  target_score INT,
  achievement_rate DECIMAL(5,2),
  days_overdue INT,
  decision VARCHAR(50),
  decider_id VARCHAR(36),
  decider_name VARCHAR(100),
  decider_level INT,
  decision_reason TEXT,
  decision_at DATETIME,
  department_id VARCHAR(36),
  facility_id VARCHAR(36),
  created_at DATETIME,
  updated_at DATETIME,
  INDEX idx_decider (decider_id),
  INDEX idx_department (department_id),
  INDEX idx_facility (facility_id),
  INDEX idx_decision_at (decision_at)
);
```

### データ連携フロー

1. **VoiceDrive → MCPサーバー**: 判断履歴取得リクエスト
2. **MCPサーバー → 職員カルテシステム**: データ取得リクエスト
3. **職員カルテシステム**: 権限チェック + データフィルタリング
4. **職員カルテシステム → MCPサーバー**: フィルタ済みデータ返却
5. **MCPサーバー → VoiceDrive**: レスポンス返却

## 🧪 テストケース

### 1. 権限レベル別フィルタリング

```typescript
// LEVEL_5ユーザー（主任）のリクエスト
GET /api/mcp/expired-escalation-history?userId=U123&permissionLevel=5

// 期待結果：U123が判断した案件のみ返却
```

### 2. 部署フィルタリング

```typescript
// LEVEL_7ユーザー（副師長）のリクエスト
GET /api/mcp/expired-escalation-history?userId=U456&permissionLevel=7&departmentId=D789

// 期待結果：D789部署の判断履歴のみ返却
```

### 3. 日付範囲フィルタ

```typescript
// 2025年7月の判断履歴を取得
GET /api/mcp/expired-escalation-history
  ?userId=U789
  &permissionLevel=14
  &startDate=2025-07-01
  &endDate=2025-07-31

// 期待結果：2025年7月の判断履歴のみ返却
```

### 4. ページネーション

```typescript
// 2ページ目（101-200件目）を取得
GET /api/mcp/expired-escalation-history
  ?userId=U999
  &permissionLevel=16
  &limit=100
  &offset=100

// 期待結果：101-200件目のデータ + hasMore: true/false
```

### 5. エラーハンドリング

```typescript
// 権限不足のケース
GET /api/mcp/expired-escalation-history?userId=U111&permissionLevel=3

// 期待結果：
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "この機能はLEVEL_5以上で利用可能です"
  }
}
```

## 📝 実装サンプル（参考）

### VoiceDrive側の実装（完了済み）

```typescript
// src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx

useEffect(() => {
  const fetchHistoryData = async () => {
    try {
      // TODO: MCPサーバー経由でデータ取得
      const response = await fetch('/api/mcp/expired-escalation-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          userId: user.id,
          permissionLevel: user.permissionLevel,
          facilityId: user.facilityId,
          departmentId: user.departmentId
        }
      });

      const data = await response.json();

      if (data.success) {
        setHistoryData(data.data);
      } else {
        // エラーハンドリング
        console.error('Failed to fetch history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchHistoryData();
}, [user]);
```

### MCPサーバー側の実装イメージ

```typescript
// mcp-integration-server/routes/expired-escalation-history.ts

router.get('/expired-escalation-history', async (req, res) => {
  const { userId, permissionLevel, facilityId, departmentId, startDate, endDate } = req.query;

  try {
    // 職員カルテシステムへのリクエスト
    const response = await axios.get(
      `${MEDICAL_SYSTEM_BASE_URL}/api/expired-escalation-history`,
      {
        params: {
          userId,
          permissionLevel,
          facilityId,
          departmentId,
          startDate,
          endDate
        },
        headers: {
          'Authorization': `Bearer ${MEDICAL_SYSTEM_API_KEY}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});
```

## 📅 スケジュール

### マイルストーン

| フェーズ | 内容 | 期限 |
|---------|------|------|
| Phase 1 | API仕様レビュー・承認 | 8/12（月） |
| Phase 2 | 職員カルテシステム側API実装 | 8/16（金） |
| Phase 3 | MCPサーバー連携実装 | 8/19（月） |
| Phase 4 | 統合テスト | 8/23（金） |
| Phase 5 | 本番リリース | 8/26（月） |

## 🔍 確認事項

### 職員カルテシステムチームへの質問

1. **データ保持状況**
   - 期限到達判断履歴は現在どのテーブルに保存されていますか？
   - 過去何ヶ月分のデータが参照可能ですか？

2. **パフォーマンス**
   - 大量データ（10,000件以上）の取得時のパフォーマンス見込みは？
   - インデックス最適化は必要ですか？

3. **セキュリティ**
   - 追加の認証・認可機構は必要ですか？
   - データマスキングのルールは明確ですか？

4. **API実装方式**
   - REST APIで問題ないですか？（GraphQL等の希望はありますか？）
   - レスポンスタイム目標値は？（推奨: 500ms以内）

## 📞 連絡先

**VoiceDriveチーム**
- Slack: #phase6-integration
- 技術担当: プロジェクトリード

**医療職員カルテシステムチーム**
- Slack: #medical-system-api
- API担当: （担当者名を記入）

---

## 📎 添付資料

1. [Phase 6設計書](./phase6-expired-escalation-workflow.md)
2. [権限レベル定義](./expired-escalation-report-access-levels.md)
3. [モックデータ仕様](../src/data/mockExpiredEscalationHistory.ts)
4. [画面デザイン](../src/components/agenda-mode/ExpiredEscalationHistoryPage.tsx)

---

**最終更新**: 2025年8月10日
**バージョン**: 1.0
**ステータス**: レビュー待ち
