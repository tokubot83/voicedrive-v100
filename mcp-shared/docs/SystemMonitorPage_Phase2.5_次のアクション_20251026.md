# SystemMonitorPage Phase 2.5 - 次のアクション（VoiceDriveチーム）

**作成日**: 2025年10月26日
**対象**: VoiceDriveチーム
**Phase**: Phase 2完了 → Phase 2.5準備開始

---

## 📋 現在の状況

### ✅ 完了した作業

1. **Phase 2実装**: 医療システム連携監視20項目が動作中
2. **ドキュメント作成**: 5つの文書を作成・共有
3. **医療システムチームとの合意**: 4週間スケジュール、API仕様、実装方針

### 🎯 これからやること

医療システムチームからの回答を受けて、VoiceDrive側でも準備を開始します。

---

## 🚀 今日・明日やること（優先度順）

### 1. 医療システムチームへSlack通知を送る ⭐⭐⭐

**目的**: VoiceDrive側の回答書を医療システムチームに伝える

**Slackメッセージ案**（`#phase2-integration`チャンネル）:

```markdown
@medical-system-team お疲れ様です！VoiceDriveチームです。

Phase 2.5の回答書（MED-RESPONSE-2025-1026-002）をありがとうございました🙏

VoiceDrive側からの回答書を作成しましたので、ご確認ください：

📄 **SystemMonitorPage_VoiceDrive回答書_20251026.md**
   場所: mcp-shared/docs/

【回答内容サマリー】
✅ APIベースURL: 提案通りで問題ありません
✅ APIキー: 環境ごとに別々のキーを使用（ステージング用・本番用）
✅ 統合テスト: 6つのシナリオを詳細化しました
✅ データ保持期間: 3ヶ月（90日）で統一します

【VoiceDrive側からの追加共有事項】
📝 型定義を事前共有します（10/28キックオフMTG時）
📝 統合テストシナリオ詳細版を11/12に共有します
📝 テストデータのサンプル形式を記載しました

【確認事項】
1. ステージング環境APIキーを10/28のMTGで共有いただけますか？
2. テストデータの形式（JSON配列）で問題ないでしょうか？

引き続きよろしくお願いいたします！

次回: 10月28日（月）10:00 キックオフMTG 🎯
```

**実施方法**:
1. Slackを開く
2. `#phase2-integration`チャンネルに投稿
3. 医療システムチームからの返信を待つ

---

### 2. Phase 2の動作確認とスクリーンショット取得 ⭐⭐⭐

**目的**: キックオフMTGで医療システムチームにPhase 2の成果をデモする

**手順**:

```bash
# 1. 開発サーバー起動
npm run dev

# 2. ブラウザでアクセス
# URL: http://localhost:3001/admin/system-monitor

# 3. 管理者としてログイン（Level 99）

# 4. 「医療システム連携」タブをクリック

# 5. 以下の項目が表示されることを確認
# ✅ 接続性ステータス（healthy/warning/critical）
# ✅ Webhook受信統計（24時間、イベントタイプ別）
# ✅ データ同期統計（総ユーザー数、写真同期率）
# ✅ 直近のエラーリスト

# 6. スクリーンショットを撮影
# - 全体画面
# - Webhook統計セクション
# - データ同期セクション
```

**スクリーンショット保存先**:
```
mcp-shared/docs/screenshots/
├── system-monitor-integration-overview.png
├── webhook-stats.png
└── data-sync-stats.png
```

**用途**:
- 10/28キックオフMTGでのデモ
- ドキュメントへの添付
- Phase 2完了報告

---

### 3. 環境変数ファイルの準備 ⭐⭐

**目的**: Phase 2.5実装で必要な環境変数を事前設定

**ファイル**: `.env.development`（開発・テスト環境用）

```bash
# 既存の環境変数
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3001"

# Phase 2で追加済み（Webhook受信用）
WEBHOOK_SECRET="your_webhook_secret_here"

# 🆕 Phase 2.5で追加（医療システムAPI連携用）
MEDICAL_SYSTEM_API_URL="https://staging-medical.example.com"
MEDICAL_SYSTEM_API_KEY=""  # ← 10/28のMTGで取得予定
```

**ファイル**: `.env.production`（本番環境用）

