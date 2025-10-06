import { AgendaLevel } from '../types/committee';
import { User } from '../types';

/**
 * 提案に対する権限タイプ
 */
export type ProposalPermissionRole = 'owner' | 'supervisor' | 'observer' | 'none';

/**
 * 提案権限情報
 */
export interface ProposalPermission {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canEmergencyOverride: boolean;
  role: ProposalPermissionRole;
  badge?: string;
  badgeColor?: string;
}

/**
 * 議題レベルごとの責任範囲
 */
export interface AgendaResponsibility {
  agendaLevel: AgendaLevel;
  minPermissionLevel: number;  // 最低必要レベル
  targetPermissionLevel: number;  // 本来の担当レベル
  description: string;
  label: string;
  targetCommittee: string;  // 提出先委員会
  nextLevel?: AgendaLevel;
  nextLevelThreshold?: number;
}

/**
 * 議題レベルごとの責任定義
 */
export const AGENDA_RESPONSIBILITIES: AgendaResponsibility[] = [
  {
    agendaLevel: 'PENDING',
    minPermissionLevel: 5,   // 副主任以上（いない場合は主任）
    targetPermissionLevel: 5,
    description: '検討中（様子見・提案書不要）',
    label: '検討中 (0-29点)',
    targetCommittee: 'なし（様子見）',
    nextLevel: 'DEPT_REVIEW',
    nextLevelThreshold: 30
  },
  {
    agendaLevel: 'DEPT_REVIEW',
    minPermissionLevel: 6,   // 主任以上
    targetPermissionLevel: 6,
    description: '部署内で議論するための提案書作成',
    label: '部署検討 (30-49点)',
    targetCommittee: '部署ミーティング',
    nextLevel: 'DEPT_AGENDA',
    nextLevelThreshold: 50
  },
  {
    agendaLevel: 'DEPT_AGENDA',
    minPermissionLevel: 8,   // 師長以上
    targetPermissionLevel: 8,
    description: '施設レベルで検討するための提案書作成',
    label: '部署議題 (50-99点)',
    targetCommittee: '施設運営委員会',
    nextLevel: 'FACILITY_AGENDA',
    nextLevelThreshold: 100
  },
  {
    agendaLevel: 'FACILITY_AGENDA',
    minPermissionLevel: 10,  // 部長以上
    targetPermissionLevel: 10,
    description: '法人レベルで検討するための提案書作成',
    label: '施設議題 (100-299点)',
    targetCommittee: '法人運営委員会',
    nextLevel: 'CORP_REVIEW',
    nextLevelThreshold: 300
  },
  {
    agendaLevel: 'CORP_REVIEW',
    minPermissionLevel: 12,  // 副院長以上
    targetPermissionLevel: 12,
    description: '理事会で検討するための提案書作成',
    label: '法人検討 (300-599点)',
    targetCommittee: '法人理事会',
    nextLevel: 'CORP_AGENDA',
    nextLevelThreshold: 600
  },
  {
    agendaLevel: 'CORP_AGENDA',
    minPermissionLevel: 13,  // 院長以上
    targetPermissionLevel: 13,
    description: '最終決定機関での審議のための提案書作成',
    label: '法人議題 (600点以上)',
    targetCommittee: '最終決定機関（理事会）'
  }
];

/**
 * 提案管理権限サービス
 */
class ProposalPermissionService {
  private static instance: ProposalPermissionService;

  private constructor() {}

  static getInstance(): ProposalPermissionService {
    if (!this.instance) {
      this.instance = new ProposalPermissionService();
    }
    return this.instance;
  }

  /**
   * 議題レベルに対するユーザーの権限を取得
   */
  getPermission(user: User, agendaLevel: AgendaLevel): ProposalPermission {
    const userLevel = user.permissionLevel || 1;
    const responsibility = AGENDA_RESPONSIBILITIES.find(
      r => r.agendaLevel === agendaLevel
    );

    if (!responsibility) {
      return this.noPermission();
    }

    // 専任担当者（主任が部署検討を管理）
    if (userLevel === responsibility.targetPermissionLevel) {
      return {
        canView: true,
        canEdit: true,
        canComment: true,
        canEmergencyOverride: false,
        role: 'owner',
        badge: '✏️ 担当者',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500'
      };
    }

    // 上位監督者（師長が部署検討・部署議題を見る）
    if (userLevel > responsibility.targetPermissionLevel) {
      // 1-2段階上（直属の上司）
      if (userLevel - responsibility.targetPermissionLevel <= 2) {
        return {
          canView: true,
          canEdit: false,
          canComment: true,  // アドバイス可能
          canEmergencyOverride: true,
          role: 'supervisor',
          badge: '👁️ 上位者（閲覧・アドバイス）',
          badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
        };
      }

      // 3段階以上上（部長が部署検討を見る）
      return {
        canView: true,
        canEdit: false,
        canComment: false,  // 直接介入しない
        canEmergencyOverride: true,
        role: 'observer',
        badge: '📖 参考閲覧',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500'
      };
    }

    // フォールバック（下位担当者不在時）
    if (userLevel >= responsibility.minPermissionLevel &&
        userLevel < responsibility.targetPermissionLevel) {
      return {
        canView: true,
        canEdit: true,
        canComment: true,
        canEmergencyOverride: false,
        role: 'owner',
        badge: `✏️ 担当者（代行）`,
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500'
      };
    }

    // 下位閲覧（主任が師長の施設議題判断を学ぶ）
    if (userLevel < responsibility.targetPermissionLevel &&
        userLevel >= responsibility.minPermissionLevel - 2) {
      return {
        canView: true,
        canEdit: false,
        canComment: false,
        canEmergencyOverride: false,
        role: 'observer',
        badge: '📖 参考閲覧（学習）',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500'
      };
    }

    return this.noPermission();
  }

  /**
   * ユーザーが管轄する議題レベルのリストを取得
   */
  getManagedLevels(user: User): AgendaResponsibility[] {
    const userLevel = user.permissionLevel || 1;

    return AGENDA_RESPONSIBILITIES.filter(r => {
      const permission = this.getPermission(user, r.agendaLevel);
      return permission.canEdit || permission.canComment;
    });
  }

  /**
   * ユーザーが閲覧可能な議題レベルのリストを取得
   */
  getViewableLevels(user: User): AgendaResponsibility[] {
    const userLevel = user.permissionLevel || 1;

    return AGENDA_RESPONSIBILITIES.filter(r => {
      const permission = this.getPermission(user, r.agendaLevel);
      return permission.canView;
    });
  }

  /**
   * 権限なし
   */
  private noPermission(): ProposalPermission {
    return {
      canView: false,
      canEdit: false,
      canComment: false,
      canEmergencyOverride: false,
      role: 'none'
    };
  }

  /**
   * 議題レベルの責任情報を取得
   */
  getResponsibility(agendaLevel: AgendaLevel): AgendaResponsibility | undefined {
    return AGENDA_RESPONSIBILITIES.find(r => r.agendaLevel === agendaLevel);
  }
}

export const proposalPermissionService = ProposalPermissionService.getInstance();
export default proposalPermissionService;
