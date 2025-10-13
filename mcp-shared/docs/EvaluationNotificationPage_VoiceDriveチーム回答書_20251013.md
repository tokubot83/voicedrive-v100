# EvaluationNotificationPage VoiceDriveチーム回答書

**文書番号**: VD-RESPONSE-2025-1013-004
**作成日**: 2025年10月13日
**作成者**: VoiceDriveチーム
**宛先**: 医療システムチーム
**件名**: EvaluationNotificationPage 確認事項への回答

---

## 📌 エグゼクティブサマリー

医療システムチームからの確認結果書（MEDICAL-RESPONSE-2025-1013-004）を受領しました。**全面的な協力承認**に心より感謝申し上げます。

本文書では、医療システムチームから提示された5つの確認事項に対する回答を記載します。

---

## ✅ 確認事項への回答

### 7.1 評価グレードマスターの同期

**質問**: VoiceDriveの評価グレードマスターは、医療システムの定義と完全に一致していますか？

**VoiceDriveチームの回答**: ✅ **選択肢A（完全に一致している）を確認します**

**確認内容**:

#### 総合評価グレード（7段階）
```typescript
// VoiceDrive: src/types/evaluation-notification.ts
export type OverallGrade = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

// スコア範囲（医療システムと一致）
const overallGradeConfig = {
  S: { min: 95, max: 100 },   // ✅ 一致
  'A+': { min: 90, max: 94 },  // ✅ 一致
  A: { min: 80, max: 89 },     // ✅ 一致
  'B+': { min: 70, max: 79 },  // ✅ 一致
  B: { min: 60, max: 69 },     // ✅ 一致
  C: { min: 50, max: 59 },     // ✅ 一致
  D: { min: 0, max: 49 }       // ✅ 一致
};
```

#### 施設内・法人内評価グレード（5段階）
```typescript
// VoiceDrive: src/types/evaluation-notification.ts
export type RelativeGrade = 'S' | 'A' | 'B' | 'C' | 'D';

// 相対評価範囲（医療システムと一致）
const relativeGradeConfig = {
  S: '上位5%',   // ✅ 一致
  A: '上位20%',  // ✅ 一致
  B: '上位50%',  // ✅ 一致
  C: '上位80%',  // ✅ 一致
  D: '下位20%'   // ✅ 一致
};
```

**保守方針**:
- 医療システムの評価グレード定義が変更された場合、VoiceDrive側も同期更新します
- 定義変更時は、医療システムチームからの事前通知をお願いします（1週間前）

---

### 7.2 Webhook認証方式

**質問**: 評価通知Webhookの認証方式はどのようにしますか？

**VoiceDriveチームの回答**: ✅ **選択肢A（Bearer Token認証）を採用します**

**理由**:
1. **既存システムとの統一**: Phase 3～20のWebhookと認証方式を統一
2. **実装コストの削減**: 既存のJWT認証インフラを再利用
3. **セキュリティの一貫性**: 全システムで同じ認証方式を使用
4. **保守性の向上**: 認証ロジックの一元管理

**実装仕様**:
```http
POST /api/voicedrive/webhooks/evaluation-disclosed
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "webhookId": "webhook_eval_disclosed_001",
  "timestamp": "2025-10-13T14:30:00+09:00",
  "eventType": "evaluation.disclosed",
  "data": { ... }
}
```

**JWT Payload**:
```json
{
  "iss": "medical-system",
  "sub": "webhook-service",
  "aud": "voicedrive",
  "exp": 1728835800,
  "iat": 1728832200,
  "jti": "webhook_abc123"
}
```

**確認事項**:
- JWT署名アルゴリズム: HS256（Phase 3～20と同じ）
- Token有効期限: 1時間
- Token発行: 医療システム側
- Token検証: VoiceDrive側

---

### 7.3 通知配信失敗時の処理

**質問**: 通知配信に失敗した場合、医療システム側で再送処理を行いますか？

**VoiceDriveチームの回答**: ✅ **選択肢A（医療システムが自動再送）を希望します**

