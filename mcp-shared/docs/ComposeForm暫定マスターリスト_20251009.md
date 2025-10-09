# ComposeForm（投稿フォーム）統合実装 - 暫定マスターリスト

**医療職員管理システムチーム 御中**

---

## 📋 概要

**対象ページ**: ComposeForm（投稿フォーム）
**VoiceDriveファイル**: `src/components/ComposeForm.tsx` (899行)
**重要度**: 🔴 **CRITICAL** - VoiceDriveの中核機能（全投稿作成）
**日付**: 2025年10月9日

このドキュメントは、ComposeForm（投稿フォーム）実装における医療職員管理システム側の対応事項をまとめた暫定マスターリストです。

---

## 🎯 全体像

### ComposeFormとは

ComposeFormは、VoiceDriveで**最も重要なコンポーネント**で、以下3種類の投稿を作成します：

1. **💡 アイデアボイス (improvement)**
   - 業務改善提案（4段階フロー）
   - 4種類の提案タイプ: operational, communication, innovation, strategic
   - **医療システムへWebhook通知が必要**

2. **💬 フリーボイス (community)**
   - フリースペース投稿（3段階フロー）
   - 投票機能（Poll）作成オプション
   - イベント企画機能（Event）作成オプション

3. **🚨 コンプライアンス相談 (report)**
   - コンプライアンス窓口（3段階フロー）
   - 完全匿名投稿

### 医療システム側で必要な対応

1. ✅ **Webhook受信エンドポイント実装** - improvement投稿時の通知受信
2. ✅ **職員カルテ連携** - 提案活動の記録
3. ✅ **承認者通知機能** - permissionLevelに応じた通知

---

## 🔗 医療システム側の実装要件

### A. Webhook受信エンドポイント実装（🔴 CRITICAL）

#### A-1. エンドポイント仕様

**URL**: `POST /api/webhook/voicedrive`

**受信するイベント**:
- `proposal.created` - VoiceDriveで議題（improvement投稿）が作成された時

**リクエストヘッダー**:
```
Content-Type: application/json
X-VoiceDrive-Source: webapp
X-API-Key: {医療システムが提供するAPIキー}
```

**リクエストボディ**:
```json
{
  "event": "proposal.created",
  "timestamp": "2025-10-09T12:34:56.789Z",
  "data": {
    "proposalId": "post_abc123def456",
    "staffId": "staff_001",
    "staffName": "田中太郎",
    "department": "看護部",
    "title": "夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。",
    "content": "夜勤シフトの負担軽減のため、3交代制から2交代制への移行を提案します。これにより...",
    "proposalType": "operational",
    "priority": "medium",
    "permissionLevel": 2.0,
    "expectedAgendaLevel": "部署検討レベル（30点以上で部署内検討対象）"
  }
}
```

**レスポンス**:
```json
{
  "received": true
}
```

#### A-2. 議題レベル判定ロジック

VoiceDrive側で以下のロジックで議題レベルを判定しています：

| permissionLevel | expectedAgendaLevel | 説明 |
|-----------------|---------------------|------|
| >= 8.0 | 施設議題レベル | 100点以上で委員会提出可能 |
| >= 5.0 | 部署議題レベル | 50点以上で部署課題として扱われる |
| >= 3.0 | 部署検討レベル | 30点以上で部署内検討対象 |
| < 3.0 | 検討中レベル | まずは関係者から意見を集める |

#### A-3. 期待する処理内容

`proposal.created` イベント受信時に以下の処理を実行してください：

1. **議題作成ログを記録**
   - テーブル: `proposal_logs` （または適切なテーブル名）
   - 記録内容: proposalId, staffId, staffName, department, title, proposalType, priority, permissionLevel, expectedAgendaLevel, createdAt

2. **職員カルテに活動記録**
   - テーブル: `staff_activity_log` （または適切なテーブル名）
   - 記録内容: staffId, activityType='提案活動', activityDetail, permissionLevel, timestamp

3. **上位承認者に通知**（permissionLevel >= 5.0 の場合）
   - permissionLevel 5.0以上の職員が提案を作成した場合、その上位承認者（部長、施設長など）に通知
   - 通知方法: メール、システム内通知など（医療システム側で決定）

4. **委員会提出候補としてマーク**（permissionLevel >= 8.0 の場合）
   - permissionLevel 8.0以上の職員が提案を作成した場合、委員会提出候補として自動マーク
   - マーク方法: proposal_logs.committee_candidate = true など（医療システム側で設計）

#### A-4. 実装例（参考）

