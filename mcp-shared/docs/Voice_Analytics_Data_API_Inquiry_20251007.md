# VoiceDriveボイス分析機能 - 集団分析データ受信API仕様に関するお問い合わせ

**作成日：2025年10月7日**
**作成者：VoiceDrive開発チーム**
**宛先：職員カルテシステム開発チーム様**

---

## 1. 概要

### 1.1 背景

VoiceDriveシステムでは、職員の声（投稿）を収集し、組織改善につなげる仕組みを提供しています。
現在、レベル14（人事部門スタッフ）向けに「ボイス分析（Voice Analytics）」機能を実装予定です。

### 1.2 プライバシーファースト設計

この機能は、以下のプライバシー原則に基づいて設計されます：

✅ **VoiceDriveでは生データを分析しない**
- 職員の投稿内容の分析は職員カルテシステム側で実施
- VoiceDriveは**集団統計データのみ**を受信・表示
- 個人を特定できる情報は一切扱わない

✅ **同意管理との連携**
- データ同意を得た職員のみが分析対象（既に実装済み）
- `src/components/consent/DataConsentModal.tsx`
- `src/components/settings/ConsentSettings.tsx`
- n≥5ルール：5名未満のグループは匿名化

✅ **システム責任の明確化**
- 分析エンジン：職員カルテシステムの責任
- データ表示：VoiceDriveの責任

---

## 2. ボイス分析機能の要件

### 2.1 対象ユーザー

- **レベル14-17**：人事部門スタッフ
- **アクセス権限**：議題モード下の左サイドバー「ボイス分析」

### 2.2 表示したいデータ（例）

#### 2.2.1 投稿動向分析

| 指標 | 説明 |
|------|------|
| 総投稿数 | 月次・週次の推移 |
| カテゴリ別投稿数 | 業務改善、職場環境、福利厚生など |
| 部門別投稿割合 | 看護部、リハビリ科、事務部など |
| レベル別投稿割合 | レベル1-3（一般職員）の投稿比率 |

#### 2.2.2 感情・トーン分析（もし可能であれば）

| 指標 | 説明 |
|------|------|
| ポジティブ率 | 前向きな投稿の割合 |
| ネガティブ率 | 課題提起・不満の投稿の割合 |
| 緊急度スコア | 早急な対応が必要な投稿の検出 |

#### 2.2.3 トピック分析

| 指標 | 説明 |
|------|------|
| 頻出キーワード | 投稿に多く出現する単語（TOP 20） |
| 新興トピック | 最近急増しているテーマ |
| 部門別トピック | 部門ごとの関心事 |

#### 2.2.4 エンゲージメント分析

| 指標 | 説明 |
|------|------|
| 投稿参加率 | 全職員のうち投稿した割合 |
| コメント率 | 投稿あたりのコメント数 |
| 投票参加率 | アイデアボイスへの投票率 |

---

## 3. 提案するAPI仕様

### 3.1 エンドポイント

#### 3.1.1 集団分析データ送信API（職員カルテ → VoiceDrive）

```
POST https://voicedrive.example.com/api/v1/analytics/group-data
```

**送信タイミング（案）**：
- 毎日深夜2:00（日次バッチ）
- または、VoiceDrive側からのリクエストベース（Webhook）

#### 3.1.2 認証方式

```typescript
// JWTトークン認証（お知らせAPIと同様）
Authorization: Bearer <JWT_TOKEN>
```

---

### 3.2 リクエストフォーマット（案）

```typescript
interface GroupAnalyticsRequest {
  // メタデータ
  analysisDate: string;        // 分析実施日 "2025-10-07"
  period: {
    startDate: string;         // 分析期間開始 "2025-09-01"
    endDate: string;           // 分析期間終了 "2025-09-30"
  };

  // 投稿動向
  postingTrends: {
    totalPosts: number;        // 総投稿数
    totalUsers: number;        // 投稿した職員数（同意済みのみ）
    totalEligibleUsers: number; // 同意済み職員総数
    participationRate: number;  // 投稿参加率 %

    // カテゴリ別（アイデアボイス、フリーボイスなど）
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;

    // 部門別
    byDepartment: Array<{
      department: string;
      count: number;
      percentage: number;
    }>;

    // レベル別
    byLevel: Array<{
      levelRange: string;      // "1-3", "4-6", "7-9" など
      count: number;
      percentage: number;
    }>;

    // 月次推移
    monthlyTrend: Array<{
      month: string;           // "2025-09"
      count: number;
    }>;
  };

  // 感情分析（オプション）
  sentimentAnalysis?: {
    positive: number;          // ポジティブ投稿数
    neutral: number;           // 中立投稿数
    negative: number;          // ネガティブ投稿数
    positiveRate: number;      // ポジティブ率 %
    negativeRate: number;      // ネガティブ率 %

    // 部門別感情
    byDepartment: Array<{
      department: string;
      positiveRate: number;
      negativeRate: number;
    }>;
  };

  // トピック分析（オプション）
  topicAnalysis?: {
    // 頻出キーワード（個人特定できないもののみ）
    topKeywords: Array<{
      keyword: string;
      count: number;
      category: string;        // 'work', 'environment', 'welfare' など
    }>;

    // 新興トピック
    emergingTopics: Array<{
      topic: string;
      growthRate: number;      // 増加率 %
      firstSeenDate: string;
    }>;

    // 部門別トピック
    byDepartment: Array<{
      department: string;
      topTopics: string[];     // TOP 3トピック
    }>;
  };

  // エンゲージメント
  engagementMetrics: {
    averageCommentsPerPost: number;  // 投稿あたりコメント数
    averageVotesPerIdea: number;     // アイデアあたり投票数
    activeUserRate: number;          // アクティブユーザー率 %

    // 部門別エンゲージメント
    byDepartment: Array<{
      department: string;
      engagementScore: number;  // エンゲージメントスコア（0-100）
    }>;
  };

  // アラート（緊急性が高いトピック）
  alerts?: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    topic: string;
    description: string;
    affectedDepartments: string[];
    recommendedAction: string;
  }>;

  // プライバシー保護情報
  privacyMetadata: {
    totalConsentedUsers: number;     // 同意済み職員数
    minimumGroupSize: number;        // 最小グループサイズ（通常5）
    excludedSmallGroupsCount: number; // 除外された小規模グループ数
  };
}
```

