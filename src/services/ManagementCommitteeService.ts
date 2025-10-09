/**
 * 運営委員会データ管理サービス
 * 議題、委員会、会議スケジュールの管理
 */

import { ManagementCommitteeAgenda, CommitteeData, CommitteeMember, MeetingSchedule } from '../types/committee';

export class ManagementCommitteeService {
  private static instance: ManagementCommitteeService;
  private agendas: Map<string, ManagementCommitteeAgenda> = new Map();
  private committees: Map<string, CommitteeData> = new Map();
  private members: Map<string, CommitteeMember> = new Map();
  private meetings: Map<string, MeetingSchedule> = new Map();

  private constructor() {
    this.initializeDemoData();
  }

  public static getInstance(): ManagementCommitteeService {
    if (!ManagementCommitteeService.instance) {
      ManagementCommitteeService.instance = new ManagementCommitteeService();
    }
    return ManagementCommitteeService.instance;
  }

  /**
   * デモデータ初期化
   */
  private initializeDemoData() {
    // 委員会データ
    const committeeList: CommitteeData[] = [
      {
        id: 'committee-1',
        name: '運営委員会',
        description: '病院運営の最高意思決定機関',
        memberCount: 12,
        chairperson: '院長',
        nextMeetingDate: new Date(2025, 9, 15),
        totalMeetings: 48,
        activeAgendas: 5
      },
      {
        id: 'committee-2',
        name: '医療安全委員会',
        description: '医療安全の推進と事故防止',
        memberCount: 10,
        chairperson: '副院長',
        nextMeetingDate: new Date(2025, 9, 12),
        totalMeetings: 52,
        activeAgendas: 3
      },
      {
        id: 'committee-3',
        name: '感染対策委員会',
        description: '院内感染の予防と対策',
        memberCount: 8,
        chairperson: '感染管理認定看護師',
        nextMeetingDate: new Date(2025, 9, 18),
        totalMeetings: 60,
        activeAgendas: 2
      },
      {
        id: 'committee-4',
        name: '教育委員会',
        description: '職員教育・研修の企画運営',
        memberCount: 7,
        chairperson: '看護部長',
        nextMeetingDate: new Date(2025, 9, 20),
        totalMeetings: 36,
        activeAgendas: 4
      },
      {
        id: 'committee-5',
        name: '業務改善委員会',
        description: '業務効率化と働き方改革',
        memberCount: 9,
        chairperson: '事務長',
        nextMeetingDate: new Date(2025, 9, 14),
        totalMeetings: 44,
        activeAgendas: 6
      },
      {
        id: 'committee-6',
        name: '倫理委員会',
        description: '医療倫理に関する審議',
        memberCount: 6,
        chairperson: '医局長',
        nextMeetingDate: new Date(2025, 9, 22),
        totalMeetings: 24,
        activeAgendas: 1
      },
      {
        id: 'committee-7',
        name: '災害対策委員会',
        description: '災害時の対応体制整備',
        memberCount: 8,
        chairperson: '副院長',
        nextMeetingDate: new Date(2025, 9, 25),
        totalMeetings: 28,
        activeAgendas: 2
      },
      {
        id: 'committee-8',
        name: '褥瘡対策委員会',
        description: '褥瘡予防とケアの推進',
        memberCount: 5,
        chairperson: '皮膚・排泄ケア認定看護師',
        nextMeetingDate: new Date(2025, 9, 19),
        totalMeetings: 40,
        activeAgendas: 1
      }
    ];

    committeeList.forEach(c => this.committees.set(c.id, c));

    // 議題データ
    const agendaList: ManagementCommitteeAgenda[] = [
      {
        id: 'agenda-1',
        title: '夜勤体制の見直しと人員配置最適化',
        agendaType: 'personnel',
        description: '夜勤帯の看護師配置を見直し、業務負担を軽減する',
        background: '夜勤帯の業務量が増加し、職員の疲労が蓄積している。投票システムで高評価を獲得した提案。',
        proposedBy: '看護部',
        proposedDate: new Date(2025, 8, 15),
        proposerDepartment: '看護部',
        relatedPostId: 'post-123',
        escalationSource: 'voting_system',
        status: 'approved',
        priority: 'high',
        scheduledDate: new Date(2025, 9, 15),
        actualReviewDate: new Date(2025, 8, 28),
        decidedDate: new Date(2025, 8, 28),
        decidedBy: '院長',
        decision: 'approved',
        decisionNotes: '2025年11月から試験運用開始。3ヶ月後に効果検証。',
        impactDepartments: ['看護部', '医事課'],
        estimatedCost: 500000,
        implementationPeriod: '2025年11月～',
        expectedEffect: '夜勤帯の業務効率化、職員満足度向上',
        tags: ['人員配置', '働き方改革', '夜勤'],
        createdAt: new Date(2025, 8, 15),
        updatedAt: new Date(2025, 8, 28)
      },
      {
        id: 'agenda-2',
        title: '電子カルテシステムのUI改善',
        agendaType: 'equipment',
        description: '電子カルテの操作性を改善し、入力時間を短縮',
        background: '現場から「操作が煩雑」との声が多数。部署議題から施設議題へ昇格。',
        proposedBy: '情報システム課',
        proposedDate: new Date(2025, 8, 20),
        proposerDepartment: '情報システム課',
        escalationSource: 'department_proposal',
        status: 'in_review',
        priority: 'high',
        scheduledDate: new Date(2025, 9, 15),
        impactDepartments: ['全部署'],
        estimatedCost: 2000000,
        implementationPeriod: '2026年1月～3月',
        expectedEffect: '入力時間30%削減、医療従事者の負担軽減',
        tags: ['電子カルテ', 'DX', '業務効率化'],
        createdAt: new Date(2025, 8, 20),
        updatedAt: new Date(2025, 9, 5)
      },
      {
        id: 'agenda-3',
        title: '職員食堂のメニュー拡充と営業時間延長',
        agendaType: 'facility_policy',
        description: '職員食堂のメニューを増やし、夜勤明けでも利用できるよう営業時間を延長',
        background: '職員アンケートで要望が多かった項目。満足度向上施策として提案。',
        proposedBy: '総務課',
        proposedDate: new Date(2025, 9, 1),
        proposerDepartment: '総務課',
        escalationSource: 'direct_submission',
        status: 'pending',
        priority: 'normal',
        scheduledDate: new Date(2025, 9, 15),
        impactDepartments: ['全職員'],
        estimatedCost: 300000,
        implementationPeriod: '2025年12月～',
        expectedEffect: '職員満足度向上、福利厚生の充実',
        tags: ['福利厚生', '職員満足度'],
        createdAt: new Date(2025, 9, 1),
        updatedAt: new Date(2025, 9, 1)
      },
      {
        id: 'agenda-4',
        title: '新人教育プログラムの見直し',
        agendaType: 'committee_proposal',
        description: 'プリセプター制度の強化と教育期間の延長',
        background: '新人の早期離職が課題。教育委員会から提案。',
        proposedBy: '教育委員会',
        proposedDate: new Date(2025, 8, 10),
        proposerDepartment: '看護部',
        status: 'approved',
        priority: 'urgent',
        decidedDate: new Date(2025, 8, 25),
        decidedBy: '院長',
        decision: 'approved',
        decisionNotes: '2026年度新人から適用。予算措置済み。',
        impactDepartments: ['看護部', '医事課', '人事課'],
        estimatedCost: 800000,
        implementationPeriod: '2026年4月～',
        expectedEffect: '新人定着率の向上、教育の質向上',
        tags: ['新人教育', '人材育成', '離職防止'],
        createdAt: new Date(2025, 8, 10),
        updatedAt: new Date(2025, 8, 25)
      },
      {
        id: 'agenda-5',
        title: '感染対策用備品の増設',
        agendaType: 'budget',
        description: 'N95マスク、防護服の備蓄を2倍に増やす',
        background: '感染症流行に備えた備蓄強化の必要性',
        proposedBy: '感染対策委員会',
        proposedDate: new Date(2025, 9, 2),
        proposerDepartment: '看護部',
        status: 'deferred',
        priority: 'high',
        scheduledDate: new Date(2025, 9, 15),
        decisionNotes: '予算確保後に再審議',
        impactDepartments: ['全部署'],
        estimatedCost: 1500000,
        implementationPeriod: '2026年度予算',
        expectedEffect: '感染症流行時の安全確保',
        tags: ['感染対策', '備蓄', '予算'],
        createdAt: new Date(2025, 9, 2),
        updatedAt: new Date(2025, 9, 5)
      },
      {
        id: 'agenda-6',
        title: '院内Wi-Fiの増強と5G対応',
        agendaType: 'equipment',
        description: '全エリアでの高速通信環境整備',
        background: 'タブレット端末導入に伴う通信環境の改善要望',
        proposedBy: '情報システム課',
        proposedDate: new Date(2025, 8, 25),
        proposerDepartment: '情報システム課',
        status: 'rejected',
        priority: 'normal',
        decidedDate: new Date(2025, 9, 5),
        decidedBy: '副院長',
        decision: 'rejected',
        decisionNotes: 'コスト対効果が不明確。現行設備で対応可能。',
        impactDepartments: ['全部署'],
        estimatedCost: 5000000,
        implementationPeriod: '未定',
        expectedEffect: '通信速度向上',
        tags: ['IT', '通信環境'],
        createdAt: new Date(2025, 8, 25),
        updatedAt: new Date(2025, 9, 5)
      }
    ];

    agendaList.forEach(a => this.agendas.set(a.id, a));

    // 会議スケジュール
    const meetingList: MeetingSchedule[] = [
      {
        id: 'meeting-1',
        committeeName: '運営委員会',
        date: new Date(2025, 9, 15, 14, 0),
        venue: '本館3F 会議室A',
        agendaCount: 3,
        status: 'scheduled'
      },
      {
        id: 'meeting-2',
        committeeName: '医療安全委員会',
        date: new Date(2025, 9, 12, 15, 30),
        venue: '本館2F 会議室B',
        agendaCount: 2,
        status: 'scheduled'
      },
      {
        id: 'meeting-3',
        committeeName: '業務改善委員会',
        date: new Date(2025, 9, 14, 16, 0),
        venue: '本館3F 会議室A',
        agendaCount: 4,
        status: 'scheduled'
      }
    ];

    meetingList.forEach(m => this.meetings.set(m.id, m));
  }

