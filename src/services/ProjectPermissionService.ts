import { ProjectLevel } from '../types/visibility';
import { User } from '../types';

/**
 * プロジェクト承認権限タイプ
 */
export type ProjectPermissionRole = 'approver' | 'supervisor' | 'observer' | 'none';

/**
 * 投票グループ情報（組織構造拡張 2025-10-12）
 */
export interface VotingGroup {
  id: string;
  groupId: string;
  groupName: string;
  memberDepartmentIds: string[];
  primaryApproverId?: string | null;
  approverRotation?: {
    enabled: boolean;
    pattern: 'monthly' | 'quarterly' | 'project_based';
    members: string[];
    currentIndex?: number;
    lastRotated?: string;
  } | null;
  facilityCode: string;
}

/**
 * プロジェクト承認権限情報
 */
export interface ProjectPermission {
  canView: boolean;
  canApprove: boolean;  // プロジェクト開始承認
  canComment: boolean;
  canEmergencyOverride: boolean;
  canFormTeam: boolean;  // チーム編成権限
  role: ProjectPermissionRole;
  badge?: string;
  badgeColor?: string;
}

/**
 * プロジェクトレベルごとの承認責任範囲
 */
export interface ProjectResponsibility {
  projectLevel: ProjectLevel;
  minPermissionLevel: number;  // 最低必要レベル
  targetPermissionLevel: number;  // 本来の承認者レベル
  description: string;
  label: string;
  nextLevel?: ProjectLevel;
  nextLevelThreshold?: number;
}

/**
 * プロジェクトレベルごとの承認責任定義
 * 2025-10-11更新: 組織階層に合わせて権限レベルを調整
 */
export const PROJECT_RESPONSIBILITIES: ProjectResponsibility[] = [
  {
    projectLevel: 'PENDING',
    minPermissionLevel: 5,   // 副主任以上（代行）
    targetPermissionLevel: 6, // 主任
    description: 'アイデア段階の提案を確認',
    label: 'アイデア検討中 (0-99点)',
    nextLevel: 'TEAM',
    nextLevelThreshold: 100
  },
  {
    projectLevel: 'TEAM',
    minPermissionLevel: 7,   // 副師長以上（代行）
    targetPermissionLevel: 8, // 師長
    description: 'チームプロジェクトの開始を承認（5-15名規模）',
    label: 'チームプロジェクト (100-199点)',
    nextLevel: 'DEPARTMENT',
    nextLevelThreshold: 200
  },
  {
    projectLevel: 'DEPARTMENT',
    minPermissionLevel: 9,   // 副部長以上（代行）
    targetPermissionLevel: 10, // 部長
    description: '部署横断プロジェクトの開始を承認（15-30名規模）',
    label: '部署プロジェクト (200-399点)',
    nextLevel: 'FACILITY',
    nextLevelThreshold: 400
  },
  {
    projectLevel: 'FACILITY',
    minPermissionLevel: 11,  // 事務長（代行なし）
    targetPermissionLevel: 11, // 事務長
    description: '施設横断プロジェクトの開始を承認（30-60名規模）',
    label: '施設プロジェクト (400-799点)',
    nextLevel: 'ORGANIZATION',
    nextLevelThreshold: 800
  },
  {
    projectLevel: 'ORGANIZATION',
    minPermissionLevel: 12,  // 副院長以上（代行）
    targetPermissionLevel: 13, // 院長
    description: '法人プロジェクトの開始を承認（60名以上規模）',
    label: '法人プロジェクト (800点以上)'
  },
  {
    projectLevel: 'STRATEGIC',
    minPermissionLevel: 18,  // 理事長（代行なし）
    targetPermissionLevel: 18, // 理事長
    description: '戦略プロジェクトの承認',
    label: '戦略プロジェクト'
  }
];

/**
 * プロジェクト承認権限サービス
 */
class ProjectPermissionService {
  private static instance: ProjectPermissionService;

  private constructor() {}

