# CareerSelectionStation統合実装 - VoiceDriveチーム回答書

**文書番号**: VD-RESPONSE-CS-2025-1018-001
**作成日**: 2025年10月18日
**送信元**: VoiceDriveチーム
**送信先**: 医療システムチーム
**参照文書**: MED-NOTICE-CS-2025-1018-001（医療チームからの連絡書）

---

## 📋 回答サマリー

医療システムチーム様

お疲れ様です。VoiceDriveチームです。

Phase 22（キャリア選択ステーション）のマスタープラン統合完了のご連絡、ありがとうございました。

いただいた3つの確認事項について、以下の通り回答いたします。

---

## ✅ 確認事項への回答

### 確認-1: PersonalStationページへのコースセクション追加位置

**回答**: ❌ **いずれも該当せず - 独立ページとして実装済み**

**現状の実装**:

キャリア選択ステーション機能は、PersonalStationとは**独立した専用ページ**として既に実装されています：

- **URL**: `/career-selection-station`
- **実装ファイル**:
  - `src/pages/career-selection-station/CareerSelectionStationPage.tsx`
  - `src/pages/career-selection-station/ChangeRequestPage.tsx`
  - `src/pages/career-selection-station/MyRequestsPage.tsx`

**ページ構成**（3つのサブページ）:

| # | サブページ名 | URL | 機能 |
|---|------------|-----|------|
| 1 | **マイキャリア** | `/career-selection-station` | 現在のコース表示、職員情報、制度説明 |
| 2 | **コース変更申請** | `/career-selection-station/change-request` | 変更申請フォーム、添付ファイルアップロード |
| 3 | **申請履歴** | `/career-selection-station/my-requests` | 過去の申請一覧、承認状況確認 |

**PersonalStationには統合しない理由**:

1. **機能の独立性**: キャリアコース選択は年1回の重要な意思決定であり、PersonalStationの「情報確認」機能とは性質が異なる
2. **変更申請フローの複雑さ**: 4ステップの申請フロー（コース選択→理由入力→添付ファイル→確認）を持つため、独立ページの方が適切
3. **添付ファイル管理**: 特例変更時の証明書アップロードがあるため、専用UIが必要
4. **既存実装の活用**: 既に3つのサブページが完成しており、再実装のコストが大きい

**ナビゲーション**:

キャリア選択ステーションへは以下からアクセス可能です：
- メインメニュー「ステーション」セクション内
- PersonalStationページからのリンクボタン（「キャリアコースを確認」）

**結論**: PersonalStationへの統合は行わず、**現在の独立ページ構成を維持**します。

---

### 確認-2: コース変更申請フォームのUI設計

**回答**: ✅ **Option C（既に実装済み）**

**現状の実装**:

コース変更申請フォームは、**独立した新規ページ**として既に実装されています：

- **URL**: `/career-selection-station/change-request`
- **実装ファイル**: `src/pages/career-selection-station/ChangeRequestPage.tsx`

**実装済みのUI構成**:

```
ChangeRequestPage
├─ 現在のコース表示（読み取り専用）
├─ 希望コース選択（4つのカードボタン: A/B/C/D）
│  └─ 各カードに給与倍率、勤務条件を表示
├─ 変更理由選択（ラジオボタン）
│  ├─ 年1回定期変更
│  ├─ 特例: 妊娠・出産
│  ├─ 特例: 介護
│  └─ 特例: 疾病
├─ 理由詳細（テキストエリア、1000文字まで）
├─ 希望適用日（日付ピッカー）
├─ 添付ファイル（特例変更時のみ表示）
│  └─ ドラッグ&ドロップ + ファイル選択ボタン
└─ アクションボタン
   ├─ 申請内容を確認（モーダル表示）
   └─ 戻る
```

**確認モーダル**:
- 申請内容の最終確認
- 注意事項の表示
- 「申請を送信」ボタン

**モーダルダイアログ形式を採用しなかった理由**:

1. **入力項目の多さ**: 6つの入力項目（コース、理由、詳細、日付、添付ファイル、確認）があり、モーダル内では操作しづらい
2. **添付ファイルアップロード**: ドラッグ&ドロップUIが必要で、モーダルでは実装が複雑
3. **年1回の重要操作**: 慎重に入力できる専用ページが適切
4. **モバイル対応**: モーダルはスマホで操作しづらいが、専用ページならスクロールで対応可能

**結論**: 現在の**独立ページ形式を維持**します。

---

### 確認-3: Webhook受信後のUI更新タイミング

**回答**: ✅ **Option A（推奨通り）**

**実装方針**:

