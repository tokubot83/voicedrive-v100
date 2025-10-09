# 施設ガバナンスページ 暫定マスターリスト

**文書番号**: FG-MASTER-2025-1009-001
**作成日**: 2025年10月9日
**作成者**: VoiceDriveチーム
**目的**: 施設ガバナンスページ稼働に必要な暫定マスターデータを定義
**重要度**: 🔴 最重要
**関連文書**: facility-governance_DB要件分析_20251009.md

---

## 📋 エグゼクティブサマリー

### 目的
- 施設ガバナンスページの**即時稼働**を可能にする暫定マスターデータの定義
- 医療システムからの正式データ提供までの**つなぎデータ**として機能
- デモ環境・テスト環境での**動作確認**に使用

### 運用方針
1. **暫定データ運用期間**: 医療システムAPI連携完了まで
2. **移行戦略**: 医療システムから正式データ提供後、段階的に置き換え
3. **データソース**: 一般的な医療機関の方針・規則を参考に作成

---

## 🏥 マスター1: 施設方針・規則（FacilityPolicy）

### 方針1: 個人情報保護方針

```json
{
  "id": "policy-001",
  "title": "個人情報保護方針",
  "description": "患者および職員の個人情報を適切に管理し、プライバシーを保護するための方針",
  "category": "コンプライアンス",
  "version": "v2.1",
  "status": "active",
  "compliance": 98,
  "content": "当院は、個人情報の保護に関する法律を遵守し、患者および職員の個人情報を適切に管理します。個人情報の収集・利用・提供は、利用目的を明示し、同意を得た上で行います。",
  "contentUrl": null,
  "owner": "個人情報保護管理者",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2024-01-15T00:00:00.000Z",
  "nextReviewDate": "2025-01-15T00:00:00.000Z",
  "relatedPolicies": ["policy-007"],
  "applicableScope": "全職員"
}
```

---

### 方針2: 労働安全衛生規則

```json
{
  "id": "policy-002",
  "title": "労働安全衛生規則",
  "description": "職員の安全と健康を確保するための職場環境整備に関する規則",
  "category": "安全管理",
  "version": "v1.5",
  "status": "active",
  "compliance": 95,
  "content": "当院は、労働安全衛生法に基づき、職員の安全と健康を確保するため、職場環境の整備、安全衛生教育の実施、健康診断の実施等を行います。",
  "contentUrl": null,
  "owner": "安全衛生委員会委員長",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2023-06-10T00:00:00.000Z",
  "nextReviewDate": "2025-06-10T00:00:00.000Z",
  "relatedPolicies": ["policy-004"],
  "applicableScope": "全職員"
}
```

---

### 方針3: ハラスメント防止規定

```json
{
  "id": "policy-003",
  "title": "ハラスメント防止規定",
  "description": "職場におけるハラスメントを防止し、快適な職場環境を維持するための規定",
  "category": "人事",
  "version": "v3.0",
  "status": "review",
  "compliance": 92,
  "content": "当院は、セクシュアルハラスメント、パワーハラスメント、マタニティハラスメント等、あらゆるハラスメントを許しません。全職員が互いを尊重し、快適な職場環境を維持します。",
  "contentUrl": null,
  "owner": "人事部長",
  "ownerId": null,
  "approvedBy": null,
  "approverId": null,
  "approvedDate": null,
  "nextReviewDate": "2025-03-01T00:00:00.000Z",
  "relatedPolicies": ["policy-008"],
  "applicableScope": "全職員"
}
```

---

### 方針4: 医療安全管理指針

```json
{
  "id": "policy-004",
  "title": "医療安全管理指針",
  "description": "医療事故を未然に防ぎ、安全な医療を提供するための管理指針",
  "category": "医療安全",
  "version": "v4.2",
  "status": "active",
  "compliance": 99,
  "content": "当院は、医療の質と安全を確保するため、医療安全管理体制を整備し、インシデント報告制度の運用、医療安全研修の実施等を行います。",
  "contentUrl": null,
  "owner": "医療安全管理者",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2024-04-01T00:00:00.000Z",
  "nextReviewDate": "2025-04-01T00:00:00.000Z",
  "relatedPolicies": ["policy-002", "policy-005"],
  "applicableScope": "全職員"
}
```

---

### 方針5: 感染症対策指針

```json
{
  "id": "policy-005",
  "title": "感染症対策指針",
  "description": "院内感染を防止し、職員と患者の安全を確保するための対策指針",
  "category": "医療安全",
  "version": "v2.8",
  "status": "active",
  "compliance": 97,
  "content": "当院は、感染症の予防と拡大防止のため、標準予防策の徹底、感染症発生時の対応手順の整備、職員への感染対策教育を実施します。",
  "contentUrl": null,
  "owner": "感染管理認定看護師",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2024-02-01T00:00:00.000Z",
  "nextReviewDate": "2025-02-01T00:00:00.000Z",
  "relatedPolicies": ["policy-004"],
  "applicableScope": "全職員"
}
```

---

### 方針6: 情報セキュリティポリシー

```json
{
  "id": "policy-006",
  "title": "情報セキュリティポリシー",
  "description": "医療情報システムのセキュリティを確保するためのポリシー",
  "category": "情報セキュリティ",
  "version": "v1.9",
  "status": "active",
  "compliance": 94,
  "content": "当院は、医療情報システムの機密性・完全性・可用性を確保するため、アクセス制御、ログ管理、データバックアップ等のセキュリティ対策を実施します。",
  "contentUrl": null,
  "owner": "情報システム部長",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2024-03-01T00:00:00.000Z",
  "nextReviewDate": "2025-03-01T00:00:00.000Z",
  "relatedPolicies": ["policy-001"],
  "applicableScope": "全職員"
}
```

---

### 方針7: プライバシーマーク運用規定

```json
{
  "id": "policy-007",
  "title": "プライバシーマーク運用規定",
  "description": "プライバシーマーク取得・維持のための運用規定",
  "category": "コンプライアンス",
  "version": "v1.2",
  "status": "draft",
  "compliance": 0,
  "content": "当院は、プライバシーマーク認定を取得し、個人情報保護管理体制を構築します。定期的な内部監査と改善活動を実施します。",
  "contentUrl": null,
  "owner": "個人情報保護管理者",
  "ownerId": null,
  "approvedBy": null,
  "approverId": null,
  "approvedDate": null,
  "nextReviewDate": "2025-06-01T00:00:00.000Z",
  "relatedPolicies": ["policy-001"],
  "applicableScope": "個人情報取扱部門"
}
```

---

### 方針8: 公益通報者保護規程

```json
{
  "id": "policy-008",
  "title": "公益通報者保護規程",
  "description": "内部通報制度と通報者の保護に関する規程",
  "category": "人事",
  "version": "v1.0",
  "status": "active",
  "compliance": 90,
  "content": "当院は、法令違反行為等を早期に発見し是正するため、内部通報制度を整備します。通報者の匿名性を保護し、不利益取扱いを禁止します。",
  "contentUrl": null,
  "owner": "コンプライアンス委員会委員長",
  "ownerId": null,
  "approvedBy": "病院長",
  "approverId": null,
  "approvedDate": "2024-07-01T00:00:00.000Z",
  "nextReviewDate": "2026-07-01T00:00:00.000Z",
  "relatedPolicies": ["policy-003"],
  "applicableScope": "全職員"
}
```

---

## 🔍 マスター2: コンプライアンスチェック（ComplianceCheck）

### チェック1: 医療安全管理

```json
{
  "id": "compliance-001",
  "area": "医療安全管理",
  "checkType": "定期",
  "status": "compliant",
  "score": 96,
  "issues": 0,
  "lastCheck": "2025-10-02T00:00:00.000Z",
  "checker": "医療安全管理者",
  "checkerId": null,
  "issueDetails": [],
  "correctiveActions": null,
  "responsible": "医療安全管理者",
  "responsibleId": null,
  "nextCheckDate": "2025-11-02T00:00:00.000Z"
}
```

---

### チェック2: 個人情報保護

```json
{
  "id": "compliance-002",
  "area": "個人情報保護",
  "checkType": "定期",
  "status": "warning",
  "score": 88,
  "issues": 2,
  "lastCheck": "2025-09-25T00:00:00.000Z",
  "checker": "個人情報保護管理者",
  "checkerId": null,
  "issueDetails": [
    {
      "issueId": "C002-I001",
      "description": "一部部署でアクセス権管理が不適切",
      "severity": "medium"
    },
    {
      "issueId": "C002-I002",
      "description": "職員研修受講率が目標未達（目標95%、実績88%）",
      "severity": "low"
    }
  ],
  "correctiveActions": "アクセス権の再設定を実施。未受講者への個別受講勧奨を実施。",
  "responsible": "個人情報保護管理者",
  "responsibleId": null,
  "nextCheckDate": "2025-10-25T00:00:00.000Z"
}
```

---

### チェック3: 労働基準

```json
{
  "id": "compliance-003",
  "area": "労働基準",
  "checkType": "定期",
  "status": "compliant",
  "score": 94,
  "issues": 0,
  "lastCheck": "2025-10-02T00:00:00.000Z",
  "checker": "人事部長",
  "checkerId": null,
  "issueDetails": [],
  "correctiveActions": null,
  "responsible": "人事部長",
  "responsibleId": null,
  "nextCheckDate": "2025-11-02T00:00:00.000Z"
}
```

---

### チェック4: 感染対策

```json
{
  "id": "compliance-004",
  "area": "感染対策",
  "checkType": "定期",
  "status": "compliant",
  "score": 98,
  "issues": 0,
  "lastCheck": "2025-10-05T00:00:00.000Z",
  "checker": "感染管理認定看護師",
  "checkerId": null,
  "issueDetails": [],
  "correctiveActions": null,
  "responsible": "感染管理認定看護師",
  "responsibleId": null,
  "nextCheckDate": "2025-11-05T00:00:00.000Z"
}
```

---

### チェック5: 情報セキュリティ

```json
{
  "id": "compliance-005",
  "area": "情報セキュリティ",
  "checkType": "臨時",
  "status": "warning",
  "score": 85,
  "issues": 1,
  "lastCheck": "2025-09-28T00:00:00.000Z",
  "checker": "情報システム部長",
  "checkerId": null,
  "issueDetails": [
    {
      "issueId": "C005-I001",
      "description": "一部端末でOSアップデート未適用",
      "severity": "medium"
    }
  ],
  "correctiveActions": "該当端末のアップデート実施中。10月末までに完了予定。",
  "responsible": "情報システム部長",
  "responsibleId": null,
  "nextCheckDate": "2025-10-31T00:00:00.000Z"
}
```

---

## ⚠️ マスター3: リスク管理（FacilityRisk）

### リスク1: 夜勤シフト人員不足による医療安全リスク

```json
{
  "id": "risk-001",
  "title": "夜勤シフト人員不足による医療安全リスク",
  "description": "看護師の夜勤シフトにおける人員不足が慢性化しており、医療安全に影響を及ぼす可能性がある",
  "category": "医療安全",
  "severity": "high",
  "probability": "medium",
  "impactDescription": "医療事故の発生、職員の過重労働による離職率上昇",
  "status": "mitigating",
  "owner": "看護部",
  "ownerId": null,
  "responsible": "看護部長",
  "responsibleId": null,
  "identifiedDate": "2025-08-15T00:00:00.000Z",
  "mitigationPlan": "1. 看護師の追加採用（5名）\n2. 夜勤専従看護師の募集\n3. 他部署からの応援体制構築",
  "mitigationStatus": "採用活動中。現在2名の内定者を確保。",
  "resolvedDate": null,
  "relatedIncidents": [],
  "reviewDate": "2025-11-15T00:00:00.000Z"
}
```

---

### リスク2: 情報セキュリティインシデント

