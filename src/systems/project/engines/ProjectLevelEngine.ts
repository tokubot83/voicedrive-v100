// プロジェクトモード専用のレベル判定エンジン
import { ProjectLevel } from '../../../types/visibility';
import { Post, User } from '../../../types';
import { PermissionLevel } from '../../../permissions/types/PermissionTypes';

export interface ProjectPermissions {
  canView: boolean;
  canVote: boolean;
  canComment: boolean;
  canJoinTeam: boolean;
  visibilityScope: string;
  permissionReason?: string;
}

export interface UserProjectRelationship {
  isSameTeam: boolean;
  isSameDepartment: boolean;
  isSameFacility: boolean;
  isSameCorporation: boolean;
}

/**
 * プロジェクトモード専用のレベル判定エンジン
 * - チーム編成・組織一体感向上に特化したスコア閾値
 * - 段階的なプロジェクト化エスカレーション
 */
export class ProjectLevelEngine {

  /**
   * スコアからプロジェクトレベルを判定
   *
   * 閾値設計:
   * - 0-99点: 検討中（アイデア段階）
   * - 100-199点: チームプロジェクト（小規模チームで実施）
   * - 200-399点: 部署プロジェクト（部署全体で実施）
   * - 400-799点: 施設プロジェクト（施設横断で実施）
   * - 800点以上: 法人プロジェクト（法人全体で実施）
   */
  getProjectLevel(score: number): ProjectLevel {
    if (score >= 800) return 'ORGANIZATION';  // 法人プロジェクト
    if (score >= 400) return 'FACILITY';      // 施設プロジェクト
    if (score >= 200) return 'DEPARTMENT';    // 部署プロジェクト
    if (score >= 100) return 'TEAM';          // チームプロジェクト
    return 'PENDING';                          // 検討中
  }

  /**
   * プロジェクトレベルに応じた閲覧・投票・コメント・参加権限を判定
   */
  getProjectPermissions(
    post: Post,
    currentUser: User,
    currentScore: number
  ): ProjectPermissions {
    const projectLevel = this.getProjectLevel(currentScore);
    const relationship = this.getUserProjectRelationship(post, currentUser);
    const isManager = this.isManagerOrAbove(currentUser);

    switch (projectLevel) {
      case 'PENDING':
        return this.getPendingPermissions(relationship);

      case 'TEAM':
        return this.getTeamPermissions(relationship, isManager);

      case 'DEPARTMENT':
        return this.getDepartmentPermissions(relationship, isManager);

      case 'FACILITY':
        return this.getFacilityPermissions(relationship);

      case 'ORGANIZATION':
      case 'STRATEGIC':
        return this.getOrganizationPermissions();

      default:
        return this.getDefaultPermissions();
    }
  }

  /**
   * 検討中（0-99点）の権限
   * - 同じ部署内のみ閲覧・投票・コメント可能
   */
  private getPendingPermissions(
    relationship: UserProjectRelationship
  ): ProjectPermissions {
    const isSameDept = relationship.isSameDepartment;

    return {
      canView: isSameDept,
      canVote: isSameDept,
      canComment: isSameDept,
      canJoinTeam: isSameDept,
      visibilityScope: '部署内のみ',
      permissionReason: !isSameDept ? 'まだアイデア段階のため他部署からは見えません' : undefined
    };
  }

  /**
   * チームプロジェクト（100-199点）の権限
   * - 同じ部署内全員が投票・コメント可能
   * - 同じ施設の管理職は閲覧可能
   */
  private getTeamPermissions(
    relationship: UserProjectRelationship,
    isManager: boolean
  ): ProjectPermissions {
    const isSameDept = relationship.isSameDepartment;
    const isSameFacility = relationship.isSameFacility;

    return {
      canView: isSameDept || (isManager && isSameFacility),
      canVote: isSameDept,
      canComment: isSameDept,
      canJoinTeam: isSameDept,
      visibilityScope: '部署内全員（管理職は施設内閲覧可）',
      permissionReason: !isSameDept ? 'チームプロジェクトのため部署外は投票不可' : undefined
    };
  }

  /**
   * 部署プロジェクト（200-399点）の権限
   * - 同じ部署内全員が参加・投票・コメント可能
   * - 同じ施設内は閲覧とコメント可能
   */
  private getDepartmentPermissions(
    relationship: UserProjectRelationship,
    isManager: boolean
  ): ProjectPermissions {
    const isSameDept = relationship.isSameDepartment;
    const isSameFacility = relationship.isSameFacility;

    return {
      canView: isSameFacility,
      canVote: isSameDept,
      canComment: isSameFacility,
      canJoinTeam: isSameDept,
      visibilityScope: '施設内閲覧可（投票は部署内のみ）',
      permissionReason: !isSameDept && isSameFacility ? '部署外のため投票不可、コメントは可能' : !isSameFacility ? '他施設のため閲覧不可' : undefined
    };
  }

  /**
   * 施設プロジェクト（400-799点）の権限
   * - 施設内全員が参加・投票・コメント可能
   * - 他施設は閲覧のみ
   */
  private getFacilityPermissions(
    relationship: UserProjectRelationship
  ): ProjectPermissions {
    const isSameFacility = relationship.isSameFacility;

    return {
      canView: true, // 他施設からも閲覧可能
      canVote: isSameFacility,
      canComment: isSameFacility,
      canJoinTeam: isSameFacility,
      visibilityScope: '施設内全員参加可（他施設は閲覧のみ）',
      permissionReason: !isSameFacility ? '他施設のプロジェクトのため閲覧のみ' : undefined
    };
  }

