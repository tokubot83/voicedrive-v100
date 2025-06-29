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
    setVisibleSections(new Set(['agenda', 0, 'vote-system', 'weight-system', 'anonymous-system', 'coexistence', 'neutrality', 'safety', 'collective', 'equality', 'transparency', 'empowerment', 'governance', 'levels', 'calculation', 'approval', 'features']));
    
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
            全ての立場の共存を実現する革新的意思決定支援システム
          </p>
        </div>

        {/* アジェンダ */}
        <div className={`animate-section bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur border border-indigo-500/20 mb-8 transition-all duration-700 ${
          visibleSections.has('agenda') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="agenda">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            このガイドで学べること
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            VoiceDriveが実現する8つの革新的価値を、従来システムとの具体的比較で理解できます
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 1, title: '全ての立場の共存', icon: '🤝', description: '世代・職種・経験を超えた真の協働' },
              { id: 2, title: '適応的公平性', icon: '⚖️', description: '状況に応じた柔軟で公正な判断' },
              { id: 3, title: '心理的安全性', icon: '🛡️', description: '安心して意見を表明できる環境' },
              { id: 4, title: '集合知の最大化', icon: '🧠', description: '組織全体の知恵を結集する仕組み' },
              { id: 5, title: '構造的不公平の解消', icon: '🌈', description: '固定観念や偏見を排除する設計' },
              { id: 6, title: '透明な意思決定', icon: '🔍', description: '可視化された公正なプロセス' },
              { id: 7, title: 'エンパワーメント', icon: '💪', description: '個人の影響力と発言力の向上' },
              { id: 8, title: 'デジタルガバナンス', icon: '🤖', description: 'テクノロジーが支える民主的運営' }
            ].map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.id}. {item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">従来システムからの革新</h3>
                <p className="text-gray-300 text-sm">
                  各セクションでは「従来の課題」→「VoiceDriveの解決策」→「具体的効果」の流れで、
                  実際の組織運営における変化を分かりやすく説明します。
                </p>
              </div>
            </div>
          </div>
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
          visibleSections.has('vote-system') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="vote-system">
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
          visibleSections.has('weight-system') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="weight-system">
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
          visibleSections.has('anonymous-system') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="anonymous-system">
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

        {/* 1. 全ての立場の共存 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('coexistence') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="coexistence">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🤝</span>
            1. 全ての立場の共存
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            世代・職種・経験年数を超えて、すべての声が価値ある貢献として認められる組織文化の実現
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

        {/* 2. 適応的公平性 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('neutrality') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="neutrality">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">⚖️</span>
            2. 適応的公平性
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            固定的な基準ではなく、状況と文脈に応じて最適な判断を行う動的公正システム
          </p>

          {/* 従来の固定的システムとの比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来システムの課題 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                従来の固定的公平性
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">一律平等主義の問題</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• すべての意見を同じ重みで扱う</li>
                    <li>• 専門性や文脈を無視した判断</li>
                    <li>• 「公平」だが「適切」ではない結果</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">具体例：セキュリティシステム導入</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• IT専門職: 賛成 → 1票</div>
                    <div>• 事務職: 反対 → 20票</div>
                    <div>• 結果: 技術的妥当性が無視される</div>
                  </div>
                </div>
              </div>
            </div>

            {/* VoiceDriveの適応的公平性 */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                VoiceDriveの適応的公平性
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">状況に応じた重み調整</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 提案カテゴリに応じた専門性重視</li>
                    <li>• 文脈を理解した公正な判断</li>
                    <li>• 最適な結果を導く動的調整</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">同じ例でのVoiceDrive結果</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• IT専門職: 賛成 → 40%重み</div>
                    <div>• 事務職: 反対 → 20%重み</div>
                    <div>• 結果: 専門知識が適切に反映</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 適応的重み付けの具体例 */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎛️</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">カテゴリ別適応重み付け例</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      category: '業務改善',
                      scenario: '現場作業効率化',
                      weights: '現場70% / 管理20% / その他10%',
                      reason: '実際の作業経験が最重要'
                    },
                    {
                      category: 'イノベーション',
                      scenario: 'AI技術導入',
                      weights: 'Z世代50% / IT30% / 管理20%',
                      reason: '新技術への適応力重視'
                    },
                    {
                      category: '戦略提案',
                      scenario: '経営方針変更',
                      weights: '管理60% / ベテラン30% / 現場10%',
                      reason: '組織運営責任と経験重視'
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">{item.category}</h4>
                      <div className="text-sm text-gray-300 mb-2">{item.scenario}</div>
                      <div className="text-xs text-yellow-400 mb-2">{item.weights}</div>
                      <div className="text-xs text-gray-400">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 心理的安全性 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('safety') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="safety">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            3. 心理的安全性
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            階層や立場を気にせず、安心して自分の意見を表明できる組織環境の構築
          </p>

          {/* 従来システムとの比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来システムの課題 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">😰</span>
                従来の組織環境
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">発言への不安・恐怖</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「上司に睨まれるかも...」</li>
                    <li>• 「評価に響くのでは...」</li>
                    <li>• 「職場で孤立するかも...」</li>
                    <li>• 「専門知識がないと思われる...」</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">結果として生じる問題</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 本音での議論ができない</li>
                    <li>• 重要な問題が隠蔽される</li>
                    <li>• イノベーションが生まれない</li>
                    <li>• 組織が学習しない</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveの心理的安全性 */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">😊</span>
                VoiceDriveの安心環境
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">多層的プライバシー保護</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 5段階の匿名レベル選択</li>
                    <li>• 完全匿名での意見表明可能</li>
                    <li>• 暗号化による情報保護</li>
                    <li>• 投票者特定の技術的不可能性</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">実現される組織文化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 自由で建設的な議論</li>
                    <li>• 早期の問題発見・解決</li>
                    <li>• 創造的なアイデア創出</li>
                    <li>• 継続的な組織学習</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 具体的なシチュエーション例 */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎭</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">実際のシチュエーション比較</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <h4 className="font-semibold text-red-400 mb-2">従来：新人看護師Aさん</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      「先輩の業務フローに疑問があるけど、経験浅いし言えない...
                      もし間違ってたら怒られるし、職場の雰囲気も悪くなる」
                    </p>
                    <div className="text-red-400 text-xs">→ 問題が放置され、効率性が向上しない</div>
                  </div>
                  
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-2">VoiceDrive：同じAさん</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      「完全匿名で提案できるから、遠慮なく改善案を投稿できる。
                      Z世代の視点が評価される仕組みがあるから、新鮮なアイデアも歓迎される」
                    </p>
                    <div className="text-green-400 text-xs">→ 革新的な改善案が組織に貢献</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 匿名レベル詳細 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">5段階匿名レベルシステム</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { level: 'LEVEL 1', label: '実名表示', icon: '👤', security: '公開性重視', use: '建設的提案' },
                { level: 'LEVEL 2', label: '施設・部署名', icon: '🏥', security: '部分匿名', use: '部門間連携' },
                { level: 'LEVEL 3', label: '施設名のみ', icon: '🏢', security: '中程度保護', use: '組織横断提案' },
                { level: 'LEVEL 4', label: '部署名のみ', icon: '📋', security: '高度保護', use: 'センシティブ問題' },
                { level: 'LEVEL 5', label: '完全匿名', icon: '🔒', security: '最高保護', use: '内部告発・改革' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-600/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{item.level}</div>
                  <div className="text-gray-300 text-xs mb-2">{item.label}</div>
                  <div className="text-blue-400 text-xs mb-1">{item.security}</div>
                  <div className="text-gray-400 text-xs">{item.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 集合知の最大化 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('collective') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="collective">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🧠</span>
            4. 集合知の最大化
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            組織全体の知恵と経験を結集し、個人では到達できない高次の判断を実現
          </p>

          {/* 従来との比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来システムの限界 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏰</span>
                従来の意思決定構造
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">情報の分散・断片化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 部門ごとの情報サイロ化</li>
                    <li>• 階層による情報の歪曲・遅延</li>
                    <li>• 重要な現場情報の見落とし</li>
                    <li>• 一部の人の経験に依存</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">具体例：電子カルテ更新</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• 管理職：「コスト削減効果大」</div>
                    <div>• 現場：「操作性に大きな課題」</div>
                    <div>• 結果：一方的な判断で導入失敗</div>
                  </div>
                </div>
              </div>
            </div>

            {/* VoiceDriveの集合知 */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                VoiceDriveの集合知システム
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">全方位からの知見集約</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• リアルタイムで全職員の意見収集</li>
                    <li>• 多角的視点による総合判断</li>
                    <li>• データに基づく客観的分析</li>
                    <li>• 潜在的問題の早期発見</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">同じ例でのVoiceDrive結果</h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• 管理・現場・IT・各世代の総合判断</div>
                    <div>• 隠れた課題とメリットを同時発見</div>
                    <div>• 最適な導入戦略を集合知で構築</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 集合知の力の可視化 */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚡</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">集合知の力：1+1=3以上の効果</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Z世代の提案',
                      content: 'チャットボット導入',
                      insight: '利用者視点での操作性',
                      color: 'bg-blue-500/20'
                    },
                    {
                      title: 'ベテランの知見', 
                      content: '過去の失敗事例',
                      insight: '導入時の注意点・リスク',
                      color: 'bg-green-500/20'
                    },
                    {
                      title: '管理職の視点',
                      content: '予算・ROI分析',
                      insight: '投資対効果とタイミング',
                      color: 'bg-orange-500/20'
                    }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-4`}>
                      <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                      <div className="text-gray-300 text-sm mb-2">{item.content}</div>
                      <div className="text-blue-400 text-xs">{item.insight}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-900/30 to-green-900/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-2">→ 統合された集合知</div>
                    <div className="text-gray-300 text-sm">
                      「利用者目線で設計され、過去の失敗を回避し、適切なタイミングで導入される最適なチャットボットシステム」
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* データドリブン意思決定 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">データドリブン集合知の実現</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: '多様な意見収集', icon: '📊', desc: '全職員からの5段階評価' },
                { step: '2', title: '重み付け処理', icon: '⚖️', desc: 'カテゴリ別専門性反映' },
                { step: '3', title: 'データ分析', icon: '🔍', desc: 'AI支援による傾向分析' },
                { step: '4', title: '最適解導出', icon: '💎', desc: '集合知による最良判断' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-600/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">STEP {item.step}</div>
                  <div className="text-blue-400 text-sm mb-2">{item.title}</div>
                  <div className="text-gray-400 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. 構造的不公平の解消 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('equality') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="equality">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🌈</span>
            5. 構造的不公平の解消
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            固定観念や既存の権力構造に基づく偏見を排除し、真に公正な組織運営を実現
          </p>

          {/* 構造的不公平の例 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来の構造的問題 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚧</span>
                従来の構造的不公平
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">世代による偏見</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「若い人は経験不足」</li>
                    <li>• 「ベテランは変化を嫌う」</li>
                    <li>• 年功序列による発言権の偏り</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">職種による格差</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「事務職は現場を知らない」</li>
                    <li>• 「技術職は経営が分からない」</li>
                    <li>• 職種間のヒエラルキー意識</li>
                  </ul>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">結果として起こること</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 優秀なアイデアの見落とし</li>
                    <li>• 組織内の分断と対立</li>
                    <li>• イノベーションの阻害</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveの公平性実現 */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                VoiceDriveの公平性設計
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">偏見を排除する仕組み</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 匿名性による先入観の除去</li>
                    <li>• データ重視の客観的評価</li>
                    <li>• 提案内容のみでの純粋判断</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">多様性を活かす設計</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 各グループの強みを適切に評価</li>
                    <li>• 状況に応じた柔軟な重み調整</li>
                    <li>• 少数派の重要な声も確実に反映</li>
                  </ul>
                </div>

                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">実現される組織文化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 相互尊重と協働の促進</li>
                    <li>• 多様な才能の最大活用</li>
                    <li>• 持続的なイノベーション創出</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 実際の変化事例 */}
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔄</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">組織文化の変革事例</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                      <h4 className="font-semibold text-red-400 mb-2">導入前の組織</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• 「またベテランの反対で改善案が潰された」</li>
                        <li>• 「事務職の意見は軽視される」</li>
                        <li>• 「若手のアイデアが採用されない」</li>
                        <li>• → 提案意欲の低下、組織の停滞</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                      <h4 className="font-semibold text-green-400 mb-2">導入後の組織</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• 「アイデアが公平に評価される」</li>
                        <li>• 「どの職種の声も価値がある」</li>
                        <li>• 「経験に関係なく良い提案は採用」</li>
                        <li>• → 積極的な提案、継続的改善</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 透明な意思決定 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('transparency') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="transparency">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🔍</span>
            6. 透明な意思決定
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            すべてのプロセスが可視化され、説明可能で追跡可能な公正な意思決定システム
          </p>

          {/* 従来との比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来の不透明な意思決定 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🫥</span>
                従来のブラックボックス決定
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">見えない意思決定</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「なぜこの決定になったのか分からない」</li>
                    <li>• 「誰がどんな基準で判断したのか不明」</li>
                    <li>• 「裏で決まっている感じがする」</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">不信と不満の蓄積</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 組織運営への不信増大</li>
                    <li>• 「どうせ決まっている」という諦め</li>
                    <li>• エンゲージメントの低下</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveの透明性 */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                VoiceDriveの完全透明性
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">すべてが見える化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• リアルタイム投票状況の表示</li>
                    <li>• 重み付け基準の完全公開</li>
                    <li>• 判断プロセスの段階的表示</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">信頼と納得の向上</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「なぜその決定になったか理解できる」</li>
                    <li>• 「公正なプロセスで決まった」という安心</li>
                    <li>• 組織運営への信頼向上</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 透明性の具体的実現 */}
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">透明性の具体的実現方法</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'リアルタイム表示',
                      features: ['投票状況の即座反映', '合意形成度の可視化', '参加者数の表示'],
                      color: 'bg-blue-500/20'
                    },
                    {
                      title: '判断基準の公開',
                      features: ['重み付けロジックの説明', 'カテゴリ別設定理由', '計算過程の表示'],
                      color: 'bg-green-500/20'
                    },
                    {
                      title: '完全な監査証跡',
                      features: ['全ての変更履歴記録', 'タイムスタンプ付き', '承認者の明確化'],
                      color: 'bg-purple-500/20'
                    }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-4`}>
                      <h4 className="font-semibold text-white mb-3">{item.title}</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {item.features.map((feature, fIndex) => (
                          <li key={fIndex}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 透明性がもたらす効果 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">透明性がもたらす組織への効果</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-400 mb-3">短期的効果</h4>
                <div className="space-y-2">
                  {['決定への納得度向上', 'プロセスへの信頼増加', '参加意欲の向上', '不満・噂の減少'].map((effect, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300 text-sm">{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-400 mb-3">長期的効果</h4>
                <div className="space-y-2">
                  {['組織文化の変革', 'エンゲージメント向上', '自律的な改善文化', 'ガバナンス強化'].map((effect, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300 text-sm">{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. エンパワーメント */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('empowerment') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="empowerment">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">💪</span>
            7. エンパワーメント
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            すべての職員が組織の意思決定に実質的な影響力を持ち、自分の声が価値ある貢献として認められる環境
          </p>

          {/* 従来との比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来の無力感 */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">😔</span>
                従来の無力感・諦め
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">よくある職員の声</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「どうせ提案しても変わらない」</li>
                    <li>• 「上の人が決めるから関係ない」</li>
                    <li>• 「私の意見なんて聞いてもらえない」</li>
                    <li>• 「現場のことを分かってもらえない」</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">組織への影響</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 改善提案の減少</li>
                    <li>• 問題の隠蔽・放置</li>
                    <li>• 受動的な業務姿勢</li>
                    <li>• 人材の流出</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveによるエンパワーメント */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                VoiceDriveでの変化
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">実感される変化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 「私の提案が実際に検討される」</li>
                    <li>• 「匿名だから遠慮なく言える」</li>
                    <li>• 「新人でも良いアイデアは評価される」</li>
                    <li>• 「組織が本当に変わっていく」</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">組織の活性化</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 積極的な改善提案</li>
                    <li>• 早期の問題発見</li>
                    <li>• 主体的な業務取組</li>
                    <li>• 人材の定着・成長</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* エンパワーメントの段階 */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📈</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">エンパワーメントの段階的発展</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { stage: 'STEP 1', title: '発言の勇気', icon: '🗣️', desc: '匿名性により安心して意見表明' },
                    { stage: 'STEP 2', title: '影響力の実感', icon: '⚡', desc: '自分の声が実際に結果に反映' },
                    { stage: 'STEP 3', title: '主体性の向上', icon: '🎯', desc: '積極的な問題発見・解決提案' },
                    { stage: 'STEP 4', title: '変革リーダー', icon: '👑', desc: '組織変革の担い手として成長' }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-bold text-white text-sm mb-1">{item.stage}</div>
                      <div className="text-purple-400 text-sm mb-2">{item.title}</div>
                      <div className="text-gray-400 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 成功事例 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">エンパワーメント成功事例</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-500/30">
                <h4 className="font-semibold text-cyan-400 mb-2">事例1：新人職員Bさん</h4>
                <p className="text-gray-300 text-sm mb-3">
                  入職6ヶ月で業務効率化のアイデアを提案。従来なら「経験不足」で却下されたが、
                  VoiceDriveでは内容重視で評価され、全社導入に至る。
                </p>
                <div className="text-blue-400 text-xs">→ 自信向上、更なる改善提案意欲の増大</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
                <h4 className="font-semibold text-emerald-400 mb-2">事例2：事務職Cさん</h4>
                <p className="text-gray-300 text-sm mb-3">
                  「事務職は現場を知らない」と言われ続けたが、VoiceDriveで患者目線での
                  サービス改善を提案。高評価を得て改善チームリーダーに抜擢。
                </p>
                <div className="text-green-400 text-xs">→ 多角的視点の価値認識、組織貢献の実感</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. デジタルガバナンス */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('governance') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="governance">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🤖</span>
            8. デジタルガバナンス
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            テクノロジーの力で人間の偏見や感情に左右されない、客観的で公正な組織運営を実現
          </p>

          {/* 従来との比較 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 従来の人的依存システム */}
            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-6 rounded-xl border border-red-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                従来の人的依存ガバナンス
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">人的バイアスの問題</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 個人の感情や好み影響</li>
                    <li>• 政治的配慮による判断歪曲</li>
                    <li>• 過去の経験による先入観</li>
                    <li>• 処理能力の限界</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">一貫性の欠如</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 同じ案件でも判断がブレる</li>
                    <li>• 担当者により基準が変わる</li>
                    <li>• 時期により判断が異なる</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VoiceDriveのデジタルガバナンス */}
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                VoiceDriveのデジタル統治
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">客観的・一貫的判断</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• アルゴリズムによる公正な処理</li>
                    <li>• データに基づく客観的評価</li>
                    <li>• 24時間365日安定した判断</li>
                    <li>• 大量データの高速処理</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">完全な一貫性</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• 同一基準による公平な評価</li>
                    <li>• 透明なルールベース判断</li>
                    <li>• 継続的な品質保証</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* テクノロジー活用の詳細 */}
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔬</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">VoiceDriveの技術的基盤</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      tech: 'AI分析エンジン',
                      features: ['パターン認識', '傾向分析', '予測モデル'],
                      benefit: '隠れた洞察の発見',
                      color: 'bg-blue-500/20'
                    },
                    {
                      tech: 'ブロックチェーン',
                      features: ['改ざん防止', '完全な監査証跡', '分散台帳'],
                      benefit: '絶対的な透明性確保',
                      color: 'bg-green-500/20'
                    },
                    {
                      tech: '機械学習',
                      features: ['重み最適化', '不正検知', '品質向上'],
                      benefit: '継続的システム改善',
                      color: 'bg-purple-500/20'
                    }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-4`}>
                      <h4 className="font-semibold text-white mb-2">{item.tech}</h4>
                      <ul className="text-gray-300 text-xs space-y-1 mb-3">
                        {item.features.map((feature, fIndex) => (
                          <li key={fIndex}>• {feature}</li>
                        ))}
                      </ul>
                      <div className="text-yellow-400 text-xs font-semibold">{item.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 未来の可能性 */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">デジタルガバナンスが描く未来</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-400">近未来の発展</h4>
                <div className="space-y-2">
                  {[
                    'リアルタイム予測による先回り改善',
                    '自動的な最適解提案システム',
                    '組織学習の自動化',
                    'クロス組織での知見共有'
                  ].map((future, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-blue-400">→</span>
                      <span className="text-gray-300 text-sm">{future}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-400">長期ビジョン</h4>
                <div className="space-y-2">
                  {[
                    '完全自律型組織運営',
                    'AIとヒューマンの完全協働',
                    '業界標準ガバナンスモデル',
                    '社会インフラとしての展開'
                  ].map((vision, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-purple-400">✦</span>
                      <span className="text-gray-300 text-sm">{vision}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* プロジェクトレベル階層 */}
        <div className={`animate-section bg-gray-800/50 rounded-2xl p-8 backdrop-blur border border-gray-700/50 mb-8 transition-all duration-700 ${
          visibleSections.has('levels') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="levels">
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
          visibleSections.has('calculation') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="calculation">
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
          visibleSections.has('approval') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} data-section="approval">
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
      </div>
      
      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default VotingSystemGuide;