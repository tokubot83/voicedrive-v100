# VoiceDrive localStorage問題修正報告

**報告日**: 2025年10月1日
**報告者**: VoiceDriveチーム
**宛先**: 医療システムチーム

---

## 🚨 問題の確認

医療システムチームから報告いただいた統合テストのエラーを確認しました。

**エラー内容**: `ReferenceError: localStorage is not defined`

ご指摘の通り、Node.js（サーバーサイド）環境では`localStorage`が使用できません。この問題を修正いたします。

---

## 🔧 修正内容

### 修正方針

医療チームからご提案いただいた **Option A: ファイルシステムへの保存** を採用します。

### 実装の変更点

#### 変更前（問題のあったコード）
```typescript
// ❌ Node.js環境ではlocalStorageは使用できない
async function saveInterviewSummary(data: InterviewSummary): Promise<void> {
  const existingSummaries = localStorage.getItem('interviewSummaries');
  // ...
}
```

#### 変更後（修正したコード）
```typescript
// ✅ ファイルシステムを使用
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'interview-summaries');
const SUMMARIES_FILE = path.join(DATA_DIR, 'summaries.json');

async function saveInterviewSummary(data: InterviewSummary): Promise<void> {
  // データディレクトリが存在しない場合は作成
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('[VoiceDrive] データディレクトリ作成:', DATA_DIR);
  }

  // 既存データを読み込み
  let summaries: InterviewSummary[] = [];
  try {
    const fileContent = await fs.readFile(SUMMARIES_FILE, 'utf-8');
    summaries = JSON.parse(fileContent);
  } catch (error) {
    // ファイルが存在しない場合は空配列で開始
    summaries = [];
  }

  // 既存のサマリIDがあれば上書き、なければ追加
  const index = summaries.findIndex(s => s.summaryId === data.summaryId);
  if (index >= 0) {
    summaries[index] = data;
    console.log(`[VoiceDrive] 面談サマリ更新: ${data.summaryId}`);
  } else {
    summaries.push(data);
    console.log(`[VoiceDrive] 面談サマリ新規保存: ${data.summaryId}`);
  }

  // ファイルに保存
  await fs.writeFile(
    SUMMARIES_FILE,
    JSON.stringify(summaries, null, 2),
    'utf-8'
  );

  console.log(`[VoiceDrive] 面談サマリ保存成功 (合計: ${summaries.length}件)`);
  console.log(`[VoiceDrive] 保存先: ${SUMMARIES_FILE}`);
}
```

### 保存先ディレクトリ

```
voicedrive-v100/
└── data/
    └── interview-summaries/
        └── summaries.json    ← 面談サマリデータが保存されます
```

### 通知機能の一時無効化

現在、`NotificationService`との連携部分で問題が発生しているため、共通DB構築までの間、通知機能は一時的にコメントアウトしています。

```typescript
// 通知送信（共通DB構築後に有効化）
// await NotificationService.getInstance().sendNotification({ ... });
```

---

## 📋 修正ファイル

### 更新したファイル
- `src/api/medicalSystemReceiver.ts` - `saveInterviewSummary()`関数を修正

### 変更内容詳細

1. **インポートの追加**
   ```typescript
   import fs from 'fs/promises';
   import path from 'path';
   ```

2. **データ保存パスの定義**
   ```typescript
   const DATA_DIR = path.join(process.cwd(), 'data', 'interview-summaries');
   const SUMMARIES_FILE = path.join(DATA_DIR, 'summaries.json');
   ```

3. **保存ロジックの書き換え**
   - localStorage → ファイルシステム（fs.readFile/writeFile）
   - ディレクトリ自動作成機能追加
   - 詳細なログ出力追加

---

## 🔄 現在の状況

### 実施済み
- ✅ コード修正完了
- ✅ ファイルシステム保存方式への変更完了
- ✅ エラーハンドリング強化（詳細ログ追加）

### 確認中
- 🔄 APIサーバー再起動後の動作確認中
- 🔄 統合テスト再実施準備中

### 問題点
現在、以下の問題が発生しており、原因を調査中です：

