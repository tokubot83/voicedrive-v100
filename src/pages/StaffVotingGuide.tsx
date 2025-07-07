import React from 'react';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

const StaffVotingGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            🗳️ VoiceDriveの投票はこうして公平になる！
          </h1>
          <p className="text-xl text-white/90">
            みんなの意見が平等に反映される仕組み
          </p>
        </div>

        {/* なぜ投票が大切？ */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-blue-500">
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
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-green-500">
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
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-purple-500">
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 border-2 border-white/20">
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