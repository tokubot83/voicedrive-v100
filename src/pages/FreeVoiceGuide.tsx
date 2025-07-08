import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const FreeVoiceGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'how' | 'examples' | 'tips' | 'privacy' | 'impact'>('overview');

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set([
      'header', 'intro', 'benefits', 'types', 'process', 'anonymous', 'summary',
      'how-header', 'step1', 'step2', 'step3', 'step4', 'step5', 'how-cta',
      'examples-header', 'example1', 'example2', 'example3', 'example4', 'example5',
      'tips-header', 'tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tips-footer',
      'privacy-header', 'privacy1', 'privacy2', 'privacy3', 'privacy4', 'privacy-summary',
      'impact-header', 'impact1', 'impact2', 'impact3', 'impact4', 'impact-stats'
    ]));
    
    // スクロールアニメーションの監視
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section') || '';
            setVisibleSections(prev => new Set(prev).add(sectionId));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className={`bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-2xl p-8 backdrop-blur-xl border border-green-500/20 mb-8 animate-section transition-all duration-1000 ${
          visibleSections.has('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="header">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">💬</span>
            フリーボイスで職場をもっと良くしよう！
          </h1>
          <p className="text-xl text-gray-300">
            あなたの声が組織を変える第一歩に
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview' as const, label: 'フリーボイスとは', icon: '📝' },
              { id: 'how' as const, label: '投稿の流れ', icon: '📤' },
              { id: 'examples' as const, label: '投稿例', icon: '💡' },
              { id: 'tips' as const, label: 'コツと活用法', icon: '🎯' },
              { id: 'privacy' as const, label: 'プライバシー保護', icon: '🔒' },
              { id: 'impact' as const, label: '改善実績', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg transform scale-105'
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
          {/* フリーボイスとは */}
          {activeTab === 'overview' && (
            <>
              {/* イントロダクション */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="intro">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">🌟</span>
                  フリーボイスってなに？
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg leading-relaxed">
                    フリーボイスは、職員の皆さんが<span className="text-green-400 font-semibold">自由に意見や提案を投稿できる</span>VoiceDriveの中核機能です。
                    日々の業務で感じる改善点、新しいアイデア、職場環境への要望など、どんな内容でも気軽に投稿できます。
                  </p>
                  <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
                    <p className="text-white font-semibold mb-2">💡 ポイント</p>
                    <p>匿名投稿も可能なので、上司や同僚を気にせず本音で意見を伝えられます！</p>
                  </div>
                </div>
              </div>

              {/* フリーボイスのメリット */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('benefits') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="benefits">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-teal-400">✨</span>
                  フリーボイスのメリット
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <span>👥</span> 職員の視点
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 直接伝えにくい意見も気軽に投稿</li>
                      <li>• 現場の声がダイレクトに届く</li>
                      <li>• 同僚の意見に共感・サポートできる</li>
                      <li>• 職場改善に主体的に参加</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-teal-400 mb-3 flex items-center gap-2">
                      <span>🏥</span> 組織の視点
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 現場の課題を早期発見</li>
                      <li>• 職員満足度の向上</li>
                      <li>• イノベーションの源泉</li>
                      <li>• 風通しの良い組織文化</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 投稿できる内容 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('types') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="types">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">📋</span>
                  どんなことを投稿できるの？
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: '🔧', title: '業務改善提案', desc: 'もっと効率的な方法、無駄の削減アイデアなど' },
                    { icon: '🏢', title: '職場環境', desc: '休憩室の改善、設備の要望、働きやすさの提案' },
                    { icon: '💼', title: '制度・ルール', desc: 'シフト制度、評価制度、福利厚生への意見' },
                    { icon: '🤝', title: 'チームワーク', desc: 'コミュニケーション改善、連携強化のアイデア' },
                    { icon: '🆕', title: '新規アイデア', desc: '新しいサービス、イベント、取り組みの提案' }
                  ].map(item => (
                    <div key={item.title} className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 hover:border-green-500/50 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        {item.title}
                      </h4>
                      <p className="text-gray-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 投稿の流れ */}
          {activeTab === 'how' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('how-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="how-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">📤</span>
                  投稿はたったの3ステップ！
                </h2>
                <p className="text-lg text-gray-300">
                  フリーボイスへの投稿は驚くほど簡単。思いついたらすぐに投稿できます。
                </p>
              </div>

              {/* ステップ詳細 */}
              {[
                {
                  step: 1,
                  title: 'フリーボイスボタンをタップ',
                  desc: 'ホーム画面やメニューから「フリーボイス」をタップ',
                  detail: '画面下部のメニューバーまたはサイドバーから簡単にアクセスできます。',
                  icon: '👆'
                },
                {
                  step: 2,
                  title: 'カテゴリーを選択',
                  desc: '投稿内容に合ったカテゴリーを選びます',
                  detail: '業務改善、職場環境、制度・ルール、チームワーク、その他から選択。',
                  icon: '📂'
                },
                {
                  step: 3,
                  title: '内容を入力して投稿',
                  desc: 'タイトルと本文を入力。匿名投稿も選択可能',
                  detail: '写真の添付も可能。投稿前にプレビューで確認できます。',
                  icon: '✏️'
                }
              ].map(item => (
                <div key={item.step} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`step${item.step}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`step${item.step}`}>
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Step {item.step}: {item.title}
                      </h3>
                      <p className="text-lg text-gray-300 mb-3">{item.desc}</p>
                      <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                        <p className="text-gray-300">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 投稿のポイント */}
              <div className={`bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('how-cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="how-cta">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-green-400">💡</span>
                  投稿成功のポイント
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-white font-semibold mb-2">📝 具体的に</p>
                    <p className="text-gray-300 text-sm">問題点や改善案を具体的に記載</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-white font-semibold mb-2">🎯 建設的に</p>
                    <p className="text-gray-300 text-sm">批判より解決策を提案</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-white font-semibold mb-2">🤝 協力的に</p>
                    <p className="text-gray-300 text-sm">みんなで良くする姿勢で</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 投稿例 */}
          {activeTab === 'examples' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('examples-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="examples-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">💡</span>
                  実際の投稿例を見てみよう！
                </h2>
                <p className="text-lg text-gray-300">
                  他の職員さんが投稿した例を参考に、あなたも投稿してみましょう。
                </p>
              </div>

              {/* 投稿例リスト */}
              {[
                {
                  category: '業務改善',
                  title: '申し送りノートのデジタル化について',
                  content: '現在、紙の申し送りノートを使用していますが、検索が大変で重要事項を見逃すことがあります。タブレットでの管理システムを導入することで、キーワード検索や優先度設定が可能になり、情報共有の効率が大幅に向上すると思います。',
                  author: '看護師（匿名）',
                  likes: 42,
                  comments: 15
                },
                {
                  category: '職場環境',
                  title: '休憩室にリラックススペースを',
                  content: '現在の休憩室は椅子とテーブルだけですが、短時間でもリフレッシュできるよう、リクライニングチェアやマッサージクッションがあると良いと思います。他施設の事例では、職員の疲労軽減に効果があったそうです。',
                  author: '介護職員',
                  likes: 38,
                  comments: 12
                },
                {
                  category: '制度・ルール',
                  title: 'フレックスタイム制度の一部導入',
                  content: '事務職や一部の職種では、コアタイムを設けたフレックスタイム制度が可能ではないでしょうか。育児や介護との両立がしやすくなり、優秀な人材の定着にもつながると思います。',
                  author: '事務職員',
                  likes: 56,
                  comments: 23
                },
                {
                  category: 'チームワーク',
                  title: '部署間交流ランチ会の定期開催',
                  content: '他部署との連携不足を感じることがあります。月1回、希望者による部署間交流ランチ会を開催することで、顔の見える関係が築け、業務連携もスムーズになると思います。',
                  author: 'リハビリ職員',
                  likes: 45,
                  comments: 18
                },
                {
                  category: 'その他',
                  title: '職員向け健康増進プログラム',
                  content: '患者様の健康を支える私たちも健康でいることが大切です。ヨガ教室や栄養相談など、職員向けの健康増進プログラムがあると、モチベーション向上にもつながると思います。',
                  author: '医師',
                  likes: 67,
                  comments: 25
                }
              ].map((example, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`example${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`example${index + 1}`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      example.category === '業務改善' ? 'bg-blue-900/50 text-blue-300' :
                      example.category === '職場環境' ? 'bg-green-900/50 text-green-300' :
                      example.category === '制度・ルール' ? 'bg-purple-900/50 text-purple-300' :
                      example.category === 'チームワーク' ? 'bg-orange-900/50 text-orange-300' :
                      'bg-gray-700/50 text-gray-300'
                    }`}>
                      {example.category}
                    </span>
                    <span className="text-gray-400 text-sm">{example.author}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{example.title}</h3>
                  <p className="text-gray-300 mb-4">{example.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-green-400">
                      <span>👍</span> {example.likes}
                    </span>
                    <span className="flex items-center gap-2 text-blue-400">
                      <span>💬</span> {example.comments}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* コツと活用法 */}
          {activeTab === 'tips' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('tips-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="tips-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">🎯</span>
                  効果的な投稿のコツ
                </h2>
                <p className="text-lg text-gray-300">
                  あなたの声を確実に届け、実現につなげるためのテクニックをご紹介します。
                </p>
              </div>

              {/* コツリスト */}
              {[
                {
                  title: '具体的な数値やデータを含める',
                  desc: '「多い」「少ない」より「1日平均○回」「○%削減」など具体的な数値があると説得力が増します',
                  example: '「薬品在庫確認に毎日30分かかっている」→「バーコード管理で10分に短縮可能」'
                },
                {
                  title: '5W1Hを意識する',
                  desc: 'いつ・どこで・誰が・何を・なぜ・どのように、を明確にすると理解されやすくなります',
                  example: '「夜勤時（いつ）、ナースステーション（どこで）、看護師が（誰が）...」'
                },
                {
                  title: '写真や図表を活用',
                  desc: '現状の問題点や改善案を視覚的に示すと、より伝わりやすくなります',
                  example: '混雑する休憩室の写真、改善後のレイアウト図など'
                },
                {
                  title: 'メリットを明確に',
                  desc: '提案によって誰にどんなメリットがあるかを具体的に記載しましょう',
                  example: '「職員：残業時間削減」「患者様：待ち時間短縮」「組織：コスト削減」'
                },
                {
                  title: '実現可能性を考慮',
                  desc: '段階的な導入案や、低コストで始められる方法も併せて提案すると採用されやすくなります',
                  example: '「まずは1部署で試験導入→効果検証→全体展開」'
                }
              ].map((tip, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`tip${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`tip${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-green-400">💡</span>
                    {tip.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{tip.desc}</p>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <p className="text-sm text-gray-400 mb-1">例：</p>
                    <p className="text-gray-300">{tip.example}</p>
                  </div>
                </div>
              ))}

              {/* 活用のポイント */}
              <div className={`bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('tips-footer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="tips-footer">
                <h3 className="text-2xl font-bold text-white mb-4">🚀 さらに効果を高めるには</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>同僚と事前に相談して、複数人で同じ提案に「いいね」をつける</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>他の人の投稿にも積極的にコメントして、議論を活性化させる</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>定期的にフォローアップ投稿をして、進捗を共有する</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* プライバシー保護 */}
          {activeTab === 'privacy' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('privacy-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="privacy-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">🔒</span>
                  安心して投稿できる仕組み
                </h2>
                <p className="text-lg text-gray-300">
                  VoiceDriveは職員の皆さんが安心して本音を投稿できるよう、徹底したプライバシー保護を実現しています。
                </p>
              </div>

              {/* プライバシー保護の仕組み */}
              {[
                {
                  title: '完全匿名投稿',
                  icon: '🎭',
                  features: [
                    'IPアドレスや端末情報を記録しない',
                    '投稿者を特定する情報は一切保存されない',
                    '管理者でも投稿者を特定不可能'
                  ]
                },
                {
                  title: 'データの暗号化',
                  icon: '🔐',
                  features: [
                    '投稿内容は送信時から暗号化',
                    'データベースでも暗号化して保存',
                    '第三者による盗聴・改ざんを防止'
                  ]
                },
                {
                  title: 'アクセス制限',
                  icon: '🛡️',
                  features: [
                    '組織外からのアクセスを完全遮断',
                    '職員以外は閲覧不可',
                    '退職者のアクセス権は即座に削除'
                  ]
                },
                {
                  title: '透明性の確保',
                  icon: '📊',
                  features: [
                    'プライバシーポリシーを明確に公開',
                    '匿名投稿の仕組みを技術的に説明',
                    '定期的な第三者監査を実施'
                  ]
                }
              ].map((item, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`privacy${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`privacy${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    {item.title}
                  </h3>
                  <ul className="space-y-2">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 安心保証 */}
              <div className={`bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('privacy-summary') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="privacy-summary">
                <h3 className="text-2xl font-bold text-white mb-4">🤝 VoiceDriveの約束</h3>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg">
                    私たちは、職員の皆さんが<span className="text-green-400 font-semibold">安心して本音を語れる環境</span>を最優先に考えています。
                  </p>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">💪 不利益な扱いは一切ありません</p>
                    <p>投稿内容によって評価が下がったり、不利益な扱いを受けることは絶対にありません。これは組織として明文化されたルールです。</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 改善実績 */}
          {activeTab === 'impact' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('impact-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="impact-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-green-400">📈</span>
                  フリーボイスが生んだ変化
                </h2>
                <p className="text-lg text-gray-300">
                  実際にフリーボイスから実現した改善事例をご紹介します。
                </p>
              </div>

              {/* 改善事例 */}
              {[
                {
                  title: '電子カルテの操作性改善',
                  before: '複雑な画面遷移で入力に時間がかかる',
                  after: 'ショートカット機能追加で入力時間30%短縮',
                  impact: '1日あたり職員1人30分の時間削減',
                  timeline: '提案から3ヶ月で実現'
                },
                {
                  title: '職員用仮眠室の設置',
                  before: '夜勤時の休憩場所が不十分',
                  after: '専用仮眠室3室を新設',
                  impact: '夜勤職員の疲労度が大幅改善',
                  timeline: '提案から6ヶ月で実現'
                },
                {
                  title: '駐車場の拡張',
                  before: '職員用駐車場が慢性的に不足',
                  after: '50台分の駐車スペースを増設',
                  impact: '通勤ストレスが解消',
                  timeline: '提案から1年で実現'
                },
                {
                  title: '研修のオンライン化',
                  before: '全員参加の研修日程調整が困難',
                  after: 'オンデマンド配信で自由な時間に受講可能',
                  impact: '研修参加率が70%→95%に向上',
                  timeline: '提案から2ヶ月で実現'
                }
              ].map((case_, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`impact${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`impact${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4">{case_.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                      <p className="text-red-400 font-semibold mb-2">改善前</p>
                      <p className="text-gray-300">{case_.before}</p>
                    </div>
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                      <p className="text-green-400 font-semibold mb-2">改善後</p>
                      <p className="text-gray-300">{case_.after}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-400">💡 {case_.impact}</span>
                    <span className="text-gray-400">⏱️ {case_.timeline}</span>
                  </div>
                </div>
              ))}

              {/* 統計データ */}
              <div className={`bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('impact-stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="impact-stats">
                <h3 className="text-2xl font-bold text-white mb-6">📊 フリーボイスの実績（2024年度）</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-400 mb-2">2,847</p>
                    <p className="text-gray-300">総投稿数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-400 mb-2">342</p>
                    <p className="text-gray-300">実現した改善</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-400 mb-2">89%</p>
                    <p className="text-gray-300">職員満足度</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-400 mb-2">4.5億円</p>
                    <p className="text-gray-300">改善による効果</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            さあ、あなたの声を届けよう！
          </h2>
          <p className="text-xl text-white/90 mb-6">
            小さな気づきが、大きな改善につながります
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
            フリーボイスを投稿する
          </button>
        </div>
      </div>
      
      {/* フッター */}
      <div className="hidden lg:block">
        <DesktopFooter />
      </div>
      <div className="lg:hidden">
        <MobileFooter />
      </div>
    </div>
  );
};

export default FreeVoiceGuide;