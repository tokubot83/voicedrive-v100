/**
 * DiscussionAnalysisPanel
 *
 * 議題モード用の状況分析パネル
 * コメント展開時に表示され、議論の活性化と合意形成を促進する
 */

import React from 'react';
import { ChartNoAxesColumnIncreasing, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { Post, DiscussionAnalysisData } from '../../types';

interface DiscussionAnalysisPanelProps {
  post: Post;
  data: DiscussionAnalysisData;
}

export const DiscussionAnalysisPanel: React.FC<DiscussionAnalysisPanelProps> = ({
  post,
  data,
}) => {
  return (
    <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ChartNoAxesColumnIncreasing
              className="w-5 h-5 text-blue-600"
              aria-hidden="true"
            />
            <h3 className="font-medium text-blue-800">💬 議論状況の可視化</h3>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              議題モード
            </span>
          </div>

          {/* セクション1: 意見の分布 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              📊 現在の意見バランス
            </h4>

            {/* 投票分布バーグラフ */}
            <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
              <div className="space-y-2">
                {/* 賛成バー */}
                {data.voteDistribution.supportRate > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">賛成</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${data.voteDistribution.supportRate}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {data.voteDistribution.stronglySupport +
                            data.voteDistribution.support}票 (
                          {Math.round(data.voteDistribution.supportRate)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 反対バー */}
                {data.voteDistribution.opposeRate > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">反対</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${data.voteDistribution.opposeRate}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {data.voteDistribution.stronglyOppose +
                            data.voteDistribution.oppose}票 (
                          {Math.round(data.voteDistribution.opposeRate)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 中立バー */}
                {data.voteDistribution.neutral > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">保留</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gray-400 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{
                          width: `${
                            (data.voteDistribution.neutral /
                              data.participation.totalVotes) *
                            100
                          }%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">
                          {data.voteDistribution.neutral}票
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* スコアサマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">
                    総合スコア
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {data.scoreInfo.totalScore}点
                  </span>
                  <span className="text-sm text-green-400 flex items-center gap-1">
                    <span>{data.scoreInfo.icon}</span>
                    {data.scoreInfo.level}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle
                    className="w-4 h-4 text-gray-600"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-700">参加度</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {data.participation.totalVotes}票
                  </span>
                  <span className="text-sm text-gray-600">
                    {data.participation.stage}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* セクション2: まだ聞けていない声 */}
          {data.nonParticipantAnalysis && (
            <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <span className="text-sm font-medium text-blue-800">
                  まだ聞けていない声
                </span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    💼 管理職層:{' '}
                    {data.nonParticipantAnalysis.managementParticipation.participated}名参加 /{' '}
                    {data.nonParticipantAnalysis.managementParticipation.total}名中（
                    {Math.round(
                      data.nonParticipantAnalysis.managementParticipation.rate
                    )}
                    %）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    👨‍⚕️ 現場スタッフ:{' '}
                    {data.nonParticipantAnalysis.staffParticipation.participated}名参加 /{' '}
                    {data.nonParticipantAnalysis.staffParticipation.total}名中（
                    {Math.round(data.nonParticipantAnalysis.staffParticipation.rate)}%）
                  </span>
                </li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                → より多様な視点を集めるため、未参加の方への声かけを推奨
              </p>
            </div>
          )}

          {/* セクション3: 反対意見の要点 */}
          {data.oppositionSummary && data.oppositionSummary.totalOppositions > 0 && (
            <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-medium text-blue-800">
                  懸念・反対意見のポイント
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                <div className="text-xs font-medium text-red-800 mb-1">
                  反対 {data.oppositionSummary.totalOppositions}票
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {data.oppositionSummary.mainConcerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-blue-600">
                💡 これらの懸念に対する具体的な対応策の議論が必要
              </p>
            </div>
          )}

          {/* セクション4: 議論を深めるための問いかけ */}
          <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium text-blue-800">
                さらに議論を深めるために
              </span>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
              {data.discussionPrompts.map((prompt, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">❓</span>
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* セクション5: 議論の進捗状況 */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📍</span>
              <span className="text-sm font-medium text-blue-800">
                議論の進捗状況
              </span>
            </div>
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.nextMilestone.progressRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600">
                  {data.nextMilestone.achieved} / {data.nextMilestone.target}
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  {Math.round(data.nextMilestone.progressRate)}%
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span>⏳</span>
                <span>{data.nextMilestone.current}</span>
              </div>
            </div>
          </div>

          {/* フッター: 行動喚起 */}
          <div className="mt-3 pt-2 border-t border-blue-100">
            <p className="text-xs text-blue-600 text-center">
              💬 あなたの意見が議論を前に進めます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionAnalysisPanel;
