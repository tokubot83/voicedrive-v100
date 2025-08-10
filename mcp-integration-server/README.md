# MCP Integration Server

医療職員管理システムとVoiceDriveを統合するMCPサーバー

## 🚀 機能

- **統合プロキシ**: 両システムのAPIを単一エンドポイントで管理
- **型定義同期**: TypeScript型定義の自動同期
- **統合ダッシュボード**: リアルタイムモニタリング
- **ログ集約**: 両システムのログを統合表示
- **ヘルスチェック**: 各サービスの状態監視

## 📦 インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

## 🔧 設定

`.env`ファイルで設定をカスタマイズ：

```env
MCP_PORT=8080
MEDICAL_SYSTEM_URL=http://localhost:3000
VOICEDRIVE_URL=http://localhost:5173
```

## 📊 エンドポイント

| エンドポイント | 説明 |
|--------------|------|
| `/dashboard` | 統合ダッシュボード |
| `/api/status` | システム状態 |
| `/api/medical/*` | 医療システムへのプロキシ |
| `/api/voicedrive/*` | VoiceDriveへのプロキシ |
| `/health` | ヘルスチェック |

## 🔄 型定義同期

```bash
# 手動同期
node scripts/sync-types.js

# 自動監視モード
node scripts/sync-types.js --watch
```

## 📈 ダッシュボード

ブラウザで以下にアクセス：
```
http://localhost:8080/dashboard
```

機能：
- リアルタイムシステム状態
- パフォーマンスメトリクス
- 最新ログ表示
- クイックアクセスリンク

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────────┐
│            MCP Integration Server           │
│         (http://localhost:8080)             │
├─────────────────────────────────────────────┤
│  ┌─────────────┐        ┌─────────────┐   │
│  │   Medical   │        │ VoiceDrive  │   │
│  │   Adapter   │        │   Adapter   │   │
│  └──────┬──────┘        └──────┬──────┘   │
│         │                       │           │
│  ┌──────┴───────────────────────┴──────┐   │
│  │        Common Services              │   │
│  │  - API Gateway                      │   │
│  │  - Type Sync                        │   │
│  │  - Logging                          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📝 スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | TypeScriptのビルド |
| `npm start` | 本番サーバー起動 |
| `npm run sync:types` | 型定義の同期 |

## 🤝 貢献

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing`)
5. プルリクエストを作成

## 📄 ライセンス

MIT

## 👥 チーム

- 医療職員管理システムチーム
- VoiceDriveチーム

---

**作成日**: 2025年8月10日  
**バージョン**: 1.0.0