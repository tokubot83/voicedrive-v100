/**
 * 議題提案分析ユーティリティ
 * 投稿データから客観的な分析結果を生成
 */

import { Post, VoteOption, Comment } from '../types';
import { VoteAnalysis, CommentAnalysis, RelatedInfo } from '../types/proposalDocument';

/**
 * 投票データを分析
 */
export function analyzeVotes(post: Post): VoteAnalysis {
  const votes = post.votes || {};

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  if (totalVotes === 0) {
    return {
      totalVotes: 0,
      supportRate: 0,
      strongSupportRate: 0,
      oppositionRate: 0,
      neutralRate: 0
    };
  }

  const strongSupport = votes['strongly-support'] || 0;
  const support = votes['support'] || 0;
  const neutral = votes['neutral'] || 0;
  const oppose = votes['oppose'] || 0;
  const strongOppose = votes['strongly-oppose'] || 0;

  return {
    totalVotes,
    supportRate: Math.round(((strongSupport + support) / totalVotes) * 100),
    strongSupportRate: Math.round((strongSupport / totalVotes) * 100),
    oppositionRate: Math.round(((oppose + strongOppose) / totalVotes) * 100),
    neutralRate: Math.round((neutral / totalVotes) * 100),

    // TODO: 実際のデータから部署別・職位別の分析を実装
    byDepartment: generateDepartmentAnalysis(post),
    byPosition: generatePositionAnalysis(post),
    byStakeholder: generateStakeholderAnalysis(post)
  };
}

/**
 * 部署別投票分析（デモ実装）
 */
function generateDepartmentAnalysis(post: Post) {
  // TODO: 実際の投票データから部署別集計を実装
  const mockDepartments = ['看護部', '医局', '事務部', 'リハビリ部'];

  return mockDepartments.map(dept => {
    const totalDeptVotes = Math.floor(Math.random() * 20) + 5;
    const supportVotes = Math.floor(totalDeptVotes * (0.6 + Math.random() * 0.3));

    return {
      department: dept,
      votes: {
        'strongly-support': Math.floor(supportVotes * 0.4),
        'support': Math.floor(supportVotes * 0.6),
        'neutral': Math.floor((totalDeptVotes - supportVotes) * 0.7),
        'oppose': Math.floor((totalDeptVotes - supportVotes) * 0.25),
        'strongly-oppose': Math.floor((totalDeptVotes - supportVotes) * 0.05)
      } as Record<VoteOption, number>,
      supportRate: Math.round((supportVotes / totalDeptVotes) * 100)
    };
  });
}

/**
 * 職位別投票分析（デモ実装）
 */
function generatePositionAnalysis(post: Post) {
  // TODO: 実際の投票データから職位別集計を実装
  const positions = [
    { level: 1, name: '一般職員' },
    { level: 3, name: '中堅職員' },
    { level: 5, name: '主任・副主任' },
    { level: 7, name: '師長・管理職' }
  ];

  return positions.map(pos => {
    const totalPosVotes = Math.floor(Math.random() * 15) + 3;
    const supportVotes = Math.floor(totalPosVotes * (0.5 + Math.random() * 0.4));

    return {
      positionLevel: pos.level,
      positionName: pos.name,
      votes: {
        'strongly-support': Math.floor(supportVotes * 0.35),
        'support': Math.floor(supportVotes * 0.65),
        'neutral': Math.floor((totalPosVotes - supportVotes) * 0.6),
        'oppose': Math.floor((totalPosVotes - supportVotes) * 0.35),
        'strongly-oppose': Math.floor((totalPosVotes - supportVotes) * 0.05)
      } as Record<VoteOption, number>,
      supportRate: Math.round((supportVotes / totalPosVotes) * 100)
    };
  });
}

/**
 * ステークホルダー別投票分析
 */
function generateStakeholderAnalysis(post: Post) {
  if (!post.votesByStakeholder) return undefined;

  return Object.entries(post.votesByStakeholder).map(([category, votes]) => {
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const supportVotes = (votes['strongly-support'] || 0) + (votes['support'] || 0);

    return {
      category,
      votes,
      supportRate: totalVotes > 0 ? Math.round((supportVotes / totalVotes) * 100) : 0
    };
  });
}

/**
 * コメントを分析
 */
