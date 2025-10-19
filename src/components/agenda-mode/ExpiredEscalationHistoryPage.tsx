/**
 * 期限到達判断履歴ページ
 *
 * permissionLevelに応じた判断履歴を表示
 * - LEVEL_5-6: 主任級 - 自分の判断履歴とチーム統計
 * - LEVEL_7-8: 師長級 - 部署統計
 * - LEVEL_9-13: 部長・院長級 - 施設全体統計
 * - LEVEL_14-18: 人事部・組織開発・理事長 - 法人全体統計
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getMockExpiredEscalationHistory,
  ExpiredEscalationHistoryData
} from '../../data/mockExpiredEscalationHistory';
import {
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  TrendingDown,
  Calendar,
  FileText,
  Users,
  Building2
} from 'lucide-react';

const ExpiredEscalationHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<ExpiredEscalationHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 将来的にはMCPサーバー経由で職員カルテシステムから取得
    // 現在はモックデータを使用
    if (user) {
      const data = getMockExpiredEscalationHistory(user.permissionLevel);
      setHistoryData(data);
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">ログインが必要です</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりません</p>
        </div>
      </div>
    );
  }

  // permissionLevelに応じたタイトルを取得
  const getPageTitle = () => {
    if (user.permissionLevel >= 14) {
      return '法人全体 期限到達判断履歴';
    } else if (user.permissionLevel >= 9) {
      return '施設全体 期限到達判断履歴';
    } else if (user.permissionLevel >= 7) {
      return '部署 期限到達判断履歴';
    } else if (user.permissionLevel >= 5) {
      return '私の判断履歴';
    }
    return '私の提案履歴';
  };

  // permissionLevelに応じた説明を取得
  const getPageDescription = () => {
    if (user.permissionLevel >= 14) {
      return '法人全体の期限到達提案の判断状況と統計を表示しています';
    } else if (user.permissionLevel >= 9) {
      return '施設全体の期限到達提案の判断状況と統計を表示しています';
    } else if (user.permissionLevel >= 7) {
      return '所属部署の期限到達提案の判断状況と統計を表示しています';
    } else if (user.permissionLevel >= 5) {
      return 'あなたが行った期限到達提案の判断履歴を表示しています';
    }
    return 'あなたが提案した期限到達提案の履歴を表示しています';
  };

  const { summary } = historyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          </div>
          <p className="text-gray-600 ml-11">{getPageDescription()}</p>
          <div className="ml-11 mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>集計期間: {historyData.period.startDate} 〜 {historyData.period.endDate}</span>
          </div>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 総件数 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総判断件数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalCount}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* 承認件数 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">承認件数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.approvedCount}</p>
                <p className="text-xs text-green-600 mt-1">承認率 {summary.approvalRate}%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* ダウングレード件数 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ダウングレード</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.downgradedCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.totalCount > 0 ? Math.round((summary.downgradedCount / summary.totalCount) * 100) : 0}%
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* 不採用件数 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">不採用</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.rejectedCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.totalCount > 0 ? Math.round((summary.rejectedCount / summary.totalCount) * 100) : 0}%
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 判断スピード */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">判断スピード</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{summary.averageDaysToDecision.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mt-2">平均判断日数（日）</p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                期限到達から判断までの平均日数を表示しています
              </p>
            </div>
          </div>

          {/* 到達率 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">平均到達率</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{summary.averageAchievementRate}%</p>
              <p className="text-sm text-gray-600 mt-2">目標スコアに対する達成率</p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${summary.averageAchievementRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 判断履歴一覧 */}
        {historyData.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">判断履歴一覧</h2>
              <span className="ml-auto text-sm text-gray-500">{historyData.items.length}件</span>
            </div>

            <div className="space-y-4">
              {historyData.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.agendaLevel === 'DEPT_AGENDA'
                            ? 'bg-blue-100 text-blue-700'
                            : item.agendaLevel === 'DEPT_REVIEW'
                            ? 'bg-yellow-100 text-yellow-700'
                            : item.agendaLevel === 'FACILITY_AGENDA'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.agendaLevel}
                        </span>
                        <span className="text-xs text-gray-500">{item.department}</span>
                      </div>
                      <p className="text-gray-900 font-medium">{item.postContent}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                      item.decision === 'approve_at_current_level'
                        ? 'bg-green-100 text-green-700'
                        : item.decision === 'downgrade'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.decision === 'approve_at_current_level'
                        ? '承認'
                        : item.decision === 'downgrade'
                        ? 'ダウングレード'
                        : '不採用'}
                    </span>
                  </div>

                  {/* スコア情報 */}
                  <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">現在スコア</p>
                      <p className="font-semibold text-gray-900">{item.currentScore}点</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">目標スコア</p>
                      <p className="font-semibold text-gray-900">{item.targetScore}点</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">到達率</p>
                      <p className="font-semibold text-blue-600">{item.achievementRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">期限超過</p>
                      <p className="font-semibold text-orange-600">{item.daysOverdue}日</p>
                    </div>
                  </div>

                  {/* 判断情報 */}
                  <div className="border-t pt-3">
                    <div className="flex items-start gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.deciderName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(item.decisionAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                    {item.decisionReason && (
                      <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        理由: {item.decisionReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* データがない場合 */}
        {historyData.items.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">判断履歴がありません</p>
            <p className="text-gray-500 text-sm mt-2">
              期限到達した提案の判断が記録されるとここに表示されます
            </p>
          </div>
        )}

        {/* 注釈 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">データソースについて</p>
              <p className="text-xs text-blue-700">
                このデータは職員カルテシステムから取得されています。
                判断履歴は自動的に記録され、あなたの権限レベルに応じた範囲のデータが表示されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredEscalationHistoryPage;