Webhook受信時にデータベース更新 + **次回ページアクセス時に反映**

**理由**:

医療システムチームの推奨理由に完全同意します：
1. **緊急性が低い**: コース変更の承認/却下は数日～数週間かかる人事プロセスであり、リアルタイム通知は不要
2. **SSE実装コスト**: Phase 20（面談予約）ではSSEを実装しましたが、本Phaseでは費用対効果が低い
3. **メール通知で十分**: 職員はメールで承認/却下を知り、次回ログイン時に詳細を確認する運用で問題なし

**実装詳細**:

#### Webhook受信処理（サーバー側）

**エンドポイント**: `POST /api/webhooks/career-course/change-approved`

```typescript
// src/api/routes/webhook.routes.ts（追加実装予定）
router.post('/career-course/change-approved', async (req, res) => {
  // 1. HMAC署名検証
  const signature = req.headers['x-medical-system-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { requestId, employeeId, newCourseCode, effectiveDate } = req.body.data;

  // 2. データベース更新は行わない（VoiceDriveはデータを保存しないため）
  // 医療システムがマスタなので、次回API呼び出し時に最新データを取得

  // 3. メール通知送信
  await sendEmail({
    to: employeeId,
    subject: 'キャリアコース変更承認のお知らせ',
    template: 'career-course-approved',
    data: {
      newCourseCode,
      effectiveDate,
      requestId
    }
  });

  res.status(200).json({ success: true });
});
```

#### UI更新タイミング（クライアント側）

**マイキャリアページ（CareerSelectionStationPage.tsx）**:

```typescript
// ページアクセス時に常に最新データをAPI取得
useEffect(() => {
  const fetchCareerCourseData = async () => {
    const response = await fetch(`/api/v2/employees/${employeeId}/career-course`);
    const data = await response.json();
    setCurrentCourse(data.currentCourse); // 最新のコース情報
  };

  fetchCareerCourseData();
}, []); // ページマウント時に1回だけ実行
```

**申請履歴ページ（MyRequestsPage.tsx）**:

```typescript
// ページアクセス時に常に最新データをAPI取得
useEffect(() => {
  const fetchMyRequests = async () => {
    const response = await fetch(`/api/v2/career-course/my-requests`);
    const data = await response.json();
    setRequests(data.requests); // 最新の申請一覧（承認状況含む）
  };

  fetchMyRequests();
}, []);
```

**メール通知テンプレート**:

```
件名: キャリアコース変更承認のお知らせ

○○様

お疲れ様です。人事部です。

申請いただいたキャリアコース変更が承認されました。

- 変更後のコース: Aコース（全面協力型）
- 適用開始日: 2026年4月1日
- 申請ID: req-003

詳細は以下のリンクからご確認ください：
https://voicedrive.example.com/career-selection-station/my-requests

VoiceDriveシステム
```

**VoiceDrive側で保存しないデータ**:

- キャリアコース情報（全て医療システムから取得）
- 申請履歴（全て医療システムから取得）
- 承認状況（全て医療システムから取得）

**VoiceDrive側のデータベースは更新不要**:

理由: VoiceDriveは**Single Source of Truth（医療システム）からAPIでリアルタイム取得**するため、自身のDBには一切保存しません。

**結論**: **Option A**を採用し、Webhook受信時はメール通知のみ、UI更新は次回ページアクセス時に医療システムAPIから最新データを取得します。

---

## 📊 VoiceDrive側の実装状況

### 既存実装（完了済み）

| # | 実装項目 | ファイル | 状態 |
|---|---------|---------|------|
| 1 | マイキャリアページ | CareerSelectionStationPage.tsx | ✅ 完了 |
| 2 | コース変更申請ページ | ChangeRequestPage.tsx | ✅ 完了 |
| 3 | 申請履歴ページ | MyRequestsPage.tsx | ✅ 完了 |
| 4 | 型定義 | career-course.ts | ✅ 完了 |
| 5 | APIサービス | careerCourseService.ts | ✅ 完了（モック） |
| 6 | ルーティング | AppRouter.tsx | ✅ 完了 |
| 7 | メニュー設定 | menuConfig.ts | ✅ 完了 |

### 追加実装が必要な項目（医療システムAPI実装後）

| # | 実装項目 | ファイル | 工数 |
|---|---------|---------|------|
| 1 | Webhook受信エンドポイント | webhook.routes.ts | 0.5人日 |
| 2 | HMAC署名検証 | webhookVerifier.ts | 0.5人日 |
| 3 | メール通知テンプレート | email/career-course-approved.html | 0.5人日 |
| 4 | メール通知テンプレート | email/career-course-rejected.html | 0.5人日 |
| 5 | APIサービスのモック削除 | careerCourseService.ts | 0.5人日 |
| 6 | 環境変数設定 | .env.production | 0.5人日 |
| 7 | 統合テスト | tests/career-course.test.ts | 2人日 |