  static getInstance(): ProjectPermissionService {
    if (!this.instance) {
      this.instance = new ProjectPermissionService();
    }
    return this.instance;
  }

  /**
   * プロジェクトレベルに対するユーザーの権限を取得
   * @param votingGroup 投票グループ情報（オプション）
   */
  getPermission(user: User, projectLevel: ProjectLevel, votingGroup?: VotingGroup | null): ProjectPermission {
    const userLevel = user.permissionLevel || 1;
    const responsibility = PROJECT_RESPONSIBILITIES.find(
      r => r.projectLevel === projectLevel
    );

    if (!responsibility) {
      return this.noPermission();
    }

    // 投票グループの承認者ロジック（2025-10-12追加）
    if (votingGroup) {
      return this.getVotingGroupPermission(user, projectLevel, votingGroup, responsibility);
    }

    // 承認者（プロジェクト開始を承認する権限）
    if (userLevel === responsibility.targetPermissionLevel) {
      return {
        canView: true,
        canApprove: true,
        canComment: true,
        canEmergencyOverride: false,
        canFormTeam: true,
        role: 'approver',
        badge: '✅ 承認者',
        badgeColor: 'bg-green-500/20 text-green-400 border-green-500'
      };
    }

    // 上位監督者（師長が副主任の承認するチームプロジェクトを見る）
    if (userLevel > responsibility.targetPermissionLevel) {
      // 1-2段階上（直属の上司）
      if (userLevel - responsibility.targetPermissionLevel <= 2) {
        return {
          canView: true,
          canApprove: false,
          canComment: true,  // アドバイス可能
          canEmergencyOverride: true,
          canFormTeam: false,
          role: 'supervisor',
          badge: '👁️ 上位者（閲覧・アドバイス）',
          badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
        };
      }

      // 3段階以上上
      return {
        canView: true,
        canApprove: false,
        canComment: false,
        canEmergencyOverride: true,
        canFormTeam: false,
        role: 'observer',
        badge: '📖 参考閲覧',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500'
      };
    }

    // フォールバック（下位承認者不在時）
    if (userLevel >= responsibility.minPermissionLevel &&
        userLevel < responsibility.targetPermissionLevel) {
      return {
        canView: true,
        canApprove: true,
        canComment: true,
        canEmergencyOverride: false,
        canFormTeam: true,
        role: 'approver',
        badge: `✅ 承認者（代行）`,
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500'
      };
    }

    // 下位閲覧（学習目的）
    if (userLevel < responsibility.targetPermissionLevel &&
        userLevel >= responsibility.minPermissionLevel - 2) {
      return {
        canView: true,
        canApprove: false,
        canComment: false,
        canEmergencyOverride: false,
        canFormTeam: false,
        role: 'observer',
        badge: '📖 参考閲覧（学習）',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500'
      };
    }

    return this.noPermission();
  }

  /**
   * ユーザーが承認可能なプロジェクトレベルのリストを取得
   */
  getApprovableLevels(user: User): ProjectResponsibility[] {
    const userLevel = user.permissionLevel || 1;

    return PROJECT_RESPONSIBILITIES.filter(r => {
      const permission = this.getPermission(user, r.projectLevel);
      return permission.canApprove;
    });
  }

  /**
   * ユーザーが閲覧可能なプロジェクトレベルのリストを取得
   */
  getViewableLevels(user: User): ProjectResponsibility[] {
    const userLevel = user.permissionLevel || 1;

    return PROJECT_RESPONSIBILITIES.filter(r => {
      const permission = this.getPermission(user, r.projectLevel);
      return permission.canView;
    });
  }

  /**
   * 権限なし
   */
  private noPermission(): ProjectPermission {
    return {
      canView: false,
      canApprove: false,
      canComment: false,
      canEmergencyOverride: false,
      canFormTeam: false,
      role: 'none'
    };
  }

  /**
   * プロジェクトレベルの責任情報を取得
   */
  getResponsibility(projectLevel: ProjectLevel): ProjectResponsibility | undefined {
    return PROJECT_RESPONSIBILITIES.find(r => r.projectLevel === projectLevel);
  }

