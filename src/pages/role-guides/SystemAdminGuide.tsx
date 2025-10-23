import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileFooter from '../../components/layout/MobileFooter';
import DesktopFooter from '../../components/layout/DesktopFooter';

/**
 * システム管理者向けガイド（Level 99）
 * 対象：システム管理者（全権限保有）
 */
const SystemAdminGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'system-settings' | 'security' | 'backup' | 'monitoring' | 'troubleshooting' | 'faq'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-32">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">⚙️</span>
            <h1 className="text-3xl md:text-4xl font-bold">システム管理者向けガイド</h1>
          </div>
          <p className="text-lg text-indigo-100">Level 99 | 全権限保有・システム運用の責任者</p>
          <div className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg inline-block font-semibold">
            ⚠️ 最高権限レベル：すべての操作が可能です
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2">
          {[
            { id: 'overview' as const, label: '概要', icon: '📋' },
            { id: 'system-settings' as const, label: 'システム設定', icon: '🔧' },
            { id: 'security' as const, label: 'セキュリティ', icon: '🔐' },
            { id: 'backup' as const, label: 'バックアップ', icon: '💾' },
            { id: 'monitoring' as const, label: '監視・ログ', icon: '📊' },
            { id: 'troubleshooting' as const, label: 'トラブル対応', icon: '🚨' },
            { id: 'faq' as const, label: 'FAQ', icon: '❓' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">

          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                システム管理者の役割と責任
              </h2>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  <span className="font-bold text-red-700">Level 99</span>は、VoiceDriveシステムにおける
                  <span className="font-semibold text-red-700">最高権限レベル</span>です。
                  すべてのデータへのアクセス、すべての設定変更、すべてのユーザー操作が可能です。
                  <span className="font-bold text-red-800">強大な権限には重大な責任が伴います。</span>
                </p>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">🎯 主要な6つの責務</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-lg text-blue-800 mb-2">1. システム設定管理</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• システムパラメータの設定</li>
                    <li>• 機能のON/OFF切り替え</li>
                    <li>• 面談タイプのカスタマイズ</li>
                    <li>• メール通知設定</li>
                    <li>• 投稿カテゴリの管理</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-5 rounded-lg border-2 border-red-200">
                  <h4 className="font-bold text-lg text-red-800 mb-2">2. セキュリティ管理</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• アクセス制御の設定</li>
                    <li>• パスワードポリシーの管理</li>
                    <li>• 不正アクセスの監視</li>
                    <li>• 権限レベルの最終承認</li>
                    <li>• セキュリティ監査の実施</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg text-green-800 mb-2">3. バックアップ・復旧</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 定期バックアップの確認</li>
                    <li>• バックアップからの復旧</li>
                    <li>• ディザスタリカバリ計画</li>
                    <li>• データ整合性チェック</li>
                    <li>• 長期保存データの管理</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-lg text-purple-800 mb-2">4. システム監視</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• サーバー稼働状況の監視</li>
                    <li>• エラーログの確認</li>
                    <li>• パフォーマンス分析</li>
                    <li>• ディスク容量の管理</li>
                    <li>• アラート設定と対応</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-lg text-yellow-800 mb-2">5. トラブルシューティング</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• システム障害の復旧</li>
                    <li>• ユーザーサポート</li>
                    <li>• データ修正・削除</li>
                    <li>• 緊急メンテナンス</li>
                    <li>• バグ報告と対応</li>
                  </ul>
                </div>

                <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-lg text-pink-800 mb-2">6. システム改善</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• アップデート適用</li>
                    <li>• 新機能の導入検討</li>
                    <li>• ユーザーフィードバック対応</li>
                    <li>• パフォーマンス最適化</li>
                    <li>• セキュリティパッチ適用</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">⚠️ 最高権限の責任</h4>
                <p className="text-gray-700 mb-3">
                  Level 99は<span className="font-semibold">すべてのデータを閲覧・変更・削除</span>できます。
                  この権限を不適切に使用すると、組織全体に深刻な影響を及ぼします。
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>すべての操作をログに記録</strong>：あなたの操作は監査証跡として保存されます</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>個人情報の取り扱いに最大限の注意</strong>：職員の投稿内容、面談記録、人事情報へのアクセス権限があります</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>変更前に必ず確認</strong>：重要な設定変更やデータ削除は慎重に</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>緊急時以外は通常業務時間内に作業</strong>：夜間・休日の変更は避ける</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* システム設定タブ */}
          {activeTab === 'system-settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                システム設定とカスタマイズ
              </h2>

              <h3 className="text-xl font-bold text-indigo-700 mt-6">🔧 システム設定画面へのアクセス</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>左メニューから「管理」→「システム設定」を選択</strong>
                      <p className="text-gray-600 text-sm">Level 99のみ表示されるメニューです</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>設定カテゴリを選択</strong>
                      <p className="text-gray-600 text-sm">一般設定、セキュリティ、通知、面談設定、投稿設定など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>設定を変更</strong>
                      <p className="text-gray-600 text-sm">各項目の説明を読んで適切に設定</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>「保存」ボタンで確定</strong>
                      <p className="text-gray-600 text-sm">変更は即座に全ユーザーに反映されます</p>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">📝 主要な設定項目</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">1. 一般設定</h4>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">システム名称：</span>
                      <span className="text-right">組織名に合わせてカスタマイズ可能</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">タイムゾーン：</span>
                      <span className="text-right">Asia/Tokyo（日本標準時）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">言語設定：</span>
                      <span className="text-right">日本語（将来的に多言語対応予定）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">メンテナンスモード：</span>
                      <span className="text-right">ON/OFF（緊急時のみON）</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">2. 投稿設定</h4>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">投稿カテゴリ：</span>
                      <span className="text-right">追加・編集・削除が可能</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">文字数制限：</span>
                      <span className="text-right">タイトル50文字、本文2000文字（変更可）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">添付ファイルサイズ：</span>
                      <span className="text-right">最大10MB（変更可）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">投票期限：</span>
                      <span className="text-right">デフォルト7日間（投稿ごとに変更可）</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-3">3. 面談設定</h4>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">面談タイプ：</span>
                      <span className="text-right">mcp-shared/config/interview-types.jsonで管理</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">予約可能期間：</span>
                      <span className="text-right">2週間先まで（変更可）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">キャンセル期限：</span>
                      <span className="text-right">面談の24時間前まで（変更可）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">リマインダー通知：</span>
                      <span className="text-right">面談の1日前と1時間前に送信</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3">4. 通知設定</h4>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">メール送信：</span>
                      <span className="text-right">SMTP設定（サーバー、ポート、認証情報）</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">通知のタイミング：</span>
                      <span className="text-right">即時 / 1時間ごと / 1日ごと</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">通知の種類：</span>
                      <span className="text-right">投稿承認、コメント、投票結果など</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">送信元アドレス：</span>
                      <span className="text-right">noreply@voicedrive.example.com（変更可）</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded mt-6">
                <h4 className="font-bold text-orange-800 mb-2">💡 設定変更のベストプラクティス</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>変更前にバックアップ</strong>：重要な設定変更前は必ずバックアップを取得</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>テスト環境で検証</strong>：可能であれば本番環境前にテスト</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>変更内容を記録</strong>：設定変更履歴をドキュメント化</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>ユーザーへの事前通知</strong>：大きな変更は事前に全体通知</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* セキュリティタブ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                セキュリティ管理とアクセス制御
              </h2>

              <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  セキュリティは<span className="font-semibold text-red-700">VoiceDriveの最優先事項</span>です。
                  職員の個人情報、面談記録、人事データなど機密情報を扱うため、
                  適切なセキュリティ設定と定期的な監査が不可欠です。
                </p>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-6">🔐 アクセス制御の基本</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">3層のセキュリティモデル</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                    <h5 className="font-bold text-blue-800 mb-2">第1層：認証（Authentication）</h5>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• メールアドレス + パスワードによるログイン</li>
                      <li>• パスワードの複雑性要件（8文字以上、大小英数字）</li>
                      <li>• ログイン失敗5回でアカウントロック（30分間）</li>
                      <li>• セッションタイムアウト（8時間）</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded border-2 border-green-200">
                    <h5 className="font-bold text-green-800 mb-2">第2層：認可（Authorization）</h5>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• 25段階のアカウントレベルによる権限管理</li>
                      <li>• 機能ごとの必要レベル設定</li>
                      <li>• 部署・職種による閲覧制限</li>
                      <li>• 特別権限（Level 97-99）の厳格な管理</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-200">
                    <h5 className="font-bold text-yellow-800 mb-2">第3層：監査（Auditing）</h5>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• すべての操作をログに記録</li>
                      <li>• 権限レベル変更の履歴管理</li>
                      <li>• 不正アクセスの検出とアラート</li>
                      <li>• 定期的なセキュリティ監査</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">🛡️ セキュリティ設定の実務</h3>

              <div className="space-y-4">
                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3">パスワードポリシーの設定</h4>
                  <p className="text-sm text-gray-700 mb-2">「セキュリティ設定」→「パスワードポリシー」</p>
                  <div className="bg-white p-4 rounded border border-purple-300">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex justify-between">
                        <span className="font-semibold">最小文字数：</span>
                        <span>8文字（推奨：10文字以上）</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-semibold">複雑性要件：</span>
                        <span>大文字・小文字・数字を含む</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-semibold">パスワード有効期限：</span>
                        <span>90日（推奨）</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-semibold">再利用禁止：</span>
                        <span>過去5回分のパスワードは使用不可</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-pink-800 mb-3">IP制限の設定</h4>
                  <p className="text-sm text-gray-700 mb-2">「セキュリティ設定」→「IPアクセス制御」</p>
                  <div className="bg-white p-4 rounded border border-pink-300">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>ホワイトリスト方式：</strong>許可されたIPアドレスからのみアクセス可能
                    </p>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• 病院内ネットワーク：192.168.1.0/24</li>
                      <li>• VPN経由アクセス：10.0.0.0/8</li>
                      <li>• 管理者用：特定のグローバルIP</li>
                    </ul>
                    <p className="text-sm text-red-600 mt-3 font-semibold">
                      ⚠️ 自分自身のIPをロックアウトしないよう注意！
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">不正アクセスの監視</h4>
                  <p className="text-sm text-gray-700 mb-2">「セキュリティ」→「アクセス監視」</p>
                  <div className="bg-white p-4 rounded border border-blue-300">
                    <p className="text-sm text-gray-700 mb-2">以下の行動パターンを自動検出：</p>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• 短時間での大量ログイン試行（ブルートフォース攻撃）</li>
                      <li>• 通常と異なるIPアドレスからのアクセス</li>
                      <li>• 深夜時間帯の不審なアクセス</li>
                      <li>• 権限外データへのアクセス試行</li>
                      <li>• 大量データのダウンロード</li>
                    </ul>
                    <p className="text-sm text-green-700 mt-3">
                      検出時は管理者にメール・Slackで即時通知されます。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">🚨 セキュリティインシデント対応</h4>
                <p className="text-gray-700 mb-3">
                  不正アクセスや情報漏洩の疑いがある場合、以下の手順で対応：
                </p>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">1</span>
                    <span><strong>即座に管理職・人事部長に報告</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">2</span>
                    <span><strong>該当アカウントを一時ロック</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">3</span>
                    <span><strong>アクセスログを詳細に確認</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">4</span>
                    <span><strong>影響範囲を特定（閲覧・変更されたデータ）</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">5</span>
                    <span><strong>必要に応じてパスワード一斉リセット</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">6</span>
                    <span><strong>インシデント報告書を作成</strong></span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* バックアップタブ */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                バックアップと復旧
              </h2>

              <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  データは組織の財産です。<span className="font-semibold text-green-700">定期的なバックアップ</span>と
                  <span className="font-semibold text-green-700">迅速な復旧体制</span>を整えることで、
                  障害時のダメージを最小限に抑えます。
                </p>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-6">💾 バックアップ戦略</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">3-2-1ルール</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong className="text-indigo-800">3つのコピーを保持</strong>
                      <p className="text-sm text-gray-600">本番データ + バックアップ2世代</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong className="text-indigo-800">2種類の異なるメディア</strong>
                      <p className="text-sm text-gray-600">ディスク + クラウドストレージ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong className="text-indigo-800">1つはオフサイト保管</strong>
                      <p className="text-sm text-gray-600">別拠点のクラウドに保存（災害対策）</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">📅 バックアップスケジュール</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">毎日バックアップ（自動）</h4>
                  <ul className="ml-4 space-y-1 text-sm text-gray-700">
                    <li>• 実行時刻：深夜2:00（ユーザーアクセスが少ない時間）</li>
                    <li>• 対象：データベース全体（職員マスタ、投稿、コメント、投票など）</li>
                    <li>• 保存先：サーバー内ディスク + AWS S3</li>
                    <li>• 保持期間：30日分</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">毎週バックアップ（自動）</h4>
                  <ul className="ml-4 space-y-1 text-sm text-gray-700">
                    <li>• 実行時刻：毎週日曜 深夜3:00</li>
                    <li>• 対象：データベース + 添付ファイル</li>
                    <li>• 保存先：AWS S3（別リージョン）</li>
                    <li>• 保持期間：12週分（約3ヶ月）</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-3">毎月バックアップ（自動）</h4>
                  <ul className="ml-4 space-y-1 text-sm text-gray-700">
                    <li>• 実行時刻：毎月1日 深夜4:00</li>
                    <li>• 対象：システム全体（設定ファイル含む）</li>
                    <li>• 保存先：AWS S3 Glacier（長期保存）</li>
                    <li>• 保持期間：24ヶ月分（2年間）</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">🔄 復旧手順</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">バックアップからの復旧</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>「管理」→「バックアップ管理」画面を開く</strong>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>復旧したいバックアップを選択</strong>
                      <p className="text-gray-600 text-sm">日付・時刻を確認して適切なバックアップを選択</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>「復旧プレビュー」で内容を確認</strong>
                      <p className="text-gray-600 text-sm">どのデータが復旧されるか事前確認</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>メンテナンスモードをON</strong>
                      <p className="text-gray-600 text-sm">復旧中はユーザーのアクセスをブロック</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>「復旧開始」ボタンをクリック</strong>
                      <p className="text-gray-600 text-sm">復旧には10-30分程度かかります</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</span>
                    <div>
                      <strong>データ整合性チェック</strong>
                      <p className="text-gray-600 text-sm">自動チェックツールで復旧データを検証</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">7</span>
                    <div>
                      <strong>テストログインで動作確認</strong>
                      <p className="text-gray-600 text-sm">主要機能が正常に動作することを確認</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">8</span>
                    <div>
                      <strong>メンテナンスモードをOFF</strong>
                      <p className="text-gray-600 text-sm">ユーザーにサービス再開を通知</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">⚠️ 復旧時の重要な注意点</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>復旧前に現状をバックアップ</strong>：復旧に失敗した場合の保険</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>バックアップ時刻以降のデータは失われる</strong>：ユーザーに事前通知</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>業務時間外に実施</strong>：夜間・休日の復旧を推奨</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>復旧完了後は全職員にメール通知</strong>：復旧した旨を周知</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 監視・ログタブ */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                システム監視とログ管理
              </h2>

              <h3 className="text-xl font-bold text-indigo-700 mt-6">📊 監視ダッシュボード</h3>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-indigo-200">
                <p className="text-lg mb-3">
                  「管理」→「システム監視」で、リアルタイムのシステム状況を確認できます。
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded border-2 border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">サーバーステータス</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• CPU使用率：通常20-30%</li>
                      <li>• メモリ使用率：通常40-60%</li>
                      <li>• ディスク使用率：70%超で警告</li>
                      <li>• ネットワーク帯域</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border-2 border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">アプリケーション</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• 同時接続ユーザー数</li>
                      <li>• APIレスポンス時間</li>
                      <li>• エラー発生率</li>
                      <li>• データベース接続数</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">📝 ログの種類と確認方法</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3">1. アクセスログ</h4>
                  <p className="text-sm text-gray-700 mb-2">すべてのユーザーのアクセス履歴</p>
                  <div className="bg-white p-3 rounded border border-blue-300 text-sm">
                    <p className="font-mono text-xs mb-2">[2025-08-10 14:30:15] Level 5 | 田中太郎 | ログイン成功 | IP: 192.168.1.100</p>
                    <p className="font-mono text-xs">[2025-08-10 14:35:22] Level 5 | 田中太郎 | 投稿閲覧 | ID: 12345</p>
                  </div>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">2. エラーログ</h4>
                  <p className="text-sm text-gray-700 mb-2">システムエラーや例外の記録</p>
                  <div className="bg-white p-3 rounded border border-green-300 text-sm">
                    <p className="font-mono text-xs text-red-600">[ERROR] Database connection timeout (5s exceeded)</p>
                    <p className="font-mono text-xs text-orange-600 mt-1">[WARN] High memory usage detected: 85%</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-3">3. 監査ログ</h4>
                  <p className="text-sm text-gray-700 mb-2">重要な操作の記録（改ざん防止）</p>
                  <div className="bg-white p-3 rounded border border-yellow-300 text-sm">
                    <p className="font-mono text-xs">[AUDIT] 権限変更 | 対象: 山田花子 | Level 4 → Level 5 | 実行者: 人事部長</p>
                    <p className="font-mono text-xs mt-1">[AUDIT] 投稿削除 | ID: 67890 | 実行者: システム管理者</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3">4. バックアップログ</h4>
                  <p className="text-sm text-gray-700 mb-2">バックアップの実行履歴</p>
                  <div className="bg-white p-3 rounded border border-purple-300 text-sm">
                    <p className="font-mono text-xs text-green-600">[SUCCESS] Daily backup completed | Size: 2.3GB | Duration: 8min</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">🔍 ログの検索と分析</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">ログ検索機能</h4>
                <p className="text-sm text-gray-700 mb-3">
                  「管理」→「ログ管理」で、条件を指定してログを検索できます。
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold w-24">期間指定:</span>
                    <span className="text-gray-600">過去1時間 / 1日 / 1週間 / カスタム</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold w-24">ログレベル:</span>
                    <span className="text-gray-600">INFO / WARN / ERROR / AUDIT</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold w-24">ユーザー:</span>
                    <span className="text-gray-600">特定のユーザーの操作のみ表示</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold w-24">キーワード:</span>
                    <span className="text-gray-600">エラーメッセージやIPアドレスで検索</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded mt-6">
                <h4 className="font-bold text-orange-800 mb-2">💡 定期的なログ確認の習慣</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>毎朝エラーログを確認</strong>：夜間に発生したエラーをチェック</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>毎週監査ログをレビュー</strong>：権限変更やデータ削除を確認</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>ディスク容量を定期チェック</strong>：ログファイルの肥大化に注意</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span><strong>不審なアクセスを早期発見</strong>：ログイン失敗の多いIPを特定</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* トラブル対応タブ */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                トラブルシューティングガイド
              </h2>

              <h3 className="text-xl font-bold text-indigo-700 mt-6">🚨 よくある障害と対処法</h3>

              <div className="space-y-4">
                <div className="bg-red-50 p-5 rounded-lg border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">障害1：ログインできない</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-red-700">症状：</strong>
                      <p className="text-gray-700">ユーザーが正しいパスワードを入力してもログインできない</p>
                    </div>
                    <div>
                      <strong className="text-red-700">原因候補：</strong>
                      <ul className="ml-4 text-gray-700 list-disc">
                        <li>アカウントがロックされている（ログイン失敗5回）</li>
                        <li>アカウントが無効化されている</li>
                        <li>セッションの不具合</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-red-700">対処法：</strong>
                      <ol className="ml-4 text-gray-700 space-y-1">
                        <li>1. 「職員管理」で対象ユーザーを検索</li>
                        <li>2. アカウントステータスを確認（有効/無効/ロック）</li>
                        <li>3. ロック状態なら「ロック解除」ボタンをクリック</li>
                        <li>4. 無効状態なら理由を確認し、必要なら有効化</li>
                        <li>5. それでも解決しない場合はパスワードリセット</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">障害2：ページが表示されない（500エラー）</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-orange-700">症状：</strong>
                      <p className="text-gray-700">特定のページにアクセスすると「Internal Server Error」が表示される</p>
                    </div>
                    <div>
                      <strong className="text-orange-700">原因候補：</strong>
                      <ul className="ml-4 text-gray-700 list-disc">
                        <li>データベース接続エラー</li>
                        <li>メモリ不足</li>
                        <li>プログラムのバグ</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-orange-700">対処法：</strong>
                      <ol className="ml-4 text-gray-700 space-y-1">
                        <li>1. エラーログを確認（「ログ管理」画面）</li>
                        <li>2. データベース接続状況を確認</li>
                        <li>3. サーバーのメモリ使用率をチェック</li>
                        <li>4. 必要に応じてアプリケーションを再起動</li>
                        <li>5. 解決しない場合は開発チームに連絡</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">障害3：動作が遅い</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-yellow-700">症状：</strong>
                      <p className="text-gray-700">ページの表示が遅い、操作がもたつく</p>
                    </div>
                    <div>
                      <strong className="text-yellow-700">原因候補：</strong>
                      <ul className="ml-4 text-gray-700 list-disc">
                        <li>データベースのパフォーマンス低下</li>
                        <li>サーバーのリソース不足</li>
                        <li>同時アクセス数の増加</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-yellow-700">対処法：</strong>
                      <ol className="ml-4 text-gray-700 space-y-1">
                        <li>1. 「システム監視」でCPU・メモリ使用率を確認</li>
                        <li>2. 同時接続ユーザー数をチェック</li>
                        <li>3. データベースのスロークエリログを確認</li>
                        <li>4. 必要に応じてキャッシュをクリア</li>
                        <li>5. 長期的にはサーバースペックの増強を検討</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">障害4：メールが届かない</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-blue-700">症状：</strong>
                      <p className="text-gray-700">通知メールや面談リマインダーメールが届かない</p>
                    </div>
                    <div>
                      <strong className="text-blue-700">原因候補：</strong>
                      <ul className="ml-4 text-gray-700 list-disc">
                        <li>SMTP設定のエラー</li>
                        <li>メールアドレスの誤り</li>
                        <li>スパムフィルターによるブロック</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-700">対処法：</strong>
                      <ol className="ml-4 text-gray-700 space-y-1">
                        <li>1. 「システム設定」→「通知設定」でSMTP設定を確認</li>
                        <li>2. 「ログ管理」でメール送信ログを確認</li>
                        <li>3. テストメール送信機能で動作確認</li>
                        <li>4. ユーザーのメールアドレスが正しいか確認</li>
                        <li>5. 迷惑メールフォルダに振り分けられていないか確認依頼</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-indigo-700 mt-8">🛠️ 緊急メンテナンス手順</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">重大障害発生時の対応</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>メンテナンスモードをON</strong>
                      <p className="text-gray-600 text-sm">「システム設定」→「メンテナンスモード」→「有効化」</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>全職員にメール通知</strong>
                      <p className="text-gray-600 text-sm">障害の概要と復旧見込み時刻を通知</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>障害箇所を特定</strong>
                      <p className="text-gray-600 text-sm">エラーログ、監視ダッシュボードを確認</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>復旧作業を実施</strong>
                      <p className="text-gray-600 text-sm">再起動、バックアップ復旧、設定変更など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>動作確認テスト</strong>
                      <p className="text-gray-600 text-sm">主要機能が正常に動作することを確認</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</span>
                    <div>
                      <strong>メンテナンスモードをOFF</strong>
                      <p className="text-gray-600 text-sm">サービス再開を全職員にメール通知</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">7</span>
                    <div>
                      <strong>障害報告書を作成</strong>
                      <p className="text-gray-600 text-sm">原因、対処内容、再発防止策を記録</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* FAQタブ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-3">
                システム管理者向けFAQ
              </h2>

              <div className="space-y-4">
                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q1. システムのバージョンアップはどうすればいいですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> 開発チームから新バージョンがリリースされたら、
                    まず<span className="font-semibold">テスト環境で動作確認</span>してください。
                    問題なければ、<span className="font-semibold">業務時間外（夜間・休日）</span>に本番環境へ適用します。
                    適用前には必ずバックアップを取得し、ユーザーへ事前通知してください。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q2. Level 99の権限は誰が付与できますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> Level 99は<span className="font-semibold">既存のLevel 99保持者</span>のみが付与できます。
                    通常は1-2名に限定し、付与時には<span className="font-semibold">理事会や経営層の承認</span>が必要です。
                    退職時には速やかに権限を剥奪してください。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q3. データベースのバックアップは自動ですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> はい、<span className="font-semibold">毎日深夜2時に自動実行</span>されます。
                    バックアップの成功/失敗は「バックアップログ」で確認できます。
                    失敗が3日連続した場合は、システム管理者にアラートメールが送信されます。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q4. 誤って削除したデータを復旧できますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> はい、<span className="font-semibold">バックアップから復旧</span>できます。
                    ただし、バックアップ時点までのデータしか復旧できません（深夜2時のバックアップ以降の更新は失われます）。
                    個別データの復旧は難しいため、<span className="font-semibold">削除操作は慎重に</span>行ってください。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q5. サーバーのディスク容量が不足した場合はどうすればいいですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> まず「ログ管理」から<span className="font-semibold">古いログファイルを削除</span>してください（3ヶ月以上前）。
                    それでも不足する場合は、<span className="font-semibold">ディスク増設</span>を検討します。
                    インフラチームまたはホスティング事業者に連絡して、ディスク容量の追加を依頼してください。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q6. セキュリティ監査はどのくらいの頻度で実施すべきですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> <span className="font-semibold">年1回の定期監査</span>を推奨します。
                    監査内容：アクセス権限の確認、パスワードポリシーの遵守状況、不正アクセスログのチェック、
                    バックアップの動作確認、システム設定の妥当性など。
                    監査結果は経営層に報告してください。
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q7. システムのパフォーマンスを改善する方法は？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong> 以下の方法があります：<br/>
                    1. <span className="font-semibold">データベースのインデックス最適化</span>（スロークエリの改善）<br/>
                    2. <span className="font-semibold">画像ファイルの圧縮</span>（添付ファイルサイズの削減）<br/>
                    3. <span className="font-semibold">キャッシュの活用</span>（よくアクセスされるページのキャッシュ）<br/>
                    4. <span className="font-semibold">古いデータのアーカイブ</span>（2年以上前の投稿を別テーブルへ）
                  </p>
                </div>

                <div className="bg-white border-2 border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-indigo-800 mb-2">Q8. 不正アクセスを検知した場合の対応は？</h3>
                  <p className="text-gray-700">
                    <strong className="text-indigo-700">A.</strong>
                    1. <span className="font-semibold">該当IPアドレスをブロック</span>（セキュリティ設定→IP制限）<br/>
                    2. <span className="font-semibold">アクセスログを詳細分析</span>（何が閲覧・操作されたか）<br/>
                    3. <span className="font-semibold">パスワードを一斉リセット</span>（全職員に強制変更を通知）<br/>
                    4. <span className="font-semibold">セキュリティインシデント報告書を作成</span>し、経営層に報告<br/>
                    5. 必要に応じて<span className="font-semibold">警察や専門機関に相談</span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6 mt-8">
                <h3 className="font-bold text-lg text-indigo-800 mb-3">📞 緊急連絡先</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    <span><strong>開発チーム（技術的問題）</strong>：dev-support@example.com / 内線 9999</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    <span><strong>インフラチーム（サーバー障害）</strong>：infra@example.com / 内線 9998</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    <span><strong>セキュリティ担当（不正アクセス）</strong>：security@example.com / 内線 9997</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    <span><strong>緊急時（24時間対応）</strong>：080-XXXX-XXXX</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* フッターナビゲーション */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/guides-hub"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
              >
                ← ガイド一覧に戻る
              </Link>
              <Link
                to="/user-guide"
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg font-semibold transition-colors"
              >
                FAQ検索
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* モバイル・デスクトップフッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default SystemAdminGuide;
