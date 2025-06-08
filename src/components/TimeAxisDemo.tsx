import React, { useState } from 'react';
import SeasonalCapacityIndicator from './SeasonalCapacityIndicator';
import ProposalEchoCard from './ProposalEchoCard';
import { SeasonalManager } from '../utils/SeasonalManager';
import { ProposalEchoService } from '../services/ProposalEchoService';

const TimeAxisDemo: React.FC = () => {
  const [currentProposalCount, setCurrentProposalCount] = useState(7);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [manager] = useState(() => new SeasonalManager());
  const [echoService] = useState(() => new ProposalEchoService());
  
  const seasonInfo = manager.getCapacityInfo();
  const nextSeasonInfo = manager.getNextSeasonInfo();
  const seasonalTrends = echoService.analyzeSeasonalTrends(manager.getCurrentSeason());

  const handleCapacityChange = (delta: number) => {
    const newCount = Math.max(0, Math.min(seasonInfo.maxCapacity, currentProposalCount + delta));
    setCurrentProposalCount(newCount);
  };

  const mockProposals = [
    { id: 1, title: '新人研修プログラムの改善', type: 'improvement', status: 'active' },
    { id: 2, title: '夏期休暇制度の見直し', type: 'problem', status: 'active' },
    { id: 3, title: '業務効率化ツールの導入', type: 'idea', status: 'active' },
    { id: 4, title: '部署間連携の強化', type: 'discussion', status: 'active' },
    { id: 5, title: '四半期成果報告', type: 'announcement', status: 'completed' },
    { id: 6, title: '健康経営の推進', type: 'improvement', status: 'active' },
    { id: 7, title: 'DX推進計画', type: 'idea', status: 'active' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* ヘッダー */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                VoiceDrive 時間軸管理システム
              </h1>
              <p className="text-gray-400">
                季節に応じた活動容量管理と過去提案のエコー復活システム
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← メインへ戻る
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 容量管理 */}
          <div className="lg:col-span-2 space-y-6">
            <SeasonalCapacityIndicator 
              currentProposalCount={currentProposalCount}
              onCapacityWarning={(status) => console.log('Capacity warning:', status)}
            />

            {/* デモコントロール */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-white mb-3">デモコントロール</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleCapacityChange(-1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  提案を減らす
                </button>
                <span className="text-white font-mono">
                  {currentProposalCount} / {seasonInfo.maxCapacity}
                </span>
                <button
                  onClick={() => handleCapacityChange(1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  提案を増やす
                </button>
              </div>
            </div>

            {/* アクティブな提案一覧 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-white mb-4">
                現在の提案一覧
              </h3>
              <div className="space-y-3">
                {mockProposals.slice(0, currentProposalCount).map((proposal) => (
                  <div 
                    key={proposal.id}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm text-gray-400 mr-2">
                        {proposal.type === 'improvement' ? '💡' :
                         proposal.type === 'problem' ? '❗' :
                         proposal.type === 'idea' ? '🚀' :
                         proposal.type === 'discussion' ? '💬' : '📢'}
                      </span>
                      <span className="text-white">{proposal.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      proposal.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {proposal.status === 'active' ? '進行中' : '完了'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* エコー提案 */}
            <ProposalEchoCard 
              season={manager.getCurrentSeason()}
              proposalType="improvement"
              onReviveProposal={(proposal) => console.log('Revived:', proposal)}
            />
          </div>

          {/* 右カラム: 季節情報と統計 */}
          <div className="space-y-6">
            {/* 次の季節情報 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-white mb-3">次の季節</h3>
              <div className="text-sm space-y-2">
                <p className="text-gray-400">
                  {nextSeasonInfo.season === 'spring' ? '🌸 春' :
                   nextSeasonInfo.season === 'summer' ? '🌻 夏' :
                   nextSeasonInfo.season === 'autumn' ? '🍁 秋' : '❄️ 冬'}
                  まで
                </p>
                <p className="text-2xl font-bold text-white">
                  {nextSeasonInfo.monthsAway}ヶ月
                </p>
                <p className="text-gray-400">
                  容量変化: {nextSeasonInfo.capacityChange}
                </p>
              </div>
            </div>

            {/* 季節トレンド分析 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-white mb-3">
                {seasonInfo.label}期の傾向分析
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">過去の提案数</p>
                  <p className="text-xl font-bold text-white">
                    {seasonalTrends.totalProposals}件
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">平均投票重み</p>
                  <p className="text-xl font-bold text-white">
                    {seasonalTrends.averageVotingWeight}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">人気のタグ</p>
                  <div className="flex flex-wrap gap-1">
                    {seasonalTrends.topTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">トレンド</p>
                  <p className={`font-bold ${
                    seasonalTrends.trend === 'increasing' ? 'text-green-400' :
                    seasonalTrends.trend === 'decreasing' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {seasonalTrends.trend === 'increasing' ? '📈 上昇傾向' :
                     seasonalTrends.trend === 'decreasing' ? '📉 下降傾向' :
                     '➡️ 安定'}
                  </p>
                </div>
              </div>
            </div>

            {/* システム説明 */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-white mb-3">システム機能</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">🎯</span>
                  <div>
                    <p className="text-white font-medium">季節別容量管理</p>
                    <p className="text-gray-400 text-xs">
                      季節ごとに最適な提案受付数を自動調整
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">🔮</span>
                  <div>
                    <p className="text-white font-medium">エコー復活システム</p>
                    <p className="text-gray-400 text-xs">
                      過去の優良提案を現在の状況に合わせて再提案
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">📊</span>
                  <div>
                    <p className="text-white font-medium">季節トレンド分析</p>
                    <p className="text-gray-400 text-xs">
                      過去データから最適な活動時期を提案
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAxisDemo;