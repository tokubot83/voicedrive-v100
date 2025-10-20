# Phase 2 職員顔写真データ連携に関する確認依頼

**発信日**: 2025年10月21日
**発信元**: VoiceDriveチーム
**宛先**: 医療職員カルテシステム開発チーム
**件名**: Phase 2実装における職員顔写真データ連携の仕様確認

---

## 📋 確認の背景

Phase 2（認証システム統合、2025年11月実施予定）において、職員の自動VoiceDriveアカウント作成機能を実装します。

その際、**職員の顔写真データも自動設定する機能**を検討しております。
これにより、以下のメリットが期待できます：

### 期待されるメリット

1. **職員の手間ゼロ**: 顔写真を別途登録する必要なし
2. **データの一元管理**: 医療職員カルテシステムがマスター
3. **自動同期**: 入職時・更新時に自動反映
4. **VoiceDrive全UIで一貫表示**: プロフィール、投稿一覧、コメント等

### 想定される運用フロー

```
1. 入職時: 人事部が顔写真を撮影
   ↓
2. 医療職員カルテシステム: Employee登録 + 顔写真保存
   ↓
3. 共通DB（Lightsail MySQL）: unified_staff_master に保存
   ↓
4. Webhook: "employee.created" イベント送信（顔写真データ含む）
   ↓
5. VoiceDrive: User作成 + 顔写真自動設定
   ↓
6. VoiceDrive全UI: 顔写真を自動表示
```

---

## 🔍 貴チームへの確認事項

### 確認-1: 顔写真データの管理状況 🔴 **CRITICAL**

**質問1**: 医療職員カルテシステムのデータベースに、職員の顔写真データは保存されていますか？

- [ ] **Option A: YES** - すでに保存されている
  - テーブル名: `___________`
  - カラム名: `___________`
  - データ型: `BLOB` / `VARCHAR(URL)` / その他（`_______`）
  - 画像形式: `JPEG` / `PNG` / `WebP` / その他（`_______`）
  - 平均ファイルサイズ: 約 `_______` KB

- [ ] **Option B: NO** - 現在は保存していない
  - 今後保存する予定はありますか？
    - [ ] YES（予定時期: `_______`）
    - [ ] NO

**質問2**: 顔写真は誰が登録しますか？

- [ ] 人事部が入職時に撮影・登録
- [ ] 職員が自分で登録
- [ ] その他（`_______________________`）

**質問3**: 顔写真の更新頻度は？

- [ ] 入職時のみ（更新なし）
- [ ] 年1回の定期撮影
- [ ] 職員からの申請時
- [ ] その他（`_______________________`）

---

### 確認-2: 共通DB（unified_staff_master）への保存方式

**現在の共通DBテーブル**:
```sql
CREATE TABLE unified_staff_master (
    staff_id VARCHAR(20) PRIMARY KEY,
    employee_number VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    facility_id VARCHAR(20),
    department_id VARCHAR(20),
    -- ... その他のフィールド
);
```

**質問1**: 顔写真データを共通DBに追加することは可能ですか？

- [ ] **Option A: YES** - 以下のカラムを追加
  ```sql
  ALTER TABLE unified_staff_master ADD COLUMN (
      profile_photo MEDIUMBLOB,              -- 画像データ（最大16MB）
      photo_mime_type VARCHAR(50),           -- 'image/jpeg', 'image/png'
      photo_file_size INT,                   -- バイト数
      photo_uploaded_at TIMESTAMP            -- アップロード日時
  );
  ```

- [ ] **Option B: 外部URL方式** - 画像はLightsail Object Storageに保存し、URLのみ共通DBに保存
  ```sql
  ALTER TABLE unified_staff_master ADD COLUMN (
      profile_photo_url VARCHAR(500),        -- 画像URL
      photo_uploaded_at TIMESTAMP
  );
  ```

- [ ] **Option C: 別テーブル管理** - 顔写真専用テーブルを作成
  ```sql
  CREATE TABLE employee_photos (
      staff_id VARCHAR(20) PRIMARY KEY,
      photo_data MEDIUMBLOB,
      photo_mime_type VARCHAR(50),
      photo_file_size INT,
      uploaded_at TIMESTAMP,
      FOREIGN KEY (staff_id) REFERENCES unified_staff_master(staff_id)
  );
  ```

**VoiceDriveチームの推奨**: **Option A（BLOBカラム追加）**

**理由**:
- ✅ 実装がシンプル（外部ストレージ不要）
- ✅ バックアップが容易
- ✅ アクセス制御が簡単
- ✅ コスト削減（Object Storage不要）
- ✅ Lightsail 16GB統合インスタンスで余裕（500名 × 200KB = 100MB）

---

### 確認-3: Webhook連携の仕様

**質問1**: Webhook "employee.created" に顔写真データを追加することは可能ですか？

- [ ] **YES** - 以下の形式で送信可能
  ```json
  {
    "eventType": "employee.created",
    "staffId": "EMP-2025-001",
    "fullName": "山田太郎",
    "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 150000,
    "photoUploadedAt": "2025-04-01T09:00:00Z"
  }
  ```

- [ ] **NO** - 技術的制約がある（理由: `_______________________`）

**質問2**: Webhook ペイロードサイズの制限はありますか？

- 現在の制限: `_______` KB
- 顔写真Base64エンコード後: 約270KB（200KB × 1.37）
- 問題ありますか？
  - [ ] 問題なし
  - [ ] 問題あり（理由: `_______________________`）

**質問3**: 新規Webhook "employee.photo.updated" の追加は可能ですか？

顔写真が更新されたときにVoiceDriveへ通知する機能です。

