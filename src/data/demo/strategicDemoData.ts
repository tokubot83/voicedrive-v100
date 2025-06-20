// 戦略的分析のデモデータ
export interface StrategicMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface StrategicAnalysis {
  facilityId: string;
  facilityName: string;
  metrics: StrategicMetric[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

export const strategicMetrics: StrategicMetric[] = [
  {
    id: 'engagement',
    name: '職員エンゲージメント',
    value: 85,
    target: 90,
    unit: '%',
    trend: 'up',
    period: '2025Q2'
  },
  {
    id: 'project_completion',
    name: 'プロジェクト完了率',
    value: 78,
    target: 85,
    unit: '%',
    trend: 'up',
    period: '2025Q2'
  },
  {
    id: 'innovation_rate',
    name: '革新提案率',
    value: 12,
    target: 15,
    unit: '件/月',
    trend: 'stable',
    period: '2025Q2'
  }
];

export const strategicAnalysis: StrategicAnalysis = {
  facilityId: 'tategami_hospital',
  facilityName: '立神リハビリテーション温泉病院',
  metrics: strategicMetrics,
  recommendations: [
    '非常勤職員の福利厚生向上により定着率改善',
    'IT技術導入による業務効率化の推進',
    '職員間のコミュニケーション活性化'
  ],
  riskFactors: [
    '人材不足による業務負荷増加',
    '新技術導入に伴う初期コスト',
    '組織変革に対する抵抗'
  ],
  opportunities: [
    'VoiceDriveプラットフォームによる意見集約効率化',
    '他施設とのベストプラクティス共有',
    'データ分析による意思決定精度向上'
  ]
};

// ROI分析データ
export const roiAnalyticsDemoData = {
  projects: [
    {
      id: 'proj-1',
      name: '非常勤職員慶弔休暇制度',
      investment: 500000,
      returns: 1200000,
      roi: 140,
      period: 12
    },
    {
      id: 'proj-2',
      name: '音声入力システム',
      investment: 1200000,
      returns: 2400000,
      roi: 100,
      period: 18
    }
  ],
  totalROI: 120,
  averagePayback: 15
};

// 戦略的インサイトデータ
export const strategicInsightsDemoData = {
  insights: [
    {
      category: 'efficiency',
      title: '業務効率化の成果',
      description: 'IT化により20%の時間削減を達成',
      impact: 'high',
      confidence: 0.89
    },
    {
      category: 'engagement',
      title: '職員満足度向上',
      description: '福利厚生改善により定着率15%向上',
      impact: 'medium',
      confidence: 0.76
    }
  ]
};

// ベンチマーク比較データ
export const benchmarkComparisonDemoData = {
  facilities: [
    {
      name: '立神リハビリテーション温泉病院',
      score: 85,
      category: 'リハビリ病院',
      ranking: 2
    }
  ],
  industryAverage: 78,
  topPerformer: 92
};

// リスク評価データ
export const riskAssessmentDemoData = {
  risks: [
    {
      category: 'operational',
      description: '人材不足リスク',
      probability: 0.6,
      impact: 'high',
      mitigation: '採用強化・定着率向上施策'
    },
    {
      category: 'financial',
      description: '投資回収リスク',
      probability: 0.3,
      impact: 'medium',
      mitigation: 'ROI継続監視・段階的投資'
    }
  ]
};

// システム最適化推奨事項
export const systemOptimizationRecommendations = [
  {
    id: 'opt-1',
    title: 'プロセス自動化',
    description: '定型業務の自動化推進',
    priority: 'high',
    effort: 'medium',
    impact: 'high'
  },
  {
    id: 'opt-2',
    title: 'データ活用強化',
    description: '分析基盤の構築',
    priority: 'medium',
    effort: 'high',
    impact: 'medium'
  }
];

// プロジェクトパイプラインデータ
export const projectPipelineDemoData = {
  pipeline: [
    {
      stage: 'ideation',
      count: 8,
      projects: ['委員会運営効率化', '休憩室環境改善']
    },
    {
      stage: 'planning',
      count: 3,
      projects: ['音声入力システム導入']
    },
    {
      stage: 'execution',
      count: 1,
      projects: ['非常勤職員慶弔休暇制度']
    },
    {
      stage: 'completion',
      count: 12,
      projects: []
    }
  ],
  totalValue: 15600000,
  averageCompletionTime: 4.2
};

export default strategicAnalysis;