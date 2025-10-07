/**
 * 決定会議サービス
 * レベル13（院長・施設長）専用
 */

import {
  DecisionAgenda,
  DecisionMeetingStats,
  DecisionStatus,
  DecisionAgendaType,
  DecisionPriority
} from '../types/decisionMeeting';
import { User } from '../types';

class DecisionMeetingService {
  private agendas: Map<string, DecisionAgenda> = new Map();

  /**
   * 全議題を取得
   */
  getAllAgendas(): DecisionAgenda[] {
    return Array.from(this.agendas.values()).sort((a, b) => {
      // 優先度順
      const priorityOrder: Record<DecisionPriority, number> = {
        urgent: 1,
        high: 2,
        normal: 3,
        low: 4
      };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // 日付順
      return b.proposedDate.getTime() - a.proposedDate.getTime();
    });
  }

  /**
   * ステータス別に取得
   */
  getAgendasByStatus(status: DecisionStatus): DecisionAgenda[] {
    return this.getAllAgendas().filter(a => a.status === status);
  }

  /**
   * 審議待ち議題を取得
   */
  getPendingAgendas(): DecisionAgenda[] {
    return this.getAgendasByStatus('pending');
  }

  /**
   * 審議中議題を取得
   */
  getInReviewAgendas(): DecisionAgenda[] {
    return this.getAgendasByStatus('in_review');
  }

  /**
   * 今月決定された議題を取得
   */
  getThisMonthDecisions(): DecisionAgenda[] {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return this.getAllAgendas().filter(a => {
      if (!a.decidedDate) return false;
      const decidedDate = new Date(a.decidedDate);
      return decidedDate.getMonth() === thisMonth && decidedDate.getFullYear() === thisYear;
    });
  }

  /**
   * IDで取得
   */
  getAgendaById(id: string): DecisionAgenda | null {
    return this.agendas.get(id) || null;
  }

