# SystemMonitorPage Phase 2.5 - アクションプラン

**作成日**: 2025年10月26日
**対象**: VoiceDriveチーム & 医療職員管理システムチーム
**Phase**: Phase 2完了 → Phase 2.5準備
**関連文書**:
- `SystemMonitorPage_DB要件分析_20251026.md`
- `SystemMonitorPage_医療システム確認結果_20251026.md`

---

## 📋 エグゼクティブサマリー

**現状**: Phase 2（VoiceDrive側の連携監視）が完了しました

**次のステップ**: Phase 2.5（双方向監視）の実現には、医療システム側のAPI提供が必要です

**両チームの役割**:
- **VoiceDriveチーム**: Phase 2.5実装準備、医療システムチームへの依頼、統合テスト計画
- **医療システムチーム**: 3つのAPI実装（Webhook送信統計、面談実施統計、セキュリティイベント）

---

## 🎯 VoiceDriveチームのアクションアイテム

### 即座実施（今日〜明日）

#### 1. 医療システムチームへ正式依頼を送付

**送付先**: 医療職員管理システム開発チーム（プロジェクトリード）

**送付する文書**:
```
件名: 【Phase 2.5】SystemMonitorPage 双方向監視のためのAPI提供依頼

本文:
お疲れ様です。VoiceDriveチームです。

SystemMonitorPage Phase 2（医療システム連携監視）の実装が完了しました。
Phase 2.5として、双方向の連携監視を実現するため、以下の対応をお願いしたく
ご連絡いたします。

添付文書:
1. SystemMonitorPage_医療システム確認結果_20251026.md
   → 詳細なAPI仕様、実装要件、工数見積もり

要約:
【必須API（計5営業日）】
- API 1: Webhook送信統計取得API（3営業日）
- API 2: 面談実施統計取得API（2営業日）

【オプションAPI（2.5営業日）】
- API 3: 統合セキュリティイベントAPI

【質問事項】
1. Webhook送信の現在の実装状況
2. 面談テーブルのスキーマ
3. 実装スケジュールの希望
4. キックオフMTGの日程調整

【提案スケジュール】
- Week 1-2: API 1実装
- Week 3: API 2実装
- Week 4: 統合テスト・リリース

ご確認とフィードバックをお願いいたします。

よろしくお願いいたします。
VoiceDrive開発チーム
```

**送付方法**:
1. MCPサーバー経由でファイル共有
   ```bash
   # 既に mcp-shared/docs/ に配置済み
   ls -la mcp-shared/docs/SystemMonitorPage_医療システム確認結果_20251026.md
   ```

2. Slackで通知
   ```
   #phase2-integration チャンネルで:

   @medical-system-team
   SystemMonitorPage Phase 2.5のAPI実装依頼書を作成しました！

   📄 mcp-shared/docs/SystemMonitorPage_医療システム確認結果_20251026.md

   詳細な仕様、コード例、工数見積もりを含んでいます。
   ご確認とフィードバックをお願いします🙏

   キックオフMTGを10月28日（月）10:00で提案しています。
   ```

---

#### 2. Phase 2の動作確認と検証

**目的**: Phase 2が正しく動作していることを確認し、スクリーンショットやデモを準備

**実施内容**:
```bash
# 1. 開発サーバー起動
npm run dev

# 2. SystemMonitorPageにアクセス
# URL: http://localhost:3001/admin/system-monitor

# 3. 「医療システム連携」タブをクリック

# 4. 確認項目
# ✅ Webhook受信統計が表示される
# ✅ データ同期統計が表示される
# ✅ 接続性ステータスが表示される
# ✅ エラーリストが表示される（エラーがある場合）
```

**スクリーンショット取得**:
- 医療システムチームへのデモ用
- Phase 2完了報告用
- ドキュメント添付用

---

#### 3. Phase 2.5の実装計画を策定

**VoiceDrive側で必要な実装**:

##### 3.1 型定義の拡張
```typescript
// src/types/monitoring.types.ts（新規作成）

export interface MedicalSystemWebhookStats {
  sent24h: number;
  succeeded: number;
  failed: number;
  retried: number;
  lastSentAt: string;
  byEventType: {
    [eventType: string]: {
      sent: number;
      succeeded: number;
      failed: number;
    };
  };
  queueStatus: {
    pending: number;
    processing: number;
    failed: number;
  };
}

export interface MedicalSystemInterviewStats {
  totalScheduled: number;
  actuallyCompleted: number;
  completionRate: number;
  noShowRate: number;
  rescheduledCount: number;
  avgDuration: number;
  byInterviewType: {
    [type: string]: {
      scheduled: number;
      completed: number;
      completionRate: number;
    };
  };
}

export interface EnhancedIntegrationMetrics extends IntegrationMetrics {
  medicalSystem: {
    webhookStats: MedicalSystemWebhookStats;
    interviewStats: MedicalSystemInterviewStats;
    syncDiscrepancy: number;  // 送信 - 受信
    syncHealth: 'healthy' | 'warning' | 'critical';
  };
}
```

##### 3.2 医療システムAPIクライアント
```typescript
// src/services/MedicalSystemClient.ts（新規作成）

import axios from 'axios';

const MEDICAL_SYSTEM_BASE_URL = process.env.MEDICAL_SYSTEM_API_URL || 'https://medical-system.example.com';
const API_KEY = process.env.MEDICAL_SYSTEM_API_KEY;

export class MedicalSystemClient {
  private static axiosInstance = axios.create({
    baseURL: MEDICAL_SYSTEM_BASE_URL,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  static async getWebhookStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemWebhookStats> {
    try {
      const response = await this.axiosInstance.get('/api/voicedrive/webhook-stats', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('[MedicalSystemClient] Webhook統計取得エラー:', error);
      throw error;
    }
  }

  static async getInterviewStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemInterviewStats> {
    try {
      const response = await this.axiosInstance.get('/api/voicedrive/interview-completion-stats', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('[MedicalSystemClient] 面談統計取得エラー:', error);
      throw error;
    }
  }
}
```

##### 3.3 MonitoringServiceの拡張
```typescript
// src/services/MonitoringService.ts に追加

static async getEnhancedIntegrationMetrics(): Promise<EnhancedIntegrationMetrics> {
  try {
    // VoiceDrive側のメトリクス（既存）
    const voicedriveMetrics = await this.getIntegrationMetrics();

    // 医療システム側のメトリクス（新規）
    const [webhookStats, interviewStats] = await Promise.all([
      MedicalSystemClient.getWebhookStats(),
      MedicalSystemClient.getInterviewStats()
    ]);

    // 送信 vs 受信の差分計算
    const syncDiscrepancy = webhookStats.sent24h - voicedriveMetrics.webhook.received24h;

    // 健全性判定
    let syncHealth: 'healthy' | 'warning' | 'critical';
    if (syncDiscrepancy <= 5) {
      syncHealth = 'healthy';
    } else if (syncDiscrepancy <= 20) {
      syncHealth = 'warning';
    } else {
      syncHealth = 'critical';
    }

    return {
      ...voicedriveMetrics,
      medicalSystem: {
        webhookStats,
        interviewStats,
        syncDiscrepancy,
        syncHealth
      }
    };
  } catch (error) {
    console.error('[MonitoringService] 拡張メトリクス取得エラー:', error);
    // 医療システムAPIがエラーでも、VoiceDrive側のメトリクスは返す
    return {
      ...await this.getIntegrationMetrics(),
      medicalSystem: null  // エラー時はnull
    };
  }
}
```

##### 3.4 APIルートの追加
```typescript
// src/api/routes/integration.routes.ts に追加

router.get('/enhanced-metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await MonitoringService.getEnhancedIntegrationMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Integration API] 拡張メトリクス取得エラー:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: '拡張連携監視データの取得に失敗しました'
    });
  }
});
```

