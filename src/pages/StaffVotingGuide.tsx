import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const StaffVotingGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'voting' | 'flow' | 'success' | 'faq' | 'levels' | 'support'>('voting');

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set([
      'header', 'why', 'flow', 'fairness', 'weight', 'transparent', 'summary', 
      'success', 'step1', 'step2', 'step3', 'step4', 'step5', 'cta',
      'success-header', 'nurse-cases', 'doctor-cases', 'admin-cases', 'tech-cases', 'success-stats',
      'faq-header', 'faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq-footer',
      'levels-header', 'level-pending', 'level-team', 'level-dept', 'level-facility', 'level-org', 'level-strategic', 'level-tips',
      'support-header', 'pre-support', 'post-support', 'project-support', 'training-support', 'support-contact'
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
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 bg-gray-800/50 backdrop-blur-xl rounded-xl p-2 border border-gray-600/30">
            <button
              onClick={() => setActiveTab('voting')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'voting'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">🗳️</span>
              <span className="text-xs leading-tight text-center">投票のしくみ</span>
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'flow'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">📝</span>
              <span className="text-xs leading-tight text-center">実際の流れ</span>
            </button>
            <button
              onClick={() => setActiveTab('success')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'success'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">🏆</span>
              <span className="text-xs leading-tight text-center">成功事例集</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'faq'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">❓</span>
              <span className="text-xs leading-tight text-center">よくある質問</span>
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'levels'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">🎯</span>
              <span className="text-xs leading-tight text-center">レベル解説</span>
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1 text-sm ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">👥</span>
              <span className="text-xs leading-tight text-center">サポート体制</span>
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

        {/* 成功事例集タブ */}
        {activeTab === 'success' && (
          <div className="space-y-8">
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-xl rounded-xl p-6 border border-amber-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('success-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="success-header">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                みんなの素晴らしいアイデアが実現！
              </h2>
              <p className="text-amber-200 text-lg">
                職員の皆さんから生まれた実際のアイデアとその成果をご紹介します
              </p>
            </div>

            {/* 看護師のアイデア */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('nurse-cases') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="nurse-cases">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">👩‍⚕️</span>
                看護師さんのアイデア
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 事例1 */}
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">高</div>
                    <div>
                      <p className="text-white font-bold">高橋主任（ICU）</p>
                      <p className="text-blue-200 text-sm">夜勤の効率化アイデア</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「夜勤申し送り時間短縮システム」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    ICUの申し送りに40分もかかって困っていました。デジタル申し送りシートで時間を半分に！
                  </p>
                  <div className="bg-blue-800/50 p-3 rounded border border-blue-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-blue-200 text-xs">申し送り時間</p>
                        <p className="text-white font-bold">40分→18分</p>
                      </div>
                      <div>
                        <p className="text-blue-200 text-xs">ミス削減</p>
                        <p className="text-white font-bold">85%減</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 DEPARTMENT レベル • 3ヶ月で完成</p>
                </div>

                {/* 事例2 */}
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">佐</div>
                    <div>
                      <p className="text-white font-bold">佐藤看護師（外科）</p>
                      <p className="text-green-200 text-sm">患者ケアの改善</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「術後回復支援アプリ」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    患者さんの回復状況を家族も確認できるアプリ。安心して退院準備ができるように。
                  </p>
                  <div className="bg-green-800/50 p-3 rounded border border-green-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-green-200 text-xs">患者満足度</p>
                        <p className="text-white font-bold">92%</p>
                      </div>
                      <div>
                        <p className="text-green-200 text-xs">在院日数</p>
                        <p className="text-white font-bold">1.5日短縮</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 FACILITY レベル • 4ヶ月で完成</p>
                </div>
              </div>
            </div>

            {/* 医師のアイデア */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-pink-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('doctor-cases') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="doctor-cases">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">👨‍⚕️</span>
                医師のアイデア
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 事例1 */}
                <div className="bg-pink-900/30 p-4 rounded-lg border border-pink-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">山</div>
                    <div>
                      <p className="text-white font-bold">山田医師（内科）</p>
                      <p className="text-pink-200 text-sm">診断精度向上</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「AI診断支援システム」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    レントゲン画像の読影をAIが支援。見落としを防いで診断精度を向上させたい。
                  </p>
                  <div className="bg-pink-800/50 p-3 rounded border border-pink-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-pink-200 text-xs">診断精度</p>
                        <p className="text-white font-bold">+15%向上</p>
                      </div>
                      <div>
                        <p className="text-pink-200 text-xs">見落とし</p>
                        <p className="text-white font-bold">70%削減</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 STRATEGIC レベル • 8ヶ月で完成</p>
                </div>

                {/* 事例2 */}
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">伊</div>
                    <div>
                      <p className="text-white font-bold">伊藤医師（救急）</p>
                      <p className="text-purple-200 text-sm">救急対応の迅速化</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「救急トリアージAI」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    救急外来での緊急度判定を支援。重篤な患者を見逃さずに適切な治療順序を決定。
                  </p>
                  <div className="bg-purple-800/50 p-3 rounded border border-purple-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-purple-200 text-xs">対応時間</p>
                        <p className="text-white font-bold">30%短縮</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-xs">救命率</p>
                        <p className="text-white font-bold">+8%向上</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 ORGANIZATION レベル • 6ヶ月で完成</p>
                </div>
              </div>
            </div>

            {/* 事務職のアイデア */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('admin-cases') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="admin-cases">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">💼</span>
                事務職のアイデア
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 事例1 */}
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">鈴</div>
                    <div>
                      <p className="text-white font-bold">鈴木係長（医事課）</p>
                      <p className="text-yellow-200 text-sm">業務効率化</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「自動レセプト点検システム」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    レセプト点検作業が大変！AIで自動チェックして、間違いを事前に発見できれば。
                  </p>
                  <div className="bg-yellow-800/50 p-3 rounded border border-yellow-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-yellow-200 text-xs">点検時間</p>
                        <p className="text-white font-bold">60%短縮</p>
                      </div>
                      <div>
                        <p className="text-yellow-200 text-xs">エラー率</p>
                        <p className="text-white font-bold">90%削減</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 FACILITY レベル • 5ヶ月で完成</p>
                </div>

                {/* 事例2 */}
                <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">中</div>
                    <div>
                      <p className="text-white font-bold">中村主任（総務課）</p>
                      <p className="text-orange-200 text-sm">職員満足度向上</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「職員食堂予約アプリ」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    お昼の食堂が混雑して時間がもったいない。事前予約で密を避けて効率的に！
                  </p>
                  <div className="bg-orange-800/50 p-3 rounded border border-orange-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-orange-200 text-xs">待ち時間</p>
                        <p className="text-white font-bold">80%短縮</p>
                      </div>
                      <div>
                        <p className="text-orange-200 text-xs">利用者満足</p>
                        <p className="text-white font-bold">96%</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 TEAM レベル • 2ヶ月で完成</p>
                </div>
              </div>
            </div>

            {/* 技師・その他職種のアイデア */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('tech-cases') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="tech-cases">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                技師・その他職種のアイデア
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 事例1 */}
                <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">田</div>
                    <div>
                      <p className="text-white font-bold">田村技師（放射線科）</p>
                      <p className="text-cyan-200 text-sm">検査精度向上</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「MRI検査予約最適化」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    MRI検査の空き時間が多い。AIで最適なスケジューリングをして稼働率アップ！
                  </p>
                  <div className="bg-cyan-800/50 p-3 rounded border border-cyan-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-cyan-200 text-xs">稼働率</p>
                        <p className="text-white font-bold">+35%向上</p>
                      </div>
                      <div>
                        <p className="text-cyan-200 text-xs">収益増</p>
                        <p className="text-white font-bold">月200万円</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 FACILITY レベル • 3ヶ月で完成</p>
                </div>

                {/* 事例2 */}
                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">松</div>
                    <div>
                      <p className="text-white font-bold">松本栄養士（栄養科）</p>
                      <p className="text-indigo-200 text-sm">患者食改善</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold mb-2">💡 「個別栄養管理システム」</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    患者さん一人ひとりに最適な食事を提供したい。AI分析で個別メニューを自動作成。
                  </p>
                  <div className="bg-indigo-800/50 p-3 rounded border border-indigo-400/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-indigo-200 text-xs">食事満足度</p>
                        <p className="text-white font-bold">89%</p>
                      </div>
                      <div>
                        <p className="text-indigo-200 text-xs">栄養状態</p>
                        <p className="text-white font-bold">+25%改善</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-green-400 text-xs mt-2 font-bold">🎯 DEPARTMENT レベル • 4ヶ月で完成</p>
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div className={`bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('success-stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="success-stats">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                📊 アイデア実現の統計（過去1年間）
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-3xl mb-2 block">💡</span>
                  <p className="text-white font-bold text-lg">267</p>
                  <p className="text-gray-300 text-sm">総投稿数</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-3xl mb-2 block">🚀</span>
                  <p className="text-white font-bold text-lg">89</p>
                  <p className="text-gray-300 text-sm">プロジェクト化</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-3xl mb-2 block">✅</span>
                  <p className="text-white font-bold text-lg">65</p>
                  <p className="text-gray-300 text-sm">完了数</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <span className="text-3xl mb-2 block">🎯</span>
                  <p className="text-white font-bold text-lg">73%</p>
                  <p className="text-gray-300 text-sm">成功率</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-green-200 text-lg font-bold mb-2">
                  🌟 あなたのアイデアも次の成功事例になるかもしれません！
                </p>
                <p className="text-gray-300">
                  小さなアイデアでも大きな変化を生み出せます。まずは投稿から始めてみませんか？
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ タブ */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="faq-header">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">❓</span>
                よくある質問・不安解消
              </h2>
              <p className="text-purple-200 text-lg">
                アイデア投稿に関する疑問や不安にお答えします
              </p>
            </div>

            {/* FAQ項目 */}
            <div className="space-y-4">
              {/* FAQ1 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq1">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🤔</span>
                    アイデアが採用されなかったらどうなるの？
                  </h3>
                  <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-white font-bold mb-2">💡 安心してください！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• 採用されなくても<span className="text-yellow-400 font-bold">何のペナルティもありません</span></li>
                      <li>• <span className="text-green-400 font-bold">フィードバック</span>をもらえるので、次回の参考になります</li>
                      <li>• アイデアを投稿したこと自体が<span className="text-blue-400 font-bold">評価の対象</span>になります</li>
                      <li>• 改良版を再投稿することも可能です</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ2 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq2">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">⏰</span>
                    忙しくてプロジェクトに参加できない場合は？
                  </h3>
                  <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                    <p className="text-white font-bold mb-2">🔄 柔軟な参加が可能！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <span className="text-yellow-400 font-bold">部分的な参加</span>でも大歓迎です</li>
                      <li>• 忙しい時期は他のメンバーがサポートします</li>
                      <li>• <span className="text-green-400 font-bold">アドバイザー</span>として関わることも可能</li>
                      <li>• プロジェクトの進捗は定期的に報告されます</li>
                      <li>• 無理のない範囲での参加を尊重します</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ3 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq3">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">👔</span>
                    上司に反対されそうなアイデアでも大丈夫？
                  </h3>
                  <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                    <p className="text-white font-bold mb-2">🛡️ 安心の保護制度！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <span className="text-yellow-400 font-bold">匿名投稿</span>も可能です</li>
                      <li>• アイデア提案は<span className="text-green-400 font-bold">職員の権利</span>として保護されています</li>
                      <li>• 投票は<span className="text-blue-400 font-bold">全職員</span>で行うため、上司一人の判断ではありません</li>
                      <li>• 革新的なアイデアほど評価される傾向があります</li>
                      <li>• 提案者へのネガティブな対応は禁止されています</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ4 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq4">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    技術的な知識がなくても提案できる？
                  </h3>
                  <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30">
                    <p className="text-white font-bold mb-2">🌟 もちろん大歓迎！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <span className="text-yellow-400 font-bold">「こうなったらいいな」</span>だけでも十分です</li>
                      <li>• 技術的な実現方法は<span className="text-green-400 font-bold">専門チーム</span>が検討します</li>
                      <li>• 現場の困りごとこそ<span className="text-blue-400 font-bold">最も価値のあるアイデア</span>です</li>
                      <li>• サポートチームが技術的な部分をお手伝いします</li>
                      <li>• 実際の成功事例の多くは「技術素人」の発想から生まれています</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ5 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq5') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq5">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    アイデアが採用されたら何かもらえるの？
                  </h3>
                  <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-500/30">
                    <p className="text-white font-bold mb-2">🎁 様々な特典があります！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <span className="text-yellow-400 font-bold">表彰制度</span>：優秀アイデア賞・実装成功賞</li>
                      <li>• <span className="text-green-400 font-bold">昇進・昇格</span>の評価対象になります</li>
                      <li>• プロジェクトリーダーとしての<span className="text-blue-400 font-bold">経験とスキル</span>が身につく</li>
                      <li>• <span className="text-purple-400 font-bold">研修機会</span>の優先案内</li>
                      <li>• 何より、職場環境改善という<span className="text-red-400 font-bold">大きな達成感</span>！</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQ6 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-600/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq6') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq6">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    どのくらい詳しく書けばいいの？
                  </h3>
                  <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                    <p className="text-white font-bold mb-2">✏️ シンプルでOK！</p>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <span className="text-yellow-400 font-bold">最低限</span>：困っていること + こうなったらいいな</li>
                      <li>• <span className="text-green-400 font-bold">理想的</span>：背景・現状・提案・期待効果</li>
                      <li>• 文章が苦手でも<span className="text-blue-400 font-bold">箇条書き</span>で大丈夫</li>
                      <li>• 投稿後に<span className="text-purple-400 font-bold">追加・修正</span>も可能です</li>
                      <li>• <span className="text-orange-400 font-bold">相談窓口</span>で書き方のサポートも受けられます</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 不安解消メッセージ */}
            <div className={`bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 text-center animate-section transition-all duration-1000 ${
              visibleSections.has('faq-footer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="faq-footer">
              <h3 className="text-xl font-bold text-white mb-4">
                🌈 まだ不安がありますか？
              </h3>
              <p className="text-gray-300 mb-4">
                どんな小さな疑問でも、まずは相談窓口にお気軽にご連絡ください。
                一緒にアイデアを育てていきましょう！
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
                  💬 相談窓口に連絡
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
                  📝 まずは投稿してみる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* レベル解説タブ */}
        {activeTab === 'levels' && (
          <div className="space-y-8">
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r from-cyan-900/50 to-teal-900/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('levels-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="levels-header">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                プロジェクトレベル詳細解説
              </h2>
              <p className="text-cyan-200 text-lg">
                投票スコアによってプロジェクトがどのレベルに分類されるかご説明します
              </p>
            </div>

            {/* レベル一覧 */}
            <div className="space-y-6">
              {/* PENDING */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-pending') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-pending">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gray-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">💭</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">PENDING（議論段階）</h3>
                    <p className="text-gray-400">0-49点</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• まだ議論・検討段階</li>
                      <li>• 追加情報や改良が必要</li>
                      <li>• より多くの意見が求められる</li>
                      <li>• 継続的な投票で点数向上を目指す</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🔄 対応</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• フィードバック収集</li>
                      <li>• アイデアの詳細化</li>
                      <li>• 関係者との相談</li>
                      <li>• 改良版の再投稿検討</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* TEAM */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-team') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-team">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">TEAM（チームレベル）</h3>
                    <p className="text-blue-400">50-99点</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 小規模チーム内での改善</li>
                      <li>• 実現期間：1-2ヶ月</li>
                      <li>• 予算：10-50万円程度</li>
                      <li>• 直接的な業務改善</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">💡 事例</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 業務手順の効率化</li>
                      <li>• チーム内情報共有改善</li>
                      <li>• 小規模ツール導入</li>
                      <li>• 勤務シフト最適化</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🎯 実現性</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 実現確率：90%以上</li>
                      <li>• 承認プロセス：簡素</li>
                      <li>• 必要人数：3-8人</li>
                      <li>• すぐに効果が実感できる</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-dept') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-dept">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-cyan-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">DEPARTMENT（部署レベル）</h3>
                    <p className="text-cyan-400">100-299点</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-cyan-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 部署全体への影響</li>
                      <li>• 実現期間：2-4ヶ月</li>
                      <li>• 予算：50-200万円程度</li>
                      <li>• 複数チームの連携</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">💡 事例</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 申し送りシステム改善</li>
                      <li>• 部署内ワークフロー改革</li>
                      <li>• 新システム導入</li>
                      <li>• 患者ケア質向上プロジェクト</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🎯 実現性</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 実現確率：80%以上</li>
                      <li>• 承認プロセス：標準</li>
                      <li>• 必要人数：10-30人</li>
                      <li>• 部署全体の効率化</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FACILITY */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-facility') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-facility">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">FACILITY（施設レベル）</h3>
                    <p className="text-green-400">300-599点</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 施設全体への影響</li>
                      <li>• 実現期間：3-6ヶ月</li>
                      <li>• 予算：200-1000万円程度</li>
                      <li>• 複数部署の協力</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">💡 事例</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 患者待ち時間改善システム</li>
                      <li>• 院内ナビゲーション</li>
                      <li>• 電子カルテ機能強化</li>
                      <li>• 感染対策システム</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🎯 実現性</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 実現確率：70%以上</li>
                      <li>• 承認プロセス：詳細</li>
                      <li>• 必要人数：30-100人</li>
                      <li>• 施設全体の改革</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ORGANIZATION */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-org') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-org">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">ORGANIZATION（法人レベル）</h3>
                    <p className="text-purple-400">600-1199点</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 法人全体への影響</li>
                      <li>• 実現期間：6-12ヶ月</li>
                      <li>• 予算：1000万円以上</li>
                      <li>• 複数施設の連携</li>
                    </ul>
                  </div>
                  <div className="bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">💡 事例</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 統合医療情報システム</li>
                      <li>• 法人間連携強化</li>
                      <li>• 人事制度改革</li>
                      <li>• 医療AI導入</li>
                    </ul>
                  </div>
                  <div className="bg-purple-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🎯 実現性</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 実現確率：60%以上</li>
                      <li>• 承認プロセス：複雑</li>
                      <li>• 必要人数：100人以上</li>
                      <li>• 法人全体の変革</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* STRATEGIC */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-pink-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('level-strategic') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="level-strategic">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">STRATEGIC（戦略レベル）</h3>
                    <p className="text-pink-400">1200点以上</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-pink-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">📋 特徴</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 業界革新レベル</li>
                      <li>• 実現期間：1-3年</li>
                      <li>• 予算：数千万円～数億円</li>
                      <li>• 社会的インパクト</li>
                    </ul>
                  </div>
                  <div className="bg-pink-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">💡 事例</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 遠隔医療プラットフォーム</li>
                      <li>• 医療AI研究開発</li>
                      <li>• 次世代医療システム</li>
                      <li>• 革新的治療法開発</li>
                    </ul>
                  </div>
                  <div className="bg-pink-900/30 p-4 rounded-lg">
                    <h4 className="text-white font-bold mb-2">🎯 実現性</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 実現確率：40-60%</li>
                      <li>• 承認プロセス：最高レベル</li>
                      <li>• 必要人数：数百人</li>
                      <li>• 業界を変える革新</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* レベル選択のヒント */}
            <div className={`bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/20 text-center animate-section transition-all duration-1000 ${
              visibleSections.has('level-tips') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="level-tips">
              <h3 className="text-xl font-bold text-white mb-4">
                💡 アイデア投稿のコツ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">🎯 小さく始める</h4>
                  <p className="text-gray-300 text-sm">
                    まずはTEAMレベルから始めて、成功実績を積んでから大きなアイデアに挑戦
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="text-white font-bold mb-2">🤝 協力者を見つける</h4>
                  <p className="text-gray-300 text-sm">
                    同じ課題を感じている同僚と一緒に投稿すると、より高い評価を得られます
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* サポート体制タブ */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20 animate-section transition-all duration-1000 ${
              visibleSections.has('support-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="support-header">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">👥</span>
                充実のサポート体制
              </h2>
              <p className="text-emerald-200 text-lg">
                アイデア投稿から実現まで、あなたをしっかりサポートします
              </p>
            </div>

            {/* 投稿前サポート */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('pre-support') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="pre-support">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">💭</span>
                投稿前サポート
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    相談窓口
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• <span className="text-blue-400 font-bold">専任スタッフ</span>がアイデアの整理をお手伝い</li>
                    <li>• 文章作成が苦手でも大丈夫</li>
                    <li>• 技術的な実現性の簡易チェック</li>
                    <li>• 類似アイデアとの差別化アドバイス</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-800/50 rounded">
                    <p className="text-blue-200 text-xs">
                      📞 内線1234 | 📧 idea-support@hospital.jp
                    </p>
                  </div>
                </div>

                <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    勉強会・ワークショップ
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 月1回「アイデア発想法」研修</li>
                    <li>• 「効果的な提案書の書き方」講座</li>
                    <li>• 過去の成功事例紹介セミナー</li>
                    <li>• 職種別アイデア交流会</li>
                  </ul>
                  <div className="mt-3 p-2 bg-green-800/50 rounded">
                    <p className="text-green-200 text-xs">
                      🗓️ 毎月第2金曜日 17:30～ | 📍 研修室A
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿後サポート */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('post-support') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="post-support">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                投稿後サポート
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    進捗フォロー
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 投票状況の定期報告</li>
                    <li>• フィードバック内容の説明</li>
                    <li>• 改善提案のサポート</li>
                    <li>• 追加資料作成支援</li>
                  </ul>
                </div>

                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">👨‍🏫</span>
                    メンター制度
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 成功経験者によるアドバイス</li>
                    <li>• 1対1の個別指導</li>
                    <li>• 技術的・実務的サポート</li>
                    <li>• 定期的な面談機会</li>
                  </ul>
                </div>

                <div className="bg-pink-900/30 p-4 rounded-lg border border-pink-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">🔧</span>
                    技術サポート
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• IT部門の専門的支援</li>
                    <li>• 実現可能性の詳細検討</li>
                    <li>• 技術仕様書作成支援</li>
                    <li>• 外部ベンダー紹介</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* プロジェクト化後サポート */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('project-support') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="project-support">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                プロジェクト化後サポート
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    チーム編成支援
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• <span className="text-orange-400 font-bold">適材適所</span>のメンバー選定</li>
                    <li>• 他部署からの協力者マッチング</li>
                    <li>• プロジェクトマネージャー配置</li>
                    <li>• 外部専門家の紹介</li>
                    <li>• チームビルディング研修</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="text-lg">💼</span>
                    プロジェクト管理支援
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• <span className="text-yellow-400 font-bold">専用ツール</span>の提供・指導</li>
                    <li>• 進捗管理テンプレート</li>
                    <li>• 定期レビュー会の運営</li>
                    <li>• 課題解決のためのコンサルティング</li>
                    <li>• 予算・スケジュール管理</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 研修・成長支援 */}
            <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30 animate-section transition-all duration-1000 ${
              visibleSections.has('training-support') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="training-support">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                研修・成長支援
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-500/30">
                  <h4 className="text-white font-bold mb-2 text-center">
                    <span className="text-lg block mb-1">🎯</span>
                    プロジェクト管理
                  </h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• PMPコース</li>
                    <li>• アジャイル手法</li>
                    <li>• リーダーシップ</li>
                  </ul>
                </div>

                <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-500/30">
                  <h4 className="text-white font-bold mb-2 text-center">
                    <span className="text-lg block mb-1">💻</span>
                    IT・デジタル
                  </h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• データ分析</li>
                    <li>• システム設計</li>
                    <li>• AI・機械学習</li>
                  </ul>
                </div>

                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30">
                  <h4 className="text-white font-bold mb-2 text-center">
                    <span className="text-lg block mb-1">💡</span>
                    イノベーション
                  </h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• デザイン思考</li>
                    <li>• 創造的問題解決</li>
                    <li>• ビジネスモデル</li>
                  </ul>
                </div>

                <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="text-white font-bold mb-2 text-center">
                    <span className="text-lg block mb-1">🏥</span>
                    医療専門
                  </h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• 医療安全</li>
                    <li>• 質改善</li>
                    <li>• 最新医療技術</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-800/30 to-teal-800/30 rounded-lg border border-cyan-500/30">
                <h4 className="text-white font-bold mb-2 text-center">🎓 特別特典</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-cyan-200 font-bold">プロジェクト成功者特典</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• 外部研修参加費全額支給</li>
                      <li>• 学会発表支援</li>
                      <li>• 資格取得奨励金</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-teal-200 font-bold">キャリア支援</p>
                    <ul className="text-gray-300 space-y-1">
                      <li>• 昇進・昇格への推薦</li>
                      <li>• 専門職コース配属優遇</li>
                      <li>• リーダーシップポジション候補</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 24時間サポート */}
            <div className={`bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 text-center animate-section transition-all duration-1000 ${
              visibleSections.has('support-contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} data-section="support-contact">
              <h3 className="text-xl font-bold text-white mb-4">
                🌟 いつでもサポート
              </h3>
              <p className="text-gray-300 mb-6">
                困ったときはいつでもお気軽にご連絡ください。専任チームがあなたの成功を全力でサポートします！
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <span className="text-3xl mb-2 block">📞</span>
                  <p className="text-white font-bold">電話サポート</p>
                  <p className="text-gray-300 text-sm">内線1234（平日9-17時）</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <span className="text-3xl mb-2 block">💬</span>
                  <p className="text-white font-bold">チャットサポート</p>
                  <p className="text-gray-300 text-sm">システム内24時間対応</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <span className="text-3xl mb-2 block">📧</span>
                  <p className="text-white font-bold">メールサポート</p>
                  <p className="text-gray-300 text-sm">support@voicedrive.jp</p>
                </div>
              </div>

              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 text-lg">
                🚀 サポートを受けながらアイデアを投稿
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