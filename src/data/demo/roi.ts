export interface ROIMetric {
  id: string;
  projectId: string;
  metricType: 'cost-saving' | 'time-saving' | 'quality-improvement' | 'revenue-increase' | 'risk-reduction';
  name: string;
  baseline: number;
  target: number;
  actual?: number;
  unit: string;
  measurementDate?: Date;
  confidence: 'low' | 'medium' | 'high';
}

export interface ROICalculation {
  projectId: string;
  totalInvestment: number;
  totalBenefit: number;
  netBenefit: number;
  roi: number; // Percentage
  paybackPeriod: number; // Months
  calculatedDate: Date;
}

export interface CostBenefitItem {
  id: string;
  projectId: string;
  type: 'cost' | 'benefit';
  category: string;
  description: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate?: Date;
}

export const demoROIMetrics: ROIMetric[] = [
  // Project 001 - 新入社員研修プログラム
  {
    id: 'metric-001-1',
    projectId: 'proj-001',
    metricType: 'time-saving',
    name: '新入社員の独り立ちまでの期間',
    baseline: 6,
    target: 3,
    actual: 3.5,
    unit: '月',
    measurementDate: new Date('2024-10-01'),
    confidence: 'high'
  },
  {
    id: 'metric-001-2',
    projectId: 'proj-001',
    metricType: 'quality-improvement',
    name: '新入社員の1年後定着率',
    baseline: 75,
    target: 90,
    actual: 88,
    unit: '%',
    measurementDate: new Date('2025-01-05'),
    confidence: 'high'
  },
  {
    id: 'metric-001-3',
    projectId: 'proj-001',
    metricType: 'cost-saving',
    name: '採用コスト削減（定着率向上による）',
    baseline: 0,
    target: 3000000,
    actual: 2800000,
    unit: '円/年',
    measurementDate: new Date('2025-01-05'),
    confidence: 'medium'
  },
  
  // Project 002 - オフィス空調最適化
  {
    id: 'metric-002-1',
    projectId: 'proj-002',
    metricType: 'cost-saving',
    name: '月間電力使用量',
    baseline: 500000,
    target: 425000,
    unit: 'kWh',
    confidence: 'high'
  },
  {
    id: 'metric-002-2',
    projectId: 'proj-002',
    metricType: 'quality-improvement',
    name: '従業員の温度快適度満足度',
    baseline: 45,
    target: 80,
    unit: '%',
    confidence: 'medium'
  },
  
  // Project 003 - 人事評価システム改善
  {
    id: 'metric-003-1',
    projectId: 'proj-003',
    metricType: 'quality-improvement',
    name: '評価制度への満足度',
    baseline: 55,
    target: 85,
    unit: '%',
    confidence: 'high'
  },
  {
    id: 'metric-003-2',
    projectId: 'proj-003',
    metricType: 'time-saving',
    name: '評価プロセスにかかる時間',
    baseline: 40,
    target: 25,
    unit: '時間/人',
    confidence: 'medium'
  },
  
  // Project 004 - AI活用ナレッジ管理
  {
    id: 'metric-004-1',
    projectId: 'proj-004',
    metricType: 'time-saving',
    name: '情報検索時間',
    baseline: 30,
    target: 5,
    unit: '分/回',
    confidence: 'high'
  },
  {
    id: 'metric-004-2',
    projectId: 'proj-004',
    metricType: 'quality-improvement',
    name: 'ナレッジ共有率',
    baseline: 35,
    target: 80,
    unit: '%',
    confidence: 'medium'
  },
  
  // Project 005 - 育児支援制度
  {
    id: 'metric-005-1',
    projectId: 'proj-005',
    metricType: 'quality-improvement',
    name: '育児中社員の定着率',
    baseline: 70,
    target: 95,
    unit: '%',
    confidence: 'high'
  },
  {
    id: 'metric-005-2',
    projectId: 'proj-005',
    metricType: 'risk-reduction',
    name: '優秀人材の離職リスク',
    baseline: 25,
    target: 5,
    unit: '%',
    confidence: 'medium'
  }
];

