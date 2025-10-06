import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

// モード検出用（将来的に実装）
const useIdeaVoiceMode = () => {
  // TODO: 実際のモード検出ロジックを実装
  return 'agenda' as 'agenda' | 'project';
};

const UserGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'basic' | 'interview' | 'ideavoice' | 'freevoice' | 'proposal_management'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const ideaVoiceMode = useIdeaVoiceMode();

  // FAQ データ
  const faqData = [
    {
      id: 1,
      question: '初めてログインするにはどうすればいいですか？',
      answer: '人事部門から配布された「VoiceDriveログイン情報のお知らせ」に記載されているユーザーIDと初回パスワードを使用してログインしてください。',
      category: 'basic',
      keywords: ['ログイン', '初回', 'パスワード', 'ID']
    },
    {
      id: 2,
      question: '面談を予約したいのですが',
      answer: '画面左のサイドバーから「面談ステーション」をクリックし、「面談を予約する」ボタンから予約できます。',
      category: 'interview',
      keywords: ['面談', '予約', '相談']
    },
    {
      id: 3,
      question: 'アイデアを提案したい',
      answer: 'アイデアボイスハブから「議題提案書作成」を選択し、提案内容を入力してください。',
      category: 'ideavoice',
      keywords: ['提案', 'アイデア', '意見', '改善']
    },
    {
      id: 4,
      question: '自由に意見を投稿したい',
      answer: 'フリーボイスガイドから「投稿する」を選択し、自由に意見を書き込めます。',
      category: 'freevoice',
      keywords: ['投稿', '意見', '自由', 'つぶやき']
    },
    {
      id: 5,
      question: 'パスワードを変更したい',
      answer: '画面左下の「設定」→「アカウント設定」→「パスワード変更」から変更できます。',
      category: 'basic',
      keywords: ['パスワード', '変更', 'セキュリティ']
    },
    {
      id: 6,
      question: '通知が多すぎる',
      answer: '設定画面から通知の種類ごとにオン/オフを切り替えられます。',
      category: 'basic',
      keywords: ['通知', '設定', 'オフ', '非表示']
    },
    {
      id: 7,
      question: '提案に投票するには？',
      answer: 'アイデアボイスハブの「議題進捗」から、投票したい提案を選び、賛成/反対ボタンをクリックしてください。',
      category: 'ideavoice',
      keywords: ['投票', '賛成', '反対', '議題']
    },
    {
      id: 8,
      question: '面談をキャンセルしたい',
      answer: '面談ステーションの「予約一覧」から該当の面談を選び、「キャンセル」ボタンを押してください。',
      category: 'interview',
      keywords: ['面談', 'キャンセル', '予約']
    },
    {
      id: 9,
      question: '投稿管理とは何ですか？',
      answer: '主任・師長・部長など管理職の方が、職員の投稿を整理して委員会に提出するための機能です。投票データを客観的に分析し、透明性を保ちながら議題提案書を作成できます。詳しい使い方は「投稿管理ガイド」をご覧ください。',
      category: 'proposal_management',
      keywords: ['投稿管理', '管理職', '議題', '提案書', '委員会']
    },
    {
      id: 10,
      question: 'なぜ主任と師長で別々に議題提案書を作るのですか？',
      answer: '提出先の委員会が異なるためです。主任は「部署ミーティング」に、師長は「施設運営委員会」に提出します。部署レベルで解決できることは部署で完結し、施設全体で考えるべきことはより上のレベルへ上げる仕組みです。',
      category: 'proposal_management',
      keywords: ['主任', '師長', '提案書', '委員会', 'レベル']
    },
    {
      id: 11,
      question: '議題提案書を作成するにはどうすればいいですか？',
      answer: '議題モードの左サイドバーから「投稿管理」を開き、「管轄のみ」タブで担当範囲の投稿を確認します。「議題提案書を作成」ボタンを押すと、投票データやコメントから自動で提案書が生成されます。その後、補足説明を追加して提出準備完了にしてください。',
      category: 'proposal_management',
      keywords: ['提案書', '作成', '投稿管理', '自動生成']
    },
    {
      id: 12,
      question: '投票数が増えて自動昇格したら、前の提案書は無駄になりますか？',
      answer: 'いいえ、無駄ではありません。部署レベルの議論の記録として残り、上のレベルで提案書を作る際の参考資料になります。「部署では賛成だった」という事実が重要な情報となります。',
      category: 'proposal_management',
      keywords: ['昇格', '提案書', '無駄', 'スコア']
    },
    {
      id: 13,
      question: '「管轄のみ」と「全て」の違いは何ですか？',
      answer: '「管轄のみ」は、あなたが編集・提出できる議題レベルの投稿のみを表示します。「全て」は、閲覧可能な全ての投稿を表示しますが、管轄外の投稿は編集できません。普段は「管轄のみ」で自分の担当範囲を確認することをお勧めします。',
      category: 'proposal_management',
      keywords: ['管轄', '全て', '編集', '閲覧', '権限']
    }
  ];

  // 検索結果のフィルタリング
  const filteredFaq = useMemo(() => {
    if (!searchQuery.trim()) return faqData;

    const query = searchQuery.toLowerCase();
    return faqData.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">📖</span>
            VoiceDrive 使い方ガイド
          </h1>
          <p className="text-xl text-gray-300">
            50代・60代の方でも安心してご利用いただけるよう、具体例を交えてご説明します
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'search' as const, label: 'やりたいことから探す', icon: '🔍' },
              { id: 'basic' as const, label: '基本操作', icon: '🏠' },
              { id: 'interview' as const, label: '面談予約', icon: '📅' },
              { id: 'ideavoice' as const, label: 'アイデアボイス', icon: '💡' },
              { id: 'freevoice' as const, label: 'フリーボイス', icon: '💬' },
              { id: 'proposal_management' as const, label: '投稿管理（管理職向け）', icon: '🤝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
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
          {/* やりたいことから探す（FAQ検索） */}
          {activeTab === 'search' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">🔍</span>
                やりたいことから探す
              </h2>

              {/* 検索ボックス */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="例：ログイン、面談、提案、投票..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">💡 ヒント：「ログイン」「面談」「提案」などのキーワードで検索できます</p>
              </div>

              {/* FAQ リスト */}
              <div className="space-y-4">
                {filteredFaq.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">検索結果が見つかりませんでした</p>
                    <p className="text-gray-500 mt-2">別のキーワードで検索してみてください</p>
                  </div>
                ) : (
                  filteredFaq.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-600/30 transition-colors"
                      >
                        <div className="flex items-start gap-3 text-left flex-1">
                          <span className="text-2xl mt-1">❓</span>
                          <span className="text-white text-lg font-medium">{faq.question}</span>
                        </div>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-600/50">
                          <p className="text-gray-300 text-lg leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 基本操作 */}
          {activeTab === 'basic' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🏠</span>
                  基本操作
                </h2>

                {/* ログイン・アカウント設定 */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔐</span>
                      初回ログインについて
                    </h3>

                    <div className="space-y-6 text-gray-300">
                      <div>
                        <h4 className="text-xl font-semibold text-blue-300 mb-3">1. アカウントの自動作成</h4>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">✓</span>
                            <span className="text-lg">入職手続き時に<span className="font-semibold text-white">医療職員管理システム</span>に登録されると、VoiceDriveアカウントが<span className="font-semibold text-white">自動的に作成</span>されます</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">✓</span>
                            <span className="text-lg">人事部門から<span className="font-semibold text-white">「VoiceDriveログイン情報のお知らせ」</span>が配布されます</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-blue-300 mb-3">2. 初回ログイン手順</h4>
                        <ol className="space-y-3 ml-6">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <span className="text-lg pt-1">配布された書類に記載されている<span className="font-semibold text-white">「ユーザーID」</span>と<span className="font-semibold text-white">「初回パスワード」</span>を確認</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <span className="text-lg pt-1">VoiceDriveログイン画面にアクセス</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <span className="text-lg pt-1">IDとパスワードを入力してログイン</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                            <span className="text-lg pt-1">初回ログイン後、<span className="font-semibold text-white">パスワード変更画面</span>が表示されます</span>
                          </li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-blue-300 mb-3">3. プロフィール設定</h4>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">✓</span>
                            <span className="text-lg">ログイン後、<span className="font-semibold text-white">左サイドバー上部のアイコン</span>をクリック</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">✓</span>
                            <span className="text-lg">プロフィール編集画面で以下を設定できます：</span>
                          </li>
                        </ul>
                        <div className="ml-12 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                            <span className="text-white">✓ プロフィール写真</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                            <span className="text-white">✓ 自己紹介文</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                            <span className="text-white">✓ 通知設定</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                            <span className="text-white">✓ パスワード変更</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 通知の見方 */}
                  <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔔</span>
                      通知の見方
                    </h3>

                    <div className="space-y-4 text-gray-300">
                      <p className="text-lg">VoiceDriveでは、重要なお知らせや更新情報を通知でお届けします。</p>

                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-green-300 mb-3">通知の確認方法</h4>
                        <ol className="space-y-3 ml-6">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <span className="text-lg pt-1">画面左下の<span className="font-semibold text-white">「🔔 通知」</span>ボタンをクリック</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <span className="text-lg pt-1">未読の通知には<span className="font-semibold text-white">赤い丸</span>が表示されます</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <span className="text-lg pt-1">通知をクリックすると、詳細が表示されます</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-green-300 mb-3">通知の種類</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg">
                            <span className="text-2xl">📅</span>
                            <span className="text-lg"><span className="font-semibold">面談のリマインド</span> - 予定の面談の前日にお知らせ</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg">
                            <span className="text-2xl">💡</span>
                            <span className="text-lg"><span className="font-semibold">提案の更新</span> - 投票した提案が進展した時</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg">
                            <span className="text-2xl">📢</span>
                            <span className="text-lg"><span className="font-semibold">重要なお知らせ</span> - 施設全体への連絡事項</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                        <p className="text-white flex items-start gap-2">
                          <span className="text-2xl">💡</span>
                          <span className="text-lg">通知が多すぎる場合は、<span className="font-semibold">「設定」→「通知設定」</span>から種類ごとにオン/オフを切り替えられます。</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 面談予約 */}
          {activeTab === 'interview' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">📅</span>
                面談予約ガイド
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">面談予約の流れ</h3>

                  <div className="space-y-4">
                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">1</span>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">面談ステーションにアクセス</h4>
                          <p className="text-gray-300 text-lg">画面左のサイドバーから<span className="font-semibold text-white">「📅 面談ステーション」</span>をクリックします。</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">2</span>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">面談を予約するボタンをクリック</h4>
                          <p className="text-gray-300 text-lg">面談ステーションの画面で<span className="font-semibold text-white">「面談を予約する」</span>ボタンを押します。</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">3</span>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">面談内容を選択</h4>
                          <p className="text-gray-300 text-lg mb-3">相談したい内容を選びます：</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                              <span className="text-white">✓ キャリア相談</span>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                              <span className="text-white">✓ 業務の悩み</span>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                              <span className="text-white">✓ 人間関係の相談</span>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                              <span className="text-white">✓ その他</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">4</span>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">日時を選択</h4>
                          <p className="text-gray-300 text-lg">カレンダーから都合の良い日時を選びます。空いている時間帯が表示されます。</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">5</span>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">予約完了</h4>
                          <p className="text-gray-300 text-lg">確認画面で内容をチェックして「予約する」ボタンを押せば完了です。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-500/30">
                  <h4 className="text-xl font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    よくある質問
                  </h4>
                  <div className="space-y-3 text-gray-300">
                    <div>
                      <p className="font-semibold text-white mb-1">Q: 予約をキャンセルできますか？</p>
                      <p className="text-lg">A: はい。面談ステーションの「予約一覧」から該当の面談を選び、「キャンセル」ボタンを押してください。</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">Q: 急な相談でもいいですか？</p>
                      <p className="text-lg">A: はい。緊急度を「高」に設定すると、優先的に調整してもらえます。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アイデアボイス */}
          {activeTab === 'ideavoice' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-blue-400">💡</span>
                アイデアボイスガイド
                <span className="text-sm px-3 py-1 bg-blue-600 rounded-full">
                  {ideaVoiceMode === 'agenda' ? '議題モード' : 'プロジェクト化モード'}
                </span>
              </h2>

              {ideaVoiceMode === 'agenda' ? (
                // 議題モード
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-2xl font-bold text-white mb-4">議題モードとは？</h3>
                    <p className="text-gray-300 text-lg mb-4">
                      職員のアイデアや改善提案を「議題」として提出し、皆で投票して優先順位を決めるモードです。
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-white mb-3">提案する手順</h4>
                        <ol className="space-y-3 ml-6">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <span className="text-lg pt-1 text-gray-300">アイデアボイスハブから<span className="font-semibold text-white">「議題提案書作成」</span>をクリック</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <span className="text-lg pt-1 text-gray-300">提案タイトルと内容を入力（例：「休憩室の椅子を増やしてほしい」）</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <span className="text-lg pt-1 text-gray-300">カテゴリを選択（設備改善、業務改善など）</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                            <span className="text-lg pt-1 text-gray-300">「提案する」ボタンをクリックして完了</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-white mb-3">投票する手順</h4>
                        <ol className="space-y-3 ml-6">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <span className="text-lg pt-1 text-gray-300">アイデアボイスハブの<span className="font-semibold text-white">「議題進捗」</span>をクリック</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <span className="text-lg pt-1 text-gray-300">投票したい議題を選ぶ</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <span className="text-lg pt-1 text-gray-300"><span className="font-semibold text-white">「賛成」</span>または<span className="font-semibold text-white">「反対」</span>ボタンをクリック</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/30">
                    <h4 className="text-xl font-semibold text-green-300 mb-3 flex items-center gap-2">
                      <span>✨</span>
                      議題モードのポイント
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-lg">どんな小さなアイデアでも提案できます</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-lg">匿名での提案も可能です</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-lg">投票結果で優先度が決まります</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                // プロジェクト化モード
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                    <h3 className="text-2xl font-bold text-white mb-4">プロジェクト化モードとは？</h3>
                    <p className="text-gray-300 text-lg mb-4">
                      投票で決定した議題を実際のプロジェクトとして推進し、進捗を管理するモードです。
                    </p>

                    <div className="space-y-4 mt-6">
                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-white mb-3">プロジェクトの進め方</h4>
                        <ol className="space-y-3 ml-6">
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <span className="text-lg pt-1 text-gray-300">採用された議題が自動的にプロジェクト化されます</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <span className="text-lg pt-1 text-gray-300">プロジェクトメンバーが招集されます</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <span className="text-lg pt-1 text-gray-300">具体的なタスクに分解して実行します</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                            <span className="text-lg pt-1 text-gray-300">進捗をリアルタイムで共有できます</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                        <h4 className="text-xl font-semibold text-white mb-3">進捗の確認方法</h4>
                        <p className="text-gray-300 text-lg mb-3">アイデアボイスハブから「議題進捗」を選ぶと、プロジェクト化された議題の進捗が確認できます。</p>
                        <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                          <p className="text-white flex items-start gap-2">
                            <span className="text-2xl">📊</span>
                            <span className="text-lg">進捗率、担当者、期限などが一目で分かります</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* フリーボイス */}
          {activeTab === 'freevoice' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-green-400">💬</span>
                フリーボイスガイド
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-2xl font-bold text-white mb-4">フリーボイスとは？</h3>
                  <p className="text-gray-300 text-lg mb-4">
                    日々の気づきや感想を気軽に投稿できる場所です。SNSのように、自由につぶやくことができます。
                  </p>

                  <div className="space-y-4 mt-6">
                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <h4 className="text-xl font-semibold text-white mb-3">投稿する手順</h4>
                      <ol className="space-y-3 ml-6">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                          <span className="text-lg pt-1 text-gray-300">画面上部の<span className="font-semibold text-white">「投稿する」</span>ボタンをクリック</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                          <span className="text-lg pt-1 text-gray-300">テキストボックスに自由に書き込む</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                          <span className="text-lg pt-1 text-gray-300">必要に応じて画像を添付（任意）</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                          <span className="text-lg pt-1 text-gray-300"><span className="font-semibold text-white">「投稿」</span>ボタンをクリックして完了</span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                      <h4 className="text-xl font-semibold text-white mb-3">投稿例</h4>
                      <div className="space-y-3">
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                          <p className="text-gray-300 text-lg">「今日の患者さんとの会話で嬉しいことがありました😊」</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                          <p className="text-gray-300 text-lg">「新しい機器の使い方、もう少し研修があるといいな」</p>
                        </div>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                          <p className="text-gray-300 text-lg">「休憩室のコーヒーマシン、ありがたいです☕」</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
                  <h4 className="text-xl font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    フリーボイスのポイント
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span className="text-lg">気軽に、短い文章でOK</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span className="text-lg">他の人の投稿に「いいね」やコメントができます</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span className="text-lg">ポジティブな内容も、改善提案も、どちらも歓迎</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span className="text-lg">職場の雰囲気づくりに役立ちます</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-500/30">
                  <h4 className="text-xl font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    投稿時の注意点
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span className="text-lg">個人情報や患者情報は書かないでください</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span className="text-lg">他の職員への誹謗中傷はご遠慮ください</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span className="text-lg">建設的で前向きな投稿を心がけましょう</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 投稿管理（管理職向け） */}
          {activeTab === 'proposal_management' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">🤝</span>
                投稿管理（管理職向け）
              </h2>

              <div className="mb-6 bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                <p className="text-xl text-gray-300 leading-relaxed">
                  主任・師長・部長など管理職の方が、職員の投稿を整理して委員会に提出するための機能です。<br />
                  投票データを客観的に分析し、透明性を保ちながら議題提案書を作成できます。
                </p>
              </div>

              {/* FAQ */}
              <div className="space-y-4">
                {faqData.filter(faq => faq.category === 'proposal_management').map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-700/50 rounded-xl overflow-hidden border border-gray-600/50"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-600/50 transition-colors"
                    >
                      <h3 className="text-xl font-semibold text-white pr-4">{faq.question}</h3>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-6 h-6 text-blue-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-lg text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 詳しいガイドへのリンク */}
              <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📚</span>
                  さらに詳しく知りたい方へ
                </h3>
                <p className="text-lg text-gray-300 mb-4">
                  画面操作の手順や具体例を交えた詳しいガイドをご用意しています。
                </p>
                <button
                  onClick={() => window.location.href = '/proposal-management-guide'}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span>📖</span>
                  投稿管理の詳しい使い方ガイドを見る
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🤝</span>
            困ったときは
          </h3>
          <div className="space-y-3 text-gray-300">
            <p className="text-lg">このガイドで解決しない場合は、以下の方法でサポートを受けられます：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span>📞</span>
                  人事部門に連絡
                </h4>
                <p className="text-lg">内線: 1234</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span>💬</span>
                  直属の上司に相談
                </h4>
                <p className="text-lg">気軽にお声がけください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default UserGuide;
