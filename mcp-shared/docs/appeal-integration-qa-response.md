# 異議申し立て機能統合に関する質問への回答

## 作成日: 2025-08-15
## 作成者: 医療職員管理システムチーム
## 宛先: VoiceDriveチーム

---

## 質問への回答

### 1. 評価期間のマスタデータはどこから取得すべきか？

**回答**: 評価期間マスタデータは医療システム側のAPIから取得してください。

#### APIエンドポイント
```
GET /api/v1/evaluation/periods
```

#### レスポンス例
```json
{
  "success": true,
  "periods": [
    {
      "id": "2025-H1",
      "name": "2025年度上期",
      "startDate": "2025-04-01",
      "endDate": "2025-09-30",
      "evaluationStartDate": "2025-09-15",
      "evaluationEndDate": "2025-10-15",
      "disclosureDate": "2025-10-20",
      "appealDeadline": "2025-11-03",  // 開示後2週間
      "status": "active"
    },
    {
      "id": "2024-H2",
      "name": "2024年度下期",
      "startDate": "2024-10-01",
      "endDate": "2025-03-31",
      "evaluationStartDate": "2025-03-15",
      "evaluationEndDate": "2025-04-15",
      "disclosureDate": "2025-04-20",
      "appealDeadline": "2025-05-04",
      "status": "closed"
    }
  ]
}
```

#### 実装方法
```typescript
// VoiceDrive側での実装例
const getEvaluationPeriods = async () => {
  const response = await fetch('http://medical-system/api/v1/evaluation/periods');
  const data = await response.json();
  // appealDeadlineが未来日付のものだけフィルター
  return data.periods.filter(p => new Date(p.appealDeadline) > new Date());
};
```

### 2. 審査者の割り当てロジックは医療システム側で実装済みか？

**回答**: 部分的に実装済みです。自動割り当てと手動割り当ての両方をサポートします。

#### 自動割り当てロジック（実装済み）
```typescript
// src/services/appealAssignmentService.ts
export class AppealAssignmentService {
  static async assignReviewer(appeal: AppealRecord): Promise<string> {
    // 優先度による自動割り当て
    const priority = determineAppealPriority(appeal);
    
    if (priority === 'high') {
      // 高優先度：部門長クラスに割り当て
      return await assignToDepartmentHead(appeal.departmentId);
    } else if (priority === 'medium') {
      // 中優先度：課長クラスに割り当て
      return await assignToSectionChief(appeal.departmentId);
    } else {
      // 低優先度：担当リーダーに割り当て
      return await assignToTeamLeader(appeal.departmentId);
    }
  }
}
```

#### 手動割り当てAPI
```
PUT /api/v1/appeals/{appealId}/assign
{
  "reviewerId": "R001",
  "reviewerName": "審査担当者名",
  "reviewerRole": "department_head"
}
```

### 3. 緊急度の判定基準に追加要件はあるか？

**回答**: 以下の判定基準を適用してください。

#### 優先度判定ルール

##### 🔴 高優先度（High）
- スコア差が10点以上
- カテゴリーが「calculation_error」（計算誤り）
- 管理職（課長以上）からの申し立て
- 期限まで3営業日以内
- 前回却下された再申し立て

##### 🟡 中優先度（Medium）
- スコア差が5～9点
- カテゴリーが「achievement_oversight」（成果見落とし）
- 中堅職員（経験5年以上）からの申し立て
- 複数の証拠書類添付あり

##### 🟢 低優先度（Low）
- スコア差が5点未満
- カテゴリーが「other」（その他）
- 初回の申し立て
- 証拠書類なし

#### 実装コード例
```typescript
function determineAppealPriority(request: AppealRequest): 'high' | 'medium' | 'low' {
  // 計算誤りは最優先
  if (request.appealCategory === 'calculation_error') {
    return 'high';
  }
  
  // スコア差による判定
  if (request.originalScore && request.requestedScore) {
    const diff = request.requestedScore - request.originalScore;
    if (diff >= 10) return 'high';
    if (diff >= 5) return 'medium';
  }
  
  // 成果見落としは中優先度
  if (request.appealCategory === 'achievement_oversight') {
    return 'medium';
  }
  
  // 証拠書類がある場合は優先度を上げる
  if (request.evidenceDocuments && request.evidenceDocuments.length > 2) {
    return 'medium';
  }
  
  return 'low';
}
```

---

## 追加情報

### データ同期タイミング
- 評価期間マスタ：1日1回（深夜2時）
- 審査者情報：リアルタイム
- 優先度：申し立て受付時に自動計算

### エラーハンドリング
```typescript
// 評価期間が見つからない場合
if (!evaluationPeriod) {
  throw new Error('E002: 有効な評価期間が見つかりません');
}

// 審査者割り当て失敗時
if (!assignedReviewer) {
  // フォールバック：デフォルト審査者に割り当て
  assignedReviewer = 'DEFAULT_REVIEWER';
  notifyAdminForManualAssignment(appealId);
}
```

### 統合テスト用データ

#### テスト用評価期間
```json
{
  "id": "TEST-2025",
  "name": "テスト評価期間",
  "appealDeadline": "2025-12-31",
  "status": "active"
}
```

#### テスト用審査者
```json
{
  "reviewerId": "TEST-R001",
  "reviewerName": "テスト審査者",
  "reviewerRole": "test_reviewer",
  "maxCapacity": 10
}
```

---

## 次のステップ

1. **統合テスト実施**（8月20日予定）
   - 両システム結合での動作確認
   - データ同期の確認
   - エラーケースのテスト

2. **本番環境設定**
   - APIエンドポイントURL確定
   - 認証トークン発行
   - CORS設定

3. **運用手順書作成**
   - 障害時の対応フロー
   - データバックアップ手順
   - 監視項目の定義

## 連絡先

技術的な追加質問：
- Slack: #medical-voicedrive-integration
- メール: medical-tech@example.com

---

以上、ご確認をお願いいたします。