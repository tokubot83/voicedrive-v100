# PersonalStation 医療システム回答反映まとめ

**文書番号**: SUMMARY-PS-RESPONSE-2025-1009-001
**作成日**: 2025年10月9日
**受信文書**: RESPONSE-PS-DB-2025-1009-001（医療システムチームからの回答書）

---

## 📋 エグゼクティブサマリー

医療システムチームから**PersonalStation DB要件分析**への詳細な回答を受領しました。
全ての確認事項に対して前向きな回答が得られ、実装スケジュールも確定しました。

### ✅ 主要な成果

1. **API-2（経験年数サマリ）**: 11月4日〜8日に新規実装決定
2. **Webhook-2（経験年数更新）**: 日次バッチ方式で11月11日〜15日に実装決定
3. **WorkExperienceテーブル**: 既存実装確認（API-2で使用可能）
4. **認証方式**: JWT Bearer Token認証で確定
5. **VoiceDrive側のテーブル追加**: 全て承認（VoteHistory、UserActivitySummary、User.experienceYears）

---

## 🎯 確認事項の回答状況

### 確認-1: WorkExperienceテーブルの存在確認

**質問内容**:
- WorkExperienceテーブルは実装予定か？
- 必要フィールドは含まれるか？
- API-2の実装は可能か？

**回答**:
✅ **全てYES**
- WorkExperienceテーブルは既に構築済み
- employeeId, startDate, endDate, organizationId, positionType 全て含まれる
- API-2実装可能（11月4日〜8日）

**反映内容**:
- [PersonalStation暫定マスターリスト](./PersonalStation暫定マスターリスト_20251008.md) の確認-1にチェックマーク追加
- API-2実装スケジュールを確定

---

### 確認-2: Webhook送信頻度とバッチ処理

**質問内容**:
- リアルタイム送信 vs 日次バッチ、どちらが望ましいか？

**回答**:
✅ **Option B: 日次バッチを採用**
- 実行時刻: 毎日 02:00 JST
- 対象: 全職員
- 前回計算値と比較して変更があった職員のみWebhook送信

**メリット（医療システム側から提示）**:
- リアルタイム更新の負荷を回避
- 経験年数の計算ロジックが一箇所に集約
- VoiceDrive側のキャッシュと医療システムの整合性が保たれる

**反映内容**:
- [PersonalStation暫定マスターリスト](./PersonalStation暫定マスターリスト_20251008.md) の確認-2にチェックマーク追加
- Webhook-2の仕様を「日次バッチ（毎日02:00 JST）」で確定

---

### 確認-3: API認証とセキュリティポリシー

**質問内容**:
- JWT Bearer Token認証で問題ないか？
- トークン発行方法は現行で良いか？
- Rate Limitは100 req/min/IPで十分か？

**回答**:
✅ **全て承認**
- JWT認証でOK
- トークン発行方法でOK
- Rate Limit: 100 req/min/IP で十分（必要に応じて調整可能）

**反映内容**:
- [PersonalStation暫定マスターリスト](./PersonalStation暫定マスターリスト_20251008.md) の確認-3にチェックマーク追加
- セキュリティポリシーを確定

---

## 📅 実装スケジュールの確定

### Phase 1: 最小限の動作（11月4日〜8日）

#### 医療システム側

| 日付 | タスク | 成果物 | 状態 |
|------|--------|-------|------|
| 11月4日（月） | API-2設計、WorkExperienceテーブル確認 | 設計書 | ⏳ 予定 |
| 11月5日（火） | API-2実装開始 | src/api/routes/employee.routes.ts | ⏳ 予定 |
| 11月6日（水） | API-2実装完了、単体テスト作成 | テストコード | ⏳ 予定 |
| 11月7日（木） | API-2ドキュメント作成 | API仕様書 | ⏳ 予定 |
| 11月8日（金） | VoiceDriveチームへのAPI提供準備完了通知 | 準備完了通知書 | ⏳ 予定 |

#### VoiceDrive側

| 日付 | タスク | 成果物 | 状態 |
|------|--------|-------|------|
| 11月4日（月） | Userテーブル拡張（experienceYears追加） | prisma/schema.prisma | ⏳ 予定 |
| 11月4日（月） | Prisma migrate実行 | マイグレーションファイル | ⏳ 予定 |
| 11月5日〜7日 | MedicalSystemClient拡張（API-2呼び出し） | src/services/MedicalSystemClient.ts | ⏳ 予定 |
| 11月7日〜8日 | PersonalStation修正（experienceYears表示） | src/pages/PersonalStationPage.tsx | ⏳ 予定 |