  /**
   * スコアからプロジェクトレベルを判定
   */
  getProjectLevelFromScore(score: number): ProjectLevel {
    if (score >= 800) return 'ORGANIZATION';
    if (score >= 400) return 'FACILITY';
    if (score >= 200) return 'DEPARTMENT';
    if (score >= 100) return 'TEAM';
    return 'PENDING';
  }

  /**
   * 投票グループの承認者権限を取得（2025-10-12追加）
   *
   * 投票グループで複数部門を統合した場合の承認者ロジック
   * - primaryApproverId が指定されている場合: その人のみが承認者
   * - 他の部門長: 閲覧・助言のみ可能
   * - ローテーション設定がある場合: 現在の担当者を自動判定
   */
  private getVotingGroupPermission(
    user: User,
    projectLevel: ProjectLevel,
    votingGroup: VotingGroup,
    responsibility: ProjectResponsibility
  ): ProjectPermission {
    const userLevel = user.permissionLevel || 1;

    // ローテーション機能: 現在の承認者を判定
    let currentApproverId = votingGroup.primaryApproverId;

    if (votingGroup.approverRotation?.enabled) {
      const rotation = votingGroup.approverRotation;
      const currentIndex = rotation.currentIndex || 0;
      currentApproverId = rotation.members[currentIndex];
    }

    // 代表承認者（または現在のローテーション担当者）
    if (currentApproverId && user.id === currentApproverId) {
      return {
        canView: true,
        canApprove: true,
        canComment: true,
        canEmergencyOverride: false,
        canFormTeam: true,
        role: 'approver',
        badge: `✅ 代表承認者（${votingGroup.groupName}）`,
        badgeColor: 'bg-green-500/20 text-green-400 border-green-500'
      };
    }

    // グループメンバー部門長（承認者以外）
    // Level 10（部長）で、メンバー部門に所属している場合
    if (userLevel === responsibility.targetPermissionLevel &&
        user.department &&
        votingGroup.memberDepartmentIds.includes(user.department)) {
      return {
        canView: true,
        canApprove: false,  // 承認権限なし
        canComment: true,   // アドバイス・コメント可能
        canEmergencyOverride: false,
        canFormTeam: false,
        role: 'supervisor',
        badge: `👥 グループメンバー部長（閲覧・助言）`,
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500'
      };
    }

    // 上位監督者（事務長・院長など）
    if (userLevel > responsibility.targetPermissionLevel) {
      if (userLevel - responsibility.targetPermissionLevel <= 2) {
        return {
          canView: true,
          canApprove: false,
          canComment: true,
          canEmergencyOverride: true,
          canFormTeam: false,
          role: 'supervisor',
          badge: '👁️ 上位者（閲覧・アドバイス）',
          badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
        };
      }

      return {
        canView: true,
        canApprove: false,
        canComment: false,
        canEmergencyOverride: true,
        canFormTeam: false,
        role: 'observer',
        badge: '📖 参考閲覧',
        badgeColor: 'bg-gray-500/20 text-gray-400 border-gray-500'
      };
    }

    // 権限なし
    return this.noPermission();
  }

  /**
   * 投票グループのローテーションを実行（2025-10-12追加）
   * 月次/四半期/プロジェクトベースでの承認者ローテーション
   */
  rotateApprover(votingGroup: VotingGroup): VotingGroup {
    if (!votingGroup.approverRotation?.enabled) {
      return votingGroup;
    }

    const rotation = votingGroup.approverRotation;
    const nextIndex = ((rotation.currentIndex || 0) + 1) % rotation.members.length;

    return {
      ...votingGroup,
      approverRotation: {
        ...rotation,
        currentIndex: nextIndex,
        lastRotated: new Date().toISOString()
      }
    };
  }
}

export const projectPermissionService = ProjectPermissionService.getInstance();
export default projectPermissionService;
