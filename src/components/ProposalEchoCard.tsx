import React, { useState } from 'react';
import { ProposalEchoService } from '../services/ProposalEchoService';

interface ProposalEchoCardProps {
  season: string;
  proposalType: string;
  onReviveProposal?: (proposal: any) => void;
}

const ProposalEchoCard: React.FC<ProposalEchoCardProps> = ({
  season,
  proposalType,
  onReviveProposal
}) => {
  const [echoService] = useState(() => new ProposalEchoService());
  const [similarProposals, setSimilarProposals] = useState(() => 
    echoService.findSimilarProposals(season, proposalType)
  );
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [revivalContent, setRevivalContent] = useState('');

  const handleRevive = () => {
    if (selectedProposal && revivalContent) {
      const revivedProposal = echoService.reviveProposal(
        selectedProposal,
        revivalContent,
        'current-user-id'
      );
      onReviveProposal?.(revivedProposal);
      setSelectedProposal(null);
      setRevivalContent('');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      improvement: '💡',
      problem: '❗',
      idea: '🚀',
      discussion: '💬',
      announcement: '📢'
    };
    return icons[type] || '📝';
  };

  const getSeasonColor = (season: string) => {
    const colors: Record<string, string> = {
      spring: 'text-pink-400',
      summer: 'text-green-400',
      autumn: 'text-orange-400',
      winter: 'text-blue-400'
    };
    return colors[season] || 'text-gray-400';
  };

  if (similarProposals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <span className="text-purple-400">🔮</span>
        過去の類似提案（エコー）
      </h3>

      <div className="space-y-3">
        {similarProposals.map((proposal) => (
          <div 
            key={proposal.id}
            className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => setSelectedProposal(proposal)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getTypeIcon(proposal.type)}</span>
                  <h4 className="font-medium text-white text-sm">
                    {proposal.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {proposal.content}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className={getSeasonColor(proposal.season)}>
                    {proposal.season === 'spring' ? '🌸 春' :
                     proposal.season === 'summer' ? '🌻 夏' :
                     proposal.season === 'autumn' ? '🍁 秋' : '❄️ 冬'}
                  </span>
                  <span className="text-gray-500">
                    投票重み: {proposal.votingWeight}
                  </span>
                  <span className="text-gray-500">
                    {new Date(proposal.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <button
                className="ml-2 px-3 py-1 bg-purple-600 text-white rounded-full text-xs hover:bg-purple-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProposal(proposal);
                }}
              >
                復活
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-white mb-4">
              提案を復活させる
            </h3>
            
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-white mb-2">
                {selectedProposal.title}
              </h4>
              <p className="text-sm text-gray-400">
                {selectedProposal.content}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                新しい内容・改善点
              </label>
              <textarea
                value={revivalContent}
                onChange={(e) => setRevivalContent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                rows={4}
                placeholder="過去の提案をベースに、現在の状況に合わせた改善内容を記入してください"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setRevivalContent('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleRevive}
                disabled={!revivalContent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                復活させる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalEchoCard;