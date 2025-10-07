/**
 * 組織文化開発サービス
 * Level 14-17（人事部門）専用
 *
 * 組織文化の診断、改善施策管理、効果測定を提供
 */

import {
  CultureAssessment,
  CultureInitiative,
  CultureSummary,
  CultureFilter,
} from '../types/cultureDevelopment';

class CultureDevelopmentService {
  private assessment: CultureAssessment | null = null;
  private initiatives: CultureInitiative[] = [];

  constructor() {
    this.initializeDemoData();
  }

  /**
   * デモデータ初期化
   */
  private initializeDemoData(): void {
    // 文化診断データ
    this.assessment = {
      id: 'assessment-202509',
      assessmentDate: new Date('2025-09-30'),
      period: {
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-30'),
      },

      overallScore: 72,
      previousScore: 68,
      trend: 'improving',

      dimensions: [
        {
          id: 'psychological_safety',
          name: '心理的安全性',
          description: '職員が安心して意見を述べられる環境',
          score: 78,
          previousScore: 72,
          change: +6,
          indicators: [
            { name: '自由な発言', value: 82, target: 85, achievement: 96, trend: 'up' },
            { name: '失敗から学ぶ', value: 76, target: 80, achievement: 95, trend: 'up' },
            { name: '助け合い', value: 76, target: 75, achievement: 101, trend: 'stable' },
          ],
          recommendedActions: [
            '定期的な1on1ミーティングの実施',
            'フィードバック文化の醸成',
          ],
        },
        {
          id: 'collaboration',
          name: '協働性',
          description: '部門を超えた協力体制',
          score: 68,
          previousScore: 65,
          change: +3,
          indicators: [
            { name: '部門間連携', value: 65, target: 75, achievement: 87, trend: 'up' },
            { name: '情報共有', value: 72, target: 75, achievement: 96, trend: 'stable' },
            { name: 'チーム意識', value: 67, target: 70, achievement: 96, trend: 'up' },
          ],
          recommendedActions: [
            '部門横断プロジェクトの推進',
            'コラボレーションツールの活用促進',
          ],
        },
        {
          id: 'innovation',
          name: 'イノベーション志向',
          description: '新しいアイデアを歓迎する文化',
          score: 70,
          previousScore: 68,
          change: +2,
          indicators: [
            { name: 'アイデア提案', value: 74, target: 75, achievement: 99, trend: 'up' },
            { name: '変化への適応', value: 68, target: 70, achievement: 97, trend: 'up' },
            { name: '実験的試み', value: 68, target: 75, achievement: 91, trend: 'stable' },
          ],
          recommendedActions: [
            'アイデアボイス機能のさらなる活用',
            'イノベーションワークショップの開催',
          ],
        },
        {
          id: 'learning',
          name: '学習文化',
          description: '継続的な学習と成長の支援',
          score: 75,
          previousScore: 74,
          change: +1,
          indicators: [
            { name: '研修機会', value: 80, target: 80, achievement: 100, trend: 'stable' },
            { name: 'スキル開発', value: 72, target: 75, achievement: 96, trend: 'up' },
            { name: 'ナレッジ共有', value: 73, target: 75, achievement: 97, trend: 'stable' },
          ],
          recommendedActions: [
            'オンライン学習プラットフォームの導入',
            '世代間メンタリングプログラム',
          ],
        },
        {
          id: 'work_life_balance',
          name: 'ワークライフバランス',
          description: '仕事と私生活の調和',
          score: 65,
          previousScore: 64,
          change: +1,
          indicators: [
            { name: '労働時間適正', value: 68, target: 75, achievement: 91, trend: 'up' },
            { name: '休暇取得', value: 62, target: 70, achievement: 89, trend: 'stable' },
            { name: '柔軟な働き方', value: 65, target: 75, achievement: 87, trend: 'up' },
          ],
          recommendedActions: [
            'リモートワーク制度の拡充',
            '有給休暇取得推進キャンペーン',
          ],
        },
      ],

      byDepartment: [
        {
          department: 'リハビリ科',
          overallScore: 78,
          dimensionScores: [
            { dimension: '心理的安全性', score: 82 },
            { dimension: '協働性', score: 76 },
            { dimension: 'イノベーション志向', score: 75 },
          ],
          rank: 1,
          participationRate: 92,
        },
        {
          department: '事務部',
          overallScore: 74,
          dimensionScores: [
            { dimension: '心理的安全性', score: 78 },
            { dimension: '協働性', score: 72 },
            { dimension: 'イノベーション志向', score: 72 },
          ],
          rank: 2,
          participationRate: 88,
        },
        {
          department: '看護部',
          overallScore: 70,
          dimensionScores: [
            { dimension: '心理的安全性', score: 75 },
            { dimension: '協働性', score: 66 },
            { dimension: 'イノベーション志向', score: 68 },
          ],
          rank: 3,
          participationRate: 85,
        },
      ],

      strengths: [
        '心理的安全性が高く、職員が意見を述べやすい環境',
        '学習文化が定着しており、研修参加率が高い',
        'イノベーション志向が向上中',
      ],

      weaknesses: [
        'ワークライフバランスの改善が必要',
        '部門間協働にまだ課題あり',
        '看護部のエンゲージメントスコアが低い',
      ],

      opportunities: [
        'VoiceDriveの活用により職員の声をさらに収集',
        '世代間連携プログラムの展開',
        'リモートワーク制度の拡充による働きやすさ向上',
      ],

      participantCount: 98,
      responseRate: 81.7,

      createdAt: new Date('2025-09-30'),
      updatedAt: new Date('2025-09-30'),
    };

    // 改善施策データ
    this.initiatives = [
      {
        id: 'init-001',
        title: '部門横断コミュニケーション強化プログラム',
        description: '部門間の壁を取り払い、協働を促進するプログラム',
        objective: '部門間協働スコアを75以上に向上',

        status: 'active',
        priority: 'high',

        targetDimensions: ['協働性', '心理的安全性'],
        targetDepartments: [],
        targetAudience: '全職員',

        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-12-31'),
        milestones: [
          {
            id: 'ms-001',
            name: 'キックオフミーティング',
            targetDate: new Date('2025-08-15'),
            completedDate: new Date('2025-08-14'),
            status: 'completed',
            deliverables: ['プログラム説明資料', '参加者アンケート'],
          },
          {
            id: 'ms-002',
            name: '月次交流会（第1回）',
            targetDate: new Date('2025-09-30'),
            completedDate: new Date('2025-09-28'),
            status: 'completed',
            deliverables: ['交流会レポート', '参加者フィードバック'],
          },
          {
            id: 'ms-003',
            name: '月次交流会（第2回）',
            targetDate: new Date('2025-10-31'),
            status: 'in_progress',
            deliverables: ['交流会レポート', '参加者フィードバック'],
          },
        ],

        owner: 'level-14-hr',
        ownerName: '人事部 田中',
        team: ['level-15-hr', 'level-3-nurse', 'level-3-rehab'],

        kpis: [
          {
            name: '協働スコア',
            baseline: 65,
            target: 75,
            current: 68,
            unit: '点',
            achievement: 30,
          },
          {
            name: '交流会参加率',
            baseline: 0,
            target: 80,
            current: 72,
            unit: '%',
            achievement: 90,
          },
        ],

        progress: 42,
        currentPhase: '月次交流会実施中',

        budget: 500000,
        actualSpending: 185000,

        createdAt: new Date('2025-07-15'),
        updatedAt: new Date('2025-10-05'),
      },
      {
        id: 'init-002',
        title: 'ワークライフバランス改善プロジェクト',
        description: '柔軟な働き方を実現し、職員の満足度を向上',
        objective: 'ワークライフバランススコアを75以上に向上',

        status: 'active',
        priority: 'critical',

        targetDimensions: ['ワークライフバランス'],
        targetDepartments: ['看護部', '事務部'],
        targetAudience: '全職員（特に夜勤職員）',

        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-03-31'),
        milestones: [
          {
            id: 'ms-004',
            name: 'リモートワーク制度設計',
            targetDate: new Date('2025-09-30'),
            completedDate: new Date('2025-09-28'),
            status: 'completed',
            deliverables: ['制度設計書', '運用マニュアル'],
          },
          {
            id: 'ms-005',
            name: 'パイロット導入',
            targetDate: new Date('2025-11-30'),
            status: 'in_progress',
            deliverables: ['パイロット実施レポート', '課題リスト'],
          },
        ],

        owner: 'level-15-hr',
        ownerName: '人事部長 佐藤',
        team: ['level-14-hr', 'level-6-it'],

        kpis: [
          {
            name: 'ワークライフバランススコア',
            baseline: 65,
            target: 75,
            current: 65,
            unit: '点',
            achievement: 0,
          },
          {
            name: 'リモートワーク利用率',
            baseline: 0,
            target: 30,
            current: 8,
            unit: '%',
            achievement: 27,
          },
        ],

        progress: 25,
        currentPhase: 'パイロット導入準備中',

        budget: 2000000,
        actualSpending: 420000,

        createdAt: new Date('2025-08-20'),
        updatedAt: new Date('2025-10-05'),
      },
      {
        id: 'init-003',
        title: 'イノベーション文化醸成ワークショップ',
        description: '新しいアイデアを歓迎し、実行する文化を育てる',
        objective: 'イノベーションスコアを80以上に向上',

        status: 'completed',
        priority: 'medium',

        targetDimensions: ['イノベーション志向', '学習文化'],
        targetDepartments: [],
        targetAudience: '管理職・リーダー層',

        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-09-30'),
        milestones: [
          {
            id: 'ms-006',
            name: 'ワークショップ第1回',
            targetDate: new Date('2025-06-30'),
            completedDate: new Date('2025-06-28'),
            status: 'completed',
            deliverables: ['ワークショップ資料', '参加者フィードバック'],
          },
          {
            id: 'ms-007',
            name: 'ワークショップ第2回',
            targetDate: new Date('2025-08-31'),
            completedDate: new Date('2025-08-30'),
            status: 'completed',
            deliverables: ['ワークショップ資料', '実践計画書'],
          },
          {
            id: 'ms-008',
            name: 'フォローアップセッション',
            targetDate: new Date('2025-09-30'),
            completedDate: new Date('2025-09-29'),
            status: 'completed',
            deliverables: ['成果報告書', '今後の施策提案'],
          },
        ],

        owner: 'level-14-hr',
        ownerName: '人事部 鈴木',
        team: ['level-16-strategy', 'level-7-facility'],

        kpis: [
          {
            name: 'イノベーションスコア',
            baseline: 68,
            target: 75,
            current: 70,
            unit: '点',
            achievement: 29,
          },
          {
            name: 'アイデア提案数',
            baseline: 24,
            target: 50,
            current: 42,
            unit: '件/月',
            achievement: 69,
          },
        ],

        progress: 100,
        currentPhase: '完了',

        budget: 300000,
        actualSpending: 285000,

        outcomes: {
          description: 'ワークショップを通じて、管理職のイノベーション意識が向上',
          metrics: [
            { name: 'イノベーションスコア', before: 68, after: 70, improvement: 2.9 },
            { name: 'アイデア提案数', before: 24, after: 42, improvement: 75.0 },
          ],
        },

        createdAt: new Date('2025-05-15'),
        updatedAt: new Date('2025-10-01'),
        completedAt: new Date('2025-09-30'),
      },
    ];
  }

