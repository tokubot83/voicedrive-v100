import { PROFESSIONS } from '../data/medical/professions';
import { facilities } from '../data/medical/facilities';
import { departments } from '../data/medical/departments';

// 分析スコープの定義
interface AnalysisScope {
  type: 'facility' | 'department' | 'corporate';
  facilityId?: string;
  departmentId?: string;
}

// 職種データ構造
interface ProfessionData {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  avgVotingWeight: number;
  avgExperience: number;
  avgPermissionLevel: number;
  characteristics: string[];
  licenseBased: boolean;
  approvalAuthority: 'high' | 'medium' | 'low';
}

// 職種間関係データ
interface ProfessionInteraction {
  profession1: string;
  profession2: string;
  collaborationIndex: number;
  conflictLevel: number;
  communicationFrequency: number;
  projects: number;
}

// 分析結果の型定義
interface ProfessionalAnalysisResult {
  scope: AnalysisScope;
  professions: ProfessionData[];
  interactions: ProfessionInteraction[];
  insights: {
    summary: string;
    analysis: string;
    recommendations: string[];
  };
  metrics: {
    engagement: { [key: string]: number };
    participation: { [key: string]: number };
    votingPatterns: { [key: string]: any };
    collaborationIndex: { [key: string]: number };
    approvalEfficiency: { [key: string]: number };
  };
  categoryDistribution: {
    medical: number;
    nursing: number;
    rehabilitation: number;
    care: number;
    administrative: number;
    [key: string]: number;
  };
}

export class ProfessionalAnalysisService {
  // メイン分析メソッド
  static async getProfessionalAnalysis(scope: AnalysisScope): Promise<ProfessionalAnalysisResult> {
    // デモデータ生成
    const professions = this.generateProfessionData(scope);
    const interactions = this.generateInteractionData(professions);
    const metrics = this.generateMetrics(professions);
    const categoryDistribution = this.calculateCategoryDistribution(professions);
    const insights = this.generateInsights(professions, scope);

    return {
      scope,
      professions,
      interactions,
      insights,
      metrics,
      categoryDistribution
    };
  }

  // 職種データ生成
  private static generateProfessionData(scope: AnalysisScope): ProfessionData[] {
    const professionList = Object.values(PROFESSIONS);
    
    return professionList.map(profession => {
      // スコープに応じた職種数を計算
      const baseCount = this.getBaseCountByScope(scope);
      const count = Math.floor(Math.random() * baseCount * 0.3) + Math.ceil(baseCount * 0.1);
      
      return {
        id: profession.id,
        name: profession.name,
        category: profession.category,
        count,
        percentage: 0, // 後で計算
        avgVotingWeight: profession.baseVotingWeight + (Math.random() - 0.5) * 0.5,
        avgExperience: Math.random() * 15 + 3, // 3-18年
        avgPermissionLevel: this.calculateAvgPermissionLevel(profession.category),
        characteristics: this.generateCharacteristics(profession),
        licenseBased: profession.licenseBased,
        approvalAuthority: profession.approvalAuthority
      };
    }).map((profession, _, array) => {
      const totalCount = array.reduce((sum, p) => sum + p.count, 0);
      return {
        ...profession,
        percentage: Math.round((profession.count / totalCount) * 100 * 10) / 10
      };
    }).sort((a, b) => b.count - a.count);
  }

  // 職種間関係データ生成
  private static generateInteractionData(professions: ProfessionData[]): ProfessionInteraction[] {
    const interactions: ProfessionInteraction[] = [];
    
    for (let i = 0; i < professions.length; i++) {
      for (let j = i + 1; j < professions.length; j++) {
        const prof1 = professions[i];
        const prof2 = professions[j];
        
        // 関連性の強い職種組み合わせ
        const collaborationIndex = this.calculateCollaboration(prof1, prof2);
        
        interactions.push({
          profession1: prof1.id,
          profession2: prof2.id,
          collaborationIndex,
          conflictLevel: Math.random() * 0.3, // 0-0.3の低い競合レベル
          communicationFrequency: collaborationIndex * (0.7 + Math.random() * 0.3),
          projects: Math.floor(collaborationIndex * 10)
        });
      }
    }
    
    return interactions.sort((a, b) => b.collaborationIndex - a.collaborationIndex);
  }

  // メトリクス生成
  private static generateMetrics(professions: ProfessionData[]): any {
    const engagement: { [key: string]: number } = {};
    const participation: { [key: string]: number } = {};
    const votingPatterns: { [key: string]: any } = {};
    const collaborationIndex: { [key: string]: number } = {};
    const approvalEfficiency: { [key: string]: number } = {};

    professions.forEach(profession => {
      engagement[profession.name] = Math.random() * 40 + 60; // 60-100
      participation[profession.name] = Math.random() * 30 + 70; // 70-100
      collaborationIndex[profession.name] = Math.random() * 20 + 80; // 80-100
      approvalEfficiency[profession.name] = Math.random() * 25 + 75; // 75-100
      
      votingPatterns[profession.name] = {
        agreementRate: Math.random() * 20 + 80, // 80-100%
        abstentionRate: Math.random() * 10, // 0-10%
        initiativeRate: Math.random() * 30 + 20 // 20-50%
      };
    });

    return {
      engagement,
      participation,
      votingPatterns,
      collaborationIndex,
      approvalEfficiency
    };
  }