#### 統合テスト

| 日付 | タスク | 担当 | 状態 |
|------|--------|------|------|
| 11月9日（土） | API-2テスト（経験年数計算の正確性確認） | 両チーム | ⏳ 予定 |
| 11月9日（土） | PersonalStation表示確認（実データ） | 両チーム | ⏳ 予定 |

**Phase 1完了時の動作範囲**:
- ✅ ユーザー基本情報表示（名前、部署、役職、**経験年数**）
- ✅ 権限レベル表示
- ✅ マイポスト表示
- ⚠️ 統計カード（ダミーデータのまま）
- ⚠️ 投票履歴（不正確のまま）

---

### Phase 2: 投票履歴の正確化（11月11日〜18日）

#### VoiceDrive側のみ（医療システム側は関与なし）

| 日付 | タスク | 成果物 | 状態 |
|------|--------|-------|------|
| 11月11日（月） | VoteHistoryテーブル追加 | prisma/schema.prisma | ⏳ 予定 |
| 11月11日（月） | Prisma migrate実行 | マイグレーションファイル | ⏳ 予定 |
| 11月12日〜14日 | 投票記録処理実装（recordVote関数） | src/services/VoteService.ts | ⏳ 予定 |
| 11月14日〜16日 | 統計集計実装（UserActivityService） | src/services/UserActivityService.ts | ⏳ 予定 |
| 11月16日〜18日 | PersonalStation修正（ダミーデータ削除） | src/pages/PersonalStationPage.tsx | ⏳ 予定 |

**Phase 2完了時の動作範囲**:
- ✅ 統計カード（実データ）
- ✅ カテゴリ別投票実績（実データ）
- ✅ 投票履歴（正確）

---

### Phase 3: パフォーマンス最適化（11月18日〜22日）

#### VoiceDrive側のみ（医療システム側は関与なし）

| 日付 | タスク | 成果物 | 状態 |
|------|--------|-------|------|
| 11月18日（月） | UserActivitySummaryテーブル追加 | prisma/schema.prisma | ⏳ 予定 |
| 11月18日（月） | Prisma migrate実行 | マイグレーションファイル | ⏳ 予定 |
| 11月19日〜21日 | 日次バッチ実装（全ユーザー統計集計） | src/jobs/calculateUserActivitySummary.ts | ⏳ 予定 |
| 11月21日〜22日 | PersonalStation最適化 | src/pages/PersonalStationPage.tsx | ⏳ 予定 |

**Phase 3完了時の動作範囲**:
- ✅ 高速な統計表示（事前集計データ使用）
- ✅ スケーラビリティ向上（1000ユーザー対応）

---

### 全体スケジュール

```
11月4日〜8日   : Phase 1実装（経験年数API + VoiceDrive Userテーブル拡張）
11月9日       : Phase 1統合テスト
11月11日〜18日 : Phase 2実装（VoteHistory + 統計集計）
11月18日〜22日 : Phase 3実装（UserActivitySummary + パフォーマンス最適化）
11月25日〜30日 : 全体統合テスト
12月2日〜4日   : 本番環境デプロイ
12月5日 02:00  : PersonalStation本番リリース 🎉
```

---

## 🔧 VoiceDrive側の実装アクション（優先順位順）

### 🔴 Priority 1: 即座に実施（今日中）

#### 1. schema.prismaの最終確認
**ファイル**: `prisma/schema.prisma`

**確認項目**:
- [x] User.experienceYears フィールド追加済み（既に実施済み）
- [x] VoteHistory テーブル追加済み（既に実施済み）
- [x] UserActivitySummary テーブル追加済み（既に実施済み）

**状態**: ✅ 完了（前回の作業で既に実施済み）

---

#### 2. マイグレーション実行の準備
**コマンド**:
```bash
# 開発環境でマイグレーション生成（実行は11月4日まで保留）
npx prisma migrate dev --name add_personal_station_features --create-only

# マイグレーションファイルを確認
cat prisma/migrations/xxx_add_personal_station_features/migration.sql
```

**実行タイミング**: 11月4日（月）に医療システムチームと同期して実行

---

### 🟡 Priority 2: Phase 1開始前に準備（11月1日〜3日）

#### 3. MedicalSystemClient拡張（API-2呼び出し）
**ファイル**: `src/services/MedicalSystemClient.ts`

