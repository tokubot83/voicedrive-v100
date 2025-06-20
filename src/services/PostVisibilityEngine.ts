// 投稿の段階的公開システム
import { 
  StakeholderGroup, 
  PostVisibilityScope, 
  PostDisplayConfig, 
  ProjectLevel, 
  UserScopeContext,
  EmergencyOverrideOption
} from '../types/visibility';
import { PermissionLevel, ProjectScope } from '../permissions/types/PermissionTypes';
import { Post, User } from '../types';

export class PostVisibilityEngine {
  
  /**
   * ユーザーと投稿の関係性を判定
   */
  getUserScope(post: Post, currentUser: User): StakeholderGroup {
    // 投稿者との関係性を段階的に確認
    if (this.isSameTeam(post, currentUser)) {
      return StakeholderGroup.SAME_TEAM;
    } else if (this.isSameDepartment(post, currentUser)) {
      return StakeholderGroup.SAME_DEPARTMENT;
    } else if (this.isSameFacility(post, currentUser)) {
      return StakeholderGroup.SAME_FACILITY;
    } else if (this.isSameOrganization(post, currentUser)) {
      return StakeholderGroup.SAME_ORGANIZATION;
    } else {
      return StakeholderGroup.ALL_USERS;
    }
  }
  
  /**
   * 投稿の現在のプロジェクトレベルを取得
   */
  getPostCurrentLevel(post: Post): ProjectLevel {
    // 既存のprojectStatusから判定
    if (post.projectStatus && typeof post.projectStatus === 'object') {
      const score = post.projectStatus.score;
      
      // スコアベースでレベル判定（組織規模調整は後で実装）
      if (score >= 800) return 'ORGANIZATION';
      if (score >= 400) return 'FACILITY';
      if (score >= 200) return 'DEPARTMENT';
      if (score >= 100) return 'TEAM';
    }
    
    return 'PENDING';
  }
  
  /**
   * 投稿の表示設定を決定
   */
  getDisplayConfig(post: Post, currentUser: User): PostDisplayConfig {
    const userScope = this.getUserScope(post, currentUser);
    const postLevel = this.getPostCurrentLevel(post);
    
    // 投票権限の判定
    const canVote = this.checkVotingEligibility(postLevel, userScope);
    const canComment = this.checkCommentEligibility(postLevel, userScope);
    
    // 緊急昇格権限の確認
    const emergencyOptions = this.getEmergencyOverrideOptions(currentUser, post);
    
    return {
      showVoteButtons: canVote,
      showCommentForm: canComment,
      showProjectStatus: true,
      showEmergencyOverride: emergencyOptions.length > 0,
      accessLevel: canVote ? 'full' : canComment ? 'limited' : 'view_only',
      upgradeNotification: this.getUpgradeMessage(post, userScope),
      emergencyOverrideOptions: emergencyOptions
    };
  }
  
  /**
   * 投票権限をチェック
   */
  private checkVotingEligibility(postLevel: ProjectLevel, userScope: StakeholderGroup): boolean {
    const votingRules: Record<ProjectLevel, StakeholderGroup[]> = {
      'PENDING': [StakeholderGroup.SAME_DEPARTMENT], // 部署内議論段階：同一部署のみ投票可能
      'TEAM': [StakeholderGroup.SAME_DEPARTMENT], // チームプロジェクトは昇格なし
      'DEPARTMENT': [StakeholderGroup.SAME_FACILITY], // 部署プロジェクト化後：施設内投票可能
      'FACILITY': [StakeholderGroup.SAME_ORGANIZATION], // 施設プロジェクト化後：法人内投票可能
      'ORGANIZATION': [StakeholderGroup.SAME_ORGANIZATION],
      'STRATEGIC': [StakeholderGroup.SAME_ORGANIZATION]
    };
    
    return votingRules[postLevel]?.includes(userScope) || false;
  }
  
  /**
   * コメント権限をチェック
   */
  private checkCommentEligibility(postLevel: ProjectLevel, userScope: StakeholderGroup): boolean {
    // コメントは投票権限と同じかより広い範囲
    const commentRules: Record<ProjectLevel, StakeholderGroup[]> = {
      'PENDING': [StakeholderGroup.SAME_DEPARTMENT], // 部署内議論段階：同一部署のみコメント可能
      'TEAM': [StakeholderGroup.SAME_DEPARTMENT],
      'DEPARTMENT': [StakeholderGroup.SAME_FACILITY], // 部署プロジェクト化後：施設内コメント可能
      'FACILITY': [StakeholderGroup.SAME_ORGANIZATION],
      'ORGANIZATION': [StakeholderGroup.SAME_ORGANIZATION],
      'STRATEGIC': [StakeholderGroup.SAME_ORGANIZATION]
    };
    
    return commentRules[postLevel]?.includes(userScope) || false;
  }
  
