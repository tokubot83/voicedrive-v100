# Re: 職員カルテシステムからのご質問への回答

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム ご担当者様**

---

## 1. ご質問への回答

### 1.1 お知らせ送信ペイロード仕様書について

✅ **作成完了しました**

以下のドキュメントをご確認ください：

```
mcp-shared/docs/VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md
```

#### 仕様書の概要

| 項目 | 内容 |
|------|------|
| **エンドポイント** | `POST https://api.voicedrive.example.com/api/hr-announcements` |
| **認証方式** | Bearer Token認証 + `X-Source-System`ヘッダー |
| **レスポンス** | VoiceDrive側のお知らせID、配信予定数など |
| **実装例** | Node.js/TypeScript、Next.js API Route |

#### 主要な設定項目

**カテゴリ**：
- `announcement`（お知らせ）
- `interview`（面談）
- `training`（研修）
- `survey`（アンケート）
- `other`（その他）

**優先度**：
- `low`（低）
- `medium`（中）
- `high`（高）

**配信対象**：
- `all`（全職員）
- `departments`（部門別）
- `individuals`（個人別）
- `positions`（役職別）

**アクションボタンタイプ**：
- `interview_reservation`（面談予約）
- `survey_response`（アンケート回答）
- `training_apply`（研修申込）
- `health_check`（健康診断予約）
- `custom`（カスタムURL）

---

### 1.2 共有秘密鍵・APIトークンについて

#### 発行予定

**Phase 7開始時**に以下の認証情報を発行いたします：

```bash
# VoiceDrive → 職員カルテ（統計送信用）
REACT_APP_MEDICAL_WEBHOOK_SECRET=<共有秘密鍵>
REACT_APP_MEDICAL_API_TOKEN=<APIトークン>

# 職員カルテ → VoiceDrive（お知らせ受信用）
VOICEDRIVE_API_TOKEN=<認証トークン>
```

#### 共有方法

セキュアな方法で共有いたします：
1. **Slack DM**（暗号化メッセージ）
2. **1Password**（共有Vault）
3. **環境変数ファイル**（暗号化済み）

**推奨：1Password共有Vault**

---

### 1.3 IPアドレスリストについて

#### 提供予定時期

**本番環境構築時**（Phase 7完了後）にご提供いたします。

#### 予定IPアドレス

| 環境 | IPアドレス（予定） | 用途 |
|------|------------------|------|
| **Production** | `203.0.113.10` | VoiceDrive本番サーバー |
| **Production** | `203.0.113.11` | VoiceDrive本番サーバー（冗長化） |
| **Staging** | `203.0.113.20` | VoiceDriveステージング |
| **Development** | `動的IP（ngrok使用）` | ローカル開発 |

**注意**：
- 本番環境のIPアドレスは確定次第、速やかにご連絡いたします
- 開発環境では**ngrok**を使用するため、動的IPとなります

---

### 1.4 UI仕様について

✅ **確認完了**

以下の仕様で実装いたします：

```typescript
{
  "requireResponse": false,       // 固定
  "autoTrackResponse": true       // 固定
}
```

#### 動作仕様

| 項目 | 仕様 |
|------|------|
| **双方向メッセージ** | ❌ 不要（requireResponse=false） |
| **自動応答記録** | ✅ 有効（autoTrackResponse=true） |
| **アクションボタン** | ✅ クリック時に自動で統計記録 |
| **ページビュー** | ⏳ 将来的に実装検討 |

#### 統計記録タイミング

```
職員がアクションボタンをクリック
  ↓
HRMessageBubble.handleActionClick()
  ↓
楽観的UI更新（responses++）
  ↓
MedicalIntegrationService.sendStatsToMedicalTeam()
  ↓
Webhook送信（統計情報のみ）
  ↓
職員カルテシステムで受信・DB保存
```

---

### 1.5 実装タイミングについて

✅ **Phase 7で問題ございません**

#### 当チームの実装スケジュール

| Phase | タイミング | 実装内容 | 状況 |
|-------|----------|---------|------|
| **Phase 1-6** | 完了 | 基本機能、統計送信機能 | ✅ 完了 |
| **Phase 7** | Phase 6完了後 | お知らせ受信API実装 | ✅ **準備完了** |
| **Phase 7** | 統合テスト時 | 両チーム合同テスト | ⏳ 待機中 |

#### VoiceDrive側の実装状況

| 機能 | 状況 | 備考 |
|------|------|------|
| 統計送信機能 | ✅ **実装済み** | `MedicalIntegrationService.ts:218-342` |
| お知らせ受信API | ✅ **実装済み** | `src/api/routes/hr-announcements.routes.ts` |
| 型定義 | ✅ **実装済み** | `src/types/hr-announcements.ts` |
| 環境変数設定 | ✅ **実装済み** | `.env.example` |

**ご安心ください**：
- VoiceDrive側は既に実装完了しております
- Phase 7開始と同時にテスト可能です
- 統合テストのスケジュールはご都合に合わせます

---

## 2. 統合テストの提案

### 2.1 テスト環境

#### VoiceDrive側

```bash
# ローカル開発サーバー起動
npm run dev              # ポート: 3001

# APIサーバー起動
cd src/api && npm start  # ポート: 4000

# ngrokで公開（開発環境）
ngrok http 4000
# → https://xxxx.ngrok.io/api/hr-announcements
```

#### 職員カルテシステム側

```bash
# ローカル開発サーバー起動
npm run dev              # ポート: 3000

# ngrokで公開（Webhook受信用）
ngrok http 3000
# → https://yyyy.ngrok.io/api/voicedrive/stats
```

