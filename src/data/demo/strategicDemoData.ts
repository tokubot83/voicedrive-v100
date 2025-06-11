// レベル6以上ダッシュボード用デモデータ
import { StrategicRecommendation } from '../../analytics/engines/StrategicInsightsEngine';

// 戦略的インサイト用デモデータ
export const strategicInsightsDemoData = {
  opportunityValue: "¥850M",
  keyFindings: [
    "デジタル変革により年間3.2億円のコスト削減が可能",
    "人材育成投資のROIは185%で業界平均を上回る",
    "業務プロセス自動化により生産性が28%向上",
    "クロスセクショナル連携で新規事業機会を創出"
  ],
  actionItems: 12,
  recommendations: [
    {
      title: "AIベース業務自動化の推進",
      description: "ルーチン作業の70%を自動化し、人材をより戦略的業務にシフト。RPAツール導入と業務プロセス再設計を実施。",
      type: "SCALING_OPPORTUNITY",
      priority: "HIGH",
      expectedImpact: "年間¥420M節約、生産性35%向上",
      implementationCost: "HIGH",
      timeframe: "12-18ヶ月"
    },
    {
      title: "データ駆動型意思決定基盤構築",
      description: "全部門のデータを統合し、リアルタイム分析によるより迅速な意思決定を実現。BIツール導入とデータレイク構築。",
      type: "INVESTMENT_OPTIMIZATION",
      priority: "HIGH",
      expectedImpact: "意思決定速度50%向上、機会損失¥200M削減",
      implementationCost: "MEDIUM",
      timeframe: "8-12ヶ月"
    },
    {
      title: "サイバーセキュリティ強化",
      description: "ゼロトラスト・アーキテクチャ導入によりセキュリティリスクを軽減。多要素認証とエンドツーエンド暗号化の実装。",
      type: "RISK_MITIGATION", 
      priority: "HIGH",
      expectedImpact: "データ漏洩リスク85%削減、コンプライアンス向上",
      implementationCost: "MEDIUM",
      timeframe: "6-9ヶ月"
    },
    {
      title: "イノベーション・ラボ設立",
      description: "社内起業家精神を育成し、破壊的イノベーションを創出。プロトタイプ開発とMVP検証プロセスの標準化。",
      type: "INNOVATION_FOCUS",
      priority: "MEDIUM",
      expectedImpact: "新規事業3-5件創出、売上¥300M増",
      implementationCost: "HIGH",
      timeframe: "18-24ヶ月"
    },
    {
      title: "アジャイル組織変革",
      description: "階層型組織からネットワーク型組織への移行。クロスファンクショナルチームと迅速な意思決定プロセス。",
      type: "SCALING_OPPORTUNITY",
      priority: "MEDIUM", 
      expectedImpact: "開発速度40%向上、従業員満足度20%向上",
      implementationCost: "LOW",
      timeframe: "12-15ヶ月"
    }
  ] as StrategicRecommendation[]
};

// ROI分析用デモデータ
export const roiAnalyticsDemoData = {
  averageROI: 168,
  totalProjects: 47,
  trend: "UP" as const,
  projects: [
    {
      id: "proj-001",
      name: "営業プロセス自動化",
      roi: 245,
      investment: 50000000,
      returns: 122500000,
      status: "completed"
    },
    {
      id: "proj-002", 
      name: "顧客データ統合基盤",
      roi: 192,
      investment: 80000000,
      returns: 153600000,
      status: "active"
    },
    {
      id: "proj-003",
      name: "AI チャットボット導入",
      roi: 178,
      investment: 30000000,
      returns: 53400000,
      status: "completed"
    },
    {
      id: "proj-004",
      name: "リモートワーク基盤",
      roi: 156,
      investment: 45000000,
      returns: 70200000,
      status: "active"
    },
    {
      id: "proj-005",
      name: "在庫管理最適化",
      roi: 134,
      investment: 25000000,
      returns: 33500000,
      status: "completed"
    },
    {
      id: "proj-006",
      name: "セキュリティ強化",
      roi: 128,
      investment: 60000000,
      returns: 76800000,
      status: "active"
    }
  ]
};