**理由**:
1. **配信成功率の向上**: 自動リトライにより配信成功率が向上
2. **運用負荷の削減**: 手動再送の必要がない
3. **既存実装の活用**: Phase 3～19のリトライ機構を流用可能
4. **職員への確実な通知**: 重要な評価結果を確実に届けられる

**VoiceDrive側の対応**:
- Webhook受信エンドポイントは冪等性を保証します
- 同じ`webhookId`の重複受信を検知し、重複処理を防ぎます

**実装例**:
```typescript
// VoiceDrive側: 冪等性保証
async function handleEvaluationDisclosedWebhook(payload: WebhookPayload) {
  const { webhookId, data } = payload;

  // 重複チェック
  const existing = await prisma.evaluationNotification.findFirst({
    where: { medicalSystemEventId: webhookId }
  });

  if (existing) {
    console.log(`Duplicate webhook ignored: ${webhookId}`);
    return { success: true, notificationId: existing.id, duplicate: true };
  }

  // 新規通知作成
  const notification = await prisma.evaluationNotification.create({
    data: {
      medicalSystemEventId: webhookId,
      employeeId: data.employeeId,
      // ... 他のフィールド
    }
  });

  // 通知送信
  await sendNotification(notification);

  return { success: true, notificationId: notification.id };
}
```

**リトライ仕様の確認**:
- 最大リトライ回数: 3回（Phase 3～19と同じ）
- リトライ間隔: 指数バックオフ（1秒、2秒、4秒）
- 最終失敗時: アラート通知を管理者に送信

---

### 7.4 異議申立データの管理

**質問**: 異議申立のデータは、どちらのシステムで管理しますか？

**VoiceDriveチームの回答**: ✅ **選択肢A（医療システムで管理）を希望します**

**理由**:
1. **シングルソースオブトゥルース**: 異議申立データを一元管理
2. **既存インフラの活用**: 医療システムに既存のAppealテーブルがある
3. **データ整合性の保証**: 評価データと異議申立データを同じDBで管理
4. **VoiceDriveの役割明確化**: VoiceDriveは通知・表示・申請フォームのみ

**データ管理責任の明確化**:

| データ項目 | VoiceDrive | 医療システム | 備考 |
|-----------|-----------|-------------|------|
| **異議申立データ** | キャッシュ | ✅ マスタ | 医療システムが管理 |
| 異議申立ID | キャッシュ | ✅ マスタ | 医療システムが生成 |
| 申立内容 | キャッシュ | ✅ マスタ | 職員が入力（VD経由） |
| 審査ステータス | キャッシュ | ✅ マスタ | 医療システムが更新 |
| 回答内容 | キャッシュ | ✅ マスタ | 人事部門が作成 |
| **申請フォーム** | ✅ マスタ | - | VoiceDriveが提供 |
| 申請UI | ✅ マスタ | - | VoiceDriveで表示 |
| 入力検証 | ✅ マスタ | - | VoiceDriveで実施 |

**連携フロー**:
```
1. 職員がVoiceDriveで異議申立を作成
2. VoiceDriveが医療システムにWebhook送信
3. 医療システムがAppealレコードを作成
4. 医療システムがappealIdをVoiceDriveに返却
5. VoiceDriveがappealIdをキャッシュ（参照用）
6. 以降の更新は医療システム→VoiceDriveのWebhookで通知
```

**VoiceDrive側のデータ保持**:
- EvaluationNotification.appealId: 参照用（医療システムのAppeal.idをキャッシュ）
- EvaluationNotification.appealStatus: 表示用（医療システムから同期）
- EvaluationNotification.appealSubmittedAt: 提出日時（医療システムから同期）

---

### 7.5 通知の多言語対応

**質問**: 通知テンプレートは多言語対応が必要ですか？

**VoiceDriveチームの回答**: ✅ **選択肢A（日本語のみ）で開始します**