export function analyzeComments(post: Post): CommentAnalysis {
  const comments = post.comments || [];

  const supportComments = comments.filter(c => c.commentType === 'support').length;
  const concernComments = comments.filter(c => c.commentType === 'concern').length;
  const proposalComments = comments.filter(c => c.commentType === 'proposal').length;

  return {
    totalComments: comments.length,
    supportComments,
    concernComments,
    proposalComments,

    // 賛成意見の要約（上位3件）
    supportSummary: extractSupportSummary(comments),

    // 懸念点の要約（上位3件）
    concernSummary: extractConcernSummary(comments),

    // 建設的提案（上位3件）
    constructiveProposals: extractConstructiveProposals(comments),

    // 主要なコメント（いいね数上位）
    keyComments: extractKeyComments(comments)
  };
}

/**
 * 賛成意見を抽出
 */
function extractSupportSummary(comments: Comment[]): string[] {
  return comments
    .filter(c => c.commentType === 'support')
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3)
    .map(c => c.content);
}

/**
 * 懸念点を抽出
 */
function extractConcernSummary(comments: Comment[]): string[] {
  return comments
    .filter(c => c.commentType === 'concern')
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3)
    .map(c => c.content);
}

/**
 * 建設的提案を抽出
 */
function extractConstructiveProposals(comments: Comment[]): string[] {
  return comments
    .filter(c => c.commentType === 'proposal')
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3)
    .map(c => c.content);
}

/**
 * 主要なコメントを抽出（いいね数上位5件）
 */
function extractKeyComments(comments: Comment[]): CommentAnalysis['keyComments'] {
  return comments
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 5)
    .map(c => ({
      content: c.content,
      author: getAnonymizedAuthorName(c),
      type: c.commentType === 'support' ? 'support'
          : c.commentType === 'concern' ? 'concern'
          : 'proposal',
      likes: c.likes || 0
    }));
}

/**
 * 匿名化された著者名を取得
 */
function getAnonymizedAuthorName(comment: Comment): string {
  switch (comment.anonymityLevel) {
    case 'anonymous':
      return '匿名ユーザー';
    case 'department_only':
      return `${comment.author.department}の職員`;
    case 'facility_department':
      return `${comment.author.department}の職員`;
    case 'real_name':
      return comment.author.name;
    default:
      return '職員';
  }
}

/**
 * 関連情報を分析
 */
export function analyzeRelatedInfo(post: Post): RelatedInfo {
  // TODO: 実際のデータベースから類似議題を検索
  return {
    similarPastAgendas: [],
    affectedDepartments: identifyAffectedDepartments(post),
    references: []
  };
}

/**
 * 影響を受ける部署を特定
 */
function identifyAffectedDepartments(post: Post) {
  // TODO: 投稿内容から影響部署を自動判定
  // 現在はモックデータ
  return [
    {
      department: post.author.department,
      impactLevel: 'high' as const,
      description: '提案元の部署'
    }
  ];
}

/**
 * 提案の要約を生成（AI要約のモック）
 */
export function generateProposalSummary(post: Post): string {
  // TODO: 実際のAI要約APIを統合
  const content = post.content;

  // 簡易的な要約（最初の100文字）
  return content.length > 100
    ? content.substring(0, 100) + '...'
    : content;
}

/**
 * 背景・経緯を生成
 */
export function generateBackground(post: Post, voteAnalysis: VoteAnalysis): string {
  const date = new Date(post.timestamp).toLocaleDateString('ja-JP');

  return `${post.author.department}の職員から、${date}に提案されました。\n` +
    `現在、${voteAnalysis.totalVotes}名の職員から投票があり、` +
    `支持率${voteAnalysis.supportRate}%となっています。`;
}

/**
 * 期待される効果を生成
 */
export function generateExpectedEffects(post: Post, commentAnalysis: CommentAnalysis): string {
  if (commentAnalysis.supportSummary.length === 0) {
    return '職員からの具体的な効果の指摘はまだありません。';
  }

  return '職員から以下の効果が期待されています：\n' +
    commentAnalysis.supportSummary.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

/**
 * 懸念点を生成
 */
export function generateConcerns(commentAnalysis: CommentAnalysis): string {
  if (commentAnalysis.concernSummary.length === 0) {
    return '特に懸念点は指摘されていません。';
  }

  return '以下の懸念点が指摘されています：\n' +
    commentAnalysis.concernSummary.map((c, i) => `${i + 1}. ${c}`).join('\n');
}

/**
 * 対応策を生成
 */
export function generateCounterMeasures(commentAnalysis: CommentAnalysis): string {
  if (commentAnalysis.constructiveProposals.length === 0) {
    return '職員からの建設的な提案はまだありません。';
  }

  return '職員から以下の対応策が提案されています：\n' +
    commentAnalysis.constructiveProposals.map((p, i) => `${i + 1}. ${p}`).join('\n');
}
