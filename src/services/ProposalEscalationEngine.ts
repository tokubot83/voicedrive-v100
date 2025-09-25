import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';
import { VoteCalculationResult } from './HybridVotingCalculator';

// ========== 型定義 ==========
export interface ProposalThreshold {
  level: string;
  minScore: number;
  approvalAuthority: string;
  votingScope: string;
  committeeTarget?: string;
}

export interface DepartmentSize {
  small: number;     // 5人以下
  medium: number;    // 6-15人
  large: number;     // 16-30人
  xlarge: number;    // 31人以上
}

export interface ProposalStatus {
  id: string;
  title: string;
  currentScore: number;
  currentLevel: string;
  nextThreshold: number;
  nextLevel: string;
  progress: number;
  votingScope: string;
  canEscalate: boolean;
}

export interface CommitteeInfo {
  name: string;
  schedule: string;
  facility: string;
  targetCategories: string[];
}

export interface AgendaDocument {
  proposalId: string;
  committeeId: string;
  documentType: string;
  content: string;
  generatedAt: Date;
}

// ========== 議題提出エスカレーションエンジン ==========
export class ProposalEscalationEngine {

  // 議題レベル閾値（旧プロジェクトレベル）
  private readonly thresholds: ProposalThreshold[] = [
    {
      level: '部署検討',
      minScore: 30,
      approvalAuthority: '主任・係長',
      votingScope: '部署内のみ'
    },
    {
      level: '部署議題',
      minScore: 50,
      approvalAuthority: '課長・部長',
      votingScope: '部署内のみ'
    },
    {
      level: '施設議題',
      minScore: 100,
      approvalAuthority: '施設長・院長',
      votingScope: '施設全体',
      committeeTarget: '運営委員会'
    },
    {
      level: '法人検討',
      minScore: 300,
      approvalAuthority: '戦略企画部',
      votingScope: '法人全体',
      committeeTarget: '経営会議'
    },
    {
      level: '法人議題',
      minScore: 600,
      approvalAuthority: '理事長',
      votingScope: '法人全体',
      committeeTarget: '理事会'
    }
  ];

  // 部署規模による閾値調整係数
  private readonly sizeAdjustments: Record<keyof DepartmentSize, number> = {
    small: 0.4,   // 5人以下
    medium: 0.6,  // 6-15人
    large: 0.8,   // 16-30人
    xlarge: 1.0   // 31人以上
  };

  // 小原病院の委員会情報
  private readonly committees: CommitteeInfo[] = [
    {
      name: '医療安全管理委員会',
      schedule: '第2火曜日',
      facility: '小原病院',
      targetCategories: ['医療安全', '患者安全', 'インシデント対策']
    },
    {
      name: '感染対策委員会',
      schedule: '第3水曜日',
      facility: '小原病院',
      targetCategories: ['感染対策', '衛生管理', '感染予防']
    },
    {
      name: '業務改善委員会',
      schedule: '第4木曜日',
      facility: '小原病院',
      targetCategories: ['業務改善', '効率化', 'コスト削減']
    },
    {
      name: '小原病院運営委員会',
      schedule: '月2回（第2・第4月曜日）',
      facility: '小原病院',
      targetCategories: ['施設運営', '戦略提案', '組織改革']
    },
    {
      name: '病院意思決定会議',
      schedule: '月1回（第1金曜日）',
      facility: '小原病院',
      targetCategories: ['経営判断', '重要決定', '投資案件']
    }
  ];

  /**
   * 提案の現在状態を評価
   */
  evaluateProposal(
    proposalId: string,
    title: string,
    totalScore: number,
    departmentSize: number,
    category: string
  ): ProposalStatus {
    
    // 部署規模に応じた調整
    const adjustedScore = this.adjustScoreByDepartmentSize(totalScore, departmentSize);
    
    // 現在のレベルを判定
    const currentLevel = this.getCurrentLevel(adjustedScore);
    const nextThreshold = this.getNextThreshold(adjustedScore);
    
    // 投票範囲を判定
    const votingScope = this.getVotingScope(adjustedScore);
    
    // エスカレーション可能かチェック
    const canEscalate = this.checkEscalationEligibility(adjustedScore, category);
    
    return {
      id: proposalId,
      title,
      currentScore: adjustedScore,
      currentLevel: currentLevel?.level || '検討中',
      nextThreshold: nextThreshold?.minScore || 0,
      nextLevel: nextThreshold?.level || '最高レベル到達',
      progress: this.calculateProgress(adjustedScore, currentLevel, nextThreshold),
      votingScope,
      canEscalate
    };
  }

  /**
   * 部署規模による調整
   */
  private adjustScoreByDepartmentSize(score: number, departmentSize: number): number {
    let adjustment: number;
    
    if (departmentSize <= 5) {
      adjustment = this.sizeAdjustments.small;
    } else if (departmentSize <= 15) {
      adjustment = this.sizeAdjustments.medium;
    } else if (departmentSize <= 30) {
      adjustment = this.sizeAdjustments.large;
    } else {
      adjustment = this.sizeAdjustments.xlarge;
    }
    
    // 調整後スコア = 実スコア / 調整係数
    // 小規模部署ほど低いスコアで昇格しやすくなる
    return Math.round(score / adjustment);
  }

  /**
   * 現在のレベルを取得
   */
  private getCurrentLevel(score: number): ProposalThreshold | null {
    for (let i = this.thresholds.length - 1; i >= 0; i--) {
      if (score >= this.thresholds[i].minScore) {
        return this.thresholds[i];
      }
    }
    return null;
  }

