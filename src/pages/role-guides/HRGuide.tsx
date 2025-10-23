import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';

/**
 * 人事部門向けガイド（Level 14-17）
 * 対象：人事課員、人事課長、人事部長、人事統括責任者
 */
const HRGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'staff-management' | 'permission-settings' | 'interview-management' | 'analytics' | 'faq'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-32">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">👥</span>
            <h1 className="text-3xl md:text-4xl font-bold">人事部門向けガイド</h1>
          </div>
          <p className="text-lg text-purple-100">Level 14-17 | 職員管理・権限設定・人事分析の専門ガイド</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2">
          {[
            { id: 'overview' as const, label: '概要', icon: '📋' },
            { id: 'staff-management' as const, label: '職員管理', icon: '👤' },
            { id: 'permission-settings' as const, label: '権限設定', icon: '🔐' },
            { id: 'interview-management' as const, label: '面談管理', icon: '📅' },
            { id: 'analytics' as const, label: '人事分析', icon: '📊' },
            { id: 'faq' as const, label: 'よくある質問', icon: '❓' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
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
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                人事部門の役割と責任
              </h2>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  人事部門は、VoiceDriveシステムにおける<span className="font-semibold text-purple-700">職員マスタの管理者</span>です。
                  職員の登録・異動・退職処理、権限レベルの設定、面談スケジュールの管理など、
                  システムの基盤となる人事情報を適切に管理する重要な役割を担います。
                </p>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">🎯 主要な4つの機能</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-lg text-blue-800 mb-2">1. 職員マスタ管理</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 新規職員の登録</li>
                    <li>• 異動・昇進の反映</li>
                    <li>• 退職・休職処理</li>
                    <li>• 所属部署の更新</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg text-green-800 mb-2">2. 権限レベル設定</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• アカウントレベルの付与</li>
                    <li>• 昇格・降格の処理</li>
                    <li>• 看護リーダーレベル設定</li>
                    <li>• 特別権限の付与（97-99）</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-lg text-yellow-800 mb-2">3. 面談スケジュール管理</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 面談枠の設定</li>
                    <li>• 面談室の管理</li>
                    <li>• 面談者の割り当て</li>
                    <li>• 予約状況の確認</li>
                  </ul>
                </div>

                <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-lg text-pink-800 mb-2">4. 人事データ分析</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• エンゲージメント分析</li>
                    <li>• 投稿傾向の把握</li>
                    <li>• 部署別活動状況</li>
                    <li>• 面談実施率の確認</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">⚠️ 重要な責任</h4>
                <p className="text-gray-700">
                  職員の個人情報や権限設定を扱うため、<span className="font-semibold">情報セキュリティと公平性</span>が最重要です。
                  権限レベルの変更は必ず人事発令に基づいて行い、個人情報の取り扱いには細心の注意を払ってください。
                </p>
              </div>
            </div>
          )}

          {/* 職員管理タブ */}
          {activeTab === 'staff-management' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                職員マスタ管理の実務
              </h2>

              <h3 className="text-xl font-bold text-purple-700 mt-6">🆕 新規職員の登録</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">登録の流れ（7ステップ）</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>人事システムで基本情報を確認</strong>
                      <p className="text-gray-600 text-sm">氏名（漢字・かな）、生年月日、所属部署、職種、採用日</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>VoiceDriveの「職員管理」画面を開く</strong>
                      <p className="text-gray-600 text-sm">左メニュー「人事管理」→「職員マスタ」</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>「新規登録」ボタンをクリック</strong>
                      <p className="text-gray-600 text-sm">右上の緑色のボタン</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>基本情報を入力</strong>
                      <p className="text-gray-600 text-sm">社員番号、氏名、メールアドレス、所属部署、職種</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>初期アカウントレベルを設定</strong>
                      <p className="text-gray-600 text-sm">新規採用者は通常「Level 1（新人職員）」</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</span>
                    <div>
                      <strong>入力内容を確認</strong>
                      <p className="text-gray-600 text-sm">特にメールアドレスとアカウントレベルは重要</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">7</span>
                    <div>
                      <strong>「登録」ボタンで確定</strong>
                      <p className="text-gray-600 text-sm">登録後、職員に初回ログイン案内メールが自動送信されます</p>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">🔄 異動・昇進の処理</h3>

              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold mb-3">異動時の更新項目</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>所属部署</strong>：異動先の部署名を選択</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>職種</strong>：職種変更がある場合は更新</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>役職</strong>：昇進・降格に応じて更新</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>アカウントレベル</strong>：役職変更に伴い適切なレベルに変更（詳細は「権限設定」タブ参照）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>異動日</strong>：発令日を記録</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">👋 退職・休職処理</h3>

              <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                <h4 className="font-semibold mb-3">処理の注意点</h4>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <strong className="text-yellow-800">退職処理：</strong>
                    <p>アカウントを「無効化」します。過去の投稿やコメントは保持されますが、ログインできなくなります。</p>
                  </div>
                  <div>
                    <strong className="text-yellow-800">休職処理：</strong>
                    <p>アカウントを「一時停止」にします。復職時に再び有効化できます。</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-yellow-300 mt-3">
                    <strong className="text-red-600">⚠️ 重要：</strong>
                    <p className="text-sm mt-1">退職者のアカウントは完全削除せず、「無効化」で対応してください。
                    過去の投稿履歴や面談記録を保持することで、組織の知見を維持します。</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded mt-6">
                <h4 className="font-bold text-green-800 mb-2">💡 ヒント：一括処理機能</h4>
                <p className="text-gray-700">
                  年度始めの大規模異動時は、CSVインポート機能を使うと効率的です。
                  「職員管理」画面の「一括インポート」ボタンから、所定のフォーマットでCSVファイルをアップロードできます。
                </p>
              </div>
            </div>
          )}

          {/* 権限設定タブ */}
          {activeTab === 'permission-settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                アカウントレベルと権限設定
              </h2>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  VoiceDriveは<span className="font-semibold text-purple-700">25段階のアカウントレベル</span>を採用しています。
                  職員の役職や責任に応じて適切なレベルを設定することで、システム全体の公平性とセキュリティを保ちます。
                </p>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-6">📊 レベル体系の全体像</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">基本レベル（Level 1-18）</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-semibold">Level 1-4：一般職員</p>
                      <ul className="ml-4 text-gray-700">
                        <li>• Level 1：新人職員</li>
                        <li>• Level 2：若手職員</li>
                        <li>• Level 3：中堅職員</li>
                        <li>• Level 4：ベテラン職員</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Level 5-11：管理職</p>
                      <ul className="ml-4 text-gray-700">
                        <li>• Level 5：副主任</li>
                        <li>• Level 6：主任</li>
                        <li>• Level 7：副師長</li>
                        <li>• Level 8：師長</li>
                        <li>• Level 9-11：部長クラス</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Level 12-13：施設幹部</p>
                      <ul className="ml-4 text-gray-700">
                        <li>• Level 12：副院長</li>
                        <li>• Level 13：院長</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Level 14-18：経営層</p>
                      <ul className="ml-4 text-gray-700">
                        <li>• Level 14-15：人事・総務</li>
                        <li>• Level 16-17：事務局長</li>
                        <li>• Level 18：理事会メンバー</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">看護リーダーレベル（Level 1.5-4.5）</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    看護職員の中でリーダー業務を担当する職員に付与される特別レベル
                  </p>
                  <ul className="ml-4 text-sm text-gray-700 space-y-1">
                    <li>• Level 1.5：新人リーダー</li>
                    <li>• Level 2.5：若手リーダー</li>
                    <li>• Level 3.5：中堅リーダー</li>
                    <li>• Level 4.5：ベテランリーダー</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-2">特別権限レベル（Level 97-99）</h4>
                  <ul className="ml-4 text-sm text-gray-700 space-y-1">
                    <li>• Level 97：健康診断担当者（ストレスチェック閲覧権限）</li>
                    <li>• Level 98：産業医（メンタルヘルスデータ閲覧権限）</li>
                    <li>• Level 99：システム管理者（全権限）</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">🔐 権限設定の実務</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">レベル変更の手順</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>人事発令を確認</strong>
                      <p className="text-gray-600 text-sm">必ず公式の人事発令に基づいて変更します</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>職員を検索</strong>
                      <p className="text-gray-600 text-sm">「職員管理」画面で対象職員を検索</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>「権限設定」ボタンをクリック</strong>
                      <p className="text-gray-600 text-sm">職員詳細画面の右上</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>新しいアカウントレベルを選択</strong>
                      <p className="text-gray-600 text-sm">役職に応じた適切なレベルを選択</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>変更理由を記入</strong>
                      <p className="text-gray-600 text-sm">「昇進により副主任へ」など、変更理由を必ず記録</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</span>
                    <div>
                      <strong>「変更」ボタンで確定</strong>
                      <p className="text-gray-600 text-sm">変更履歴は自動的に記録されます</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">⚠️ 権限設定の重要な注意点</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>必ず人事発令に基づいて設定</strong>：個人的な判断で権限を変更しないこと</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>変更理由を必ず記録</strong>：監査時に変更履歴が確認されます</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>Level 97-99は慎重に</strong>：特別権限は必要最小限の人数に限定</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span><strong>降格時の配慮</strong>：降格は職員のモチベーションに影響するため、慎重に対応</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 面談管理タブ */}
          {activeTab === 'interview-management' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                面談スケジュール管理
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  人事部門は、VoiceDriveの面談機能における<span className="font-semibold text-blue-700">面談枠の設定と管理</span>を担当します。
                  職員が円滑に面談予約できるよう、適切な面談枠を提供することが重要です。
                </p>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-6">📅 面談枠の設定方法</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">面談枠設定の流れ</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>「面談管理」画面を開く</strong>
                      <p className="text-gray-600 text-sm">左メニュー「人事管理」→「面談スケジュール管理」</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>面談タイプを選択</strong>
                      <p className="text-gray-600 text-sm">人事面談、メンタルヘルス面談、ストレスチェック面談など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>面談者（担当者）を指定</strong>
                      <p className="text-gray-600 text-sm">人事課員、産業医、看護部長など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>日時を設定</strong>
                      <p className="text-gray-600 text-sm">カレンダーから日付を選択し、時間帯（30分単位）を設定</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>面談室を指定</strong>
                      <p className="text-gray-600 text-sm">「人事課相談室」「産業医室」など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</span>
                    <div>
                      <strong>「公開」ボタンで確定</strong>
                      <p className="text-gray-600 text-sm">面談枠が職員に公開され、予約可能になります</p>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">🏠 面談室の管理</h3>

              <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                <h4 className="font-semibold mb-3">面談室マスタの登録</h4>
                <p className="text-gray-700 mb-3">
                  面談で使用する部屋を事前に登録しておきます。「面談室管理」画面から登録できます。
                </p>
                <div className="bg-white p-4 rounded border border-green-300">
                  <strong className="text-green-800">登録項目：</strong>
                  <ul className="ml-4 mt-2 space-y-1 text-sm">
                    <li>• 面談室名（例：「人事課相談室」「産業医室」）</li>
                    <li>• 場所（例：「本館3階」「管理棟2階」）</li>
                    <li>• 収容人数（通常は2-4名）</li>
                    <li>• 備品（モニター、ホワイトボード等）</li>
                    <li>• 利用可能時間帯</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">📊 予約状況の確認</h3>

              <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                <h4 className="font-semibold mb-3">ダッシュボードで一目で確認</h4>
                <p className="text-gray-700 mb-3">
                  「面談管理ダッシュボード」では、以下の情報を確認できます：
                </p>
                <ul className="ml-4 space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span><strong>今週の予約状況</strong>：日別・時間帯別の予約数</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span><strong>面談者別の予約数</strong>：誰が何件予約を受けているか</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span><strong>面談室の稼働率</strong>：どの部屋がよく使われているか</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span><strong>キャンセル率</strong>：どの面談タイプのキャンセルが多いか</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">✓</span>
                    <span><strong>面談実施率</strong>：部署別・職員別の面談受講状況</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded mt-6">
                <h4 className="font-bold text-purple-800 mb-2">💡 効果的な面談枠設定のコツ</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>早朝・夜間枠も用意</strong>：シフト勤務者が予約しやすいよう、幅広い時間帯を提供</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>2週間先まで公開</strong>：職員が予定を調整しやすいよう、早めに面談枠を公開</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>キャンセル待ちを活用</strong>：人気の時間帯はキャンセル待ち機能を有効に</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>定期的に稼働率を確認</strong>：利用の少ない時間帯は枠を減らし、人気時間帯を増やす</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 人事分析タブ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                人事データ分析とエンゲージメント把握
              </h2>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 p-5 rounded">
                <p className="text-lg leading-relaxed">
                  VoiceDriveに蓄積された職員の声や活動データから、
                  <span className="font-semibold text-purple-700">組織のエンゲージメント状況</span>を分析できます。
                  データに基づいた人事施策の立案に活用してください。
                </p>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-6">📈 主要な分析指標</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-lg text-blue-800 mb-2">1. 投稿活動の分析</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 部署別の投稿数</li>
                    <li>• 職員別の投稿頻度</li>
                    <li>• 投稿カテゴリの傾向</li>
                    <li>• 時間帯別の投稿パターン</li>
                    <li>• 長期的な投稿トレンド</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg text-green-800 mb-2">2. エンゲージメント指標</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• アクティブユーザー率</li>
                    <li>• コメント・いいね数</li>
                    <li>• 投票参加率</li>
                    <li>• 面談予約率</li>
                    <li>• システム利用頻度</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-200">
                  <h4 className="font-bold text-lg text-yellow-800 mb-2">3. 部署別の比較</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 部署ごとの投稿数比較</li>
                    <li>• 職員1人あたりの活動量</li>
                    <li>• 部署間のコラボレーション</li>
                    <li>• 改善提案の採用率</li>
                    <li>• エンゲージメントスコア</li>
                  </ul>
                </div>

                <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-lg text-pink-800 mb-2">4. 課題の早期発見</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 投稿が少ない部署の特定</li>
                    <li>• 不満の多い分野の把握</li>
                    <li>• 休職・退職予兆の検出</li>
                    <li>• ハラスメント関連の投稿</li>
                    <li>• メンタルヘルス懸念</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">🔍 分析ダッシュボードの使い方</h3>

              <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-300">
                <h4 className="font-semibold text-lg mb-3">「人事分析ダッシュボード」へのアクセス</h4>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>左メニューから「人事管理」→「分析ダッシュボード」を選択</strong>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>期間を選択（過去1週間、1ヶ月、3ヶ月、1年など）</strong>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>部署や職種でフィルタリング</strong>
                      <p className="text-gray-600 text-sm">特定の部署や職種に絞って分析できます</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div>
                      <strong>グラフや表で視覚的に確認</strong>
                      <p className="text-gray-600 text-sm">投稿トレンド、エンゲージメント推移、部署別比較など</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <div>
                      <strong>レポートをエクスポート</strong>
                      <p className="text-gray-600 text-sm">Excel形式でダウンロードし、経営層への報告資料として活用</p>
                    </div>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-8">💡 分析結果の活用例</h3>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2">活用例1：部署間格差の是正</h4>
                  <p className="text-gray-700 text-sm">
                    投稿数が極端に少ない部署を特定し、その部署の管理職に働きかけて、
                    職員が意見を出しやすい環境づくりを促進。
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2">活用例2：人気テーマの把握</h4>
                  <p className="text-gray-700 text-sm">
                    投稿が多いカテゴリや投票数の多いテーマを分析し、
                    職員の関心が高い分野を特定。優先的に改善施策を実施。
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-yellow-800 mb-2">活用例3：離職予兆の検出</h4>
                  <p className="text-gray-700 text-sm">
                    以前は活発だった職員の投稿が急激に減少した場合、離職の予兆として面談を実施。
                    早期のフォローアップでエンゲージメントを回復。
                  </p>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                  <h4 className="font-semibold text-pink-800 mb-2">活用例4：成功事例の横展開</h4>
                  <p className="text-gray-700 text-sm">
                    エンゲージメントが高い部署の取り組みを分析し、他部署に横展開。
                    成功パターンを全体に広げて組織全体の活性化を図る。
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded mt-6">
                <h4 className="font-bold text-red-800 mb-2">⚠️ プライバシー保護の注意</h4>
                <p className="text-gray-700">
                  分析データには個人の投稿内容や活動履歴が含まれます。
                  <span className="font-semibold">個人を特定できる情報の取り扱いには十分注意</span>し、
                  プライバシーを侵害しないよう配慮してください。
                  レポート作成時は匿名化・集計化を徹底し、個人が特定されないようにします。
                </p>
              </div>
            </div>
          )}

          {/* FAQタブ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 border-b-2 border-purple-200 pb-3">
                よくある質問（人事部門向け）
              </h2>

              <div className="space-y-4">
                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q1. 新規職員の登録はいつまでに行うべきですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> 入職日の<span className="font-semibold">1週間前まで</span>に登録してください。
                    登録後、職員に初回ログイン案内メールが送信されます。入職前に自宅でアカウントを確認できるよう、
                    余裕を持って登録することを推奨します。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q2. アカウントレベルの変更は即座に反映されますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> はい、<span className="font-semibold">即座に反映</span>されます。
                    権限設定画面で「変更」ボタンをクリックした瞬間、新しいレベルが適用され、
                    その職員が次にログインした際には新しい権限で操作できます。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q3. 退職者のアカウントは削除すべきですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> いいえ、<span className="font-semibold">削除ではなく「無効化」</span>してください。
                    完全削除すると、その職員の過去の投稿やコメントも削除され、組織の知見が失われます。
                    「無効化」にすることで、ログインはできなくなりますが、過去の貢献は保持されます。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q4. 看護リーダーレベル（1.5-4.5）はいつ付与すればいいですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> 看護部長から<span className="font-semibold">リーダー業務の正式任命</span>があったタイミングで付与してください。
                    単なる経験年数ではなく、実際にリーダー業務を担当する職員に限定します。
                    リーダー業務終了時は通常の基本レベル（1-4）に戻します。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q5. 面談枠を急遽キャンセルしたい場合はどうすればいいですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> 「面談管理」画面から該当の面談枠を選択し、
                    <span className="font-semibold">「キャンセル」ボタン</span>をクリックしてください。
                    既に予約が入っている場合は、予約者に自動的にキャンセル通知メールが送信されます。
                    可能であれば、代替の面談枠を提案することを推奨します。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q6. 職員マスタを一括で更新する方法はありますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> はい、<span className="font-semibold">CSVインポート機能</span>があります。
                    「職員管理」画面の「一括インポート」ボタンから、
                    所定のフォーマット（テンプレートダウンロード可能）でCSVファイルをアップロードできます。
                    年度始めの大規模異動時などに便利です。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q7. 特別権限レベル（97-99）を付与できるのは誰ですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> <span className="font-semibold">人事部長（Level 16以上）</span>または
                    <span className="font-semibold">システム管理者（Level 99）</span>のみが付与できます。
                    Level 97（健康診断担当者）とLevel 98（産業医）は医療情報を扱うため、
                    付与時には必ず上長の承認を得てください。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q8. 分析ダッシュボードのデータはどのくらいの頻度で更新されますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> <span className="font-semibold">リアルタイム</span>で更新されます。
                    ただし、集計データ（月次レポートなど）は<span className="font-semibold">毎日深夜1時</span>に再計算されます。
                    最新のデータを確認したい場合は、画面の「更新」ボタンをクリックしてください。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q9. 職員から「パスワードを忘れた」と言われたらどうすればいいですか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> ログイン画面の<span className="font-semibold">「パスワードを忘れた方」</span>リンクから、
                    職員自身でパスワードリセットができます。人事部門で代わりにリセットする場合は、
                    「職員管理」画面でその職員を検索し、「パスワードリセット」ボタンをクリックしてください。
                    仮パスワードが記載されたメールが職員に送信されます。
                  </p>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Q10. システムのバックアップはどうなっていますか？</h3>
                  <p className="text-gray-700">
                    <strong className="text-purple-700">A.</strong> 職員マスタを含むすべてのデータは、
                    <span className="font-semibold">毎日深夜2時に自動バックアップ</span>されます。
                    過去30日分のバックアップが保持されます。万が一データ復旧が必要な場合は、
                    システム管理者（Level 99）に連絡してください。
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 mt-8">
                <h3 className="font-bold text-lg text-purple-800 mb-3">📞 さらにサポートが必要な場合</h3>
                <p className="text-gray-700 mb-3">
                  このガイドで解決しない場合は、以下にお問い合わせください：
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>システム管理者</strong>：内線 1234（システム操作全般）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>人事部長</strong>：内線 5678（権限設定・人事ポリシー）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span><strong>ヘルプデスク</strong>：help@voicedrive.example.com</span>
                  </li>
                </ul>
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

export default HRGuide;
