# VoiceDrive 投稿管理 暫定マスターリスト
**作成日**: 2025年10月9日
**対象**: 医療職員管理システムチーム
**目的**: 投稿管理（6段階議題化システム・委員会提出フロー）に必要なAPI・Webhook依頼

---

## 📊 概要サマリー

| 項目 | 数量 | 医療システム工数 | 見積金額 |
|------|------|-----------------|---------|
| **医療システムAPI** | 2個 | 5日 | ¥400,000 |
| **Webhook** | 1個 | 5日 | ¥400,000 |
| **合計** | 3項目 | **10日** | **¥800,000** |

**VoiceDriveチーム工数**: 33日
**実装期間**: 5週間
**開始予定**: 2025年10月14日（月）

---

## 📝 必要API・Webhook一覧

### API-PM-M-1: 職員基本情報取得API
**エンドポイント**: `GET /api/employees/:employeeId`
**目的**: 責任者の権限レベル・部署情報を取得して、投稿管理権限を判定

#### リクエスト
```http
GET /api/employees/OH-NS-2024-001
```

#### レスポンス
```json
{
  "employeeId": "OH-NS-2024-001",
  "name": "山田太郎",
  "department": "看護部",
  "facilityId": "tategami_hospital",
  "permissionLevel": 8,
  "position": "師長",
  "hierarchyLevel": 5
}
```

#### 必須フィールド
- `employeeId`: 職員ID
- `name`: 氏名
- `department`: 部署名
- `permissionLevel`: 権限レベル (1-13)
- `position`: 役職（師長、主任など）

#### Phase
**Phase 1** - Week 1

#### 見積
- **工数**: 2日
- **金額**: ¥160,000
- **優先度**: 高

---

### API-PM-M-2: 組織階層構造取得API
**エンドポイント**: `GET /api/organization/structure`
**目的**: 部署階層と責任者レベルの対応関係を取得

#### リクエスト
```http
GET /api/organization/structure?facilityId=tategami_hospital
```

#### レスポンス
```json
{
  "facilityId": "tategami_hospital",
  "facilityName": "たてがみ病院",
  "departments": [
    {
      "departmentId": "nursing",
      "departmentName": "看護部",
      "parentDepartmentId": null,
      "level": 1,
      "responsibleLevel": 8
    },
    {
      "departmentId": "nursing_ward_a",
      "departmentName": "看護部A病棟",
      "parentDepartmentId": "nursing",
      "level": 2,
      "responsibleLevel": 6
    },
    {
      "departmentId": "nursing_ward_a_team1",
      "departmentName": "看護部A病棟1チーム",
      "parentDepartmentId": "nursing_ward_a",
      "level": 3,
      "responsibleLevel": 5
    }
  ]
}
```

#### 必須フィールド
- `departmentId`: 部署ID
- `departmentName`: 部署名
- `parentDepartmentId`: 親部署ID (null = トップレベル)
- `level`: 階層レベル (1 = 部門, 2 = 部署, 3 = チーム)
- `responsibleLevel`: この階層の責任者権限レベル

#### Phase
**Phase 2** - Week 3

#### 見積
- **工数**: 3日
- **金額**: ¥240,000
- **優先度**: 中

---

### WH-PM-M-1: 委員会提出通知Webhook
**エンドポイント**: 医療システム側で用意
**VoiceDriveからの送信先**: `POST https://medical-system.example.com/webhook/committee-submission`
**目的**: Level 8+が承認した議題提案書を医療システムの委員会管理に通知

