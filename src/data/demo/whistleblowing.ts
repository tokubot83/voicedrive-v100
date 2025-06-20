// 内部通報のデモデータ
export interface WhistleblowingReport {
  id: string;
  title: string;
  category: 'harassment' | 'fraud' | 'safety' | 'discrimination' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'investigating' | 'resolved' | 'closed';
  submittedAt: Date;
  description: string;
  isAnonymous: boolean;
  facility_id?: string;
  department?: string;
}

export interface WhistleblowingStatistics {
  totalReports: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  resolutionTime: number; // average days
}

export const demoWhistleblowingReports: WhistleblowingReport[] = [
  {
    id: 'wb-1',
    title: '職場環境改善の要望',
    category: 'other',
    severity: 'medium',
    status: 'investigating',
    submittedAt: new Date('2025-06-01'),
    description: '休憩室の環境改善が必要です。騒音や温度管理の問題があります。',
    isAnonymous: true,
    facility_id: 'tategami_hospital',
    department: '医療療養病棟'
  },
  {
    id: 'wb-2',
    title: '労働時間の管理について',
    category: 'other',
    severity: 'low',
    status: 'resolved',
    submittedAt: new Date('2025-05-15'),
    description: '適切な労働時間管理の徹底をお願いします。',
    isAnonymous: true,
    facility_id: 'tategami_hospital'
  }
];

export const demoReportStatistics: WhistleblowingStatistics = {
  totalReports: 2,
  byCategory: {
    harassment: 0,
    fraud: 0,
    safety: 0,
    discrimination: 0,
    other: 2
  },
  bySeverity: {
    low: 1,
    medium: 1,
    high: 0,
    critical: 0
  },
  byStatus: {
    submitted: 0,
    investigating: 1,
    resolved: 1,
    closed: 0
  },
  resolutionTime: 14
};

export const getWhistleblowingPermissions = (userLevel: number) => {
  return {
    canView: userLevel >= 3,
    canInvestigate: userLevel >= 4,
    canResolve: userLevel >= 4
  };
};

export default demoWhistleblowingReports;