export const demoCostBenefitItems: CostBenefitItem[] = [
  // Project 001 - Costs
  {
    id: 'cb-001-1',
    projectId: 'proj-001',
    type: 'cost',
    category: '外部講師費用',
    description: '専門講師による実践的研修の実施',
    amount: 2000000,
    frequency: 'one-time',
    startDate: new Date('2024-05-01')
  },
  {
    id: 'cb-001-2',
    projectId: 'proj-001',
    type: 'cost',
    category: 'システム開発費',
    description: 'e-ラーニングシステムの構築',
    amount: 1500000,
    frequency: 'one-time',
    startDate: new Date('2024-05-01')
  },
  {
    id: 'cb-001-3',
    projectId: 'proj-001',
    type: 'cost',
    category: 'メンター手当',
    description: 'メンター社員への手当支給',
    amount: 50000,
    frequency: 'monthly',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-03-31')
  },
  
  // Project 001 - Benefits
  {
    id: 'cb-001-4',
    projectId: 'proj-001',
    type: 'benefit',
    category: '生産性向上',
    description: '早期戦力化による生産性向上',
    amount: 500000,
    frequency: 'monthly',
    startDate: new Date('2024-09-01')
  },
  {
    id: 'cb-001-5',
    projectId: 'proj-001',
    type: 'benefit',
    category: '採用コスト削減',
    description: '定着率向上による再採用コスト削減',
    amount: 2800000,
    frequency: 'annually',
    startDate: new Date('2025-01-01')
  },
  
  // Project 002 - Costs
  {
    id: 'cb-002-1',
    projectId: 'proj-002',
    type: 'cost',
    category: '設備投資',
    description: 'エリア別空調制御システム導入',
    amount: 2500000,
    frequency: 'one-time',
    startDate: new Date('2024-09-01')
  },
  {
    id: 'cb-002-2',
    projectId: 'proj-002',
    type: 'cost',
    category: '保守費用',
    description: 'システム保守・メンテナンス',
    amount: 20000,
    frequency: 'monthly',
    startDate: new Date('2024-10-01')
  },
  
  // Project 002 - Benefits
  {
    id: 'cb-002-3',
    projectId: 'proj-002',
    type: 'benefit',
    category: '電力コスト削減',
    description: '効率的な空調運用による電力削減',
    amount: 150000,
    frequency: 'monthly',
    startDate: new Date('2024-10-01')
  },
  
  // Project 004 - Costs
  {
    id: 'cb-004-1',
    projectId: 'proj-004',
    type: 'cost',
    category: 'ライセンス費用',
    description: 'AI検索エンジンライセンス',
    amount: 100000,
    frequency: 'monthly',
    startDate: new Date('2025-03-01')
  },
  {
    id: 'cb-004-2',
    projectId: 'proj-004',
    type: 'cost',
    category: '開発費用',
    description: 'システム開発・カスタマイズ',
    amount: 5000000,
    frequency: 'one-time',
    startDate: new Date('2025-03-01')
  },
  
  // Project 004 - Benefits
  {
    id: 'cb-004-3',
    projectId: 'proj-004',
    type: 'benefit',
    category: '工数削減',
    description: '情報検索時間短縮による工数削減',
    amount: 800000,
    frequency: 'monthly',
    startDate: new Date('2025-06-01')
  }
];

export const demoROICalculations: ROICalculation[] = [
  {
    projectId: 'proj-001',
    totalInvestment: 4200000,
    totalBenefit: 8400000,
    netBenefit: 4200000,
    roi: 100,
    paybackPeriod: 8,
    calculatedDate: new Date('2025-01-05')
  },
  {
    projectId: 'proj-002',
    totalInvestment: 3000000,
    totalBenefit: 4500000,
    netBenefit: 1500000,
    roi: 50,
    paybackPeriod: 20,
    calculatedDate: new Date('2025-01-03')
  },
  {
    projectId: 'proj-003',
    totalInvestment: 2000000,
    totalBenefit: 4000000,
    netBenefit: 2000000,
    roi: 100,
    paybackPeriod: 12,
    calculatedDate: new Date('2025-01-04')
  },
  {
    projectId: 'proj-004',
    totalInvestment: 8000000,
    totalBenefit: 20000000,
    netBenefit: 12000000,
    roi: 150,
    paybackPeriod: 10,
    calculatedDate: new Date('2025-01-08')
  },
  {
    projectId: 'proj-005',
    totalInvestment: 1000000,
    totalBenefit: 3000000,
    netBenefit: 2000000,
    roi: 200,
    paybackPeriod: 4,
    calculatedDate: new Date('2025-01-07')
  }
];

// Helper functions
export const getROIMetricsByProject = (projectId: string): ROIMetric[] => {
  return demoROIMetrics.filter(metric => metric.projectId === projectId);
};

export const getCostBenefitItemsByProject = (projectId: string): CostBenefitItem[] => {
  return demoCostBenefitItems.filter(item => item.projectId === projectId);
};

export const getROICalculationByProject = (projectId: string): ROICalculation | undefined => {
  return demoROICalculations.find(calc => calc.projectId === projectId);
};

export const calculateTotalCosts = (projectId: string): number => {
  const items = getCostBenefitItemsByProject(projectId).filter(item => item.type === 'cost');
  let total = 0;
  
  items.forEach(item => {
    if (item.frequency === 'one-time') {
      total += item.amount;
    } else {
      const months = item.endDate 
        ? Math.floor((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 12; // Default to 1 year if no end date
      
      switch (item.frequency) {
        case 'monthly':
          total += item.amount * months;
          break;
        case 'quarterly':
          total += item.amount * (months / 3);
          break;
        case 'annually':
          total += item.amount * (months / 12);
          break;
      }
    }
  });
  
  return total;
};

export const calculateTotalBenefits = (projectId: string): number => {
  const items = getCostBenefitItemsByProject(projectId).filter(item => item.type === 'benefit');
  let total = 0;
  
  items.forEach(item => {
    if (item.frequency === 'one-time') {
      total += item.amount;
    } else {
      const months = 12; // Calculate for 1 year
      
      switch (item.frequency) {
        case 'monthly':
          total += item.amount * months;
          break;
        case 'quarterly':
          total += item.amount * (months / 3);
          break;
        case 'annually':
          total += item.amount;
          break;
      }
    }
  });
  
  return total;
};