```typescript
// 医療システム側実装（参考コード）
router.post('/webhook/voicedrive', authenticateWebhook, async (req, res) => {
  const { event, timestamp, data } = req.body;

  try {
    switch (event) {
      case 'proposal.created':
        // 1. 議題作成ログを記録
        await db.insert('proposal_logs', {
          proposalId: data.proposalId,
          staffId: data.staffId,
          staffName: data.staffName,
          department: data.department,
          title: data.title,
          proposalType: data.proposalType,
          priority: data.priority,
          permissionLevel: data.permissionLevel,
          expectedAgendaLevel: data.expectedAgendaLevel,
          createdAt: timestamp
        });

        // 2. 職員カルテに活動記録
        await db.insert('staff_activity_log', {
          staffId: data.staffId,
          activityType: '提案活動',
          activityDetail: `${data.proposalType}提案「${data.title}」を作成`,
          permissionLevel: data.permissionLevel,
          timestamp
        });

        // 3. 上位承認者に通知（permissionLevel >= 5.0）
        if (data.permissionLevel >= 5.0) {
          await notifySupervisor(data.staffId, data.proposalId, data.title);
        }

        // 4. 委員会提出候補としてマーク（permissionLevel >= 8.0）
        if (data.permissionLevel >= 8.0) {
          await markAsCommitteeCandidate(data.proposalId);
        }

        break;

      default:
        console.warn(`Unknown event: ${event}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### A-5. 認証方式

**質問**: Webhook受信時の認証方式は以下のどちらを希望されますか？

**Option 1: API Key認証**（推奨・シンプル）
- VoiceDrive側が `X-API-Key` ヘッダーに医療システム提供のAPIキーを含める
- 医療システム側でAPIキーを検証

**Option 2: HMAC-SHA256署名認証**（高セキュリティ）
- VoiceDrive側がリクエストボディのHMAC-SHA256署名を計算し、`X-Signature` ヘッダーに含める
- 医療システム側で署名を検証

**ご回答**: Option 1 / Option 2 / その他（具体的に：______________________）

#### A-6. エラーハンドリング・リトライポリシー

**質問**: Webhook送信失敗時のリトライは必要ですか？

**現在のVoiceDrive実装**:
- タイムアウト: 5秒
- リトライ: なし（失敗しても投稿処理は継続）
- ログ出力: 成功/失敗をログに記録

**医療システム側の要望**:
- [ ] リトライ不要（現在の実装で問題なし）
- [ ] リトライ必要（回数: _____回、間隔: _____秒）
- [ ] Dead Letter Queue (DLQ) 実装希望
- [ ] その他（具体的に：______________________）

---

### B. テスト環境の準備

#### B-1. テスト用Webhookエンドポイント

**質問**: 統合テスト用のWebhook受信エンドポイントは準備されていますか？

**必要な情報**:
- [ ] テスト環境URL: `_______________________________________`
- [ ] テスト環境APIキー: `_______________________________________`
- [ ] テスト環境の準備状況: 準備済み / 準備中（予定日: _____） / 未準備

#### B-2. 本番環境のエンドポイント

**質問**: 本番環境のWebhook受信エンドポイントURLを教えてください。

**必要な情報**:
- [ ] 本番環境URL: `_______________________________________`
- [ ] 本番環境APIキー: `_______________________________________`
- [ ] 本番環境の準備予定日: `_______________________________________`

---

## 📊 データベース設計確認事項

### C. proposal_logs テーブル（または同等のテーブル）

**質問**: VoiceDriveからのWebhook通知を記録するテーブルは存在しますか？

**想定スキーマ**:
```sql
CREATE TABLE proposal_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  proposal_id VARCHAR(255) NOT NULL UNIQUE,
  staff_id VARCHAR(255) NOT NULL,
  staff_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  title TEXT,
  content TEXT,
  proposal_type VARCHAR(50),  -- 'operational' | 'communication' | 'innovation' | 'strategic'
  priority VARCHAR(50),        -- 'low' | 'medium' | 'high' | 'urgent'
  permission_level DECIMAL(4,1),
  expected_agenda_level VARCHAR(255),
  committee_candidate BOOLEAN DEFAULT FALSE,
  created_at DATETIME,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_staff_id (staff_id),
  INDEX idx_department (department),
  INDEX idx_proposal_type (proposal_type),
  INDEX idx_permission_level (permission_level)
);
```

**ご回答**:
- [ ] 既存のテーブルがある（テーブル名: _____________________）
- [ ] 新規作成が必要
- [ ] 既存テーブルを修正する（テーブル名: _____________________）

### D. staff_activity_log テーブル（または同等のテーブル）