#### VoiceDriveからの送信データ
```json
{
  "event": "committee_submission",
  "timestamp": "2025-10-09T16:00:00Z",
  "data": {
    "postId": "post-123",
    "documentId": "doc-789",
    "title": "夜勤引継ぎ時間延長に関する提案",
    "targetCommittee": "業務改善委員会",
    "submittedBy": "OH-NS-2024-020",
    "submittedByName": "田中師長",
    "submittedByLevel": 8,
    "agendaLevel": "DEPT_AGENDA",
    "supportRate": 85,
    "totalVotes": 34,
    "voteBreakdown": {
      "stronglySupport": 20,
      "support": 10,
      "neutral": 2,
      "oppose": 1,
      "stronglyOppose": 1
    },
    "documentUrl": "https://voicedrive.app/proposal-document/doc-789",
    "documentSummary": "夜勤引継ぎ時間を15分延長し、患者情報の詳細共有を実現する提案",
    "urgency": "medium"
  },
  "signature": "HMAC-SHA256-SIGNATURE-HERE"
}
```

#### 医療システムからの応答
```json
{
  "success": true,
  "committeeId": "committee-business-improvement",
  "registeredAt": "2025-10-09T16:00:05Z",
  "nextMeetingDate": "2025-10-20T14:00:00Z",
  "agendaNumber": "2025-BI-042"
}
```

#### セキュリティ
- **HMAC-SHA256署名**: 共有秘密鍵でリクエストボディを署名
- **タイムスタンプ検証**: 5分以内のリクエストのみ受け付け
- **IPホワイトリスト**: VoiceDriveサーバーIPのみ許可

#### Phase
**Phase 2** - Week 4

#### 見積
- **工数**: 5日
- **金額**: ¥400,000
- **優先度**: 高

#### 実装内容
1. **Webhookエンドポイント作成** (2日)
   - リクエスト受信・署名検証
   - データバリデーション

2. **委員会管理システム連携** (2日)
   - 委員会議題登録
   - 開催スケジュール紐付け

3. **テスト・デバッグ** (1日)
   - VoiceDriveとの結合テスト
   - エラーハンドリング確認

---

## 📅 実装スケジュール

### Phase 1: 基本投稿管理（Week 1-2）

| 週 | VoiceDrive作業 | 医療システム作業 | 成果物 |
|----|---------------|-----------------|--------|
| **Week 1** | Post拡張テーブル追加<br>ResponsibilityAction実装<br>ProposalManagementPage統合 | **API-PM-M-1実装**<br>職員情報API | 権限別管理画面動作<br>責任者判断機能 |
| **Week 2** | 期限管理実装<br>API連携テスト | API-PM-M-1テスト完了 | 投票期限・延長機能動作 |

**医療システム成果物**: API-PM-M-1稼働（¥160,000）

---

### Phase 2: 議題提案書・委員会提出（Week 3-4）

| 週 | VoiceDrive作業 | 医療システム作業 | 成果物 |
|----|---------------|-----------------|--------|
| **Week 3** | ProposalDocument実装<br>SubmissionRequest実装<br>CommitteeManagementPage統合 | **API-PM-M-2実装**<br>組織階層API | 提案書自動生成<br>委員会提出フロー |
| **Week 4** | Committee マスター<br>医療システムWebhook連携 | **WH-PM-M-1実装**<br>委員会提出Webhook | 委員会提出通知動作 |

**医療システム成果物**:
- API-PM-M-2稼働（¥240,000）
- WH-PM-M-1稼働（¥400,000）

---

### Phase 3: タイムライン・高度機能（Week 5）

| 週 | VoiceDrive作業 | 医療システム作業 | 成果物 |
|----|---------------|-----------------|--------|
| **Week 5** | PostManagementTimeline実装<br>統計・分析機能<br>統合テスト | 結合テスト参加 | 全機能完成<br>本番リリース準備完了 |

**医療システム成果物**: 結合テスト完了

---

## 🔍 確認事項（医療システムチームへ）

### 技術的確認

#### 1. 組織階層構造API
**Q**: 現在の医療システムに組織階層データは存在しますか？
**確認内容**:
- 部署マスターテーブルの有無
- 親子関係の管理方法
- 責任者権限レベルとの紐付け