  /**
   * 文化診断を取得
   */
  getAssessment(): CultureAssessment | null {
    return this.assessment;
  }

  /**
   * サマリーを取得
   */
  getSummary(): CultureSummary | null {
    if (!this.assessment) return null;

    const activeInitiatives = this.initiatives.filter(i => i.status === 'active');
    const completedInitiatives = this.initiatives.filter(i => i.status === 'completed');

    // 施策の進捗状況
    const initiativesOnTrack = activeInitiatives.filter(i => i.progress >= 50).length;
    const initiativesDelayed = activeInitiatives.filter(i => i.progress < 30).length;

    // 平均改善率（完了施策から計算）
    const averageImprovement = completedInitiatives.length > 0
      ? completedInitiatives.reduce((sum, i) => {
          if (i.outcomes) {
            const avgImp = i.outcomes.metrics.reduce((s, m) => s + m.improvement, 0) / i.outcomes.metrics.length;
            return sum + avgImp;
          }
          return sum;
        }, 0) / completedInitiatives.length
      : 0;

    // 要注意次元
    const criticalDimensions = this.assessment.dimensions
      .filter(d => d.score < 65)
      .map(d => d.name);

    // 改善中の次元
    const improvingDimensions = this.assessment.dimensions
      .filter(d => d.change > 3)
      .map(d => d.name);

    return {
      currentScore: this.assessment.overallScore,
      previousScore: this.assessment.previousScore || 0,
      scoreChange: this.assessment.overallScore - (this.assessment.previousScore || 0),
      trend: this.assessment.trend,

      totalInitiatives: this.initiatives.length,
      activeInitiatives: activeInitiatives.length,
      completedInitiatives: completedInitiatives.length,
      initiativesOnTrack,
      initiativesDelayed,

      averageImprovement,
      highImpactInitiatives: completedInitiatives.filter(i => {
        if (!i.outcomes) return false;
        return i.outcomes.metrics.some(m => m.improvement > 50);
      }).length,

      criticalDimensions,
      improvingDimensions,
    };
  }

  /**
   * すべての施策を取得
   */
  getAllInitiatives(): CultureInitiative[] {
    return this.initiatives;
  }

  /**
   * フィルタリングされた施策を取得
   */
  getFilteredInitiatives(filter: CultureFilter): CultureInitiative[] {
    return this.initiatives.filter(initiative => {
      if (filter.status && !filter.status.includes(initiative.status)) return false;
      if (filter.priority && !filter.priority.includes(initiative.priority)) return false;
      if (filter.targetDimensions && filter.targetDimensions.length > 0) {
        if (!initiative.targetDimensions.some(d => filter.targetDimensions!.includes(d))) return false;
      }
      if (filter.targetDepartments && filter.targetDepartments.length > 0) {
        if (initiative.targetDepartments.length === 0) return true; // 全体施策は常に含む
        if (!initiative.targetDepartments.some(d => filter.targetDepartments!.includes(d))) return false;
      }
      return true;
    });
  }

  /**
   * 施策をIDで取得
   */
  getInitiativeById(id: string): CultureInitiative | null {
    return this.initiatives.find(i => i.id === id) || null;
  }
}

// シングルトンインスタンス
export const cultureDevelopmentService = new CultureDevelopmentService();
export default cultureDevelopmentService;
