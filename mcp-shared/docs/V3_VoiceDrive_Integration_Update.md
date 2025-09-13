# V3評価システム VoiceDrive連携機能更新通知

**作成日**: 2025-08-20  
**送信者**: 医療職員管理システム（Claude Code）  
**宛先**: VoiceDriveチーム  

## 🚀 重要更新: V3評価システムでのVoiceDrive連携実装完了

### 📋 実装概要

V3評価システム（100点満点システム）において、VoiceDrive連携機能を新規実装しました。V2システムから機能を移植・拡張し、V3の評価構造に完全対応させています。

### 🔧 技術的変更点

#### 1. 新しいAPI エンドポイント
```
V2: /api/v1/appeals/voicedrive-notify
V3: /api/v3/appeals/voicedrive-notify (新規)

V2: /api/v1/evaluation/disclosure-notify  
V3: /api/v3/evaluation/disclosure-notify (新規)
```

#### 2. データ構造の変更（重要）

**V2評価構造**:
```json
{
  "totalScore": 75,
  "grade": "B",
  "technicalScore": 40,
  "contributionScore": 35
}
```

**V3評価構造（新）**:
```json
{
  "scores": {
    "technical": {
      "coreItems": 25,        // 法人統一項目
      "facilityItems": 20,    // 施設固有項目  
      "total": 45
    },
    "contribution": {
      "summerFacility": 12.5, // 夏季施設貢献
      "summerCorporate": 10.0,// 夏季法人貢献
      "winterFacility": 11.0, // 冬季施設貢献
      "winterCorporate": 12.0,// 冬季法人貢献
      "total": 45.5
    },
    "totalScore": 90.5
  },
  "relativeEvaluation": {
    "facilityGrade": "A",     // 施設内グレード
    "corporateGrade": "B",    // 法人内グレード
    "finalGrade": "A"         // 2軸マトリックス最終グレード（S+,S,A+,A,B,C,D）
  }
}
```

#### 3. 評価フェーズ対応
```json
{
  "evaluationPhase": "summer|winter|final",
  "evaluationTiming": {
    "summer": "6月（組織貢献25点）",
    "winter": "12月（組織貢献50点）", 
    "final": "3月（技術50点+組織貢献50点=100点）"
  }
}
```

### 📱 VoiceDrive通知の拡張機能

#### 1. 詳細スコア構造通知
- 技術評価の内訳（法人統一25点+施設固有25点）
- 組織貢献度の詳細（夏季・冬季各25点の内訳）
- 相対評価ランキング情報

#### 2. 異議申し立て対応強化
```json
{
  "appealType": "relative-evaluation-error",  // V3専用: 相対評価異議
  "disputeDetails": {
    "facilityRankingDispute": true,    // 施設内順位異議
    "corporateRankingDispute": false,  // 法人内順位異議  
    "jobCategoryRankingDispute": true  // 同職種内順位異議
  }
}
```

### 🎯 VoiceDriveチームへの依頼事項

#### 1. API対応確認
- [ ] V3専用エンドポイント(`/api/v3/*`)への対応準備
- [ ] 新しいデータ構造での通知処理確認
- [ ] エラーハンドリングの動作確認

#### 2. UI表示対応
- [ ] 100点満点システム表示対応
- [ ] 詳細スコア内訳の表示機能
- [ ] 7段階グレード（S+〜D）の表示対応
- [ ] 評価フェーズ別表示（夏季・冬季・最終）

#### 3. 会話ID管理
V3システムでは新しい会話ID形式を使用：
```
V2: vd_conv_12345
V3: v3_conv_20250820_12345 (新形式)
```

### 📊 移行スケジュール

```
現在: V2とV3併存（V3デフォルト使用）
今後: V2削除予定（V3のみ）
```

### 🔍 テスト用サンプルデータ

#### 評価開示通知サンプル
```json
{
  "staffName": "田中 花子",
  "evaluationPeriod": "2025年度上期", 
  "evaluationPhase": "final",
  "scores": {
    "technical": { "total": 42 },
    "contribution": { "total": 38 },
    "totalScore": 80
  },
  "relativeEvaluation": {
    "facilityGrade": "A",
    "corporateGrade": "B", 
    "finalGrade": "A"
  },
  "voiceDriveConfig": {
    "includeScoreBreakdown": true,
    "includeRelativeRanking": true,
    "enableReplies": true
  }
}
```

#### 異議申し立て通知サンプル
```json
{
  "appealId": "V3AP001",
  "staffName": "山田 太郎",
  "appealCategory": "relative-evaluation-error",
  "originalScores": { "totalScore": 45 },
  "requestedScores": { "totalScore": 52 },
  "disputeDetails": {
    "facilityRankingDispute": true,
    "reason": "冬季組織貢献度の施設内相対評価順位に誤りがある"
  }
}
```

### 🤝 連携確認項目

VoiceDriveチームでの確認をお願いします：

1. **既存機能への影響**: V2システムとの併存中の動作
2. **新機能対応**: V3専用データ構造の処理
3. **エラー処理**: V3 APIエラー時の適切な表示
4. **UI調整**: 100点満点システム用のインターフェース

### 📞 連絡先・質問

技術的な質問や調整が必要な場合は、mcp-shared フォルダ経由でお知らせください。

---

**次回確認推奨日**: 2025-08-22（実装から2日後）  
**本格運用開始予定**: 2025-08-25

*この通知は自動生成されました。詳細な技術仕様は本文書および関連するV3コンポーネントコードをご参照ください。*