import React, { useState } from 'react';
import { Network, AlertCircle, TrendingUp, Users, Lightbulb, Target, CheckCircle } from 'lucide-react';

/**
 * 施設横断課題分析
 *
 * 対象: レベル18（理事長・法人事務局長）
 * 目的: 複数施設で共通する課題を発見し、法人全体で取り組むべき戦略課題を特定
 */

interface CommonIssue {
  id: string;
  title: string;
  category: string;
  affectedFacilities: string[];
  totalVoices: number;
  severity: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  suggestedAction: string;
}

interface SuccessCase {
  id: string;
  facility: string;
  title: string;
  category: string;
  description: string;
  impact: string;
  replicability: number; // 0-100
  interestedFacilities: string[];
}

interface StrategicOpportunity {
  id: string;
  title: string;
  opportunity: string;
  expectedImpact: string;
  requiredInvestment: string;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
}

export const CrossFacilityAnalysisPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 施設横断共通課題
  const commonIssues: CommonIssue[] = [
    {
      id: 'issue-1',
      title: '夜勤時の人手不足',
      category: '人材配置',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '海浜医療センター', '東部リハビリ病院', '山手リハビリセンター'],
      totalVoices: 347,
      severity: 'high',
      trend: 'increasing',
      description: '夜勤帯の人員不足により、職員の負担増加と患者対応の質低下が懸念される。6施設で同様の声が多数上がっている。',
      suggestedAction: '法人全体での夜勤シフト最適化、施設間ローテーション制度の導入検討'
    },
    {
      id: 'issue-2',
      title: '電子カルテシステムの操作性',
      category: 'IT・システム',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '海浜医療センター'],
      totalVoices: 234,
      severity: 'medium',
      trend: 'stable',
      description: '電子カルテシステムの操作が複雑で業務効率が低下。特に新人職員からの声が多い。',
      suggestedAction: '法人統一の操作研修プログラム開発、UIの改善提案をベンダーに提出'
    },
    {
      id: 'issue-3',
      title: '若手職員のキャリアパス不透明',
      category: '人材育成',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '南部クリニック', '青葉台クリニック', '東部リハビリ病院'],
      totalVoices: 198,
      severity: 'high',
      trend: 'increasing',
      description: 'キャリアパスが不明確で、若手職員のモチベーション低下と離職リスクが高まっている。',
      suggestedAction: '法人全体でのキャリアラダー制度設計、施設間異動によるキャリア開発支援'
    },
    {
      id: 'issue-4',
      title: '施設間情報共有の不足',
      category: 'コミュニケーション',
      affectedFacilities: ['全10施設'],
      totalVoices: 156,
      severity: 'medium',
      trend: 'stable',
      description: '施設間での情報共有が不足し、ベストプラクティスの横展開ができていない。',
      suggestedAction: '法人全体での定期的な事例共有会の開催、ナレッジ共有プラットフォームの構築'
    },
    {
      id: 'issue-5',
      title: '医療材料の調達コスト',
      category: 'コスト管理',
      affectedFacilities: ['中央総合病院', '北部医療センター', '桜ヶ丘総合病院', '海浜医療センター', '東部リハビリ病院'],
      totalVoices: 134,
      severity: 'medium',
      trend: 'increasing',
      description: '施設ごとに異なる調達先で材料費にばらつき。コスト最適化の余地あり。',
      suggestedAction: '法人全体での共同購買システム導入、スケールメリットの活用'
    }
  ];

  // 横展開可能な成功事例
  const successCases: SuccessCase[] = [
    {
      id: 'success-1',
      facility: '中央総合病院',
      title: 'メンター制度による新人定着率向上',
      category: '人材育成',
      description: '1年目看護師に対する専任メンター制度を導入。定期的な1on1面談と目標設定により、新人の離職率が35%から8%に大幅改善。',
      impact: '新人離職率 35% → 8%（-27pt）、新人満足度 82%',
      replicability: 85,
      interestedFacilities: ['北部医療センター', '桜ヶ丘総合病院', '東部リハビリ病院']
    },
    {
      id: 'success-2',
      facility: '桜ヶ丘総合病院',
      title: 'チーム制勤務による負担平準化',
      category: '働き方改革',
      description: '固定シフトからチーム制勤務に変更。チーム内で柔軟にシフト調整することで、個人の負担を軽減。',
      impact: '残業時間 月平均18時間 → 12時間（-33%）、職員満足度 +12pt',
      replicability: 78,
      interestedFacilities: ['中央総合病院', '海浜医療センター']
    },
    {
      id: 'success-3',
      facility: '北部医療センター',
      title: '患者対応マニュアルの体系化',
      category: '業務改善',
      description: '頻出する患者対応をマニュアル化し、QRコードでアクセス可能に。対応時間の短縮と品質向上を実現。',
      impact: '問い合わせ対応時間 -40%、患者満足度 +8pt',
      replicability: 92,
      interestedFacilities: ['中央総合病院', '桜ヶ丘総合病院', '海浜医療センター', '南部クリニック']
    }
  ];

  // 法人全体での戦略的機会
  const strategicOpportunities: StrategicOpportunity[] = [
    {
      id: 'opp-1',
      title: '施設間人材ローテーション制度',
      opportunity: '夜勤人手不足など6施設共通の課題に対し、施設間で人材を融通し合う仕組みを構築。職員のスキル向上とキャリア開発にも寄与。',
      expectedImpact: '夜勤負担の平準化、職員スキルの多様化、法人全体での人材最適配置',
      requiredInvestment: '約500万円（システム開発、移動支援費）',
      timeline: '2026年1月制度設計開始、4月試験運用、7月本格運用',
      priority: 'high'
    },
    {
      id: 'opp-2',
      title: '法人統一キャリアラダー制度',
      opportunity: '若手職員のキャリアパス不透明という6施設共通課題に対応。法人全体で統一されたキャリアラダーを設計し、施設間異動も評価に反映。',
      expectedImpact: '若手職員の定着率向上、計画的な人材育成、組織の活性化',
      requiredInvestment: '約300万円（制度設計、研修プログラム開発）',
      timeline: '2026年2月設計開始、6月制度発表、10月運用開始',
      priority: 'high'
    },
    {
      id: 'opp-3',
      title: '法人共同購買システム',
      opportunity: '5施設で医療材料調達コストが課題。法人全体での共同購買により、スケールメリットを活用してコスト削減。',
      expectedImpact: '材料費 年間約8,000万円削減見込み、調達業務の効率化',
      requiredInvestment: '約1,200万円（システム導入、初期調整費）',
      timeline: '2026年3月ベンダー選定、6月システム構築、10月運用開始',
      priority: 'medium'
    }
  ];

  const categories = [
    { id: 'all', label: '全カテゴリ', count: commonIssues.length },
    { id: '人材配置', label: '人材配置', count: 1 },
    { id: '人材育成', label: '人材育成', count: 1 },
    { id: 'IT・システム', label: 'IT・システム', count: 1 },
    { id: 'コミュニケーション', label: 'コミュニケーション', count: 1 },
    { id: 'コスト管理', label: 'コスト管理', count: 1 }
  ];

  const filteredIssues = selectedCategory === 'all'
    ? commonIssues
    : commonIssues.filter(issue => issue.category === selectedCategory);

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'stable': return '➡️';
      case 'decreasing': return '📉';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">施設横断課題分析</h1>
              <p className="text-gray-400">複数施設共通の課題と法人全体での戦略的機会</p>
            </div>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-400">共通課題</span>
            </div>
            <div className="text-3xl font-bold mb-1">{commonIssues.length}件</div>
            <p className="text-sm text-gray-400">2施設以上で発生</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">成功事例</span>
            </div>
            <div className="text-3xl font-bold mb-1">{successCases.length}件</div>
            <p className="text-sm text-gray-400">横展開可能</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">戦略的機会</span>
            </div>
            <div className="text-3xl font-bold mb-1">{strategicOpportunities.length}件</div>
            <p className="text-sm text-gray-400">法人全体施策</p>
          </div>
        </div>

        {/* 共通課題セクション */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold">施設横断共通課題</h2>
            </div>

            {/* カテゴリフィルター */}
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{issue.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity === 'high' ? '重要' : issue.severity === 'medium' ? '中' : '低'}
                      </span>
                      <span className="text-sm text-gray-400">{getTrendIcon(issue.trend)} {issue.trend === 'increasing' ? '増加傾向' : issue.trend === 'stable' ? '横ばい' : '減少傾向'}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{issue.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">影響施設 ({issue.affectedFacilities.length}施設)</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.affectedFacilities.map((facility, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">関連する声</p>
                    <p className="text-2xl font-bold text-blue-400">{issue.totalVoices.toLocaleString()}件</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-gray-400 mb-1">推奨アクション:</p>
                  <p className="text-sm text-green-400">{issue.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 横展開可能な成功事例 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold">横展開可能な成功事例</h2>
            </div>

            <div className="space-y-4">
              {successCases.map((success) => (
                <div key={success.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium mb-1">{success.title}</h3>
                      <p className="text-xs text-gray-400">{success.facility} - {success.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">横展開可能性</p>
                      <p className="text-lg font-bold text-green-400">{success.replicability}%</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{success.description}</p>

                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3 mb-3">
                    <p className="text-sm text-green-400">📊 {success.impact}</p>
                  </div>

                  {success.interestedFacilities.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">関心を示している施設:</p>
                      <div className="flex flex-wrap gap-2">
                        {success.interestedFacilities.map((facility, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 戦略的機会 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">法人全体での戦略的機会</h2>
            </div>

            <div className="space-y-4">
              {strategicOpportunities.map((opp) => (
                <div key={opp.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{opp.title}</h3>
                    <span className={`text-xl ${getPriorityColor(opp.priority)}`}>
                      {opp.priority === 'high' ? '🔴' : opp.priority === 'medium' ? '🟡' : '🔵'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{opp.opportunity}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">期待効果:</span>
                      <span className="text-right flex-1 ml-4">{opp.expectedImpact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">必要投資:</span>
                      <span className="font-medium">{opp.requiredInvestment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">実施時期:</span>
                      <span>{opp.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
