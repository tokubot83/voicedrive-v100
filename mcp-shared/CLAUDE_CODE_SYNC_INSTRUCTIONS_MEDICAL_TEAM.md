# 医療チーム向け Claude Code MCP同期確認指示書

**作成日**: 2025年8月31日  
**送信者**: VoiceDriveチーム  
**宛先**: 医療職員管理システムチーム  
**優先度**: 🔴 URGENT - 即座実行要請

## 🚨 緊急：MCP同期確認とV3評価通知システム実装完了確認

### 状況説明
VoiceDriveチームでV3評価通知システムの実装が完了しましたが、MCPサーバーの同期に問題があり、医療チーム側に最新情報が届いていない可能性があります。

## 📋 医療チーム側 Claude Code実行手順

### Step 1: MCP共有フォルダの確認
Claude Codeで以下のコマンドを実行してください：

```bash
# 1. 最新のMCP共有ファイルをチェック
ls -la mcp-shared/docs/ | grep "20250831"

# 2. 同期状況を確認
cat mcp-shared/sync-status.json | grep lastSync

# 3. 緊急アラートファイルを確認
cat mcp-shared/URGENT_MEDICAL_TEAM_ALERT.txt
cat mcp-shared/urgent-alert-medical-team.json
```

### Step 2: 実装完了報告書の確認
以下のファイルが存在する場合、Claude Codeで内容を確認してください：

```bash
# VoiceDriveの実装完了報告書を読む
cat "mcp-shared/docs/V3_Evaluation_Notification_Implementation_Complete_20250831.md"
```

### Step 3: MCP同期の手動実行
ファイルが見つからない場合、以下で同期を強制実行：

```bash
# MCPサーバーの状態確認
curl http://localhost:8080/api/status

# 同期スクリプト実行
node mcp-integration-server/scripts/check-mcp-sync.js

# 必要に応じて同期を再実行
npm run mcp:sync
```

## 📄 確認すべき重要内容

Claude Codeで実装完了報告書を確認したら、以下の点をチェックしてください：

### 1. VoiceDrive側実装完了項目
- ✅ **医療システムAPI連携機能** - Bearer Token認証対応
- ✅ **V3評価通知UI** - 100点満点・7段階グレード対応
- ✅ **異議申立フォーム連携** - ワンクリック遷移機能
- ✅ **統合テスト完了** - 8項目すべて成功

### 2. 医療システムへの要請事項
- [ ] **AppealReceptionV3の実装状況確認**
- [ ] **API受信エンドポイント準備状況**
- [ ] **連携テスト実施可能時期**

### 3. 提案されたAPI仕様
```json
POST /api/v3/appeals/submit
Authorization: Bearer {VOICEDRIVE_API_KEY}

{
  "employeeId": "EMP001",
  "evaluationPeriod": "2025_winter", 
  "appealType": "score_dispute",
  "scores": {
    "currentTotal": 85.5,
    "disputedItems": [...]
  },
  "conversationId": "v3_conv_12345"
}
```

## 🎯 Claude Codeでの回答作成指示

Claude Codeで確認後、以下の形式で回答ファイルを作成してください：

```bash
# 医療チーム回答ファイルを作成
cat > mcp-shared/docs/Medical_Team_Response_V3_Notification_$(date +%Y%m%d).md << 'EOF'
# 医療チーム V3評価通知システム確認回答

## 確認結果
- [ ] VoiceDrive実装完了報告書を確認済み
- [ ] API仕様について問題なし／要調整
- [ ] 医療システム側準備状況: [進捗を記載]

## AppealReceptionV3実装状況
- 実装進捗: [XX%]
- 完了予定: [日付]
- 必要な調整: [あれば記載]

## 連携テスト可能時期
- 提案日程: [日付]
- 必要な準備: [あれば記載]

## その他質問・要望
[あれば記載]

---
医療職員管理システムチーム
$(date +%Y年%m月%d日)
EOF
```

## ⚠️ 重要な注意事項

### 1. ファイルが見つからない場合
```bash
# MCPサーバーを再起動
cd mcp-integration-server && npm run dev

# 5分待ってから再度確認
sleep 300 && ls -la mcp-shared/docs/ | grep "20250831"
```

### 2. 同期エラーが続く場合
直接Slackで連絡してください：
- チャンネル: `#v3-evaluation-system`
- メンション: `@voicedrive-dev-team`
- メッセージ: "MCP同期エラー - V3評価通知実装確認要請"

## 🚀 期待される医療チーム側のアクション

### 即座実行（今日中）
1. **Claude CodeでMCP同期確認**
2. **VoiceDrive実装完了報告書の確認**
3. **医療システム側準備状況の回答**

### 短期（3日以内）
1. **AppealReceptionV3実装完了**
2. **連携テスト実施**
3. **本番移行日程確定**

## 📞 緊急時連絡先

同期問題や技術的な問題が発生した場合：

```bash
# VoiceDriveチームに緊急連絡
echo "$(date): 医療チーム - MCP同期問題発生" >> mcp-shared/emergency-contact-log.txt
```

または直接：
- **緊急Slack**: `#voicedrive-emergency`
- **技術サポート**: voicedrive-tech-support@company.local

---

**VoiceDriveチーム**  
2025年8月31日

**追記**: この指示書もMCP同期の対象です。医療チーム側Claude Codeで確認してください。