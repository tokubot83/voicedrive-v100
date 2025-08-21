# V3異議申立フロー実装作業再開指示書

**作成日**: 2025年8月21日  
**対象**: Claude Code（次回作業時）  
**優先度**: 🔴 HIGH - Phase 2実装開始  
**作業再開予定**: 2025年8月23日

## 📋 現在の状況サマリー

### ✅ 完了事項（2025年8月21日時点）

#### 1. 方針合意完了
- **医療チームとVoiceDriveチーム間で完全合意**
- V3異議申立フローをVoiceDrive起点に変更
- 医療システムは受信・管理のみに役割変更

#### 2. Phase 1完了（8月21日実施）
- ✅ V3対応APIエンドポイント調整完了
- ✅ 認証機能（Bearer Token）実装確認
- ✅ テストデータでの動作確認成功

#### 3. **Phase 2完了（8月21日実施）** 🎉
- ✅ **ディープリンク機能完全実装**
  - URLパラメータ解析（period, employee, from=medical）
  - 医療システムからの遷移通知表示
  - 初期値の自動設定機能
- ✅ **一時保存機能完全実装**
  - 30秒ごとの自動保存
  - 手動保存・読み込み・削除機能
  - バックアップ履歴管理（最大10件）
- ✅ **リトライロジック強化**
  - 指数バックオフ付き最大3回リトライ
  - タイムアウト・503・504・ネットワークエラー対応
- ✅ **エラーハンドリング統合テスト完了**
  - ユーザーフレンドリーなエラーメッセージ
  - リトライボタン付きエラー通知
  - エラー時の下書き自動保存

### 📁 重要ファイル一覧

#### 合意文書
- `mcp-shared/docs/V3_Appeal_Flow_Policy_20250821.md` - 医療チーム方針書
- `mcp-shared/docs/V3_Appeal_Flow_Policy_Response_20250821.md` - VoiceDrive回答
- `mcp-shared/docs/V3_Appeal_Flow_Agreement_Medical_20250821.md` - 医療チーム同意書

#### 実装済みファイル
- `src/services/appealServiceV3.ts` - V3専用サービス（新規作成済み）
- `src/components/appeal/AppealFormV3.tsx` - V3異議申立フォーム
- `src/components/appeal/AppealStatusListV3.tsx` - V3申立状況一覧
- `src/pages/AppealV3Page.tsx` - V3統合ページ
- `mcp-integration-server/src/server.ts` - V3エンドポイント追加済み

## 🎯 Phase 2実装詳細（8月21日完了済み）

### 1. ✅ 医療システムUI変更対応
```typescript
// ✅ 実装完了: AppealV3Page.tsx
const [searchParams] = useSearchParams();
const period = searchParams.get('period');
const employeeId = searchParams.get('employee');
const fromMedical = searchParams.get('from') === 'medical';

// ✅ 自動初期値設定とUI通知完了
// 例: https://voicedrive.app/appeal-v3?period=2025_summer&employee=EMP001&from=medical
```

### 2. ✅ エラーハンドリング統合テスト
```typescript
// ✅ 実装完了: appealServiceV3.ts
// - API障害時のフォールバック処理 ✓
// - 一時保存機能の実装 ✓ 
// - リトライロジックの強化 ✓

private async retryableRequest<T>(requestFn: () => Promise<T>): Promise<T>
saveDraft(request: Partial<V3AppealRequest>): void
getFallbackMessage(error: any): string
```

### 3. ✅ ユーザビリティテスト準備
- ✅ エラーテスト用HTMLファイル作成（error-test.html）
- ✅ ディープリンクテスト用HTMLファイル作成（test-deeplink.html）
- ✅ 下書き機能UIコンポーネント実装
- ✅ リトライボタン付きエラー通知実装

## 🚀 次回作業内容（Phase 3: 8月26日以降）

## 🔧 技術的な実装詳細

### API仕様（確定版）

#### VoiceDrive → 医療システム
```json
POST /api/v3/appeals/submit
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "employeeId": "EMP001",
  "evaluationPeriod": "2025_summer",
  "appealType": "score_dispute",
  "appealReason": "詳細な理由（100文字以上）",
  "scores": {
    "currentTotal": 85.5,
    "disputedItems": [{
      "itemId": "tech_skill_01",
      "currentScore": 20,
      "expectedScore": 25,
      "reason": "個別理由"
    }]
  },
  "relativeEvaluation": {
    "facilityGrade": "B",
    "corporateGrade": "B",
    "disputeReason": "相対評価への異議理由"
  },
  "voiceDriveUserId": "VD_USER_12345",
  "deviceInfo": {
    "platform": "mobile",
    "version": "v3.2.1"
  },
  "attachments": [{
    "filename": "evidence.pdf",
    "fileId": "ATT_001",
    "size": 1024000
  }],
  "conversationId": "v3_conv_12345",
  "submittedAt": "2025-08-21T10:00:00Z"
}
```

