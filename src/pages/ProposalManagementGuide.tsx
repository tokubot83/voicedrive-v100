/**
 * 投稿管理ガイドページ（管理職向け）
 * 50代・60代の方でも安心してご利用いただけるよう、
 * 物語形式の具体例を交えて詳しく説明
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProposalManagementGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'story' | 'levels' | 'step_by_step' | 'faq'>('story');

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 backdrop-blur-xl border border-purple-500/20 mb-8">
          <button
            onClick={() => navigate('/user-guide')}
            className="mb-4 flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            使い方ガイドに戻る
          </button>

          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="text-5xl">🤝</span>
            投稿管理の使い方ガイド
          </h1>
          <p className="text-xl text-gray-300">
            50代・60代の管理職の方でも安心してご利用いただけるよう、<br />
            具体例を交えて、わかりやすくご説明します
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 border border-gray-700/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'story' as const, label: '物語で理解', icon: '📖' },
              { id: 'levels' as const, label: '6段階のレベル', icon: '📊' },
              { id: 'step_by_step' as const, label: '画面操作手順', icon: '🖱️' },
              { id: 'faq' as const, label: 'よくある質問', icon: '❓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeSection === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
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
          {/* 物語で理解 */}
          {activeSection === 'story' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">📖</span>
                物語で理解する投稿管理
              </h2>

              {/* ストーリー1 */}
              <div className="mb-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>👨‍⚕️</span>
                  ある看護師の提案が、部署を超えて施設全体へ広がった話
                </h3>

                <div className="space-y-6 text-gray-300">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">【第1章】看護師・山田さんの悩み</h4>
                    <p className="text-lg leading-relaxed">
                      医療療養病棟で働く看護師の山田さん（5年目）は、ずっと気になっていることがありました。<br />
                      夜勤の引継ぎ時間が短すぎて、患者さんの大切な情報が十分に伝わらないのです。<br />
                      「もう少し時間があれば、もっと安全なケアができるのに...」
                    </p>
                    <div className="mt-4 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                      <p className="text-lg"><strong>💡 山田さんの行動：</strong><br />
                      匿名で「引継ぎ時間を15分延長したい」とVoiceDriveに投稿しました。</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-8 h-8 text-purple-400" />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">【第2章】同僚たちの共感（30点到達）</h4>
                    <p className="text-lg leading-relaxed">
                      投稿を見た同じ病棟の看護師20名が「賛成」に投票。<br />
                      コメント欄には「私も同じことを思っていました」「患者さんのためにもぜひ実現してほしい」といった声が集まりました。
                    </p>
                    <div className="mt-4 bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                      <p className="text-lg"><strong>✅ システムの動き：</strong><br />
                      30点に到達したため、自動的に「部署検討」レベルに昇格しました。</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-8 h-8 text-purple-400" />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">【第3章】主任・佐藤さんの判断（Level 6）</h4>
                    <p className="text-lg leading-relaxed">
                      主任の佐藤さんは、議題モードの「投稿管理」で山田さんの提案を見つけました。<br />
                      投票データを確認すると、支持率85%、賛成意見が多数。<br />
                      「これは部署ミーティングで話し合うべき内容だ」と判断しました。
                    </p>
                    <div className="mt-4 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                      <p className="text-lg"><strong>📝 佐藤さんの行動：</strong><br />
                      「議題提案書を作成」ボタンをクリック。<br />
                      システムが投票データとコメントから自動で提案書を作成。<br />
                      佐藤さんは「試験的に1ヶ月実施して効果を測定する」という補足コメントを追加しました。</p>
                    </div>
                    <div className="mt-4 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                      <p className="text-lg"><strong>🏥 提出先：</strong> 部署ミーティング<br />
                      翌週の部署ミーティングで議論され、試験導入が決定しました。</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-8 h-8 text-purple-400" />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">【第4章】さらなる広がり（50点到達）</h4>
                    <p className="text-lg leading-relaxed">
                      試験導入が好評で、他の病棟からも「うちでも導入したい」という声が増加。<br />
                      投票数がさらに増えて50点に到達し、「部署議題」レベルに昇格しました。
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-8 h-8 text-purple-400" />
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h4 className="text-xl font-semibold text-blue-300 mb-3">【第5章】師長・田中さんの決断（Level 8）</h4>
                    <p className="text-lg leading-relaxed">
                      師長の田中さんは、投稿管理で50点に達した提案を確認。<br />
                      「これは施設全体で導入すべき改善案だ」と判断しました。
                    </p>
                    <div className="mt-4 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                      <p className="text-lg"><strong>📝 田中さんの行動：</strong><br />
                      施設運営委員会向けの新しい議題提案書を作成。<br />
                      「部署での試験導入で医療ミスが20%減少」というデータを補足しました。</p>
                    </div>
                    <div className="mt-4 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                      <p className="text-lg"><strong>🏢 提出先：</strong> 施設運営委員会<br />
                      施設全体での正式導入が決定しました。</p>
                    </div>
                  </div>

                  <div className="mt-8 bg-green-900/20 rounded-lg p-6 border border-green-500/30">
                    <h4 className="text-xl font-semibold text-green-300 mb-3">📌 この物語から学べること</h4>
                    <ul className="space-y-3 text-lg">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>主任と師長で別々に提案書を作成</strong>した理由：提出先の委員会が違う（部署ミーティング vs 施設運営委員会）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>部署レベルの提案書も無駄ではない</strong>：試験導入の記録として、上のレベルの判断材料になった</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>スコアによる自動昇格</strong>：管理職が判断するのではなく、職員の投票で透明に決まる</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6段階のレベル */}
          {activeSection === 'levels' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">📊</span>
                6段階のレベルと提出先委員会
              </h2>

              <div className="mb-6 bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                <p className="text-xl text-gray-300 leading-relaxed">
                  投票・コメントが集まると、提案は自動的にレベルアップします。<br />
                  各レベルには担当者と提出先委員会が決まっています。
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    level: 'レベル1: PENDING',
                    score: '0-29点',
                    担当者: 'Level 5（副主任）',
                    提出先: 'なし（様子見）',
                    説明: '投票・コメントを集めている段階です。30点到達で次のレベルへ自動昇格します。',
                    color: 'gray'
                  },
                  {
                    level: 'レベル2: 部署検討',
                    score: '30-49点',
                    担当者: 'Level 6（主任）',
                    提出先: '部署ミーティング',
                    説明: '部署内で議論する価値がある提案です。主任が議題提案書を作成し、部署ミーティングに提出します。',
                    color: 'blue'
                  },
                  {
                    level: 'レベル3: 部署議題',
                    score: '50-99点',
                    担当者: 'Level 8（師長）',
                    提出先: '施設運営委員会',
                    説明: '施設レベルで検討すべき提案です。師長が新たに議題提案書を作成し、施設運営委員会に提出します。',
                    color: 'purple'
                  },
                  {
                    level: 'レベル4: 施設議題',
                    score: '100-299点',
                    担当者: 'Level 10（部長）',
                    提出先: '法人運営委員会',
                    説明: '法人レベルで検討すべき大きな提案です。部長が議題提案書を作成し、法人運営委員会に提出します。',
                    color: 'orange'
                  },
                  {
                    level: 'レベル5: 法人検討',
                    score: '300-599点',
                    担当者: 'Level 12（副院長）',
                    提出先: '法人理事会',
                    説明: '法人全体に影響する重要な提案です。副院長が議題提案書を作成し、法人理事会に提出します。',
                    color: 'red'
                  },
                  {
                    level: 'レベル6: 法人議題',
                    score: '600点以上',
                    担当者: 'Level 13（院長）',
                    提出先: '最終決定機関（理事会）',
                    説明: '最高レベルの提案です。院長が最終的な議題提案書を作成し、理事会に提出します。',
                    color: 'pink'
                  }
                ].map((item, index) => (
                  <div key={index} className={`bg-${item.color}-900/20 rounded-xl p-6 border border-${item.color}-500/30`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.level}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>スコア: {item.score}</span>
                        </div>
                      </div>
                      <span className="text-4xl">{index === 0 ? '⏳' : index === 1 ? '🏥' : index === 2 ? '🏢' : index === 3 ? '🏛️' : index === 4 ? '📋' : '👑'}</span>
                    </div>
                    <div className="space-y-3 text-lg text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">👤</span>
                        <span><strong>担当者:</strong> {item.担当者}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">📍</span>
                        <span><strong>提出先:</strong> {item.提出先}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">📝</span>
                        <span>{item.説明}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 画面操作手順 */}
          {activeSection === 'step_by_step' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">🖱️</span>
                画面操作手順（主任の例）
              </h2>

              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: '議題モードに切り替える',
                    description: '画面右上のモード切替で「議題モード」を選択します',
                    tips: 'プロジェクトモードと間違えないようご注意ください'
                  },
                  {
                    step: 2,
                    title: '投稿管理を開く',
                    description: '左サイドバーの「投稿管理」をクリックします',
                    tips: '管理職のみに表示されるメニューです'
                  },
                  {
                    step: 3,
                    title: '「管轄のみ」タブを確認',
                    description: 'あなたが担当する投稿だけが表示されます。「全て」タブでは閲覧のみ可能です',
                    tips: '普段は「管轄のみ」で自分の担当範囲を確認することをお勧めします'
                  },
                  {
                    step: 4,
                    title: '投票データを確認',
                    description: '支持率、部署別分析、コメント内容などを確認します',
                    tips: '支持率70%以上、建設的なコメントが多い場合は議題化を検討'
                  },
                  {
                    step: 5,
                    title: '議題提案書を作成',
                    description: '「議題提案書を作成」ボタンをクリック。システムが自動で提案書を生成します',
                    tips: '自動生成された内容を確認し、必要に応じて補足説明を追加'
                  },
                  {
                    step: 6,
                    title: '補足説明を追加',
                    description: '管理職の視点から、現場の状況や追加の背景情報を記入します',
                    tips: '「なぜこの提案が重要か」を委員会に伝えることが大切です'
                  },
                  {
                    step: 7,
                    title: '提出準備完了にする',
                    description: '内容を確認したら「提出準備完了としてマーク」ボタンをクリック',
                    tips: 'ステータスが「ready」になり、委員会提出の準備が整います'
                  }
                ].map((item) => (
                  <div key={item.step} className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-lg text-gray-300 mb-3">{item.description}</p>
                        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                          <p className="text-sm text-blue-300"><strong>💡 ポイント:</strong> {item.tips}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* よくある質問 */}
          {activeSection === 'faq' && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-purple-400">❓</span>
                よくある質問
              </h2>

              <div className="space-y-6">
                {[
                  {
                    question: 'システムが自動で提案書を作るなら、私は何をすればいいのですか？',
                    answer: 'システムは投票データやコメントを整理しますが、現場の実情や追加の背景情報は管理職の方にしかわかりません。「なぜこの提案が重要なのか」「現場ではどう受け止められているか」といった補足説明を追加することで、委員会での審議がスムーズになります。'
                  },
                  {
                    question: '部署ミーティングで却下された提案が、後で施設議題になることはありますか？',
                    answer: 'はい、あります。部署レベルでは時期尚早だった提案も、状況が変わったり、他の部署から賛同が集まったりして、施設レベルの議題になることがあります。その際、部署レベルの議論記録が重要な参考資料になります。'
                  },
                  {
                    question: '反対意見が多い投稿も議題提案書を作るべきですか？',
                    answer: '反対意見が多い場合でも、建設的な議論がなされているなら議題化を検討する価値があります。むしろ、賛否が分かれている問題こそ、委員会でしっかり議論すべきテーマです。ただし、誹謗中傷が含まれる場合は慎重に判断してください。'
                  },
                  {
                    question: '提出準備完了にしたら、すぐに委員会に送られてしまうのですか？',
                    answer: 'いいえ、「提出準備完了」は準備ができたという意味で、実際の委員会提出にはさらに承認プロセスがあります（Level 7以上が提出リクエスト → Level 8以上が承認）。焦らず、内容を十分に確認してから提出準備完了にしてください。'
                  },
                  {
                    question: '他の管理職と意見が異なる場合、どうすればいいですか？',
                    answer: '議題提案書には透明性ログがあり、誰がいつ何を編集したか記録されます。異なる視点があること自体は健全です。それぞれの立場から補足説明を追加し、最終的には委員会で判断してもらうのが良いでしょう。'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-start gap-2">
                      <span className="text-purple-400">Q{index + 1}.</span>
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed ml-8">{item.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>💬</span>
                  さらに質問がある場合
                </h3>
                <p className="text-lg text-gray-300 mb-4">
                  このガイドで解決しない場合は、お気軽に以下にお問い合わせください：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                    <h4 className="font-semibold text-white mb-2">📞 人事部門</h4>
                    <p className="text-lg">内線: 1234</p>
                  </div>
                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                    <h4 className="font-semibold text-white mb-2">👥 上位管理職</h4>
                    <p className="text-lg">直接ご相談ください</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default ProposalManagementGuide;
