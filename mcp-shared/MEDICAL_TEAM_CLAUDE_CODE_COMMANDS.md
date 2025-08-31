# 医療チーム Claude Code 実行コマンド集

## 🔴 緊急実行コマンド（コピペ用）

### 1. MCP同期状況の確認
```bash
ls -la mcp-shared/docs/ | grep "20250831"
cat mcp-shared/sync-status.json | jq .lastSync
cat mcp-shared/URGENT_MEDICAL_TEAM_ALERT.txt
```

### 2. VoiceDrive実装完了報告書の確認
```bash
cat "mcp-shared/docs/V3_Evaluation_Notification_Implementation_Complete_20250831.md"
```

### 3. 緊急アラート情報の確認
```bash
cat mcp-shared/urgent-alert-medical-team.json | jq .
```

### 4. MCP同期の強制実行
```bash
cd mcp-integration-server
npm run dev &
sleep 10
curl http://localhost:8080/api/status
node scripts/check-mcp-sync.js
```

## 📝 医療チーム回答作成コマンド

### 回答ファイル作成（コピペして実行）
```bash
cat > "mcp-shared/docs/Medical_Team_Response_V3_Notification_$(date +%Y%m%d_%H%M).md" << 'EOF'
# 医療チーム V3評価通知システム確認回答

**確認日時**: $(date +"%Y年%m月%d日 %H:%M")
**確認者**: 医療職員管理システムチーム

## ✅ 確認完了項目
- [x] VoiceDrive実装完了報告書を確認済み
- [x] API仕様について確認済み
- [ ] 医療システム側準備状況: 

## 📋 AppealReceptionV3実装状況
- **実装進捗**: [  ]%
- **完了予定**: [    年  月  日]
- **現在の作業**: [記載してください]
- **必要な調整**: [あれば記載]

## 🤝 連携テスト実施について
- **提案日程**: [    年  月  日 〜    年  月  日]
- **準備期間**: [  日間]
- **必要なリソース**: [記載してください]

## ❓ 質問・確認事項
1. [質問があれば記載]
2. 
3. 

## 🚀 次のアクション
- [ ] 医療システム側API実装
- [ ] テスト環境準備  
- [ ] 連携テスト日程調整

---
**医療職員管理システムチーム**
$(date +"%Y年%m月%d日")
EOF
```

## 🎯 実行後の確認コマンド

### 回答ファイルが作成されたか確認
```bash
ls -la mcp-shared/docs/ | grep "Medical_Team_Response"
```

### 緊急連絡が必要な場合
```bash
echo "$(date): 医療チーム - MCP同期問題により連絡困難" >> mcp-shared/emergency-contact-log.txt
```

## 📞 技術サポートが必要な場合

Claude Codeで以下を実行してVoiceDriveチームに緊急連絡：

```bash
cat > mcp-shared/emergency-medical-team-support.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "team": "medical-system",
  "issue": "MCP sync problem - cannot access V3 implementation report",
  "urgency": "HIGH",
  "requestedAction": "immediate technical support",
  "contact": "medical-team-claude-code",
  "details": "Unable to sync V3 evaluation notification implementation files"
}
EOF
```

---

**使い方**: 上記のコマンドをClaude Codeにコピペして実行してください。