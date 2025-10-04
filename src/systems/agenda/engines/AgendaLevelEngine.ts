// 議題モード専用のレベル判定エンジン
import { AgendaLevel } from '../../../types/committee';
import { Post, User } from '../../../types';
import { PermissionLevel } from '../../../permissions/types/PermissionTypes';

export interface AgendaPermissions {
  canView: boolean;
  canVote: boolean;
  canComment: boolean;
  visibilityScope: string;
  permissionReason?: string;
}

export interface UserPostRelationship {
  isSameDepartment: boolean;
  isSameFacility: boolean;
  isSameCorporation: boolean;
}

/**
 * 議題モード専用のレベル判定エンジン
 * - 委員会活性化に特化したスコア閾値
 * - 段階的な議題エスカレーション
 */
export class AgendaLevelEngine {

  /**
   * スコアから議題レベルを判定
   *
   * 閾値設計:
   * - 0-29点: 検討中（部署内での初期議論）
   * - 30-49点: 部署検討（部署内での本格検討）
   * - 50-99点: 部署議題（部署の正式議題）
   * - 100-299点: 施設議題（委員会提出レベル）
   * - 300-599点: 法人検討（法人全体での検討）
   * - 600点以上: 法人議題（理事会提出レベル）
   */
  getAgendaLevel(score: number): AgendaLevel {
    if (score >= 600) return 'CORP_AGENDA';      // 理事会提出レベル
    if (score >= 300) return 'CORP_REVIEW';      // 法人検討
    if (score >= 100) return 'FACILITY_AGENDA';  // 委員会提出レベル
    if (score >= 50) return 'DEPT_AGENDA';       // 部署議題
    if (score >= 30) return 'DEPT_REVIEW';       // 部署検討
    return 'PENDING';                             // 検討中
  }

  /**
   * 議題レベルに応じた閲覧・投票・コメント権限を判定
   */
  getAgendaPermissions(
    post: Post,
    currentUser: User,
    currentScore: number
  ): AgendaPermissions {
    const agendaLevel = this.getAgendaLevel(currentScore);
    const relationship = this.getUserPostRelationship(post, currentUser);
    const isManager = this.isManagerOrAbove(currentUser);

    switch (agendaLevel) {
      case 'PENDING':
        return this.getPendingPermissions(relationship, isManager);

      case 'DEPT_REVIEW':
      case 'DEPT_AGENDA':
        return this.getDepartmentPermissions(relationship, isManager);

      case 'FACILITY_AGENDA':
        return this.getFacilityPermissions(relationship, isManager);

      case 'CORP_REVIEW':
      case 'CORP_AGENDA':
        return this.getCorporationPermissions();

      default:
        return this.getDefaultPermissions();
    }
  }

  /**
   * 検討中（0-29点）の権限
   * - 投稿者の部署内のみ閲覧・投票・コメント可能
   * - 管理職は閲覧のみ可能
   */
  private getPendingPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): AgendaPermissions {
    const isSameDept = relationship.isSameDepartment;

    return {
      canView: isSameDept || isManager,
      canVote: isSameDept,
      canComment: isSameDept,
      visibilityScope: '投稿者の部署内',
      permissionReason: !isSameDept ? '他部署の検討中案件のため' : undefined
    };
  }

  /**
   * 部署検討・部署議題（30-99点）の権限
   * - 部署内全員が投票・コメント可能
   * - 管理職は施設内閲覧可能
   */
  private getDepartmentPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): AgendaPermissions {
    const isSameDept = relationship.isSameDepartment;
    const isSameFacility = relationship.isSameFacility;

    return {
      canView: isSameDept || (isManager && isSameFacility),
      canVote: isSameDept,
      canComment: isSameDept,
      visibilityScope: '部署内全員（管理職は施設内閲覧可）',
      permissionReason: !isSameDept ? '他部署の議題のため投票・コメント不可' : undefined
    };
  }

  /**
   * 施設議題（100-299点）の権限
   * - 施設内全員が投票・コメント可能
   * - 他施設は閲覧のみ
   */
  private getFacilityPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): AgendaPermissions {
    const isSameFacility = relationship.isSameFacility;

    return {
      canView: true, // 他施設からも閲覧可能
      canVote: isSameFacility,
      canComment: isSameFacility,
      visibilityScope: '施設内全員投票可（他施設は閲覧のみ）',
      permissionReason: !isSameFacility ? '他施設の議題のため閲覧のみ' : undefined
    };
  }

  /**
   * 法人検討・法人議題（300点以上）の権限
   * - 法人内全員が投票・コメント可能
   */
  private getCorporationPermissions(): AgendaPermissions {
    return {
      canView: true,
      canVote: true,
      canComment: true,
      visibilityScope: '法人内全員',
      permissionReason: undefined
    };
  }

  /**
   * デフォルト権限（エラー時）
   */
  private getDefaultPermissions(): AgendaPermissions {
    return {
      canView: false,
      canVote: false,
      canComment: false,
      visibilityScope: '権限なし',
      permissionReason: 'システムエラー'
    };
  }

  /**
   * ユーザーと投稿の関係を判定
   */
  private getUserPostRelationship(post: Post, user: User): UserPostRelationship {
    const isSameDepartment = post.author.department === user.department;
    const isSameFacility = this.getFacility(post.author) === this.getFacility(user);
    const isSameCorporation = true; // 現時点では同一法人と仮定

    return {
      isSameDepartment,
      isSameFacility,
      isSameCorporation
    };
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
   * 議題レベルの説明テキストを取得
   */
  getAgendaLevelDescription(agendaLevel: AgendaLevel): string {
    const descriptions = {
      'PENDING': '部署内で検討中',
      'DEPT_REVIEW': '部署内で検討開始',
      'DEPT_AGENDA': '部署の正式議題',
      'FACILITY_AGENDA': '施設全体で検討（委員会提出レベル）',
      'CORP_REVIEW': '法人全体で検討開始',
      'CORP_AGENDA': '法人の正式議題（理事会提出レベル）'
    };

    return descriptions[agendaLevel] || '';
  }

  /**
   * 次のレベルまでに必要なスコアを計算
   */
  getScoreToNextLevel(currentScore: number): { nextLevel: AgendaLevel; requiredScore: number } | null {
    const currentLevel = this.getAgendaLevel(currentScore);

    const thresholds: { level: AgendaLevel; threshold: number }[] = [
      { level: 'DEPT_REVIEW', threshold: 30 },
      { level: 'DEPT_AGENDA', threshold: 50 },
      { level: 'FACILITY_AGENDA', threshold: 100 },
      { level: 'CORP_REVIEW', threshold: 300 },
      { level: 'CORP_AGENDA', threshold: 600 }
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
  getRestrictionMessage(permissions: AgendaPermissions): string | null {
    if (!permissions.canVote && permissions.canView) {
      return '📖 閲覧のみ可能です';
    }
    if (!permissions.canView) {
      return '🔒 この投稿を表示する権限がありません';
    }
    if (permissions.canVote && !permissions.canComment) {
      return '🗳️ 投票のみ可能です（コメント不可）';
    }
    return null;
  }
}

// シングルトンインスタンス
export const agendaLevelEngine = new AgendaLevelEngine();
