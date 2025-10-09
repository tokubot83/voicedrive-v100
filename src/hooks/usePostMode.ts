/**
 * usePostMode Hook
 *
 * 投稿のモード（議題モード / プロジェクト化モード）を判定し、
 * モード情報を提供するカスタムフック
 */

import { useMemo } from 'react';
import { Post } from '../types';
import { PostMode, PostModeInfo } from '../types/postMode';

/**
 * 投稿のモードを判定する関数
 *
 * プロジェクト化モードの判定基準:
 * 1. projectIdが存在する
 * 2. projectStatusが'active'または'ready'
 * 3. enhancedProjectStatusが存在する
 * 4. projectDetailsが存在する
 *
 * 上記のいずれかに該当しない場合は議題モード
 *
 * @param post - 判定対象の投稿
 * @returns モード情報
 */
export function detectPostMode(post: Post): PostModeInfo {
  // プロジェクトIDが存在する場合は確実にプロジェクト化モード
  if (post.projectId) {
    return createProjectModeInfo(post);
  }

  // projectStatusを確認
  if (post.projectStatus) {
    // 文字列の場合（レガシー対応）
    if (typeof post.projectStatus === 'string') {
      if (post.projectStatus === 'active' || post.projectStatus === 'ready') {
        return createProjectModeInfo(post);
      }
    }
    // オブジェクトの場合
    else if (
      post.projectStatus.stage === 'active' ||
      post.projectStatus.stage === 'ready'
    ) {
      return createProjectModeInfo(post);
    }
  }

  // enhancedProjectStatusが存在する場合
  if (post.enhancedProjectStatus) {
    return createProjectModeInfo(post);
  }

  // projectDetailsが存在する場合
  if (post.projectDetails) {
    return createProjectModeInfo(post);
  }

  // デフォルトは議題モード
  return {
    mode: 'discussion',
    isProject: false,
    isDiscussion: true,
  };
}

/**
 * プロジェクトモード情報を生成
 */
function createProjectModeInfo(post: Post): PostModeInfo {
  let progress: number | undefined;
  let stage: string | undefined;

  // プロジェクト進捗率の取得
  if (post.projectStatus && typeof post.projectStatus !== 'string') {
    progress = post.projectStatus.progress;
    stage = post.projectStatus.stage;
  } else if (post.enhancedProjectStatus) {
    progress = post.enhancedProjectStatus.resources?.completion;
    stage = post.enhancedProjectStatus.stage;
  }

  return {
    mode: 'project',
    isProject: true,
    isDiscussion: false,
    projectProgress: progress,
    projectStage: stage,
  };
}

/**
 * 投稿のモードを判定し、モード情報を返すカスタムフック
 *
 * @param post - 判定対象の投稿
 * @returns モード情報
 *
 * @example
 * const { mode, isProject, isDiscussion } = usePostMode(post);
 * if (isProject) {
 *   // プロジェクト化モードの処理
 * } else {
 *   // 議題モードの処理
 * }
 */
export function usePostMode(post: Post): PostModeInfo {
  return useMemo(() => detectPostMode(post), [
    post.projectId,
    post.projectStatus,
    post.enhancedProjectStatus,
    post.projectDetails,
  ]);
}

/**
 * 複数の投稿をモード別にフィルタリングするユーティリティ関数
 *
 * @param posts - 投稿の配列
 * @param mode - フィルタリングするモード
 * @returns フィルタリングされた投稿の配列
 */
export function filterPostsByMode(posts: Post[], mode: PostMode): Post[] {
  return posts.filter((post) => detectPostMode(post).mode === mode);
}

/**
 * 投稿リストをモード別にグループ化するユーティリティ関数
 *
 * @param posts - 投稿の配列
 * @returns モード別にグループ化された投稿
 */
export function groupPostsByMode(posts: Post[]): {
  discussion: Post[];
  project: Post[];
} {
  return posts.reduce(
    (acc, post) => {
      const { mode } = detectPostMode(post);
      acc[mode].push(post);
      return acc;
    },
    { discussion: [], project: [] } as { discussion: Post[]; project: Post[] }
  );
}
