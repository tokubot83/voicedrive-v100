import { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  MessageSquare,
  Vote,
  TrendingUp,
  AlertTriangle,
  Zap,
  Gavel,
  Clock,
  BarChart3
} from 'lucide-react';

const AgendaModeSidebar = () => {
  // 議題提出状況
  const [agendaSubmissions, setAgendaSubmissions] = useState({
    newToday: 5,
    underReview: 12,
    pendingDecision: 8,
    decidedThisWeek: 23
  });

  // 委員会活動
  const [committeeActivity, setCommitteeActivity] = useState([
    { id: 1, name: '医療安全委員会', time: '14:00〜', status: 'active', participants: 12 },
    { id: 2, name: '業務改善委員会', time: '明日 10:00', status: 'scheduled', participants: 8 },
    { id: 3, name: '教育研修委員会', time: '月曜 15:00', status: 'scheduled', participants: 15 }
  ]);

  // アクティブな議論
  const [activeDiscussions, setActiveDiscussions] = useState([
    { id: 1, title: '外来待ち時間の改善について', replies: 45, lastActivity: '5分前', heat: 'hot' },
    { id: 2, title: '夜勤体制の見直し案', replies: 32, lastActivity: '30分前', heat: 'warm' },
    { id: 3, title: '新システム導入の検討', replies: 18, lastActivity: '1時間前', heat: 'normal' }
  ]);

  // 決議プロセス
  const [resolutionProcess, setResolutionProcess] = useState([
    { id: 1, title: '休憩室改善案', stage: '投票中', deadline: '残り2日', support: 67, oppose: 23, abstain: 10 },
    { id: 2, title: '研修制度の変更', stage: '可決', date: '昨日', support: 78, oppose: 12, abstain: 10 }
  ]);

  // 議題レベル進行
  const [agendaProgress, setAgendaProgress] = useState({
    level1: { count: 45, label: '個人課題' },
    level2: { count: 23, label: '部署議題' },
    level3: { count: 12, label: '他部署協議' },
    level4: { count: 8, label: '委員会審議' },
    level5: { count: 3, label: '経営会議' }
  });

  // 緊急審議
  const [urgentItems, setUrgentItems] = useState([
    { id: 1, title: 'インシデント対策の即時対応', priority: 'critical', addedTime: '10分前' },
    { id: 2, title: '感染対策強化の必要性', priority: 'high', addedTime: '2時間前' }
  ]);

  // リアルタイム更新のシミュレーション
  useEffect(() => {
    const interval = setInterval(() => {
      setAgendaSubmissions(prev => ({
        ...prev,
        newToday: prev.newToday + Math.floor(Math.random() * 2)
      }));
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-4 overflow-y-auto space-y-4">
      {/* 1. 議題提出状況 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">議題提出状況</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{agendaSubmissions.newToday}</div>
              <div className="text-xs text-gray-400">本日の新規</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{agendaSubmissions.underReview}</div>
              <div className="text-xs text-gray-400">審議中</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{agendaSubmissions.pendingDecision}</div>
              <div className="text-xs text-gray-400">決議待ち</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{agendaSubmissions.decidedThisWeek}</div>
              <div className="text-xs text-gray-400">今週決定</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 委員会活動 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">委員会活動</span>
          </div>
        </div>
        <div className="p-3">
          {committeeActivity.map((committee) => (
            <div
              key={committee.id}
              className={`py-2 px-3 rounded-lg mb-2 last:mb-0 transition-all hover:bg-white/5 cursor-pointer ${
                committee.status === 'active' ? 'bg-green-500/10 border-l-2 border-green-400' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-100">{committee.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{committee.time}</span>
                <span className="text-xs text-blue-400">{committee.participants}名参加</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 発言・討論 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-teal-500/10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <span className="font-bold text-white">アクティブな議論</span>
          </div>
        </div>
        <div className="p-3">
          {activeDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 transition-all hover:bg-white/5 hover:translate-x-1 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-100">{discussion.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{discussion.replies}件の返信</span>
                    <span className="text-xs text-blue-400">{discussion.lastActivity}</span>
                  </div>
                </div>
                {discussion.heat === 'hot' && (
                  <span className="text-xs text-red-400 font-bold">🔥</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 決議プロセス */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">決議プロセス</span>
          </div>
        </div>
        <div className="p-3">
          {resolutionProcess.map((item) => (
            <div
              key={item.id}
              className="py-2 px-3 rounded-lg mb-2 last:mb-0 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-100">{item.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.stage === '投票中' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
                }`}>
                  {item.stage}
                </span>
                <span className="text-xs text-gray-400">
                  {item.deadline || item.date}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-green-400">賛成 {item.support}%</span>
                <span className="text-red-400">反対 {item.oppose}%</span>
                <span className="text-gray-400">保留 {item.abstain}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 議題レベル進行 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-green-500/10">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-white">議題レベル進行</span>
          </div>
        </div>
        <div className="p-3">
          {Object.entries(agendaProgress).map(([level, data]) => (
            <div key={level} className="flex items-center justify-between py-2 hover:bg-white/5 rounded px-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${
                  level === 'level5' ? 'text-purple-400' :
                  level === 'level4' ? 'text-blue-400' :
                  level === 'level3' ? 'text-green-400' :
                  level === 'level2' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {level.toUpperCase()}
                </span>
                <span className="text-xs text-gray-300">{data.label}</span>
              </div>
              <span className="text-sm font-bold text-white">{data.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 緊急審議 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white">緊急審議</span>
            {urgentItems.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {urgentItems.length}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          {urgentItems.map((item) => (
            <div
              key={item.id}
              className={`py-2 px-3 rounded-lg mb-2 last:mb-0 border-l-2 ${
                item.priority === 'critical' ? 'bg-red-500/10 border-red-500' : 'bg-orange-500/10 border-orange-500'
              }`}
            >
              <p className="text-sm font-medium text-gray-100">{item.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs font-bold ${
                  item.priority === 'critical' ? 'text-red-400' : 'text-orange-400'
                }`}>
                  {item.priority === 'critical' ? '最優先' : '優先'}
                </span>
                <span className="text-xs text-gray-400">{item.addedTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. クイック議題作成 */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">クイックアクション</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs py-2 px-3 rounded-lg transition-all">
              議題作成
            </button>
            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded-lg transition-all">
              意見書
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs py-2 px-3 rounded-lg transition-all">
              動議提出
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs py-2 px-3 rounded-lg transition-all">
              議事録確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaModeSidebar;