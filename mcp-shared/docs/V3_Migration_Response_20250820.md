# V3評価システム移行完了 - 統合テスト更新依頼

**作成日**: 2025年8月20日  
**送信者**: 医療職員管理システムチーム  
**宛先**: VoiceDriveチーム  
**返信先**: integration-test-report-20250820.md

## 🚨 重要通知: V2からV3への完全移行完了

VoiceDriveチームの統合テスト報告書を確認いたしました。**重要な変更をお知らせします**：

### ⚠️ V2システム廃止のお知らせ
- **V2評価システム**: 本日をもって廃止予定
- **V1 API（/api/v1/\*）**: 削除予定
- **今後の開発**: V3システムのみ対応

## 🔄 V3システムへの移行指示

### 1. APIエンドポイント変更（必須）

**❌ 廃止予定（テストで使用されていたもの）:**
```
GET /api/v1/evaluation/periods
POST /api/v1/appeal
```

**✅ 新規対応必須:**
```
GET /api/v3/evaluation/periods
POST /api/v3/appeals/submit
POST /api/v3/appeals/voicedrive-notify
PATCH /api/v3/appeals/cases/{id}/status
```

### 2. データ構造の大幅変更

**V2構造（廃止）:**
```json
{
  "totalScore": 75,
  "grade": "B",
  "reason": "技術評価の一部項目について再考を希望"
}
```

**V3構造（必須対応）:**
```json
{
  "appealId": "V3AP001",
  "originalScores": {
    "technical": {
      "coreItems": 25,      // 法人統一項目
      "facilityItems": 20,  // 施設固有項目
      "total": 45
    },
    "contribution": {
      "summerFacility": 12.5,
      "summerCorporate": 10.0,
      "winterFacility": 11.0, 
      "winterCorporate": 12.0,
      "total": 45.5
    },
    "totalScore": 90.5
  },
  "relativeEvaluation": {
    "facilityGrade": "A",
    "corporateGrade": "B", 
    "finalGrade": "A"       // S+,S,A+,A,B,C,D
  },
  "evaluationPhase": "final", // summer|winter|final
  "appealReason": "冬季組織貢献度の施設内相対評価順位に誤りがある",
  "relativeEvaluationDispute": {
    "facilityRankingDispute": true,
    "corporateRankingDispute": false,
    "jobCategoryRankingDispute": true
  }
}
```

## 🛠️ 統合テスト更新項目

### 必須実装（HIGH）

#### 1. V3 API実装
```javascript
// 異議申し立て送信（V3対応）
const submitV3Appeal = async (appealData) => {
  const response = await fetch('/api/v3/appeals/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...appealData,
      evaluationSystem: 'v3',
      includeScoreBreakdown: true,
      includeRelativeRanking: true
    })
  });
  return response.json();
};

// VoiceDrive通知（V3専用機能）
const sendV3VoiceDriveNotification = async (appealIds, message) => {
  const response = await fetch('/api/v3/appeals/voicedrive-notify', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appealIds,
      message,
      evaluationSystem: 'v3',
      includeScoreBreakdown: true,
      includeRelativeRanking: true
    })
  });
  return response.json();
};
```

#### 2. UI表示更新
- **100点満点表示**: 技術50点+組織貢献50点
- **詳細スコア表示**: 法人統一・施設固有・夏季・冬季の内訳
- **7段階グレード**: S+, S, A+, A, B, C, D
- **評価フェーズ表示**: 夏季（6月）・冬季（12月）・最終（3月）

#### 3. 相対評価異議対応（V3新機能）
```javascript
const relativeEvaluationDispute = {
  facilityRankingDispute: boolean,   // 施設内順位異議
  corporateRankingDispute: boolean,  // 法人内順位異議
  jobCategoryRankingDispute: boolean // 同職種内順位異議
};
```

### 推奨実装（MEDIUM）

#### 4. V3専用バリデーション
```javascript
const validateV3Appeal = (appealData) => {
  // 100点満点システム検証
  const totalScore = appealData.originalScores.technical.total + 
                    appealData.originalScores.contribution.total;
  
  if (totalScore !== appealData.originalScores.totalScore) {
    throw new Error('V3評価スコア合計が一致しません');
  }
  
  // 相対評価フェーズ検証
  if (!['summer', 'winter', 'final'].includes(appealData.evaluationPhase)) {
    throw new Error('V3評価フェーズが無効です');
  }
};
```

## 📋 V3統合テストケース（更新版）

### 1. 基本機能テスト
```
✅ V3評価期間マスタ取得: GET /api/v3/evaluation/periods
✅ V3異議申し立て送信: POST /api/v3/appeals/submit
✅ V3ケース管理: GET /api/v3/appeals/cases
✅ V3ステータス更新: PATCH /api/v3/appeals/cases/{id}/status
```

### 2. VoiceDrive連携テスト
```
✅ V3通知送信: POST /api/v3/appeals/voicedrive-notify
✅ V3詳細スコア通知: includeScoreBreakdown=true
✅ V3相対評価通知: includeRelativeRanking=true
✅ V3会話ID管理: v3_conv_20250820_{id}
```

### 3. V3専用機能テスト
```
✅ 100点満点計算: technical(50) + contribution(50) = total(100)
✅ 7段階グレード判定: S+ > S > A+ > A > B > C > D
✅ 相対評価異議: 施設内・法人内・同職種内の個別異議
✅ 評価フェーズ対応: summer/winter/final
```

## 🎯 次回統合テスト条件

### 前提条件
- [ ] V3 API実装完了（VoiceDrive側）
- [ ] V3データ構造対応（UI・バリデーション）
- [ ] V2システム完全除外
- [ ] V3専用機能実装

### 成功目標
- **成功率**: 90%以上（V3システム）
- **パフォーマンス**: V2比較で30%向上
- **ユーザビリティ**: 詳細情報表示対応

## 🔧 技術サポート

### 実装支援
- **V3API仕様書**: `mcp-shared/docs/V3_VoiceDrive_Integration_Update.md`
- **サンプルコード**: V3評価システム実装例提供可能
- **テストデータ**: V3形式のモックデータ提供可能

### 質疑応答
MCPサーバー共有経由で技術的な質問にお答えします。

## ⏰ スケジュール

### 即座対応（今日中）
- V2システムテストの停止
- V3システム仕様の確認・理解

### 1-2日以内
- V3 API実装開始
- V3 UI対応開始

### 3-5日以内
- V3統合テスト実施
- 本番環境展開準備

---

**V3評価システムへの完全移行にご協力をお願いいたします。**  
**V2システムは廃止予定のため、V3対応が必須となります。**

**医療職員管理システムチーム**  
*2025年8月20日*