##### 3.5 UIの拡張（SystemMonitorPageEnhanced.tsx）
```typescript
// 差分検出アラートの追加

{enhancedMetrics?.medicalSystem && enhancedMetrics.medicalSystem.syncHealth !== 'healthy' && (
  <Card className={`p-4 border mb-6 ${
    enhancedMetrics.medicalSystem.syncHealth === 'critical'
      ? 'bg-red-500/10 border-red-500/50'
      : 'bg-yellow-500/10 border-yellow-500/50'
  }`}>
    <div className="flex items-center gap-3">
      <AlertTriangle className={`w-6 h-6 ${
        enhancedMetrics.medicalSystem.syncHealth === 'critical'
          ? 'text-red-400'
          : 'text-yellow-400'
      }`} />
      <div>
        <h3 className="text-white font-semibold">
          {enhancedMetrics.medicalSystem.syncHealth === 'critical' ? '重大' : '注意'}: データ欠損検出
        </h3>
        <p className={`text-sm ${
          enhancedMetrics.medicalSystem.syncHealth === 'critical'
            ? 'text-red-200'
            : 'text-yellow-200'
        }`}>
          医療システム送信: {enhancedMetrics.medicalSystem.webhookStats.sent24h}件 /
          VoiceDrive受信: {enhancedMetrics.webhook.received24h}件 /
          差分: {enhancedMetrics.medicalSystem.syncDiscrepancy}件
        </p>
      </div>
    </div>
  </Card>
)}

{/* 面談実施率の表示 */}
{enhancedMetrics?.medicalSystem && (
  <Card className="bg-gray-800/50 p-6 border border-gray-700/50 mb-6">
    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
      <Calendar className="w-5 h-5" />
      面談実施統計（医療システム連携）
    </h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-gray-400 text-sm">予定数</p>
        <p className="text-2xl font-bold text-white">
          {enhancedMetrics.medicalSystem.interviewStats.totalScheduled}
        </p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">実施完了</p>
        <p className="text-2xl font-bold text-green-400">
          {enhancedMetrics.medicalSystem.interviewStats.actuallyCompleted}
        </p>
      </div>
      <div>
        <p className="text-gray-400 text-sm">実施率</p>
        <p className={`text-2xl font-bold ${
          enhancedMetrics.medicalSystem.interviewStats.completionRate >= 90
            ? 'text-green-400'
            : enhancedMetrics.medicalSystem.interviewStats.completionRate >= 80
            ? 'text-yellow-400'
            : 'text-red-400'
        }`}>
          {enhancedMetrics.medicalSystem.interviewStats.completionRate.toFixed(1)}%
        </p>
      </div>
    </div>
  </Card>
)}
```

---

#### 4. 環境変数の準備

**`.env`ファイルに追加**:
```bash
# 医療システムAPI接続情報（Phase 2.5で使用）
MEDICAL_SYSTEM_API_URL=https://medical-system.example.com
MEDICAL_SYSTEM_API_KEY=your_api_key_here

# 医療システムWebhook認証情報（既存・Phase 2で使用中）
WEBHOOK_SECRET=your_webhook_secret_here
```

**医療システムチームへの質問**:
- APIのベースURL
- APIキーの発行方法
- 認証方式の詳細

---

#### 5. 統合テスト計画の策定

**テストシナリオ**:

##### シナリオ1: Webhook送信/受信の整合性確認
```typescript
describe('Phase 2.5統合テスト: Webhook差分検出', () => {
  it('医療システムが100件送信、VoiceDriveが100件受信 → 差分0', async () => {
    // 医療システムのモックデータ
    const mockWebhookStats = {
      sent24h: 100,
      succeeded: 100,
      failed: 0
    };

    // VoiceDriveの受信データ
    const voicedriveMetrics = await MonitoringService.getIntegrationMetrics();
    expect(voicedriveMetrics.webhook.received24h).toBe(100);

    // 拡張メトリクス取得
    const enhanced = await MonitoringService.getEnhancedIntegrationMetrics();
    expect(enhanced.medicalSystem.syncDiscrepancy).toBe(0);
    expect(enhanced.medicalSystem.syncHealth).toBe('healthy');
  });

  it('医療システムが100件送信、VoiceDriveが95件受信 → 差分5（警告）', async () => {
    // ... テストコード
    expect(enhanced.medicalSystem.syncDiscrepancy).toBe(5);
    expect(enhanced.medicalSystem.syncHealth).toBe('warning');
  });
});
```

##### シナリオ2: 面談実施率の確認
```typescript
describe('Phase 2.5統合テスト: 面談実施率監視', () => {
  it('予定50件、完了45件 → 実施率90%', async () => {
    const enhanced = await MonitoringService.getEnhancedIntegrationMetrics();
    expect(enhanced.medicalSystem.interviewStats.totalScheduled).toBe(50);
    expect(enhanced.medicalSystem.interviewStats.actuallyCompleted).toBe(45);
    expect(enhanced.medicalSystem.interviewStats.completionRate).toBe(90.0);
  });
});
```

---

### 短期実施（Week 1: 医療システムAPI完成待ち）

#### 6. 医療システムチームとの仕様協議

**キックオフミーティング**（提案: 10月28日 月曜 10:00）

**議題**:
1. API仕様の確認と合意
2. データベーススキーマの共有
3. 実装スケジュールの調整
4. 開発環境・テスト環境のセットアップ
5. 認証方式とAPIキー管理の決定

**準備物**:
- SystemMonitorPage_医療システム確認結果_20251026.md
- Phase 2のデモ（動作確認済み）
- 質問リスト

---

#### 7. Phase 2.5実装ブランチの作成

```bash
git checkout -b feature/system-monitor-phase2.5
```