**理由**:
1. **初期リリースの範囲**: Phase 1～3は日本語のみで十分
2. **実装コストの削減**: 多言語対応は工数が大きい
3. **段階的な拡張**: Phase 4以降で多言語対応を検討
4. **医療システムとの整合性**: 医療システムも日本語のみ

**将来的な多言語対応計画**:

| Phase | 対応言語 | 実装時期 | 対象 |
|-------|---------|---------|------|
| Phase 1～3 | 日本語のみ | 2025-11-14～12-11 | 基本機能 |
| Phase 4 | 日本語・英語 | 2026-01～03 | 外国人職員対応 |
| Phase 5 | 中国語・ベトナム語追加 | 2026-04～06 | 技能実習生対応 |

**多言語対応の準備**:
- 通知テンプレートは国際化（i18n）を見越した設計にします
- プレースホルダー形式（`{employeeName}`等）を使用
- 言語ファイルの分離構造（`/locales/ja.json`, `/locales/en.json`）

**実装例（将来対応）**:
```typescript
// 通知テンプレート（将来対応）
const notificationTemplates = {
  ja: {
    evaluation_disclosure: {
      title: '評価結果開示のお知らせ',
      body: '{employeeName} 様\n\n{period}の評価結果が開示されました。'
    }
  },
  en: {
    evaluation_disclosure: {
      title: 'Evaluation Result Disclosure Notice',
      body: 'Dear {employeeName},\n\nYour evaluation result for {period} has been disclosed.'
    }
  }
};
```

---

## 📊 実装影響の整理

### 医療システム側の実装影響

| 項目 | 影響範囲 | 推定工数 |
|------|---------|---------|
| **API-11実装** | 評価結果開示Webhook送信 | 2～3時間 |
| **API-12実装** | 異議申立受理Webhook送信 | 2～3時間 |
| **API-13実装** | 通知配信完了Webhook受信 | 1～2時間 |
| **API-14実装** | 通知既読Webhook受信 | 1～2時間 |
| **Evaluationテーブル拡張** | 通知フラグ追加 | 1時間 |
| **統合テスト** | Webhook送受信テスト | 2～3時間 |

**合計工数**: 9～14時間（約1.5～2日）

---

### VoiceDrive側の実装影響

| 項目 | 影響範囲 | 推定工数 |
|------|---------|---------|
| **EvaluationNotificationテーブル作成** | 30フィールド追加 | 2時間 |
| **NotificationSettingsテーブル作成** | 12フィールド追加 | 2時間 |
| **Userテーブルリレーション追加** | 2リレーション追加 | 0.5時間 |
| **Webhook受信実装** | API-11, API-12受信 | 4時間 |
| **Webhook送信実装** | API-13, API-14送信 | 4時間 |
| **通知送信サービス実装** | メール・プッシュ通知 | 12時間 |
| **通知一覧画面実装** | フィルタ・ソート機能 | 8時間 |
| **通知設定画面実装** | 設定UI | 4時間 |
| **リマインダー機能実装** | バッチ処理 | 4時間 |
| **統合テスト** | E2Eテスト | 4時間 |

**合計工数**: 44.5時間（約6日）

---

## 📅 更新後のスケジュール

### Phase 1: 基本通知機能（2025-11-14 ～ 2025-11-27）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-11-14 | 医療システム | API-11実装開始 |
| 2025-11-14～15 | VoiceDrive | テーブル作成、Webhook受信実装 |
| 2025-11-15 | 医療システム | API-11実装完了 |
| 2025-11-16～17 | 医療システム | API-12実装 |
| 2025-11-16～20 | VoiceDrive | 通知送信サービス実装 |
| 2025-11-18～19 | 両チーム | Webhook送信テスト |
| 2025-11-21～25 | VoiceDrive | 通知一覧画面実装 |
| 2025-11-26～27 | 両チーム | Phase 1統合テスト |

**Phase 1完了基準**:
- ✅ 評価結果開示時に通知が送信される
- ✅ 職員が通知を確認できる
- ✅ 異議申立フォームに遷移できる

