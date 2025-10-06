/**
 * 投稿管理ページ（再設計版）
 * 管理職が管轄の意見を整理し、議題提出をサポートする機能
 * 「審査者」ではなく「サポーター」として機能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../components/demo/DemoModeController';
import { Post, VoteOption, User } from '../types';
import { AgendaLevel } from '../types/committee';
import { useProjectScoring } from '../hooks/projects/useProjectScoring';
import { proposalPermissionService } from '../services/ProposalPermissionService';
import { proposalDocumentGenerator } from '../services/ProposalDocumentGenerator';
import { ProposalDocument } from '../types/proposalDocument';
import { initializeDemoProposalDocuments } from '../utils/demoProposalData';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import ProposalAnalysisCard from '../components/proposal/ProposalAnalysisCard';
import ProposalDocumentCard from '../components/proposal/ProposalDocumentCard';
import { Shield, Filter, LayoutGrid, List, FileText } from 'lucide-react';

export const ProposalManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const { currentUser: demoUser, isDemoMode } = useDemoMode();
  const activeUser = demoUser || authUser;

  const [selectedLevel, setSelectedLevel] = useState<AgendaLevel | 'all'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [documents, setDocuments] = useState<ProposalDocument[]>([]);
  const [filter, setFilter] = useState<'managed' | 'viewable'>('managed');
  const [viewMode, setViewMode] = useState<'analysis' | 'documents'>('analysis');
  const [markedCandidates, setMarkedCandidates] = useState<Set<string>>(new Set());

  const { calculateScore, convertVotesToEngagements } = useProjectScoring();

  // ユーザーの管轄レベルと閲覧可能レベルを取得
  const managedLevels = activeUser
    ? proposalPermissionService.getManagedLevels(activeUser)
    : [];
  const viewableLevels = activeUser
    ? proposalPermissionService.getViewableLevels(activeUser)
    : [];

  // データ取得
  useEffect(() => {
    if (activeUser) {
      // デモデータ初期化（初回のみ）
      initializeDemoProposalDocuments();

      loadProposals();
      loadDocuments();
    }
  }, [activeUser]);

  const loadProposals = () => {
    // TODO: 実際のAPI実装
    setPosts(getDemoPosts());
  };

  const loadDocuments = () => {
    // 全ドキュメントを取得（実際はユーザーに関連するもののみ）
    const allDocs = proposalDocumentGenerator.getAllDocuments();
    setDocuments(allDocs);
  };

  // 議題レベル取得
  const getAgendaLevel = (score: number): AgendaLevel => {
    if (score >= 600) return 'CORP_AGENDA';
    if (score >= 300) return 'CORP_REVIEW';
    if (score >= 100) return 'FACILITY_AGENDA';
    if (score >= 50) return 'DEPT_AGENDA';
    if (score >= 30) return 'DEPT_REVIEW';
    return 'PENDING';
  };

  // フィルタリングされた投稿
  const filteredPosts = posts.filter(post => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const agendaLevel = getAgendaLevel(currentScore);

    // レベルフィルター
    if (selectedLevel !== 'all' && agendaLevel !== selectedLevel) {
      return false;
    }

    // 権限フィルター
    if (activeUser) {
      const permission = proposalPermissionService.getPermission(activeUser, agendaLevel);

      if (filter === 'managed') {
        return permission.canEdit;
      } else {
        return permission.canView;
      }
    }

    return false;
  });

  // 投稿データの計算
  const getPostData = (post: Post) => {
    const currentScore = calculateScore(
      convertVotesToEngagements(post.votes || {}),
      post.proposalType
    );
    const agendaLevel = getAgendaLevel(currentScore);

    return {
      currentScore,
      agendaLevel
    };
  };

  // 議題候補マーク
  const handleMarkAsCandidate = (postId: string) => {
    setMarkedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // 議題提案書作成
  const handleCreateDocument = (post: Post) => {
    if (!activeUser) return;

    const postData = getPostData(post);
    const document = proposalDocumentGenerator.generateDocument(
      post,
      postData.agendaLevel,
      activeUser
    );

    console.log('議題提案書を作成しました:', document);

    // ドキュメント一覧を更新
    loadDocuments();

    // 議題提案書編集ページへ遷移
    navigate(`/proposal-document/${document.id}`);
  };

  if (!activeUser) {
    return <div>Loading...</div>;
  }

  // 統計データ
  const stats = {
    total: filteredPosts.length,
    marked: filteredPosts.filter(p => markedCandidates.has(p.id)).length,
    highSupport: filteredPosts.filter(p => {
      const totalVotes = Object.values(p.votes || {}).reduce((sum, count) => sum + count, 0);
      const supportVotes = (p.votes?.['strongly-support'] || 0) + (p.votes?.['support'] || 0);
      return totalVotes > 0 && (supportVotes / totalVotes) >= 0.7;
    }).length,
    documents: documents.length,
    documentsReady: documents.filter(d => d.status === 'ready').length
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 backdrop-blur-xl border border-blue-500/20 mb-6 m-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🤝</span>
          投稿管理 - 現場の声をサポート
        </h1>
        <p className="text-gray-300 mb-4">
          管轄範囲の提案を整理し、客観的なデータで議題提出をサポート
        </p>

        {/* 権限レベル表示 */}
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300">
            レベル {activeUser.permissionLevel} -
            管轄: {managedLevels.length}レベル、
            閲覧可能: {viewableLevels.length}レベル
          </span>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-blue-300">管轄範囲の投稿</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">{stats.marked}</div>
            <div className="text-xs text-yellow-300">議題候補マーク</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{stats.highSupport}</div>
            <div className="text-xs text-green-300">高支持率（70%以上）</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">{stats.documents}</div>
            <div className="text-xs text-purple-300">議題提案書作成済み</div>
          </div>
        </div>
      </div>

      {/* フィルターコントロール */}
      <div className="mx-6 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-white">フィルター</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 権限フィルター */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">表示範囲</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('managed')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'managed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ✏️ 管轄のみ
                </button>
                <button
                  onClick={() => setFilter('viewable')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'viewable'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  👁️ 全て
                </button>
              </div>
            </div>

            {/* レベルフィルター */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">議題レベル</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as AgendaLevel | 'all')}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのレベル</option>
                {(filter === 'managed' ? managedLevels : viewableLevels).map(level => (
                  <option key={level.agendaLevel} value={level.agendaLevel}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ビューモード切り替え */}
      <div className="mx-6 mb-6">
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-2">
          <button
            onClick={() => setViewMode('analysis')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base flex items-center justify-center gap-2 ${
              viewMode === 'analysis'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            データ分析モード
          </button>
          <button
            onClick={() => setViewMode('documents')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-base flex items-center justify-center gap-2 ${
              viewMode === 'documents'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-5 h-5" />
            議題提案書モード
          </button>
        </div>
      </div>

      {/* 投稿リスト */}
      <div className="mx-6 pb-24 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-400">
              {filter === 'managed'
                ? '管轄する提案がありません'
                : '閲覧可能な提案がありません'
              }
            </p>
          </div>
        ) : viewMode === 'analysis' ? (
          filteredPosts.map(post => {
            const postData = getPostData(post);
            return (
              <ProposalAnalysisCard
                key={post.id}
                post={post}
                agendaLevel={postData.agendaLevel}
                currentScore={postData.currentScore}
                onCreateDocument={() => handleCreateDocument(post)}
                onMarkAsCandidate={() => handleMarkAsCandidate(post.id)}
                isMarkedAsCandidate={markedCandidates.has(post.id)}
              />
            );
          })
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-400">
              議題提案書がまだありません
            </p>
            <p className="text-sm text-gray-500 mt-2">
              「データ分析モード」から議題提案書を作成してください
            </p>
          </div>
        ) : (
          documents.map(document => (
            <ProposalDocumentCard
              key={document.id}
              document={document}
              onEdit={(docId) => navigate(`/proposal-document/${docId}`)}
              onSubmitRequest={(docId) => {
                // TODO: 提出リクエスト処理
                alert('提出リクエスト機能は実装中です');
              }}
            />
          ))
        )}
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

// デモデータ取得関数
const getDemoPosts = (): Post[] => {
  return [
    {
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
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 12,
        'support': 18,
        'neutral': 3,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: [
        {
          id: 'comment-1',
          postId: 'demo-proposal-1',
          content: '賛成です。安全性向上につながると思います。',
          author: {
            id: 'user-102',
            name: '佐藤太郎',
            department: '看護部'
          },
          commentType: 'support',
          anonymityLevel: 'department_only',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          likes: 5
        },
        {
          id: 'comment-2',
          postId: 'demo-proposal-1',
          content: '人員が足りない場合の対策も必要だと思います。',
          author: {
            id: 'user-103',
            name: '田中一郎',
            department: '看護部'
          },
          commentType: 'concern',
          anonymityLevel: 'department_only',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          likes: 3
        }
      ]
    },
    {
      id: 'demo-proposal-2',
      type: 'improvement',
      proposalType: 'communication',
      content: '部署間の情報共有を円滑にするため、週1回の合同ミーティングを提案',
      author: {
        id: 'user-103',
        name: '鈴木一郎',
        department: '医療安全部',
        permissionLevel: 4
      },
      anonymityLevel: 'facility_department',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 5,
        'support': 8,
        'neutral': 2,
        'oppose': 0,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: []
    },
    {
      id: 'demo-proposal-3',
      type: 'improvement',
      proposalType: 'innovation',
      content: '電子カルテの使いやすさを改善するため、UIの見直しを提案します',
      author: {
        id: 'user-104',
        name: '高橋美咲',
        department: '情報システム部',
        permissionLevel: 4
      },
      anonymityLevel: 'facility_department',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      votes: {
        'strongly-support': 20,
        'support': 15,
        'neutral': 2,
        'oppose': 1,
        'strongly-oppose': 0
      } as Record<VoteOption, number>,
      comments: [
        {
          id: 'comment-3',
          postId: 'demo-proposal-3',
          content: '特に検索機能が使いにくいので改善してほしいです。',
          author: {
            id: 'user-105',
            name: '伊藤次郎',
            department: '医局'
          },
          commentType: 'proposal',
          anonymityLevel: 'department_only',
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          likes: 8
        }
      ]
    }
  ];
};

export default ProposalManagementPage;
