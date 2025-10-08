/**
 * 統合可視性エンジン
 * システムモードに応じて適切な可視性エンジンを自動選択
 */

import { Post, User } from '../types';
import { PostDisplayConfig } from '../types/visibility';
import { PostVisibilityEngine } from './PostVisibilityEngine';
import { AgendaVisibilityEngine } from './AgendaVisibilityEngine';
import { systemModeManager, SystemMode } from '../config/systemMode';

export class UnifiedVisibilityEngine {
  private projectEngine: PostVisibilityEngine;
  private agendaEngine: AgendaVisibilityEngine;

  constructor() {
    this.projectEngine = new PostVisibilityEngine();
    this.agendaEngine = new AgendaVisibilityEngine();
  }

  /**
   * システムモードに応じた表示設定を取得
   */
  getDisplayConfig(post: Post, currentUser: User): PostDisplayConfig {
    const currentMode = systemModeManager.getCurrentMode();

    if (currentMode === SystemMode.AGENDA) {
      // 議題モード: AgendaVisibilityEngineを使用
      return this.getAgendaDisplayConfig(post, currentUser);
    } else {
      // プロジェクト化モード: PostVisibilityEngineを使用
      return this.projectEngine.getDisplayConfig(post, currentUser);
    }
  }

  /**
   * 議題モード用の表示設定を取得
   */
  private getAgendaDisplayConfig(post: Post, currentUser: User): PostDisplayConfig {
    // スコアを取得
    const score = this.getPostScore(post);

    // AgendaVisibilityEngineから権限情報を取得
    const permissions = this.agendaEngine.getPermissions(post, currentUser, score);

    // PostDisplayConfig形式に変換
    return {
      showVoteButtons: permissions.canVote,
      showCommentForm: permissions.canComment,
      showProjectStatus: true,
      showEmergencyOverride: false, // 議題モードでは緊急昇格なし
      accessLevel: this.getAccessLevel(permissions.canVote, permissions.canComment, permissions.canView),
      canView: permissions.canView,
      viewRestrictionReason: permissions.permissionReason,
      upgradeNotification: undefined // 議題モードでは別途表示
    };
  }

  /**
   * アクセスレベルを判定
   */
  private getAccessLevel(
    canVote: boolean,
    canComment: boolean,
    canView: boolean
  ): 'full' | 'limited' | 'view_only' | 'no_access' {
    if (!canView) return 'no_access';
    if (canVote && canComment) return 'full';
    if (canComment) return 'limited';
    return 'view_only';
  }

  /**
   * 投稿からスコアを取得
   */
  private getPostScore(post: Post): number {
    if (post.projectStatus && typeof post.projectStatus === 'object') {
      return post.projectStatus.score || 0;
    }
    return 0;
  }

  /**
   * 現在のシステムモードを取得
   */
  getCurrentMode(): SystemMode {
    return systemModeManager.getCurrentMode();
  }

  /**
   * モード別の説明を取得
   */
  getModeDescription(): string {
    const mode = systemModeManager.getCurrentMode();

    if (mode === SystemMode.AGENDA) {
      return '📋 議題システムモード: 委員会提出を目指した段階的議題化';
    } else {
      return '🚀 プロジェクト化モード: チーム編成による協働的実装';
    }
  }
}

// シングルトンインスタンス
export const unifiedVisibilityEngine = new UnifiedVisibilityEngine();

export default unifiedVisibilityEngine;