// ベンチマーク比較用デモデータ
export const benchmarkComparisonDemoData = [
  {
    metric: "プロジェクト成功率",
    industryAverage: 72,
    organizationValue: 89,
    unit: "%"
  },
  {
    metric: "平均ROI",
    industryAverage: 125,
    organizationValue: 168,
    unit: "%"
  },
  {
    metric: "デジタル成熟度",
    industryAverage: 3.2,
    organizationValue: 4.1,
    unit: "/5"
  },
  {
    metric: "従業員エンゲージメント",
    industryAverage: 68,
    organizationValue: 78,
    unit: "%"
  }
];

// リスク評価用デモデータ
export const riskAssessmentDemoData = [
  {
    id: "risk-001",
    name: "サイバー攻撃",
    category: "セキュリティ",
    impact: 4,
    probability: 3,
    color: "bg-red-500",
    mitigation: "ゼロトラスト・アーキテクチャ導入中",
    owner: "IT部",
    reviewDate: "2025-07-01"
  },
  {
    id: "risk-002",
    name: "人材流出",
    category: "人事",
    impact: 3,
    probability: 2,
    color: "bg-yellow-500",
    mitigation: "報酬体系見直し・キャリアパス明確化",
    owner: "人事部",
    reviewDate: "2025-08-15"
  },
  {
    id: "risk-003",
    name: "システム老朽化",
    category: "技術",
    impact: 3,
    probability: 4,
    color: "bg-orange-500",
    mitigation: "段階的システム更新計画実行中",
    owner: "IT部",
    reviewDate: "2025-06-30"
  },
  {
    id: "risk-004",
    name: "市場競争激化",
    category: "事業",
    impact: 4,
    probability: 3,
    color: "bg-red-600",
    mitigation: "イノベーション・ラボ設立準備",
    owner: "戦略企画部",
    reviewDate: "2025-09-01"
  },
  {
    id: "risk-005",
    name: "規制変更",
    category: "コンプライアンス",
    impact: 2,
    probability: 2,
    color: "bg-green-500",
    mitigation: "法務部門との定期的な情報共有",
    owner: "法務部",
    reviewDate: "2025-12-31"
  },
  {
    id: "risk-006",
    name: "予算超過",
    category: "財務",
    impact: 2,
    probability: 3,
    color: "bg-yellow-600",
    mitigation: "月次予算レビュー強化",
    owner: "財務部",
    reviewDate: "2025-07-15"
  }
];

// プロジェクトパイプライン用デモデータ
export const projectPipelineDemoData = {
  totalValue: "¥2.4B",
  projectCount: 47,
  stages: {
    planning: {
      count: 12,
      value: "¥680M",
      projects: [
        { name: "次世代CRM導入", value: "¥180M", progress: 15 },
        { name: "工場自動化", value: "¥250M", progress: 25 },
        { name: "ブロックチェーン基盤", value: "¥150M", progress: 10 }
      ]
    },
    execution: {
      count: 18,
      value: "¥950M", 
      projects: [
        { name: "AIアナリティクス", value: "¥120M", progress: 65 },
        { name: "クラウド移行", value: "¥200M", progress: 45 },
        { name: "モバイルアプリ刷新", value: "¥80M", progress: 78 }
      ]
    },
    monitoring: {
      count: 10,
      value: "¥420M",
      projects: [
        { name: "セキュリティ強化", value: "¥60M", progress: 92 },
        { name: "データレイク構築", value: "¥150M", progress: 88 },
        { name: "BIツール導入", value: "¥90M", progress: 95 }
      ]
    },
    completed: {
      count: 7,
      value: "¥350M",
      projects: [
        { name: "営業自動化", value: "¥50M", progress: 100 },
        { name: "チャットボット", value: "¥30M", progress: 100 },
        { name: "在庫最適化", value: "¥25M", progress: 100 }
      ]
    }
  }
};