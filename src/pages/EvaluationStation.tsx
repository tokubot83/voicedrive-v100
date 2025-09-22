import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useDemoMode } from '../components/demo/DemoModeController';
import { 
  Bell, 
  Calendar, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Award,
  BarChart3
} from 'lucide-react';

// デモ用評価データ
const generateDemoEvaluationData = (user: any) => {
  const currentYear = new Date().getFullYear();
  
  return {
    currentNotifications: [
      {
        id: 'eval_2025_winter',
        period: '2025年冬期評価',
        score: 87,
        grade: 'A+',
        disclosureDate: '2025-03-15',
        appealDeadline: '2025-03-29',
        isRead: false,
        canAppeal: true
      }
    ],
    recentEvaluations: [
      {
        id: 'eval_2024_autumn',
        period: '2024年秋期評価',
        score: 82,
        grade: 'A',
        disclosureDate: '2024-12-15',
        finalScore: 82,
        appealSubmitted: false
      },
      {
        id: 'eval_2024_summer',
        period: '2024年夏期評価', 
        score: 79,
        grade: 'B+',
        disclosureDate: '2024-09-15',
        finalScore: 81,
        appealSubmitted: true,
        appealResult: 'approved'
      },
      {
        id: 'eval_2024_spring',
        period: '2024年春期評価',
        score: 85,
        grade: 'A',
        disclosureDate: '2024-06-15',
        finalScore: 85,
        appealSubmitted: false
      }
    ],
    upcomingInterviews: [
      {
        id: 'interview_001',
        type: 'フィードバック面談',
        date: '2025-03-20',
        time: '14:00-15:00',
        interviewer: '田中部長',
        status: 'confirmed'
      }
    ],
    activeAppeals: [],
    stats: {
      averageScore: 83.2,
      trend: '+2.8',
      rank: '部署内 3位/15人',
      improvementRate: 94
    }
  };
};

