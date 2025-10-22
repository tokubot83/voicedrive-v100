import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Building2, Calendar, BarChart3, Users } from 'lucide-react';

/**
 * 理事会決定事項フォロー
 *
 * 対象: レベル18（理事長・法人事務局長）
 * 目的: 理事会で決定された事項の実施進捗を追跡し、各施設での展開状況を管理
 */

interface BoardDecision {
  id: string;
  meetingDate: string;
  title: string;
  category: string;
  description: string;
  decision: string;
  implementationDeadline: string;
  responsibleDept: string;
  affectedFacilities: string[];
  status: 'completed' | 'on_track' | 'at_risk' | 'delayed';
  progress: number; // 0-100
  milestones: Milestone[];
  lastUpdate: string;
}

interface Milestone {
  id: string;
  title: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  assignee: string;
}

interface FacilityImplementation {
  facilityName: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  note: string;
}

export const BoardDecisionFollowPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [boardDecisions, setBoardDecisions] = useState<BoardDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API: 理事会決定事項一覧取得
  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedStatus !== 'all') {
          params.append('status', selectedStatus);
        }

        const response = await fetch(`/api/board-decisions?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setBoardDecisions(data.data.decisions);
        } else {
          setError(data.error || 'データの取得に失敗しました');
        }
      } catch (err: any) {
        console.error('理事会決定事項の取得エラー:', err);
        setError('ネットワークエラーが発生しました');
        // エラー時はモックデータを表示（開発用）
        setBoardDecisions(mockBoardDecisions);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, [selectedStatus]);

  // モックデータ（DB構築前・API未接続時のフォールバック）
  const mockBoardDecisions: BoardDecision[] = [
    {
      id: 'dec-001',
      meetingDate: '2025年7月15日',
      title: 'VoiceDrive議題化プロセス全施設展開',
      category: 'システム導入',
      description: '現在3施設で試験運用中のVoiceDrive議題化プロセスを、2026年4月より全10施設に展開する。',
      decision: '予算800万円を承認。2026年4月本格運用開始。',
      implementationDeadline: '2026年4月1日',
      responsibleDept: '人事部・IT部',
      affectedFacilities: ['全10施設'],
      status: 'on_track',
      progress: 45,
      milestones: [
        {
          id: 'm1',
          title: 'システム改修・機能拡張',
          deadline: '2025年12月末',
          status: 'in_progress',
          assignee: 'IT部'
        },
        {
          id: 'm2',
          title: '各施設での説明会開催',
          deadline: '2026年1月末',
          status: 'pending',
          assignee: '人事部'
        },
        {
          id: 'm3',
          title: '管理者向けトレーニング',
          deadline: '2026年2月末',
          status: 'pending',
          assignee: '人事部'
        },
        {
          id: 'm4',
          title: '本格運用開始',
          deadline: '2026年4月1日',
          status: 'pending',
          assignee: '人事部・IT部'
        }
      ],
      lastUpdate: '2日前'
    },
    {
      id: 'dec-002',
      meetingDate: '2025年7月15日',
      title: '施設間人材ローテーション制度試験導入',
      category: '人事制度',
      description: '施設間での人材融通により、夜勤負担の平準化と職員のスキル向上を図る。',
      decision: '予算500万円を承認。2026年4月より6ヶ月間の試験運用。',
      implementationDeadline: '2026年4月1日',
      responsibleDept: '戦略企画部・人事部',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '東部リハビリ病院'],
      status: 'on_track',
      progress: 38,
      milestones: [
        {
          id: 'm1',
          title: '制度詳細設計',
          deadline: '2025年11月末',
          status: 'in_progress',
          assignee: '戦略企画部'
        },
        {
          id: 'm2',
          title: '対象職員への説明・同意取得',
          deadline: '2026年1月末',
          status: 'pending',
          assignee: '人事部'
        },
        {
          id: 'm3',
          title: 'システム・勤怠管理整備',
          deadline: '2026年2月末',
          status: 'pending',
          assignee: 'IT部'
        },
        {
          id: 'm4',
          title: '試験運用開始',
          deadline: '2026年4月1日',
          status: 'pending',
          assignee: '戦略企画部'
        }
      ],
      lastUpdate: '1週間前'
    },
    {
      id: 'dec-003',
      meetingDate: '2025年4月20日',
      title: 'メンター制度の法人全体展開',
      category: '人材育成',
      description: '中央総合病院で成功したメンター制度を全施設に展開し、新人定着率向上を図る。',
      decision: '予算300万円を承認。2025年10月より順次展開。',
      implementationDeadline: '2025年10月1日',
      responsibleDept: '人事部',
      affectedFacilities: ['全10施設'],
      status: 'completed',
      progress: 100,
      milestones: [
        {
          id: 'm1',
          title: 'メンター研修プログラム開発',
          deadline: '2025年6月末',
          status: 'completed',
          assignee: '人事部'
        },
        {
          id: 'm2',
          title: 'メンター選定・研修実施',
          deadline: '2025年8月末',
          status: 'completed',
          assignee: '人事部'
        },
        {
          id: 'm3',
          title: '全施設での制度開始',
          deadline: '2025年10月1日',
          status: 'completed',
          assignee: '人事部'
        }
      ],
      lastUpdate: '1ヶ月前'
    },
    {
      id: 'dec-004',
      meetingDate: '2025年7月15日',
      title: '法人統一キャリアラダー制度設計',
      category: '人事制度',
      description: '法人全体で統一されたキャリアラダーを設計し、職員のキャリアパスを明確化。',
      decision: '予算300万円を承認。2026年10月運用開始。',
      implementationDeadline: '2026年10月1日',
      responsibleDept: '人事部',
      affectedFacilities: ['全10施設'],
      status: 'at_risk',
      progress: 22,
      milestones: [
        {
          id: 'm1',
          title: '現状調査・分析',
          deadline: '2025年10月末',
          status: 'completed',
          assignee: '人事部'
        },
        {
          id: 'm2',
          title: 'キャリアラダー制度設計',
          deadline: '2025年12月末',
          status: 'delayed',
          assignee: '人事部'
        },
        {
          id: 'm3',
          title: '施設長・部門長承認',
          deadline: '2026年3月末',
          status: 'pending',
          assignee: '戦略企画部'
        },
        {
          id: 'm4',
          title: '全職員への説明・運用開始',
          deadline: '2026年10月1日',
          status: 'pending',
          assignee: '人事部'
        }
      ],
      lastUpdate: '3日前'
    },
    {
      id: 'dec-005',
      meetingDate: '2025年1月18日',
      title: '電子カルテシステムUI改善',
      category: 'IT・システム',
      description: '職員から多数の要望があった電子カルテシステムの操作性改善をベンダーに依頼。',
      decision: '予算250万円を承認。2025年9月実装。',
      implementationDeadline: '2025年9月30日',
      responsibleDept: 'IT部',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '海浜医療センター'],
      status: 'delayed',
      progress: 68,
      milestones: [
        {
          id: 'm1',
          title: '要件定義・ベンダー調整',
          deadline: '2025年3月末',
          status: 'completed',
          assignee: 'IT部'
        },
        {
          id: 'm2',
          title: 'システム改修開発',
          deadline: '2025年7月末',
          status: 'completed',
          assignee: 'ベンダー'
        },
        {
          id: 'm3',
          title: 'テスト環境での検証',
          deadline: '2025年8月末',
          status: 'delayed',
          assignee: 'IT部'
        },
        {
          id: 'm4',
          title: '本番環境リリース',
          deadline: '2025年9月30日',
          status: 'pending',
          assignee: 'IT部'
        }
      ],
      lastUpdate: '5日前'
    }
  ];

  // 施設別実施状況（例: VoiceDrive展開）
  const facilityImplementations: FacilityImplementation[] = [
    { facilityName: '中央総合病院', status: 'completed', progress: 100, note: '試験運用施設。順調に稼働中。' },
    { facilityName: '北部医療センター', status: 'completed', progress: 100, note: '試験運用施設。参加率68%達成。' },
    { facilityName: '桜ヶ丘総合病院', status: 'completed', progress: 100, note: '試験運用施設。良好な成果。' },
    { facilityName: '海浜医療センター', status: 'in_progress', progress: 60, note: '説明会実施済。管理者トレーニング中。' },
    { facilityName: '東部リハビリ病院', status: 'in_progress', progress: 45, note: '説明会実施済。' },
    { facilityName: '山手リハビリセンター', status: 'in_progress', progress: 40, note: '説明会予定。' },
    { facilityName: '南部クリニック', status: 'not_started', progress: 0, note: '2026年2月説明会予定。' },
    { facilityName: '青葉台クリニック', status: 'not_started', progress: 0, note: '2026年2月説明会予定。' },
    { facilityName: '西部介護施設', status: 'not_started', progress: 0, note: '2026年3月説明会予定。' },
    { facilityName: '緑の森介護センター', status: 'not_started', progress: 0, note: '2026年3月説明会予定。' }
  ];

  const statusFilters = [
    { id: 'all', label: '全て', count: boardDecisions.length },
    { id: 'completed', label: '完了', count: boardDecisions.filter(d => d.status === 'completed').length },
    { id: 'on_track', label: '順調', count: boardDecisions.filter(d => d.status === 'on_track').length },
    { id: 'at_risk', label: '要注意', count: boardDecisions.filter(d => d.status === 'at_risk').length },
    { id: 'delayed', label: '遅延', count: boardDecisions.filter(d => d.status === 'delayed').length }
  ];

  const filteredDecisions = selectedStatus === 'all'
    ? boardDecisions
    : boardDecisions.filter(d => d.status === selectedStatus);

  const getStatusColor = (status: BoardDecision['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'on_track': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'at_risk': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'delayed': return 'text-red-400 bg-red-400/10 border-red-400/30';
    }
  };

  const getStatusLabel = (status: BoardDecision['status']) => {
    switch (status) {
      case 'completed': return '完了';
      case 'on_track': return '順調';
      case 'at_risk': return '要注意';
      case 'delayed': return '遅延';
    }
  };

  const getStatusIcon = (status: BoardDecision['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'on_track': return <TrendingUp className="w-5 h-5" />;
      case 'at_risk': return <Clock className="w-5 h-5" />;
      case 'delayed': return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-400';
      case 'in_progress': return 'bg-blue-400';
      case 'delayed': return 'bg-red-400';
      case 'pending': return 'bg-gray-400';
    }
  };

  const completedCount = boardDecisions.filter(d => d.status === 'completed').length;
  const onTrackCount = boardDecisions.filter(d => d.status === 'on_track').length;
  const atRiskCount = boardDecisions.filter(d => d.status === 'at_risk').length;
  const delayedCount = boardDecisions.filter(d => d.status === 'delayed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">理事会決定事項フォロー</h1>
              <p className="text-gray-400">理事会決定事項の実施進捗と施設展開状況を管理</p>
            </div>
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">完了</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">{completedCount}件</div>
            <p className="text-sm text-gray-400">予定通り完了</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">順調</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">{onTrackCount}件</div>
            <p className="text-sm text-gray-400">予定通り進行中</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">要注意</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">{atRiskCount}件</div>
            <p className="text-sm text-gray-400">進捗に注意が必要</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-400">遅延</span>
            </div>
            <div className="text-3xl font-bold text-red-400 mb-1">{delayedCount}件</div>
            <p className="text-sm text-gray-400">対応が必要</p>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">エラーが発生しました</p>
                <p className="text-sm text-red-300">{error}</p>
                <p className="text-xs text-gray-400 mt-1">モックデータを表示しています（開発モード）</p>
              </div>
            </div>
          </div>
        )}

        {/* フィルター */}
        <div className="flex gap-2 mb-6">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedStatus(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedStatus === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* ローディング状態 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">理事会決定事項を読み込み中...</p>
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400">該当する決定事項が見つかりません</p>
          </div>
        ) : (
          <div className="space-y-6">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{decision.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${getStatusColor(decision.status)}`}>
                      {getStatusIcon(decision.status)}
                      {getStatusLabel(decision.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      理事会: {decision.meetingDate}
                    </span>
                    <span>担当: {decision.responsibleDept}</span>
                    <span>期限: {decision.implementationDeadline}</span>
                    <span className="text-gray-500">更新: {decision.lastUpdate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">進捗</p>
                  <p className="text-3xl font-bold">{decision.progress}%</p>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{decision.description}</p>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">理事会決定:</p>
                <p className="text-green-400">{decision.decision}</p>
              </div>

              {/* 進捗バー */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>実施進捗</span>
                  <span>{decision.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      decision.status === 'completed' ? 'bg-green-400' :
                      decision.status === 'on_track' ? 'bg-blue-400' :
                      decision.status === 'at_risk' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${decision.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* マイルストーン */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-400 mb-3">マイルストーン:</p>
                <div className="space-y-2">
                  {decision.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                      <div className={`w-3 h-3 rounded-full ${getMilestoneStatusColor(milestone.status)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{milestone.title}</span>
                          <span className="text-sm text-gray-400">{milestone.assignee}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>期限: {milestone.deadline}</span>
                          <span className={
                            milestone.status === 'completed' ? 'text-green-400' :
                            milestone.status === 'in_progress' ? 'text-blue-400' :
                            milestone.status === 'delayed' ? 'text-red-400' : 'text-gray-400'
                          }>
                            {milestone.status === 'completed' ? '完了' :
                             milestone.status === 'in_progress' ? '進行中' :
                             milestone.status === 'delayed' ? '遅延' : '未着手'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 影響施設 */}
              <div>
                <p className="text-sm text-gray-400 mb-2">影響施設:</p>
                <div className="flex flex-wrap gap-2">
                  {decision.affectedFacilities.map((facility, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-700/50 rounded text-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* 施設別実施状況（サンプル: VoiceDrive展開） */}
        {selectedDecision === 'dec-001' && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">施設別実施状況</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilityImplementations.map((impl, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{impl.facilityName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      impl.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                      impl.status === 'in_progress' ? 'bg-blue-400/20 text-blue-400' :
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {impl.status === 'completed' ? '完了' : impl.status === 'in_progress' ? '進行中' : '未開始'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>進捗</span>
                      <span>{impl.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          impl.status === 'completed' ? 'bg-green-400' :
                          impl.status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${impl.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{impl.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