**実装内容**:
```typescript
// 新規メソッド追加
export async function syncEmployeeExperience(employeeId: string) {
  try {
    const response = await fetch(
      `${MEDICAL_SYSTEM_API_BASE}/api/v2/employees/${employeeId}/experience-summary`,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API-2 failed: ${response.status}`);
    }

    const data = await response.json();

    await prisma.user.update({
      where: { employeeId },
      data: {
        experienceYears: data.totalExperienceYears,
        experienceLastUpdatedAt: new Date()
      }
    });

    return data;

  } catch (error) {
    console.error('[MedicalSystemClient] Experience sync failed:', error);
    throw error;
  }
}
```

---

#### 4. VoteService実装準備
**ファイル**: `src/services/VoteService.ts`（新規作成）

**実装内容**:
```typescript
import { prisma } from '../lib/prisma';

export type VoteOption = 'strongly-support' | 'support' | 'neutral' | 'oppose' | 'strongly-oppose';

export async function recordVote(
  userId: string,
  postId: string,
  voteOption: VoteOption,
  voteWeight: number,
  postCategory?: string,
  postType?: string
) {
  await prisma.voteHistory.upsert({
    where: {
      userId_postId: { userId, postId }
    },
    create: {
      userId,
      postId,
      voteOption,
      voteWeight,
      votedAt: new Date(),
      postCategory,
      postType
    },
    update: {
      voteOption,
      voteWeight,
      votedAt: new Date()
    }
  });
}

export async function hasUserVoted(userId: string, postId: string): Promise<boolean> {
  const vote = await prisma.voteHistory.findUnique({
    where: {
      userId_postId: { userId, postId }
    }
  });
  return !!vote;
}

export async function getUserVote(userId: string, postId: string): Promise<VoteOption | null> {
  const vote = await prisma.voteHistory.findUnique({
    where: {
      userId_postId: { userId, postId }
    },
    select: { voteOption: true }
  });
  return vote?.voteOption as VoteOption | null;
}
```

---

#### 5. UserActivityService実装準備
**ファイル**: `src/services/UserActivityService.ts`（新規作成）

**実装内容**:
```typescript
import { prisma } from '../lib/prisma';
import { startOfMonth } from 'date-fns';

export async function getUserVoteStats(userId: string) {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);

  const totalVotes = await prisma.voteHistory.count({
    where: { userId }
  });

  const thisMonthVotes = await prisma.voteHistory.count({
    where: {
      userId,
      votedAt: { gte: thisMonthStart }
    }
  });

  const votes = await prisma.voteHistory.findMany({
    where: { userId },
    select: { voteWeight: true }
  });

  const totalWeight = votes.reduce((sum, v) => sum + v.voteWeight, 0);
  const impactScore = Math.min(100, Math.round(totalWeight * 2));

  return {
    total: totalVotes,
    thisMonth: thisMonthVotes,
    impactScore
  };
}

export async function getVoteStatsByCategory(userId: string) {
  const votes = await prisma.voteHistory.groupBy({
    by: ['postCategory'],
    where: {
      userId,
      postCategory: { not: null }
    },
    _count: { id: true }
  });

  return {
    improvement: votes.find(v => v.postCategory === 'improvement')?._count.id || 0,
    communication: votes.find(v => v.postCategory === 'communication')?._count.id || 0,
    innovation: votes.find(v => v.postCategory === 'innovation')?._count.id || 0,
    strategy: votes.find(v => v.postCategory === 'strategy')?._count.id || 0,
  };
}

