import { PostCategory } from './categories';

// 医療・介護系特有のカテゴリ
export type MedicalPostCategory = PostCategory | 
  // 医療系戦略提案
  | 'new_medical_service'          // 新規医療サービス
  | 'clinical_pathway'             // クリニカルパス
  | 'medical_collaboration'        // 医療連携
  | 'patient_care_innovation'      // 患者ケア革新
  // 介護系戦略提案
  | 'care_service_expansion'       // 介護サービス拡充
  | 'community_care'               // 地域包括ケア
  | 'dementia_care'               // 認知症ケア
  | 'rehabilitation_program'       // リハビリプログラム
  // 医療安全・品質
  | 'medical_safety'              // 医療安全
  | 'infection_control'           // 感染管理
  | 'quality_improvement'         // 医療の質改善
  | 'clinical_research'           // 臨床研究
  // 規制・コンプライアンス
  | 'regulatory_compliance'       // 法規制対応
  | 'medical_ethics'              // 医療倫理
  | 'insurance_billing'           // 診療報酬
  | 'facility_standards';         // 施設基準

export interface MedicalCategoryInfo {
  id: MedicalPostCategory;
  name: string;
  description: string;
  mainTab: string;
  icon: string;
  requiresCarefulConsideration: boolean;
  regulatoryImpact: 'high' | 'medium' | 'low';
  patientSafetyImpact: 'direct' | 'indirect' | 'none';
}

export const MEDICAL_POST_CATEGORIES: Record<string, MedicalCategoryInfo> = {
  // === 医療系戦略提案（超慎重検討） ===
  new_medical_service: {
    id: 'new_medical_service',
    name: '新規医療サービス',
    description: '新しい診療科・医療サービスの開設提案',
    mainTab: 'strategic',
    icon: '🏥',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },
  clinical_pathway: {
    id: 'clinical_pathway',
    name: 'クリニカルパス',
    description: '診療計画・治療プロトコルの標準化提案',
    mainTab: 'strategic',
    icon: '📋',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'direct'
  },
  medical_collaboration: {
    id: 'medical_collaboration',
    name: '医療連携',
    description: '他医療機関との連携・ネットワーク構築',
    mainTab: 'strategic',
    icon: '🤝',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'indirect'
  },
  patient_care_innovation: {
    id: 'patient_care_innovation',
    name: '患者ケア革新',
    description: '患者中心の新しいケアモデル提案',
    mainTab: 'strategic',
    icon: '💝',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'direct'
  },

  // === 介護系戦略提案（慎重検討） ===
  care_service_expansion: {
    id: 'care_service_expansion',
    name: '介護サービス拡充',
    description: '新規介護サービス・事業所開設',
    mainTab: 'strategic',
    icon: '🏠',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },
  community_care: {
    id: 'community_care',
    name: '地域包括ケア',
    description: '地域連携・包括ケアシステム構築',
    mainTab: 'strategic',
    icon: '🌍',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'indirect'
  },
  dementia_care: {
    id: 'dementia_care',
    name: '認知症ケア',
    description: '認知症ケアプログラム・施設整備',
    mainTab: 'strategic',
    icon: '🧠',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'direct'
  },
  rehabilitation_program: {
    id: 'rehabilitation_program',
    name: 'リハビリプログラム',
    description: 'リハビリテーション強化・新プログラム',
    mainTab: 'strategic',
    icon: '🏃',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'direct'
  },

  // === 医療安全・品質（最重要） ===
  medical_safety: {
    id: 'medical_safety',
    name: '医療安全',
    description: 'インシデント防止・安全対策強化',
    mainTab: 'quality',
    icon: '⚕️',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },
  infection_control: {
    id: 'infection_control',
    name: '感染管理',
    description: '院内感染対策・感染管理体制',
    mainTab: 'quality',
    icon: '🦠',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },
  quality_improvement: {
    id: 'quality_improvement',
    name: '医療の質改善',
    description: 'QI活動・医療の質向上施策',
    mainTab: 'quality',
    icon: '📊',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'medium',
    patientSafetyImpact: 'direct'
  },
  clinical_research: {
    id: 'clinical_research',
    name: '臨床研究',
    description: '治験・臨床研究の実施提案',
    mainTab: 'quality',
    icon: '🔬',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },

  // === 規制・コンプライアンス（超慎重） ===
  regulatory_compliance: {
    id: 'regulatory_compliance',
    name: '法規制対応',
    description: '医療法・介護保険法等への対応',
    mainTab: 'compliance',
    icon: '⚖️',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'indirect'
  },
  medical_ethics: {
    id: 'medical_ethics',
    name: '医療倫理',
    description: '倫理的課題・ガイドライン策定',
    mainTab: 'compliance',
    icon: '🤲',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'direct'
  },
  insurance_billing: {
    id: 'insurance_billing',
    name: '診療報酬',
    description: '診療報酬改定対応・算定最適化',
    mainTab: 'compliance',
    icon: '💴',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'none'
  },
  facility_standards: {
    id: 'facility_standards',
    name: '施設基準',
    description: '施設基準取得・維持管理',
    mainTab: 'compliance',
    icon: '🏛️',
    requiresCarefulConsideration: true,
    regulatoryImpact: 'high',
    patientSafetyImpact: 'indirect'
  }
};