const GradeDisplay: React.FC<{ grade: string; score: number }> = ({ grade, score }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-purple-400 bg-purple-500/20 border-purple-500';
      case 'A+': return 'text-blue-400 bg-blue-500/20 border-blue-500';
      case 'A': return 'text-green-400 bg-green-500/20 border-green-500';
      case 'B+': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'B': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'C': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'D': return 'text-gray-400 bg-gray-500/20 border-gray-500';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(grade)}`}>
        {grade}
      </div>
      <span className="text-lg font-semibold text-white">{score}点</span>
    </div>
  );
};

const EvaluationStation: React.FC = () => {
  const { userLevel: userPermissionLevel } = usePermissions();
  const { isDemoMode, currentUser } = useDemoMode();
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notifications' | 'history' | 'interviews' | 'appeals'>('dashboard');

  // Level 4以上（部長・事務長・副院長・院長等）は評価対象外
  const isEvaluationTarget = userPermissionLevel <= 3;

  useEffect(() => {
    if (isDemoMode && isEvaluationTarget) {
      setEvaluationData(generateDemoEvaluationData(currentUser));
    }
  }, [isDemoMode, currentUser, isEvaluationTarget]);

  // 評価対象外の場合の表示
  if (!isEvaluationTarget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-700/50 backdrop-blur rounded-full flex items-center justify-center border border-gray-600">
              <Users className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">管理職評価システム</h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              部長職以上（レベル4以上）の皆様は、別途設定された管理職評価制度の対象となります。<br />
              定期的な人事評価については、人事部門から個別にご連絡いたします。
            </p>
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-white mb-3">管理職向け機能</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>組織運営ダッシュボード</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>部門パフォーマンス分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>戦略的意思決定支援</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // タブごとのコンテンツをレンダリング
  const renderDashboard = () => (
    <>
      {/* 現在の評価通知 */}
      {evaluationData.currentNotifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            新しい評価通知
          </h2>
          <div className="grid gap-4">
            {evaluationData.currentNotifications.map((notification: any) => (
              <div key={notification.id} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{notification.period}</h3>
                      {!notification.isRead && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                          未読
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <GradeDisplay grade={notification.grade} score={notification.score} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="font-medium">開示日：</span>
                        {notification.disclosureDate}
                      </div>
                      <div>
                        <span className="font-medium">異議申立期限：</span>
                        {notification.appealDeadline}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      to={`/evaluation-station/notifications/${notification.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                    >
                      詳細確認
                    </Link>
                    {notification.canAppeal && (
                      <Link
                        to={`/evaluation-station/appeals/new?evaluation=${notification.id}`}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm text-center"
                      >
                        異議申立
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 成績サマリー */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">成績サマリー</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-400">平均スコア</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{evaluationData.stats.averageScore}</span>
                <span className="text-sm text-green-400 font-medium">{evaluationData.stats.trend}</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">部署内順位</span>
              <div className="text-lg font-semibold text-white">{evaluationData.stats.rank}</div>
            </div>
          </div>
        </div>

        {/* 評価履歴 */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">評価履歴</h3>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              すべて見る
            </button>
          </div>
          <div className="space-y-3">
            {evaluationData.recentEvaluations.slice(0, 3).map((evaluation: any) => (
              <div key={evaluation.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{evaluation.period}</div>
                  <div className="text-xs text-gray-500">{evaluation.disclosureDate}</div>
                </div>
                <GradeDisplay grade={evaluation.grade} score={evaluation.score} />
              </div>
            ))}
          </div>
        </div>

        {/* 面談予約 */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">面談予約</h3>
            </div>
            <button
              onClick={() => setActiveTab('interviews')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              予約管理
            </button>
          </div>
          {evaluationData.upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {evaluationData.upcomingInterviews.map((interview: any) => (
                <div key={interview.id} className="border border-gray-600 rounded-lg p-3 bg-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">{interview.type}</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>{interview.date} {interview.time}</div>
                    <div>面談官: {interview.interviewer}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">予定された面談はありません</p>
              <button
                onClick={() => setActiveTab('interviews')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                面談を予約
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* 固定ヘッダーコンテナ */}
      <div className="sticky top-0 z-30">
        {/* ヘッダー */}
        <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3 text-3xl">📊</span>
                評価ステーション
              </h1>
              <p className="text-gray-400 text-sm">
                あなたの評価情報、成長分析、面談予約を一元管理
              </p>
            </div>
          </div>
        </header>

        {/* タブナビゲーション */}
        <div className="bg-slate-900 border-b border-gray-700">
          <div className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                ダッシュボード
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                評価通知
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                履歴
              </button>
              <button
                onClick={() => setActiveTab('interviews')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'interviews'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                面談予約
              </button>
              <button
                onClick={() => setActiveTab('appeals')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appeals'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                異議申立
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">評価通知一覧</h2>
              {evaluationData.currentNotifications.length > 0 ? (
                evaluationData.currentNotifications.map((notification: any) => (
                  <div key={notification.id} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{notification.period}</h3>
                      {!notification.isRead && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                          未読
                        </span>
                      )}
                    </div>
                    <GradeDisplay grade={notification.grade} score={notification.score} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">通知がありません</div>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">評価履歴</h2>
              {evaluationData.recentEvaluations.map((evaluation: any) => (
                <div key={evaluation.id} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{evaluation.period}</h3>
                      <p className="text-sm text-gray-400">{evaluation.disclosureDate}</p>
                    </div>
                    <GradeDisplay grade={evaluation.grade} score={evaluation.score} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">面談予約</h2>
              {evaluationData.upcomingInterviews.length > 0 ? (
                evaluationData.upcomingInterviews.map((interview: any) => (
                  <div key={interview.id} className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{interview.type}</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>📅 {interview.date} {interview.time}</p>
                      <p>👤 面談官: {interview.interviewer}</p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {interview.status === 'confirmed' ? '確定' : '仮予約'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">予定された面談はありません</p>
                  <Link
                    to="/interview-station"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    面談を予約する
                  </Link>
                </div>
              )}
            </div>
          )}
          {activeTab === 'appeals' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">異議申立</h2>
              {evaluationData.activeAppeals && evaluationData.activeAppeals.length > 0 ? (
                <div className="text-gray-400">異議申立中の件数: {evaluationData.activeAppeals.length}</div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">異議申立はありません</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationStation;