#### 医療システム → VoiceDrive（レスポンス）
```json
{
  "appealId": "APL20250821001",
  "status": "received",
  "assignedTo": "MGR002",
  "estimatedResponseDate": "2025-08-28",
  "message": "V3異議申立を受理しました",
  "voiceDriveCallbackUrl": "/api/v3/appeals/APL20250821001/status"
}
```

## 📝 チェックリスト（Phase 2開始時）

### 環境確認
- [ ] MCPサーバー起動確認 (`npm run dev` in mcp-integration-server)
- [ ] VoiceDrive開発サーバー起動 (`npm run dev`)
- [ ] 最新の共有ファイル確認 (`ls -la mcp-shared/docs/`)

### コード確認
- [ ] appealServiceV3.tsの動作確認
- [ ] AppealFormV3.tsxのバリデーション確認
- [ ] MCPサーバーのV3エンドポイント確認

### テスト準備
- [ ] テストデータの準備
- [ ] エラーケースのシナリオ作成
- [ ] 統合テストスクリプトの準備

## 🎯 Phase 3準備事項（8月26日以降）

1. **本番環境連携**
   - 本番APIエンドポイントURL取得
   - 本番用Bearer Token発行
   - CORS設定確認

2. **ユーザー向け資料**
   - 操作マニュアル作成
   - FAQ文書準備
   - トレーニング資料作成

3. **運用監視**
   - ログ監視設定
   - エラー通知設定
   - パフォーマンス監視

## 💡 重要な注意事項

### セキュリティ
- Bearer Tokenは環境変数で管理
- APIキーは絶対にコードにハードコーディングしない
- CORS設定は本番環境で厳格に

### パフォーマンス
- ファイルアップロードは15MB制限（V3で拡張済み）
- API呼び出しはリトライ機能付き
- キャッシュ戦略の検討が必要

### エラーハンドリング
- ユーザーフレンドリーなエラーメッセージ
- 詳細なログ記録
- フォールバック処理の実装

## 📞 連絡先・参考情報

- **Slack**: #medical-voicedrive-integration
- **MCPダッシュボード**: http://localhost:8080/dashboard
- **テスト環境**: http://localhost:5173/appeal-v3
- **統合テストスクリプト**: `test/integration/appeal-integration-test-v3.js`

## 🔄 作業再開時の最初のコマンド

```bash
# 1. MCPサーバー起動
cd mcp-integration-server && npm run dev

# 2. VoiceDrive開発サーバー起動（別ターミナル）
npm run dev

# 3. 最新状態確認
cat mcp-shared/docs/AI_SUMMARY.md
ls -la mcp-shared/docs/

# 4. V3 API動作確認
curl http://localhost:8080/api/v3/evaluation/periods
```

## ✅ 成功基準

### Phase 2完了条件（8月21日達成 🎉）
- [x] ディープリンク機能実装完了
- [x] エラーハンドリング統合テスト合格
- [x] ユーザビリティテスト準備完了

### Phase 3完了条件（8月26日以降）
- [ ] 本番環境連携成功
- [ ] ユーザー向け資料完成
- [ ] 運用監視体制確立

## 📈 Phase 2実装成果

### ✨ 新機能一覧
1. **ディープリンク対応**
   - `AppealV3Page.tsx`: URLパラメータ解析機能
   - `AppealFormV3.tsx`: 初期値自動設定機能
   - 医療システム遷移通知UI

2. **堅牢なエラー処理**
   - `appealServiceV3.ts`: リトライロジック（指数バックオフ）
   - フォールバック処理（エラータイプ別メッセージ）
   - 一時保存機能（自動・手動）

3. **ユーザビリティ向上**
   - 下書き機能（保存・読み込み・削除）
   - リトライボタン付きエラー通知
   - テスト用HTMLファイル（2種類）

### 🔒 セキュリティ・信頼性向上
- Bearer Token認証強化
- エラー時のデータ保護
- ネットワーク障害耐性
- 15MB対応ファイルアップロード

### 📊 テスト環境準備完了
- `test-deeplink.html`: ディープリンク機能テスト
- `error-test.html`: エラーハンドリング機能テスト
- 開発サーバー統合テスト環境

---

**作成者**: Claude Code  
**次回作業予定日**: 2025年8月23日  
**最終目標**: 2025年8月26日本格運用開始

---

## 🎯 作業再開時の第一歩

1. **この文書を読む**
2. **環境を起動する**（上記コマンド参照）
3. **Phase 2のTODOリストを作成**
4. **実装開始**

頑張ってください！V3異議申立フローの成功を祈っています。