```bash
# 既存の環境変数
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://voicedrive-v100.vercel.app"

# Phase 2で追加済み
WEBHOOK_SECRET="production_webhook_secret"

# 🆕 Phase 2.5で追加
MEDICAL_SYSTEM_API_URL="https://medical-system.example.com"
MEDICAL_SYSTEM_API_KEY=""  # ← Week 4（本番デプロイ前）に取得予定
```

**注意事項**:
- `.env.example`も更新して、必要な変数を文書化
- APIキーは10/28のMTG後に設定
- `.gitignore`で`.env`ファイルが除外されていることを確認

---

### 4. 型定義ファイルを作成 ⭐⭐

**目的**: 医療システムチームに事前共有する型定義を準備

**ファイル**: `src/types/medicalSystem.types.ts`（新規作成）

```typescript
/**
 * 医療システムAPI連携用の型定義
 * Phase 2.5で使用
 *
 * 最終更新: 2025-10-26
 * 参照: SystemMonitorPage_VoiceDrive回答書_20251026.md
 */

/**
 * 医療システム側のWebhook送信統計
 * API 1: GET /api/voicedrive/webhook-stats
 */
export interface MedicalSystemWebhookStats {
  /** 過去24時間の送信件数 */
  sent24h: number;
  /** 成功件数 */
  succeeded: number;
  /** 失敗件数 */
  failed: number;
  /** リトライ中の件数 */
  retried: number;
  /** 最終送信日時（ISO 8601） */
  lastSentAt: string;

  /** イベントタイプ別統計 */
  byEventType: {
    [eventType: string]: {
      sent: number;
      succeeded: number;
      failed: number;
      avgResponseTime: number;  // ミリ秒
    };
  };

  /** リトライキューの状態 */
  queueStatus: {
    pending: number;    // 送信待ち
    processing: number; // 処理中
    failed: number;     // 失敗（リトライ上限超過）
  };

  /** リトライポリシー情報 */
  retryPolicy: {
    maxRetries: number;        // 最大リトライ回数
    retryIntervals: number[];  // リトライ間隔（秒）
    currentRetrying: number;   // 現在リトライ中の件数
  };
}

/**
 * 医療システム側の面談実施統計
 * API 2: GET /api/voicedrive/interview-completion-stats
 */
export interface MedicalSystemInterviewStats {
  /** 予定された面談の総数 */
  totalScheduled: number;
  /** 実際に完了した面談数 */
  actuallyCompleted: number;
  /** 実施率（%） */
  completionRate: number;
  /** 無断欠席率（%） */
  noShowRate: number;
  /** 再予約された件数 */
  rescheduledCount: number;
  /** 平均所要時間（分） */
  avgDuration: number;

  /** 面談タイプ別統計 */
  byInterviewType: {
    [type: string]: {
      scheduled: number;
      completed: number;
      completionRate: number;
      avgDuration: number;
    };
  };

  /** 直近完了面談リスト（最大5件） */
  recentCompletions: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;     // ISO 8601
    completedAt: string;     // ISO 8601
    duration: number;        // 分
    status: 'completed';
  }>;

  /** 未完了面談リスト */
  pendingInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'scheduled';
    isPastDue: boolean;      // 予定時刻を過ぎているか
  }>;

  /** 欠席・キャンセル面談リスト */
  missedInterviews: Array<{
    interviewId: string;
    staffId: string;
    staffName: string;
    interviewType: string;
    scheduledAt: string;
    status: 'no_show' | 'cancelled';
    reason: string | null;
  }>;
}

/**
 * 拡張された連携メトリクス（VoiceDrive + 医療システム）
 */
export interface EnhancedIntegrationMetrics extends IntegrationMetrics {
  /** 医療システム側のデータ */
  medicalSystem: {
    webhookStats: MedicalSystemWebhookStats;
    interviewStats: MedicalSystemInterviewStats;

    /** 送信 vs 受信の差分 */
    syncDiscrepancy: number;

    /** 連携の健全性 */
    syncHealth: 'healthy' | 'warning' | 'critical';
  } | null;  // 医療システムAPIがエラーの場合はnull
}

/**
 * 医療システムAPIのエラーレスポンス
 */
export interface MedicalSystemApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * 医療システムAPIの成功レスポンス（共通）
 */
export interface MedicalSystemApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
```