**ブランチで実装する内容**:
- 型定義（MedicalSystemWebhookStats等）
- MedicalSystemClient
- MonitoringService.getEnhancedIntegrationMetrics()
- API routes拡張
- UI拡張（差分アラート、面談統計）
- 環境変数設定
- テストコード

---

### 中期実施（Week 2-4: 統合テスト〜リリース）

#### 8. 医療システムAPIとの統合テスト

**前提条件**:
- 医療システムのAPI 1とAPI 2が実装完了
- テスト環境で接続可能

**テスト内容**:
1. API接続テスト
2. レスポンス形式の検証
3. エラーハンドリングの確認
4. パフォーマンステスト
5. 負荷テスト

---

#### 9. ドキュメント整備

**作成するドキュメント**:
1. Phase 2.5実装完了報告書
2. 運用マニュアル（差分検出時の対応手順）
3. トラブルシューティングガイド
4. APIクライアント使用ガイド

---

#### 10. 本番環境デプロイ

**デプロイ手順**:
1. Phase 2.5ブランチのマージ
2. 本番環境への環境変数設定
3. デプロイ
4. 本番環境での動作確認
5. 監視設定（Webhook差分アラート等）

---

## 🏥 医療システムチームへの依頼内容

### 即座確認（今日〜明日）

#### 1. 依頼文書のレビュー

**文書**: `SystemMonitorPage_医療システム確認結果_20251026.md`

**確認事項**:
- API仕様が実装可能か
- 工数見積もりが妥当か
- スケジュールが現実的か

**回答期限**: 10月27日（日）まで（できれば）

---

#### 2. 質問への回答

**質問1: Webhook送信の現在の実装**
- 既にログを記録していますか？
- リトライ機能は実装されていますか？
- タイムアウト設定は何秒ですか？

**質問2: 面談管理の現在の実装**
- 面談テーブルのスキーマを共有いただけますか？
- ステータス管理（scheduled/completed/cancelled）は実装されていますか？
- 面談時間の記録は分単位ですか？

**質問3: セキュリティイベント**
- 現在のセキュリティログの形式は？
- 統合監視の必要性は高いですか？
- Phase 3以降の実装で問題ないですか？

**質問4: タイムライン**
- 4週間での実装は可能ですか？
- リソース（開発者数）は確保されていますか？
- テスト環境はいつ利用可能ですか？

---

### 短期実施（Week 1-2）

#### 3. API 1の実装: Webhook送信統計API

**エンドポイント**: `GET /api/voicedrive/webhook-stats`

**実装内容**:
1. データベーステーブル作成（webhook_send_logs）
2. Webhook送信処理の改修（ログ記録追加）
3. 統計API実装
4. リトライ機能実装
5. テスト

**工数**: 3営業日（22時間）

---

### 短期実施（Week 3）

#### 4. API 2の実装: 面談実施統計API

**エンドポイント**: `GET /api/voicedrive/interview-completion-stats`

**実装内容**:
1. データベーススキーマ確認・修正
2. 統計API実装
3. 面談ステータス管理ロジック
4. テスト

**工数**: 2営業日（17時間）

---

### 中期実施（Week 4）

#### 5. 統合テスト

**VoiceDriveチームと共同**:
1. API接続テスト
2. データ整合性確認
3. パフォーマンステスト
4. エラーシナリオテスト

---

### 長期（Phase 3以降、オプション）

#### 6. API 3の実装: 統合セキュリティイベントAPI

**優先度**: 低（オプション）
**工数**: 2.5営業日（18時間）

---

## 📅 全体スケジュール

```
Week 0（今週末）: 準備フェーズ
├─ VoiceDrive: 医療システムチームへ依頼送付
├─ VoiceDrive: Phase 2動作確認
├─ 医療システム: 依頼文書レビュー
└─ 医療システム: 質問への回答

Week 1（10月28日〜）: キックオフ & API 1開始
├─ 月曜 10:00: キックオフMTG
├─ VoiceDrive: Phase 2.5ブランチ作成、型定義実装
├─ 医療システム: webhook_send_logsテーブル作成
├─ 医療システム: Webhook送信処理改修開始
└─ 医療システム: API 1実装開始

Week 2（11月4日〜）: API 1完成 & API 2開始
├─ 医療システム: API 1テスト完了
├─ VoiceDrive: MedicalSystemClient実装
├─ 医療システム: 面談テーブルスキーマ修正
└─ 医療システム: API 2実装開始

Week 3（11月11日〜）: API 2完成 & 統合開始
├─ 医療システム: API 2テスト完了
├─ VoiceDrive: MonitoringService拡張実装
├─ VoiceDrive: UI拡張（差分アラート、面談統計）
└─ 両チーム: 統合テスト環境セットアップ

Week 4（11月18日〜）: 統合テスト & リリース
├─ 両チーム: 統合テスト実施
├─ 両チーム: バグ修正
├─ VoiceDrive: ドキュメント整備
├─ 医療システム: APIドキュメント整備
└─ 両チーム: 本番環境デプロイ
```