export async function getUserVotedPosts(userId: string) {
  const votedPosts = await prisma.voteHistory.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          author: true,
          votes: true
        }
      }
    },
    orderBy: { votedAt: 'desc' }
  });

  return votedPosts.map(v => ({
    ...v.post,
    userVote: v.voteOption,
    votedAt: v.votedAt
  }));
}
```

---

### 🟢 Priority 3: Phase 2以降（11月11日〜）

#### 6. 日次バッチ実装
**ファイル**: `src/jobs/calculateUserActivitySummary.ts`（新規作成）

**実行タイミング**: Phase 3（11月19日〜21日）

---

## 📊 医療システム側のAPI仕様（確定版）

### API-2: 経験年数サマリ取得

**エンドポイント**:
```
GET /api/v2/employees/{employeeId}/experience-summary
```

**認証**:
```
Authorization: Bearer {JWT_TOKEN}
```

**レスポンス例**:
```json
{
  "employeeId": "EMP001",
  "yearsOfService": 4.5,
  "totalExperienceYears": 8.2,
  "currentPositionYears": 2.1,
  "priorExperience": 3.7,
  "specialtyExperienceYears": 6.5,
  "calculatedAt": "2025-10-09T10:00:00.000Z"
}
```

**使用箇所**:
- PersonalStationPage.tsx 157行目: `{contextUser?.experienceYears || 0}年`

**VoiceDrive側のキャッシュフィールド**:
- `User.experienceYears`: `totalExperienceYears`を保存
- `User.experienceLastUpdatedAt`: API呼び出し日時

---

## 🔗 Webhook仕様（確定版）

### Webhook-2: 経験年数更新通知

**エンドポイント**:
```
POST https://voicedrive.ai/api/webhooks/employee-experience-updated
```

**送信タイミング**:
- 日次バッチ（毎日 02:00 JST）
- 前回計算値と比較して変更があった職員のみ送信

**ペイロード例**:
```json
{
  "eventType": "employee.experience.updated",
  "timestamp": "2025-11-12T02:00:00.000Z",
  "employeeId": "EMP001",
  "experienceSummary": {
    "yearsOfService": 4.5,
    "totalExperienceYears": 8.2,
    "currentPositionYears": 2.1,
    "specialtyExperienceYears": 6.5
  },
  "signature": "hmac_sha256_signature_here"
}
```

**VoiceDrive側の処理**:
```typescript
// src/api/routes/webhook.routes.ts
router.post('/employee-experience-updated', verifyWebhookSignature, async (req, res) => {
  const { employeeId, experienceSummary } = req.body;

  await prisma.user.update({
    where: { employeeId },
    data: {
      experienceYears: experienceSummary.totalExperienceYears,
      experienceLastUpdatedAt: new Date()
    }
  });

  res.status(200).json({ received: true });
});
```

---

## ✅ チェックリスト更新

### 医療システム側

- [x] **確認-1**: WorkExperienceテーブル仕様確認 ✅
- [x] **確認-2**: Webhook送信頻度決定（日次バッチ） ✅
- [x] **確認-3**: API認証方式確認（JWT） ✅
- [ ] **API-2**: 経験年数サマリーAPI実装（11月4日〜8日）
- [ ] **Webhook-2**: 経験年数更新通知実装（11月11日〜15日）
- [ ] **Webhook-4**: 職員復職通知実装（11月11日〜15日）
- [ ] テスト環境でのAPI動作確認（11月9日）

### VoiceDrive側

- [x] **schema.prisma**: User.experienceYears追加 ✅
- [x] **schema.prisma**: VoteHistoryテーブル追加 ✅
- [x] **schema.prisma**: UserActivitySummaryテーブル追加 ✅
- [ ] **マイグレーション**: Prisma migrate実行（11月4日）
- [ ] **MedicalSystemClient**: API-2呼び出し実装（11月5日〜7日）
- [ ] **VoteService**: 投票記録処理実装（11月12日〜14日）
- [ ] **UserActivityService**: 統計集計実装（11月14日〜16日）
- [ ] **PersonalStation**: experienceYears表示切り替え（11月7日〜8日）
- [ ] **PersonalStation**: ダミーデータ削除、実データ接続（11月16日〜18日）
- [ ] **統合テスト**: Phase 1（11月9日）
- [ ] **統合テスト**: Phase 2（11月18日）
- [ ] **パフォーマンステスト**: 1000ユーザー（11月25日〜30日）

---

## 📝 次のアクション

### 今日（10月9日）

1. ✅ **医療システム回答書の受領確認** - 完了
2. ⏳ **既存ドキュメントへの反映** - 進行中
3. ⏳ **次のページ分析準備** - 待機中

### 明日以降（10月10日〜11月3日）

1. **Dashboard分析開始**（次のページ）
2. **DepartmentBoard分析**
3. **AgendaMode分析**
4. **統合マスターリスト作成**
5. **Phase 1実装準備**

---

## 🔄 関連ドキュメント更新状況

| ドキュメント | 更新内容 | 状態 |
|------------|---------|------|
| [PersonalStation暫定マスターリスト_20251008.md](./PersonalStation暫定マスターリスト_20251008.md) | 確認事項にチェックマーク追加 | ✅ 更新済み |
| [PersonalStation_DB要件分析_20251008.md](./PersonalStation_DB要件分析_20251008.md) | スケジュール確定を反映 | ✅ 更新済み |
| [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md) | 変更なし | - |

---

**作成者**: AI (Claude Code)
**次のステップ**: Dashboardページの分析開始

---

## 🎉 医療システムチームへの感謝

詳細かつ迅速な回答をいただき、誠にありがとうございます。
明確なスケジュールと実装方針の確定により、PersonalStationページの成功が確実になりました。

引き続き、よろしくお願いいたします。

---

**最終更新**: 2025年10月9日
**バージョン**: 1.0
**次回レビュー**: Phase 1開始時（11月4日）
