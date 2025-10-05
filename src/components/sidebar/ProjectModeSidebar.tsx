import { useState, useEffect } from 'react';
import {
  Bell,
  TrendingUp,
  Activity,
  Vote,
  CheckSquare,
  Calendar,
  Zap,
  Users,
  Target,
  GitBranch
} from 'lucide-react';

const ProjectModeSidebar = () => {
  // 通知センター
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'mention', message: '田中さんがプロジェクトにあなたを追加しました', time: '5分前', unread: true },
    { id: 2, type: 'task', message: 'タスク「UI改善」の期限が近づいています', time: '1時間前', unread: true },
    { id: 3, type: 'approval', message: 'レビュー待ちの提案が2件あります', time: '3時間前', unread: false }
  ]);

  // プロジェクト進捗
  const [projectProgress, setProjectProgress] = useState([
    { id: 1, name: '夜勤シフト最適化プロジェクト', phase: 'フェーズ2', progress: 65, team: 12, status: 'active' },
    { id: 2, name: '新型機器導入プロジェクト', phase: 'フェーズ1', progress: 30, team: 8, status: 'planning' },
    { id: 3, name: '感染対策強化プロジェクト', phase: 'フェーズ3', progress: 85, team: 15, status: 'review' }
  ]);

  // チーム活動
  const [teamActivity, setTeamActivity] = useState({
    activeMembers: 342,
    todayTasks: 89,
    completedTasks: 456,
    teamEfficiency: 78
  });

  // 合意形成
  const [consensusItems, setConsensusItems] = useState([
    { id: 1, title: 'デザイン案A vs B', deadline: '残り2日', voted: false, participation: 67 },
    { id: 2, title: '実装スケジュール確定', deadline: '残り5日', voted: true, participation: 89 }
  ]);

  // タスク管理
  const [taskTracker, setTaskTracker] = useState({
    urgent: 3,
    inProgress: 12,
    review: 5,
    completedToday: 18,
    blockers: 2
  });

  // プロジェクトイベント
  const [projectEvents, setProjectEvents] = useState([
    { id: 1, title: 'スプリントレビュー', date: '12/25 14:00', type: 'review' },
    { id: 2, title: 'チームビルディング', date: '12/28 10:00', type: 'team' },
    { id: 3, title: 'ステークホルダー会議', date: '12/30 15:00', type: 'meeting' }
  ]);

  // マイルストーン
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'プロトタイプ完成', dueDate: '12/31', status: 'on-track' },
    { id: 2, title: 'ユーザーテスト開始', dueDate: '1/15', status: 'at-risk' }
  ]);

  // リアルタイム更新のシミュレーション
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamActivity(prev => ({
        ...prev,
        activeMembers: prev.activeMembers + Math.floor(Math.random() * 5 - 2),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 3)
      }));
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-4 overflow-y-auto space-y-4">
      {/* 1. 通知センター */}
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

      {/* 2. プロジェクト進捗 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-white">プロジェクト進捗</span>
          </div>
        </div>
        <div className="p-3">
          {projectProgress.map((project) => (
            <div
              key={project.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 transition-all hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">{project.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{project.phase}</span>
                    <span className="text-xs text-blue-400">{project.team}名</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  project.status === 'planning' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {project.status === 'active' ? '進行中' :
                   project.status === 'planning' ? '計画中' : 'レビュー'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 mt-1">{project.progress}%完了</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. チーム活動 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="font-bold text-white">チーム活動</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{teamActivity.activeMembers}</div>
              <div className="text-xs text-gray-400">アクティブ</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{teamActivity.todayTasks}</div>
              <div className="text-xs text-gray-400">本日タスク</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{teamActivity.completedTasks}</div>
              <div className="text-xs text-gray-400">完了済み</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{teamActivity.teamEfficiency}%</div>
              <div className="text-xs text-gray-400">効率性</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 合意形成 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">合意形成</span>
          </div>
        </div>
        <div className="p-3">
          {consensusItems.map((item) => (
            <div
              key={item.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{item.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-orange-400 font-medium">{item.deadline}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{item.participation}%参加</span>
                  {item.voted && <span className="text-xs text-green-400">✓投票済</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. タスク管理 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">タスクトラッカー</span>
            {taskTracker.blockers > 0 && (
              <span className="ml-auto bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">
                {taskTracker.blockers}ブロッカー
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">緊急タスク</span>
              <span className="text-sm font-bold text-red-400">{taskTracker.urgent}件</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">進行中</span>
              <span className="text-sm font-bold text-orange-400">{taskTracker.inProgress}件</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">レビュー待ち</span>
              <span className="text-sm font-bold text-yellow-400">{taskTracker.review}件</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-300">本日完了</span>
              <span className="text-sm font-bold text-green-400">{taskTracker.completedToday}件</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. マイルストーン */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-white">マイルストーン</span>
          </div>
        </div>
        <div className="p-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 hover:bg-white/5 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{milestone.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{milestone.dueDate}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  milestone.status === 'on-track' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {milestone.status === 'on-track' ? '順調' : '要注意'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. プロジェクトイベント */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            <span className="font-bold text-white">プロジェクトイベント</span>
          </div>
        </div>
        <div className="p-3">
          {projectEvents.map((event) => (
            <div
              key={event.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 hover:bg-white/5 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{event.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-blue-400">{event.date}</span>
                <span className="text-xs text-gray-400">
                  {event.type === 'review' ? '📊' : event.type === 'team' ? '👥' : '📅'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. クイックアクション */}
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
              タスク作成
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs py-2 px-3 rounded-lg transition-all">
              レビュー依頼
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs py-2 px-3 rounded-lg transition-all">
              ドキュメント
            </button>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs py-2 px-3 rounded-lg transition-all">
              チャット開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModeSidebar;