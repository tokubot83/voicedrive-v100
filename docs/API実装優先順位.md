# API実装優先順位

**作成日**: 2025年9月26日
**医療チームとの合意済み**

## 🔴 最優先（Critical）- Week 1前半

### 1. `/api/v1/calculate-level`
**重要度**: ★★★★★
**理由**: 投票システムの核心機能
```typescript
POST /api/v1/calculate-level
{
  "staffId": "string"
}
→ {
  "level": number,
  "breakdown": {
    "baseLevel": number,
    "leaderBonus": number,
    "positionLevel?: number
  }
}
```
**実装期限**: 10/1

### 2. `/webhook/staff-change`
**重要度**: ★★★★★
**理由**: リアルタイム性確保に必須
```typescript
POST /webhook/staff-change
{
  "event": "UPDATE" | "CREATE" | "DELETE",
  "staffId": "string",
  "changes": object
}
```
**実装期限**: 10/2

## 🟡 高優先（High）- Week 1後半

### 3. `/api/v1/staff/:staffId`
**重要度**: ★★★★
**理由**: 基本的なスタッフ情報取得
```typescript
GET /api/v1/staff/:staffId
→ StaffMasterData
```
**実装期限**: 10/3

### 4. `/api/v1/staff/bulk`
**重要度**: ★★★★
**理由**: 初期データロード用
```typescript
POST /api/v1/staff/bulk
{
  "facilityId": "string"
}
→ StaffMasterData[]
```
**実装期限**: 10/4

## 🟢 標準優先（Normal）- Week 2

### 5. `/api/v1/organization/structure`
**重要度**: ★★★
**理由**: 組織階層情報
**実装期限**: 10/7

### 6. `/api/v1/staff/search`
**重要度**: ★★★
**理由**: スタッフ検索機能
**実装期限**: 10/8

## 🔵 低優先（Low）- Phase 3以降

### 7. `/api/v1/staff/export`
**重要度**: ★★
**理由**: レポート機能用

### 8. `/api/v1/audit/logs`
**重要度**: ★★
**理由**: 監査ログ

## パフォーマンス要件（確定版）

医療チームとの合意事項：

| エンドポイント | 応答時間目標 | 備考 |
|---------------|-------------|------|
| `/api/v1/calculate-level` | < 100ms | 最重要・キャッシュ活用 |
| `/webhook/staff-change` | < 50ms | 非同期処理 |
| `/api/v1/staff/:staffId` | < 200ms | 標準要件 |
| `/api/v1/staff/bulk` | < 500ms | ページネーション必須 |

## 同時接続数

- **通常時**: 50接続
- **ピーク時**: 100接続（投票締切前30分）
- **最大想定**: 200接続（緊急議題時）

## キャッシュ戦略

| データ種別 | TTL | 更新トリガー |
|-----------|-----|-------------|
| 権限レベル | 10分 | webhook通知 |
| リーダーフラグ | 24時間 | 年次更新 |
| 組織構造 | 1時間 | 手動更新 |
| スタッフ基本情報 | 30分 | webhook通知 |

## 実装チェックリスト

### Week 1（10/1-10/4）
- [ ] 最優先API 2本の実装
- [ ] 高優先API 2本の実装
- [ ] 単体テスト作成
- [ ] 負荷テスト準備

### Week 2（10/7-10/11）
- [ ] 標準優先APIの実装
- [ ] 統合テスト実施
- [ ] パフォーマンステスト
- [ ] 本番環境準備

---
**次回確認**: 2025年9月26日 技術仕様レビュー会議