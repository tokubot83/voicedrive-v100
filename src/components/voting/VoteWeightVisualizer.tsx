import React, { useState, useEffect } from 'react';
import { HybridVotingCalculator } from '../../services/HybridVotingCalculator';
import { useUserPermission } from '../../hooks/useUserPermission';
import {
  Calculator,
  TrendingUp,
  Users,
  Award,
  Layers,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PermissionLevel, SpecialPermissionLevel } from '../../permissions/types/PermissionTypes';

interface VoteBreakdown {
  baseScore: number;
  accountLevelWeight: number;
  professionMultiplier: number;
  categoryAdjustment: number;
  finalWeight: number;
  explanation: string[];
}

export const VoteWeightVisualizer: React.FC = () => {
  const permission = useUserPermission();
  const [isExpanded, setIsExpanded] = useState(false);
  const [voteBreakdown, setVoteBreakdown] = useState<VoteBreakdown | null>(null);
  const votingCalculator = new HybridVotingCalculator();

  useEffect(() => {
    calculateVoteWeight();
  }, [permission.level]);

  const calculateVoteWeight = () => {
    if (!permission.level) return;

    // サンプル投票データ
    const sampleVote = {
      userLevel: permission.level,
      staffCharacteristics: {
        profession: '看護師',
        experienceYears: 5,
        facility: '小原病院',
        department: '看護部'
      },
      voteType: 'support',
      postCategory: '業務改善'
    };

    const result = votingCalculator.calculateVoteWeight(
      sampleVote.userLevel,
      sampleVote.staffCharacteristics,
      sampleVote.voteType,
      sampleVote.postCategory
    );

    const breakdown: VoteBreakdown = {
      baseScore: result.baseScore,
      accountLevelWeight: result.accountLevelWeight,
      professionMultiplier: result.professionWeight,
      categoryAdjustment: result.categoryAdjustment,
      finalWeight: result.finalWeight,
      explanation: []
    };

    // 説明文の生成
    breakdown.explanation = [
      `基本スコア: ${result.voteType}票は${result.baseScore}点`,
      `権限レベル${permission.calculatedLevel}の重み: ×${result.accountLevelWeight}`,
      `${sampleVote.staffCharacteristics.profession}の専門性: ×${result.professionWeight}`,
      `${sampleVote.postCategory}カテゴリ: ×${result.categoryAdjustment}`
    ];

    setVoteBreakdown(breakdown);
  };

  const getWeightColor = (weight: number): string => {
    if (weight >= 4) return 'text-red-400';
    if (weight >= 3) return 'text-orange-400';
    if (weight >= 2) return 'text-yellow-400';
    if (weight >= 1.5) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getWeightLabel = (weight: number): string => {
    if (weight >= 4) return '非常に高い';
    if (weight >= 3) return '高い';
    if (weight >= 2) return '中程度';
    if (weight >= 1.5) return 'やや高い';
    return '標準';
  };

  if (!voteBreakdown) return null;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">あなたの投票影響力</h3>
            <p className="text-sm text-gray-400">
              投票の重み付けを可視化
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* メイン表示 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getWeightColor(voteBreakdown.finalWeight)}`}>
              {voteBreakdown.finalWeight.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400 mt-1">投票重み</div>
          </div>

          <div className="h-12 w-px bg-gray-700" />

          <div className="text-center">
            <div className={`text-lg font-medium ${getWeightColor(voteBreakdown.finalWeight)}`}>
              {getWeightLabel(voteBreakdown.finalWeight)}
            </div>
            <div className="text-xs text-gray-400 mt-1">影響力レベル</div>
          </div>
        </div>

        {/* ビジュアルインジケーター */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-8 h-8 rounded ${
                level <= Math.ceil(voteBreakdown.finalWeight)
                  ? level <= 2 ? 'bg-blue-500' : level <= 3 ? 'bg-yellow-500' : 'bg-orange-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 詳細展開 */}
      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* 計算ブレークダウン */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              投票重み計算の内訳
            </h4>

            <div className="space-y-3">
              {/* 基本スコア */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">基本スコア（支持票）</span>
                <span className="text-sm font-medium text-white">{voteBreakdown.baseScore}点</span>
              </div>

              {/* 権限レベル重み */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  権限レベル係数
                </span>
                <span className="text-sm font-medium text-blue-400">
                  ×{voteBreakdown.accountLevelWeight}
                </span>
              </div>

              {/* 職種係数 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  職種専門性係数
                </span>
                <span className="text-sm font-medium text-purple-400">
                  ×{voteBreakdown.professionMultiplier}
                </span>
              </div>

              {/* カテゴリ調整 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  カテゴリ調整
                </span>
                <span className="text-sm font-medium text-green-400">
                  ×{voteBreakdown.categoryAdjustment}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">最終投票重み</span>
                  <span className={`text-lg font-bold ${getWeightColor(voteBreakdown.finalWeight)}`}>
                    {voteBreakdown.finalWeight.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 説明 */}
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-400">投票影響力の説明</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {voteBreakdown.explanation.map((text, idx) => (
                    <li key={idx}>• {text}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* レベル別比較 */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              権限レベル別の投票重み比較
            </h4>
            <div className="space-y-2">
              {[
                { level: 1, label: '新人', weight: 1.0 },
                { level: 3, label: '中堅', weight: 1.5 },
                { level: 5, label: '副主任', weight: 2.0 },
                { level: 8, label: '師長', weight: 3.0 },
                { level: 12, label: '副院長', weight: 4.0 },
                { level: 18, label: '理事長', weight: 5.0 }
              ].map((item) => (
                <div key={item.level} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">{item.label}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.level === permission.calculatedLevel
                          ? 'bg-blue-500'
                          : 'bg-gray-600'
                      }`}
                      style={{ width: `${(item.weight / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 w-8 text-right">
                    ×{item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};