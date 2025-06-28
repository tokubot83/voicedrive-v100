import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const VotingSystemGuide: React.FC = () => {
  const [progressWidth, setProgressWidth] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    // プログレスバーアニメーション
    const timer = setTimeout(() => setProgressWidth(100), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする（アニメーション効果は残す）
    setVisibleSections(new Set([0, 1, 2, '2.5', 3, 4, 5, 6, 7]));
    
    // スクロールアニメーションの監視
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section') || '0';
            setVisibleSections(prev => new Set(prev).add(sectionId));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 重み付けチャートデータ（CSS実装用）
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

  const weightFactors = [
    { category: '職種', factors: [
      { name: '医師', weight: '3.0倍', description: '最高専門性・最終責任' },
      { name: '看護師', weight: '2.0倍', description: '高専門性・直接ケア' },
      { name: 'その他医療職', weight: '1.5倍', description: '専門性・チーム医療' },
      { name: '事務職', weight: '1.0倍', description: '基準値・サポート業務' }
    ]},
    { category: '経験年数', factors: [
      { name: '20年以上', weight: '+0.3倍', description: 'ベテラン・指導的立場' },
      { name: '10-19年', weight: '+0.2倍', description: '中堅・リーダー' },
      { name: '5-9年', weight: '+0.1倍', description: '経験者・独立業務' },
      { name: '5年未満', weight: '±0倍', description: '基準値・新人〜若手' }
    ]},
    { category: '役職', factors: [
      { name: '管理職', weight: '+0.2倍', description: '組織運営・意思決定' },
      { name: '主任・係長', weight: '+0.1倍', description: '現場リーダー' },
      { name: '一般職', weight: '±0倍', description: '基準値・現場業務' }
    ]}
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
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">🏥</span>
            VoiceDrive アイデアボイス投票システム
          </h1>
          <p className="text-xl text-gray-300">
            医療従事者の声を数値化し、組織レベルで意思決定をサポートする包括的システム
          </p>
        </div>

        {/* VoiceDriveの特徴 */}
        <div className={`animate-section bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl p-8 backdrop-blur border border-green-500/20 mb-8 transition-all duration-700 ${
          visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="0">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">✨</span>
            VoiceDriveの特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-xl font-bold text-white">客観的評価システム</h3>
                  <p className="text-gray-300">専門性と経験に基づく重み付けで公正な評価</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="text-xl font-bold text-white">完全匿名保証</h3>
                  <p className="text-gray-300">5段階の匿名レベルで安心して投票</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-xl font-bold text-white">自動化された承認フロー</h3>
                  <p className="text-gray-300">スコアに応じて適切な承認者を自動設定</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-xl font-bold text-white">透明性の高い可視化</h3>
                  <p className="text-gray-300">リアルタイムでスコアと進捗を確認</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-xl font-bold text-white">組織レベルでの意思決定</h3>
                  <p className="text-gray-300">個人から戦略レベルまで幅広くカバー</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-xl font-bold text-white">継続的改善促進</h3>
                  <p className="text-gray-300">現場の声を組織運営に直接反映</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5段階投票システム */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="1">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            5段階投票システム
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            すべての投稿に対して、職員は以下の5段階で客観的評価を行います
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {votingScale.map((scale, index) => (
              <div 
                key={scale.value}
                className={`bg-gradient-to-br ${scale.color} p-6 rounded-xl text-white text-center transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="text-4xl mb-2">{scale.icon}</div>
                <div className="text-3xl font-bold mb-2">{scale.value > 0 ? '+' : ''}{scale.value}</div>
                <div className="font-semibold">{scale.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 重み付けシステム */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="1">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">⚖️</span>
            重み付けシステム
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            専門性、経験、責任に応じた多層的重み付けシステム
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* チャート */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">職種別重み付け倍率</h3>
              <div className="space-y-4">
                {weightData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{item.name}</span>
                      <span className="text-blue-400 font-bold">{item.weight}倍</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${item.percentage}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                        {item.weight}倍
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 詳細説明 */}
            <div className="space-y-6">
              {weightFactors.map((category, index) => (
                <div key={category.category} className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{category.category}による重み付け</h3>
                  <div className="space-y-3">
                    {category.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                        <div>
                          <div className="font-semibold text-white">{factor.name}</div>
                          <div className="text-sm text-gray-400">{factor.description}</div>
                        </div>
                        <div className="text-lg font-bold text-blue-400">{factor.weight}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 匿名システム */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="2">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🔒</span>
            完全匿名投票システム
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            安心して投票できる5段階の匿名レベル設定
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {anonymityLevels.map((level, index) => (
              <div key={level.level} className="bg-gray-700/40 rounded-xl p-6 text-center border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-4xl mb-3">{level.icon}</div>
                <div className="font-bold text-white mb-2">{level.label}</div>
                <div className="text-sm text-gray-400 mb-3">{level.description}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  level.security === '最高' ? 'bg-green-500/20 text-green-400' :
                  level.security === '高' ? 'bg-blue-500/20 text-blue-400' :
                  level.security === '中高' ? 'bg-yellow-500/20 text-yellow-400' :
                  level.security === '中' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  秘匿性: {level.security}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-green-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🛡️</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">投票の安全性保証</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• 投票は暗号化されて保存され、個人特定は不可能</li>
                  <li>• 管理者でも誰が何に投票したかは確認できません</li>
                  <li>• 統計データのみが公開され、個別の投票情報は非公開</li>
                  <li>• 報復や不利益を心配せず、自由に意見を表明できます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 投票中立性と比較 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('2.5') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="2.5">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">⚖️</span>
            真の投票中立性の実現
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            多様性を尊重し、構造的不公平を解消する革新的投票システム
          </p>

          {/* VoiceDriveが解決する構造的問題 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌐</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">VoiceDriveが解決する構造的不公平</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">世代間格差の解消</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Z世代の革新的視点を適切に評価</li>
                      <li>• ベテランの経験知を尊重</li>
                      <li>• 年齢による発言力の偏りを是正</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">職種間公平性の実現</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• 現場職員の声を適切に反映</li>
                      <li>• 管理職の戦略的視点を活用</li>
                      <li>• 職種の人数差による不利益を解消</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">経験差の適正評価</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• 新人の新鮮な視点を重視</li>
                      <li>• 中堅職員のバランス感覚を活用</li>
                      <li>• 経験年数による序列主義を排除</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* カテゴリ別重み付け調整 */}
          <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎛️</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">カテゴリ別適応的重み付けシステム</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  投稿カテゴリの特性に応じて、各グループの発言力を動的に調整する革新的機能
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      category: '業務改善提案',
                      weights: [
                        { group: '現場スタッフ', weight: '50%', reason: '実際の業務経験' },
                        { group: 'ベテラン職員', weight: '30%', reason: '改善ノウハウ' },
                        { group: '管理職', weight: '15%', reason: '実現可能性' },
                        { group: 'Z世代', weight: '5%', reason: '新しい視点' }
                      ],
                      color: 'bg-blue-500/20'
                    },
                    {
                      category: 'イノベーション提案',
                      weights: [
                        { group: 'Z世代', weight: '40%', reason: '新技術親和性' },
                        { group: '現場スタッフ', weight: '30%', reason: '実用性評価' },
                        { group: '管理職', weight: '20%', reason: '導入判断' },
                        { group: 'ベテラン職員', weight: '10%', reason: '変化適応' }
                      ],
                      color: 'bg-purple-500/20'
                    }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-4`}>
                      <h4 className="font-semibold text-white mb-3">{item.category}</h4>
                      <div className="space-y-2">
                        {item.weights.map((weight, wIndex) => (
                          <div key={wIndex} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-gray-200">{weight.group}</span>
                              <div className="text-xs text-gray-400">{weight.reason}</div>
                            </div>
                            <span className="text-yellow-400 font-bold">{weight.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 比較例 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来の1人1票システム */}
            <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 p-6 rounded-xl border border-orange-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🗳️</span>
                従来の1人1票システム
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">投票結果例：「業務効率化システム導入」</h4>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <div>Z世代（20名）: 強く賛成(+2) = 40票</div>
                    <div>中堅職員（15名）: 賛成(+1) = 15票</div>
                    <div>ベテラン（30名）: 反対(-1) = -30票</div>
                    <div>管理職（5名）: 賛成(+1) = 5票</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-400">合計: +30票</div>
                  <div className="text-sm text-gray-300 mt-2">✅ 数の論理で承認</div>
                </div>

                <div className="bg-red-900/30 p-3 rounded-lg">
                  <h5 className="text-red-400 font-semibold mb-1">構造的問題</h5>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• 世代間の人数差が結果を左右</li>
                    <li>• ベテランの経験知が軽視される</li>
                    <li>• 組織の多様性が反映されない</li>
                    <li>• 実施責任者の判断が軽視される</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveの重み付けシステム */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                VoiceDrive多様性重視システム
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">カテゴリ別重み付け後の結果</h4>
                  <div className="space-y-2 text-gray-300 text-sm">
                    <div>Z世代: 40点 × 40% = 16点 (技術親和性)</div>
                    <div>現場職員: 15点 × 30% = 4.5点 (実用性)</div>
                    <div>ベテラン: -30点 × 10% = -3点 (変化適応)</div>
                    <div>管理職: 5点 × 20% = 1点 (導入責任)</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">合計: +18.5点</div>
                  <div className="text-sm text-gray-300 mt-2">✅ 多様性を考慮した適切な判断</div>
                </div>

                <div className="bg-green-900/30 p-3 rounded-lg">
                  <h5 className="text-green-400 font-semibold mb-1">多様性の実現</h5>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• 各世代の特性が適切に反映</li>
                    <li>• 少数派の重要な視点も評価</li>
                    <li>• カテゴリに応じた柔軟な判断</li>
                    <li>• 組織全体のバランスを考慮</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* スコア分布の視覚的比較 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">同じ投票内容でのスコア比較</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1人1票システムのグラフ */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-orange-400 text-center">1人1票システム</h4>
                <div className="space-y-3">
                  {[
                    { name: '医師', votes: 2, color: 'bg-blue-500', percentage: 7 },
                    { name: '看護師', votes: 10, color: 'bg-green-500', percentage: 37 },
                    { name: '事務職', votes: -20, color: 'bg-red-500', percentage: -74 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{item.name}</span>
                        <span className="text-gray-300">{item.votes}票</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-4 relative">
                        <div 
                          className={`h-full rounded-full ${item.color} ${item.votes < 0 ? 'ml-auto' : ''}`}
                          style={{ width: `${Math.abs(item.percentage)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                          {item.percentage > 0 ? '+' : ''}{item.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold text-red-400">結果: -8票 (否決)</div>
                </div>
              </div>

              {/* 重み付けシステムのグラフ */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-green-400 text-center">重み付けシステム</h4>
                <div className="space-y-3">
                  {[
                    { name: '医師', score: 6, color: 'bg-blue-500', percentage: 23 },
                    { name: '看護師', score: 20, color: 'bg-green-500', percentage: 77 },
                    { name: '事務職', score: -20, color: 'bg-red-500', percentage: -77 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{item.name}</span>
                        <span className="text-gray-300">{item.score}点</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-4 relative">
                        <div 
                          className={`h-full rounded-full ${item.color} ${item.score < 0 ? 'ml-auto' : ''}`}
                          style={{ width: `${Math.abs(item.percentage)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                          {item.percentage > 0 ? '+' : ''}{item.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold text-green-400">結果: +6点 (承認)</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌈</span>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">真の中立性実現による効果</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    VoiceDriveの適応的重み付けシステムにより、世代・職種・経験年数による構造的不公平が解消され、
                    組織の多様性を活かした最適な意思決定が実現されます。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-purple-400 font-semibold">世代間調和</div>
                      <div className="text-gray-400">革新性と安定性のバランス</div>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-purple-400 font-semibold">職種間連携</div>
                      <div className="text-gray-400">専門性と現場性の融合</div>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-purple-400 font-semibold">経験値活用</div>
                      <div className="text-gray-400">新鮮さと熟練の統合</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* プロジェクトレベル階層 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="3">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">📈</span>
            プロジェクトレベル階層
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            投票スコアに応じて自動で6段階のプロジェクトレベルに分類
          </p>

          {/* プログレスバー */}
          <div className="bg-gray-700/50 rounded-2xl p-6 mb-8">
            <div className="h-8 bg-gray-600 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 transition-all duration-3000 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <div className="grid grid-cols-6 gap-4 mt-4">
              {projectLevels.map((level, index) => (
                <div key={level.level} className="text-center">
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="text-sm font-bold text-white">{level.level}</div>
                  <div className="text-xs text-gray-400">{level.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* レベル詳細 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectLevels.map((level, index) => (
              <div key={level.level} className={`bg-gradient-to-br ${level.color} p-6 rounded-xl text-white`}>
                <div className="text-4xl mb-3">{level.icon}</div>
                <div className="text-xl font-bold mb-2">{level.level}</div>
                <div className="text-lg mb-2">{level.range}</div>
                <div className="text-sm opacity-90">{level.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 実例計算 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="4">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🧮</span>
            実例計算デモ
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 例1：低スコア */}
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4">例1: 夜勤休憩時間延長提案</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">投票状況</h4>
                  <div className="space-y-2 text-gray-300">
                    <div>医師2名が賛成(+1)</div>
                    <div>看護師5名が強く賛成(+2)</div>
                    <div>事務職3名が賛成(+1)</div>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">計算プロセス</h4>
                  <div className="font-mono text-gray-300 space-y-1">
                    <div>医師: 2名 × (+1) × 3.0 = 6点</div>
                    <div>看護師: 5名 × (+2) × 2.0 = 20点</div>
                    <div>事務職: 3名 × (+1) × 1.0 = 3点</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-white">合計: 29点</div>
                <div className="text-lg text-gray-300 mt-2">💭 PENDINGレベル（議論段階）</div>
              </div>
            </div>

            {/* 例2：高スコア */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4">例2: 電子カルテシステム改善提案</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">大規模投票結果</h4>
                  <div className="space-y-2 text-gray-300">
                    <div>医師10名（平均+1.5）</div>
                    <div>看護師20名（平均+1.8）</div>
                    <div>その他医療職15名（平均+1.2）</div>
                    <div>事務職25名（平均+1.0）</div>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">計算プロセス</h4>
                  <div className="font-mono text-gray-300 space-y-1">
                    <div>医師: 10名 × 1.5 × 3.0 = 45点</div>
                    <div>看護師: 20名 × 1.8 × 2.0 = 72点</div>
                    <div>その他: 15名 × 1.2 × 1.5 = 27点</div>
                    <div>事務職: 25名 × 1.0 × 1.0 = 25点</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-white">合計: 169点</div>
                <div className="text-lg text-gray-300 mt-2">🏢 DEPARTMENTレベル（部署検討）</div>
              </div>
            </div>
          </div>
        </div>

        {/* 承認フロー */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has(7) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="7">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🔄</span>
            承認フロー
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            プロジェクトレベルに応じて適切な承認者が自動設定されます
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { level: 'TEAM', icon: '👥', approver: '主任承認', period: '1週間', color: 'from-blue-500 to-blue-600' },
              { level: 'DEPARTMENT', icon: '🏢', approver: '部長承認', period: '2週間', color: 'from-cyan-500 to-cyan-600' },
              { level: 'FACILITY', icon: '🏥', approver: '施設長承認', period: '3週間', color: 'from-green-500 to-green-600' },
              { level: 'ORGANIZATION', icon: '🏛️', approver: '理事会承認', period: '4週間', color: 'from-purple-500 to-purple-600' },
              { level: 'STRATEGIC', icon: '🚀', approver: '経営会議承認', period: '6週間', color: 'from-pink-500 to-pink-600' }
            ].map((flow, index) => (
              <div key={flow.level} className={`bg-gradient-to-br ${flow.color} p-6 rounded-xl text-white relative overflow-hidden`}>
                <div className="text-4xl mb-3">{flow.icon}</div>
                <div className="text-xl font-bold mb-2">{flow.level}レベル</div>
                <div className="text-lg mb-1">{flow.approver}</div>
                <div className="text-sm opacity-90">承認期間: {flow.period}</div>
                
                {index < 4 && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-3xl text-white/50">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* まとめ */}
        <div className={`animate-section bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl p-8 backdrop-blur border border-green-500/20 transition-all duration-700 ${
          visibleSections.has(6) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="6">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">✨</span>
            VoiceDriveの特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-xl font-bold text-white">客観的評価システム</h3>
                  <p className="text-gray-300">専門性と経験に基づく重み付けで公正な評価</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="text-xl font-bold text-white">完全匿名保証</h3>
                  <p className="text-gray-300">5段階の匿名レベルで安心して投票</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-xl font-bold text-white">自動化された承認フロー</h3>
                  <p className="text-gray-300">スコアに応じて適切な承認者を自動設定</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-xl font-bold text-white">透明性の高い可視化</h3>
                  <p className="text-gray-300">リアルタイムでスコアと進捗を確認</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-xl font-bold text-white">組織レベルでの意思決定</h3>
                  <p className="text-gray-300">個人から戦略レベルまで幅広くカバー</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-xl font-bold text-white">継続的改善促進</h3>
                  <p className="text-gray-300">現場の声を組織運営に直接反映</p>
                </div>
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

export default VotingSystemGuide;