1. **エラーログが出力されない**
   - `console.error()`が期待通りに動作していない可能性
   - サーバーログの確認が困難

2. **修正後も500エラーが継続**
   - コードの変更が反映されていない可能性
   - または別の問題が存在する可能性

---

## 💡 医療チームへのお願い

### より詳細なエラー情報の共有

現在、VoiceDrive側でエラーの詳細を確認するのに苦労しています。
医療システムチームの統合テストスクリプトでは、以下のようなエラーログが取得できていましたか？

```
Error saving interview summary: ReferenceError: localStorage is not defined
    at saveInterviewSummary (C:\projects\voicedrive-v100\src\api\medicalSystemReceiver.ts:425:31)
    at handleSummaryReceived (C:\projects\voicedrive-v100\src\api\medicalSystemReceiver.ts:340:11)
```

もし可能であれば：
1. テストスクリプトのログ取得方法を教えていただけますか？
2. 修正後の再テストを実施いただけますか？

---

## 🔍 代替アプローチの提案

### 提案1: シンプルな動作確認

現在の統合テストは複雑な環境で実施されているため、より単純な方法で動作確認してみませんか？

#### 方法A: curlでの直接テスト
```bash
# 医療システム側から実行
curl -v -X POST http://localhost:3003/api/summaries/receive \
  -H "Content-Type: application/json" \
  -d @test-summary-001.json
```

#### 方法B: VoiceDrive側の単体テスト
VoiceDrive側で単体テストスクリプトを作成し、動作確認を先に完了させる方法もあります。

### 提案2: 段階的な統合テスト

1. **Step 1**: VoiceDrive側で単体テスト実施・成功確認
2. **Step 2**: 医療システム側からの送信テスト（1件のみ）
3. **Step 3**: 正常動作確認後、複数件テスト

---

## 📅 今後のスケジュール

### 即座対応（本日中）
- 🔄 エラー原因の特定と完全修正
- 🔄 VoiceDrive側での単体テスト成功

### 明日（10月2日）
- 📅 医療チームとの統合テスト再実施
- 📅 3件（定期・サポート・特別）のテストケース全成功

---

## 🙏 お詫びと感謝

### お詫び

報告書に「localStorage連携」と記載していたにも関わらず、サーバーサイドでの実装に誤りがありました。
ご指摘いただき、ありがとうございます。

### 誤りの原因

- サービス層（`InterviewSummaryService.ts`）はクライアントサイド用の設計でした
- サーバーサイドAPI（`medicalSystemReceiver.ts`）で誤ってlocalStorageを使用していました
- 環境の違いを十分に考慮していませんでした

### 今後の対策

- ✅ サーバーサイドとクライアントサイドのコード分離を明確化
- ✅ 統合テスト前の単体テスト実施を徹底
- ✅ 環境ごとの制約を事前確認

---

## ✅ 修正完了後の機能

修正完了後、以下の機能が利用可能になります：

### 面談サマリ受信API
- **エンドポイント**: `POST http://localhost:3003/api/summaries/receive`
- **保存先**: `data/interview-summaries/summaries.json`
- **機能**:
  - 面談サマリデータの受信
  - ファイルシステムへの保存
  - 重複サマリIDの上書き
  - 詳細なログ出力

### 保存データ形式
```json
[
  {
    "summaryId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "interviewType": "regular",
    "interviewId": "f1e2d3c4-b5a6-4950-8160-7a8b9c0d1e2f",
    "staffId": "EMP001",
    "staffName": "山田 太郎",
    "interviewDate": "2025-09-15",
    "createdAt": "2025-09-20T14:30:00Z",
    "createdBy": "人事部 佐藤",
    "summary": "## 面談概要\n\n...",
    "status": "sent",
    "sentAt": "2025-09-20T15:00:00Z"
  }
]
```

---

**医療システムチーム様、問題のご指摘と詳細な調査、誠にありがとうございました。**

**修正作業を完了次第、すぐにご連絡いたします。**

---

*両チームの協力により、確実に統合を成功させましょう！*
