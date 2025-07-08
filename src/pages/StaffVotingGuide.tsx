import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const StaffVotingGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'voting' | 'flow'>('voting');

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set(['header', 'why', 'flow', 'fairness', 'weight', 'transparent', 'summary', 'success', 'step1', 'step2', 'step3', 'step4', 'step5', 'cta']));
    
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
        <div className={`bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8 animate-section transition-all duration-1000 ${
          visibleSections.has('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="header">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">🗳️</span>
            VoiceDriveの投票はこうして公平になる！
          </h1>
          <p className="text-xl text-gray-300">
            みんなの意見が平等に反映される仕組み
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="flex bg-gray-800/50 backdrop-blur-xl rounded-xl p-2 border border-gray-600/30">
            <button
              onClick={() => setActiveTab('voting')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'voting'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-xl">🗳️</span>
              <span>投票のしくみ</span>
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'flow'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-xl">📝</span>
              <span>実際の流れを見てみよう</span>
            </button>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'voting' && (
          <div className="space-y-6">
            {/* なぜ投票が大切？ */}
        <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 mb-6 border border-blue-500/30 animate-section transition-all duration-1000 ${
          visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="why">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">🤔</span>
            なぜ投票が大切なの？
          </h2>
          <div className="space-y-4 text-lg">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-100">
                <span className="text-yellow-400 font-bold">みんなの声</span>が
                <span className="text-green-400 font-bold">平等に</span>
                聞こえるようにするためです！
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                <p className="text-white font-bold mb-2">❌ 今までは...</p>
                <p className="text-gray-300">声の大きい人の意見ばかり通っていた</p>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                <p className="text-white font-bold mb-2">✅ VoiceDriveなら！</p>
                <p className="text-gray-300">みんなの意見が数字で見える</p>
              </div>
            </div>
          </div>
        </div>

        {/* 投票の流れ */}
        <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 mb-6 border border-green-500/30 animate-section transition-all duration-1000 ${
          visibleSections.has('flow') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="flow">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            投票はとってもカンタン！
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div className="bg-gray-700/50 p-4 rounded-lg flex-1">
                <p className="text-white font-bold mb-1">アイデアを読む</p>
                <p className="text-gray-300">どんなアイデアか、じっくり読んでね</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div className="bg-gray-700/50 p-4 rounded-lg flex-1">
                <p className="text-white font-bold mb-1">5つから選ぶ</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">👎 強く反対</span>
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">😕 反対</span>
                  <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full">😐 中立</span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">😊 賛成</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">👍 強く賛成</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div className="bg-gray-700/50 p-4 rounded-lg flex-1">
                <p className="text-white font-bold mb-1">投票完了！</p>
                <p className="text-gray-300">あなたの意見が反映されました</p>
              </div>
            </div>
          </div>
        </div>

        {/* 公平性の説明 */}
        <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 mb-6 border border-purple-500/30 animate-section transition-all duration-1000 ${
          visibleSections.has('fairness') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="fairness">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            どうして公平なの？
          </h2>
          <div className="space-y-6">
            {/* 匿名性 */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                誰が投票したかわからない！
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-100 mb-3">
                  <span className="text-yellow-400 font-bold">匿名レベル</span>を自分で選べるよ！
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <span className="text-white">実名 → みんなに名前が見える</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    <span className="text-white">部署名だけ → 「内科の誰か」</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔐</span>
                    <span className="text-white">完全匿名 → 誰かわからない</span>
                  </div>
                </div>
                <p className="text-green-400 mt-3 font-bold">
                  ✨ 安心して本音で投票できる！
                </p>
              </div>
            </div>

            {/* 重み付け */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                みんなの専門性も大切に！
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-100 mb-3">
                  医療の質を守るため、<span className="text-yellow-400 font-bold">専門性に応じて重み</span>があるよ
                </p>
                <div className="space-y-3">
                  <div className="bg-pink-900/30 p-3 rounded-lg border border-pink-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">👨‍⚕️ 医師</span>
                      <span className="text-pink-400 font-bold">3.0倍</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">👩‍⚕️ 看護師</span>
                      <span className="text-blue-400 font-bold">2.0倍</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">🏥 その他医療職</span>
                      <span className="text-green-400 font-bold">1.5倍</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '50%'}}></div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">💼 事務職</span>
                      <span className="text-yellow-400 font-bold">1.0倍</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '33%'}}></div>
                    </div>
                  </div>
                </div>
                <p className="text-blue-400 mt-3 font-bold">
                  ✨ でも、みんなの意見が必ず反映される！
                </p>
                
                {/* 経験年数による重み付け */}
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    経験年数も考慮されるよ！
                  </h4>
                  <p className="text-gray-100 mb-3 text-sm">
                    長い経験で培った知識や判断力も大切にします
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-purple-900/30 p-2 rounded-lg text-center">
                      <span className="text-lg">🏆</span>
                      <p className="text-white font-bold text-sm">20年以上</p>
                      <p className="text-purple-400 text-xs">+0.3倍</p>
                    </div>
                    <div className="bg-indigo-900/30 p-2 rounded-lg text-center">
                      <span className="text-lg">⭐</span>
                      <p className="text-white font-bold text-sm">10-19年</p>
                      <p className="text-indigo-400 text-xs">+0.2倍</p>
                    </div>
                    <div className="bg-cyan-900/30 p-2 rounded-lg text-center">
                      <span className="text-lg">💪</span>
                      <p className="text-white font-bold text-sm">5-9年</p>
                      <p className="text-cyan-400 text-xs">+0.1倍</p>
                    </div>
                    <div className="bg-gray-600/30 p-2 rounded-lg text-center">
                      <span className="text-lg">🌱</span>
                      <p className="text-white font-bold text-sm">5年未満</p>
                      <p className="text-gray-400 text-xs">基準値</p>
                    </div>
                  </div>
                </div>

                {/* 役職による重み付け */}
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    責任の重さも反映！
                  </h4>
                  <p className="text-gray-100 mb-3 text-sm">
                    組織運営や意思決定の責任も考慮されます
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-amber-900/30 p-2 rounded-lg text-center">
                      <span className="text-lg">👔</span>
                      <p className="text-white font-bold text-sm">管理職</p>
                      <p className="text-amber-400 text-xs">+0.2倍</p>
                    </div>
                    <div className="bg-orange-900/30 p-2 rounded-lg text-center">
                      <span className="text-lg">📋</span>
                      <p className="text-white font-bold text-sm">主任・係長</p>
                      <p className="text-orange-400 text-xs">+0.1倍</p>
                    </div>
                    <div className="bg-gray-600/30 p-2 rounded-lg text-center">
                      <span className="text-lg">👤</span>
                      <p className="text-white font-bold text-sm">一般職</p>
                      <p className="text-gray-400 text-xs">基準値</p>
                    </div>
                  </div>
                </div>

                {/* 世代バランス */}
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🌈</span>
                    世代の多様性も大切！
                  </h4>
                  <p className="text-gray-100 mb-3 text-sm">
                    異なる世代の視点や価値観も投票に反映されます
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-emerald-900/30 px-3 py-2 rounded-full">
                      <span className="text-emerald-400 text-sm font-bold">🧓 ベテラン世代の経験</span>
                    </div>
                    <div className="bg-blue-900/30 px-3 py-2 rounded-full">
                      <span className="text-blue-400 text-sm font-bold">💼 中堅世代の実践力</span>
                    </div>
                    <div className="bg-violet-900/30 px-3 py-2 rounded-full">
                      <span className="text-violet-400 text-sm font-bold">✨ 若手世代の新しい視点</span>
                    </div>
                  </div>
                </div>

                <p className="text-green-400 mt-4 font-bold text-center">
                  🎯 みんなの経験・立場・世代が合わさって、最高の意思決定に！
                </p>
              </div>
            </div>

            {/* 透明性 */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">👀</span>
                結果はみんなで見られる！
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-100 mb-3">
                  投票が終わったら、<span className="text-yellow-400 font-bold">結果は全員に公開</span>されるよ
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-900/30 p-3 rounded-lg text-center">
                    <span className="text-3xl">📊</span>
                    <p className="text-white font-bold mt-1">得点</p>
                    <p className="text-gray-300 text-sm">何点取ったか</p>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded-lg text-center">
                    <span className="text-3xl">📈</span>
                    <p className="text-white font-bold mt-1">グラフ</p>
                    <p className="text-gray-300 text-sm">賛成・反対の割合</p>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg text-center">
                    <span className="text-3xl">👥</span>
                    <p className="text-white font-bold mt-1">参加者</p>
                    <p className="text-gray-300 text-sm">何人が投票したか</p>
                  </div>
                  <div className="bg-yellow-900/30 p-3 rounded-lg text-center">
                    <span className="text-3xl">💬</span>
                    <p className="text-white font-bold mt-1">コメント</p>
                    <p className="text-gray-300 text-sm">みんなの意見</p>
                  </div>
                </div>
                <p className="text-green-400 mt-3 font-bold">
                  ✨ 不正や偏りがないかチェックできる！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* まとめ */}
        <div className={`bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 animate-section transition-all duration-1000 ${
          visibleSections.has('summary') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="summary">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            🎉 VoiceDriveの投票なら安心！
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <span className="text-4xl mb-2 block">🔒</span>
              <p className="text-white font-bold">秘密が守られる</p>
              <p className="text-white/80 text-sm">匿名で投票できる</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <span className="text-4xl mb-2 block">⚖️</span>
              <p className="text-white font-bold">みんな平等</p>
              <p className="text-white/80 text-sm">全員の意見が大切</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <span className="text-4xl mb-2 block">👀</span>
              <p className="text-white font-bold">結果が見える</p>
              <p className="text-white/80 text-sm">透明で公正</p>
            </div>
          </div>
          <p className="text-white text-center mt-6 text-lg font-bold">
            だから、安心して本音で投票してね！ 🗳️✨
          </p>
        </div>
          </div>
        )}

        {/* 実際の流れタブ */}
        {activeTab === 'flow' && (
          <div className="space-y-8">
            {/* 成功ストーリー例 */}
            <div className={`bg-gradient-to-r from-emerald-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('success') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="success">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                田中看護師さんのアイデアが実現した話
              </h2>
              <p className="text-emerald-200 text-lg mb-4">
                「患者さんの待ち時間を短くしたい」という想いから始まったアイデアが、
                わずか3ヶ月でプロジェクト化され、病院全体の改善につながりました！
              </p>
            </div>

            {/* ステップ1: アイデア投稿 */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('step1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="step1">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                💡 アイデア投稿「患者待ち時間の改善システム」
              </h3>
              
              {/* 模擬投稿画面 */}
              <div className="bg-gray-900/60 rounded-lg p-4 border-2 border-dashed border-blue-400/50">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">田</div>
                    <div>
                      <p className="font-bold text-gray-800">田中 美咲</p>
                      <p className="text-gray-600 text-sm">看護師 • 内科病棟</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">📋 患者待ち時間の改善システム</h4>
                  <p className="text-gray-700 mb-3">
                    外来患者さんの待ち時間が長くて困っています。リアルタイムで待ち時間がわかるシステムと、
                    予約時間の最適化ができれば、患者満足度も上がると思います。
                  </p>
                  <div className="flex gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">患者満足度向上</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">業務効率化</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>2024年1月15日 投稿</span>
                    <span>💰 予算: 50万円程度</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4 text-sm">
                ✨ <span className="text-yellow-400 font-bold">ポイント:</span> 
                現場の困りごとを具体的に、解決策も一緒に提案！
              </p>
            </div>

            {/* ステップ2: 投票期間 */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('step2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="step2">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                🗳️ みんなで投票！（7日間）
              </h3>

              {/* 模擬投票画面 */}
              <div className="bg-gray-900/60 rounded-lg p-4 border-2 border-dashed border-green-400/50">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <h4 className="font-bold text-gray-800 mb-4">📋 患者待ち時間の改善システム</h4>
                  
                  {/* 投票オプション */}
                  <div className="space-y-2 mb-4">
                    <button className="w-full p-3 bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2">
                      <span>👍</span> 強く賛成
                    </button>
                    <button className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 opacity-50">
                      <span>😊</span> 賛成
                    </button>
                    <button className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 opacity-50">
                      <span>😐</span> 中立
                    </button>
                    <button className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 opacity-50">
                      <span>😕</span> 反対
                    </button>
                    <button className="w-full p-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 opacity-50">
                      <span>👎</span> 強く反対
                    </button>
                  </div>

                  {/* リアルタイム結果 */}
                  <div className="border-t pt-4">
                    <h5 className="font-bold text-gray-800 mb-2">📊 現在の結果</h5>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-bold text-emerald-600">285点</span>
                      <span className="text-gray-600">参加者: 47人</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3 mb-2">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-sm text-emerald-600 font-bold">🚀 FACILITY（施設レベル）まであと15点！</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4 text-sm">
                ✨ <span className="text-yellow-400 font-bold">ポイント:</span> 
                リアルタイムで結果が見えるから、みんなの関心も高まる！
              </p>
            </div>

            {/* ステップ3: プロジェクト化 */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('step3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="step3">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                🎯 プロジェクト化決定！
              </h3>

              {/* 模擬通知画面 */}
              <div className="bg-gray-900/60 rounded-lg p-4 border-2 border-dashed border-purple-400/50">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">🎉</span>
                    <div>
                      <h4 className="font-bold text-lg">おめでとうございます！</h4>
                      <p className="text-purple-100">あなたのアイデアがプロジェクトになりました</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 mb-3">
                    <p className="font-bold mb-1">📋 患者待ち時間の改善システム</p>
                    <p className="text-sm text-purple-100">最終スコア: 312点 (FACILITY レベル)</p>
                    <p className="text-sm text-purple-100">参加者: 52人</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm">
                      プロジェクト詳細を見る
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm border border-white/30">
                      チームに参加
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4 text-sm">
                ✨ <span className="text-yellow-400 font-bold">ポイント:</span> 
                高得点を獲得したアイデアは自動的にプロジェクト化！
              </p>
            </div>

            {/* ステップ4: 進捗管理 */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('step4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="step4">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                📈 プロジェクト進行中
              </h3>

              {/* 模擬プロジェクト管理画面 */}
              <div className="bg-gray-900/60 rounded-lg p-4 border-2 border-dashed border-orange-400/50">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">📋 患者待ち時間の改善システム</h4>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">進行中</span>
                  </div>
                  
                  {/* 進捗バー */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>プロジェクト進捗</span>
                      <span>75%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>

                  {/* タスク一覧 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-green-600">✅</span>
                      <span className="text-gray-700">要件定義完了</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-green-600">✅</span>
                      <span className="text-gray-700">システム設計完了</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <span className="text-blue-600">🔄</span>
                      <span className="text-gray-700">開発中（あと2週間）</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-gray-400">⏳</span>
                      <span className="text-gray-500">テスト予定</span>
                    </div>
                  </div>

                  {/* チーム */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">プロジェクトチーム</p>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">田</div>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">山</div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">佐</div>
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">+3</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mt-4 text-sm">
                ✨ <span className="text-yellow-400 font-bold">ポイント:</span> 
                プロジェクトの進捗はリアルタイムで確認！透明性の高い管理
              </p>
            </div>

            {/* ステップ5: 成果 */}
            <div className={`bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('step5') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="step5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                🌟 プロジェクト完了・成果発表
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-4xl mb-2 block">⏰</span>
                  <p className="text-white font-bold">待ち時間</p>
                  <p className="text-green-400 text-2xl font-bold">-40%</p>
                  <p className="text-white/80 text-sm">平均25分短縮</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-4xl mb-2 block">😊</span>
                  <p className="text-white font-bold">患者満足度</p>
                  <p className="text-green-400 text-2xl font-bold">95%</p>
                  <p className="text-white/80 text-sm">前月比+20%向上</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-4xl mb-2 block">🏆</span>
                  <p className="text-white font-bold">業務効率</p>
                  <p className="text-green-400 text-2xl font-bold">+30%</p>
                  <p className="text-white/80 text-sm">スタッフ負荷軽減</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-white text-center font-bold mb-2">
                  🎉 田中さんのアイデアが病院全体を変えました！
                </p>
                <p className="text-green-200 text-center text-sm">
                  「最初は小さなアイデアでしたが、みんなで投票して、みんなで作り上げた結果、
                  こんなに大きな成果につながりました。投稿して本当に良かったです！」
                </p>
              </div>
            </div>

            {/* 呼びかけ */}
            <div className={`bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20 text-center animate-section transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="cta">
              <h3 className="text-2xl font-bold text-white mb-4">
                🚀 あなたのアイデアも実現させてみませんか？
              </h3>
              <p className="text-xl text-gray-300 mb-6">
                小さな改善案から大きな革新まで、どんなアイデアでも大歓迎！
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <span className="text-3xl mb-2 block">💡</span>
                  <p className="text-white font-bold mb-1">現場の困りごと</p>
                  <p className="text-gray-300 text-sm">日々感じる「こうなったらいいのに」</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <span className="text-3xl mb-2 block">🔧</span>
                  <p className="text-white font-bold mb-1">業務改善のアイデア</p>
                  <p className="text-gray-300 text-sm">効率化や質向上のヒント</p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-lg">
                📝 アイデアを投稿してみる
              </button>
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="lg:hidden">
        <MobileFooter />
      </div>
      <div className="hidden lg:block">
        <DesktopFooter />
      </div>
    </div>
  );
};

export default StaffVotingGuide;