---

### 3.3 レスポンスフォーマット（VoiceDrive側）

#### 3.3.1 成功レスポンス

```json
{
  "success": true,
  "message": "集団分析データを正常に受信しました",
  "receivedAt": "2025-10-07T14:30:00Z",
  "dataId": "analytics-20251007-143000"
}
```

#### 3.3.2 エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "必須フィールドが不足しています",
    "details": ["postingTrends.totalPosts is required"]
  }
}
```

---

## 4. セキュリティ

### 4.1 データ送信時の保護

- **HTTPS必須**：すべての通信をTLS 1.3で暗号化
- **JWT認証**：お知らせAPIと同じ認証方式
- **IPホワイトリスト**：職員カルテシステムのIPのみ許可
- **レート制限**：1時間あたり10リクエストまで

### 4.2 プライバシー保護

- **n≥5ルール**：5名未満のグループは除外
- **個人特定不可**：生データは一切送信しない
- **同意済みユーザーのみ**：分析対象は同意を得た職員のみ

---

## 5. 実装予定

### 5.1 VoiceDrive側の実装

#### Phase 1: データ受信API実装（1週間）
- エンドポイント作成
- バリデーション実装
- データベーススキーマ設計

#### Phase 2: UI実装（1週間）
- ダッシュボード作成
- グラフ・チャート表示
- フィルタリング機能

#### Phase 3: 統合テスト（3日）
- 職員カルテシステムとの連携テスト
- データ検証

### 5.2 今後のスケジュール（予定）

| 日程 | 内容 |
|------|------|
| 10/7 | 仕様問い合わせ（本ドキュメント） |
| 10/8-10/10 | 職員カルテチームとの仕様調整 |
| 10/11-10/17 | VoiceDrive側実装 |
| 10/18-10/20 | 統合テスト |
| 10/21 | 本番リリース |

---

## 6. ご質問・確認事項

### 6.1 データ提供可否

**Q1. 上記のような集団分析データを提供いただくことは可能でしょうか？**

- 可能な項目
- 不可能な項目
- 追加で提供可能な項目

**Q2. 感情分析・トピック分析は実施されていますか？**

- 実施している場合、どのような分析手法ですか？
- 実施していない場合、将来的に対応予定はありますか？

### 6.2 送信タイミング

**Q3. データ送信のタイミングはどちらが望ましいですか？**

- A案：職員カルテ側から定期的にプッシュ（例：毎日深夜2:00）
- B案：VoiceDrive側から必要時にリクエスト（Pull方式）
- C案：その他（ご提案があればお聞かせください）

### 6.3 データ更新頻度

**Q4. 分析データの更新頻度はどのくらいが適切でしょうか？**

- 日次
- 週次
- 月次
- その他

### 6.4 認証方式

**Q5. 認証方式はお知らせAPIと同様のJWT方式でよろしいでしょうか？**

- 同じJWTトークンを使用
- 別のトークンを発行
- その他の認証方式

### 6.5 追加要望

**Q6. 上記の仕様案について、追加・変更のご要望はありますか？**

---

## 7. 補足情報

### 7.1 VoiceDrive側の同意管理実装状況

既に以下が実装済みです：

| ファイル | 内容 |
|---------|------|
| `src/components/consent/DataConsentModal.tsx` | 初回投稿時の同意モーダル |
| `src/components/settings/ConsentSettings.tsx` | 設定ページの同意管理UI |
| `src/hooks/useDataConsent.ts` | 同意状態管理フック |

**同意項目**：
- ✅ 集団分析への利用同意
- ✅ いつでも撤回可能
- ✅ データ削除リクエスト機能

### 7.2 プライバシーポリシー

VoiceDriveのプライバシーポリシー（`src/pages/PrivacyPolicy.tsx`）には、以下が明記されています：

- 匿名投稿は匿名のまま保護
- 人事評価には使用しない
- 集団分析のみ実施（n≥5ルール）
- 個人特定不可

---

## 8. 連絡先

### VoiceDrive開発チーム

- **Slack**: `#voicedrive-dev`
- **Email**: voicedrive-dev@example.com
- **担当者**: VoiceDriveプロジェクトリード

### 対応期限

**2025年10月10日（木）までにご回答いただけますと幸いです。**

お忙しいところ恐れ入りますが、ご確認のほどよろしくお願いいたします。

---

**VoiceDrive開発チーム一同**
