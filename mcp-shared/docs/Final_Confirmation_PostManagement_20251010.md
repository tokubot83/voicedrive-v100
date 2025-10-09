# 投稿管理統合実装 - 最終確認書

**文書番号**: FINAL-CONFIRMATION-POSTMANAGEMENT-2025-1010-001
**作成日**: 2025年10月10日
**作成者**: 医療職員管理システムチーム + VoiceDriveチーム（合同作成）
**件名**: 投稿管理（6段階議題化システム）統合実装の最終確認

---

## 📢 合意事項

医療システムチームとVoiceDriveチームは、以下の事項について合意しました。

### ✅ 1. シナリオB（委員会管理システム不在）を採用

**決定内容**:
- 委員会管理システム実態調査を中止
- 委員会管理はVoiceDrive側で完結
- WH-PM-M-1（委員会提出Webhook）は実装不要

**コスト削減効果**: ¥800,000 → ¥200,000 = **¥600,000削減（75%削減）**

---

### ✅ 2. ハイブリッド方式の委員会管理を実装

**決定内容**:
- マスター選択とフリー入力の両対応
- フリー入力時は自動マスター登録
- UI変更・フロー変更に柔軟に対応可能

**実装方針**:
- Phase 1: マスター選択モード実装
- Phase 2: フリー入力モード追加
- Phase 3: オートコンプリート・管理画面追加

---

### ✅ 3. 小原病院の委員会データを初期登録

**決定内容**:
- 小原病院の40以上の委員会を初期登録
- 施設別の委員会マスター管理
- 「12の標準委員会」前提を修正

**データソース**: `docs\20250925_小原病院の委員会\委員会組織図(R7.5) (1).pdf`

---

### ✅ 4. API統合によるコスト削減

**決定内容**:
- API-PM-M-1 → API-PT-M-1拡張で対応（¥80,000削減）
- API-PM-M-2 → 簡易版実装（¥120,000削減）
- WH-PM-M-1 → 実装不要（¥400,000削減）

**総削減額**: **¥600,000削減（75%削減）**

---

## 💰 最終コスト

### 医療システムチーム

| Phase | 項目 | 工数 | 金額 |
|-------|------|------|------|
| **Phase 1** | API-PT-M-1拡張 + 立神病院委員会調査 | 2日 | ¥80,000 |
| **Phase 2** | API-PM-M-2簡易版 | 3日 | ¥120,000 |
| **Phase 3** | 結合テスト参加 | 0日 | ¥0 |
| **合計** | | **5日** | **¥200,000** |

### VoiceDriveチーム

| Phase | 工数 | 主要作業 |
|-------|------|----------|
| **Phase 1** | 14日 | 基本投稿管理 + 委員会マスター初期登録 |
| **Phase 2** | 14日 | 議題提案書 + ハイブリッド委員会選択 |
| **Phase 3** | 7日 | タイムライン・分析・通知システム統合 |
| **合計** | **35日** | |

---

## 📅 実装スケジュール

### Phase 1: 基本投稿管理（10/11-10/25）

#### 医療システムチーム

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| **10/11-10/13** | API-PT-M-1拡張実装<br>facilityId、hierarchyLevel追加 | API稼働 |
| **10/11-10/14** | 立神病院委員会データ調査 | 調査結果 |
| **10/14** | VoiceDriveチームにAPI連携テスト開始通知 | 通知完了 |
| **10/15** | キックオフミーティング（14:00-15:00） | Phase 1実装計画確定 |

#### VoiceDriveチーム

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| **10/14** | Post拡張テーブル追加<br>ResponsibilityActionテーブル追加 | テーブル設計完了 |
| **10/15** | Committeeテーブル追加（ハイブリッド対応）<br>小原病院の委員会データ初期登録 | 40委員会登録完了 |
| **10/16** | ProposalManagementPage統合<br>権限別フィルタリング実装 | 管理画面動作 |
| **10/17** | 委員会選択UI実装（マスター選択モード） | 委員会選択機能動作 |
| **10/18** | 期限管理実装<br>投票期限・延長機能 | 期限管理動作 |
| **10/21-10/22** | API-PT-M-1拡張連携テスト | API連携確認 |
| **10/23-10/25** | Phase 1統合テスト・デバッグ | Phase 1完了 |

**Phase 1成果物**:
- Level 5-13の責任者が投稿を管理可能
- 6段階議題レベル自動判定動作
- 権限別管理画面動作
- 委員会選択機能動作（マスター選択）