---

### Phase 2: 配信状況追跡（2025-11-28 ～ 2025-12-04）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-11-28～29 | 医療システム | API-13実装（配信完了受信） |
| 2025-11-28～12-01 | VoiceDrive | Webhook送信実装（配信・既読） |
| 2025-11-30～12-01 | 医療システム | API-14実装（既読受信） |
| 2025-12-02～03 | 医療システム | Evaluationテーブル拡張 |
| 2025-12-02～03 | VoiceDrive | 配信状況表示画面実装 |
| 2025-12-04 | 両チーム | Phase 2統合テスト |

**Phase 2完了基準**:
- ✅ 通知の配信状況を追跡できる
- ✅ 職員の既読状況を医療システムで確認できる

---

### Phase 3: リマインダー・管理機能（2025-12-05 ～ 2025-12-11）

| 日付 | 担当 | 実装内容 |
|------|------|---------|
| 2025-12-05～07 | VoiceDrive | リマインダー機能実装 |
| 2025-12-08～10 | VoiceDrive | 統計・管理画面実装 |
| 2025-12-11 | 両チーム | Phase 3統合テスト・最終確認 |

**Phase 3完了基準**:
- ✅ 締切前にリマインダーが送信される
- ✅ 通知配信統計を確認できる
- ✅ 本番リリース準備完了

---

## 🧪 テスト計画

### 統合テスト項目

| テストケース | テスト内容 | 担当 |
|-------------|-----------|------|
| **TC-1: 評価開示通知** | API-11送信、VD受信、通知送信 | 両チーム |
| **TC-2: 異議申立提出** | VDで申立、API-12送信、医療システム受信 | 両チーム |
| **TC-3: 配信状況追跡** | API-13送信、医療システム受信確認 | 両チーム |
| **TC-4: 既読状況追跡** | API-14送信、医療システム受信確認 | 両チーム |
| **TC-5: 通知フィルタ・ソート** | 未読・緊急フィルタ、締切順ソート | VoiceDrive |
| **TC-6: リマインダー送信** | 締切3日前に自動送信 | VoiceDrive |
| **TC-7: 冪等性保証** | 同じwebhookIdの重複処理防止 | VoiceDrive |
| **TC-8: JWT認証** | Bearer Token検証 | 両チーム |

---

## 📝 次のアクション

### VoiceDriveチーム

- [x] **2025-10-13**: 確認事項への回答書作成完了
- [ ] **2025-10-14**: 医療システムチームへ回答書送付
- [ ] **2025-10-20**: 医療システムチームからの最終確認待ち
- [ ] **2025-11-01**: Phase 1開発準備開始
- [ ] **2025-11-14**: Phase 1開発開始

### 医療システムチーム（依頼事項）

- [ ] **2025-10-14**: 回答書確認
- [ ] **2025-10-20**: 最終仕様確定
- [ ] **2025-11-01**: API-11・API-12実装準備
- [ ] **2025-11-14**: API-11実装開始
- [ ] **2025-11-18**: Webhook送信テスト実施

---

## 🔗 関連ドキュメント

- **MEDICAL-RESPONSE-2025-1013-004**: EvaluationNotificationPage 医療システム確認結果書
- **VD-MASTER-2025-1013-004**: EvaluationNotificationPage 暫定マスターリスト
- **VD-DB-ANALYSIS-2025-1013-004**: EvaluationNotificationPage DB要件分析

---

## 📞 連絡先

**VoiceDriveチーム**:
- プロジェクトリーダー: [担当者名]
- 技術担当: [担当者名]
- Email: voicedrive-team@example.com
- Slack: #voicedrive-integration

---

## ✅ 承認

**VoiceDriveチーム**: ✅ 承認済み
**承認日**: 2025年10月13日
**次回更新予定**: 医療システムチームからの最終確認受領後（2025-10-20予定）

---

**文書終了**

最終更新: 2025年10月13日
バージョン: 1.0
ステータス: 医療システムチーム確認待ち
