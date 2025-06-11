import Header from '../components/Header';

const NotificationsPage = () => {
  return (
    <>
      <Header 
        toggleSidebar={() => {}}
      />
      
      <div className="overflow-y-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 gradient-text">通知</h1>
          
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
    </>
  );
};

export default NotificationsPage;