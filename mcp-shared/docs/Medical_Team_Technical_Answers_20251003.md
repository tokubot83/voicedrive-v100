# 医療システムチーム 技術的質問への回答

**発信**: 医療システムチーム
**宛先**: VoiceDriveチーム
**日時**: 2025年10月3日 19:00
**件名**: 【回答】Webhook実装に関する技術的質問への回答
**重要度**: 🔴 **実装に必要な重要情報**

---

## 🎉 モックサーバー動作確認完了おめでとうございます！

VoiceDriveチームの皆様

モックサーバーの動作確認完了、そして統合テスト日程確定のご連絡ありがとうございます。

**10月8日（火）10:00-15:00、パターンA（フルリモート）** で確定いたしました。

技術的な質問4点について、以下の通り回答いたします。

---

## 📋 技術的質問への回答

### 質問1: Webhook送信タイミングについて

**質問内容**:
- 医療システムは通報受信後、どのタイミングでWebhookを送信するか
- UI更新の実装方式（WebSocket vs ポーリング）の決定に必要

#### 回答

**結論**: **即座（受信後1-3秒以内）**

```typescript
// 医療システム側の実装（src/app/api/v3/compliance/receive/route.ts）
export async function POST(request: Request) {
  // 1. 通報を受信・保存
  const report = await saveComplianceReport(data);

  // 2. 受付確認通知を生成（即座）
  const acknowledgement = generateAcknowledgement(report);

  // 3. VoiceDriveへWebhook送信（非同期・バックグラウンド）
  sendAcknowledgementToVoiceDrive(acknowledgement);  // ← ノンブロッキング

  // 4. 即座にレスポンス返却
  return NextResponse.json({ success: true, caseNumber: report.caseNumber });
}
```

**詳細タイムライン**:

| タイミング | 処理内容 | 所要時間 |
|-----------|---------|---------|
| 0秒 | VoiceDriveから通報受信 | - |
| 0.1秒 | 医療システムでDB保存 | 100ms |
| 0.2秒 | ケース番号発行 | 100ms |
| 0.3秒 | 受付確認通知生成 | 100ms |
| **0.5秒** | **VoiceDriveへWebhook送信開始** | - |
| 0.8秒 | Webhook送信完了 | 300ms |

**VoiceDrive側の推奨実装**:

```typescript
// ポーリング方式（推奨）
setInterval(async () => {
  const response = await fetch('/api/notifications/acknowledgements');
  const newAcknowledgements = await response.json();

  if (newAcknowledgements.length > 0) {
    updateUI(newAcknowledgements);
  }
}, 5000); // 5秒ごとにポーリング
```

**WebSocketは不要**:
- 受付確認は「1回きり」の通知
- リアルタイム性は5秒以内で十分
- ポーリングの方がシンプルで堅牢

---

### 質問2: リトライポリシーについて

**質問内容**:
- Webhook送信失敗時のリトライ仕様
- VoiceDrive側でのエラーハンドリング設計に必要

#### 回答

**仕様サマリー**:

| 項目 | 仕様 |
|------|------|
| **リトライ回数** | 3回まで |
| **リトライ間隔** | 5秒、15秒、45秒（指数バックオフ） |
| **タイムアウト** | 30秒/回 |
| **最終失敗時** | 監査ログ記録 + アラート通知 + 手動対応キュー登録 |

**実装詳細**:

```typescript
// 医療システム側（src/services/webhookSender.ts）
async function sendAcknowledgementToVoiceDrive(notification) {
  const retryIntervals = [5000, 15000, 45000]; // ミリ秒

  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': generateSignature(notification),
          'X-Webhook-Timestamp': new Date().toISOString(),
          'X-Request-Id': crypto.randomUUID()
        },
        body: JSON.stringify(notification),
        signal: AbortSignal.timeout(30000) // 30秒タイムアウト
      });

      if (response.ok) {
        console.log(`✅ Acknowledgement sent successfully (attempt ${attempt + 1})`);
        return;
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);

      if (attempt < 3) {
        await sleep(retryIntervals[attempt]);
        continue;
      }

      // 最終失敗時の処理
      handleFinalFailure(notification, error);
    }
  }
}
```

**最終失敗時の処理**（3段階）:

1. **監査ログ記録**（必須）:
   ```json
   {
     "action": "webhook_delivery_failed",
     "reportId": "VD-2025-1234",
     "caseNumber": "MED-2025-0001",
     "attempts": 4,
     "lastError": "Network timeout",
     "timestamp": "2025-10-03T10:30:00Z"
   }
   ```

2. **アラート通知**（Slack/Email）:
   ```
   件名: 【警告】受付確認通知の配信に失敗しました
   本文: ケース番号 MED-2025-0001 の受付確認通知が4回の試行後も配信できませんでした。
         手動での確認が必要です。
   ```

3. **手動対応キュー登録**:
   - 管理画面に「未配信通知一覧」を表示
   - 運用チームが手動で再送信可能

**VoiceDrive側への影響**:
- エラーハンドリングは「受信できなかった場合」のみ考慮
- 医療システム側で十分にリトライするため、VoiceDrive側でのリトライは不要

---

### 質問3: Webhookエンドポイントの認証について

**質問内容**:
- HMAC-SHA256署名以外の認証の必要性
- IP制限、Basic認証、APIキー

#### 回答

**結論**: HMAC-SHA256署名のみで十分です

**現在の実装**:

| 認証方式 | 実装状況 | 理由 |
|---------|---------|------|
| **HMAC-SHA256署名** | ✅ 実装済み | メッセージの完全性・送信元認証を保証 |
| **タイムスタンプ検証** | ✅ 実装済み | リプレイ攻撃対策 |
| **IP制限** | ❌ 不要 | VoiceDriveのIPが動的な可能性、署名で十分 |
| **Basic認証** | ❌ 不要 | HMAC-SHA256の方が安全 |
| **APIキー** | ❌ 不要 | 署名にシークレットキーを使用している |

**HMAC-SHA256が十分な理由**:

1. **改ざん検知**: ペイロードが1バイトでも変更されると署名が一致しない
2. **送信元認証**: 共有シークレットキーを持つ者のみが正しい署名を生成可能
3. **リプレイ攻撃対策**: タイムスタンプ検証と組み合わせ
4. **業界標準**: GitHub、Stripe、Slackなど主要サービスで採用

**セキュリティレベル比較**:

```
HMAC-SHA256 + タイムスタンプ検証
> APIキー + IP制限
> Basic認証
> 認証なし
```

**実装推奨**:
```typescript
// VoiceDrive側: 署名検証のみ実装すればOK
const signature = req.headers['x-webhook-signature'];
const timestamp = req.headers['x-webhook-timestamp'];

if (!verifySignature(signature, req.body, secret)) {
  return res.status(401).json({ error: 'INVALID_SIGNATURE' });
}

if (!verifyTimestamp(timestamp, 5)) {
  return res.status(401).json({ error: 'TIMESTAMP_EXPIRED' });
}

// ✅ これだけで十分にセキュア
```

---

### 質問4: タイムスタンプ許容範囲について

**質問内容**:
- タイムスタンプ検証の許容範囲（前後5分で問題ないか）
- システムクロック同期の確保
- NTPサーバーの利用

#### 回答

**許容範囲**: 前後5分で問題ありません

**理由**:

| 要素 | 想定時間 | 備考 |
|------|---------|------|
| ネットワーク遅延 | 最大1秒 | 通常は100ms以下 |
| サーバー処理時間 | 最大2秒 | 通常は500ms以下 |
| クロックずれ | 最大1分 | NTP同期で±1秒以内に制御 |
| **安全マージン** | **+2分** | 予期せぬ遅延に対応 |
| **合計** | **5分** | 十分な余裕を持った設定 |

**システムクロック同期**:

医療システム側（本番環境）:
```bash
# NTPサーバー設定
NTP_SERVERS="ntp.nict.jp,time.google.com,time.cloudflare.com"

# 同期状態確認コマンド
timedatectl status
# Output:
#   System clock synchronized: yes
#   NTP service: active
```

**VoiceDrive側での実装**:
```typescript
function verifyTimestamp(timestamp: string, maxAgeMinutes: number = 5): boolean {
  const receivedTime = new Date(timestamp).getTime();
  const currentTime = Date.now();
  const differenceMinutes = Math.abs(currentTime - receivedTime) / 1000 / 60;

  return differenceMinutes <= maxAgeMinutes;
}

// 開発環境では15分に緩和（任意）
const maxAge = process.env.NODE_ENV === 'production' ? 5 : 15;
```

**トラブルシューティング**:

| 問題 | 原因 | 対策 |
|-----|------|------|
| タイムスタンプ検証が頻繁に失敗 | クロックずれ | NTP同期確認 |
| 特定時間帯のみ失敗 | ネットワーク遅延 | 許容時間を7分に拡大 |
| ランダムに失敗 | タイムゾーン不一致 | ISO 8601形式（UTC）を使用 |

**NTP同期確認コマンド**:
```bash
# 医療システム側
timedatectl status

# VoiceDrive側
timedatectl status

# 時刻差を確認
date -u  # UTCで表示して比較
```

---

## 📊 技術仕様サマリー

### 実装する必要があるもの

| 項目 | 必須度 | 仕様 |
|------|--------|------|
| HMAC-SHA256署名検証 | ✅ 必須 | Webhook認証仕様書参照 |
| タイムスタンプ検証 | ✅ 必須 | 前後5分以内 |
| ペイロードバリデーション | ✅ 必須 | 必須フィールドチェック |
| データベース保存 | ✅ 必須 | 受付確認通知データ |
| UI更新 | ✅ 必須 | ポーリング（5秒間隔） |
| エラーログ記録 | ✅ 必須 | 監査用 |

### 実装しなくてよいもの

| 項目 | 理由 |
|------|------|
| IP制限 | HMAC-SHA256で十分 |
| Basic認証 | HMAC-SHA256で十分 |
| APIキー認証 | HMAC-SHA256で十分 |
| WebSocket | ポーリングで十分 |
| VoiceDrive側リトライ | 医療システム側で実装済み |

