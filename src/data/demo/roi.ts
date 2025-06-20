// ROI分析のデモデータ
export interface ROICalculation {
  projectId: string;
  projectTitle: string;
  investment: number;
  benefits: number;
  roi: number;
  paybackPeriod: number; // months
  npv: number;
  category: string;
  status: 'projected' | 'actual' | 'ongoing';
}

export const demoROICalculations: ROICalculation[] = [
  {
    projectId: 'proj-1',
    projectTitle: '非常勤職員の慶弔休暇取得制度の導入',
    investment: 500000,
    benefits: 1200000,
    roi: 140, // %
    paybackPeriod: 8,
    npv: 700000,
    category: 'employee-welfare',
    status: 'projected'
  },
  {
    projectId: 'proj-2',
    projectTitle: '音声入力を活用した申し送り業務の効率化',
    investment: 1200000,
    benefits: 2400000,
    roi: 100,
    paybackPeriod: 12,
    npv: 1200000,
    category: 'innovation',
    status: 'projected'
  },
  {
    projectId: 'proj-3',
    projectTitle: '各種委員会の運営方法見直しによる業務効率化',
    investment: 800000,
    benefits: 1600000,
    roi: 100,
    paybackPeriod: 10,
    npv: 800000,
    category: 'improvement',
    status: 'projected'
  }
];

export default demoROICalculations;