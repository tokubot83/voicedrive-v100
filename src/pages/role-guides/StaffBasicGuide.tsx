/**
 * 一般職員向けガイド（Level 1-4.5）
 * 50代・60代の方でも安心してご利用いただけるよう、
 * 基本的な使い方をシンプルに説明
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFooter } from '../../components/layout/MobileFooter';
import { DesktopFooter } from '../../components/layout/DesktopFooter';
import { ChevronRight, Home, MessageSquare, ThumbsUp, Calendar, Bell, Settings } from 'lucide-react';

const StaffBasicGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'first-time' | 'daily' | 'features' | 'tips' | 'faq'>('first-time');

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">👋</span>
            VoiceDriveへようこそ！
          </h1>
          <p className="text-xl text-gray-300">
            職員の皆さんの声を大切にするシステムです。基本的な使い方を一緒に学びましょう
          </p>
          <div className="mt-4 bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
            <p className="text-white text-lg">
              <strong>💡 このガイドの対象：</strong>一般職員の皆さん（新人・若手・中堅・ベテラン）
            </p>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 'first-time' as const, label: '初めての方へ', icon: '🌟' },
              { id: 'daily' as const, label: '日常の使い方', icon: '📱' },
              { id: 'features' as const, label: 'できること', icon: '✨' },
              { id: 'tips' as const, label: 'コツとヒント', icon: '💡' },
              { id: 'faq' as const, label: 'よくある質問', icon: '❓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <span className="block text-2xl mb-1">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="space-y-8">
          {/* 初めての方へ */}
          {activeTab === 'first-time' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🌟</span>
                  まずはここから！VoiceDrive の3つのポイント
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">💬 自由に意見を投稿できる</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          日々の業務で感じる改善点やアイデアを、いつでも投稿できます。
                          <span className="text-blue-400 font-semibold">匿名でも投稿可能</span>なので、
                          上司や同僚を気にせず本音で意見を伝えられます。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 rounded-xl p-6 border border-cyan-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">👍 仲間の提案に投票できる</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          他の職員の提案を見て、「いいね！」と思ったら<span className="text-cyan-400 font-semibold">賛成票</span>を。
                          賛成票が集まった提案は、上のレベルで検討されます。
                          あなたの1票が職場を変える力になります！
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-900/30 to-green-900/30 rounded-xl p-6 border border-teal-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">📅 上司との面談を予約できる</h3>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          キャリア相談や業務の悩みなど、<span className="text-teal-400 font-semibold">いつでも面談を予約</span>できます。
                          スマホから3タップで予約完了。あなたの成長をサポートします。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 初回ログイン手順 */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">🔐</span>
                  初めてログインする方へ
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-xl font-semibold text-white mb-4">1. ログイン情報を確認</h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      人事部門から配布された<span className="font-semibold text-white">「VoiceDriveログイン情報のお知らせ」</span>を
                      ご確認ください。以下の情報が記載されています：
                    </p>
                    <ul className="mt-3 space-y-2 ml-6">
                      <li className="text-gray-300 flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-lg">ユーザーID（職員番号）</span>
                      </li>
                      <li className="text-gray-300 flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-lg">初回パスワード</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-xl font-semibold text-white mb-4">2. ログインする</h3>
                    <p className="text-lg text-gray-300">
                      VoiceDriveのログイン画面で、IDとパスワードを入力してログインします。
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-xl font-semibold text-white mb-4">3. パスワードを変更する</h3>
                    <p className="text-lg text-gray-300 mb-3">
                      初回ログイン後、セキュリティのため<span className="font-semibold text-white">パスワード変更画面</span>が表示されます。
                      覚えやすく、他人に推測されにくいパスワードに変更してください。
                    </p>
                    <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm">
                        <strong>💡 パスワードのヒント：</strong>
                        8文字以上、英数字を組み合わせると安全です
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-semibold text-white mb-4">4. プロフィールを設定（任意）</h3>
                    <p className="text-lg text-gray-300 mb-3">
                      左サイドバー上部のアイコンをクリックして、プロフィール写真や自己紹介を設定できます。
                      <span className="text-blue-400 font-semibold">設定は任意</span>ですが、
                      設定すると他の職員とのコミュニケーションがスムーズになります。
                    </p>
                  </div>
                </div>
              </div>

              {/* 次のステップ */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">✨ 準備完了！次は何をする？</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('daily')}
                    className="bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 transition-all text-left"
                  >
                    <div className="text-4xl mb-3">📱</div>
                    <h4 className="text-lg font-semibold text-white mb-2">日常の使い方を見る</h4>
                    <p className="text-sm text-gray-400">毎日の操作方法を確認</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('features')}
                    className="bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 transition-all text-left"
                  >
                    <div className="text-4xl mb-3">✨</div>
                    <h4 className="text-lg font-semibold text-white mb-2">できることを見る</h4>
                    <p className="text-sm text-gray-400">全機能を一覧で確認</p>
                  </button>
                  <button
                    onClick={() => navigate('/user-guide')}
                    className="bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 transition-all text-left"
                  >
                    <div className="text-4xl mb-3">🔍</div>
                    <h4 className="text-lg font-semibold text-white mb-2">FAQで検索する</h4>
                    <p className="text-sm text-gray-400">困ったときはこちら</p>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 日常の使い方 */}
          {activeTab === 'daily' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">📱</span>
                  毎日の使い方（3つの基本操作）
                </h2>

                {/* 投稿する */}
                <div className="mb-12 bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-10 h-10 text-green-400" />
                    <h3 className="text-2xl font-bold text-white">1. 意見を投稿する</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ1: フリーボイスを開く</h4>
                      <p className="text-gray-300 text-lg">
                        画面下部のメニューバーまたは左サイドバーから<span className="font-semibold text-white">「フリーボイス」</span>をタップ
                      </p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-green-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ2: 投稿ボタンをタップ</h4>
                      <p className="text-gray-300 text-lg">
                        画面上部の<span className="font-semibold text-white">「投稿する」</span>ボタンをタップ
                      </p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-green-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ3: 内容を入力</h4>
                      <ul className="space-y-2 text-gray-300 text-lg ml-4">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          カテゴリーを選択（業務改善、職場環境など）
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          タイトルと本文を入力
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          匿名にするかどうかを選択
                        </li>
                      </ul>
                    </div>

                    <ChevronRight className="w-6 h-6 text-green-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ4: 投稿ボタンを押す</h4>
                      <p className="text-gray-300 text-lg">
                        内容を確認したら<span className="font-semibold text-white">「投稿」</span>ボタンをタップして完了！
                      </p>
                    </div>

                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 mt-4">
                      <p className="text-blue-300 text-lg">
                        <strong>💡 詳しく知りたい方は：</strong>
                        <button
                          onClick={() => navigate('/free-voice-guide')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline"
                        >
                          フリーボイスガイドへ
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 投票する */}
                <div className="mb-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <ThumbsUp className="w-10 h-10 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">2. 提案に投票する</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ1: アイデアボイスハブを開く</h4>
                      <p className="text-gray-300 text-lg">
                        左サイドバーから<span className="font-semibold text-white">「アイデアボイスハブ」</span>をクリック
                      </p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-blue-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ2: 提案を探す</h4>
                      <p className="text-gray-300 text-lg mb-3">
                        「議題進捗」タブから、投票したい提案を探します
                      </p>
                      <div className="bg-purple-900/20 rounded p-3 border border-purple-500/30">
                        <p className="text-purple-300 text-sm">
                          💡 投票期限が表示されているので、期限内に投票しましょう
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-blue-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ3: 賛成・反対を選ぶ</h4>
                      <p className="text-gray-300 text-lg mb-3">
                        提案の内容を読んで、<span className="font-semibold text-white">「賛成」</span>または
                        <span className="font-semibold text-white">「反対」</span>ボタンをクリック
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                          <p className="text-green-400 font-semibold">👍 賛成</p>
                          <p className="text-gray-300 text-sm">この提案を支持します</p>
                        </div>
                        <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                          <p className="text-red-400 font-semibold">👎 反対</p>
                          <p className="text-gray-300 text-sm">この提案に反対です</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 mt-4">
                      <p className="text-blue-300 text-lg">
                        <strong>💡 詳しく知りたい方は：</strong>
                        <button
                          onClick={() => navigate('/staff-voting-guide')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline"
                        >
                          投票システムガイドへ
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 面談を予約する */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-10 h-10 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">3. 上司との面談を予約する</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ1: 面談ステーションを開く</h4>
                      <p className="text-gray-300 text-lg">
                        左サイドバーから<span className="font-semibold text-white">「📅 面談ステーション」</span>をクリック
                      </p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-purple-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ2: 予約ボタンをクリック</h4>
                      <p className="text-gray-300 text-lg">
                        <span className="font-semibold text-white">「面談を予約する」</span>ボタンをクリック
                      </p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-purple-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ3: 面談内容を選択</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                          <span className="text-white">✓ キャリア相談</span>
                        </div>
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                          <span className="text-white">✓ 業務の悩み</span>
                        </div>
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                          <span className="text-white">✓ 人間関係の相談</span>
                        </div>
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                          <span className="text-white">✓ その他</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-purple-400 mx-auto" />

                    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white mb-3">ステップ4: 日時を選ぶ</h4>
                      <p className="text-gray-300 text-lg">
                        カレンダーから都合の良い日時を選んで、予約完了！
                      </p>
                    </div>

                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 mt-4">
                      <p className="text-blue-300 text-lg">
                        <strong>💡 詳しく知りたい方は：</strong>
                        <button
                          onClick={() => navigate('/interview-guide')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline"
                        >
                          面談予約ガイドへ
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* できること */}
          {activeTab === 'features' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">✨</span>
                VoiceDriveでできること
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <MessageSquare className="w-8 h-8" />,
                    title: 'フリーボイス',
                    description: '日々の気づきや提案を自由に投稿',
                    color: 'green',
                    link: '/free-voice-guide'
                  },
                  {
                    icon: <ThumbsUp className="w-8 h-8" />,
                    title: 'アイデアボイス',
                    description: '改善提案を投稿し、皆で投票',
                    color: 'blue',
                    link: '/idea-voice-guide'
                  },
                  {
                    icon: <Calendar className="w-8 h-8" />,
                    title: '面談予約',
                    description: '上司との1on1面談を簡単予約',
                    color: 'purple',
                    link: '/interview-guide'
                  },
                  {
                    icon: <Bell className="w-8 h-8" />,
                    title: '通知',
                    description: '重要な更新をリアルタイムで受信',
                    color: 'orange',
                    link: null
                  },
                  {
                    icon: <Settings className="w-8 h-8" />,
                    title: 'プロフィール設定',
                    description: 'アイコンや自己紹介を編集',
                    color: 'gray',
                    link: null
                  },
                  {
                    icon: <Home className="w-8 h-8" />,
                    title: 'ダッシュボード',
                    description: '最新の投稿や議題を一覧表示',
                    color: 'cyan',
                    link: null
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`bg-${feature.color}-900/20 rounded-xl p-6 border border-${feature.color}-500/30 hover:border-${feature.color}-500/50 transition-all cursor-pointer`}
                    onClick={() => feature.link && navigate(feature.link)}
                  >
                    <div className={`text-${feature.color}-400 mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                    {feature.link && (
                      <div className="mt-4">
                        <span className="text-sm text-blue-400 hover:text-blue-300">
                          詳しく見る →
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* コツとヒント */}
          {activeTab === 'tips' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">💡</span>
                もっと便利に使うコツ
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: '通知をオンにしておく',
                    description: '投票期限や面談リマインダーを逃さないよう、通知設定をオンにしておきましょう。',
                    tip: '設定 → 通知設定 から、必要な通知だけをオンにできます'
                  },
                  {
                    title: '定期的にチェックする',
                    description: '週に2-3回、新しい投稿や議題をチェックすると、職場の動きが分かります。',
                    tip: '朝の休憩時間や昼休みに5分だけチェックする習慣をつけると良いでしょう'
                  },
                  {
                    title: '具体的に投稿する',
                    description: '「○○が不便」だけでなく、「○○を△△にしたら便利」と具体案を書くと、実現しやすくなります。',
                    tip: '数字やデータを入れると、さらに説得力が増します'
                  },
                  {
                    title: '積極的に投票する',
                    description: '自分の投稿だけでなく、他の人の良い提案にも投票しましょう。皆で支え合うことが大切です。',
                    tip: 'あなたの1票が、誰かの提案を後押しします'
                  },
                  {
                    title: '匿名機能を活用する',
                    description: '言いにくいことは匿名で投稿してOK。あなたの本音が職場改善につながります。',
                    tip: '匿名でも、建設的で前向きな表現を心がけましょう'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-blue-400">✓</span>
                      {item.title}
                    </h3>
                    <p className="text-lg text-gray-300 mb-3">{item.description}</p>
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                      <p className="text-sm text-blue-300">
                        <strong>💡 ヒント：</strong> {item.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* よくある質問 */}
          {activeTab === 'faq' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">❓</span>
                よくある質問
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: '匿名で投稿しても本当にバレませんか？',
                    a: 'はい、完全に匿名です。IPアドレスや端末情報も記録されないので、管理者でも投稿者を特定できません。安心してご利用ください。'
                  },
                  {
                    q: '投稿した内容は評価に影響しますか？',
                    a: 'いいえ、影響しません。むしろ、積極的に改善提案をする姿勢は高く評価されます。VoiceDriveは成長を支援するためのツールです。'
                  },
                  {
                    q: '投票しなくても大丈夫ですか？',
                    a: 'はい、投票は任意です。ただし、あなたの1票が職場改善につながるので、興味のある提案には投票することをお勧めします。'
                  },
                  {
                    q: 'パスワードを忘れてしまいました',
                    a: 'ログイン画面の「パスワードを忘れた方」から再設定できます。それでも困った場合は、人事部門にご連絡ください。'
                  },
                  {
                    q: '面談をキャンセルしたい',
                    a: '面談ステーションの「予約一覧」から該当の面談を選び、「キャンセル」ボタンを押してください。前日までにキャンセルすることをお勧めします。'
                  },
                  {
                    q: 'スマホとパソコン、どちらで使えますか？',
                    a: '両方で使えます！スマホアプリ、タブレット、パソコンのブラウザ、すべてに対応しています。'
                  },
                  {
                    q: 'もっと詳しく知りたい',
                    a: '総合ガイドでFAQ検索ができます。キーワードで検索すると、関連する質問と回答が見つかります。'
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-700/50">
                      <h3 className="text-lg font-semibold text-white flex items-start gap-2">
                        <span className="text-blue-400 flex-shrink-0">Q.</span>
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

              <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-3">ここに載っていない質問がありますか？</h3>
                <p className="text-gray-300 mb-4">
                  総合ガイドのFAQ検索機能をご利用ください。キーワード検索で、より詳しい回答が見つかります。
                </p>
                <button
                  onClick={() => navigate('/user-guide')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  FAQ検索ページへ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            さあ、VoiceDriveを使ってみましょう！
          </h2>
          <p className="text-xl text-white/90 mb-6">
            あなたの声が、より良い職場を作ります
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              ホームに戻る
            </button>
            <button
              onClick={() => navigate('/user-guide')}
              className="px-8 py-4 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold text-lg transition-all duration-300"
            >
              総合ガイドを見る
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

export default StaffBasicGuide;