  /**
   * 次の閾値を取得
   */
  private getNextThreshold(score: number): ProposalThreshold | null {
    for (const threshold of this.thresholds) {
      if (score < threshold.minScore) {
        return threshold;
      }
    }
    return null;
  }

  /**
   * 投票範囲を判定
   */
  private getVotingScope(score: number): string {
    if (score < 100) {
      return '部署内のみ';
    } else if (score < 600) {
      return '施設全体';
    } else {
      return '法人全体';
    }
  }

  /**
   * エスカレーション可否をチェック
   */
  private checkEscalationEligibility(score: number, category: string): boolean {
    // スコアが最初の閾値に達しているか
    if (score < this.thresholds[0].minScore) {
      return false;
    }
    
    // カテゴリが有効か
    const validCategories = [
      '医療安全', '患者ケア', '業務改善', '感染対策',
      'コミュニケーション', 'イノベーション', '戦略提案',
      'システム改善', 'コスト削減', '教育研修'
    ];
    
    return validCategories.includes(category);
  }

  /**
   * 進捗率を計算
   */
  private calculateProgress(
    score: number,
    current: ProposalThreshold | null,
    next: ProposalThreshold | null
  ): number {
    if (!current || !next) {
      return score >= 600 ? 100 : 0;
    }
    
    const range = next.minScore - current.minScore;
    const progress = score - current.minScore;
    
    return Math.min(Math.round((progress / range) * 100), 100);
  }

  /**
   * 委員会への議題提出判定
   */
  determineTargetCommittee(
    score: number,
    category: string,
    facility: string
  ): CommitteeInfo | null {
    
    // スコアが施設レベル（100点）に達していない場合は委員会提出不要
    if (score < 100) {
      return null;
    }
    
    // 施設に応じた委員会を選定
    if (facility !== '小原病院') {
      // 他施設は将来実装
      return null;
    }
    
    // カテゴリに最適な委員会を選定
    for (const committee of this.committees) {
      if (committee.targetCategories.some(cat => category.includes(cat))) {
        return committee;
      }
    }
    
    // デフォルトは運営委員会
    return this.committees.find(c => c.name === '小原病院運営委員会') || null;
  }

  /**
   * 議題書類の自動生成
   */
  async generateAgendaDocument(
    proposalId: string,
    proposalData: any,
    committee: CommitteeInfo
  ): Promise<AgendaDocument> {
    
    const template = this.getDocumentTemplate(committee.name);
    
    // テンプレートに提案内容を埋め込む
    const content = template
      .replace('{{proposal_id}}', proposalId)
      .replace('{{proposal_title}}', proposalData.title)
      .replace('{{proposal_background}}', proposalData.background || '')
      .replace('{{proposal_content}}', proposalData.content)
      .replace('{{expected_effect}}', proposalData.expectedEffect || '')
      .replace('{{required_budget}}', proposalData.budget || '未定')
      .replace('{{proposer}}', proposalData.proposer)
      .replace('{{department}}', proposalData.department)
      .replace('{{submission_date}}', new Date().toLocaleDateString('ja-JP'))
      .replace('{{committee_name}}', committee.name)
      .replace('{{committee_date}}', committee.schedule);
    
    return {
      proposalId,
      committeeId: committee.name,
      documentType: '議題提案書',
      content,
      generatedAt: new Date()
    };
  }

  /**
   * 文書テンプレート取得
   */
  private getDocumentTemplate(committeeName: string): string {
    // 委員会別のテンプレート
    const baseTemplate = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{committee_name}} 議題提案書
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

提案ID: {{proposal_id}}
提出日: {{submission_date}}
次回委員会: {{committee_date}}

【議題名】
{{proposal_title}}

【提案者】
{{proposer}} ({{department}})

【背景・現状の課題】
{{proposal_background}}

【提案内容】
{{proposal_content}}

【期待される効果】
{{expected_effect}}

【必要予算】
{{required_budget}}

【投票結果サマリー】
※VoiceDriveシステムより自動集計
- 総投票スコア: [システム自動入力]
- 賛成率: [システム自動入力]
- 主な賛成意見: [システム自動入力]
- 主な懸念事項: [システム自動入力]

【委員会での検討事項】
1. 実施可否の判断
2. 実施時期・スケジュール
3. 担当部署・責任者の決定
4. 予算承認
5. その他留意事項

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    return baseTemplate;
  }

  /**
   * エスカレーション通知
   */
  async notifyEscalation(
    proposalStatus: ProposalStatus,
    targetCommittee: CommitteeInfo | null
  ): Promise<void> {
    
    const notification = {
      type: 'PROPOSAL_ESCALATION',
      proposalId: proposalStatus.id,
      title: proposalStatus.title,
      newLevel: proposalStatus.currentLevel,
      score: proposalStatus.currentScore,
      committee: targetCommittee?.name || null,
      timestamp: new Date()
    };
    
    // 通知処理（実際の実装では通知サービスを呼び出す）
    console.log('[ProposalEscalation]', JSON.stringify(notification, null, 2));
    
    // 関係者へのメール/Slack通知
    // await this.notificationService.send(notification);
  }

  /**
   * スコア履歴の記録
   */
  recordScoreHistory(
    proposalId: string,
    score: number,
    level: string,
    adjustmentFactors: any
  ): void {
    
    const history = {
      proposalId,
      timestamp: new Date().toISOString(),
      score,
      level,
      adjustmentFactors,
      milestone: score >= 100 ? 'COMMITTEE_ELIGIBLE' : null
    };
    
    // データベースへの保存（実装時）
    console.log('[ScoreHistory]', JSON.stringify(history, null, 2));
  }
}

// シングルトンインスタンス
export const proposalEscalationEngine = new ProposalEscalationEngine();