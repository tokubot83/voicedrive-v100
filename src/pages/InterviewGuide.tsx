import React, { useEffect, useState } from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const InterviewGuide: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'booking' | 'prepare' | 'benefits' | 'faq'>('overview');

  useEffect(() => {
    // 初期表示のため、すべてのセクションを表示状態にする
    setVisibleSections(new Set([
      'header', 'intro', 'purpose', 'features', 'promise', 'summary',
      'types-header', 'type1', 'type2', 'type3', 'type4', 'type5', 'types-flexibility',
      'booking-header', 'booking1', 'booking2', 'booking3', 'booking4', 'booking-tips',
      'prepare-header', 'prepare1', 'prepare2', 'prepare3', 'prepare4', 'prepare-checklist',
      'benefits-header', 'benefit1', 'benefit2', 'benefit3', 'benefit4', 'benefits-stats',
      'faq-header', 'faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq-footer'
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
        <div className={`bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 backdrop-blur-xl border border-purple-500/20 mb-8 animate-section transition-all duration-1000 ${
          visibleSections.has('header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} data-section="header">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">📅</span>
            面談予約でキャリアをデザインしよう！
          </h1>
          <p className="text-xl text-gray-300">
            あなたの成長と幸せを、一緒に考えます
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'overview' as const, label: '面談予約とは', icon: '🤝' },
              { id: 'types' as const, label: '面談の種類', icon: '📋' },
              { id: 'booking' as const, label: '予約の流れ', icon: '📱' },
              { id: 'prepare' as const, label: '面談の準備', icon: '📝' },
              { id: 'benefits' as const, label: '面談の効果', icon: '🌟' },
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
          {/* 面談予約とは */}
          {activeTab === 'overview' && (
            <>
              {/* イントロダクション */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="intro">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">💡</span>
                  面談予約システムってなに？
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p className="text-lg leading-relaxed">
                    面談予約システムは、<span className="text-purple-400 font-semibold">上司や人事部門との1対1の面談</span>を
                    簡単に予約できるVoiceDriveの機能です。キャリア相談、業務の悩み、プライベートの相談など、
                    あなたのニーズに合わせた面談を、都合の良い時間に設定できます。
                  </p>
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                    <p className="text-white font-semibold mb-2">🎯 ポイント</p>
                    <p>定期面談だけでなく、必要な時にすぐ相談できる環境を提供します！</p>
                  </div>
                </div>
              </div>

              {/* 面談の目的 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-pink-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('purpose') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="purpose">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-pink-400">🎯</span>
                  面談で実現できること
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <span>📈</span> キャリア開発
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 将来のキャリアプラン相談</li>
                      <li>• スキルアップの方向性確認</li>
                      <li>• 昇進・昇格への道筋</li>
                      <li>• 資格取得のサポート</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                    <h4 className="text-xl font-semibold text-pink-400 mb-3 flex items-center gap-2">
                      <span>💬</span> 悩み相談
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 業務上の課題解決</li>
                      <li>• 人間関係の相談</li>
                      <li>• ワークライフバランス</li>
                      <li>• メンタルヘルスケア</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* システムの特徴 */}
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="features">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">✨</span>
                  VoiceDrive面談予約の特徴
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: '📱', title: '簡単予約', desc: 'スマホから3タップで予約完了。空き時間が一目でわかる' },
                    { icon: '🔔', title: 'リマインダー', desc: '面談前日と当日にプッシュ通知でお知らせ' },
                    { icon: '📝', title: '事前準備', desc: '相談内容を事前に共有できるので、効率的な面談が可能' },
                    { icon: '🔄', title: '柔軟な変更', desc: '急な予定変更にも対応。簡単にリスケジュール可能' },
                    { icon: '📊', title: '履歴管理', desc: '過去の面談記録を確認でき、成長の軌跡が見える' }
                  ].map(feature => (
                    <div key={feature.title} className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300">
                      <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-3">
                        <span className="text-3xl">{feature.icon}</span>
                        {feature.title}
                      </h4>
                      <p className="text-gray-300">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 約束 */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('promise') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="promise">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-purple-400">🤝</span>
                  私たちの約束
                </h3>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">🔒 プライバシーの保護</p>
                    <p>面談内容は厳重に管理され、本人の同意なく他者に共有されることはありません。</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">⏰ 時間の尊重</p>
                    <p>予約した時間は必ず確保。あなたの貴重な時間を無駄にしません。</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                    <p className="text-white font-semibold mb-2">💯 真摯な対応</p>
                    <p>どんな相談も真剣に受け止め、一緒に解決策を考えます。</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 面談の種類 */}
          {activeTab === 'types' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('types-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="types-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📋</span>
                  あなたに合った面談を選ぼう
                </h2>
                <p className="text-lg text-gray-300">
                  目的や状況に応じて、最適な面談タイプを選択できます。
                </p>
              </div>

              {/* 面談タイプ一覧 */}
              {[
                {
                  type: '定期面談',
                  icon: '📅',
                  duration: '30-60分',
                  frequency: '月1回〜四半期1回',
                  purpose: '目標設定、進捗確認、フィードバック',
                  suitable: '全職員対象の基本的な面談',
                  color: 'blue'
                },
                {
                  type: 'キャリア相談',
                  icon: '🚀',
                  duration: '45-90分',
                  frequency: '必要に応じて',
                  purpose: 'キャリアプラン、スキル開発、昇進相談',
                  suitable: '将来について真剣に考えたい方',
                  color: 'purple'
                },
                {
                  type: '緊急相談',
                  icon: '🆘',
                  duration: '15-30分',
                  frequency: '即日〜3日以内',
                  purpose: '急な問題、トラブル対応、メンタルケア',
                  suitable: 'すぐに相談が必要な方',
                  color: 'red'
                },
                {
                  type: 'プロジェクト相談',
                  icon: '💼',
                  duration: '30-45分',
                  frequency: 'プロジェクト期間中',
                  purpose: '業務の進め方、チーム課題、リソース調整',
                  suitable: 'プロジェクトリーダーや担当者',
                  color: 'green'
                },
                {
                  type: 'メンター面談',
                  icon: '🌟',
                  duration: '60-90分',
                  frequency: '月2回程度',
                  purpose: '成長支援、スキル指導、キャリアアドバイス',
                  suitable: '新入職員や成長意欲の高い方',
                  color: 'yellow'
                }
              ].map((type, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-${type.color}-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`type${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`type${index + 1}`}>
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">{type.type}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <p className="text-sm text-gray-400 mb-1">所要時間</p>
                          <p className="text-white font-semibold">{type.duration}</p>
                        </div>
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <p className="text-sm text-gray-400 mb-1">頻度</p>
                          <p className="text-white font-semibold">{type.frequency}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300"><span className="text-purple-400 font-semibold">目的：</span>{type.purpose}</p>
                        <p className="text-gray-300"><span className="text-pink-400 font-semibold">対象：</span>{type.suitable}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 柔軟な対応 */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('types-flexibility') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="types-flexibility">
                <h3 className="text-2xl font-bold text-white mb-4">🎨 あなたのニーズに合わせてカスタマイズ</h3>
                <p className="text-gray-300 mb-4">
                  上記の面談タイプは基本的な枠組みです。実際の面談では、あなたの状況やニーズに応じて柔軟に対応します。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">🏠</p>
                    <p className="text-white font-semibold">オンライン対応</p>
                    <p className="text-gray-300 text-sm">在宅勤務でも面談可能</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">👥</p>
                    <p className="text-white font-semibold">グループ面談</p>
                    <p className="text-gray-300 text-sm">チーム単位での相談もOK</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">🌙</p>
                    <p className="text-white font-semibold">時間外対応</p>
                    <p className="text-gray-300 text-sm">シフト勤務にも配慮</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 予約の流れ */}
          {activeTab === 'booking' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('booking-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="booking-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📱</span>
                  予約はたったの4ステップ！
                </h2>
                <p className="text-lg text-gray-300">
                  スマホから簡単に、あなたの都合に合わせて面談を予約できます。
                </p>
              </div>

              {/* 予約ステップ */}
              {[
                {
                  step: 1,
                  title: '面談予約ボタンをタップ',
                  desc: 'ホーム画面またはメニューから「面談予約」を選択',
                  detail: 'VoiceDriveのどの画面からでもアクセス可能。緊急の場合は「緊急相談」ボタンも用意。',
                  icon: '👆',
                  screenshot: '予約ボタンのスクリーンショット'
                },
                {
                  step: 2,
                  title: '面談タイプと相手を選択',
                  desc: '目的に合った面談タイプと、相談したい相手を選ぶ',
                  detail: '直属の上司、人事担当、メンターなど、相談内容に応じて最適な相手を選択できます。',
                  icon: '👥',
                  screenshot: '相手選択画面のスクリーンショット'
                },
                {
                  step: 3,
                  title: '日時を選択',
                  desc: 'カレンダーから都合の良い日時を選択',
                  detail: '相手の空き時間が色分けで表示。あなたのシフトも考慮した最適な時間帯を提案。',
                  icon: '📅',
                  screenshot: 'カレンダー画面のスクリーンショット'
                },
                {
                  step: 4,
                  title: '相談内容を入力して予約確定',
                  desc: '簡単な相談内容を記入して予約完了',
                  detail: '詳細は任意入力。事前に共有することで、より充実した面談が可能に。',
                  icon: '✅',
                  screenshot: '予約確認画面のスクリーンショット'
                }
              ].map(item => (
                <div key={item.step} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-pink-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`booking${item.step}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`booking${item.step}`}>
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
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
                      <div className="mt-4 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                        <p className="text-sm text-gray-400 text-center italic">{item.screenshot}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 予約のコツ */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('booking-tips') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="booking-tips">
                <h3 className="text-2xl font-bold text-white mb-4">💡 スムーズな予約のためのヒント</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-purple-400 font-semibold mb-2">📅 余裕を持った日程で</p>
                    <p className="text-gray-300 text-sm">緊急時以外は、1週間程度先の日程で予約すると調整しやすい</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-pink-400 font-semibold mb-2">🎯 目的を明確に</p>
                    <p className="text-gray-300 text-sm">相談内容を事前に整理しておくと、効果的な面談に</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-purple-400 font-semibold mb-2">⏰ 時間帯の工夫</p>
                    <p className="text-gray-300 text-sm">業務の合間より、始業前後の時間帯が落ち着いて話せる</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-pink-400 font-semibold mb-2">🔄 定期的な活用</p>
                    <p className="text-gray-300 text-sm">問題が大きくなる前に、定期的な面談で予防的に対処</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 面談の準備 */}
          {activeTab === 'prepare' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('prepare-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="prepare-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📝</span>
                  充実した面談のための準備
                </h2>
                <p className="text-lg text-gray-300">
                  少しの準備で、面談の効果は大きく変わります。あなたの時間を最大限活用しましょう。
                </p>
              </div>

              {/* 準備項目 */}
              {[
                {
                  title: '相談内容の整理',
                  icon: '📋',
                  tips: [
                    '主要な相談ポイントを3つ程度に絞る',
                    '具体的な事例や状況を準備',
                    '希望する解決策やゴールを明確に',
                    '質問したいことをリストアップ'
                  ],
                  example: '「プロジェクトXでの課題」「チームコミュニケーション改善案」「次期目標設定について」'
                },
                {
                  title: '必要な資料の準備',
                  icon: '📁',
                  tips: [
                    '業績データや実績資料',
                    '問題を示す具体的な証拠',
                    '提案書や改善案の資料',
                    '参考になる外部情報'
                  ],
                  example: '月次レポート、顧客フィードバック、改善提案書など'
                },
                {
                  title: '心の準備',
                  icon: '💭',
                  tips: [
                    '率直に話す心構え',
                    '建設的な姿勢を保つ',
                    'フィードバックを受け入れる準備',
                    '感情的にならないよう意識'
                  ],
                  example: '深呼吸をして、冷静に。相手も味方であることを忘れずに'
                },
                {
                  title: '環境の準備',
                  icon: '🏢',
                  tips: [
                    '静かで集中できる場所を確保',
                    'オンラインの場合は通信環境を確認',
                    '必要な機器（PC、資料等）を準備',
                    '中断されない時間を確保'
                  ],
                  example: '会議室予約、イヤホン準備、「面談中」の表示など'
                }
              ].map((item, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`prepare${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`prepare${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    {item.title}
                  </h3>
                  <ul className="space-y-2 mb-4">
                    {item.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <p className="text-sm text-gray-400 mb-1">例：</p>
                    <p className="text-gray-300">{item.example}</p>
                  </div>
                </div>
              ))}

              {/* 準備チェックリスト */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('prepare-checklist') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="prepare-checklist">
                <h3 className="text-2xl font-bold text-white mb-4">✅ 面談前チェックリスト</h3>
                <div className="space-y-3">
                  {[
                    '相談したい内容を整理した',
                    '必要な資料を準備した',
                    '面談の目的とゴールを明確にした',
                    '相手への感謝の気持ちを持った',
                    '前向きな姿勢で臨む準備ができた'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" />
                      <span className="text-gray-300">{item}</span>
                    </label>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                  すべてチェックできたら、素晴らしい面談になること間違いなし！
                </p>
              </div>
            </>
          )}

          {/* 面談の効果 */}
          {activeTab === 'benefits' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('benefits-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="benefits-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">🌟</span>
                  面談がもたらす素晴らしい効果
                </h2>
                <p className="text-lg text-gray-300">
                  定期的な面談は、あなたのキャリアと組織の成長に大きな影響を与えます。
                </p>
              </div>

              {/* 効果の詳細 */}
              {[
                {
                  title: '個人の成長',
                  icon: '🌱',
                  benefits: [
                    'キャリアパスの明確化',
                    '強みと改善点の認識',
                    'モチベーションの向上',
                    'スキルアップの加速'
                  ],
                  stat: '面談実施者の87%が「成長を実感」',
                  color: 'green'
                },
                {
                  title: '問題の早期解決',
                  icon: '🔧',
                  benefits: [
                    '小さな問題を大きくなる前に解決',
                    'ストレスの軽減',
                    '業務効率の改善',
                    'ミスやトラブルの予防'
                  ],
                  stat: '問題解決までの期間が平均60%短縮',
                  color: 'blue'
                },
                {
                  title: '関係性の向上',
                  icon: '🤝',
                  benefits: [
                    '上司との信頼関係構築',
                    'コミュニケーションの活性化',
                    'チームワークの強化',
                    '組織への帰属意識向上'
                  ],
                  stat: '上司への信頼度が35%向上',
                  color: 'purple'
                },
                {
                  title: '組織パフォーマンス',
                  icon: '📈',
                  benefits: [
                    '離職率の低下',
                    '生産性の向上',
                    'イノベーションの促進',
                    '組織文化の改善'
                  ],
                  stat: '定期面談実施部署は離職率40%減',
                  color: 'orange'
                }
              ].map((benefit, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-${benefit.color}-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`benefit${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`benefit${index + 1}`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-3xl">{benefit.icon}</span>
                    {benefit.title}
                  </h3>
                  <ul className="space-y-2 mb-4">
                    {benefit.benefits.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className={`text-${benefit.color}-400 mt-1`}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`bg-${benefit.color}-900/20 rounded-xl p-4 border border-${benefit.color}-500/30`}>
                    <p className={`text-${benefit.color}-400 font-semibold text-center`}>
                      📊 {benefit.stat}
                    </p>
                  </div>
                </div>
              ))}

              {/* 統計データ */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('benefits-stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="benefits-stats">
                <h3 className="text-2xl font-bold text-white mb-6">📊 面談システムの実績（2024年度）</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-400 mb-2">12,543</p>
                    <p className="text-gray-300">実施面談数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-pink-400 mb-2">94%</p>
                    <p className="text-gray-300">満足度</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-400 mb-2">4.8/5</p>
                    <p className="text-gray-300">有用性評価</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-pink-400 mb-2">78%</p>
                    <p className="text-gray-300">定期利用率</p>
                  </div>
                </div>
                <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                  <p className="text-white text-center">
                    <span className="text-2xl">💬</span> 「面談のおかげで、自分の成長の方向性が明確になりました」
                  </p>
                  <p className="text-gray-400 text-center mt-2">- 看護師 Aさん</p>
                </div>
              </div>
            </>
          )}

          {/* よくある質問 */}
          {activeTab === 'faq' && (
            <>
              <div className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq-header">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-purple-400">❓</span>
                  よくある質問
                </h2>
                <p className="text-lg text-gray-300">
                  面談予約についての疑問にお答えします。
                </p>
              </div>

              {/* FAQ項目 */}
              {[
                {
                  question: '面談の内容は他の人に共有されますか？',
                  answer: '原則として、面談内容は守秘義務により保護されます。ただし、法令違反や安全に関わる問題など、組織として対応が必要な場合は、あなたの同意を得た上で必要最小限の範囲で共有することがあります。'
                },
                {
                  question: '直属の上司以外とも面談できますか？',
                  answer: 'はい、可能です。人事部門、他部署の管理職、メンターなど、相談内容に応じて適切な相手を選択できます。キャリア相談なら人事部、専門的な相談なら各分野のエキスパートなど、柔軟に対応します。'
                },
                {
                  question: '面談をキャンセルしたい場合は？',
                  answer: '予約システムから簡単にキャンセル・リスケジュールできます。ただし、相手の時間も考慮し、可能な限り24時間前までにご連絡ください。緊急の場合は、直接連絡することも可能です。'
                },
                {
                  question: '面談の頻度はどのくらいが適切ですか？',
                  answer: '一般的には月1回程度の定期面談をお勧めしています。ただし、プロジェクトの状況や個人のニーズに応じて、週1回から四半期に1回まで柔軟に調整できます。必要な時に必要なだけ活用してください。'
                },
                {
                  question: 'オンライン面談と対面面談、どちらが良いですか？',
                  answer: 'それぞれにメリットがあります。対面は非言語コミュニケーションが豊かで、深い話がしやすいです。オンラインは場所を選ばず、効率的です。相談内容や状況に応じて選択してください。'
                },
                {
                  question: '面談で話したことが評価に影響しますか？',
                  answer: '面談は成長支援が目的であり、評価の場ではありません。むしろ、積極的に面談を活用し、自己成長に取り組む姿勢は高く評価されます。正直に課題を共有し、改善に取り組むことが大切です。'
                }
              ].map((faq, index) => (
                <div key={index} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30 animate-section transition-all duration-1000 ${
                  visibleSections.has(`faq${index + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`} data-section={`faq${index + 1}`}>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <div className="ml-6 bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <p className="text-gray-300">
                      <span className="text-pink-400 font-semibold">A. </span>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}

              {/* 追加サポート */}
              <div className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 animate-section transition-all duration-1000 ${
                visibleSections.has('faq-footer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} data-section="faq-footer">
                <h3 className="text-2xl font-bold text-white mb-4">🤔 まだ疑問がありますか？</h3>
                <p className="text-gray-300 mb-6">
                  ここに載っていない質問や、より詳しい説明が必要な場合は、お気軽にお問い合わせください。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    💬 チャットで質問
                  </button>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    📧 メールで問い合わせ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ面談を予約して、新しい一歩を踏み出そう！
          </h2>
          <p className="text-xl text-white/90 mb-6">
            あなたの成長と幸せを、私たちがサポートします
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
            面談を予約する
          </button>
          <p className="text-white/80 mt-4 text-sm">
            ※ 初回面談は30分から。お気軽にご利用ください
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

export default InterviewGuide;