```json
{
  "id": "risk-002",
  "title": "情報セキュリティインシデント",
  "description": "医療情報システムへの不正アクセスやランサムウェア攻撃のリスク",
  "category": "情報セキュリティ",
  "severity": "medium",
  "probability": "low",
  "impactDescription": "患者情報の漏洩、システム停止による診療業務への影響",
  "status": "identified",
  "owner": "情報システム部",
  "ownerId": null,
  "responsible": "情報システム部長",
  "responsibleId": null,
  "identifiedDate": "2025-09-01T00:00:00.000Z",
  "mitigationPlan": "1. ファイアウォール強化\n2. 職員向けセキュリティ研修の実施\n3. 定期的な脆弱性診断",
  "mitigationStatus": "計画策定中。予算要求を実施。",
  "resolvedDate": null,
  "relatedIncidents": [],
  "reviewDate": "2025-12-01T00:00:00.000Z"
}
```

---

### リスク3: 職員の離職率上昇

```json
{
  "id": "risk-003",
  "title": "職員の離職率上昇",
  "description": "若手・中堅職員の離職率が上昇傾向にあり、組織の持続可能性に影響",
  "category": "人事",
  "severity": "medium",
  "probability": "medium",
  "impactDescription": "医療サービスの質低下、採用コストの増加、職員の士気低下",
  "status": "mitigating",
  "owner": "人事部",
  "ownerId": null,
  "responsible": "人事部長",
  "responsibleId": null,
  "identifiedDate": "2025-07-10T00:00:00.000Z",
  "mitigationPlan": "1. 職員満足度調査の実施\n2. キャリア開発支援制度の導入\n3. ワークライフバランス改善施策の実施",
  "mitigationStatus": "職員満足度調査実施済み。結果分析中。改善施策を検討中。",
  "resolvedDate": null,
  "relatedIncidents": [],
  "reviewDate": "2025-10-31T00:00:00.000Z"
}
```

---

### リスク4: 医療機器の老朽化

```json
{
  "id": "risk-004",
  "title": "医療機器の老朽化",
  "description": "主要医療機器の経年劣化により、故障リスクが増加",
  "category": "医療安全",
  "severity": "medium",
  "probability": "medium",
  "impactDescription": "診療業務の停止、代替機器の緊急調達コスト",
  "status": "identified",
  "owner": "医療機器管理部",
  "ownerId": null,
  "responsible": "臨床工学技士長",
  "responsibleId": null,
  "identifiedDate": "2025-06-20T00:00:00.000Z",
  "mitigationPlan": "1. 医療機器更新計画の策定\n2. 予防保守の強化\n3. 優先度に基づく段階的更新",
  "mitigationStatus": "更新計画策定済み。予算要求を準備中。",
  "resolvedDate": null,
  "relatedIncidents": [],
  "reviewDate": "2026-01-20T00:00:00.000Z"
}
```

---

### リスク5: 災害時BCP未整備

```json
{
  "id": "risk-005",
  "title": "災害時BCP未整備",
  "description": "大規模災害発生時の事業継続計画が不十分",
  "category": "危機管理",
  "severity": "high",
  "probability": "low",
  "impactDescription": "災害時の診療継続困難、地域医療への影響",
  "status": "mitigating",
  "owner": "企画部",
  "ownerId": null,
  "responsible": "企画部長",
  "responsibleId": null,
  "identifiedDate": "2025-05-01T00:00:00.000Z",
  "mitigationPlan": "1. BCP策定委員会の設置\n2. 災害対応マニュアルの整備\n3. 定期的な訓練の実施",
  "mitigationStatus": "BCP策定委員会を設置済み。マニュアル作成中。",
  "resolvedDate": null,
  "relatedIncidents": [],
  "reviewDate": "2025-11-01T00:00:00.000Z"
}
```

---

## 📊 マスター4: カテゴリマスタ

### 方針カテゴリ

