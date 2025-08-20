// V3評価システム対応の異議申し立て型定義
import { AppealRequest, AppealResponse, AppealStatus, AppealCategory } from './appeal';

// V3評価システム情報
export interface V3EvaluationSystem {
  maxScore: 100;
  minScore: 0;
  gradeSystem: '7-tier';
  gradeBoundaries: [90, 80, 70, 60, 50, 40, 0];
  gradeLabels: ['S', 'A+', 'A', 'B+', 'B', 'C', 'D'];
}

// V3評価期間
export interface V3EvaluationPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  evaluationStartDate: string;
  evaluationEndDate: string;
  disclosureDate: string;
  appealDeadline: string;
  status: 'active' | 'closed';
  evaluationSystem: V3EvaluationSystem;
}

// V3異議申し立てリクエスト
export interface V3AppealRequest extends AppealRequest {
  originalScore: number;    // 0-100
  requestedScore: number;   // 0-100
  originalGrade?: string;   // S, A+, A, B+, B, C, D
  requestedGrade?: string;  // S, A+, A, B+, B, C, D
}

// V3異議申し立てレスポンス
export interface V3AppealResponse extends AppealResponse {
  version: 'v3.0.0';
  details: {
    status: AppealStatus;
    priority: 'high' | 'medium' | 'low';
    processedAt: string;
    assignedTo: string;
    evaluationSystem: '100-point';
    gradingSystem: '7-tier';
    scoreDifference: number;
    grade: {
      current: string;
      requested: string;
    };
  };
}

// V3グレード計算ユーティリティ
export class V3GradeUtils {
  private static readonly GRADE_BOUNDARIES = [90, 80, 70, 60, 50, 40, 0];
  private static readonly GRADE_LABELS = ['S', 'A+', 'A', 'B+', 'B', 'C', 'D'];
  private static readonly GRADE_COLORS = {
    'S': '#9d174d',    // rose-800
    'A+': '#dc2626',   // red-600  
    'A': '#ea580c',    // orange-600
    'B+': '#ca8a04',   // yellow-600
    'B': '#65a30d',    // lime-600
    'C': '#0891b2',    // cyan-600
    'D': '#6b7280'     // gray-500
  };

  static getGradeFromScore(score: number): string {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A+';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B+';
    if (score >= 50) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  }

  static getGradeColor(grade: string): string {
    return this.GRADE_COLORS[grade as keyof typeof this.GRADE_COLORS] || '#6b7280';
  }

  static getScoreRangeForGrade(grade: string): { min: number; max: number } {
    const index = this.GRADE_LABELS.indexOf(grade);
    if (index === -1) return { min: 0, max: 0 };
    
    const min = this.GRADE_BOUNDARIES[index + 1] || 0;
    const max = index === 0 ? 100 : this.GRADE_BOUNDARIES[index] - 1;
    
    return { min, max };
  }

  static getGradeDescription(grade: string): string {
    const descriptions = {
      'S': '最優秀（90-100点）',
      'A+': '優秀+（80-89点）',
      'A': '優秀（70-79点）',
      'B+': '良好+（60-69点）',
      'B': '良好（50-59点）',
      'C': '可（40-49点）',
      'D': '要改善（0-39点）'
    };
    return descriptions[grade as keyof typeof descriptions] || '不明';
  }

  static validateV3Score(score: number): boolean {
    return score >= 0 && score <= 100 && Number.isInteger(score);
  }

  static calculateScoreDifference(original: number, requested: number): number {
    return Math.abs(requested - original);
  }

  static determineV3Priority(request: V3AppealRequest): 'high' | 'medium' | 'low' {
    // 計算誤りは最優先
    if (request.appealCategory === AppealCategory.CALCULATION_ERROR) {
      return 'high';
    }
    
    // スコア差による判定（V3では基準値が異なる）
    const scoreDiff = this.calculateScoreDifference(request.originalScore, request.requestedScore);
    if (scoreDiff >= 15) return 'high';    // V3では15点以上
    if (scoreDiff >= 8) return 'medium';   // V3では8点以上
    
    // 成果見落としは中優先度
    if (request.appealCategory === AppealCategory.ACHIEVEMENT_OVERSIGHT) {
      return 'medium';
    }
    
    return 'low';
  }

  static getGradeProgressionMessage(currentGrade: string, requestedGrade: string): string {
    const current = this.GRADE_LABELS.indexOf(currentGrade);
    const requested = this.GRADE_LABELS.indexOf(requestedGrade);
    
    if (requested < current) {
      return `グレードアップを希望（${currentGrade} → ${requestedGrade}）`;
    } else if (requested > current) {
      return `グレードダウン（${currentGrade} → ${requestedGrade}）`;
    } else {
      return `現在のグレード維持（${currentGrade}）`;
    }
  }
}

// V3バリデーションルール
export const V3_APPEAL_VALIDATION_RULES = {
  appealReason: {
    minLength: 100,
    maxLength: 2000,
    required: true
  },
  originalScore: {
    min: 0,
    max: 100,
    required: true,
    integer: true
  },
  requestedScore: {
    min: 0,
    max: 100,
    required: true,
    integer: true
  },
  scoreDifference: {
    min: 1,  // 最低1点以上の差が必要
    max: 100
  },
  evidenceDocuments: {
    maxFiles: 5,
    maxSizePerFile: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
  },
  submissionDeadline: 14 // 評価開示後14日以内
};

// V3フォームデータ
export interface V3AppealFormData extends V3AppealRequest {
  step?: number;
  isSubmitting?: boolean;
  validationErrors?: Record<string, string>;
  previewData?: {
    currentGradeInfo: string;
    requestedGradeInfo: string;
    scoreDifference: number;
    estimatedPriority: string;
  };
}

export default V3GradeUtils;