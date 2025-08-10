import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Activity, Vote, AlertTriangle, Calendar, Zap } from 'lucide-react';

const RightSidebar = () => {
  // パーソナライズ通知
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'mention', message: '田中さんがあなたをメンションしました', time: '5分前', unread: true },
    { id: 2, type: 'reply', message: '改善提案に返信がありました', time: '1時間前', unread: true },
    { id: 3, type: 'approval', message: '承認待ちの提案が2件あります', time: '3時間前', unread: false },
  ]);

  // 注目トピック
  const [trendingTopics, setTrendingTopics] = useState([
    { id: 1, title: '夜勤シフトの効率化', category: '改善提案', participants: 128, growth: '+23%' },
    { id: 2, title: '新型医療機器の導入検討', category: 'プロジェクト', participants: 89, growth: '+15%' },
    { id: 3, title: '院内感染予防対策の強化', category: '緊急', participants: 234, growth: '+67%' },
    { id: 4, title: 'ワークライフバランス改善', category: 'フリーボイス', participants: 156, growth: '+31%' },
  ]);

  // リアルタイム活動
  const [activityStats, setActivityStats] = useState({
    activeUsers: 342,
    todayPosts: 89,
    todayComments: 456,
    participationRate: 78,
  });

  // 投票・合意形成
  const [activeVotes, setActiveVotes] = useState([
    { id: 1, title: '休憩室リニューアル案', deadline: '残り2日', voted: false, participation: 67 },
    { id: 2, title: '新制服デザイン選定', deadline: '残り5日', voted: true, participation: 89 },
  ]);

  // 緊急対応
  const [emergencyItems, setEmergencyItems] = useState({
    active: 2,
    resolved24h: 5,
    weeklyTotal: 18,
  });

  // イベント
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: '全体会議', date: '12/25 14:00', type: 'meeting' },
    { id: 2, title: '改善提案発表会', date: '12/28 10:00', type: 'presentation' },
  ]);

  // リアルタイム更新のシミュレーション
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5 - 2),
        todayComments: prev.todayComments + Math.floor(Math.random() * 3),
      }));
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-4 overflow-y-auto space-y-4">
      {/* 1. パーソナライズ通知センター */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">通知センター</span>
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`py-2 px-3 rounded-lg mb-2 last:mb-0 transition-all hover:bg-white/5 cursor-pointer ${
                notif.unread ? 'bg-blue-500/10 border-l-2 border-blue-400' : ''
              }`}
            >
              <p className="text-sm text-gray-200">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 注目トピック・トレンド */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-white">注目トピック</span>
          </div>
        </div>
        <div className="p-3">
          {trendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 transition-all hover:bg-white/5 hover:translate-x-1 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">{topic.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{topic.category}</span>
                    <span className="text-xs text-blue-400">{topic.participants}人参加</span>
                  </div>
                </div>
                <span className="text-xs text-green-400 font-bold">{topic.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. リアルタイム活動ダッシュボード */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="font-bold text-white">リアルタイム活動</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{activityStats.activeUsers}</div>
              <div className="text-xs text-gray-400">アクティブ</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{activityStats.todayPosts}</div>
              <div className="text-xs text-gray-400">本日の投稿</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{activityStats.todayComments}</div>
              <div className="text-xs text-gray-400">コメント</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{activityStats.participationRate}%</div>
              <div className="text-xs text-gray-400">参加率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 投票・合意形成モニター */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">進行中の投票</span>
          </div>
        </div>
        <div className="p-3">
          {activeVotes.map((vote) => (
            <div
              key={vote.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{vote.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-orange-400 font-medium">{vote.deadline}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{vote.participation}%参加</span>
                  {vote.voted && <span className="text-xs text-green-400">✓投票済</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 緊急対応トラッカー */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white">緊急対応状況</span>
          </div>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">対応中</span>
              <span className="text-sm font-bold text-red-400">{emergencyItems.active}件</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">24時間以内解決</span>
              <span className="text-sm font-bold text-green-400">{emergencyItems.resolved24h}件</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">今週の完了</span>
              <span className="text-sm font-bold text-blue-400">{emergencyItems.weeklyTotal}件</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 今後のイベント */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">今後のイベント</span>
          </div>
        </div>
        <div className="p-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 hover:bg-white/5 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{event.title}</p>
              <p className="text-xs text-blue-400 mt-1">{event.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. クイックアクション */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">クイックアクション</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded-lg transition-all">
              新規投稿
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs py-2 px-3 rounded-lg transition-all">
              面談予約
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs py-2 px-3 rounded-lg transition-all">
              下書き
            </button>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs py-2 px-3 rounded-lg transition-all">
              テンプレート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;