#### 2. 委員会マスター
**Q**: 以下の12委員会情報は医療システムに登録されていますか？
**委員会一覧**:
1. 医療安全委員会
2. 感染対策委員会
3. 医薬品委員会
4. 医療機器安全管理委員会
5. 業務改善委員会
6. ICT活用委員会
7. 労働安全衛生委員会
8. 教育・研修委員会
9. 経営企画委員会
10. 施設運営委員会
11. 倫理委員会
12. 地域連携委員会

**確認内容**:
- 委員会マスターテーブルの有無
- 開催頻度・スケジュール管理
- 委員メンバー管理

#### 3. 委員会提出Webhook
**Q**: 委員会提出通知を受け取る医療システム側のエンドポイントは実装可能ですか？
**確認内容**:
- Webhook受信用サーバーの準備状況
- HMAC-SHA256署名検証の実装可否
- 委員会管理システムとの連携方法

#### 4. 階層レベル定義
**Q**: department階層レベルと責任者permissionLevelの対応関係は明確ですか？
**確認内容**:
- Level 1-13の詳細定義
- 各Levelに対応する役職名
- 部署階層ごとの責任者Level

#### 5. 委員会決議データ
**Q**: 委員会での審議結果（採択・要改善・却下）をVoiceDriveに返す仕組みは必要ですか？
**確認内容**:
- 委員会審議結果の管理方法
- VoiceDriveへのフィードバック要否
- 実施決定後のステータス管理

---

### 運用的確認

#### 6. 権限レベル変更
**Q**: 職員の権限Level変更時、VoiceDriveへの通知は必要ですか？
**検討内容**:
- 昇進・異動時の権限更新タイミング
- リアルタイム通知 vs バッチ同期
- 責任者変更時の投稿管理引継ぎ

#### 7. 組織改編
**Q**: 部署統廃合時、VoiceDriveの議題管理にどう影響しますか？
**検討内容**:
- 部署統合時の既存投稿の扱い
- 議題レベルの再判定要否
- 責任者の自動振り分け

#### 8. 委員会開催頻度
**Q**: 各委員会の開催頻度・スケジュールはVoiceDriveで管理すべきですか？
**検討内容**:
- 委員会カレンダーの管理主体
- 次回開催日の通知方法
- 議題締切日の自動設定

#### 9. 提出書類形式
**Q**: 議題提案書のPDF出力機能は必要ですか？
**検討内容**:
- PDF自動生成の要否
- 医療システムへのPDF連携
- 電子署名・承認印の有無

#### 10. 決裁ワークフロー
**Q**: 医療システム側に既存の決裁ワークフローがある場合、統合は必要ですか？
**検討内容**:
- 既存ワークフローシステムの有無
- VoiceDrive委員会提出フローとの連携
- 二重承認の回避方法

---

### データ連携確認

#### 11. 職員情報同期
**Q**: employeeId, permissionLevelの変更をリアルタイムでVoiceDriveに反映する仕組みは必要ですか？
**同期方法検討**:
- **Option A**: リアルタイムWebhook通知
- **Option B**: 日次バッチ同期
- **Option C**: VoiceDriveからのAPI都度取得（現行案）

#### 12. 部署コード体系
**Q**: departmentIdとdepartmentNameの対応表は共有されていますか？
**確認資料**:
- 部署マスターCSVまたはJSON
- 部署コード命名規則
- 略称・正式名称の区別

#### 13. 施設ID
**Q**: facilityIdの命名規則・一覧は共有されていますか？
**確認資料**:
- 施設マスター一覧
- 施設ID命名規則（例: tategami_hospital）
- 複数施設対応の有無

#### 14. 権限Level定義
**Q**: Level 1-13の詳細な定義・役職対応表は文書化されていますか？
**必要資料**:
- 権限レベル定義書
- 役職とLevelの対応表
- Level別の権限範囲説明

#### 15. 委員会メンバー
**Q**: 各委員会の委員リストは医療システムで管理されていますか？
**確認内容**:
- 委員マスターテーブルの有無
- 委員の追加・変更プロセス
- VoiceDriveでの委員表示要否