```json
[
  { "id": "cat-policy-01", "name": "コンプライアンス", "description": "法令遵守に関する方針" },
  { "id": "cat-policy-02", "name": "安全管理", "description": "職員の安全確保に関する方針" },
  { "id": "cat-policy-03", "name": "人事", "description": "人事管理に関する方針" },
  { "id": "cat-policy-04", "name": "医療安全", "description": "医療の質と安全に関する方針" },
  { "id": "cat-policy-05", "name": "情報セキュリティ", "description": "情報システムのセキュリティに関する方針" },
  { "id": "cat-policy-99", "name": "その他", "description": "その他の方針" }
]
```

---

### リスクカテゴリ

```json
[
  { "id": "cat-risk-01", "name": "医療安全", "description": "医療事故・安全管理に関するリスク" },
  { "id": "cat-risk-02", "name": "情報セキュリティ", "description": "情報漏洩・システム障害に関するリスク" },
  { "id": "cat-risk-03", "name": "人事", "description": "人材確保・労務管理に関するリスク" },
  { "id": "cat-risk-04", "name": "財務", "description": "経営・財務に関するリスク" },
  { "id": "cat-risk-05", "name": "危機管理", "description": "災害・緊急事態に関するリスク" },
  { "id": "cat-risk-99", "name": "その他", "description": "その他のリスク" }
]
```

---

## 🔄 データ投入スクリプト

### Prisma Seed用スクリプト例

```typescript
// prisma/seeds/facilityGovernance.seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFacilityGovernance() {
  console.log('🏥 Seeding Facility Governance data...');

  // 1. 方針・規則データ投入
  const policies = [
    {
      id: 'policy-001',
      title: '個人情報保護方針',
      description: '患者および職員の個人情報を適切に管理し、プライバシーを保護するための方針',
      category: 'コンプライアンス',
      version: 'v2.1',
      status: 'active',
      compliance: 98,
      approvedDate: new Date('2024-01-15'),
      nextReviewDate: new Date('2025-01-15'),
      applicableScope: '全職員',
    },
    // ... 他の方針データ
  ];

  for (const policy of policies) {
    await prisma.facilityPolicy.upsert({
      where: { id: policy.id },
      update: policy,
      create: policy,
    });
  }

  console.log(`✅ Created ${policies.length} policies`);

  // 2. コンプライアンスチェックデータ投入
  const complianceChecks = [
    {
      id: 'compliance-001',
      area: '医療安全管理',
      checkType: '定期',
      status: 'compliant',
      score: 96,
      issues: 0,
      lastCheck: new Date('2025-10-02'),
      nextCheckDate: new Date('2025-11-02'),
    },
    // ... 他のチェックデータ
  ];

  for (const check of complianceChecks) {
    await prisma.complianceCheck.upsert({
      where: { id: check.id },
      update: check,
      create: check,
    });
  }

  console.log(`✅ Created ${complianceChecks.length} compliance checks`);

  // 3. リスクデータ投入
  const risks = [
    {
      id: 'risk-001',
      title: '夜勤シフト人員不足による医療安全リスク',
      description: '看護師の夜勤シフトにおける人員不足が慢性化',
      category: '医療安全',
      severity: 'high',
      probability: 'medium',
      status: 'mitigating',
      owner: '看護部',
      identifiedDate: new Date('2025-08-15'),
      reviewDate: new Date('2025-11-15'),
    },
    // ... 他のリスクデータ
  ];

  for (const risk of risks) {
    await prisma.facilityRisk.upsert({
      where: { id: risk.id },
      update: risk,
      create: risk,
    });
  }

  console.log(`✅ Created ${risks.length} risks`);
  console.log('🎉 Facility Governance seeding completed!');
}
```

---

## 📚 関連文書

- [facility-governance_DB要件分析_20251009.md](mcp-shared/docs/facility-governance_DB要件分析_20251009.md)
- [FacilityGovernancePage.tsx](src/pages/FacilityGovernancePage.tsx)
- [CommitteeManagement暫定マスターリスト_20251009.md](mcp-shared/docs/CommitteeManagement暫定マスターリスト_20251009.md)

---

**文書終了**

最終更新: 2025年10月9日
バージョン: 1.0
承認: 未承認（レビュー待ち）