**医療システムコスト**: ¥80,000（2日）

---

### Phase 2: 議題提案書・委員会提出（10/28-11/8）

#### 医療システムチーム

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| **10/28-10/30** | API-PM-M-2簡易版実装 | 組織階層API実装 |
| **10/31** | API-PM-M-2単体テスト | テスト完了 |
| **11/1** | API-PM-M-2統合テスト完了 | API稼働 |
| **11/4-11/8** | Phase 2結合テスト参加 | Phase 2完了 |

#### VoiceDriveチーム

| 週 | 作業内容 | 成果物 |
|----|----------|--------|
| **Week 3（10/28-11/1）** | ProposalDocumentテーブル追加<br>議題提案書自動生成ロジック実装<br>SubmissionRequestテーブル追加 | 提案書生成機能動作 |
| **Week 4（11/4-11/8）** | CommitteeManagementPage統合<br>フリー入力モード追加<br>自動マスター登録ロジック実装 | 委員会提出フロー動作 |

**Phase 2成果物**:
- 議題提案書自動生成機能動作
- Level 7+ → Level 8+ 委員会提出フロー動作
- ハイブリッド委員会選択（マスター + フリー入力）

**医療システムコスト**: ¥120,000（3日）

---

### Phase 3: タイムライン・分析（11/11-11/15）

#### 両チーム

| 日程 | 作業内容 | 成果物 |
|------|----------|--------|
| **11/11-11/13** | PostManagementTimelineテーブル追加<br>統計・分析機能実装 | タイムライン動作 |
| **11/14** | 通知システム統合 | 通知機能動作 |
| **11/15** | Phase 3統合テスト・本番リリース準備 | 全機能完成 |

**Phase 3成果物**:
- 投稿管理タイムライン動作
- 統計・分析機能動作
- 本番リリース準備完了

**医療システムコスト**: ¥0（0日）

---

## 🔧 API仕様（確定版）

### API-PT-M-1拡張: 職員フルプロフィール取得

**エンドポイント**: `GET /api/employees/:employeeId/full-profile`

**レスポンス**:
```json
{
  "employeeId": "OH-NS-2024-001",
  "firstName": "花子",
  "lastName": "山田",
  "departmentId": "DEPT-001",
  "departmentName": "看護部",
  "positionId": "POS-002",
  "positionName": "看護師",
  "experienceYears": 5,
  "employmentStatus": "regular_employee",
  "hireDate": "2019-04-01",
  "avatarUrl": null,
  "permissionLevel": 8,
  "facilityId": "obara-hospital",
  "hierarchyLevel": 5
}
```

**実装工数**: 0.5日（¥20,000）
**Phase**: Phase 1（10/11-10/13）

---

### API-PM-M-2簡易版: 組織階層（部署一覧）取得

**エンドポイント**: `GET /api/organization/departments?facilityId=obara-hospital`

**レスポンス**:
```json
{
  "facilityId": "obara-hospital",
  "facilityName": "小原病院",
  "departments": [
    {
      "departmentId": "nursing",
      "departmentName": "看護部",
      "responsibleLevel": 8
    },
    {
      "departmentId": "nursing_ward_a",
      "departmentName": "看護部A病棟",
      "responsibleLevel": 6
    },
    {
      "departmentId": "medical_care_ward",
      "departmentName": "医療療養病棟",
      "responsibleLevel": 8
    }
  ]
}
```

**実装工数**: 3日（¥120,000）
**Phase**: Phase 2（10/28-11/1）

---

## 📊 テーブル設計（確定版）

### Committee（委員会マスター - ハイブリッド対応）

