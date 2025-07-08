import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const ComplianceGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'flow' | 'cases' | 'protection' | 'results'>('overview');

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set([
      'header', 'intro', 'importance', 'principles', 'guarantee', 'summary',
      'types-header', 'type1', 'type2', 'type3', 'type4', 'type5', 'types-note',
      'flow-header', 'flow1', 'flow2', 'flow3', 'flow4', 'flow5', 'flow-timeline',
      'cases-header', 'case1', 'case2', 'case3', 'case4', 'case5', 'cases-reminder',
      'protection-header', 'protection1', 'protection2', 'protection3', 'protection4', 'protection-promise',
      'results-header', 'result1', 'result2', 'result3', 'result4', 'results-stats'
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
        <div className={`bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl p-8 backdrop-blur-xl border border-red-500/20 mb-8 animate-section transition-all duration-1000 ${
          visibleSections.has('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="header">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">🛡️</span>
            コンプライアンス窓口で安心の職場へ
          </h1>
          <p className="text-xl text-gray-300">
            あなたの勇気ある声が、健全な組織を作ります
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview' as const, label: 'コンプライアンス窓口とは', icon: '📋' },
              { id: 'types' as const, label: '相談できる内容', icon: '🔍' },
              { id: 'flow' as const, label: '相談の流れ', icon: '📞' },
              { id: 'cases' as const, label: '相談事例', icon: '💭' },
              { id: 'protection' as const, label: '相談者保護', icon: '🔒' },
              { id: 'results' as const, label: '改善実績', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg transform scale-105'
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
          {/* コンプライアンス窓口とは */}
          {activeTab === 'overview' && (
            <>
              {/* イントロダクション */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="intro">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">🤝</span>
                  コンプライアンス窓口ってなに？
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg leading-relaxed">
                    コンプライアンス窓口は、職場での<span className="text-red-400 font-semibold">不正行為、ハラスメント、法令違反</span>などを
                    安心して相談できる専門窓口です。組織の健全性を保ち、すべての職員が安心して働ける環境を作るために設置されています。
                  </p>
                  <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-500/20">
                    <p className="text-white font-semibold mb-2">🎯 重要ポイント</p>
                    <p>相談者の秘密は厳守され、不利益な扱いを受けることは絶対にありません！</p>
                  </div>
                </div>
              </div>

              {/* なぜ重要なのか */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('importance') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="importance">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-orange-400">⚡</span>
                  なぜコンプライアンス窓口が重要なの？
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <span>🏥</span> 組織にとって
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 問題の早期発見・解決</li>
                      <li>• 法的リスクの回避</li>
                      <li>• 組織の信頼性向上</li>
                      <li>• 健全な職場環境の維持</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <span>👤</span> 職員にとって
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 安心して働ける環境</li>
                      <li>• 問題解決の確実な道筋</li>
                      <li>• 自分や同僚を守る手段</li>
                      <li>• 組織改善への貢献</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 基本原則 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('principles') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="principles">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">📜</span>
                  コンプライアンス窓口の5つの原則
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: '🔒', title: '秘密厳守', desc: '相談内容と相談者の情報は厳重に保護されます' },
                    { icon: '⚖️', title: '公正中立', desc: '第三者的立場で公正に調査・対応します' },
                    { icon: '🛡️', title: '報復禁止', desc: '相談したことによる不利益な扱いは絶対に許されません' },
                    { icon: '🚀', title: '迅速対応', desc: '相談を受けたら速やかに調査・対応を開始します' },
                    { icon: '📊', title: '透明性', desc: '対応の進捗と結果は適切に報告されます' }
                  ].map(principle => (
                    <div key={principle.title} className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 hover:border-red-500/50 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-3">
                        <span className="text-3xl">{principle.icon}</span>
                        {principle.title}
                      </h4>
                      <p className="text-gray-300">{principle.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 安心保証 */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('guarantee') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="guarantee">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-red-400">💪</span>
                  VoiceDriveが守る3つの約束
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">1️⃣ 完全匿名での相談が可能</p>
                    <p className="text-gray-300">名前を明かさずに相談できます。調査に必要な場合も、同意なく身元を明かすことはありません。</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">2️⃣ 外部の専門機関と連携</p>
                    <p className="text-gray-300">必要に応じて、独立した外部機関や弁護士と連携し、公正な対応を保証します。</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">3️⃣ 相談者の保護を最優先</p>
                    <p className="text-gray-300">相談したことで不利益を受けた場合、組織として厳正に対処します。</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 相談できる内容 */}
          {activeTab === 'types' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('types-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="types-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">🔍</span>
                  どんなことを相談できるの？
                </h2>
                <p className="text-lg text-gray-300">
                  職場で「これっておかしいかも？」と感じたら、どんな小さなことでも相談してください。
                </p>
              </div>

              {/* 相談内容カテゴリー */}
              {[
                {
                  category: 'ハラスメント',
                  icon: '⚠️',
                  color: 'red',
                  examples: [
                    'パワーハラスメント（威圧的な言動、過度な叱責）',
                    'セクシャルハラスメント（性的な言動、不快な接触）',
                    'マタニティハラスメント（妊娠・出産への嫌がらせ）',
                    'その他のハラスメント（いじめ、無視、差別的扱い）'
                  ]
                },
                {
                  category: '不正行為',
                  icon: '🚨',
                  color: 'orange',
                  examples: [
                    '経費の不正使用・横領',
                    '虚偽の報告書作成',
                    '利益相反行為',
                    '情報の不正利用・漏洩'
                  ]
                },
                {
                  category: '法令違反',
                  icon: '⚖️',
                  color: 'yellow',
                  examples: [
                    '労働基準法違反（サービス残業強要など）',
                    '個人情報保護法違反',
                    '医療法・薬事法違反',
                    'その他の法令・規則違反'
                  ]
                },
                {
                  category: '安全衛生',
                  icon: '🏥',
                  color: 'green',
                  examples: [
                    '医療安全上の問題',
                    '感染対策の不備',
                    '危険な労働環境',
                    '設備・機器の安全性問題'
                  ]
                },
                {
                  category: 'その他の問題',
                  icon: '💬',
                  color: 'blue',
                  examples: [
                    '職場の雰囲気・人間関係の問題',
                    '業務プロセスの重大な問題',
                    '倫理的に問題のある行為',
                    '組織運営上の重大な懸念'
                  ]
                }
              ].map((type, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-${type.color}-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`type${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`type${index + 1}`}>
                  <h3 className={`text-xl font-bold text-white mb-4 flex items-center gap-3`}>
                    <span className="text-3xl">{type.icon}</span>
                    {type.category}
                  </h3>
                  <ul className="space-y-2">
                    {type.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className={`text-${type.color}-400 mt-1`}>•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 相談の目安 */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('types-note') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="types-note">
                <h3 className="text-2xl font-bold text-white mb-4">💡 迷ったら相談してください</h3>
                <div className="space-y-3 text-gray-300">
                  <p>「これは相談していいのかな？」と迷ったら、それは相談すべきサインかもしれません。</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>「みんな我慢してるから」と思っても、それは正常ではないかもしれません</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>小さな違和感が、大きな問題の兆候であることもあります</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span>あなたの勇気ある一歩が、多くの人を救うことにつながります</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* 相談の流れ */}
          {activeTab === 'flow' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('flow-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="flow-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">📞</span>
                  相談から解決までの流れ
                </h2>
                <p className="text-lg text-gray-300">
                  相談から問題解決まで、専門スタッフが丁寧にサポートします。
                </p>
              </div>

              {/* ステップ詳細 */}
              {[
                {
                  step: 1,
                  title: '相談する',
                  desc: 'VoiceDriveから簡単に相談を送信',
                  detail: '匿名でも実名でもOK。写真や資料の添付も可能です。24時間いつでも受付。',
                  time: '即時',
                  icon: '📝'
                },
                {
                  step: 2,
                  title: '受付確認',
                  desc: '相談を受け付けたことをお知らせ',
                  detail: '1営業日以内に受付確認の通知が届きます。追加情報が必要な場合はお知らせします。',
                  time: '1営業日以内',
                  icon: '✅'
                },
                {
                  step: 3,
                  title: '調査・検討',
                  desc: '専門チームが慎重に調査',
                  detail: '秘密を守りながら、事実関係を確認。必要に応じて外部専門家とも連携します。',
                  time: '1-2週間',
                  icon: '🔍'
                },
                {
                  step: 4,
                  title: '対応実施',
                  desc: '問題解決に向けた具体的な対応',
                  detail: '調査結果に基づき、適切な措置を実施。再発防止策も同時に検討します。',
                  time: '2-4週間',
                  icon: '⚡'
                },
                {
                  step: 5,
                  title: 'フィードバック',
                  desc: '対応結果をご報告',
                  detail: '個人情報に配慮しながら、対応結果をお知らせ。継続的なフォローも行います。',
                  time: '対応完了後',
                  icon: '📊'
                }
              ].map(item => (
                <div key={item.step} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`flow${item.step}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`flow${item.step}`}>
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-white">
                          Step {item.step}: {item.title}
                        </h3>
                        <span className="text-orange-400 font-semibold">{item.time}</span>
                      </div>
                      <p className="text-lg text-gray-300 mb-3">{item.desc}</p>
                      <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                        <p className="text-gray-300">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* タイムライン */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('flow-timeline') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="flow-timeline">
                <h3 className="text-2xl font-bold text-white mb-4">⏱️ 標準的な対応期間</h3>
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">緊急性の高い案件</span>
                      <span className="text-red-400 font-semibold">即日〜3日以内に初動対応</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">通常案件</span>
                      <span className="text-orange-400 font-semibold">2週間〜1ヶ月で解決</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">複雑な案件</span>
                      <span className="text-yellow-400 font-semibold">1〜3ヶ月で解決</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 相談事例 */}
          {activeTab === 'cases' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('cases-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="cases-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">💭</span>
                  実際の相談事例（プライバシー保護のため一部改変）
                </h2>
                <p className="text-lg text-gray-300">
                  どんな相談が寄せられ、どう解決されたか、実例をご紹介します。
                </p>
              </div>

              {/* 事例リスト */}
              {[
                {
                  title: 'パワーハラスメントの相談',
                  situation: '上司から日常的に大声で叱責され、人格を否定するような発言を受けていた',
                  action: '調査により事実を確認。該当上司への指導と配置転換を実施',
                  result: '職場環境が改善し、相談者は安心して業務に従事できるように',
                  category: 'ハラスメント'
                },
                {
                  title: 'サービス残業の強要',
                  situation: 'タイムカードを押してから残業するよう暗に指示されていた',
                  action: '労務管理の実態調査を実施。管理体制の見直しと未払い賃金の精算',
                  result: '適正な労働時間管理が徹底され、職員の健康も改善',
                  category: '法令違反'
                },
                {
                  title: '医療安全上の懸念',
                  situation: '人員不足により、安全な医療提供が困難な状況が続いていた',
                  action: '緊急対策チームを設置。人員配置の見直しと業務プロセスの改善',
                  result: '医療安全が確保され、職員の負担も軽減',
                  category: '安全衛生'
                },
                {
                  title: '経費の不正使用疑い',
                  situation: '部署の備品購入で不自然な支出が繰り返されていた',
                  action: '内部監査を実施し、不正を発見。関係者への処分と再発防止策を策定',
                  result: '経費管理体制が強化され、組織の信頼性が向上',
                  category: '不正行為'
                },
                {
                  title: '差別的な扱い',
                  situation: '特定の職員グループが昇進や研修機会から除外されていた',
                  action: '人事制度の見直しと公平性の確保。管理職への研修実施',
                  result: 'すべての職員に公平な機会が提供されるように',
                  category: 'その他'
                }
              ].map((case_, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`case${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`case${index + 1}`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{case_.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      case_.category === 'ハラスメント' ? 'bg-red-900/50 text-red-300' :
                      case_.category === '法令違反' ? 'bg-yellow-900/50 text-yellow-300' :
                      case_.category === '安全衛生' ? 'bg-green-900/50 text-green-300' :
                      case_.category === '不正行為' ? 'bg-orange-900/50 text-orange-300' :
                      'bg-gray-700/50 text-gray-300'
                    }`}>
                      {case_.category}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                      <p className="text-red-400 font-semibold mb-2">📋 相談内容</p>
                      <p className="text-gray-300">{case_.situation}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                      <p className="text-orange-400 font-semibold mb-2">🔧 対応内容</p>
                      <p className="text-gray-300">{case_.action}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                      <p className="text-green-400 font-semibold mb-2">✨ 結果</p>
                      <p className="text-gray-300">{case_.result}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* 相談のきっかけ */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('cases-reminder') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="cases-reminder">
                <h3 className="text-2xl font-bold text-white mb-4">💡 あなたも同じような経験はありませんか？</h3>
                <p className="text-gray-300 mb-4">
                  上記の事例は、どれも「最初は小さな違和感」から始まりました。
                  あなたが感じている違和感も、相談する価値があります。
                </p>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                  <p className="text-white font-semibold mb-2">🤝 一人で悩まないで</p>
                  <p className="text-gray-300">
                    問題を抱え込むことは、あなたにとっても組織にとってもマイナスです。
                    勇気を出して相談することで、より良い職場環境を作ることができます。
                  </p>
                </div>
              </div>
            </>
          )}

          {/* 相談者保護 */}
          {activeTab === 'protection' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('protection-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="protection-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">🔒</span>
                  相談者を守る仕組み
                </h2>
                <p className="text-lg text-gray-300">
                  相談者の安全と権利を守ることは、コンプライアンス窓口の最重要使命です。
                </p>
              </div>

              {/* 保護の仕組み */}
              {[
                {
                  title: '匿名性の保証',
                  icon: '🎭',
                  features: [
                    '完全匿名での相談が可能（名前・所属を明かさない）',
                    '相談記録は暗号化され、限定されたスタッフのみアクセス可能',
                    'IPアドレスなどの技術的情報も記録しない',
                    '調査の際も相談者が特定されないよう配慮'
                  ]
                },
                {
                  title: '報復行為の禁止',
                  icon: '🛡️',
                  features: [
                    '相談したことを理由とした不利益取扱いは厳禁',
                    '人事評価、配置転換、解雇などでの報復は許されない',
                    '報復行為があった場合は、厳正な処分を実施',
                    '報復の疑いがある場合も調査対象に'
                  ]
                },
                {
                  title: '情報管理の徹底',
                  icon: '🔐',
                  features: [
                    '相談内容は「Need to Know」原則で厳格に管理',
                    '調査に関わる職員には守秘義務を課す',
                    '相談記録は施錠管理、電子データは暗号化',
                    '一定期間後は適切に廃棄処理'
                  ]
                },
                {
                  title: '外部機関との連携',
                  icon: '🤝',
                  features: [
                    '必要に応じて外部の弁護士事務所と連携',
                    '労働基準監督署など公的機関への相談も支援',
                    '第三者委員会による公正な調査も可能',
                    '相談者の意向を最大限尊重した対応'
                  ]
                }
              ].map((item, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`protection${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`protection${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    {item.title}
                  </h3>
                  <ul className="space-y-2">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-red-400 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 相談者への約束 */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('protection-promise') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="protection-promise">
                <h3 className="text-2xl font-bold text-white mb-4">🤝 相談者への5つの約束</h3>
                <div className="space-y-4">
                  {[
                    { num: '1', text: 'あなたの秘密は必ず守ります' },
                    { num: '2', text: '相談による不利益は絶対に許しません' },
                    { num: '3', text: '真摯に耳を傾け、公正に対応します' },
                    { num: '4', text: '解決まで責任を持って支援します' },
                    { num: '5', text: 'あなたの勇気に心から感謝します' }
                  ].map(promise => (
                    <div key={promise.num} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 flex items-center gap-4">
                      <span className="text-2xl font-bold text-red-400">{promise.num}</span>
                      <span className="text-white text-lg">{promise.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 改善実績 */}
          {activeTab === 'results' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('results-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="results-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-red-400">📊</span>
                  コンプライアンス窓口がもたらした変化
                </h2>
                <p className="text-lg text-gray-300">
                  職員の皆さんの勇気ある相談が、組織をより良く変えています。
                </p>
              </div>

              {/* 改善実績 */}
              {[
                {
                  title: 'ハラスメント撲滅への取り組み',
                  before: 'ハラスメント相談が年間30件以上',
                  after: '管理職研修と相談体制強化により年間5件以下に',
                  impact: '職員満足度が65%→88%に向上',
                  icon: '🚫'
                },
                {
                  title: '労働環境の改善',
                  before: '慢性的な人手不足とサービス残業',
                  after: '適正な人員配置と労務管理システム導入',
                  impact: '月平均残業時間が45時間→20時間に削減',
                  icon: '⏰'
                },
                {
                  title: 'コンプライアンス文化の醸成',
                  before: '問題を見て見ぬふりする風土',
                  after: '積極的に問題提起する文化へ',
                  impact: 'コンプライアンス意識調査で90%が「向上した」と回答',
                  icon: '📈'
                },
                {
                  title: '医療安全の向上',
                  before: 'ヒヤリハット報告が少ない',
                  after: '報告しやすい環境整備と改善活動',
                  impact: '医療事故発生率が50%減少',
                  icon: '🏥'
                }
              ].map((result, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`result${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`result${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{result.icon}</span>
                    {result.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                      <p className="text-red-400 font-semibold mb-2">改善前</p>
                      <p className="text-gray-300">{result.before}</p>
                    </div>
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                      <p className="text-green-400 font-semibold mb-2">改善後</p>
                      <p className="text-gray-300">{result.after}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-blue-400 font-semibold mb-1">成果</p>
                    <p className="text-white">{result.impact}</p>
                  </div>
                </div>
              ))}

              {/* 統計データ */}
              <div className={`bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('results-stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="results-stats">
                <h3 className="text-2xl font-bold text-white mb-6">📊 コンプライアンス窓口の実績（2024年度）</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-red-400 mb-2">156</p>
                    <p className="text-gray-300">相談件数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-400 mb-2">92%</p>
                    <p className="text-gray-300">解決率</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-400 mb-2">14日</p>
                    <p className="text-gray-300">平均解決日数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-400 mb-2">96%</p>
                    <p className="text-gray-300">相談者満足度</p>
                  </div>
                </div>
                <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                  <p className="text-white text-center">
                    <span className="text-2xl">🎯</span> あなたの相談が、次の改善につながります
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            勇気を出して、一歩踏み出そう
          </h2>
          <p className="text-xl text-white/90 mb-6">
            あなたの声が、より良い職場を作ります
          </p>
          <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
            コンプライアンス窓口に相談する
          </button>
          <p className="text-white/80 mt-4 text-sm">
            ※ 完全匿名で相談可能です
          </p>
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

export default ComplianceGuide;