### 2.2 テストシナリオ

#### シナリオ1：お知らせ送信〜統計受信

```
1. 職員カルテ: お知らせ作成
   POST https://xxxx.ngrok.io/api/hr-announcements
   ↓
   期待: 201 Created

2. VoiceDrive: お知らせ表示確認
   → 期待: 職員画面に表示される

3. VoiceDrive: アクションボタンクリック（手動）
   → 期待: 統計情報がWebhookで送信される

4. 職員カルテ: 統計受信確認
   POST https://yyyy.ngrok.io/api/voicedrive/stats
   ↓
   期待: DB保存 → ダッシュボード表示
```

#### シナリオ2：署名検証テスト

```
1. 正しい署名でWebhook送信
   → 期待: 200 OK

2. 不正な署名でWebhook送信
   → 期待: 401 Unauthorized

3. 署名なしでWebhook送信
   → 期待: 401 Unauthorized
```

### 2.3 テスト実施日程（提案）

| 日程 | 内容 | 所要時間 |
|------|------|---------|
| **Day 1** | 環境構築（ngrok設定、トークン共有） | 1時間 |
| **Day 2** | シナリオ1テスト（お知らせ送信〜統計受信） | 2時間 |
| **Day 3** | シナリオ2テスト（署名検証） | 1時間 |
| **Day 4** | エラーハンドリングテスト | 1時間 |
| **Day 5** | 結果報告書作成 | 1時間 |

**合計：約6時間（1週間）**

---

## 3. 成果物の提供

### 3.1 技術ドキュメント

| No | ドキュメント | パス | 状況 |
|----|------------|------|------|
| 1 | **統計送信仕様書** | `VoiceDrive_Stats_Webhook_Specification_20251007.md` | ✅ 提供済み |
| 2 | **お知らせ受信仕様書** | `VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md` | ✅ **NEW** |
| 3 | **回答ドキュメント** | `Response_To_Medical_Team_Questions_20251007.md` | ✅ **NEW** |

### 3.2 実装コード

| No | ファイル | 用途 | 状況 |
|----|---------|------|------|
| 1 | `src/api/routes/hr-announcements.routes.ts` | お知らせ受信API | ✅ 実装済み |
| 2 | `src/types/hr-announcements.ts` | 型定義 | ✅ 実装済み |
| 3 | `src/services/MedicalIntegrationService.ts` | 統計送信機能 | ✅ 実装済み |
| 4 | `.env.example` | 環境変数設定例 | ✅ 更新済み |

### 3.3 サンプルコード（職員カルテシステム側用）

仕様書内に以下のサンプルコードを含めております：

- ✅ Node.js/TypeScriptでのAPI呼び出し例
- ✅ Next.js API Routeでの実装例
- ✅ cURLでのテストコマンド例

---

## 4. 次のステップ

### 4.1 短期アクション（今週中）

- [x] お知らせ受信仕様書の作成 ✅
- [x] お知らせ受信API実装 ✅
- [x] 回答ドキュメント作成 ✅
- [ ] MCPサーバー経由で職員カルテチームに通知 ⏳
- [ ] 職員カルテチームからのフィードバック待ち

### 4.2 中期アクション（Phase 7開始時）

- [ ] 認証トークン・秘密鍵の発行と共有
- [ ] ngrokを使った統合テスト環境構築
- [ ] シナリオ1-2のテスト実施
- [ ] テスト結果報告書の作成

### 4.3 長期アクション（Phase 7完了後）

- [ ] 本番環境デプロイ
- [ ] IPアドレスホワイトリスト設定
- [ ] モニタリング設定
- [ ] 運用手順書の作成

---

## 5. まとめ

### 5.1 質問への回答状況

| No | 質問項目 | 回答 | 状況 |
|----|---------|------|------|
| 1 | お知らせ送信ペイロード仕様書 | 作成完了 | ✅ |
| 2 | 共有秘密鍵・APIトークン | Phase 7開始時に発行 | ⏳ |
| 3 | IPアドレスリスト | 本番環境構築時に提供 | ⏳ |
| 4 | UI仕様確認 | requireResponse=false, autoTrackResponse=true | ✅ |
| 5 | 実装タイミング | Phase 7で問題なし | ✅ |

### 5.2 VoiceDrive側の準備状況

| 項目 | 状況 | 備考 |
|------|------|------|
| **統計送信機能** | ✅ 実装済み | HMAC署名付きWebhook送信 |
| **お知らせ受信API** | ✅ 実装済み | バリデーション、認証、型変換 |
| **技術ドキュメント** | ✅ 作成済み | 3ドキュメント提供 |
| **テスト準備** | ✅ 完了 | ngrok環境構築可能 |

### 5.3 お願い事項

1. ✅ **仕様書のご確認**
   - `VoiceDrive_HR_Announcement_Receive_API_Specification_20251007.md`
   - ご不明点があればお気軽にご質問ください

2. ⏳ **統合テスト日程のご相談**
   - Phase 7開始時期が決まりましたらご連絡ください
   - 統合テストのスケジュール調整をさせていただきます

3. ⏳ **Webhook URL共有**
   - Phase 7開始時に以下をご共有ください：
     - `REACT_APP_MEDICAL_STATS_WEBHOOK_URL`
     - ngrok URLまたは本番URL

---

## 6. 連絡先

**VoiceDrive開発チーム**
- **Slack**: #phase2-integration
- **MCPサーバー**: `mcp-shared/docs/`
- **メール**: voicedrive-dev@example.com

---

**引き続きよろしくお願いいたします。**

VoiceDrive開発チーム
2025年10月7日