  /**
   * 統計情報を取得
   */
  getStats(): DecisionMeetingStats {
    const allAgendas = this.getAllAgendas();

    const byStatus = {
      pending: this.getAgendasByStatus('pending').length,
      in_review: this.getAgendasByStatus('in_review').length,
      approved: this.getAgendasByStatus('approved').length,
      rejected: this.getAgendasByStatus('rejected').length,
      deferred: this.getAgendasByStatus('deferred').length
    };

    const byType: Record<DecisionAgendaType, number> = {
      committee_proposal: 0,
      facility_policy: 0,
      personnel: 0,
      budget: 0,
      equipment: 0,
      other: 0
    };

    allAgendas.forEach(a => {
      byType[a.type]++;
    });

    const urgentCount = allAgendas.filter(a => a.priority === 'urgent').length;

    const thisMonthDecisions = this.getThisMonthDecisions().length;

    // 承認率
    const totalDecided = byStatus.approved + byStatus.rejected;
    const approvalRate = totalDecided > 0 ? (byStatus.approved / totalDecided) * 100 : 0;

    // 平均決定日数
    const decidedAgendas = allAgendas.filter(a => a.decidedDate);
    let totalDays = 0;
    decidedAgendas.forEach(a => {
      if (a.decidedDate) {
        const days = Math.floor(
          (a.decidedDate.getTime() - a.proposedDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDays += days;
      }
    });
    const averageDecisionDays = decidedAgendas.length > 0
      ? Math.round(totalDays / decidedAgendas.length)
      : 0;

    return {
      totalAgendas: allAgendas.length,
      pendingCount: byStatus.pending,
      approvedCount: byStatus.approved,
      rejectedCount: byStatus.rejected,
      deferredCount: byStatus.deferred,
      urgentCount,
      byType,
      thisMonthDecisions,
      approvalRate,
      averageDecisionDays
    };
  }

  /**
   * 議題を承認
   */
  approveAgenda(id: string, user: User, notes?: string): boolean {
    const agenda = this.agendas.get(id);
    if (!agenda) return false;

    agenda.status = 'approved';
    agenda.decision = 'approved';
    agenda.decidedDate = new Date();
    agenda.decidedBy = user.name;
    agenda.decisionNotes = notes;
    agenda.updatedAt = new Date();

    this.agendas.set(id, agenda);
    return true;
  }

  /**
   * 議題を却下
   */
  rejectAgenda(id: string, user: User, reason: string): boolean {
    const agenda = this.agendas.get(id);
    if (!agenda) return false;

    agenda.status = 'rejected';
    agenda.decision = 'rejected';
    agenda.decidedDate = new Date();
    agenda.decidedBy = user.name;
    agenda.decisionNotes = reason;
    agenda.updatedAt = new Date();

    this.agendas.set(id, agenda);
    return true;
  }

  /**
   * 議題を保留
   */
  deferAgenda(id: string, user: User, reason: string): boolean {
    const agenda = this.agendas.get(id);
    if (!agenda) return false;

    agenda.status = 'deferred';
    agenda.decision = 'deferred';
    agenda.decidedDate = new Date();
    agenda.decidedBy = user.name;
    agenda.decisionNotes = reason;
    agenda.updatedAt = new Date();

    this.agendas.set(id, agenda);
    return true;
  }

  /**
   * 議題を審議中に変更
   */
  startReview(id: string): boolean {
    const agenda = this.agendas.get(id);
    if (!agenda) return false;

    agenda.status = 'in_review';
    agenda.updatedAt = new Date();

    this.agendas.set(id, agenda);
    return true;
  }

  /**
   * デモデータを初期化
   */
  initializeDemoData(): void {
    this.agendas.clear();

    const now = new Date();

    // 議題1: 夜勤シフト体制見直し（承認済み）
    const agenda1: DecisionAgenda = {
      id: 'decision_001',
      title: '夜勤シフト体制の見直しと人員配置最適化',
      type: 'committee_proposal',
      description: '看護部からの提案。夜勤シフトを2交代から3交代に変更し、職員の負担軽減と医療安全の向上を図る。',
      background: '現場職員からのアイデアボイスが300点を超え、運営委員会で審議。委員会で全会一致で承認され、最終決定を求める。',
      proposedBy: '運営委員会（看護部提案）',
      proposedDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      proposerDepartment: '看護部',
      status: 'approved',
      priority: 'high',
      decidedDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      decidedBy: '徳留 幸輝（院長）',
      decision: 'approved',
      decisionNotes: '職員の健康と医療安全の両面から重要な施策。段階的に導入することを条件に承認。',
      impact: {
        departments: ['看護部', '医事課'],
        estimatedCost: 12000000,
        implementationPeriod: '3ヶ月',
        expectedEffect: '夜勤職員の負担軽減30%、インシデント発生率20%減少'
      },
      meetingMinutes: {
        attendees: ['徳留 幸輝（院長）', '田中 次郎（副院長）', '山田 花子（看護部長）'],
        discussion: '現状の2交代制による職員の疲労度が高い。3交代制への移行により、1回あたりの勤務時間を短縮し、休憩時間を確保できる。',
        concerns: ['初期コストの増加', '人員確保の課題'],
        conditions: ['パイロット病棟での試行', '3ヶ月後の効果測定', '職員満足度調査の実施']
      },
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      updatedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      tags: ['夜勤', 'シフト', '人員配置', '医療安全']
    };

    // 議題2: 電子カルテシステム刷新（審議中）
    const agenda2: DecisionAgenda = {
      id: 'decision_002',
      title: '電子カルテシステムの刷新と業務効率化',
      type: 'budget',
      description: '現行の電子カルテシステムの老朽化に伴う刷新。クラウド型システムへの移行により、業務効率化とペーパーレス化を推進。',
      background: '現行システムは導入から10年が経過し、動作が不安定。職員からの改善要望も多数寄せられている。',
      proposedBy: '運営委員会（情報システム部提案）',
      proposedDate: new Date(now.getFullYear(), now.getMonth(), 1),
      proposerDepartment: '情報システム部',
      status: 'in_review',
      priority: 'urgent',
      scheduledDate: new Date(now.getFullYear(), now.getMonth(), 25),
      impact: {
        departments: ['全部署'],
        estimatedCost: 50000000,
        implementationPeriod: '12ヶ月',
        expectedEffect: '業務時間30%削減、ペーパーレス化90%達成'
      },
      meetingMinutes: {
        attendees: ['徳留 幸輝（院長）', '田中 次郎（副院長）', '佐藤 太郎（情報システム部長）'],
        discussion: '予算規模が大きいため、複数ベンダーの比較検討が必要。段階的な導入計画の詳細を求める。',
        concerns: ['高額な初期投資', 'データ移行のリスク', '職員の習熟期間'],
        conditions: []
      },
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 20),
      tags: ['電子カルテ', 'DX', '予算', '業務効率化']
    };

    // 議題3: 新規診療科開設（審議待ち）
    const agenda3: DecisionAgenda = {
      id: 'decision_003',
      title: '緩和ケア科の新設と専門医の採用',
      type: 'facility_policy',
      description: '地域医療拠点化の一環として、緩和ケア科を新設。専門医2名と看護師5名の新規採用を含む。',
      background: '地域からの緩和ケアニーズが高まっており、近隣に対応できる施設が少ない。当院の強みとして打ち出したい。',
      proposedBy: '運営委員会（医局長提案）',
      proposedDate: new Date(now.getFullYear(), now.getMonth(), 10),
      proposerDepartment: '医局',
      status: 'pending',
      priority: 'normal',
      scheduledDate: new Date(now.getFullYear(), now.getMonth(), 30),
      impact: {
        departments: ['医局', '看護部', '医事課'],
        estimatedCost: 25000000,
        implementationPeriod: '6ヶ月',
        expectedEffect: '新規患者月間50名、地域連携施設10施設増'
      },
      createdAt: new Date(now.getFullYear(), now.getMonth(), 10),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 10),
      tags: ['診療科', '緩和ケア', '地域医療', '人員']
    };

    // 議題4: MRI装置更新（審議待ち）
    const agenda4: DecisionAgenda = {
      id: 'decision_004',
      title: 'MRI装置の更新と検査体制の強化',
      type: 'equipment',
      description: '老朽化したMRI装置を最新型に更新。撮影時間の短縮と画質向上により、患者満足度と診断精度の向上を図る。',
      background: '現行装置は15年使用しており、故障のリスクが高い。待ち時間も長く、患者からの苦情も増加している。',
      proposedBy: '運営委員会（放射線科提案）',
      proposedDate: new Date(now.getFullYear(), now.getMonth(), 15),
      proposerDepartment: '放射線科',
      status: 'pending',
      priority: 'high',
      scheduledDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      impact: {
        departments: ['放射線科', '医事課'],
        estimatedCost: 180000000,
        implementationPeriod: '4ヶ月',
        expectedEffect: '検査待ち時間50%短縮、画質向上、年間検査件数20%増'
      },
      createdAt: new Date(now.getFullYear(), now.getMonth(), 15),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 15),
      tags: ['設備投資', 'MRI', '医療機器', '画像診断']
    };

    // 議題5: 職員研修制度の拡充（保留）
    const agenda5: DecisionAgenda = {
      id: 'decision_005',
      title: '職員研修制度の拡充と外部研修支援',
      type: 'personnel',
      description: '職員のスキルアップ支援として、外部研修の補助制度を拡充。年間予算を増額し、受講枠を拡大。',
      background: '人材育成の重要性が高まる中、現行の研修制度では不十分との声が多い。',
      proposedBy: '運営委員会（人事部提案）',
      proposedDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      proposerDepartment: '人事部',
      status: 'deferred',
      priority: 'normal',
      decidedDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      decidedBy: '徳留 幸輝（院長）',
      decision: 'deferred',
      decisionNotes: '方向性は賛成だが、具体的な研修プログラムと費用対効果の詳細を再検討。次回会議で再提案を求める。',
      impact: {
        departments: ['全部署'],
        estimatedCost: 8000000,
        implementationPeriod: '12ヶ月',
        expectedEffect: '職員満足度向上、スキルレベル向上、離職率低減'
      },
      meetingMinutes: {
        attendees: ['徳留 幸輝（院長）', '高橋 健一（人事部長）'],
        discussion: '予算増額の根拠が不明確。どの研修にどれだけの効果があるのか、データが不足している。',
        concerns: ['費用対効果の不明確さ', '研修の選定基準'],
        conditions: []
      },
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      updatedAt: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      tags: ['研修', '人材育成', '職員支援']
    };

    this.agendas.set(agenda1.id, agenda1);
    this.agendas.set(agenda2.id, agenda2);
    this.agendas.set(agenda3.id, agenda3);
    this.agendas.set(agenda4.id, agenda4);
    this.agendas.set(agenda5.id, agenda5);
  }
}

// シングルトンインスタンス
export const decisionMeetingService = new DecisionMeetingService();
