# Re: VoiceDrive人事お知らせ統合 - 最終確認への回答

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム開発チーム様**

---

## 1. お礼のご挨拶

職員カルテシステム開発チームの皆様

この度は、詳細な受領確認および高評価をいただき、誠にありがとうございます。

⭐⭐⭐⭐⭐（満点）という過分な評価をいただき、当チーム一同、大変励みになっております。
引き続き、Phase 7の統合に向けて全力で協力させていただきます。

---

## 2. ご質問への回答

### 2.1 お知らせ受信APIの正式な仕様書について

✅ **既に作成済みです**

以下のドキュメントをご確認ください：

```
mcp-shared/docs/VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md
```

#### 仕様書の構成（13章構成）

| 章 | 内容 |
|----|------|
| 1 | 概要（送信タイミング、配信内容） |
| 2 | APIエンドポイント仕様（認証方式） |
| 3 | リクエストフォーマット（基本構造、具体例4件） |
| 4 | レスポンスフォーマット（成功・エラー） |
| 5 | バリデーションルール（必須フィールド、条件付き必須） |
| 6 | アクションボタン設定詳細（3種類） |
| 7 | 配信対象の設定（全職員、部門別、個人別、役職別） |
| 8 | セキュリティ（HTTPS、JWT、IPホワイトリスト、レート制限） |
| 9 | 実装例（Node.js/TypeScript、Next.js API Route） |
| 10 | テスト手順（cURL、統合テストシナリオ） |
| 11 | トラブルシューティング（よくあるエラー、デバッグ） |
| 12 | 変更履歴 |
| 13 | サポート |

#### 実装コードとの対応関係

仕様書は、実装コード（`hr-announcements.routes.ts`）と完全に一致しています：

| 項目 | 仕様書 | 実装コード |
|------|-------|----------|
| **バリデーション** | 章5に記載 | `validateAnnouncementRequest()` |
| **カテゴリマッピング** | 章3に記載 | `convertToInternalFormat()` |
| **エラーレスポンス** | 章4に記載 | HTTPステータスコード |
| **実装例** | 章9に記載 | そのまま使用可能 |

**ご安心ください**：
- 仕様書と実装コードは完全に同期しています
- テストケース作成にそのまま使用できます
- 不明点があればお気軽にご質問ください

---

### 2.2 surveySubCategoryフィールドについて

#### 現在の仕様

VoiceDrive内部では以下の定義を使用しています：

```typescript
// src/types/hr-announcements.ts (行13)
surveySubCategory?: 'satisfaction' | 'workenv' | 'education' | 'welfare' | 'system' | 'event' | 'other';
```

| 値 | 意味 | 用途 |
|---|------|------|
| `satisfaction` | 満足度調査 | 職場満足度、サービス満足度など |
| `workenv` | 職場環境調査 | 労働環境、安全衛生など |
| `education` | 教育研修調査 | 研修効果測定、ニーズ調査など |
| `welfare` | 福利厚生調査 | 福利厚生の利用状況、要望など |
| `system` | システム調査 | IT・システムの使用感など |
| `event` | イベント調査 | イベントの感想、参加希望など |
| `other` | その他 | 上記以外の調査 |

#### Phase 7時点での対応

**回答**：Phase 7時点では**実装不要**です。

**理由**：
1. このフィールドは**VoiceDrive内部の分類用**であり、外部連携では不要
2. お知らせ受信API（`MedicalSystemAnnouncementRequest`）では**含まれていません**
3. 将来的に必要になった場合、API v2.0で追加を検討します

#### 将来的な拡張（参考情報）

もし将来的に`surveySubCategory`を職員カルテシステムから指定したい場合、以下のように拡張できます：

```typescript
// 将来的な拡張例（API v2.0）
interface MedicalSystemAnnouncementRequest {
  // ...既存フィールド

  // アンケートサブカテゴリ（category='survey'の場合のみ）
  surveySubCategory?: 'satisfaction' | 'workenv' | 'education' | 'welfare' | 'system' | 'event' | 'other';
}
```

**現時点では実装不要です。Phase 7はAPI v1.0の範囲で進めてください。**

---

### 2.3 統計Webhookの送信頻度について

#### 現在の実装状況

**回答**：現時点では**`stats.updated`（リアルタイム）のみ**が実装されています。

#### 実装済みのイベント

| イベント | 送信タイミング | 実装状況 | 実装場所 |
|---------|--------------|---------|---------|
| **`stats.updated`** | アクションボタンクリック時 | ✅ **実装済み** | `HRAnnouncementsPage.tsx:291-302` |
| `stats.hourly` | 1時間ごとのバッチ集計 | ❌ 未実装（将来対応） | - |
| `stats.daily` | 日次サマリー | ❌ 未実装（将来対応） | - |

#### リアルタイム送信の動作

```typescript
// src/components/hr-announcements/HRAnnouncementsPage.tsx (行291-302)
const handleResponse = async (announcementId: string, responseType: string) => {
  // 楽観的UI更新
  const updatedAnnouncements = announcements.map(ann =>
    ann.id === announcementId
      ? { ...ann, stats: { ...ann.stats!, responses: (ann.stats?.responses || 0) + 1 } }
      : ann
  );
  setAnnouncements(updatedAnnouncements);

  const updatedAnnouncement = updatedAnnouncements.find(ann => ann.id === announcementId);

  if (updatedAnnouncement) {
    // 職員カルテシステムに統計送信（リアルタイム）
    const medicalService = MedicalIntegrationService.getInstance();
    const success = await medicalService.sendStatsToMedicalTeam(
      updatedAnnouncement,
      'stats.updated'  // ← リアルタイムイベント
    );
  }
};
```

#### 送信頻度の設定

**現時点では選択不可**です。すべて`stats.updated`（リアルタイム）で送信されます。

**将来的な拡張計画**：
- Phase 8以降で、バッチ送信機能を実装予定
- 職員カルテ側で受信頻度を選択可能にする予定
  - 例：「リアルタイム + 日次サマリー」の組み合わせ

#### Phase 7での対応

**職員カルテ側の実装方針**：

Webhook受信API（`/api/voicedrive/stats`）では、以下のようにイベント種別を判定してください：

```typescript
// src/app/api/voicedrive/stats/route.ts
export async function POST(request: NextRequest) {
  const payload: StatsWebhookPayload = await request.json();

  switch (payload.event) {
    case 'stats.updated':
      // リアルタイム更新（現在はこれのみ送信される）
      await saveRealtimeStats(payload);
      break;

    case 'stats.hourly':
      // 将来的に実装（Phase 8以降）
      await saveHourlyStats(payload);
      break;

    case 'stats.daily':
      // 将来的に実装（Phase 8以降）
      await saveDailyStats(payload);
      break;
  }

  return NextResponse.json({ success: true });
}
```

**Phase 7時点では、`stats.updated`のみの受信処理を実装してください。**

---

## 3. Phase 7開始時にご提供する情報

### 3.1 認証情報

以下を**Phase 7キックオフ時**にご提供いたします：

#### 提供予定の認証情報

| 項目 | 用途 | 形式 |
|------|------|------|
| **VOICEDRIVE_API_TOKEN** | 職員カルテ→VoiceDrive認証 | JWT形式（Bearer Token） |
| **REACT_APP_MEDICAL_WEBHOOK_SECRET** | VoiceDrive→職員カルテ署名検証 | 256bit共有秘密鍵 |
| **REACT_APP_MEDICAL_API_TOKEN** | VoiceDrive→職員カルテ認証 | Bearer Token |

#### セキュアな共有方法

以下のいずれかの方法でご共有します：

1. **1Password共有Vault**（推奨）
   - セキュアノートで保存
   - アクセス権限を職員カルテチームに付与

2. **Slack DM（暗号化メッセージ）**
   - GPG暗号化したメッセージ
   - 公開鍵は事前に交換

3. **環境変数ファイル（暗号化済み）**
   - `.env.encrypted`ファイル
   - 復号化パスワードは別途共有

**希望の共有方法をご教示ください。**

---

### 3.2 CORS設定の更新

#### 現在の設定

