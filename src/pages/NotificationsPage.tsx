import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Custom Header with Back Button */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ホーム</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">通知</h1>
              <p className="text-gray-400 text-sm">最新の通知を確認</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="space-y-4">
            {/* Placeholder notifications */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400">🔔</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">新しいコメント</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    あなたの改善提案に新しいコメントがあります
                  </p>
                  <p className="text-gray-500 text-xs mt-2">5分前</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">提案が承認されました</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    「業務フロー改善案」が承認されました
                  </p>
                  <p className="text-gray-500 text-xs mt-2">1時間前</p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500">すべての通知を表示しました</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;