---

## ✅ チェックリスト

### VoiceDriveチーム

**今日〜明日**:
- [ ] 医療システムチームへ依頼文書を送付（Slack + MCPファイル共有）
- [ ] Phase 2の動作確認とスクリーンショット取得
- [ ] Phase 2.5実装計画の詳細化
- [ ] 環境変数リストの準備
- [ ] キックオフMTGの日程調整

**Week 1**:
- [ ] キックオフMTG参加
- [ ] Phase 2.5ブランチ作成
- [ ] 型定義実装（MedicalSystemWebhookStats等）
- [ ] MedicalSystemClient実装開始

**Week 2-3**:
- [ ] MonitoringService拡張実装
- [ ] API routes拡張
- [ ] UI拡張（差分アラート、面談統計）
- [ ] テストコード作成

**Week 4**:
- [ ] 統合テスト実施
- [ ] ドキュメント整備
- [ ] 本番環境デプロイ準備
- [ ] デプロイ & 動作確認

---

### 医療システムチーム

**今日〜明日**:
- [ ] 依頼文書レビュー
- [ ] 質問への回答
- [ ] 実装可否の判断
- [ ] スケジュール調整
- [ ] キックオフMTG日程確認

**Week 1-2**:
- [ ] webhook_send_logsテーブル作成
- [ ] Webhook送信処理改修
- [ ] API 1実装
- [ ] API 1テスト

**Week 3**:
- [ ] 面談テーブルスキーマ確認・修正
- [ ] API 2実装
- [ ] API 2テスト

**Week 4**:
- [ ] 統合テスト参加
- [ ] APIドキュメント整備
- [ ] 本番環境デプロイ

---

## 📞 連絡体制

### 日常連絡
- **Slack**: `#phase2-5-integration` チャンネル（新規作成予定）
- **ファイル共有**: MCPサーバー `mcp-shared/docs/`
- **コード共有**: GitHub（統合テスト用）

### 定例会議
- **週次進捗会議**: 毎週金曜日 15:00-15:30
- **緊急連絡**: Slackダイレクトメッセージ

### 緊急連絡先
- VoiceDriveチームリード: [連絡先]
- 医療システムチームリード: [連絡先]

---

## 🎯 成功指標

### Phase 2.5完了の定義

1. **API統合完了**
   - ✅ API 1（Webhook送信統計）が正常動作
   - ✅ API 2（面談実施統計）が正常動作
   - ✅ VoiceDriveから両APIを呼び出せる

2. **差分検出機能**
   - ✅ 送信vs受信の差分が正しく計算される
   - ✅ 差分5件以上で警告アラート表示
   - ✅ 差分20件以上で重大アラート表示

3. **面談実施率監視**
   - ✅ 予定数と実施数が正しく表示される
   - ✅ 実施率が計算される
   - ✅ 実施率90%未満で警告表示

4. **テスト完了**
   - ✅ 単体テスト合格
   - ✅ 統合テスト合格
   - ✅ パフォーマンステスト合格

5. **ドキュメント整備**
   - ✅ API仕様書（OpenAPI形式）
   - ✅ 運用マニュアル
   - ✅ トラブルシューティングガイド

---

## 📝 まとめ

**VoiceDriveチームのNext Action**:
1. **今日**: 医療システムチームへ依頼送付（Slack + MCPファイル共有）
2. **明日**: Phase 2動作確認、Phase 2.5実装計画詳細化
3. **10月28日**: キックオフMTG参加
4. **Week 1-4**: Phase 2.5実装 & 統合テスト

**医療システムチームへの依頼**:
1. **今日〜明日**: 依頼文書レビューと質問への回答
2. **10月28日**: キックオフMTG参加
3. **Week 1-2**: API 1実装
4. **Week 3**: API 2実装
5. **Week 4**: 統合テスト & リリース

**成功のカギ**:
- 両チームの密なコミュニケーション
- 週次進捗会議での課題共有
- 早期の統合テスト開始
- ドキュメントの継続的な更新

---

**最終更新**: 2025年10月26日
**次回更新予定**: キックオフMTG後（10月28日）
