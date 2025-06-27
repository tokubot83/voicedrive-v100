import React from 'react';
import { useNavigate } from 'react-router-dom';

const TalentAnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 w-full text-white">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 m-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-xl">←</span>
              <span>ホーム</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                タレント分析
              </h1>
              <p className="text-gray-300 text-sm mt-1">人材データの詳細分析</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 開発中メッセージ */}
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">タレント分析機能</h2>
            <p className="text-gray-400 mb-4">
              高度な人材分析機能を開発中です。<br />
              近日中にリリース予定です。
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              🚧 開発中
            </div>
          </div>

          {/* 予定機能プレビュー */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-white mb-2">スキル分析</h3>
              <p className="text-gray-400 text-sm">
                職員のスキルセットと能力評価の詳細分析
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">パフォーマンス予測</h3>
              <p className="text-gray-400 text-sm">
                過去のデータに基づく将来のパフォーマンス予測
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">適性マッチング</h3>
              <p className="text-gray-400 text-sm">
                職員の適性と配置ポジションの最適化分析
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentAnalyticsPage;