/**
 * デモ用の議題提案書データを生成
 */

import { proposalDocumentGenerator } from '../services/ProposalDocumentGenerator';
import { Post, VoteOption } from '../types';

/**
 * デモ用の議題提案書を初期化
 */
export function initializeDemoProposalDocuments() {
  // 既にドキュメントがある場合はスキップ
  if (proposalDocumentGenerator.getAllDocuments().length > 0) {
    return;
  }

  console.log('[DemoData] 議題提案書のデモデータを生成中...');

  // デモ投稿1: 夜勤引継ぎ時間延長
  const demoPost1: Post = {
    id: 'demo-proposal-1',
    type: 'improvement',
    proposalType: 'operational',
    content: '夜勤の引継ぎ時間を15分延長して、より詳細な患者情報の共有をしたい',
    author: {
      id: 'user-101',
      name: '山田花子',
      department: '看護部',
      permissionLevel: 3
    },
    anonymityLevel: 'department_only',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    votes: {
      'strongly-support': 25,
      'support': 30,
      'neutral': 5,
      'oppose': 2,
      'strongly-oppose': 0
    } as Record<VoteOption, number>,
    comments: [
      {
        id: 'comment-1',
        postId: 'demo-proposal-1',
        content: '賛成です。安全性向上につながると思います。引継ぎの質が上がることで医療ミスも減らせるはずです。',
        author: {
          id: 'user-102',
          name: '佐藤太郎',
          department: '看護部'
        },
        commentType: 'support',
        anonymityLevel: 'department_only',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        likes: 12
      },
      {
        id: 'comment-2',
        postId: 'demo-proposal-1',
        content: '人員が足りない場合の対策も必要だと思います。延長分の人件費はどうするのでしょうか。',
        author: {
          id: 'user-103',
          name: '田中一郎',
          department: '看護部'
        },
        commentType: 'concern',
        anonymityLevel: 'department_only',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: 8
      },
      {
        id: 'comment-3',
        postId: 'demo-proposal-1',
        content: 'まずは試験的に1ヶ月実施してみて、効果を測定してはどうでしょうか。',
        author: {
          id: 'user-104',
          name: '鈴木美咲',
          department: '看護部'
        },
        commentType: 'proposal',
        anonymityLevel: 'department_only',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        likes: 15
      }
    ]
  };

  // デモ投稿2: 部署間情報共有ミーティング
  const demoPost2: Post = {
    id: 'demo-proposal-2',
    type: 'improvement',
    proposalType: 'communication',
    content: '部署間の情報共有を円滑にするため、週1回の合同ミーティングを提案します',
    author: {
      id: 'user-105',
      name: '高橋健一',
      department: '医療安全部',
      permissionLevel: 5
    },
    anonymityLevel: 'facility_department',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    votes: {
      'strongly-support': 15,
      'support': 25,
      'neutral': 8,
      'oppose': 3,
      'strongly-oppose': 1
    } as Record<VoteOption, number>,
    comments: [
      {
        id: 'comment-4',
        postId: 'demo-proposal-2',
        content: '情報共有は重要ですが、週1回だと負担が大きいかもしれません。月2回ではどうでしょうか。',
        author: {
          id: 'user-106',
          name: '伊藤優子',
          department: 'リハビリ部'
        },
        commentType: 'concern',
        anonymityLevel: 'department_only',
        timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        likes: 10
      }
    ]
  };

  // デモ投稿3: 電子カルテUI改善
  const demoPost3: Post = {
    id: 'demo-proposal-3',
    type: 'improvement',
    proposalType: 'innovation',
    content: '電子カルテの使いやすさを改善するため、UIの見直しを提案します。特に検索機能の改善が急務です。',
    author: {
      id: 'user-107',
      name: '渡辺聡',
      department: '情報システム部',
      permissionLevel: 6
    },
    anonymityLevel: 'facility_department',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    votes: {
      'strongly-support': 40,
      'support': 35,
      'neutral': 5,
      'oppose': 2,
      'strongly-oppose': 0
    } as Record<VoteOption, number>,
    comments: [
      {
        id: 'comment-5',
        postId: 'demo-proposal-3',
        content: '検索機能が本当に使いにくいです。患者名で検索してもヒットしないことがあります。',
        author: {
          id: 'user-108',
          name: '加藤由美',
          department: '医局'
        },
        commentType: 'support',
        anonymityLevel: 'department_only',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        likes: 25
      }
    ]
  };

  // 議題提案書を生成
  const demoUser = {
    id: 'demo-manager-1',
    name: '管理職デモユーザー',
    department: '看護部',
    permissionLevel: 7
  };

  try {
    // ドキュメント1: 下書き状態
    const doc1 = proposalDocumentGenerator.generateDocument(
      demoPost1,
      'DEPT_AGENDA',
      demoUser
    );
    console.log('[DemoData] ドキュメント1作成:', doc1.title);

    // ドキュメント2: レビュー中 + 補足情報追加
    const doc2 = proposalDocumentGenerator.generateDocument(
      demoPost2,
      'FACILITY_AGENDA',
      demoUser
    );
    proposalDocumentGenerator.updateDocument(
      doc2.id,
      {
        status: 'under_review',
        managerNotes: '月2回の実施から始めることで、現場の負担を軽減しながら効果を検証できると考えます。',
        recommendationLevel: 'recommend'
      },
      demoUser
    );
    console.log('[DemoData] ドキュメント2作成（レビュー中）:', doc2.title);

    // ドキュメント3: 提出準備完了
    const doc3 = proposalDocumentGenerator.generateDocument(
      demoPost3,
      'FACILITY_AGENDA',
      demoUser
    );
    proposalDocumentGenerator.updateDocument(
      doc3.id,
      {
        status: 'ready',
        managerNotes: '法人全体の業務効率化に大きく貢献する提案です。多くの職員から支持を得ており、早期の実施を推奨します。',
        additionalContext: 'ベンダーとの調整も完了しており、承認後すぐに改善作業に着手可能です。',
        recommendationLevel: 'strongly_recommend'
      },
      demoUser
    );
    console.log('[DemoData] ドキュメント3作成（提出準備完了）:', doc3.title);

    console.log('[DemoData] デモデータ生成完了');
  } catch (error) {
    console.error('[DemoData] デモデータ生成エラー:', error);
  }
}