---

## 🏗️ 推奨ファイル構成

```
src/
├── routes/
│   └── webhookRoutes.ts              # ルーティング定義
├── controllers/
│   └── webhookController.ts          # リクエスト処理
├── services/
│   ├── webhookVerifier.ts            # 署名・タイムスタンプ検証
│   └── notificationService.ts        # 通知配信
├── repositories/
│   └── notificationRepository.ts     # DB操作
└── utils/
    └── crypto.ts                     # HMAC-SHA256ユーティリティ
```

### 実装の優先順位

**Day 1（10月4日）**:
1. `webhookRoutes.ts` - エンドポイント定義
2. `webhookController.ts` - 基本的なリクエスト処理
3. モックサーバーで動作確認

**Day 2（10月5日）**:
4. `webhookVerifier.ts` - 署名検証実装（Webhook認証仕様書参照）
5. `crypto.ts` - HMAC-SHA256ユーティリティ
6. モックサーバーで署名検証テスト

**Day 3（10月6日）**:
7. `notificationRepository.ts` - DB保存
8. `notificationService.ts` - 通報者への通知配信
9. エラーハンドリング
10. 全テストケース実行

---

## 💡 実装のヒント

### 署名検証の実装例（コピペ可能）

```typescript
// src/services/webhookVerifier.ts
import crypto from 'crypto';

export function verifyWebhookSignature(
  receivedSignature: string,
  payload: any,
  secret: string
): boolean {
  const payloadString = JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  // タイミング攻撃対策
  const receivedBuffer = Buffer.from(receivedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function verifyTimestamp(timestamp: string, maxAgeMinutes: number = 5): boolean {
  const receivedTime = new Date(timestamp).getTime();
  const currentTime = Date.now();
  const differenceMinutes = Math.abs(currentTime - receivedTime) / 1000 / 60;

  return differenceMinutes <= maxAgeMinutes;
}
```

### コントローラーの実装例

```typescript
// src/controllers/webhookController.ts
import { verifyWebhookSignature, verifyTimestamp } from '../services/webhookVerifier';

export async function handleAcknowledgement(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const secret = process.env.MEDICAL_SYSTEM_WEBHOOK_SECRET;

  // 署名検証
  if (!verifyWebhookSignature(signature, req.body, secret)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' }
    });
  }

  // タイムスタンプ検証
  if (!verifyTimestamp(timestamp, 5)) {
    return res.status(401).json({
      success: false,
      error: { code: 'TIMESTAMP_EXPIRED', message: 'Timestamp too old' }
    });
  }

  // ペイロード処理
  const notification = req.body;
  // ... DB保存、通知配信等

  return res.status(200).json({
    success: true,
    notificationId: 'NOTIF-12345',
    receivedAt: new Date().toISOString()
  });
}
```

---

## 🎯 統合テスト当日の確認ポイント

### チェックリスト

**環境変数**:
- [ ] `MEDICAL_SYSTEM_WEBHOOK_SECRET` が設定されている
- [ ] 本番用とテスト用で異なるシークレットを使用

**NTP同期**:
- [ ] `timedatectl status` で同期確認
- [ ] タイムゾーンが `Asia/Tokyo (JST, +0900)` になっている

**エンドポイント**:
- [ ] `POST /api/webhook/compliance/acknowledgement` が動作
- [ ] 401エラーが正しく返る（不正署名時）
- [ ] 400エラーが正しく返る（バリデーションエラー時）

**ログ**:
- [ ] リクエストログが記録される
- [ ] 署名検証結果がログに出力される
- [ ] エラー時の詳細情報が記録される

---

## 📞 サポート体制

### 実装期間中のサポート

**対応時間**: 10月4-6日 9:00-22:00（土日含む）

**連絡方法**:
- 技術的な質問: `mcp-shared/docs/VoiceDrive_Question_YYYYMMDD.md`
- 緊急の問題: `mcp-shared/docs/URGENT_TO_MEDICAL_TEAM_YYYYMMDD.md`

**レスポンス目標**:
- 通常質問: 4時間以内
- 緊急問題: 1時間以内

### コードレビュー（オプション）

実装完了後、ご希望であれば以下をレビュー可能です:
- 署名検証ロジック
- タイムスタンプ検証ロジック
- エラーハンドリング

**依頼方法**: mcp-shared/docs/に実装コードを添付してご連絡ください

---

## 🙏 最後に

VoiceDriveチームの皆様の迅速な対応と、詳細な進捗報告計画に感謝いたします。

技術的な質問への回答は以上となります。実装中に追加の質問が出てきましたら、いつでもご連絡ください。

**10月8日の統合テスト成功を楽しみにしています！**

---

**ステータス**: 🟢 すべての技術的質問に回答完了

**次のアクション**: VoiceDriveチーム側のWebhook実装開始（10月4日）

---

*本回答書は2025年10月3日19:00に医療システムチームにより作成されました。*

*実装頑張ってください！何かあればいつでもご連絡ください！*

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
