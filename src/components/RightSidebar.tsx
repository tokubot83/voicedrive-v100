const RightSidebar = () => {
  const stats = [
    { label: '改善提案', value: 12, icon: '💡' },
    { label: 'プロジェクト', value: 6, icon: '🚀' },
    { label: '公益通報', value: 3, icon: '🚨' },
    { label: '参加率', value: '85%', icon: '📊' },
  ];

  const trendingTopics = [
    { topic: '💡 夜勤シフト改善', count: 65 },
    { topic: '🏗️ 新棟建設プロジェクト', count: 42 },
    { topic: '🚨 医療安全対策', count: 38 },
    { topic: '💬 院内勉強会', count: 29 },
  ];

  const emergencyStatus = [
    { label: '🚨 対応中の通報', value: '2件' },
    { label: '⏰ 24時間以内', value: '5件解決' },
    { label: '✅ 今週完了', value: '18件' },
  ];

  return (
    <aside className="hidden lg:block w-[350px] p-5">
      {/* 統計ウィジェット */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl mb-5 overflow-hidden backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-5 text-xl font-bold border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          📊 今日の統計
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-2.5 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 注目の議題ウィジェット */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl mb-5 overflow-hidden backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-5 text-xl font-bold border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          🔥 注目の議題
        </div>
        <div className="p-5">
          {trendingTopics.map((item, index) => (
            <div key={index} className="py-3 border-b border-white/5 last:border-b-0 transition-all duration-300 hover:translate-x-1 hover:bg-blue-500/5 -mx-5 px-5">
              <div className="font-bold text-gray-100 flex items-center gap-2">
                {item.topic}
              </div>
              <div className="text-blue-400 text-sm font-medium">
                {item.count}人が議論中
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 緊急対応状況ウィジェット */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="p-5 text-xl font-bold border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          ⚡ 緊急対応状況
        </div>
        <div className="p-5">
          {emergencyStatus.map((item, index) => (
            <div key={index} className="py-3 border-b border-white/5 last:border-b-0">
              <div className="font-bold text-gray-100">{item.label}</div>
              <div className="text-blue-400 text-sm font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;