  /**
   * 法人・戦略プロジェクト（800点以上）の権限
   * - 法人内全員が参加・投票・コメント可能
   */
  private getOrganizationPermissions(): ProjectPermissions {
    return {
      canView: true,
      canVote: true,
      canComment: true,
      canJoinTeam: true,
      visibilityScope: '法人内全員参加可能',
      permissionReason: undefined
    };
  }

  /**
   * デフォルト権限（エラー時）
   */
  private getDefaultPermissions(): ProjectPermissions {
    return {
      canView: false,
      canVote: false,
      canComment: false,
      canJoinTeam: false,
      visibilityScope: '権限なし',
      permissionReason: 'システムエラー'
    };
  }

  /**
   * ユーザーとプロジェクトの関係を判定
   */
  private getUserProjectRelationship(post: Post, user: User): UserProjectRelationship {
    const isSameTeam = this.isSameTeam(post, user);
    const isSameDepartment = post.author.department === user.department;
    const isSameFacility = this.getFacility(post.author) === this.getFacility(user);
    const isSameCorporation = true; // 現時点では同一法人と仮定

    return {
      isSameTeam,
      isSameDepartment,
      isSameFacility,
      isSameCorporation
    };
  }

  /**
   * 同じチーム判定（チーム情報が実装されていない場合は同一部署として扱う）
   */
  private isSameTeam(post: Post, user: User): boolean {
    return post.author.department === user.department;
  }

  /**
   * 管理職判定（Lv.8以上）
   */
  private isManagerOrAbove(user: User): boolean {
    if (!user.permissionLevel) return false;
    return user.permissionLevel >= PermissionLevel.LEVEL_8;
  }

  /**
   * ユーザーの施設を判定
   */
  private getFacility(user: { department: string }): string {
    const facilityMap: Record<string, string> = {
      'リハビリテーション科': '立神リハビリテーション温泉病院',
      'リハビリテーション部': '立神リハビリテーション温泉病院',
      '医療療養病棟': '立神リハビリテーション温泉病院',
      '看護部': '立神リハビリテーション温泉病院',
      '経営管理': '立神リハビリテーション温泉病院',
      '温泉療法科': '立神リハビリテーション温泉病院',
      '医療情報部': '小原病院',
      '外来': '小原病院',
      '病棟': '小原病院',
      '事務部': '小原病院',
      '経営企画部': '本部',
      '人事部': '本部',
      '総務部': '本部'
    };

    return facilityMap[user.department] || '小原病院';
  }

  /**
   * プロジェクトレベルの説明テキストを取得
   */
  getProjectLevelDescription(projectLevel: ProjectLevel): string {
    const descriptions = {
      'PENDING': 'アイデア検討中',
      'TEAM': 'チームプロジェクト',
      'DEPARTMENT': '部署プロジェクト',
      'FACILITY': '施設横断プロジェクト',
      'ORGANIZATION': '法人プロジェクト',
      'STRATEGIC': '戦略プロジェクト'
    };

    return descriptions[projectLevel] || '';
  }

  /**
   * 次のレベルまでに必要なスコアを計算
   */
  getScoreToNextLevel(currentScore: number): { nextLevel: ProjectLevel; requiredScore: number } | null {
    const currentLevel = this.getProjectLevel(currentScore);

    const thresholds: { level: ProjectLevel; threshold: number }[] = [
      { level: 'TEAM', threshold: 100 },
      { level: 'DEPARTMENT', threshold: 200 },
      { level: 'FACILITY', threshold: 400 },
      { level: 'ORGANIZATION', threshold: 800 }
    ];

    for (const { level, threshold } of thresholds) {
      if (currentScore < threshold) {
        return {
          nextLevel: level,
          requiredScore: threshold - currentScore
        };
      }
    }

    return null; // 最高レベル到達済み
  }

  /**
   * UIに表示する権限制限メッセージ
   */
  getRestrictionMessage(permissions: ProjectPermissions): string | null {
    if (!permissions.canVote && permissions.canComment && permissions.canView) {
      return '💬 コメントのみ可能です（投票不可）';
    }
    if (!permissions.canVote && !permissions.canComment && permissions.canView) {
      return '📖 閲覧のみ可能です';
    }
    if (!permissions.canView) {
      return '🔒 このプロジェクトを表示する権限がありません';
    }
    return null;
  }

  /**
   * プロジェクト参加可能メッセージ
   */
  getJoinTeamMessage(permissions: ProjectPermissions, projectLevel: ProjectLevel): string | null {
    if (permissions.canJoinTeam) {
      const messages = {
        'TEAM': '👥 チームに参加できます',
        'DEPARTMENT': '🏢 部署プロジェクトに参加できます',
        'FACILITY': '🏥 施設プロジェクトに参加できます',
        'ORGANIZATION': '🌐 法人プロジェクトに参加できます',
        'STRATEGIC': '🎯 戦略プロジェクトに参加できます',
        'PENDING': ''
      };
      return messages[projectLevel] || '';
    }
    return null;
  }
}

// シングルトンインスタンス
export const projectLevelEngine = new ProjectLevelEngine();