// 医療・介護系の期限設定（単位：時間）
export const MEDICAL_DEADLINE_MAP: Record<string, Record<string, number>> = {
  // === 新規医療サービス（最長期限） ===
  new_medical_service: {
    low: 1440,     // 60日（行政申請・認可期間を考慮）
    medium: 1080,  // 45日
    high: 720,     // 30日
    critical: 336  // 14日（最短でも2週間）
  },
  
  // === クリニカルパス（医療安全に直結） ===
  clinical_pathway: {
    low: 1080,     // 45日（全診療科の合意形成）
    medium: 720,   // 30日
    high: 504,     // 21日
    critical: 168  // 7日
  },
  
  // === 医療連携 ===
  medical_collaboration: {
    low: 720,      // 30日（複数機関の調整）
    medium: 504,   // 21日
    high: 336,     // 14日
    critical: 168  // 7日
  },
  
  // === 介護サービス拡充 ===
  care_service_expansion: {
    low: 1080,     // 45日（介護保険事業計画との整合）
    medium: 720,   // 30日
    high: 504,     // 21日
    critical: 240  // 10日
  },
  
  // === 地域包括ケア ===
  community_care: {
    low: 720,      // 30日（地域との調整）
    medium: 504,   // 21日
    high: 336,     // 14日
    critical: 168  // 7日
  },
  
  // === 医療安全（迅速だが慎重に） ===
  medical_safety: {
    low: 336,      // 14日（安全は迅速に、でも慎重に）
    medium: 168,   // 7日
    high: 72,      // 3日
    critical: 24   // 1日（重大インシデント対応）
  },
  
  // === 感染管理（緊急性高い） ===
  infection_control: {
    low: 168,      // 7日
    medium: 72,    // 3日
    high: 24,      // 1日
    critical: 6    // 6時間（アウトブレイク対応）
  },
  
  // === 法規制対応（十分な検討期間） ===
  regulatory_compliance: {
    low: 1440,     // 60日（法的リスク評価）
    medium: 1080,  // 45日
    high: 720,     // 30日
    critical: 336  // 14日
  },
  
  // === 診療報酬（改定時期に依存） ===
  insurance_billing: {
    low: 720,      // 30日（通常時）
    medium: 336,   // 14日
    high: 168,     // 7日
    critical: 72   // 3日（改定直前）
  }
};

// 医療機関の種別による期限調整係数
export const FACILITY_TYPE_MULTIPLIERS = {
  'acute_care_hospital': 0.8,      // 急性期病院（迅速な意思決定）
  'chronic_care_hospital': 1.0,    // 慢性期病院（標準）
  'rehabilitation_hospital': 1.0,   // リハビリ病院（標準）
  'psychiatric_hospital': 1.2,      // 精神科病院（慎重な検討）
  'clinic': 0.7,                   // クリニック（小規模で迅速）
  'nursing_home': 1.1,             // 特養（利用者への影響考慮）
  'care_facility': 1.0,            // 介護施設（標準）
  'home_care': 0.9                 // 在宅介護（機動的対応）
};