```prisma
model Committee {
  id          String    @id @default(cuid())

  // 基本情報
  name        String
  facilityId  String?   // null = 全施設共通, "obara-hospital" | "tategami-rehabilitation"

  // 階層構造（オプショナル）
  parentCommitteeId String?
  hierarchyLevel    Int?  // 1: 理事会直下, 2: 病院運営委員会直下, 3: 専門委員会, 4: サブ委員会

  // カテゴリー分類（オプショナル）
  category    String?   // "医療安全・品質" | "業務改善" | "人事・労務" | "経営・運営" | "その他"
  description String?

  // 権限設定
  minSubmissionLevel Int @default(7)
  approvalLevel      Int @default(8)

  // 開催情報（オプショナル）
  meetingFrequency String?   // "月1回" | "隔週" | "随時" | "年4回"
  nextMeetingDate  DateTime?

  // ステータス
  isActive     Boolean @default(true)
  isMasterData Boolean @default(false)  // true: 管理者登録, false: 自動登録（フリー入力から）

  // タイムスタンプ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?

  // リレーション
  parentCommittee Committee?  @relation("CommitteeHierarchy", fields: [parentCommitteeId], references: [id])
  childCommittees Committee[] @relation("CommitteeHierarchy")
  members         CommitteeMember[]
  submissions     SubmissionRequest[]

  @@index([facilityId])
  @@index([isActive])
  @@index([isMasterData])
  @@index([parentCommitteeId])
  @@index([hierarchyLevel])
}
```

### SubmissionRequest（委員会提出リクエスト - ハイブリッド対応）

```prisma
model SubmissionRequest {
  id              String    @id @default(cuid())
  documentId      String
  postId          String

  // 柔軟な委員会指定（ハイブリッド方式）
  committeeId         String?  // Committeeマスターから選択した場合
  customCommitteeName String?  // フリー入力の場合（自動的にマスター登録される）

  // リクエスト情報
  requestedBy     String
  requestedByName String?
  requestedByLevel Int
  requestedDate   DateTime  @default(now())
  targetCommittee String    // 表示用（committeeId → name または customCommitteeName）

  // 承認情報
  status          String    @default("pending") // 'pending' | 'approved' | 'rejected'
  reviewedBy      String?
  reviewedByName  String?
  reviewedByLevel Int?
  reviewedDate    DateTime?
  reviewNotes     String?

  // リレーション
  document        ProposalDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  post            Post             @relation(fields: [postId], references: [id], onDelete: Cascade)
  committee       Committee?       @relation(fields: [committeeId], references: [id])

  @@index([documentId])
  @@index([postId])
  @@index([status])
  @@index([committeeId])
}
```

---

## 🎯 キックオフミーティング（10/15 14:00-15:00）

### 議題

1. **Phase 1実装状況共有**
   - API-PT-M-1拡張実装完了報告
   - 立神病院委員会データ調査結果共有
   - 小原病院委員会データ初期登録状況

2. **API-PT-M-1拡張連携テスト計画**
   - テストケース確認
   - テスト実施スケジュール

3. **ハイブリッド委員会選択のデモ**
   - マスター選択モード
   - フリー入力モード
   - 自動マスター登録

4. **Phase 2実装計画の詳細化**
   - API-PM-M-2簡易版の実装スケジュール
   - 議題提案書自動生成ロジックの仕様確認

5. **立神病院の委員会データ確認**
   - 調査結果の共有
   - Phase 1またはPhase 2での登録判断

---

## 📋 確認事項（医療システムチーム → VoiceDriveチーム）

### ✅ 確認1: API-PT-M-1拡張の実装タイミング

**医療システムチームの回答**: ✅ **10/11-10/13で実装可能**

**実装スケジュール**:
- 10/11: フィールド追加・ロジック実装
- 10/12: 単体テスト
- 10/13: 統合テスト完了
- 10/14: VoiceDriveチームにAPI連携テスト開始通知

---

### ⚠️ 確認2: 立神リハビリテーション温泉病院の委員会情報

**医療システムチームの回答**: ⚠️ **調査が必要（10/11-10/14）**

**対応方針**:
1. 立神病院の委員会データを調査（10/11-10/14）
2. 調査結果をキックオフミーティング（10/15）で共有
3. データがない場合、Phase 1では小原病院のみ登録
4. Phase 2で立神病院の委員会を追加登録

---

### ✅ 確認3: API-PM-M-2簡易版の仕様確認

**医療システムチームの回答**: ✅ **問題ありません**

**仕様確認**:
1. ✅ 親子関係（parentDepartmentId）なしで問題ない
2. ✅ responsibleLevelは部署マスターに固定値登録で良い
3. ✅ 実装タイミング: Phase 2（10/28-11/1）で問題ない

---

### ✅ 確認4: 委員会管理システム実態調査の中止

**医療システムチームの回答**: ✅ **同意します**

**理由**:
1. 小原病院の委員会データが既に存在
2. VoiceDrive側でハイブリッド方式実装が可能
3. 医療システム側の追加開発が不要（¥400,000削減維持）
4. 調査期間（5日）を実装期間に充てられる

