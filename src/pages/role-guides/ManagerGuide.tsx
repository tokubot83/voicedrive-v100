/**
 * 管理職向けガイド（Level 5-11）
 * 副主任・主任・副師長・師長・副部長・部長・事務長向け
 * 投稿管理、チーム管理、意思決定支援の総合ガイド
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';
import { Users, FileText, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react';

const ManagerGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'post-management' | 'team' | 'decision' | 'authority' | 'faq'>('overview');

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 backdrop-blur-xl border border-purple-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">🤝</span>
            管理職向けガイド
          </h1>
          <p className="text-xl text-gray-300">
            チームを率いる皆さんへ：VoiceDriveを活用した効果的なチーム運営
          </p>
          <div className="mt-4 bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
            <p className="text-white text-lg">
              <strong>💡 このガイドの対象：</strong>副主任・主任・副師長・師長・副部長・部長・事務長（Level 5-11）
            </p>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview' as const, label: '概要', icon: '📊' },
              { id: 'post-management' as const, label: '投稿管理', icon: '📝' },
              { id: 'team' as const, label: 'チーム管理', icon: '👥' },
              { id: 'decision' as const, label: '意思決定', icon: '⚖️' },
              { id: 'authority' as const, label: '権限と責任', icon: '🔑' },
              { id: 'faq' as const, label: 'よくある質問', icon: '❓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="space-y-8">
          {/* 概要 */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📊</span>
                  管理職として使える主な機能
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-8 h-8 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">投稿管理</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">•</span>
                        職員の投稿を確認・分析
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">•</span>
                        議題提案書の自動生成
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">•</span>
                        投票データの客観的分析
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">•</span>
                        委員会への提出準備
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-8 h-8 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">チーム管理</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        部下の面談設定・管理
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        チームメンバーの状況把握
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        エンゲージメント分析
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-400">•</span>
                        パフォーマンスモニタリング
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <h3 className="text-xl font-bold text-white">意思決定支援</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        投稿の承認・却下判断
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        レベルアップの決定
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        投票期限の管理
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        優先順位の設定
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-orange-400" />
                      <h3 className="text-xl font-bold text-white">コンプライアンス</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">•</span>
                        コンプライアンス報告の確認
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">•</span>
                        適切な対応と記録
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">•</span>
                        上位レベルへのエスカレーション
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-orange-400">•</span>
                        職員の保護と支援
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 役職別の権限レベル */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🔑</span>
                  役職別の権限レベル
                </h2>

                <div className="space-y-4">
                  {[
                    { level: 'Level 5', role: '副主任', scope: '担当チーム', responsibilities: 'チーム内の投稿管理、メンバーサポート' },
                    { level: 'Level 6', role: '主任', scope: '部署', responsibilities: '部署レベルの投稿管理、議題提案書作成（部署ミーティング提出）' },
                    { level: 'Level 7', role: '副師長・副科長', scope: '複数部署', responsibilities: '部門横断的な投稿管理、調整業務' },
                    { level: 'Level 8', role: '師長・科長・課長', scope: '部門', responsibilities: '施設レベルの議題提案書作成、委員会提出' },
                    { level: 'Level 9', role: '副部長', scope: '複数部門', responsibilities: '部門間調整、重要議題の審議' },
                    { level: 'Level 10', role: '部長・医局長', scope: '全部門', responsibilities: '法人レベルの議題審議、経営判断' },
                    { level: 'Level 11', role: '事務長', scope: '施設全体', responsibilities: '施設運営全般の統括、理事会報告' }
                  ].map((item, index) => (
                    <div key={index} className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-white">{item.level}</span>
                          <span className="text-xl text-purple-400 ml-3">{item.role}</span>
                        </div>
                        <span className="text-sm text-gray-400">管轄範囲: {item.scope}</span>
                      </div>
                      <p className="text-gray-300">{item.responsibilities}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 投稿管理 */}
          {activeTab === 'post-management' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📝</span>
                  投稿管理の使い方
                </h2>

                <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                  <p className="text-lg text-white leading-relaxed">
                    投稿管理機能を使って、職員の声を整理し、委員会に提出する議題提案書を作成します。
                    <span className="text-blue-400 font-semibold">投票データを客観的に分析</span>し、
                    透明性を保ちながら組織改善につなげることができます。
                  </p>
                </div>

                {/* 基本的な流れ */}
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">1</span>
                      議題モードに切り替える
                    </h3>
                    <p className="text-lg text-gray-300 ml-13">
                      画面右上のモード切替で<span className="font-semibold text-white">「議題モード」</span>を選択します
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">2</span>
                      投稿管理を開く
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      左サイドバーの<span className="font-semibold text-white">「投稿管理」</span>をクリックします
                    </p>
                    <div className="ml-13 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                      <p className="text-blue-300 text-sm">
                        💡 管理職のみに表示されるメニューです
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">3</span>
                      「管轄のみ」タブで担当範囲を確認
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      あなたが編集・提出できる投稿だけが表示されます
                    </p>
                    <div className="ml-13 space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>「管轄のみ」: 編集可能な投稿（自分の担当範囲）</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span>「全て」: 閲覧のみ可能（全投稿）</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">4</span>
                      投稿ストーリー（タイムライン）で経緯を確認
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      投稿がどのように育ってきたかを時系列で確認できます：
                    </p>
                    <ul className="ml-13 space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        投稿作成日時
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        職員の投票数の推移
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        レベルアップのタイミング
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        コメント追加
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        投票期限
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">5</span>
                      議題提案書を自動生成
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      <span className="font-semibold text-white">「議題提案書を作成」</span>ボタンをクリックすると、
                      システムが投票データやコメントから自動で提案書を生成します
                    </p>
                    <div className="ml-13 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                      <p className="text-green-300 text-sm">
                        ✨ 自動生成された内容を確認し、現場の実情や追加の背景情報を補足してください
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">6</span>
                      補足説明を追加
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      管理職の視点から、以下の情報を追加します：
                    </p>
                    <ul className="ml-13 space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        なぜこの提案が重要なのか
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        現場ではどう受け止められているか
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        実現可能性の見込み
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <span className="text-purple-400">•</span>
                        他部署への影響
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">7</span>
                      提出準備完了にする
                    </h3>
                    <p className="text-lg text-gray-300 ml-13 mb-3">
                      内容を確認したら<span className="font-semibold text-white">「提出準備完了としてマーク」</span>ボタンをクリック
                    </p>
                    <div className="ml-13 bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ 「提出準備完了」は準備ができたという意味で、実際の委員会提出にはさらに承認プロセスがあります
                      </p>
                    </div>
                  </div>
                </div>

                {/* 詳細ガイドへのリンク */}
                <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-3">📚 さらに詳しく知りたい方へ</h3>
                  <p className="text-gray-300 mb-4">
                    物語形式で具体例を交えた詳しいガイドをご用意しています
                  </p>
                  <button
                    onClick={() => navigate('/proposal-management-guide')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    投稿管理の詳しい使い方ガイドを見る
                  </button>
                </div>
              </div>
            </>
          )}

          {/* チーム管理 */}
          {activeTab === 'team' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">👥</span>
                チーム管理機能
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">部下の面談管理</h3>
                  <p className="text-lg text-gray-300 mb-4">
                    チームメンバーとの1on1面談を効率的に管理できます
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      定期面談のスケジュール設定
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      面談履歴の確認
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      メンバーからの面談リクエスト対応
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">エンゲージメント分析</h3>
                  <p className="text-lg text-gray-300 mb-4">
                    チームメンバーの投稿・投票活動を分析し、エンゲージメントを把握
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      投稿頻度の確認
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      投票参加率のモニタリング
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      コメント活動の分析
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-500/30">
                  <p className="text-yellow-300 text-lg">
                    <strong>💡 ヒント：</strong>
                    エンゲージメントが低いメンバーには、個別面談でフォローアップすることをお勧めします
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 意思決定 */}
          {activeTab === 'decision' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-green-400">⚖️</span>
                意思決定のガイドライン
              </h2>

              <div className="space-y-6">
                {/* 投票期限の仕組み */}
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">⏰ 投票期限の重要な仕組み</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">期限内は却下できません</h4>
                      <p className="text-gray-300 mb-3">
                        これは<span className="text-yellow-400 font-semibold">公平性を確保するための重要な仕組み</span>です。
                        もし期限内に管理職が却下できると、職員の投票機会が奪われてしまいます。
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-center gap-2 text-gray-300">
                          <span className="text-yellow-400">•</span>
                          期限内は職員の投票を優先
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                          <span className="text-yellow-400">•</span>
                          期限後に投票結果を見て管理職が判断
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                          <span className="text-yellow-400">•</span>
                          レベルアップの承認は期限内でも可能
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">各レベルの投票期限</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                          <p className="text-white font-semibold">検討中: 14日間</p>
                        </div>
                        <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                          <p className="text-white font-semibold">部署議題: 30日間</p>
                        </div>
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                          <p className="text-white font-semibold">施設議題: 60日間</p>
                        </div>
                        <div className="bg-pink-900/20 p-3 rounded border border-pink-500/30">
                          <p className="text-white font-semibold">法人議題: 90日間</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 期限終了後の対応 */}
                <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">✅ 投票期限終了後の対応</h3>
                  <p className="text-lg text-gray-300 mb-4">
                    期限終了後、画面に<span className="text-green-400 font-semibold">「次にすべきこと」</span>が表示されます。
                    投票結果を確認して、以下のいずれかを選択してください：
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="text-green-400">✅</span>
                        承認してレベルアップ
                      </h4>
                      <p className="text-sm text-gray-400">より上のレベルで検討すべき重要な提案</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="text-red-400">❌</span>
                        却下する
                      </h4>
                      <p className="text-sm text-gray-400">実現困難、時期尚早などの理由で却下</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="text-yellow-400">⏸️</span>
                        保留する
                      </h4>
                      <p className="text-sm text-gray-400">追加情報が必要、検討継続</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="text-blue-400">🏥</span>
                        部署事項に変更
                      </h4>
                      <p className="text-sm text-gray-400">部署レベルで対応可能な内容</p>
                    </div>
                  </div>
                </div>

                {/* 判断のヒント */}
                <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
                  <h4 className="text-xl font-semibold text-blue-300 mb-4">💡 判断のヒント</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>投稿ストーリー（タイムライン）で経緯を確認すると、判断の参考になります</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>支持率70%以上、建設的なコメントが多い場合は議題化を検討</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>反対意見が多い場合でも、建設的な議論がなされているなら議題化を検討</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>部署レベルで対応できることは、レベルを下げて部署事項に変更</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 権限と責任 */}
          {activeTab === 'authority' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-orange-400">🔑</span>
                権限と責任
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">管理職としての責任</h3>
                  <ul className="space-y-3 text-gray-300 text-lg">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">1.</span>
                      <span><strong className="text-white">職員の声を公平に扱う：</strong>特定の意見を恣意的に排除しない</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">2.</span>
                      <span><strong className="text-white">透明性を確保する：</strong>判断理由を明確に記録・共有する</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">3.</span>
                      <span><strong className="text-white">タイムリーに対応する：</strong>投票期限内に適切な判断を行う</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">4.</span>
                      <span><strong className="text-white">職員をサポートする：</strong>提案者のフォローアップとフィードバック</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                  <h3 className="text-2xl font-bold text-white mb-4">できることとできないこと</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 mb-3">✅ できること</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          投稿の確認と分析
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          議題提案書の作成
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          期限後の承認・却下判断
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          レベルアップの承認（期限内でも可）
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          補足説明の追加
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-400 mb-3">❌ できないこと</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span>
                          投票期限内の却下
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span>
                          投稿内容の改ざん
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span>
                          匿名投稿者の特定
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span>
                          管轄外の投稿の編集
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-red-400">✗</span>
                          投票結果の操作
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">❓</span>
                よくある質問
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: 'なぜ投票期限内は却下できないのですか？',
                    a: 'これは公平性を確保するための重要な仕組みです。もし期限内に管理職が却下できると、職員の投票機会が奪われてしまいます。期限内は職員の投票を優先し、期限後に投票結果を見て管理職が判断します。レベルアップの承認は期限内でも可能です。'
                  },
                  {
                    q: 'システムが自動で提案書を作るなら、私は何をすればいいのですか？',
                    a: 'システムは投票データやコメントを整理しますが、現場の実情や追加の背景情報は管理職の方にしかわかりません。「なぜこの提案が重要なのか」「現場ではどう受け止められているか」といった補足説明を追加することで、委員会での審議がスムーズになります。'
                  },
                  {
                    q: '投票数が増えて自動昇格したら、前の提案書は無駄になりますか？',
                    a: 'いいえ、無駄ではありません。部署レベルの議論の記録として残り、上のレベルで提案書を作る際の参考資料になります。「部署では賛成だった」という事実が重要な情報となります。'
                  },
                  {
                    q: '反対意見が多い投稿も議題提案書を作るべきですか？',
                    a: '反対意見が多い場合でも、建設的な議論がなされているなら議題化を検討する価値があります。むしろ、賛否が分かれている問題こそ、委員会でしっかり議論すべきテーマです。ただし、誹謗中傷が含まれる場合は慎重に判断してください。'
                  },
                  {
                    q: '他の管理職と意見が異なる場合、どうすればいいですか？',
                    a: '議題提案書には透明性ログがあり、誰がいつ何を編集したか記録されます。異なる視点があること自体は健全です。それぞれの立場から補足説明を追加し、最終的には委員会で判断してもらうのが良いでしょう。'
                  },
                  {
                    q: '部下から直接相談を受けた内容を、VoiceDriveに投稿させるべきですか？',
                    a: '部下本人が投稿したいと思う内容であれば、VoiceDriveへの投稿を勧めることは良いことです。ただし、プライベートな相談や個人的な悩みは、1on1面談で対応することをお勧めします。投稿を強制することは避けてください。'
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-700/50">
                      <h3 className="text-lg font-semibold text-white flex items-start gap-2">
                        <span className="text-purple-400 flex-shrink-0">Q.</span>
                        <span>{faq.q}</span>
                      </h3>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 flex-shrink-0 font-semibold">A.</span>
                        <span>{faq.a}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            VoiceDriveで、より良いチームマネジメントを
          </h2>
          <p className="text-xl text-white/90 mb-6">
            職員の声を活かし、組織を成長させましょう
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              ホームに戻る
            </button>
            <button
              onClick={() => navigate('/proposal-management-guide')}
              className="px-8 py-4 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold text-lg transition-all duration-300"
            >
              投稿管理の詳細ガイドを見る
            </button>
          </div>
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default ManagerGuide;