---

## 💰 見積詳細

### 医療システムチーム工数内訳

| 項目 | 作業内容 | 工数 | 単価 | 金額 |
|------|---------|------|------|------|
| **API-PM-M-1** | 職員情報取得API実装 | 2日 | ¥80,000/日 | ¥160,000 |
| **API-PM-M-2** | 組織階層構造API実装 | 3日 | ¥80,000/日 | ¥240,000 |
| **WH-PM-M-1** | 委員会提出Webhook実装 | 5日 | ¥80,000/日 | ¥400,000 |
| **合計** | - | **10日** | - | **¥800,000** |

### VoiceDriveチーム工数内訳

| Phase | 作業内容 | 工数 |
|-------|---------|------|
| **Phase 1** | 基本投稿管理 | 12日 |
| **Phase 2** | 提案書・委員会 | 14日 |
| **Phase 3** | タイムライン・分析 | 7日 |
| **合計** | - | **33日** |

---

## 📦 成果物一覧

### VoiceDrive側成果物
1. **Post拡張テーブル**
   - agendaScore, agendaLevel, agendaDeadline
   - responsibilityStatus, responsibleLevel
   - committeeStatus, targetCommittee

2. **ResponsibilityActionテーブル**
   - レベルアップ承認・却下・保留・部署案件化履歴

3. **ProposalDocumentテーブル**
   - 議題提案書自動生成・編集機能

4. **SubmissionRequestテーブル**
   - Level 7+ 提出リクエスト
   - Level 8+ 承認機能

5. **PostManagementTimelineテーブル**
   - 投稿管理アクティビティ追跡

6. **UI実装**
   - ProposalManagementPage（権限別フィルタ）
   - CommitteeManagementPage（提出リクエスト管理）
   - CommitteeSubmissionApprovalPage（Level 8+ 承認画面）
   - ProposalAnalysisCard（詳細分析カード）

### 医療システム側成果物
1. **API-PM-M-1**: 職員基本情報取得API
2. **API-PM-M-2**: 組織階層構造取得API
3. **WH-PM-M-1**: 委員会提出通知Webhook受信エンドポイント

---

## 🚀 次のステップ

### 1. 確認事項回答（Week 0 - 10/9-10/11）
- [ ] 技術的確認5項目の回答
- [ ] 運用的確認5項目の回答
- [ ] データ連携確認5項目の回答
- [ ] 必要資料の共有（組織図、権限定義書など）

### 2. キックオフミーティング（10/11 14:00-15:00）
- [ ] 要件確認・疑問点解消
- [ ] 実装スケジュール最終調整
- [ ] 担当者アサイン
- [ ] 開発環境・テスト環境確認

### 3. Phase 1 開始（10/14-）
- [ ] 医療システムチーム: API-PM-M-1実装開始
- [ ] VoiceDriveチーム: Post拡張テーブル追加
- [ ] 週次進捗会議設定（毎週金曜15:00-16:00）

---

## 📞 連絡先

**VoiceDriveチーム**
- プロジェクトリード: [担当者名]
- 技術リード: [担当者名]
- Slack: #voicedrive-post-management

**医療システムチーム**
- API担当: [担当者名]
- Webhook担当: [担当者名]
- Slack: #medical-system-api

---

## 📚 関連ドキュメント

1. **PostManagement_DB要件分析_20251009.md** - 詳細設計書（本依頼の根拠）
2. **PostTracking_DB要件分析_20251009.md** - 投稿追跡DB設計（参考）
3. **権限レベル定義書** - Level 1-13の詳細定義（要共有）
4. **組織階層図** - 部署構造・責任者対応表（要共有）

---

**作成者**: Claude (AI Assistant)
**承認者**: VoiceDrive開発リーダー
**最終更新**: 2025年10月9日 16:00

**重要**: この暫定マスターリストは医療システムチームとの協議後、最終版に更新されます。