```typescript
// src/api/server.ts (行31-40)
app.use(cors({
  origin: [
    'http://localhost:3000',      // ✅ 職員カルテ開発環境（既に設定済み）
    'http://localhost:3001',      // ✅ VoiceDrive開発環境
    'https://voicedrive.ohara-hospital.jp',  // VoiceDrive本番
    'https://staging.voicedrive.ohara-hospital.jp'  // VoiceDriveステージング
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

#### 追加予定の設定

職員カルテシステムの本番ドメインをご教示いただければ、以下のように追加いたします：

```typescript
origin: [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://voicedrive.ohara-hospital.jp',
  'https://staging.voicedrive.ohara-hospital.jp',
  'https://medical-staff-system.example.com',        // ← 追加予定（本番）
  'https://staging.medical-staff-system.example.com' // ← 追加予定（ステージング）
],
```

**ご確認事項**：
- 職員カルテシステムの本番ドメイン名をご教示ください
- ステージング環境のドメイン名もご教示ください

---

### 3.3 IPアドレスリスト

#### 提供予定時期

**本番環境構築後**（Phase 7完了後、デプロイ時）にご提供いたします。

#### 提供予定の情報

| 環境 | IPアドレス | 用途 | 提供時期 |
|------|-----------|------|---------|
| **Production** | 確定次第ご連絡 | VoiceDrive本番サーバー | 本番デプロイ時 |
| **Staging** | 確定次第ご連絡 | VoiceDriveステージング | ステージング構築時 |
| **Development** | 動的IP（ngrok） | ローカル開発 | Phase 7開始時 |

#### 開発環境でのテスト方法

**ngrokを使用した統合テスト**：

```bash
# VoiceDrive側（開発環境）
cd src/api
npm start  # ポート: 4000

# 別ターミナルでngrok起動
ngrok http 4000
# → https://xxxx-xxxx-xxxx.ngrok-free.app

# このURLを職員カルテチームに共有
# お知らせ受信API: https://xxxx-xxxx-xxxx.ngrok-free.app/api/hr-announcements
```

**IPホワイトリストが不要な理由**：
- ngrokは動的IPのため、ホワイトリスト設定不可
- 代わりに**Bearer Token認証**で保護
- 本番環境では固定IPでホワイトリスト設定

---

### 3.4 統合テスト日程

#### テスト実施日程（提案）

職員カルテチーム様のご提案（Phase 7開始後6日目、2-3時間）で問題ございません。

**VoiceDrive側の準備**：

| 日程 | VoiceDrive側の作業 | 職員カルテ側の作業 |
|------|------------------|------------------|
| **Day 1** | ngrok環境構築、認証情報発行 | 認証情報受領、環境変数設定 |
| **Day 2-5** | お知らせ受信APIの動作確認 | お知らせ送信機能実装 |
| **Day 6** | **統合テスト（合同）** | **統合テスト（合同）** |
| **Day 7** | 結果報告書作成 | 結果報告書作成 |

#### 統合テスト実施内容

**テストシナリオ1：お知らせ送信〜統計受信**（60分）

```
1. 職員カルテ: 全職員向けアンケート作成
   → VoiceDrive: 受信確認（201 Created）

2. 職員カルテ: 部門別面談案内作成
   → VoiceDrive: 受信確認（201 Created）

3. VoiceDrive: お知らせ表示確認（手動）
   → 期待: 職員画面に正しく表示

4. VoiceDrive: アクションボタンクリック（手動）
   → 期待: 統計情報がWebhookで送信

5. 職員カルテ: 統計受信確認
   → 期待: DB保存 → ダッシュボード表示
```

**テストシナリオ2：Webhook署名検証**（30分）

```
1. 正しい署名でWebhook送信
   → 期待: 200 OK

2. 不正な署名でWebhook送信
   → 期待: 401 Unauthorized

3. 署名なしでWebhook送信
   → 期待: 401 Unauthorized
```

**テストシナリオ3：エラーケース**（30分）

```
1. バリデーションエラー（title > 500文字）
   → 期待: 400 Bad Request

2. 認証エラー（無効なトークン）
   → 期待: 401 Unauthorized

3. ソースシステム不正（X-Source-System不一致）
   → 期待: 403 Forbidden
