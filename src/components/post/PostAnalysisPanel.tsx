/**
 * PostAnalysisPanel
 *
 * 投稿のモードに応じて適切な分析パネルを表示する親コンポーネント
 * - 議題モード: DiscussionAnalysisPanel
 * - プロジェクト化モード: ProjectProgressPanel
 */

import React, { useMemo } from 'react';
import { Post, DiscussionAnalysisData, ProjectAnalysisData } from '../../types';
import { usePostMode } from '../../hooks/usePostMode';
import DiscussionAnalysisPanel from './DiscussionAnalysisPanel';
import ProjectProgressPanel from './ProjectProgressPanel';

interface PostAnalysisPanelProps {
  post: Post;
}

/**
 * 議題モード用のデータを生成する
 * TODO: 実際のプロジェクトでは、APIから取得するか、より複雑な計算ロジックを実装
 */
function generateDiscussionData(post: Post): DiscussionAnalysisData {
  // 投票データの集計
  const votes = post.votes;
  const totalVotes =
    votes['strongly-support'] +
    votes.support +
    votes.neutral +
    votes.oppose +
    votes['strongly-oppose'];

  const supportCount = votes['strongly-support'] + votes.support;
  const opposeCount = votes['strongly-oppose'] + votes.oppose;

  const supportRate = totalVotes > 0 ? (supportCount / totalVotes) * 100 : 0;
  const opposeRate = totalVotes > 0 ? (opposeCount / totalVotes) * 100 : 0;

  // スコア計算（簡易版）
  const totalScore =
    votes['strongly-support'] * 50 +
    votes.support * 30 +
    votes.neutral * 10 -
    votes.oppose * 20 -
    votes['strongly-oppose'] * 40;

  // レベル判定
  let level = '個人レベル';
  let icon = '👤';
  if (totalScore >= 200) {
    level = '全社レベル';
    icon = '🏢🏢🏢';
  } else if (totalScore >= 150) {
    level = '施設レベル';
    icon = '🏢🏢';
  } else if (totalScore >= 100) {
    level = '部署レベル';
    icon = '🏢';
  }

  // 参加段階の判定
  let stage = '初期段階';
  if (totalVotes >= 30) {
    stage = '活発';
  } else if (totalVotes >= 15) {
    stage = '成長中';
  }

  // 反対意見のサマリー生成
  const oppositionSummary =
    opposeCount > 0
      ? {
          totalOppositions: opposeCount,
          mainConcerns: [
            '予算確保の実現性（コスト増加への懸念）',
            '既存スタッフへの負担増の可能性',
          ],
        }
      : undefined;

  // 議論促進の問いかけ
  const discussionPrompts = [
    opposeCount > 0
      ? '予算面の懸念にどう応えられるか？（反対意見への対応）'
      : '実装時の具体的な課題や懸念は何か？',
    '段階的な導入の可能性は？（実現性を高めるために）',
    '他部署での成功事例はあるか？（説得力を高めるために）',
  ];

  // 次のマイルストーン
  const targetVotes = 20;
  const progressRate = Math.min((totalVotes / targetVotes) * 100, 100);

  return {
    voteDistribution: {
      stronglySupport: votes['strongly-support'],
      support: votes.support,
      neutral: votes.neutral,
      oppose: votes.oppose,
      stronglyOppose: votes['strongly-oppose'],
      supportRate,
      opposeRate,
    },
    scoreInfo: {
      totalScore,
      level,
      icon,
    },
    participation: {
      totalVotes,
      totalComments: post.comments.length,
      stage,
    },
    oppositionSummary,
    discussionPrompts,
    nextMilestone: {
      current: `あと${targetVotes - totalVotes}票で部署承認の目安（${targetVotes}票）に到達`,
      target: targetVotes,
      achieved: totalVotes,
      progressRate,
    },
  };
}

/**
 * プロジェクト化モード用のデータを生成する
 * TODO: 実際のプロジェクトでは、APIから取得するか、projectDetailsから計算
 */
function generateProjectData(post: Post): ProjectAnalysisData {
  // プロジェクト詳細からデータを生成（簡易版）
  const projectDetails = post.projectDetails;
  const projectStatus = post.projectStatus;

  // 進捗率の取得
  let progressRate = 35; // デフォルト
  if (typeof projectStatus !== 'string' && projectStatus?.progress) {
    progressRate = projectStatus.progress;
  }

  // 日数計算（簡易版）
  const totalDays = 45;
  const daysElapsed = Math.floor((totalDays * progressRate) / 100);
  const daysRemaining = totalDays - daysElapsed;

  // タスクサマリー（簡易版）
  const totalTasks = projectDetails?.milestones?.length || 20;
  const completedTasks = Math.floor(totalTasks * (progressRate / 100));
  const inProgressTasks = 5;
  const delayedTasks = 2;

  // フェーズ情報
  const phases = [
    { name: '要件定義', status: 'completed' as const, progress: 100 },
    { name: '人員配置検討', status: 'active' as const, progress: 60 },
    { name: '予算承認', status: 'pending' as const },
    { name: '試行運用', status: 'pending' as const },
  ];

  // 課題（簡易版）
  const issues = [
    {
      id: '1',
      priority: 'high' as const,
      title: '夜勤専従の追加採用が遅延',
      description: '人事部との調整が難航中',
      assignee: '看護部長',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      priority: 'medium' as const,
      title: '研修プログラム策定未完了',
      description: 'カリキュラム内容の調整中',
      assignee: '教育委員会',
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  ];

  // マイルストーン
  const milestones = [
    {
      id: '1',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      title: '夜勤シフト案の初稿完成',
      daysUntil: 5,
      status: 'upcoming' as const,
    },
    {
      id: '2',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      title: '予算最終承認',
      daysUntil: 10,
      status: 'normal' as const,
    },
    {
      id: '3',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      title: 'スタッフ説明会開催',
      daysUntil: 15,
      status: 'normal' as const,
    },
  ];

  // リソース情報
  const budget = {
    used: 2500000,
    total: 10000000,
    rate: 25,
  };

  const team = {
    size: projectDetails?.team?.length || 8,
    roles: ['看護師6名', '管理職2名'],
  };

  return {
    overallProgress: {
      progressRate,
      daysElapsed,
      totalDays,
      daysRemaining,
    },
    taskSummary: {
      completed: completedTasks,
      total: totalTasks,
      inProgress: inProgressTasks,
      delayed: delayedTasks,
    },
    currentPhase: phases.find((p) => p.status === 'active') || phases[0],
    phases,
    issues,
    milestones,
    resources: {
      budget,
      team,
    },
    updateInfo: {
      lastUpdated: new Date(),
      updateFrequency: '週次',
    },
  };
}

/**
 * PostAnalysisPanel コンポーネント
 *
 * 投稿のモードを判定し、適切な分析パネルを表示する
 */
export const PostAnalysisPanel: React.FC<PostAnalysisPanelProps> = ({ post }) => {
  // モード判定
  const { mode, isProject } = usePostMode(post);

  // データ生成
  const analysisData = useMemo(() => {
    if (isProject) {
      return { mode, projectData: generateProjectData(post) };
    } else {
      return { mode, discussionData: generateDiscussionData(post) };
    }
  }, [post, mode, isProject]);

  // モードに応じたパネルをレンダリング
  if (isProject && analysisData.projectData) {
    return <ProjectProgressPanel post={post} data={analysisData.projectData} />;
  }

  if (analysisData.discussionData) {
    return <DiscussionAnalysisPanel post={post} data={analysisData.discussionData} />;
  }

  // フォールバック（通常は到達しない）
  return null;
};

export default PostAnalysisPanel;