  /**
   * 緊急昇格オプションを取得
   */
  private getEmergencyOverrideOptions(currentUser: User, post: Post): EmergencyOverrideOption[] {
    const options: EmergencyOverrideOption[] = [];
    const userLevel = currentUser.permissionLevel || 1;
    
    // Level 7: ワークフローオーバーライド
    if (userLevel >= PermissionLevel.LEVEL_7) {
      options.push({
        targetLevel: ProjectScope.FACILITY,
        label: '🚨 緊急施設プロジェクト化',
        icon: '🚨',
        requiredLevel: PermissionLevel.LEVEL_7,
        requiresJustification: true,
        requiresPostActionReport: true
      });
    }
    
    // Level 8: エグゼクティブオーバーライド
    if (userLevel >= PermissionLevel.LEVEL_8) {
      options.push(
        {
          targetLevel: ProjectScope.FACILITY,
          label: '⚡ 施設プロジェクト化',
          icon: '⚡',
          requiredLevel: PermissionLevel.LEVEL_8,
          requiresJustification: false,
          requiresPostActionReport: false
        },
        {
          targetLevel: ProjectScope.ORGANIZATION,
          label: '🏢 法人プロジェクト化',
          icon: '🏢',
          requiredLevel: PermissionLevel.LEVEL_8,
          requiresJustification: false,
          requiresPostActionReport: false
        },
        {
          targetLevel: ProjectScope.STRATEGIC,
          label: '🎯 戦略プロジェクト化',
          icon: '🎯',
          requiredLevel: PermissionLevel.LEVEL_8,
          requiresJustification: false,
          requiresPostActionReport: false
        }
      );
    }
    
    return options;
  }
  
  /**
   * 昇格メッセージを生成
   */
  private getUpgradeMessage(post: Post, userScope: StakeholderGroup): string | undefined {
    const postLevel = this.getPostCurrentLevel(post);
    
    if (postLevel === 'DEPARTMENT' && userScope === StakeholderGroup.SAME_FACILITY) {
      return '🎉 部署プロジェクトに昇格しました！施設内職員の投票で施設プロジェクトを目指せます';
    } else if (postLevel === 'FACILITY' && userScope === StakeholderGroup.SAME_ORGANIZATION) {
      return '🎉 施設プロジェクトに昇格しました！法人内職員の投票で法人プロジェクトを目指せます';
    } else if (userScope === StakeholderGroup.SAME_FACILITY && postLevel === 'PENDING') {
      return '💭 この投稿は他部署での議論中です。部署プロジェクト化されると施設内で投票できるようになります。';
    } else if (userScope === StakeholderGroup.SAME_ORGANIZATION && postLevel === 'PENDING') {
      return '💭 この投稿は他施設での議論中です。プロジェクト化されると投票できるようになります。';
    }
    
    return undefined;
  }
  
  // 所属関係の判定ヘルパーメソッド
  private isSameTeam(post: Post, user: User): boolean {
    // チーム情報が実装されていない場合は同一部署として扱う
    return this.isSameDepartment(post, user);
  }
  
  private isSameDepartment(post: Post, user: User): boolean {
    return post.author.department === user.department;
  }
  
  private isSameFacility(post: Post, user: User): boolean {
    // 施設情報の取得（実装時に適切な方法で取得）
    const postFacility = this.getFacilityFromDepartment(post.author.department);
    const userFacility = this.getFacilityFromDepartment(user.department);
    return postFacility === userFacility;
  }
  
  private isSameOrganization(post: Post, user: User): boolean {
    // 同一法人内の場合（現在は全てtrueだが、将来的に複数法人対応時に使用）
    return true;
  }
  
  /**
   * 部署名から施設を判定（暫定実装）
   */
  private getFacilityFromDepartment(department: string): string {
    // 部署名から施設を推定（実際の実装では適切なマッピングテーブルを使用）
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
    
    return facilityMap[department] || '小原病院'; // デフォルト
  }
}

export default PostVisibilityEngine;