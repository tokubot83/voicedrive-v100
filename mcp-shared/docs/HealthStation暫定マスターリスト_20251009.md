# 健康ステーション 暫定マスターリスト
**作成日**: 2025年10月9日
**対象**: 医療職員管理システムチーム
**目的**: 健康ステーション実装のための医療システム連携不要確認

---

## 📊 概要サマリー

| 項目 | 内容 |
|------|------|
| **医療システム必要工数** | **0日** |
| **医療システム見積金額** | **¥0** |
| **VoiceDrive工数** | 21日 |
| **実装期間** | 3週間 |
| **連携方式** | **ファイルベース（JSON配置のみ）** |

### 重要ポイント

✅ **医療システム側の開発は不要です**
- API開発不要
- Webhook実装不要
- JSONファイルを所定フォルダに配置するだけ

✅ **ファイルベースの一方向連携**
- 医療システム → VoiceDrive（受信のみ）
- VoiceDrive → 医療システム（通知なし）

✅ **自動処理**
- VoiceDriveが5秒間隔で自動監視
- 新規ファイルを自動検知・処理
- 優先度判定・アクション実行を自動化

---

## 🔌 連携方式

### ファイル配置場所

```
c:\projects\voicedrive-v100\mcp-shared\notifications\
```

### ファイル命名規則

```
health_notif_{employeeId}_{timestamp}.json
```

**例**:
```
health_notif_OH-NS-2024-001_20251009143000.json
health_notif_OH-NS-2024-002_20251009150000.json
```

### ファイル形式（JSON）

#### 通知タイプ1: 健康リスク評価（health_risk_assessment）

```json
{
  "type": "health_risk_assessment",
  "staffId": "OH-NS-2024-001",
  "timestamp": "2025-10-09T14:30:00Z",
  "assessment": {
    "overallScore": 65,
    "overallLevel": "medium",
    "highRiskCategories": [
      {
        "category": "代謝リスク",
        "score": 55,
        "level": "high"
      },
      {
        "category": "心血管リスク",
        "score": 72,
        "level": "medium"
      }
    ],
    "priorityActions": [
      "食事改善指導を受けてください",
      "運動習慣の見直しを行ってください",
      "3ヶ月後に再評価が必要です"
    ],
    "nextCheckup": "2026-04-09T00:00:00Z"
  },
  "recommendations": {
    "lifestyle": [
      "規則正しい生活習慣を心がける",
      "十分な睡眠時間を確保する"
    ],
    "diet": [
      "塩分控えめの食事",
      "野菜を多く摂取",
      "間食を控える"
    ],
    "exercise": [
      "週3回30分の有酸素運動",
      "階段を使う習慣をつける"
    ],
    "medicalFollowUp": [
      "3ヶ月後に再検査",
      "保健師面談を受ける"
    ]
  },
  "metadata": {
    "source": "staff-medical-system",
    "version": "1.0.0",
    "priority": "medium"
  }
}
```

#### 通知タイプ2: 健診結果（health_checkup_result）

```json
{
  "type": "health_checkup_result",
  "staffId": "OH-NS-2024-002",
  "timestamp": "2025-10-09T15:00:00Z",
  "assessment": {
    "overallScore": 88,
    "overallLevel": "low",
    "highRiskCategories": [],
    "priorityActions": [],
    "nextCheckup": "2026-10-01T00:00:00Z"
  },
  "recommendations": {
    "lifestyle": ["現状の健康習慣を維持してください"],
    "diet": ["バランスの良い食事を継続"],
    "exercise": ["適度な運動を継続"],
    "medicalFollowUp": ["次回定期健診まで経過観察"]
  },
  "metadata": {
    "source": "staff-medical-system",
    "version": "1.0.0",
    "priority": "low"
  }
}
```

#### 通知タイプ3: ストレスチェック結果（stress_check_result）

