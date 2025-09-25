// 新設計対応の議題レベル別表示・権限制御システム
import { Post, User } from '../types';
import { PermissionLevel, SpecialPermissionLevel } from '../permissions/types/PermissionTypes';
import { hybridVotingSystem } from '../utils/HybridVotingSystem';
import { AgendaLevel } from '../types/committee';

export interface VisibilityPermissions {
  canView: boolean;           // 閲覧可能か
  canVote: boolean;          // 投票可能か
  canComment: boolean;       // コメント可能か
  visibilityScope: string;   // 表示範囲の説明
  permissionReason?: string; // 権限の理由（制限時）
}

export class AgendaVisibilityEngine {
  /**
   * 議題レベルに基づいた表示・権限制御
   */
  getPermissions(
    post: Post,
    currentUser: User,
    currentScore: number
  ): VisibilityPermissions {
    // 議題レベルの判定
    const agendaLevel = this.getAgendaLevel(currentScore);

    // ユーザーと投稿の関係を判定
    const relationship = this.getUserPostRelationship(post, currentUser);

    // 管理職判定（Lv.8以上）
    const isManager = this.isManagerOrAbove(currentUser);

    // レベルごとの権限制御
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
        return this.getCorporationPermissions(relationship);

      default:
        return this.getDefaultPermissions();
    }
  }

  /**
   * 検討中（0-29点）の権限
   */
  private getPendingPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): VisibilityPermissions {
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
   */
  private getDepartmentPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): VisibilityPermissions {
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
   */
  private getFacilityPermissions(
    relationship: UserPostRelationship,
    isManager: boolean
  ): VisibilityPermissions {
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
   */
  private getCorporationPermissions(
    relationship: UserPostRelationship
  ): VisibilityPermissions {
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
  private getDefaultPermissions(): VisibilityPermissions {
    return {
      canView: false,
      canVote: false,
      canComment: false,
      visibilityScope: '権限なし',
      permissionReason: 'システムエラー'
    };
  }

  /**
   * 議題レベルの判定
   */
  private getAgendaLevel(score: number): AgendaLevel {
    if (score >= 600) return 'CORP_AGENDA';
    if (score >= 300) return 'CORP_REVIEW';
    if (score >= 100) return 'FACILITY_AGENDA';
    if (score >= 50) return 'DEPT_AGENDA';
    if (score >= 30) return 'DEPT_REVIEW';
    return 'PENDING';
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
   * 投票範囲の説明テキストを取得
   */
  getVotingScopeDescription(agendaLevel: AgendaLevel): string {
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
   * UIに表示する権限制限メッセージ
   */
  getRestrictionMessage(permissions: VisibilityPermissions): string | null {
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

interface UserPostRelationship {
  isSameDepartment: boolean;
  isSameFacility: boolean;
  isSameCorporation: boolean;
}

// シングルトンインスタンス
export const agendaVisibilityEngine = new AgendaVisibilityEngine();