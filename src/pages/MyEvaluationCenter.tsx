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
      case 'S': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'A+': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'A': return 'text-green-500 bg-green-50 border-green-200';
      case 'B+': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'B': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'C': return 'text-red-500 bg-red-50 border-red-200';
      case 'D': return 'text-gray-500 bg-gray-50 border-gray-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(grade)}`}>
        {grade}
      </div>
      <span className="text-lg font-semibold text-gray-800">{score}点</span>
    </div>
  );
};

const MyEvaluationCenter: React.FC = () => {
  const { userLevel: userPermissionLevel } = usePermissions();
  const { isDemoMode, currentUser } = useDemoMode();
  const [evaluationData, setEvaluationData] = useState<any>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">管理職評価システム</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              部長職以上（レベル4以上）の皆様は、別途設定された管理職評価制度の対象となります。<br />
              定期的な人事評価については、人事部門から個別にご連絡いたします。
            </p>
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3">管理職向け機能</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>組織運営ダッシュボード</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>部門パフォーマンス分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">マイ評価センター</h1>
          </div>
          <p className="text-gray-600">
            あなたの評価情報、成長分析、面談予約を一元管理
          </p>
        </div>

        {/* 現在の評価通知 */}
        {evaluationData.currentNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              新しい評価通知
            </h2>
            <div className="grid gap-4">
              {evaluationData.currentNotifications.map((notification: any) => (
                <div key={notification.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{notification.period}</h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            未読
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <GradeDisplay grade={notification.grade} score={notification.score} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
                        to={`/my-evaluation/notifications/${notification.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                      >
                        詳細確認
                      </Link>
                      {notification.canAppeal && (
                        <Link 
                          to={`/my-evaluation/appeals/new?evaluation=${notification.id}`}
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">成績サマリー</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">平均スコア</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">{evaluationData.stats.averageScore}</span>
                  <span className="text-sm text-green-600 font-medium">{evaluationData.stats.trend}</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">部署内順位</span>
                <div className="text-lg font-semibold text-gray-800">{evaluationData.stats.rank}</div>
              </div>
            </div>
          </div>

          {/* 評価履歴 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">評価履歴</h3>
              </div>
              <Link 
                to="/my-evaluation/history"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る
              </Link>
            </div>
            <div className="space-y-3">
              {evaluationData.recentEvaluations.slice(0, 3).map((evaluation: any) => (
                <div key={evaluation.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{evaluation.period}</div>
                    <div className="text-xs text-gray-500">{evaluation.disclosureDate}</div>
                  </div>
                  <GradeDisplay grade={evaluation.grade} score={evaluation.score} />
                </div>
              ))}
            </div>
          </div>

          {/* 面談予約 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">面談予約</h3>
              </div>
              <Link 
                to="/my-evaluation/interviews"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                予約管理
              </Link>
            </div>
            {evaluationData.upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {evaluationData.upcomingInterviews.map((interview: any) => (
                  <div key={interview.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-800">{interview.type}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{interview.date} {interview.time}</div>
                      <div>面談官: {interview.interviewer}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">予定された面談はありません</p>
                <Link 
                  to="/my-evaluation/interviews/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  面談を予約
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* メインナビゲーション */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/my-evaluation/notifications"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">評価通知</h3>
              <p className="text-sm text-gray-600">通知の確認・詳細表示</p>
            </div>
          </Link>

          <Link 
            to="/my-evaluation/history"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">評価履歴</h3>
              <p className="text-sm text-gray-600">過去の評価結果・推移</p>
            </div>
          </Link>

          <Link 
            to="/my-evaluation/appeals"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">異議申立</h3>
              <p className="text-sm text-gray-600">異議申立の提出・管理</p>
            </div>
          </Link>

          <Link 
            to="/my-evaluation/interviews"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">面談予約</h3>
              <p className="text-sm text-gray-600">フィードバック面談の予約</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyEvaluationCenter;