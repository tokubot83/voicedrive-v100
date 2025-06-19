import React from 'react';

const HRDashboardPage = () => {

  return (
    <div className="min-h-screen text-white">
      {/* カスタムヘッダー */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              人事ダッシュボード
            </h1>
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