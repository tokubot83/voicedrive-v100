/**
 * ProjectProgressPanel
 *
 * プロジェクト化モード用の進捗管理パネル
 * コメント展開時に表示され、プロジェクトの進捗状況・課題・マイルストーンを可視化する
 */

import React from 'react';
import { Rocket, TrendingUp, AlertTriangle, Target, Users } from 'lucide-react';
import { Post, ProjectAnalysisData } from '../../types';

interface ProjectProgressPanelProps {
  post: Post;
  data: ProjectAnalysisData;
}

export const ProjectProgressPanel: React.FC<ProjectProgressPanelProps> = ({
  post,
  data,
}) => {
  return (
    <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-green-600" aria-hidden="true" />
            <h3 className="font-medium text-green-800">🚀 プロジェクト進捗状況</h3>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              プロジェクト実行中
            </span>
          </div>

          {/* セクション1: 全体進捗サマリー */}
          <div className="bg-white rounded-lg p-4 border border-green-100 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 進捗率 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">全体進捗</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {data.overallProgress.progressRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${data.overallProgress.progressRate}%` }}
                  ></div>
                </div>
              </div>

              {/* 残り日数 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">残り日数</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {data.overallProgress.daysRemaining}日
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {data.overallProgress.daysElapsed}日経過 /{' '}
                  {data.overallProgress.totalDays}日
                </div>
              </div>
            </div>

            {/* サブメトリクス */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
                <div className="text-xs text-gray-600 mb-1">✅ 完了</div>
                <div className="text-lg font-bold text-gray-800">
                  {data.taskSummary.completed} / {data.taskSummary.total}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
                <div className="text-xs text-gray-600 mb-1">🔄 進行中</div>
                <div className="text-lg font-bold text-gray-800">
                  {data.taskSummary.inProgress}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
                <div className="text-xs text-gray-600 mb-1">⚠️ 遅延</div>
                <div className="text-lg font-bold text-gray-800">
                  {data.taskSummary.delayed}
                </div>
              </div>
            </div>
          </div>

          {/* セクション2: 現在のフェーズ */}
          <div className="bg-white rounded-lg p-3 border border-green-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📍</span>
              <span className="text-sm font-medium text-green-800">現在の状況</span>
            </div>
            <div className="space-y-2">
              {data.phases.map((phase, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded ${
                    phase.status === 'completed'
                      ? 'bg-green-50'
                      : phase.status === 'active'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-lg">
                    {phase.status === 'completed'
                      ? '✅'
                      : phase.status === 'active'
                      ? '🔄'
                      : '⏳'}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      phase.status === 'active' ? 'font-medium' : ''
                    }`}
                  >
                    {phase.name}
                  </span>
                  {phase.progress !== undefined && (
                    <span className="text-xs font-medium text-blue-600">
                      {phase.progress}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* セクション3: 課題とブロッカー */}
          {data.issues.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-green-100 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-600" aria-hidden="true" />
                <span className="text-sm font-medium text-green-800">
                  現在の課題・ブロッカー
                </span>
              </div>
              <div className="space-y-2">
                {data.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`border rounded-lg p-3 ${
                      issue.priority === 'high'
                        ? 'border-red-200 bg-red-50'
                        : issue.priority === 'medium'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          issue.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : issue.priority === 'medium'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {issue.priority === 'high'
                          ? '高'
                          : issue.priority === 'medium'
                          ? '中'
                          : '低'}
                      </span>
                      <span className="text-sm font-medium flex-1">{issue.title}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                    {(issue.assignee || issue.deadline) && (
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {issue.assignee && (
                          <span className="flex items-center gap-1">
                            👤 {issue.assignee}
                          </span>
                        )}
                        {issue.deadline && (
                          <span>
                            期限:{' '}
                            {new Date(issue.deadline).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* セクション4: 近日中のマイルストーン */}
          {data.milestones.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-green-100 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-green-600" aria-hidden="true" />
                <span className="text-sm font-medium text-green-800">
                  近日中のマイルストーン
                </span>
              </div>
              <div className="space-y-2">
                {data.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-2 rounded ${
                      milestone.status === 'upcoming'
                        ? 'bg-blue-50 border border-blue-200'
                        : milestone.status === 'completed'
                        ? 'bg-green-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-600 w-16">
                      {new Date(milestone.date).toLocaleDateString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex-1 text-sm">{milestone.title}</span>
                    <span className="text-xs text-gray-600">
                      {milestone.status === 'completed'
                        ? '完了'
                        : `あと${milestone.daysUntil}日`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* セクション5: チーム構成 */}
          <div className="bg-white rounded-lg p-3 border border-green-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-green-600" aria-hidden="true" />
              <span className="text-sm font-medium text-green-800">
                チーム構成
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">アサイン人数</div>
              <div className="text-xl font-bold text-gray-800 mb-2">
                {data.resources.team.size}名
              </div>
              <div className="text-xs text-gray-600">
                {data.resources.team.roles.join(' + ')}
              </div>
            </div>
          </div>

          {/* セクション6: コメント促進 */}
          <div className="bg-white rounded-lg p-3 border border-green-100 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium text-green-800">
                プロジェクトへのフィードバック
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">コメントで共有してほしいこと：</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✅</span>
                <span>実装上の問題や気づいた課題</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">💡</span>
                <span>改善提案や代替アプローチ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">📢</span>
                <span>現場での反応や懸念事項</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">🎉</span>
                <span>うまくいった点や成功事例</span>
              </li>
            </ul>
          </div>

          {/* フッター: 更新情報 */}
          <div className="mt-3 pt-2 border-t border-green-100">
            <p className="text-xs text-green-600 text-center">
              📅 最終更新:{' '}
              {new Date(data.updateInfo.lastUpdated).toLocaleDateString('ja-JP')} |
              次回更新予定: {data.updateInfo.updateFrequency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgressPanel;