**合計**: 5人日（医療システムチームの見積もりと一致）

---

## 🎯 VoiceDrive側の実装方針まとめ

### データ管理責任分界点

**Single Source of Truth**: **医療職員管理システム**

| データ項目 | 管理責任 | VoiceDriveの役割 |
|-----------|---------|------------------|
| コース定義マスタ | 医療システム | APIで取得して表示 |
| コース選択履歴 | 医療システム | APIで取得して表示 |
| 変更申請データ | 医療システム | 申請フォーム提供、POST送信 |
| 承認/却下状態 | 医療システム | APIで取得して表示 |
| 添付ファイル | 医療システム（S3） | アップロードUI提供 |

**VoiceDrive側のデータベース**: **一切保存しません**

### UI設計方針

**独立ページ構成**: PersonalStationには統合せず、専用ページを維持

**理由**:
1. 機能の複雑性（申請フロー、添付ファイル）
2. 年1回の重要操作（専用UIが適切）
3. 既存実装の完成度（再実装コスト大）

### Webhook連携方針

**Option A（推奨通り）**: メール通知 + 次回アクセス時に最新データAPI取得

**理由**:
1. 緊急性が低い（数日～数週間のプロセス）
2. SSE実装コスト削減
3. VoiceDriveはデータを保存しないため、DB更新不要

---

## 📅 実装スケジュール（VoiceDrive側）

### Phase 1.6完了後の実装予定

| Week | 作業内容 | 工数 |
|------|---------|------|
| **Week 1** | Webhook受信実装、署名検証 | 1人日 |
| **Week 2** | メール通知実装（2テンプレート） | 1人日 |
| **Week 2** | APIサービスのモック削除、実API接続 | 0.5人日 |
| **Week 2** | 環境変数設定、デプロイ準備 | 0.5人日 |
| **Week 3** | 統合テスト（医療チームと合同） | 2人日 |

**総実装期間**: 約3週間（5人日）

**依存関係**:
- ✅ Phase 1.6（統合DB構築）完了後に実装開始可能
- ⚠️ 医療システム側のAPI実装完了が前提
- ⚠️ Webhookシークレット共有が必要

---

## ✅ 統合テストシナリオ（VoiceDrive側提案）

### テストシナリオ（4つ）

#### シナリオ1: 通常変更（年1回定期）

**前提条件**:
- テストユーザー（TEST-EMP-001）が現在Bコース
- 最後の変更から1年以上経過

**テスト手順**:
1. VoiceDrive: ChangeRequestPageで「Aコース」選択
2. VoiceDrive: 変更理由「年1回定期変更」選択
3. VoiceDrive: 理由詳細入力、希望適用日選択
4. VoiceDrive: 申請送信 → 医療システムAPI呼び出し
5. 医療システム: 申請受付、`career_course_change_requests`にINSERT
6. 医療システム: 人事部が承認操作
7. 医療システム: VoiceDriveにWebhook送信（`career_course.change_approved`）
8. VoiceDrive: Webhook受信、メール通知送信
9. VoiceDrive: 次回ページアクセス時、最新データ表示（Aコースに変更済み）

**期待結果**: ✅ コース変更成功、メール受信、UI更新

---

#### シナリオ2: 特例変更（妊娠・出産）

**前提条件**:
- テストユーザー（TEST-EMP-002）が現在Bコース
- 最後の変更から6ヶ月経過（年1回制限未満）

**テスト手順**:
1. VoiceDrive: ChangeRequestPageで「Dコース」選択
2. VoiceDrive: 変更理由「特例: 妊娠・出産」選択
3. VoiceDrive: 妊娠証明書PDFをアップロード
4. VoiceDrive: 申請送信 → 医療システムAPI呼び出し（添付ファイル含む）
5. 医療システム: S3に証明書保存、申請受付
6. 医療システム: 人事部が証明書確認、承認操作
7. 医療システム: VoiceDriveにWebhook送信
8. VoiceDrive: Webhook受信、メール通知送信
9. VoiceDrive: 次回ページアクセス時、Dコースに変更済み

**期待結果**: ✅ 年1回制限を無視して変更成功、添付ファイル保存確認

---

#### シナリオ3: 申請却下

**前提条件**:
- テストユーザー（TEST-EMP-003）が現在Cコース

