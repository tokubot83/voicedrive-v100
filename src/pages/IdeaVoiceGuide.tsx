import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const IdeaVoiceGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'flow' | 'examples' | 'faq' | 'support'>('overview');
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // プログレスバーアニメーション
    const timer = setTimeout(() => setProgressWidth(100), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set([
      'header', 'intro', 'why', 'fairness', 'transparent', 'summary',
      'system-header', 'weight-system', 'anonymous-system', 'calculation', 'levels', 'approval',
      'flow-header', 'step1', 'step2', 'step3', 'step4', 'step5', 'flow-timeline',
      'examples-header', 'nurse-cases', 'doctor-cases', 'admin-cases', 'tech-cases', 'examples-stats',
      'faq-header', 'faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq-footer',
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

  // 重み付けチャートデータ
  const weightData = [
    { name: '医師', weight: 3.0, color: 'rgba(220, 38, 127, 0.8)', percentage: 100 },
    { name: '看護師', weight: 2.0, color: 'rgba(59, 130, 246, 0.8)', percentage: 67 },
    { name: 'その他医療職', weight: 1.5, color: 'rgba(16, 185, 129, 0.8)', percentage: 50 },
    { name: '事務職', weight: 1.0, color: 'rgba(245, 158, 11, 0.8)', percentage: 33 }
  ];

  const votingScale = [
    { value: -2, label: '強く反対', color: 'from-red-500 to-red-600', icon: '👎' },
    { value: -1, label: '反対', color: 'from-orange-500 to-orange-600', icon: '😕' },
    { value: 0, label: '中立', color: 'from-gray-400 to-gray-500', icon: '😐' },
    { value: 1, label: '賛成', color: 'from-green-500 to-green-600', icon: '😊' },
    { value: 2, label: '強く賛成', color: 'from-emerald-500 to-emerald-600', icon: '👍' }
  ];

  const projectLevels = [
    { level: 'PENDING', range: '0-49点', icon: '💭', color: 'from-gray-400 to-gray-500', description: '議論段階' },
    { level: 'TEAM', range: '50-99点', icon: '👥', color: 'from-blue-400 to-blue-500', description: 'チームレベル' },
    { level: 'DEPARTMENT', range: '100-299点', icon: '🏢', color: 'from-cyan-400 to-cyan-500', description: '部署レベル' },
    { level: 'FACILITY', range: '300-599点', icon: '🏥', color: 'from-green-400 to-green-500', description: '施設レベル' },
    { level: 'ORGANIZATION', range: '600-1199点', icon: '🏛️', color: 'from-purple-400 to-purple-500', description: '法人レベル' },
    { level: 'STRATEGIC', range: '1200点以上', icon: '🚀', color: 'from-pink-400 to-pink-500', description: '戦略レベル' }
  ];

  const anonymityLevels = [
    { level: 'real_name', label: '実名表示', icon: '👤', description: '氏名が表示されます', security: '低' },
    { level: 'facility_department', label: '施設・部署名', icon: '🏥', description: '○○病院 内科職員', security: '中' },
    { level: 'facility_anonymous', label: '施設名のみ', icon: '🏢', description: '○○病院 匿名職員', security: '中高' },
    { level: 'department_only', label: '部署名のみ', icon: '📋', description: '内科職員', security: '高' },
    { level: 'anonymous', label: '完全匿名', icon: '🔒', description: '匿名職員', security: '最高' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className={`bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8 animate-section transition-all duration-1000 ${
          visibleSections.has('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="header">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">💡</span>
            VoiceDrive アイデアボイス完全ガイド
          </h1>
          <p className="text-xl text-gray-300">
            あなたのアイデアが組織を変える革新的意思決定システム
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview' as const, label: 'アイデアボイスとは', icon: '🌟' },
              { id: 'system' as const, label: '投票システム', icon: '🗳️' },
              { id: 'flow' as const, label: '投票の流れ', icon: '📝' },
              { id: 'examples' as const, label: '成功事例', icon: '🏆' },
              { id: 'faq' as const, label: 'よくある質問', icon: '❓' },
              { id: 'support' as const, label: 'サポート体制', icon: '🤝' }
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
          {/* アイデアボイスとは */}
          {activeTab === 'overview' && (
            <>
              {/* イントロダクション */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="intro">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🌟</span>
                  アイデアボイスってなに？
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg leading-relaxed">
                    アイデアボイスは、職員の皆さんが<span className="text-blue-400 font-semibold">アイデアや改善提案に投票できる</span>VoiceDriveの中核機能です。
                    一般的な投票システムと違い、職種・経験・役職に応じた重み付けにより、
                    <span className="text-purple-400 font-semibold">すべての立場の声を公平に反映</span>します。
                  </p>
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                    <p className="text-white font-semibold mb-2">💡 ポイント</p>
                    <p>「多数決」ではなく「多様性を尊重した意思決定」を実現しています！</p>
                  </div>
                </div>
              </div>

              {/* なぜアイデアボイスが必要なのか */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('why') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="why">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">🎯</span>
                  なぜアイデアボイスが必要なの？
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-red-400 mb-3">❌ 従来の問題</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 声の大きい人の意見が通りがち</li>
                      <li>• 専門知識の差が考慮されない</li>
                      <li>• 少数派の意見が無視される</li>
                      <li>• 階層による発言力の格差</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-green-400 mb-3">✅ アイデアボイス</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 専門性に応じた重み付け</li>
                      <li>• 匿名投票で平等な発言</li>
                      <li>• 少数派の声も適切に反映</li>
                      <li>• 透明性の高い意思決定</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 公平性の実現 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('fairness') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="fairness">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">⚖️</span>
                  公平性を実現する3つの柱
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                      <span className="text-3xl">🏗️</span>
                      重み付けシステム
                    </h4>
                    <p className="text-gray-300 mb-4">職種・経験・役職に応じた適切な重み付けで、専門性と責任を考慮</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {weightData.map(item => (
                        <div key={item.name} className="text-center">
                          <div className="text-2xl font-bold text-white">{item.weight}倍</div>
                          <div className="text-sm text-gray-400">{item.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                      <span className="text-3xl">🔒</span>
                      匿名投票システム
                    </h4>
                    <p className="text-gray-300">5段階の匿名レベルで、投票者の身元を保護しながら透明性を確保</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                      <span className="text-3xl">📊</span>
                      段階的実行システム
                    </h4>
                    <p className="text-gray-300">得点に応じて6段階のレベルで、小さなアイデアから大きな変革まで対応</p>
                  </div>
                </div>
              </div>

              {/* 透明性の保証 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('transparent') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="transparent">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">🔍</span>
                  透明性の保証
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-lg font-semibold text-white mb-2">📈 リアルタイム結果表示</h4>
                    <p className="text-gray-300">投票結果はリアルタイムで更新され、誰でも確認可能</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-lg font-semibold text-white mb-2">🔢 計算式の公開</h4>
                    <p className="text-gray-300">重み付けの計算方法を完全公開し、結果の妥当性を保証</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-lg font-semibold text-white mb-2">📋 履歴の保存</h4>
                    <p className="text-gray-300">すべての投票履歴を保存し、後から検証可能</p>
                  </div>
                </div>
              </div>

              {/* まとめ */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('summary') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="summary">
                <h3 className="text-2xl font-bold text-white mb-4">🎊 アイデアボイスで実現する未来</h3>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg">
                    アイデアボイスは、<span className="text-blue-400 font-semibold">全ての職員の声を公平に反映</span>し、
                    <span className="text-purple-400 font-semibold">データに基づいた意思決定</span>を実現します。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🌟</div>
                      <div className="text-white font-semibold">公平性</div>
                      <div className="text-sm text-gray-300">すべての声を平等に</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🔍</div>
                      <div className="text-white font-semibold">透明性</div>
                      <div className="text-sm text-gray-300">プロセスを完全公開</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🚀</div>
                      <div className="text-white font-semibold">効率性</div>
                      <div className="text-sm text-gray-300">迅速な意思決定</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 投票システム */}
          {activeTab === 'system' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('system-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="system-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🗳️</span>
                  投票システムの仕組み
                </h2>
                <p className="text-lg text-gray-300">
                  VoiceDriveの投票システムは、公平性と透明性を両立した革新的な仕組みです。
                </p>
              </div>

              {/* 重み付けシステム */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('weight-system') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="weight-system">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">⚖️</span>
                  重み付けシステム
                </h3>
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-4">職種別重み付け</h4>
                    <div className="space-y-3">
                      {weightData.map(item => (
                        <div key={item.name} className="flex items-center gap-4">
                          <div className="w-20 text-white font-semibold">{item.name}</div>
                          <div className="flex-1 bg-gray-600 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <div className="text-white font-bold">{item.weight}倍</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-4">追加重み付け要素</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 font-semibold mb-2">👔 役職加算</p>
                        <p className="text-gray-300 text-sm">管理職: +0.2倍、主任: +0.1倍</p>
                      </div>
                      <div>
                        <p className="text-green-400 font-semibold mb-2">📅 経験加算</p>
                        <p className="text-gray-300 text-sm">20年以上: +0.3倍、10年以上: +0.2倍</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 匿名システム */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('anonymous-system') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="anonymous-system">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🔒</span>
                  匿名投票システム
                </h3>
                <div className="space-y-4">
                  {anonymityLevels.map(level => (
                    <div key={level.level} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 flex items-center gap-4">
                      <span className="text-2xl">{level.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{level.label}</h4>
                        <p className="text-gray-300 text-sm">{level.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        level.security === '最高' ? 'bg-green-900/50 text-green-300' :
                        level.security === '高' ? 'bg-blue-900/50 text-blue-300' :
                        level.security === '中高' ? 'bg-yellow-900/50 text-yellow-300' :
                        level.security === '中' ? 'bg-orange-900/50 text-orange-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {level.security}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 計算システム */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('calculation') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="calculation">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">🔢</span>
                  スコア計算システム
                </h3>
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-4">投票スケール</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {votingScale.map(option => (
                        <div key={option.value} className={`bg-gradient-to-r ${option.color} rounded-xl p-4 text-center text-white`}>
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm opacity-90">{option.value}点</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-white mb-4">計算式</h4>
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30 font-mono text-sm">
                      <p className="text-green-400">最終スコア = Σ(投票値 × 職種重み × 役職重み × 経験重み)</p>
                      <p className="text-gray-300 mt-2">例: 医師(3.0) × 管理職(1.2) × 20年以上(1.3) × 賛成(+1) = 4.68点</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* レベルシステム */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('levels') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="levels">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">📊</span>
                  プロジェクトレベル
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectLevels.map(level => (
                    <div key={level.level} className={`bg-gradient-to-r ${level.color} rounded-xl p-6 text-white`}>
                      <div className="text-3xl mb-2">{level.icon}</div>
                      <h4 className="text-lg font-bold mb-2">{level.description}</h4>
                      <p className="text-sm opacity-90">{level.range}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 承認システム */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('approval') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="approval">
                <h3 className="text-2xl font-bold text-white mb-4">✅ 承認・実行システム</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">🎯 自動承認</p>
                    <p className="text-gray-300 text-sm">50点以上で自動的にプロジェクトとして承認され、実行に移ります</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">📈 段階的拡大</p>
                    <p className="text-gray-300 text-sm">スコアに応じて影響範囲が拡大し、必要な承認レベルも上がります</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">🔄 継続的改善</p>
                    <p className="text-gray-300 text-sm">実行後も継続的に投票を受け付け、改善を続けます</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 投票の流れ */}
          {activeTab === 'flow' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('flow-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="flow-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">📝</span>
                  投票の流れ
                </h2>
                <p className="text-lg text-gray-300">
                  アイデアボイスでの投票は、たった5ステップで完了します。
                </p>
              </div>

              {/* 投票ステップ */}
              {[
                {
                  step: 1,
                  title: 'アイデアを見つける',
                  desc: 'ホーム画面で投票できるアイデアを確認',
                  detail: '新着アイデアから人気のアイデアまで、カテゴリ別に整理されています。あなたが関心のあるアイデアを見つけてください。',
                  icon: '🔍'
                },
                {
                  step: 2,
                  title: '内容を理解する',
                  desc: 'アイデアの詳細を読み、背景や目的を理解',
                  detail: '提案者の意図、期待される効果、実現可能性などを総合的に判断してください。質問があれば、コメント欄で確認もできます。',
                  icon: '📖'
                },
                {
                  step: 3,
                  title: '投票レベルを選択',
                  desc: '5段階の投票レベルから、あなたの意見を選択',
                  detail: '強く反対(-2)から強く賛成(+2)まで、あなたの気持ちに最も近い選択肢を選んでください。',
                  icon: '✋'
                },
                {
                  step: 4,
                  title: '匿名レベルを設定',
                  desc: '投票時の匿名レベルを選択',
                  detail: '実名表示から完全匿名まで、あなたの希望に応じて設定できます。いつでも変更可能です。',
                  icon: '🔒'
                },
                {
                  step: 5,
                  title: '投票完了',
                  desc: 'コメント追加（任意）して投票完了',
                  detail: '投票理由やアドバイスをコメントで追加できます。あなたの専門知識を活かした建設的な意見をお待ちしています。',
                  icon: '✅'
                }
              ].map(item => (
                <div key={item.step} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`step${item.step}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`step${item.step}`}>
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
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

              {/* 投票のコツ */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('flow-timeline') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="flow-timeline">
                <h3 className="text-2xl font-bold text-white mb-4">💡 効果的な投票のコツ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-blue-400 font-semibold mb-2">📊 データを重視</p>
                    <p className="text-gray-300 text-sm">感情的な判断より、客観的なデータに基づいて投票</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-purple-400 font-semibold mb-2">🎯 現実的な視点</p>
                    <p className="text-gray-300 text-sm">実現可能性と効果を総合的に判断</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-green-400 font-semibold mb-2">💬 建設的なコメント</p>
                    <p className="text-gray-300 text-sm">改善案や懸念点を建設的に共有</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 成功事例 */}
          {activeTab === 'examples' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('examples-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="examples-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🏆</span>
                  アイデアボイス成功事例
                </h2>
                <p className="text-lg text-gray-300">
                  実際にアイデアボイスで実現されたプロジェクトをご紹介します。
                </p>
              </div>

              {/* 職種別成功事例 */}
              {[
                {
                  category: '看護師提案',
                  icon: '👩‍⚕️',
                  color: 'blue',
                  title: '患者移送システムの効率化',
                  problem: '患者移送時の待ち時間が長く、業務効率が低下',
                  solution: 'リアルタイム位置情報システムの導入',
                  result: '移送時間30%短縮、患者満足度15%向上',
                  score: '287点 → 部署レベル実装',
                  votes: '賛成78% 反対12% 中立10%'
                },
                {
                  category: '医師提案',
                  icon: '👨‍⚕️',
                  color: 'purple',
                  title: '診療科間連携システム',
                  problem: '診療科間の情報共有が不十分で重複検査が発生',
                  solution: '統合電子カルテシステムの機能拡張',
                  result: '重複検査40%削減、診療時間20%短縮',
                  score: '456点 → 施設レベル実装',
                  votes: '賛成85% 反対8% 中立7%'
                },
                {
                  category: '事務職提案',
                  icon: '💼',
                  color: 'green',
                  title: '予約システムの自動化',
                  problem: '電話予約の対応で事務職の負担が増大',
                  solution: 'AI音声認識による自動予約システム',
                  result: '事務処理時間50%削減、予約精度向上',
                  score: '198点 → 部署レベル実装',
                  votes: '賛成72% 反対15% 中立13%'
                },
                {
                  category: '技術職提案',
                  icon: '🔧',
                  color: 'orange',
                  title: '医療機器メンテナンス予知システム',
                  problem: '医療機器の故障による手術延期が発生',
                  solution: 'IoTセンサーによる予知保全システム',
                  result: '機器故障60%減少、手術延期ゼロ',
                  score: '623点 → 法人レベル実装',
                  votes: '賛成91% 反対4% 中立5%'
                }
              ].map((example, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-${example.color}-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`${example.category.toLowerCase()}-cases`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`${example.category.toLowerCase()}-cases`}>
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{example.icon}</span>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${example.color}-900/50 text-${example.color}-300`}>
                        {example.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">{example.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                      <p className="text-red-400 font-semibold mb-2">❌ 課題</p>
                      <p className="text-gray-300">{example.problem}</p>
                    </div>
                    <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
                      <p className="text-blue-400 font-semibold mb-2">💡 解決策</p>
                      <p className="text-gray-300">{example.solution}</p>
                    </div>
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                      <p className="text-green-400 font-semibold mb-2">✨ 結果</p>
                      <p className="text-gray-300">{example.result}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700/30 rounded-xl p-3">
                        <p className="text-purple-400 font-semibold text-sm">📊 最終スコア</p>
                        <p className="text-white">{example.score}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-xl p-3">
                        <p className="text-yellow-400 font-semibold text-sm">🗳️ 投票結果</p>
                        <p className="text-white">{example.votes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 統計データ */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('examples-stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="examples-stats">
                <h3 className="text-2xl font-bold text-white mb-6">📊 アイデアボイスの実績（2024年度）</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-400 mb-2">847</p>
                    <p className="text-gray-300">投票済みアイデア</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-400 mb-2">156</p>
                    <p className="text-gray-300">実装されたプロジェクト</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-400 mb-2">92%</p>
                    <p className="text-gray-300">職員満足度</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-400 mb-2">2.3億円</p>
                    <p className="text-gray-300">コスト削減効果</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* よくある質問 */}
          {activeTab === 'faq' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">❓</span>
                  よくある質問
                </h2>
                <p className="text-lg text-gray-300">
                  アイデアボイスについての疑問にお答えします。
                </p>
              </div>

              {/* FAQ項目 */}
              {[
                {
                  question: '重み付けは公平ですか？',
                  answer: '重み付けは職種の専門性と責任度に基づいて設定されています。計算式は完全に公開されており、透明性を保っています。また、定期的に職員アンケートを実施し、重み付けの妥当性を検証しています。'
                },
                {
                  question: '匿名投票でも重み付けはされますか？',
                  answer: 'はい、匿名投票でも重み付けは適用されます。システムは投票者の属性情報（職種、経験年数、役職）を把握していますが、投票内容と個人を結びつけることはできません。'
                },
                {
                  question: '一度投票した後で意見を変更できますか？',
                  answer: 'はい、投票期間中であれば何度でも投票を変更できます。最後の投票が有効となり、変更履歴は投票者本人以外には見えません。'
                },
                {
                  question: '自分の投票がどのくらい影響しているかわかりますか？',
                  answer: '個人の投票の影響度は表示されませんが、全体の投票状況や職種別の傾向は確認できます。これにより、自分の意見が全体の中でどの位置にあるかを把握できます。'
                },
                {
                  question: 'アイデアに対してコメントできますか？',
                  answer: 'はい、投票時にコメントを追加できます。コメントは投票と同じ匿名レベルで表示され、建設的な議論を促進します。ただし、不適切なコメントは削除される場合があります。'
                },
                {
                  question: '投票結果はいつ公開されますか？',
                  answer: '投票結果はリアルタイムで更新されます。ただし、投票期間中は中間結果として表示され、期間終了後に最終結果が確定します。重要な案件では、結果の詳細分析レポートも公開されます。'
                }
              ].map((faq, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`faq${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`faq${index + 1}`}>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <div className="ml-6 bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <p className="text-gray-300">
                      <span className="text-purple-400 font-semibold">A. </span>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}

              {/* 追加サポート */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq-footer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq-footer">
                <h3 className="text-2xl font-bold text-white mb-4">🤔 他にも質問がありますか？</h3>
                <p className="text-gray-300 mb-6">
                  ここに載っていない質問があれば、お気軽にお問い合わせください。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    💬 チャットで質問
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    📧 メールで問い合わせ
                  </button>
                </div>
              </div>
            </>
          )}

          {/* サポート体制 */}
          {activeTab === 'support' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('support-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="support-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🤝</span>
                  サポート体制
                </h2>
                <p className="text-lg text-gray-300">
                  アイデアボイスを効果的に活用するためのサポート体制をご紹介します。
                </p>
              </div>

              {/* サポート内容 */}
              {[
                {
                  title: '導入前サポート',
                  icon: '📚',
                  color: 'blue',
                  items: [
                    'システム説明会の実施',
                    '操作マニュアルの配布',
                    '個別質問対応',
                    'デモンストレーション'
                  ]
                },
                {
                  title: '運用中サポート',
                  icon: '🔧',
                  color: 'green',
                  items: [
                    '24時間技術サポート',
                    '定期的な使い方講習',
                    'トラブル対応',
                    'システム最適化提案'
                  ]
                },
                {
                  title: 'プロジェクト支援',
                  icon: '🚀',
                  color: 'purple',
                  items: [
                    'アイデア実装支援',
                    '効果測定サポート',
                    'チーム編成支援',
                    '進捗管理ツール提供'
                  ]
                },
                {
                  title: 'トレーニング',
                  icon: '🎓',
                  color: 'orange',
                  items: [
                    '効果的な投票方法',
                    'アイデア発想法',
                    'データ分析手法',
                    'プロジェクト管理技術'
                  ]
                }
              ].map((support, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-${support.color}-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`support-${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`support-${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{support.icon}</span>
                    {support.title}
                  </h3>
                  <ul className="space-y-2">
                    {support.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className={`text-${support.color}-400 mt-1`}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 連絡先 */}
              <div className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('support-contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="support-contact">
                <h3 className="text-2xl font-bold text-white mb-6">📞 サポート連絡先</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                    <h4 className="text-lg font-semibold text-white mb-4">緊急時サポート</h4>
                    <div className="space-y-2 text-gray-300">
                      <p>📞 内線: 1234</p>
                      <p>📧 emergency@voicedrive.com</p>
                      <p>🕐 24時間対応</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                    <h4 className="text-lg font-semibold text-white mb-4">一般サポート</h4>
                    <div className="space-y-2 text-gray-300">
                      <p>📞 内線: 5678</p>
                      <p>📧 support@voicedrive.com</p>
                      <p>🕐 平日 9:00-18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐアイデアボイスを始めよう！
          </h2>
          <p className="text-xl text-white/90 mb-6">
            あなたのアイデアが組織の未来を変える
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
            投票ページに移動
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

export default IdeaVoiceGuide;