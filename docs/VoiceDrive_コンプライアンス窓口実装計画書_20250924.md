# VoiceDriveシステム側 コンプライアンス窓口実装計画書

## 📅 作成日：2025年9月24日
## 📌 文書番号：VD-COMP-IMPL-001
## 🎯 重要度：最高優先度

---

## 1. エグゼクティブサマリー

### 1.1 目的
VoiceDriveシステムを医療法人厚生会（小原病院）の公式デジタルコンプライアンス窓口として機能させ、24時間365日の匿名通報受付と医療職員管理システムへの安全な転送を実現する。

### 1.2 スコープ
- デジタル一次受付窓口機能の実装
- 段階的情報開示システムの構築
- 医療職員管理システムとのセキュアなAPI連携
- 小原病院規定準拠のカテゴリ・フロー実装

### 1.3 期待される成果
- 通報のハードル低下による早期問題発見
- 完全な匿名性保護による通報者の安全確保
- 迅速な初期対応による問題の深刻化防止
- 法的コンプライアンスの完全遵守

---

## 2. 現状分析と要件定義

### 2.1 現状の課題
- ✅ 基本的なUIは実装済み
- ❌ 医療システムとのAPI連携未実装
- ❌ 小原病院規定との完全な整合性欠如
- ❌ 段階的情報開示機能の不足
- ❌ 暗号化・セキュリティ機能の不足

### 2.2 機能要件

#### 必須要件（Phase 1）
1. **通報カテゴリの拡充**
   - ハラスメント（パワー、セクシャル、マタニティ）
   - 医療法令違反
   - 診療報酬不正請求
   - 個人情報漏洩
   - 研究不正行為

2. **窓口体制の実装**
   - 内部窓口：事務長、看護部長、法人人事部
   - 外部窓口：弁護士、社会保険労務士
   - 連絡先情報の管理

3. **匿名性レベルの選択**
   - 完全匿名
   - 条件付き開示
   - 実名通報

#### 追加要件（Phase 2）
1. **調査プロセス管理**
2. **ハラスメント対策委員会連携**
3. **懲戒委員会連携**

### 2.3 非機能要件
- **セキュリティ**：AES-256-GCM暗号化、TLS 1.3
- **可用性**：99.9%以上
- **性能**：API応答時間200ms以内
- **監査**：全アクセスログの90日保持

---

## 3. 実装スケジュール

### Phase 1：基盤構築（3日間）

#### Day 1-2：データモデル拡張
```typescript
// src/types/compliance-enhanced.ts
export interface ComplianceReport {
  // 基本情報
  reportId: string;  // VD-2025-XXXX形式
  anonymousId: string;  // ANON-XXXXXX形式
  submittedAt: Date;
  lastUpdatedAt: Date;

  // 通報者情報（段階的開示）
  reporter: {
    isAnonymous: boolean;
    disclosureLevel: 'full_anonymous' | 'conditional' | 'disclosed';
    consentToDisclose?: {
      granted: boolean;
      grantedAt?: Date;
      conditions?: string[];
    };
    attributes?: {
      employmentType?: 'regular' | 'contract' | 'part_time';
      yearsOfService?: 'less_than_1' | '1-3' | '3-5' | '5-10' | 'over_10';
      ageGroup?: '20s' | '30s' | '40s' | '50s' | '60s';
      gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    };
  };

  // カテゴリ（小原病院規定準拠）
  category: {
    main: 'harassment' | 'safety' | 'financial' | 'medical_law' |
          'discrimination' | 'information_leak' | 'research_fraud' | 'other';
    sub?: string;
    specificType?: {
      harassmentType?: 'power' | 'sexual' | 'maternity' | 'other';
      medicalViolationType?: 'medical_law' | 'billing_fraud' | 'malpractice';
    };
  };

  // 事案詳細
  incident: {
    description: string;
    location: {
      general: string;  // "病棟"
      specific?: string;  // "3階東病棟"（段階的開示）
      isRemote?: boolean;
    };
    timeline: {
      occurredAt?: Date;
      startedAt?: Date;  // 継続的な場合
      frequency?: string;
      isOngoing: boolean;
    };
    accused?: {
      count: number;
      relationship: 'supervisor' | 'colleague' | 'subordinate' | 'external' | 'unknown';
      position?: string;  // 段階的開示
      name?: string;  // 第3段階のみ
    };
  };

  // 証拠
  evidence: {
    hasEvidence: boolean;
    types: ('document' | 'recording' | 'photo' | 'witness' | 'email' | 'other')[];
    files: {
      id: string;
      type: string;
      uploadedAt: Date;
      encryptedPath: string;
      checksum: string;
    }[];
    witnessCount?: number;
  };

  // 緊急度判定
  assessment: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    urgencyScore: number;  // 1-10
    riskFactors: string[];
    requiresImmediateAction: boolean;
    assessedBy: 'system' | 'human';
    assessedAt: Date;
  };

  // 転送管理
  transfer: {
    status: 'pending' | 'transferred' | 'acknowledged' | 'failed';
    transferredAt?: Date;
    medicalSystemCaseId?: string;
    acknowledgement?: {
      receivedAt: Date;
      receivedBy: string;
      message?: string;
    };
    retryCount: number;
    lastError?: string;
  };

  // 進捗追跡
  tracking: {
    currentStatus: 'submitted' | 'under_review' | 'investigating' |
                   'pending_decision' | 'resolved' | 'closed';
    statusHistory: {
      status: string;
      changedAt: Date;
      changedBy: string;
      note?: string;
    }[];
    estimatedCompletionDate?: Date;
  };

  // アクセス制御
  accessControl: {
    viewableBy: string[];  // role IDs
    lastAccessedBy?: {
      userId: string;
      role: string;
      accessedAt: Date;
      accessType: 'view' | 'edit' | 'export';
    };
    auditLog: {
      timestamp: Date;
      userId: string;
      action: string;
      details?: string;
    }[];
  };
}
```