```json
{
  "type": "stress_check_result",
  "staffId": "OH-NS-2024-003",
  "timestamp": "2025-10-09T16:00:00Z",
  "assessment": {
    "overallScore": 52,
    "overallLevel": "high",
    "highRiskCategories": [
      {
        "category": "仕事の負担",
        "score": 45,
        "level": "high"
      },
      {
        "category": "対人関係のストレス",
        "score": 58,
        "level": "medium"
      }
    ],
    "priorityActions": [
      "産業医面談を受けてください",
      "ストレス軽減策を実施してください"
    ],
    "nextCheckup": "2026-04-01T00:00:00Z"
  },
  "recommendations": {
    "lifestyle": [
      "休息を十分にとる",
      "趣味の時間を確保する"
    ],
    "diet": [
      "栄養バランスの良い食事"
    ],
    "exercise": [
      "軽い運動でリフレッシュ"
    ],
    "medicalFollowUp": [
      "1ヶ月以内に産業医面談",
      "3ヶ月後にストレスチェック再実施"
    ]
  },
  "metadata": {
    "source": "staff-medical-system",
    "version": "1.0.0",
    "priority": "high"
  }
}
```

#### 通知タイプ4: 要再検査（reexamination_required）

```json
{
  "type": "reexamination_required",
  "staffId": "OH-NS-2024-004",
  "timestamp": "2025-10-09T17:00:00Z",
  "assessment": {
    "overallScore": 35,
    "overallLevel": "very-high",
    "highRiskCategories": [
      {
        "category": "心血管リスク",
        "score": 28,
        "level": "very-high"
      },
      {
        "category": "脂質異常",
        "score": 38,
        "level": "very-high"
      }
    ],
    "priorityActions": [
      "至急、循環器内科を受診してください",
      "産業医面談を予約してください",
      "精密検査を2週間以内に受けてください"
    ],
    "nextCheckup": "2025-10-20T00:00:00Z"
  },
  "recommendations": {
    "lifestyle": [
      "禁煙を強く推奨",
      "ストレス管理を徹底"
    ],
    "diet": [
      "減塩食を徹底",
      "コレステロールを控える"
    ],
    "exercise": [
      "医師の指導のもとで運動"
    ],
    "medicalFollowUp": [
      "2週間以内に精密検査",
      "循環器内科専門医を受診",
      "投薬治療の検討"
    ]
  },
  "metadata": {
    "source": "staff-medical-system",
    "version": "1.0.0",
    "priority": "urgent"
  }
}
```

---

## 📋 データ項目定義

### 必須項目

| 項目名 | 型 | 説明 | 例 |
|--------|------|------|------|
| `type` | string | 通知タイプ | `"health_risk_assessment"` |
| `staffId` | string | 職員ID | `"OH-NS-2024-001"` |
| `timestamp` | string (ISO 8601) | 通知日時 | `"2025-10-09T14:30:00Z"` |
| `metadata.source` | string | 送信元システム | `"staff-medical-system"` |
| `metadata.version` | string | バージョン | `"1.0.0"` |
| `metadata.priority` | string | 優先度 | `"urgent"` / `"high"` / `"medium"` / `"low"` |

### 健康評価項目（assessment）

| 項目名 | 型 | 説明 | 例 |
|--------|------|------|------|
| `overallScore` | number | 総合健康スコア（0-100） | `65` |
| `overallLevel` | string | 総合リスクレベル | `"very-high"` / `"high"` / `"medium"` / `"low"` |
| `highRiskCategories` | array | 高リスクカテゴリー一覧 | `[{category, score, level}]` |
| `priorityActions` | array | 優先対応事項（文字列配列） | `["食事改善指導を受けてください"]` |
| `nextCheckup` | string (ISO 8601) | 次回検診推奨日 | `"2026-04-09T00:00:00Z"` |

### 推奨事項（recommendations）

| 項目名 | 型 | 説明 |
|--------|------|------|
| `lifestyle` | array | 生活習慣改善提案（文字列配列） |
| `diet` | array | 食事改善提案（文字列配列） |
| `exercise` | array | 運動改善提案（文字列配列） |
| `medicalFollowUp` | array | 医療フォローアップ提案（文字列配列） |

