// 統一面談予約フローの型定義

export type InterviewClassification = 'regular' | 'support' | 'special';

export interface InterviewPreferences {
  timing: 'urgent' | 'this_week' | 'next_week' | 'this_month' | 'specific';
  specificWeek?: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'anytime';
  weekdays?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri')[];
  interviewer: 'anyone' | 'previous' | 'specific';
  interviewerId?: string;
  location: 'inside' | 'outside';
  notes?: string;
}

export interface UnifiedInterviewFlowState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  classification?: InterviewClassification;
  type?: string;
  category?: string;
  preferences?: InterviewPreferences;
  requestId?: string;
}

// サポート面談のカテゴリ定義
export interface SupportCategory {
  id: string;
  label: string;
  description?: string;
  group: 'career' | 'workplace' | 'consultation';
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  // キャリア系面談
  { id: 'career_path', label: 'キャリアパス', description: '将来の目標', group: 'career' },
  { id: 'skill_development', label: 'スキル開発', description: '研修・資格', group: 'career' },
  { id: 'promotion', label: '昇進・昇格', description: '', group: 'career' },

  // 職場環境系面談
  { id: 'workplace_environment', label: '職場環境', description: '設備・制度', group: 'workplace' },
  { id: 'interpersonal', label: '人間関係', description: 'チームワーク', group: 'workplace' },
  { id: 'workload', label: '業務負荷・ワークライフバランス', description: '', group: 'workplace' },
  { id: 'health_safety', label: '健康・安全', description: '', group: 'workplace' },
  { id: 'compensation', label: '給与・待遇', description: '', group: 'workplace' },
  { id: 'transfer', label: '異動・転勤', description: '', group: 'workplace' },

  // 個別相談面談
  { id: 'performance', label: 'パフォーマンス', description: '業務改善', group: 'consultation' },
  { id: 'training', label: '研修・教育', description: '', group: 'consultation' },
  { id: 'compliance', label: 'コンプライアンス', description: '', group: 'consultation' },
  { id: 'other', label: 'その他の相談', description: '', group: 'consultation' }
];

// 定期面談の種別
export const REGULAR_TYPES = [
  { id: 'newcomer', label: '新人職員面談', description: '入職1年目まで', icon: '👤' },
  { id: 'general', label: '一般職員面談', description: '2年目以降', icon: '👥' },
  { id: 'manager', label: '管理職面談', description: '主任以上', icon: '👔' }
];

// 特別面談の種別
export const SPECIAL_TYPES = [
  { id: 'return', label: '復職面談', icon: '🔄' },
  { id: 'resignation', label: '退職面談', icon: '🚪' },
  { id: 'incident', label: 'インシデント後面談', icon: '⚠️' }
];

// 時間帯の定義
export const TIME_SLOTS = [
  { value: 'morning', label: '午前', time: '9:00-12:00', icon: '🌅' },
  { value: 'afternoon', label: '午後', time: '13:00-17:00', icon: '☀️' },
  { value: 'evening', label: '夕方', time: '17:30-19:00', icon: '🌆' },
  { value: 'anytime', label: 'いつでも可', time: '', icon: '🕐' }
];

// 希望時期の定義
export const TIMING_OPTIONS = [
  { value: 'urgent', label: '緊急', description: '1-2日以内', icon: '🚨' },
  { value: 'this_week', label: '今週中', icon: '📅' },
  { value: 'next_week', label: '来週', icon: '📆' },
  { value: 'this_month', label: '今月中', icon: '🗓️' },
  { value: 'specific', label: '特定の週を指定', icon: '📌' }
];

// 曜日の定義
export const WEEKDAYS = [
  { value: 'mon', label: '月' },
  { value: 'tue', label: '火' },
  { value: 'wed', label: '水' },
  { value: 'thu', label: '木' },
  { value: 'fri', label: '金' }
];