#### Day 3：API通信層実装

```typescript
// src/services/ComplianceTransferService.ts
import crypto from 'crypto';

export class ComplianceTransferService {
  private readonly API_BASE = process.env.MEDICAL_SYSTEM_API_BASE;
  private readonly API_KEY = process.env.COMPLIANCE_API_KEY;

  /**
   * 通報データを医療システムへ安全に転送
   */
  async transferReport(report: ComplianceReport): Promise<TransferResult> {
    try {
      // データの暗号化
      const encryptedPayload = await this.encryptData(report);

      // チェックサム生成
      const checksum = this.generateChecksum(encryptedPayload);

      // 転送リクエスト構築
      const transferRequest = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        source: 'voicedrive',
        payload: encryptedPayload,
        checksum,
        metadata: {
          reportId: report.reportId,
          severity: report.assessment.severity,
          requiresImmediateAction: report.assessment.requiresImmediateAction
        }
      };

      // API呼び出し（リトライ付き）
      const response = await this.sendWithRetry(transferRequest);

      // 転送記録の更新
      await this.updateTransferStatus(report.reportId, response);

      return response;

    } catch (error) {
      await this.logTransferError(report.reportId, error);
      throw new ComplianceTransferError('Transfer failed', error);
    }
  }

  /**
   * AES-256-GCMで暗号化
   */
  private async encryptData(data: any): Promise<EncryptedData> {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * リトライ機能付きAPI送信
   */
  private async sendWithRetry(
    request: any,
    maxRetries = 3
  ): Promise<TransferResult> {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${this.API_BASE}/compliance/receive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`,
            'X-Request-ID': crypto.randomUUID(),
            'X-Retry-Count': i.toString()
          },
          body: JSON.stringify(request)
        });

        if (response.ok) {
          return await response.json();
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

      } catch (error) {
        lastError = error;
        await this.delay(Math.pow(2, i) * 1000); // 指数バックオフ
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateChecksum(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
```

### Phase 2：UI/UX実装（4日間）

#### Day 4-5：通報フォームの拡張

```typescript
// src/components/compliance/EnhancedReportForm.tsx
import React, { useState, useCallback } from 'react';
import { useComplianceSubmit } from '../../hooks/useComplianceSubmit';
import { CategorySelector } from './CategorySelector';
import { EvidenceUploader } from './EvidenceUploader';
import { AnonymitySelector } from './AnonymitySelector';
import { ProgressIndicator } from './ProgressIndicator';

export const EnhancedReportForm: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormData>({
    anonymityLevel: 'full_anonymous',
    category: null,
    description: '',
    evidence: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const { submit, isSubmitting, error } = useComplianceSubmit();

  const updateFormData = (updates: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await submit(formData);

      // 匿名IDを表示して保存を促す
      alert(`通報が正常に送信されました。\n\n追跡ID: ${result.anonymousId}\n\nこのIDは進捗確認に必要です。大切に保管してください。`);

      // フォームをリセット
      setFormData({
        anonymityLevel: 'full_anonymous',
        category: null,
        description: '',
        evidence: []
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Submission failed:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    }
  };

  // ステップ1：匿名性の選択
  const Step1_Anonymity = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">通報方法を選択してください</h3>

      <div className="space-y-4">
        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="anonymity"
            value="full_anonymous"
            checked={formData.anonymityLevel === 'full_anonymous'}
            onChange={(e) => updateFormData({ anonymityLevel: e.target.value })}
          />
          <div className="ml-6">
            <p className="font-medium">完全匿名</p>
            <p className="text-sm text-gray-600">
              あなたの身元は最後まで保護されます。
              ただし、詳細な調査が制限される場合があります。
            </p>
          </div>
        </label>

        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="anonymity"
            value="conditional"
            checked={formData.anonymityLevel === 'conditional'}
            onChange={(e) => updateFormData({ anonymityLevel: e.target.value })}
          />
          <div className="ml-6">
            <p className="font-medium">条件付き開示</p>
            <p className="text-sm text-gray-600">
              通常は匿名ですが、調査に必要な場合のみ、
              あなたの同意を得て開示される可能性があります。
            </p>
          </div>
        </label>

        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="anonymity"
            value="disclosed"
            checked={formData.anonymityLevel === 'disclosed'}
            onChange={(e) => updateFormData({ anonymityLevel: e.target.value })}
          />
          <div className="ml-6">
            <p className="font-medium">実名通報</p>
            <p className="text-sm text-gray-600">
              最初から実名で通報します。
              迅速な対応が期待できますが、身元は保護されません。
            </p>
          </div>
        </label>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm">
          <strong>重要：</strong>
          どの方法を選んでも、通報したことを理由とした不利益な取り扱いは禁止されています。
        </p>
      </div>
    </div>
  );

  // 以下、Step2〜Step5のコンポーネント実装...

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProgressIndicator currentStep={currentStep} totalSteps={5} />

      <form onSubmit={handleSubmit} className="mt-8">
        {currentStep === 1 && <Step1_Anonymity />}
        {/* 他のステップ */}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border rounded-lg"
            >
              戻る
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg ml-auto"
            >
              次へ
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg ml-auto disabled:opacity-50"
            >
              {isSubmitting ? '送信中...' : '通報する'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
```

### Phase 3：セキュリティ・監査機能（3日間）

#### Day 8-9：暗号化とアクセス制御

```typescript
// src/services/ComplianceSecurityService.ts
export class ComplianceSecurityService {
  /**
   * ファイルの暗号化保存
   */
  async encryptAndStoreFile(file: File): Promise<EncryptedFile> {
    const buffer = await file.arrayBuffer();
    const encrypted = await this.encryptBuffer(buffer);

    const metadata = {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date(),
      checksum: await this.calculateChecksum(buffer)
    };

    const storagePath = await this.secureStorage.save(encrypted, metadata);

    return {
      id: crypto.randomUUID(),
      path: storagePath,
      metadata
    };
  }

  /**
   * アクセス監査ログ
   */
  async logAccess(
    userId: string,
    reportId: string,
    action: AccessAction,
    details?: any
  ): Promise<void> {
    const log: AuditLog = {
      timestamp: new Date(),
      userId,
      userRole: await this.getUserRole(userId),
      reportId,
      action,
      details,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId()
    };

    await this.auditStorage.append(log);

    // 不審なアクセスパターンの検出
    if (await this.detectSuspiciousActivity(userId, reportId)) {
      await this.alertSecurityTeam(log);
    }
  }
}
```

---

## 4. 技術アーキテクチャ

### 4.1 システム構成図

```
┌─────────────────────────────────────────────┐
│           VoiceDrive Frontend               │
│         (React + TypeScript)                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          VoiceDrive Backend                 │
│    ┌────────────────────────────┐          │
│    │   Compliance Service       │          │
│    ├────────────────────────────┤          │
│    │   - Report Reception       │          │
│    │   - Encryption Service     │          │
│    │   - Transfer Service       │          │
│    │   - Audit Service         │          │
│    └────────────────────────────┘          │
└─────────────────┬───────────────────────────┘
                  │
                  │ Encrypted API (TLS 1.3)
                  ▼
┌─────────────────────────────────────────────┐
│      Medical Staff System API               │
│         (Compliance Module)                 │
└─────────────────────────────────────────────┘
```

### 4.2 データフロー

1. **通報受付**
   - ユーザー入力 → バリデーション → 暗号化

2. **データ転送**
   - 暗号化 → チェックサム生成 → API送信 → 確認応答

3. **進捗追跡**
   - 匿名ID照会 → ステータス取得 → 表示

---

## 5. セキュリティ設計

### 5.1 暗号化仕様

| レイヤー | 方式 | 用途 |
|---------|------|------|
| 通信 | TLS 1.3 | API通信の暗号化 |
| データ | AES-256-GCM | 保存データの暗号化 |
| ファイル | AES-256-CBC | アップロードファイル |
| 鍵交換 | RSA-4096 | 暗号鍵の安全な交換 |

### 5.2 アクセス制御

```typescript
// アクセスレベル定義
enum AccessLevel {
  PUBLIC = 0,        // 誰でもアクセス可能
  AUTHENTICATED = 1, // ログインユーザー
  REPORTER = 2,      // 通報者本人
  INVESTIGATOR = 3,  // 調査担当者
  MANAGER = 4,       // 管理者
  ADMIN = 5         // システム管理者
}
```

---

## 6. テスト計画

### 6.1 単体テスト

```typescript
describe('ComplianceReport', () => {
  it('匿名IDが正しく生成される');
  it('カテゴリが小原病院規定と一致する');
  it('暗号化が正しく実行される');
});
```

### 6.2 統合テスト

```typescript
describe('E2E Compliance Flow', () => {
  it('通報から転送まで完了する');
  it('進捗追跡が正しく動作する');
  it('エラー時にリトライする');
});
```

### 6.3 セキュリティテスト

- SQLインジェクション対策
- XSS対策
- CSRF対策
- 認証バイパス試行

---

## 7. 運用・保守

### 7.1 監視項目

| 項目 | 閾値 | アラート |
|-----|------|----------|
| API応答時間 | > 500ms | Warning |
| エラー率 | > 1% | Critical |
| 転送失敗 | > 3回 | Critical |
| ディスク使用率 | > 80% | Warning |

### 7.2 バックアップ

- **頻度**：日次（差分）、週次（完全）
- **保持期間**：90日
- **暗号化**：必須

---

## 8. リスク管理

### 8.1 技術的リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| API連携失敗 | 高 | リトライ機構、キュー実装 |
| データ漏洩 | 最高 | 多層防御、暗号化 |
| システム障害 | 高 | 冗長化、フェイルオーバー |

### 8.2 運用リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 誤操作 | 中 | 権限管理、監査ログ |
| 悪意ある通報 | 低 | 本人確認、ペナルティ |

---

## 9. プロジェクト体制

### 9.1 開発チーム

- **プロジェクトリーダー**：1名
- **バックエンド開発**：2名
- **フロントエンド開発**：2名
- **セキュリティ担当**：1名
- **テスト担当**：1名

### 9.2 ステークホルダー

- **医療法人厚生会**：承認権限
- **小原病院**：要件定義、受入テスト
- **法務部門**：コンプライアンス確認
- **IT部門**：インフラ提供

---

## 10. 成功指標（KPI）

### 10.1 技術指標

- システム可用性：99.9%以上
- API応答時間：200ms以下（99%tile）
- 暗号化処理時間：100ms以下
- 転送成功率：99.5%以上

### 10.2 ビジネス指標

- 通報受付から初回対応：24時間以内
- 緊急案件の即時通知：100%
- 通報者満足度：80%以上
- 問題の早期発見率：前年比20%向上

---

## 11. 次のステップ

1. **承認取得**（2日以内）
   - 経営層の承認
   - 予算確保

2. **開発環境構築**（1週間）
   - 開発サーバー準備
   - CI/CDパイプライン構築

3. **開発開始**（Phase 1: 3日間）
   - データモデル実装
   - API通信層実装

4. **テスト・検証**（1週間）
   - 単体テスト
   - 統合テスト
   - セキュリティテスト

5. **本番展開**（2日間）
   - 段階的ロールアウト
   - モニタリング開始

---

## 改訂履歴

| 版 | 日付 | 作成者 | 内容 |
|----|------|--------|------|
| 1.0 | 2025-09-24 | VoiceDrive開発チーム | 初版作成 |

---

**本文書は機密情報を含みます。取り扱いには十分注意してください。**