---

## 🎯 リスクレベルと優先度

### リスクレベル（overallLevel）

| レベル | スコア範囲 | 説明 | 推奨対応 |
|--------|-----------|------|----------|
| `very-high` | 0-39点 | 要緊急対応 | 即座に医療機関受診・産業医面談 |
| `high` | 40-59点 | 要注意 | 1週間以内に保健指導・面談 |
| `medium` | 60-79点 | 経過観察 | 3ヶ月後フォローアップ |
| `low` | 80-100点 | 良好 | 次回定期健診まで経過観察 |

### 優先度（metadata.priority）

| 優先度 | 対応時間 | VoiceDrive側の自動アクション |
|--------|----------|------------------------------|
| `urgent` | 即座 | ・管理者への緊急通知<br>・緊急対応フロー起動<br>・職員の健康状態即座確認 |
| `high` | 24時間以内 | ・担当者への高優先度通知<br>・24時間以内の対応計画作成<br>・フォローアップスケジュール設定 |
| `medium` | 1週間以内 | ・週次レポートに含める<br>・定期フォロー対象に追加 |
| `low` | 1ヶ月以内 | ・月次レポートに記録<br>・経過観察対象に追加 |

---

## 🔄 処理フロー

### 医療システム側の作業（簡単！）

1. **健康データ評価**
   - 職員の健康データを評価
   - リスクレベル判定
   - 推奨事項生成

2. **JSONファイル作成**
   - 上記のJSON形式でファイルを作成
   - ファイル名: `health_notif_{employeeId}_{timestamp}.json`

3. **ファイル配置**
   - `c:\projects\voicedrive-v100\mcp-shared\notifications\` に配置
   - **これだけで完了！**

### VoiceDrive側の自動処理

1. **ファイル監視**（5秒ポーリング）
   - 新規ファイルを自動検知

2. **ファイル安定性確認**
   - 書き込み完了を確認（3回連続でサイズ不変）

3. **JSONパース**
   - ファイル内容を読み込み

4. **優先度判定**
   - `metadata.priority` または `assessment.overallLevel` から判定

5. **アクション実行**
   - 優先度に応じた自動処理

6. **データベース保存**
   - HealthNotificationテーブルに保存

7. **HealthStation表示**
   - 職員が自身の健康データを確認可能

---

## 📅 実装スケジュール

### Phase 1: 基本通知受信（1週間）

| 日程 | 作業内容 | 担当 |
|------|----------|------|
| Day 1 | テーブル設計・マイグレーション | VoiceDrive |
| Day 2-3 | ファイル監視・通知処理実装 | VoiceDrive |
| Day 4-5 | HealthStation UI統合 | VoiceDrive |
| Day 6-7 | テスト・デバッグ | VoiceDrive |

**医療システム作業**: なし

### Phase 2: 既読管理・統計（1週間）

| 日程 | 作業内容 | 担当 |
|------|----------|------|
| Day 8-9 | 既読管理API実装 | VoiceDrive |
| Day 10 | 統計API実装 | VoiceDrive |
| Day 11-12 | フィルタリング機能実装 | VoiceDrive |
| Day 13-14 | HealthStation UI改善 | VoiceDrive |

**医療システム作業**: なし

### Phase 3: レポート機能（1週間）

| 日程 | 作業内容 | 担当 |
|------|----------|------|
| Day 15-16 | レポート生成ロジック実装 | VoiceDrive |
| Day 17 | レポートAPI実装 | VoiceDrive |
| Day 18-19 | レポートUI実装 | VoiceDrive |
| Day 20 | PDF/Markdown出力機能 | VoiceDrive |
| Day 21 | 統合テスト | VoiceDrive |

**医療システム作業**: なし

---

## ✅ 確認事項（医療システムチームへ）

### 技術的確認

1. **ファイル配置方式**
   - `c:\projects\voicedrive-v100\mcp-shared\notifications\` フォルダへのファイル配置方式で問題ありませんか？

2. **ファイル命名規則**
   - `health_notif_{employeeId}_{timestamp}.json` の形式で問題ありませんか？

3. **通知タイプ**
   - 4種類の通知タイプ（health_risk_assessment, health_checkup_result, stress_check_result, reexamination_required）で十分ですか？

4. **リスクレベル判定**
   - 医療システム側でリスクレベル判定（overallScore, overallLevel）を行い、VoiceDriveは受信するだけで問題ありませんか？

5. **健康診断データ**
   - 検査値の生データ（BMI、血圧、コレステロール等）はVoiceDriveに保存する必要がありますか？
   - それとも医療システム側で保持し、VoiceDriveには評価結果のみ送信しますか？

### 運用的確認

6. **通知配信頻度**
   - 健康通知はどのくらいの頻度で配信されますか？
   - 選択肢: 日次 / 週次 / 月次 / 随時（イベント発生時）

7. **ファイル削除**
   - 処理済み通知ファイルはVoiceDrive側で削除して良いですか？
   - それとも医療システム側で管理しますか？

8. **通知遅延**
   - ファイル配置からVoiceDriveでの表示まで最大5秒の遅延が発生しますが、問題ありませんか？

9. **緊急通知**
   - `urgent` 優先度の通知の場合、5秒ポーリングでは遅すぎますか？
   - リアルタイム通知（Webhook方式）が必要ですか？

10. **バックアップ**
    - 健康通知データのバックアップ体制はどちら側で管理しますか？

### データ連携確認

11. **職員ID同期**
    - employeeIdは医療システムとVoiceDriveで完全一致していますか？
    - 例: `OH-NS-2024-001` 形式

12. **通知形式変更**
    - 将来的に通知データ形式が変更される可能性はありますか？
    - バージョン管理（metadata.version）で対応可能ですか？

13. **再検査フォロー**
    - 要再検査通知後、職員が再検査を受けたかどうかをVoiceDriveから医療システムに通知する必要はありますか？
    - 必要な場合はWebhook方式の追加実装が必要です（Phase 4）

14. **プライバシー保護**
    - 健康データの保存期間やアクセス権限に関する規定はありますか？
    - VoiceDriveでは以下を想定:
      - 保存期間: 3年
      - アクセス権限: 本人のみ閲覧可能

15. **Webhook移行**
    - 将来的にファイルベースからWebhook方式に移行する予定はありますか？
    - 移行する場合は Phase 4 として別途見積もり（5日・¥400,000）

---

## 💰 コスト概算

| 項目 | 工数 | 単価 | 金額 |
|------|------|------|------|
| **医療システム開発** | **0日** | ¥80,000/日 | **¥0** |
| **VoiceDrive開発** | 21日 | - | - |
| **合計** | **21日** | - | **¥0** |

### 医療システムチームの作業

✅ **JSON形式でファイルを作成**
- 所要時間: 職員1人あたり数秒
- 自動化推奨: バッチ処理で一括配置

✅ **ファイルを所定フォルダに配置**
- コマンド例:
  ```bash
  copy health_notif_*.json c:\projects\voicedrive-v100\mcp-shared\notifications\
  ```

✅ **終了！**

---

## 📞 連絡先

### VoiceDriveチーム
- Slack: #health-station
- 技術的な質問: プロジェクトリードまで

### 医療システムチーム連携窓口
- MCPサーバー経由での情報共有
- 確認事項への回答期限: 2025年10月15日

---

## 📚 参考資料

### 関連ドキュメント
- [HealthStation_DB要件分析_20251009.md](./HealthStation_DB要件分析_20251009.md) - 詳細な技術仕様
- [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) - データ管理責任の明確化

### 技術スタック
- **VoiceDrive**: TypeScript, Prisma, SQLite
- **ファイル監視**: fs (Node.js標準モジュール)
- **ポーリング間隔**: 5秒
- **ファイル形式**: JSON (UTF-8)

---

**最終更新**: 2025年10月9日
**作成者**: Claude (AI Assistant)
**レビュー**: VoiceDrive開発チーム
**承認待ち**: 医療職員管理システムチーム