  /**
   * 議題一覧取得
   */
  public getAgendas(filters?: {
    status?: ManagementCommitteeAgenda['status'];
    priority?: ManagementCommitteeAgenda['priority'];
    agendaType?: ManagementCommitteeAgenda['agendaType'];
    searchQuery?: string;
  }): ManagementCommitteeAgenda[] {
    let result = Array.from(this.agendas.values());

    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }

    if (filters?.priority) {
      result = result.filter(a => a.priority === filters.priority);
    }

    if (filters?.agendaType) {
      result = result.filter(a => a.agendaType === filters.agendaType);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.proposedBy.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.proposedDate.getTime() - a.proposedDate.getTime());
  }

  /**
   * 委員会一覧取得
   */
  public getCommittees(): CommitteeData[] {
    return Array.from(this.committees.values())
      .sort((a, b) => b.activeAgendas - a.activeAgendas);
  }

  /**
   * 会議スケジュール取得
   */
  public getMeetings(month?: number, year?: number): MeetingSchedule[] {
    let result = Array.from(this.meetings.values());

    if (month !== undefined && year !== undefined) {
      result = result.filter(m =>
        m.date.getMonth() === month && m.date.getFullYear() === year
      );
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 統計情報取得
   */
  public getStats() {
    const agendas = Array.from(this.agendas.values());

    return {
      totalAgendas: agendas.length,
      pendingCount: agendas.filter(a => a.status === 'pending').length,
      inReviewCount: agendas.filter(a => a.status === 'in_review').length,
      approvedCount: agendas.filter(a => a.status === 'approved').length,
      rejectedCount: agendas.filter(a => a.status === 'rejected').length,
      deferredCount: agendas.filter(a => a.status === 'deferred').length,
      urgentCount: agendas.filter(a => a.priority === 'urgent').length,
      highCount: agendas.filter(a => a.priority === 'high').length,
      committeeCount: this.committees.size,
      upcomingMeetings: Array.from(this.meetings.values())
        .filter(m => m.date > new Date() && m.status === 'scheduled').length
    };
  }
}

export const managementCommitteeService = ManagementCommitteeService.getInstance();
