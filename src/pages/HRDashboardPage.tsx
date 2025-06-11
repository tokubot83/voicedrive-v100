import React from 'react';
import { useNavigate } from 'react-router-dom';

const HRDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      {/* カスタムヘッダー */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <span className="text-xl">←</span>
              <span>ホームに戻る</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                人事ダッシュボード
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">人事ダッシュボード機能は開発中です。</p>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;