  // カテゴリ分布計算
  private static calculateCategoryDistribution(professions: ProfessionData[]) {
    const distribution: { [key: string]: number } = {
      medical: 0,
      nursing: 0,
      nursing_support: 0,
      rehabilitation: 0,
      care: 0,
      administrative: 0
    };

    professions.forEach(profession => {
      if (distribution[profession.category] !== undefined) {
        distribution[profession.category] += profession.count;
      }
    });

    return distribution;
  }

  // インサイト生成
  private static generateInsights(professions: ProfessionData[], scope: AnalysisScope): any {
    const topProfession = professions[0];
    const licensedCount = professions.filter(p => p.licenseBased).length;
    const totalProfessions = professions.length;

    const scopeText = scope.type === 'corporate' ? '法人全体' : 
                     scope.type === 'facility' ? '施設レベル' : '部門レベル';

    return {
      summary: `${scopeText}の職種間分析では、${topProfession.name}が最も多く${topProfession.count}名（${topProfession.percentage}%）を占めています。有資格者が${licensedCount}/${totalProfessions}職種と専門性の高い組織構成となっています。`,
      analysis: `医療職、看護職、リハビリ職、介護職、事務職の5つの主要カテゴリーでバランスの取れた構成となっており、特に医療専門職の協働体制が整備されています。職種間の投票重み付けシステムにより、専門性に応じた意思決定が行われています。`,
      recommendations: [
        '職種間コミュニケーションの更なる促進',
        '新人教育における多職種連携研修の充実',
        '職種別専門性を活かした役割分担の最適化',
        '職種間投票重みの定期的な見直しと調整',
        '有資格者の継続教育とキャリア開発支援'
      ]
    };
  }

  // ヘルパーメソッド
  private static getBaseCountByScope(scope: AnalysisScope): number {
    switch (scope.type) {
      case 'corporate': return 200;
      case 'facility': return 50;
      case 'department': return 15;
      default: return 100;
    }
  }

  private static calculateAvgPermissionLevel(category: string): number {
    const levelMap: { [key: string]: number } = {
      'medical': 4.5, // 医師は高い権限
      'nursing': 3.0,
      'nursing_support': 2.0,
      'rehabilitation': 3.0,
      'care': 2.5,
      'administrative': 2.0
    };
    return levelMap[category] || 2.0;
  }

  private static generateCharacteristics(profession: any): string[] {
    const characteristicsMap: { [key: string]: string[] } = {
      'doctor': ['高度専門性', '診断・治療責任', '多職種連携リーダー'],
      'nurse': ['24時間ケア提供', '患者観察力', '医師との協働'],
      'practical_nurse': ['基本看護技術', '医師・看護師補助', '患者対応'],
      'nursing_assistant': ['基本介助業務', 'チームサポート', '環境整備'],
      'care_worker_certified': ['介護専門技術', '生活支援', 'ケアプラン実施'],
      'care_worker': ['日常生活支援', '身体介護', 'コミュニケーション'],
      'pharmacist': ['薬物療法管理', '服薬指導', '医薬品安全管理'],
      'physical_therapist': ['運動機能訓練', 'ADL改善', '機能評価'],
      'occupational_therapist': ['作業療法', '日常動作訓練', '環境調整'],
      'speech_therapist': ['言語訓練', '摂食嚥下', 'コミュニケーション支援'],
      'administrative_staff': ['事務処理', '受付業務', '情報管理'],
      'nutritionist': ['栄養管理', '食事療法', '栄養指導'],
      'clinical_technician': ['検査技術', 'データ分析', '精度管理'],
      'radiologic_technologist': ['画像撮影', '放射線管理', '検査技術']
    };
    
    return characteristicsMap[profession.id] || ['専門業務', 'チーム貢献', '品質管理'];
  }

  private static calculateCollaboration(prof1: ProfessionData, prof2: ProfessionData): number {
    // 職種間の協働指数を計算
    const categoryCollaboration: { [key: string]: { [key: string]: number } } = {
      'medical': { 'nursing': 0.9, 'rehabilitation': 0.7, 'care': 0.6, 'administrative': 0.4 },
      'nursing': { 'medical': 0.9, 'nursing_support': 0.8, 'care': 0.7, 'rehabilitation': 0.6 },
      'rehabilitation': { 'medical': 0.7, 'nursing': 0.6, 'care': 0.8, 'nursing_support': 0.5 },
      'care': { 'nursing': 0.7, 'rehabilitation': 0.8, 'nursing_support': 0.6, 'medical': 0.6 },
      'administrative': { 'medical': 0.4, 'nursing': 0.3, 'rehabilitation': 0.3, 'care': 0.3 }
    };

    const baseCollaboration = categoryCollaboration[prof1.category]?.[prof2.category] || 0.3;
    return Math.min(baseCollaboration + (Math.random() - 0.5) * 0.2, 1.0);
  }
}