```

**所要時間：合計2時間**

#### テスト実施方法

**推奨：Zoom/Google Meetで画面共有**

- VoiceDrive側：ngrok URL、APIログを共有
- 職員カルテ側：お知らせ作成画面、ダッシュボードを共有
- リアルタイムで結果を確認しながら進行

**ご都合の良い日時をご教示ください。**

---

## 4. 補足情報

### 4.1 お知らせ受信APIのレート制限

現在の設定：

```typescript
// src/api/server.ts (行60-70)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1分
  max: 100,                 // 100リクエスト/分
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'APIリクエストが多すぎます。'
    }
  }
});
```

**職員カルテ側の注意点**：
- 1分間に100リクエストまで
- 超過時は429 Too Many Requestsが返却
- リトライ時は指数バックオフを推奨

### 4.2 エラーハンドリングのベストプラクティス

職員カルテ側での推奨実装：

```typescript
// お知らせ送信時のエラーハンドリング
async function sendToVoiceDrive(announcement: HRAnnouncement) {
  try {
    const response = await fetch(VOICEDRIVE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOICEDRIVE_API_TOKEN}`,
        'X-Source-System': 'medical-staff-system',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(announcement)
    });

    if (!response.ok) {
      const error = await response.json();

      // エラー種別に応じた処理
      switch (response.status) {
        case 400: // バリデーションエラー
          console.error('バリデーションエラー:', error.error.details);
          // → ユーザーに入力エラーを表示
          break;

        case 401: // 認証エラー
          console.error('認証エラー:', error.error.message);
          // → トークン再発行が必要
          break;

        case 429: // レート制限
          console.warn('レート制限に達しました。1分後に再試行します。');
          // → 指数バックオフでリトライ
          await sleep(60000);
          return sendToVoiceDrive(announcement);

        case 500: // サーバーエラー
          console.error('VoiceDriveサーバーエラー:', error.error.message);
          // → 管理者に通知、後でリトライ
          break;
      }

      throw new Error(`VoiceDrive API error: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('お知らせ送信エラー:', error);
    throw error;
  }
}
```

### 4.3 統計Webhookの受信確認

職員カルテ側での推奨実装：

```typescript
// Webhook受信時のログ記録
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.text();
    const signature = request.headers.get('X-VoiceDrive-Signature');

    // 署名検証
    if (!verifySignature(body, signature, SHARED_SECRET)) {
      console.warn('Webhook署名検証失敗:', {
        receivedSignature: signature,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
    }

    const payload: StatsWebhookPayload = JSON.parse(body);

    // ログ記録（デバッグ用）
    console.log('Webhook受信:', {
      event: payload.event,
      announcementId: payload.announcement.id,
      stats: payload.stats,
      processingTime: Date.now() - startTime
    });

    // DB保存
    await saveAnnouncementStats(payload);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook処理エラー:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

---

## 5. Phase 7スケジュール確認

### 5.1 VoiceDrive側の準備状況

| 項目 | 状況 | 備考 |
|------|------|------|
| お知らせ受信API | ✅ **100%完了** | `hr-announcements.routes.ts` |
| 統計送信機能 | ✅ **100%完了** | `MedicalIntegrationService.ts` |
| 型定義 | ✅ **100%完了** | `hr-announcements.ts` |
| 仕様書 | ✅ **100%完了** | 3ドキュメント提供 |
| 環境変数設定 | ✅ **100%完了** | `.env.example` |
| APIサーバー設定 | ✅ **100%完了** | `server.ts` |
| テスト環境準備 | ✅ **100%完了** | ngrok対応可能 |

**VoiceDrive側：Phase 7開始準備100%完了**

### 5.2 Phase 7開始のトリガー

**開始条件**：
- ✅ Phase 6（共通DB構築）完了
- ✅ 職員カルテチームから開始連絡

**開始時にVoiceDrive側が実施すること**：
1. 認証情報の発行と共有（1時間以内）
2. ngrok環境構築（30分以内）
3. CORS設定更新（職員カルテドメイン追加）
4. 統合テスト日程調整

**所要時間：最大2時間**

### 5.3 Phase 7完了の定義

以下がすべて完了した時点で、Phase 7完了とします：

- [ ] お知らせ送信機能の実装（職員カルテ側）
- [ ] 統計受信Webhook実装（職員カルテ側）
- [ ] 統合テスト（シナリオ1-3）すべてPass
- [ ] 本番環境デプロイ
- [ ] 運用手順書の作成（両チーム）
- [ ] 結果報告書の作成（両チーム）

---

## 6. まとめ

### 6.1 質問への回答まとめ

| No | 質問 | 回答 |
|----|------|------|
| 1 | お知らせ受信API仕様書 | ✅ 作成済み（`VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md`） |
| 2 | surveySubCategoryフィールド | Phase 7では実装不要（VoiceDrive内部用） |
| 3 | 統計Webhook送信頻度 | 現在は`stats.updated`（リアルタイム）のみ |

### 6.2 Phase 7開始時の提供情報

| No | 提供情報 | 提供時期 |
|----|---------|---------|
| 1 | 認証情報（3種類） | Phase 7キックオフ時（1-2時間以内） |
| 2 | CORS設定更新 | 職員カルテドメイン確定後（即日） |
| 3 | IPアドレスリスト | 本番環境構築後 |
| 4 | ngrok URL | Phase 7開始時（30分以内） |

### 6.3 統合テスト

| 項目 | 内容 |
|------|------|
| **日程** | Phase 7開始後6日目（職員カルテ様のご提案通り） |
| **所要時間** | 2-3時間 |
| **実施方法** | Zoom/Google Meetで画面共有 |
| **テスト内容** | シナリオ1-3（お知らせ送信、署名検証、エラーケース） |

---

## 7. 次のステップ

### 7.1 VoiceDrive側の短期アクション

- [x] 質問への回答ドキュメント作成 ✅（本ドキュメント）
- [x] お知らせ受信API仕様書の確認 ✅（既に提供済み）
- [ ] 職員カルテチームからのフィードバック待ち
- [ ] Phase 6完了連絡待ち

### 7.2 Phase 6完了後のアクション（Phase 7開始時）

**Day 1（Phase 7キックオフ）**：
- [ ] 認証情報発行（1-2時間）
- [ ] ngrok環境構築（30分）
- [ ] 職員カルテドメイン確認→CORS設定更新（即日）
- [ ] キックオフミーティング（1時間）

**Day 2-5**：
- [ ] 統合テスト準備
- [ ] お知らせ受信APIの動作確認（職員カルテ側実装と並行）

**Day 6**：
- [ ] 統合テスト実施（2-3時間）

**Day 7**：
- [ ] 結果報告書作成
- [ ] Phase 7完了報告

---

## 8. 感謝の言葉

職員カルテシステム開発チームの皆様の詳細な受領確認と高評価に、心より感謝申し上げます。

⭐⭐⭐⭐⭐（満点）という過分な評価をいただき、当チーム一同、大変励みになっております。

引き続き、Phase 7の統合に向けて全力でサポートさせていただきます。

### 8.1 VoiceDriveチームからの一言

> 「職員カルテシステム開発チーム様の丁寧な確認作業と、詳細な実装計画に敬意を表します。
> Phase 7の統合作業が、両システムにとって大きな価値を生み出すことを確信しております。
> 引き続き、よろしくお願いいたします。」
>
> — VoiceDrive開発チーム一同

---

## 9. ご確認・ご連絡事項

### 9.1 ご確認いただきたい事項

以下についてご確認・ご連絡をお願いいたします：

1. **認証情報の共有方法**
   - 1Password / Slack DM / 暗号化ファイル のいずれをご希望ですか？

2. **職員カルテシステムのドメイン**
   - 本番環境のドメイン名をご教示ください
   - ステージング環境のドメイン名をご教示ください

3. **統合テストの日程**
   - Phase 7開始後6日目でよろしいでしょうか？
   - Zoom / Google Meet のいずれをご希望ですか？

### 9.2 連絡先

**VoiceDrive開発チーム**
- **Slack**: #phase2-integration
- **MCPサーバー**: `mcp-shared/docs/`
- **メール**: voicedrive-dev@example.com

---

**引き続きよろしくお願いいたします。**

VoiceDrive開発チーム
2025年10月7日

---

## 添付ファイル

- `mcp-shared/docs/VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md` - お知らせ受信API仕様書
- `mcp-shared/docs/VoiceDrive_Stats_Webhook_Specification_20251007.md` - 統計送信仕様書
- `mcp-shared/docs/Response_To_Medical_Team_Questions_20251007.md` - 質問への回答（前回分）
- `mcp-shared/docs/Final_Confirmation_Response_To_Medical_Team_20251007.md` - 最終確認への回答（本ドキュメント）
