# ProposalGenerator 暫定マスターリスト

**文書番号**: MASTER-PG-2025-1022-001
**作成日**: 2025年10月22日
**対象ページ**: ProposalGeneratorPage (`/proposal-generator`)
**参照**: proposal-generator_DB要件分析_20251022.md
**ステータス**: ✅ 医療システム確認待ち

---

## 📋 エグゼクティブサマリー

### ProposalGeneratorの役割

**ProposalGeneratorPage**は、100点以上に達した投稿から、委員会提出用の正式な議題提案書を自動生成する機能です。

**主要な依存関係**:
1. **VoiceDrive内部データ**: 投稿、投票、コメント（既存テーブル利用）
2. **医療システムデータ**: 委員会マスタ（新規API必要）
3. **文書管理**: ProposalDocument, ProposalAuditLog（既存テーブル利用）

**結論**:
- ✅ **医療システム側の新規API開発は1本のみ** (`GET /api/v2/committees`)
- ✅ **VoiceDrive側は既存テーブルで大部分実装可能**
- ✅ **新規テーブルは1つ** (`Committee`キャッシュテーブル)

---

## 🎯 医療システムからの取得が必要なデータ

### API-1: 委員会マスタ取得API ⚠️ **新規開発必要**

**エンドポイント**:
```
GET /api/v2/committees?facility={facilityId}
```

**リクエスト例**:
```http
GET /api/v2/committees?facility=obara-hospital
Authorization: Bearer {jwt_token}
X-API-Key: {api_key}
```

**レスポンス例**:
```json
{
  "data": {
    "committees": [
      {
        "committeeId": "COMM-OH-001",
        "name": "医療安全管理委員会",
        "schedule": "第2火曜日",
        "facility": "obara-hospital",
        "facilityName": "小原病院",
        "targetCategories": ["医療安全", "患者安全"],
        "isActive": true
      }
    ]
  }
}
```

**必須フィールド**: committeeId, name, schedule, facility, targetCategories, isActive

---

## 🗄️ VoiceDrive側の新規テーブル

### Table-1: Committee（委員会キャッシュテーブル）

**Prismaスキーマ**:
```prisma
model Committee {
  id                String   @id @default(cuid())
  committeeId       String   @unique @map("committee_id")
  name              String
  schedule          String
  facility          String
  targetCategories  Json     @map("target_categories")
  isActive          Boolean  @default(true) @map("is_active")
  syncedAt          DateTime @default(now()) @map("synced_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@index([facility])
  @@index([isActive])
  @@map("committees")
}
```

---

## 📝 実装チェックリスト

### VoiceDrive側
- [ ] Committeeテーブル追加
- [ ] 委員会同期バッチ実装
- [ ] ProposalDocument保存API実装
- [ ] ダミーデータ削除

### 医療システム側
- [ ] GET /api/v2/committees API実装
- [ ] Committeeテーブル確認

---

## 📞 医療システムチームへの確認事項

1. 医療システムに委員会マスタは存在しますか？
2. GET /api/v2/committees APIの実装は可能ですか？
3. 現在、何委員会が登録されていますか？

---

**文書終了**

最終更新: 2025年10月22日
作成者: VoiceDriveチーム