**テスト手順**:
1. VoiceDrive: ChangeRequestPageで「Aコース」選択
2. VoiceDrive: 申請送信
3. 医療システム: 人事部が却下操作（理由: 現在の部署で必要な人材のため）
4. 医療システム: VoiceDriveにWebhook送信（`career_course.change_rejected`）
5. VoiceDrive: Webhook受信、メール通知送信（却下理由含む）
6. VoiceDrive: MyRequestsPageで却下ステータス確認

**期待結果**: ✅ 却下メール受信、申請履歴に却下理由表示

---

#### シナリオ4: 申請取り下げ

**前提条件**:
- テストユーザー（TEST-EMP-004）が既に申請中（承認待ち）

**テスト手順**:
1. 医療システム: 職員が直接医療システムで取り下げ操作
2. 医療システム: `career_course_change_requests.approval_status`を`withdrawn`に更新
3. VoiceDrive: MyRequestsPageアクセス → 最新データAPI取得
4. VoiceDrive: 取り下げステータス表示

**期待結果**: ✅ 取り下げ状態が正しく表示される

---

## 🔐 セキュリティ要件

### Webhook署名検証

**HMAC-SHA256方式**: Phase 3～21と統一

**VoiceDrive側の実装**（既存の`webhookVerifier.ts`を使用）:

```typescript
import { verifyWebhookSignature } from '@/services/webhookVerifier';

router.post('/career-course/change-approved', (req, res) => {
  const signature = req.headers['x-medical-system-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 処理続行
});
```

### 環境変数

**必要な環境変数**:

```env
# 医療システムAPI
MEDICAL_SYSTEM_API_URL=https://medical-system-api.example.com

# Webhook署名検証用
MEDICAL_SYSTEM_WEBHOOK_SECRET=<医療システムから共有されるシークレット>

# メール送信（既存）
SMTP_HOST=smtp.example.com
SMTP_USER=noreply@voicedrive.example.com
SMTP_PASS=<パスワード>
```

---

## 📞 次のアクション

### VoiceDriveチーム側

1. **本回答書の送付**: 2025年10月18日（本日）
2. **医療チームからの最終仕様確定待機**: 2025年10月28日まで
3. **Phase 1.6完了待機**: 医療システムチームと同期
4. **実装開始**: Phase 1.6完了後
5. **統合テスト準備**: テストデータ準備、Webhookシークレット共有

### 医療システムチーム側

1. **本回答書の確認**: 2025年10月21日まで
2. **最終仕様確定**: 2025年10月28日
3. **Phase 1.6完了後、実装開始**: DB構築完了次第

### 両チーム共同

1. **統合テスト**: Phase 1-5実装完了後
2. **本番リリース**: 統合テスト成功後

---

## 📎 関連ドキュメント

### VoiceDriveチームから既に送付済み

1. **DB要件分析**
   - ファイル名: `career-selection-station_DB要件分析_20251018.md`
   - 文書番号: CS-DB-REQ-2025-1018-001

2. **暫定マスターリスト**
   - ファイル名: `career-selection-station暫定マスターリスト_20251018.md`
   - 文書番号: CS-MASTER-2025-1018-001

### 医療システムチームから受領済み

1. **統合マスターリスト最終版**
   - ファイル名: `CareerSelectionStation_統合マスターリスト_FINAL_20251018.md`
   - 文書番号: MASTER-CS-2025-1018-FINAL

2. **医療システム確認結果**
   - ファイル名: `CareerSelectionStation_医療システム確認結果_20251018.md`
   - 文書番号: MS-CONFIRM-CS-2025-1018-001

3. **連絡書**（本回答書の参照文書）
   - 文書番号: MED-NOTICE-CS-2025-1018-001

---

## 🙏 謝辞

医療システムチーム様

Phase 22（キャリア選択ステーション）のマスタープラン統合、誠にありがとうございます。

3つの確認事項について、VoiceDrive側の既存実装状況と実装方針を踏まえて回答させていただきました。

独立ページ構成を維持する方針となりますが、これにより以下のメリットがあります：
- 既存実装の完成度を活用（再実装コスト削減）
- 年1回の重要操作に適した専用UI
- 添付ファイルアップロードなど複雑な機能に対応

引き続き、Phase 1.6完了後の実装に向けて準備を進めてまいります。

ご不明点やご懸念がございましたら、いつでもお気軽にお問い合わせください。

---

**VoiceDriveチーム**
**プロジェクトリード**: VoiceDrive開発チーム
**技術リード**: VoiceDrive開発チーム
**作成日**: 2025年10月18日
**文書番号**: VD-RESPONSE-CS-2025-1018-001

---

**文書終了**