**質問**: 職員カルテに活動記録を保存するテーブルは存在しますか？

**想定スキーマ**:
```sql
CREATE TABLE staff_activity_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  staff_id VARCHAR(255) NOT NULL,
  activity_type VARCHAR(100),  -- '提案活動'
  activity_detail TEXT,
  permission_level DECIMAL(4,1),
  timestamp DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_staff_id (staff_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_timestamp (timestamp)
);
```

**ご回答**:
- [ ] 既存のテーブルがある（テーブル名: _____________________）
- [ ] 新規作成が必要
- [ ] 既存テーブルを修正する（テーブル名: _____________________）
- [ ] 別の方法で記録する（具体的に：______________________）

---

## 📅 スケジュール確認

### E. 実装スケジュール

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| Webhook受信エンドポイント実装 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| proposal_logs テーブル作成 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| staff_activity_log テーブル作成 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| proposal.created イベント処理実装 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| 上位承認者通知機能実装 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| 委員会提出候補マーク機能実装 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| テスト環境準備 | 医療システム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| 統合テスト実施 | 両チーム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |
| 本番環境リリース | 両チーム | ___/___/___ | ⬜ 未着手 / 🟡 進行中 / ✅ 完了 |

---

## ❓ 確認事項サマリー

### 必須回答事項（🔴 CRITICAL）

#### 1. Webhook認証方式（Section A-5）
- [ ] Option 1: API Key認証
- [ ] Option 2: HMAC-SHA256署名認証
- [ ] その他: _______________________

#### 2. Webhookリトライポリシー（Section A-6）
- [ ] リトライ不要
- [ ] リトライ必要（回数: ___回、間隔: ___秒）
- [ ] その他: _______________________

#### 3. テスト環境URL・APIキー（Section B-1）
- テスト環境URL: `_______________________________________`
- テスト環境APIキー: `_______________________________________`
- 準備状況: 準備済み / 準備中（予定日: _____）

#### 4. 本番環境URL・APIキー（Section B-2）
- 本番環境URL: `_______________________________________`
- 本番環境APIキー: `_______________________________________`
- 準備予定日: `_______________________________________`

#### 5. proposal_logs テーブル（Section C）
- [ ] 既存テーブル使用（テーブル名: _____________________）
- [ ] 新規作成
- [ ] 既存テーブル修正（テーブル名: _____________________）

#### 6. staff_activity_log テーブル（Section D）
- [ ] 既存テーブル使用（テーブル名: _____________________）
- [ ] 新規作成
- [ ] 既存テーブル修正（テーブル名: _____________________）
- [ ] 別の方法で記録（具体的に: _____________________）

#### 7. 実装スケジュール（Section E）
- Webhook受信エンドポイント実装完了予定: ___/___/___
- 統合テスト実施予定: ___/___/___
- 本番環境リリース予定: ___/___/___

---

## 📞 連絡先

### VoiceDriveチーム
- **担当者**: [担当者名]
- **Slack**: #voicedrive-dev
- **Email**: voicedrive-dev@example.com

### 医療システムチーム
- **担当者**: [担当者名]
- **Slack**: #medical-system-dev
- **Email**: medical-system-dev@example.com

### 統合作業チャンネル
- **Slack**: #phase3-integration

---

## 📄 関連ドキュメント

1. **ComposeForm_DB要件分析_20251009.md**
   - 詳細な技術仕様書（VoiceDrive側の実装詳細）
   - 場所: `mcp-shared/docs/ComposeForm_DB要件分析_20251009.md`

2. **PersonalStation統合実装 確認事項回答書**（前回参考資料）
   - 医療システムチームからの回答例
   - Webhook実装パターンの参考

3. **TeamLeaderDashboard統合実装 確認事項回答書**（前回参考資料）
   - コスト削減の成功事例

---

## ✅ 回答提出方法

### 提出先
- **Slack**: #phase3-integration チャンネルに投稿
- **Email**: voicedrive-dev@example.com に送信
- **GitHub**: Issue #XXX にコメント

### 提出期限
**🔴 CRITICAL**: 2025年10月11日（金）17:00まで

このドキュメントに直接回答を記入して返信していただくか、別途回答書を作成してご提出ください。

---

## 💬 質問・相談

このドキュメントに関する質問や相談がありましたら、以下にご連絡ください：

- **Slack**: #phase3-integration チャンネル
- **担当者**: [VoiceDrive担当者名]

---

**最終更新**: 2025年10月9日
**作成者**: VoiceDriveチーム
**バージョン**: 1.0
**ステータス**: 🟡 医療システムチームからの回答待ち