---

## 🚀 次のアクション

### 即時対応（10/10-10/11）

#### 医療システムチーム

1. ✅ **API-PT-M-1拡張実装開始**（10/11）
   - facilityId、hierarchyLevel追加
   - 単体テスト準備

2. ⚠️ **立神病院委員会データ調査開始**（10/11-10/14）
   - 委員会組織図の有無確認
   - 委員会リストの収集

3. ✅ **API-PM-M-2簡易版の設計確認**
   - 部署マスターにresponsibleLevel追加
   - Phase 2実装準備

#### VoiceDriveチーム

1. ✅ **Phase 1実装準備**
   - Post拡張テーブル設計レビュー
   - Committeeテーブル設計レビュー

2. ✅ **小原病院委員会データ整理**
   - 40委員会のデータ整理
   - 初期登録スクリプト作成

3. ✅ **API連携テスト計画作成**
   - API-PT-M-1拡張のテストケース作成
   - テスト環境準備

---

## 📎 関連ドキュメント

### 医療システムチーム作成ドキュメント

| ドキュメント | 作成日 | 文書番号 |
|------------|--------|---------|
| Response_PostManagement_Integration_20251010.md | 10月10日 | MS-RESPONSE-POSTMANAGEMENT-2025-1010-001 |
| 投稿管理DB要件分析_20251009.md（受領） | 10月9日 | - |
| 投稿管理暫定マスターリスト_20251009.md（受領） | 10月9日 | - |

### VoiceDriveチーム作成ドキュメント

| ドキュメント | 作成日 | 文書番号 |
|------------|--------|---------|
| Response_PostManagement_VoiceDrive_20251010.md | 10月10日 | VD-RESPONSE-POSTMANAGEMENT-2025-1010-001 |
| 投稿管理DB要件分析_20251009.md | 10月9日 | - |
| 投稿管理暫定マスターリスト_20251009.md | 10月9日 | - |

### 合同作成ドキュメント

| ドキュメント | 作成日 | 文書番号 |
|------------|--------|---------|
| Final_Confirmation_PostManagement_Integration_20251010.md | 10月10日 | FINAL-CONFIRMATION-POSTMANAGEMENT-2025-1010-001 |

---

## 総括

### 医療システムチームの見解

1. ✅ **ハイブリッド方式の委員会管理は優秀な提案**
   - マスター選択とフリー入力の両対応
   - データ整合性とユーザー体験の両立
   - UI変更・フロー変更に柔軟に対応可能

2. ✅ **大幅なコスト削減を達成**
   - ¥800,000 → ¥200,000（¥600,000削減、75%削減）
   - WH-PM-M-1（委員会提出Webhook）実装不要
   - 委員会管理システム実態調査中止

3. ✅ **段階的実装で早期リリース可能**
   - Phase 1: 2週間（基本投稿管理 + 委員会マスター）
   - Phase 2: 2週間（議題提案書 + ハイブリッド選択）
   - Phase 3: 1週間（タイムライン・分析）

4. ⚠️ **立神病院委員会データの調査が必要**
   - 10/11-10/14で調査実施
   - 調査結果をキックオフミーティングで共有

### VoiceDriveチームの見解

1. ✅ **医療システムチームの提案を全面的に受け入れ**
   - シナリオB採用
   - API統合によるコスト削減
   - 段階的実装スケジュール

2. ✅ **ハイブリッド方式で柔軟性と整合性を両立**
   - 小原病院の40委員会を初期登録
   - マスター選択 + フリー入力の両対応
   - 自動マスター登録で運用負担軽減

3. ✅ **10/14からPhase 1実装開始可能**
   - API-PT-M-1拡張実装完了を待つ
   - キックオフミーティング（10/15）で実装計画確定

---

## 📝 承認

### 医療システムチーム

- **承認者**: 医療システムプロジェクトリーダー
- **承認日**: 2025年10月10日
- **署名**: _____________________ ✅

### VoiceDriveチーム

- **承認者**: VoiceDriveプロジェクトリーダー
- **承認日**: 2025年10月10日
- **署名**: _____________________ ✅

---

**文書終了**

**本最終確認書をもって、投稿管理統合実装の全ての合意事項が確定しました。**

**両チームは本文書に基づき、10/11から実装を開始します。**

*次回更新: キックオフミーティング（10/15 14:00-15:00）後*