**実施**:
1. ファイルを作成
2. 医療システムチームに共有（10/28のMTG時）
3. フィードバックを反映

---

## 📅 10月28日（月）キックオフMTG準備 ⭐⭐⭐

### 準備するもの

1. **デモ環境**:
   - VoiceDrive開発サーバーを起動しておく
   - SystemMonitorPageを表示できる状態にする
   - Phase 2（医療システム連携タブ）をデモ

2. **資料**:
   - Phase 2のスクリーンショット
   - 型定義ファイル（`medicalSystem.types.ts`）
   - Phase 2.5実装計画（アクションプラン）

3. **質問リスト**:
   ```
   1. ステージング環境のAPIキーをいただけますか？
   2. APIのベースURLは https://staging-medical.example.com で確定ですか？
   3. 認証方式はBearer Tokenで問題ないですか？
   4. テストデータの形式（JSON配列）で問題ないですか？
   ```

### MTG議題（提案）

```
10:00-10:10 (10分): Phase 2デモ
├─ SystemMonitorPageの「医療システム連携」タブを実演
├─ Webhook受信統計、データ同期統計を説明
└─ Phase 2完了の確認

10:10-10:25 (15分): Phase 2.5の詳細確認
├─ API 1（Webhook送信統計）の仕様確認
├─ API 2（面談実施統計）の仕様確認
├─ 型定義の共有とレビュー
└─ エラーハンドリング方針の確認

10:25-10:40 (15分): 技術的詳細
├─ 認証方式（Bearer Token）の確認
├─ レート制限（100 req/min）の確認
├─ レスポンス形式の確認
├─ APIキーの共有（ステージング環境用）
└─ テスト環境の接続確認

10:40-10:55 (15分): スケジュールとマイルストーン
├─ Week 1-4の詳細スケジュール確認
├─ 各Weekの成果物確認
├─ 統合テストの日程調整（11/18-22）
└─ デプロイ日の確定（11/21または11/22）

10:55-11:00 (5分): Next Actions
├─ VoiceDrive: Week 1実装開始（MedicalSystemClient）
├─ 医療システム: Week 1実装開始（API 1）
└─ 次回MTG日程調整（週次進捗会議）
```

---

## 🛠️ Week 1（10/28-11/1）の実装計画

### Day 1（10/28 月）: キックオフMTG + ブランチ作成

```bash
# 1. キックオフMTG参加（10:00-11:00）

# 2. Phase 2.5ブランチ作成
git checkout main
git pull origin main
git checkout -b feature/system-monitor-phase2.5

# 3. 環境変数にAPIキーを設定（MTGで取得）
# .env.developmentに追記:
# MEDICAL_SYSTEM_API_KEY="vd-staging-api-key-xxx"

# 4. 型定義ファイル作成（既に準備済み）
# src/types/medicalSystem.types.ts

# 5. コミット
git add .
git commit -m "feat: Phase 2.5準備 - 型定義と環境変数追加"
```

### Day 2（10/29 火）: MedicalSystemClient実装

**ファイル**: `src/services/MedicalSystemClient.ts`（新規作成）