- [ ] **YES** - 実装可能
  ```json
  {
    "eventType": "employee.photo.updated",
    "staffId": "EMP-2025-001",
    "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "photoMimeType": "image/jpeg",
    "photoFileSize": 150000,
    "photoUploadedAt": "2025-10-21T10:00:00Z"
  }
  ```

- [ ] **NO** - 技術的制約がある（理由: `_______________________`）

---

### 確認-4: 画像処理の実装

**質問1**: 医療システム側で画像リサイズ処理は実装可能ですか？

顔写真を以下の仕様にリサイズ・圧縮する処理です：
- サイズ: 400x400ピクセル
- 形式: JPEG
- 品質: 85%
- 最大ファイルサイズ: 200KB

- [ ] **YES** - 実装可能
- [ ] **NO** - VoiceDrive側で実装する必要がある

**質問2**: 使用可能な画像処理ライブラリはありますか？

- [ ] Sharp（Node.js）
- [ ] ImageMagick
- [ ] PIL/Pillow（Python）
- [ ] その他（`_______________________`）
- [ ] 未定

---

### 確認-5: プライバシー・セキュリティ

**質問1**: 顔写真データの取り扱いに関する社内規定はありますか？

- [ ] **YES** - 規定あり
  - 規定名: `_______________________`
  - VoiceDriveチームが確認すべき内容: `_______________________`

- [ ] **NO** - 規定なし（今後策定予定）

**質問2**: 退職時の顔写真削除は自動実装されますか？

- [ ] **YES** - Webhook "employee.retired" 送信時に共通DBから自動削除
- [ ] **NO** - 手動削除が必要
- [ ] **未定** - 運用フローを検討中

**質問3**: GDPR・個人情報保護法への対応方針は？

- 顔写真保持期間: `_______` 日間
- 本人からの削除要求への対応: `_______________________`

---

### 確認-6: 実装スケジュール

**質問1**: Phase 2（11月実施予定）での顔写真連携実装は可能ですか？

- [ ] **YES** - 以下のスケジュールで実装可能
  - Week 1（11/4-11/8）: 共通DBテーブル拡張、画像リサイズ処理実装
  - Week 2（11/11-11/15）: Webhook "employee.created" 修正
  - Week 3（11/18-11/22）: 統合テスト

- [ ] **NO** - 実装が難しい
  - 理由: `_______________________`
  - 代替案: Phase `___` での実装を提案

**質問2**: 実装工数の見積もり

- 貴チーム側の見積もり工数: `_______` 人日
- 必要な追加リソース: `_______________________`

---

## 📊 VoiceDrive側の実装概要

### 実装内容（貴チームが顔写真連携を承認した場合）

| 項目 | 実装内容 | 工数 |
|-----|---------|------|
| **VoiceDrive側** | | |
| User テーブル拡張 | `avatar`, `avatarSource`, `avatarMimeType` 追加 | 0.5日 |
| Webhook受信処理修正 | 顔写真Base64データを保存 | 1日 |
| Avatar コンポーネント修正 | Base64画像を表示 | 0.5日 |
| 統合テスト | 全UI表示確認 | 0.5日 |
| **医療システム側** | | |
| 共通DBテーブル拡張 | `profile_photo` カラム追加 | 0.5日 |
| 画像リサイズ処理 | 400x400, 200KB以下に圧縮 | 1日 |
| Webhook "employee.created" 修正 | 顔写真データを追加 | 1日 |
| **合計** | | **5日** |

### コスト見積もり

| 項目 | 金額 |
|-----|------|
| 開発工数（5日） | ¥250,000 |
| 運用コスト追加 | ¥0/月（Lightsail 16GB内で対応） |
| **合計** | **¥250,000（初期のみ）** |

---

## 🎯 次のステップ

### 1. 確認依頼書への回答（期限: 10月28日）

上記の確認事項にご回答いただけますと幸いです。

### 2. 合意形成ミーティング（提案）

**日時**: 2025年10月30日（水）15:00-16:00（1時間）

**参加者**:
- VoiceDriveチーム: プロジェクトリーダー、技術担当
- 医療職員カルテシステムチーム: プロジェクトリーダー、技術担当、人事部担当者（任意）

**議題**:
1. 確認事項への回答内容の確認
2. 顔写真連携の実装可否の最終判断
3. 実装スケジュールの確定
4. プライバシー・セキュリティ方針の合意

### 3. 実装開始（承認された場合）

**Phase 2実装スケジュール**:
- Week 1（11/4-11/8）: 基本実装
- Week 2（11/11-11/15）: Webhook統合
- Week 3（11/18-11/22）: 統合テスト

---

## 📎 参考資料

### VoiceDrive側作成ドキュメント

1. **マスタープラン**
   - [AWS_Lightsail統合実装マスタープラン_20251010.md](./AWS_Lightsail統合実装マスタープラン_20251010.md)
   - Phase 2: 認証システム統合（11月実施予定）

2. **Phase 6実装完了報告**
   - [phase6-voicedrive-response-to-phase2-20251020.md](./phase6-voicedrive-response-to-phase2-20251020.md)

3. **データ管理責任分界点定義書**
   - [データ管理責任分界点定義書_20251008.md](./データ管理責任分界点定義書_20251008.md)

---

## 🙏 まとめ

医療職員カルテシステム開発チーム様

Phase 2実装において、職員顔写真データの自動連携機能を検討しております。
上記の確認事項にご回答いただけますと幸いです。

ご不明点やご要望がございましたら、いつでもお知らせください。

引き続き、よろしくお願いいたします。

---

**VoiceDriveチーム**
**連絡先**: Slack `#phase2-integration`
**発信日**: 2025年10月21日
