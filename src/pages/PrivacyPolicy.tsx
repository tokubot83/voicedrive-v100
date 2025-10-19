/**
 * プライバシーポリシーページ
 *
 * VoiceDriveデータ分析・職員カルテシステム連携における
 * データの取り扱いについての詳細説明
 */

import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, FileText } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">📋 プライバシーポリシー</h1>
              <p className="text-slate-400 mt-1">VoiceDriveデータの取り扱いについて</p>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-8 border border-slate-700/50 space-y-8">
          {/* 1. データ収集について */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">1. 収集するデータ</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                VoiceDriveでは、組織改善とあなたのキャリア支援のため、
                以下のデータを収集・分析します。
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-blue-300 mb-2">📌 収集対象データ</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>議題モード:</strong> 投稿内容、投票履歴、コメント</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>プロジェクト化モード:</strong> プロジェクト提案、活動履歴、進捗データ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>ユーザー属性:</strong> 部署、職種、階層レベル（個人を特定しない範囲）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>活動メタデータ:</strong> 投稿日時、活動頻度、参加状況</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-200">
                  <strong>✓ 匿名投稿の保護:</strong> 匿名で投稿されたデータは、
                  完全に匿名性を保持したまま集団分析のみに使用されます。
                </p>
              </div>
            </div>
          </section>

          {/* 2. データの利用目的 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">2. データの利用目的</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                収集したデータは、職員カルテシステムと連携し、
                以下の目的でのみ使用されます。
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-purple-300 mb-2">🎯 利用目的</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>組織課題の早期発見:</strong> 部署別・職種別の傾向分析</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>世代間・階層間の理解促進:</strong> コミュニケーション改善施策の立案</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>個人へのフィードバック:</strong> あなたの強み・関心領域の可視化</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>キャリア面談での活用:</strong> 建設的な対話のための話題提供</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>組織改善施策の効果測定:</strong> 施策前後の変化追跡</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-200">
                  <strong>❌ 禁止事項:</strong> 人事評価への直接利用、
                  懲戒処分の根拠としての使用、個人の監視目的での利用は一切ありません。
                </p>
              </div>
            </div>
          </section>

          {/* 3. プライバシー保護措置 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">3. プライバシー保護措置</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                あなたのプライバシーを守るため、以下の技術的・組織的措置を講じています。
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-green-300 mb-2">🔒 技術的保護措置</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      <strong>K-匿名性の保証:</strong> 最低5名以上のグループでのみ分析を実施
                      （個人特定を防止）
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      <strong>匿名投稿の完全保護:</strong> 匿名フラグ付きデータは匿名性を永続的に保持
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      <strong>ローカル処理:</strong> 投稿内容は外部送信せず、
                      組織内サーバーで完結処理
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      <strong>アクセス制限:</strong> 職員カルテシステムへのアクセスは
                      権限者（人事部門）のみに限定
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>
                      <strong>監査ログ:</strong> すべてのデータアクセスを記録・監視
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-green-300 mb-2">👥 組織的保護措置</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>データアクセス権限の厳格な管理</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>定期的なプライバシー研修の実施</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>データ取り扱いガイドラインの遵守</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. データ共有と第三者提供 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">4. データ共有と第三者提供</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-yellow-300 mb-2">🔗 職員カルテシステムとの共有</h3>
                <p className="mb-2">
                  VoiceDriveデータは、同意を得た上で職員カルテシステムと共有されます。
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>共有先: 組織内職員カルテシステム（同一データベース基盤）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>共有目的: 上記「2. データの利用目的」に記載の通り</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>共有方法: 同一組織内のセキュアなデータベース連携</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-200">
                  <strong>✓ 外部提供なし:</strong> 組織外の第三者への提供は一切行いません。
                  法令に基づく開示要請がある場合のみ、必要最小限の範囲で対応します。
                </p>
              </div>
            </div>
          </section>

          {/* 5. あなたの権利 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">5. あなたの権利</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                データ分析への同意後も、以下の権利を行使できます。
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-cyan-300 mb-2">✓ 行使可能な権利</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>同意の取り消し:</strong> いつでも分析への同意を取り消せます。
                      取り消し後の新規データは分析対象外となります。
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>データ削除請求:</strong> 過去の活動データの削除を請求できます。
                      （処理完了まで数日かかる場合があります）
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>データ開示請求:</strong> 自分のデータがどのように分析されているか、
                      開示を請求できます。
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <div>
                      <strong>設定変更:</strong> 設定画面からいつでも同意状態を変更できます。
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-200">
                  <strong>📞 権利行使の方法:</strong>
                  設定画面の「データ分析同意設定」セクションから操作可能です。
                  不明点がある場合は人事部門までお問い合わせください。
                </p>
              </div>
            </div>
          </section>

          {/* 6. データ保存期間 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">6. データ保存期間</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      <strong>活動データ:</strong> 在職中および退職後3年間保存
                      （労働法令に基づく）
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      <strong>分析結果:</strong> 組織改善施策の効果測定のため、
                      施策完了後5年間保存
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span>
                      <strong>削除請求データ:</strong> 請求受付後、
                      法令上の保存義務を除き速やかに削除
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. お問い合わせ */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">7. お問い合わせ</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                プライバシーポリシーに関するご質問、権利行使のご相談は
                以下までお問い合わせください。
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="space-y-2">
                  <p><strong>担当部署:</strong> 人事部 個人情報保護担当</p>
                  <p><strong>メール:</strong> privacy@organization.local</p>
                  <p><strong>内線:</strong> 内線1234</p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. ポリシー更新 */}
          <section>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-slate-300 mb-2">📅 最終更新日</h3>
              <p className="text-slate-400">2025年10月5日</p>
              <p className="text-slate-400 text-sm mt-2">
                このプライバシーポリシーは、法令改正や運用の変更に伴い更新されることがあります。
                重要な変更がある場合は、事前に通知いたします。
              </p>
            </div>
          </section>
        </div>

        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg
                     font-semibold transition-colors"
          >
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