```typescript
import axios, { AxiosError } from 'axios';
import {
  MedicalSystemWebhookStats,
  MedicalSystemInterviewStats,
  MedicalSystemApiResponse,
  MedicalSystemApiError
} from '@/types/medicalSystem.types';

const MEDICAL_SYSTEM_BASE_URL = process.env.MEDICAL_SYSTEM_API_URL || '';
const API_KEY = process.env.MEDICAL_SYSTEM_API_KEY || '';

if (!MEDICAL_SYSTEM_BASE_URL || !API_KEY) {
  console.warn('[MedicalSystemClient] 医療システムAPIの設定が不完全です');
}

export class MedicalSystemClient {
  private static axiosInstance = axios.create({
    baseURL: MEDICAL_SYSTEM_BASE_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-VoiceDrive-System-ID': 'voicedrive-v100',
      'Content-Type': 'application/json'
    },
    timeout: 10000  // 10秒
  });

  /**
   * Webhook送信統計を取得
   */
  static async getWebhookStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemWebhookStats> {
    try {
      const response = await this.axiosInstance.get<MedicalSystemApiResponse<MedicalSystemWebhookStats>>(
        '/api/voicedrive/webhook-stats',
        {
          params: { startDate, endDate }
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError('getWebhookStats', error);
      throw error;
    }
  }

  /**
   * 面談実施統計を取得
   */
  static async getInterviewStats(
    startDate?: string,
    endDate?: string
  ): Promise<MedicalSystemInterviewStats> {
    try {
      const response = await this.axiosInstance.get<MedicalSystemApiResponse<MedicalSystemInterviewStats>>(
        '/api/voicedrive/interview-completion-stats',
        {
          params: { startDate, endDate }
        }
      );

      return response.data.data;
    } catch (error) {
      this.handleError('getInterviewStats', error);
      throw error;
    }
  }

  /**
   * エラーハンドリング
   */
  private static handleError(method: string, error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<MedicalSystemApiError>;

      if (axiosError.response) {
        // サーバーエラー（4xx, 5xx）
        console.error(`[MedicalSystemClient.${method}] APIエラー:`, {
          status: axiosError.response.status,
          error: axiosError.response.data
        });
      } else if (axiosError.request) {
        // ネットワークエラー（タイムアウト等）
        console.error(`[MedicalSystemClient.${method}] ネットワークエラー:`, {
          message: axiosError.message,
          code: axiosError.code
        });
      } else {
        // その他のエラー
        console.error(`[MedicalSystemClient.${method}] リクエスト設定エラー:`, axiosError.message);
      }
    } else {
      console.error(`[MedicalSystemClient.${method}] 予期しないエラー:`, error);
    }
  }
}
```

### Day 3（10/30 水）: MonitoringService拡張

**ファイル**: `src/services/MonitoringService.ts`（既存ファイルに追加）

```typescript
import { MedicalSystemClient } from './MedicalSystemClient';
import { EnhancedIntegrationMetrics } from '@/types/medicalSystem.types';

export class MonitoringService {
  // ... 既存のメソッド ...

  /**
   * 拡張された連携メトリクスを取得（VoiceDrive + 医療システム）
   */
  static async getEnhancedIntegrationMetrics(): Promise<EnhancedIntegrationMetrics> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // VoiceDrive側のメトリクス取得（既存）
      const voicedriveMetrics = await this.getIntegrationMetrics();

      // 医療システム側のメトリクス取得（新規）
      try {
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
      } catch (medicalSystemError) {
        console.error('[MonitoringService] 医療システムAPIエラー:', medicalSystemError);

        // 医療システムAPIがエラーでも、VoiceDrive側のメトリクスは返す
        return {
          ...voicedriveMetrics,
          medicalSystem: null
        };
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}
```

---

## ✅ チェックリスト

### 今日・明日（10/26-27）

- [ ] 医療システムチームへSlack通知を送付
- [ ] Phase 2の動作確認とスクリーンショット取得
- [ ] 環境変数ファイルの準備（`.env.development`、`.env.production`、`.env.example`）
- [ ] 型定義ファイルの作成（`src/types/medicalSystem.types.ts`）
- [ ] キックオフMTG議題の準備

### 10月28日（月）

- [ ] 10:00-11:00 キックオフMTG参加
- [ ] ステージング環境APIキーを取得
- [ ] Phase 2.5ブランチ作成（`feature/system-monitor-phase2.5`）
- [ ] 環境変数にAPIキーを設定
- [ ] 初回コミット

### Week 1残り（10/29-11/1）

- [ ] MedicalSystemClient実装
- [ ] MonitoringService.getEnhancedIntegrationMetrics()実装
- [ ] 単体テスト作成
- [ ] 医療システムチームとの接続テスト

---

## 📞 連絡先・リソース

- **Slack**: `#phase2-integration`チャンネル
- **MCPファイル共有**: `mcp-shared/docs/`
- **関連ドキュメント**:
  - `SystemMonitorPage_Phase2.5アクションプラン_20251026.md`
  - `SystemMonitorPage_VoiceDrive回答書_20251026.md`
  - `SystemMonitorPage_医療システム確認結果_20251026.md`

---

**がんばりましょう！Phase 2.5の成功に向けて🚀**

最終更新: 2025年10月26日
