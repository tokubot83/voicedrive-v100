import { useState } from 'react';
import Header from './Header';
import VotingSection from './VotingSection';
import AuthorityDashboard from './authority/AuthorityDashboard';
import PersonalDashboard from './dashboards/PersonalDashboard';
import { Post, VoteOption, User } from '../types';
import TeamLeaderDashboard from './dashboards/TeamLeaderDashboard';
import DepartmentDashboard from './dashboards/DepartmentDashboard';
import FacilityDashboard from './dashboards/FacilityDashboard';
import HRManagementDashboard from './dashboards/HRManagementDashboard';
import StrategicDashboard from './dashboards/StrategicDashboard';
import CorporateDashboard from './dashboards/CorporateDashboard';
import ExecutiveLevelDashboard from './dashboards/ExecutiveLevelDashboard';
import { PostType } from '../types';
import { useTabContext } from './tabs/TabContext';
import { useDemoMode } from './demo/DemoModeController';
import { medicalSystemWebhook } from '../services/MedicalSystemWebhook';
import { useUser } from '../contexts/UserContext';
import { proposalEscalationEngine } from '../services/ProposalEscalationEngine';

interface MainContentProps {
  currentPage: string;
  selectedPostType: PostType;
  setSelectedPostType: (type: PostType) => void;
  toggleSidebar: () => void;
}

const MainContent = ({ currentPage, selectedPostType, setSelectedPostType, toggleSidebar }: MainContentProps) => {
  const { tabState, getFilteredPosts } = useTabContext();
  const { activeMainTab } = tabState;
  const { currentUser } = useDemoMode();
  const { user } = useUser(); // Phase 3: ユーザー情報取得

  // Sample post data for unified status display
  const samplePost: Post = {
    id: 'demo-1',
    type: 'improvement',
    content: 'リハビリ室の業務効率化のため、電子カルテシステムと連携した新しいスケジュール管理システムを導入したいです。これにより、患者の予約管理が自動化され、職員の負担が大幅に軽減されると考えています。',
    author: {
      id: 'user-1',
      name: '山田太郎',
      department: 'リハビリテーション科',
      role: '理学療法士'
    },
    anonymityLevel: 'real_name',
    priority: 'high',
    timestamp: new Date(),
    votes: {
      'strongly-oppose': 5,
      'oppose': 8,
      'neutral': 15,
      'support': 32,
      'strongly-support': 28
    },
    comments: [],
    projectStatus: 'active',
    // 議題モード用：委員会審議状況のデモデータ
    committeeStatus: 'committee_reviewing',
    committeeInfo: {
      committees: ['業務改善委員会', '医療安全委員会'],
      submissionDate: new Date('2025-10-15'),
      submittedBy: {
        id: 'facility-director-001',
        name: '施設長 佐藤次郎',
        permissionLevel: 7
      },
      note: '複数部署から高い支持を得ており、施設全体の業務改善につながる提案です。'
    },
    committeeDecision: {
      decision: 'pending',
      reason: '現在、業務改善委員会で詳細な実施計画を検討中です。次回委員会（10/25）で最終決定予定。',
      nextAction: '実施計画案の作成と予算見積もりの精査'
    },
    // 議題モード用：期限管理のデモデータ
    agendaDeadline: new Date('2025-12-31'), // 委員会審議中のため延長済み
    agendaDeadlineExtensions: 1,
    lastActivityDate: new Date('2025-10-20')
  };

  // Phase 3: 投票完了時のWebhook通知対応
  const handleVote = async (postId: string, option: VoteOption) => {
    console.log(`Voted ${option} on post ${postId}`);

    // TODO: 実際の投票処理を実装後、以下のロジックを有効化
    // 現在はデモ表示のため、実際の投票データ更新は未実装

    // Phase 3: 投票後の状態を仮計算（実際の実装では投票更新後のデータを使用）
    try {
      // 投票完了後の仮データ（実装時は実際のpost状態から取得）
      const simulatedVotingResult = {
        totalVotes: 15,
        currentScore: 75,
        supportRate: 73.3,
        participantCount: 12
      };

      // 議題レベルの判定（スコアベース）
      const getAgendaLevelFromScore = (score: number): string => {
        if (score >= 600) return '法人議題レベル';
        if (score >= 300) return '法人検討レベル';
        if (score >= 100) return '施設議題レベル';
        if (score >= 50) return '部署議題レベル';
        if (score >= 30) return '部署検討レベル';
        return '検討中レベル';
      };

      // Phase 3: 医療システムWebhook通知（投票完了）
      if (user) {
        const webhookSuccess = await medicalSystemWebhook.notifyVotingCompleted({
          proposalId: postId,
          totalVotes: simulatedVotingResult.totalVotes,
          currentScore: simulatedVotingResult.currentScore,
          agendaLevel: getAgendaLevelFromScore(simulatedVotingResult.currentScore),
          supportRate: simulatedVotingResult.supportRate,
          participantCount: simulatedVotingResult.participantCount
        });

        if (webhookSuccess) {
          console.log(`[Phase 3] 医療システムに投票完了を通知しました: ${postId}`);
        } else {
          console.warn(`[Phase 3] 投票完了通知に失敗: ${postId}`);
        }

        // Phase 3: エスカレーションチェック（スコア更新により議題レベルが上がった場合）
        const previousScore = 45; // 実装時は投票前のスコアを取得
        const escalationOccurred = await proposalEscalationEngine.checkAndTriggerEscalation(
          postId,
          previousScore,
          simulatedVotingResult.currentScore,
          user.staffId
        );

        if (escalationOccurred) {
          console.log(`[Phase 3] エスカレーション発生: ${postId}`);
        }
      }
    } catch (error) {
      console.error('[Phase 3] 投票Webhook通知エラー:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log(`Comment on post ${postId}`);
  };
  
  // フィルタリングされた投稿を取得
  const filteredPosts = getFilteredPosts();

  return (
    <div className="w-full h-full bg-black/20 backdrop-blur-lg">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="overflow-y-auto mt-24">
        {/* Home tab content - Unified Status Display */}
        {activeMainTab === 'home' && (
          <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-8 text-center">
                統一ステータス表示 & 投票UI最適化
              </h1>

              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  投稿の詳細表示
                </h2>

                {/* Post Content */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {samplePost.author.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{samplePost.author.name}</span>
                        <span className="text-blue-400 text-sm">@{samplePost.author.role}</span>
                      </div>
                      <div className="text-gray-400 text-sm">{samplePost.author.department}</div>
                    </div>
                  </div>
                  <p className="text-gray-100 leading-relaxed">{samplePost.content}</p>
                </div>

                {/* Voting Section */}
                <VotingSection
                  post={samplePost}
                  currentUser={currentUser}
                  onVote={handleVote}
                />
              </div>

              {/* Feature Highlights */}
              <div className="mt-8 space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-3">🔄 合意形成状況</h3>
                  <p className="text-gray-400">
                    直感的な円形プログレスバーで合意度を表示。専門職支持や世代別の関心度などのインサイトも提供。
                  </p>
                </div>
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-3">⚡ 承認プロセス</h3>
                  <p className="text-gray-400">
                    承認フローの進捗状況を視覚的に表示。現在の承認レベルと残り時間を一目で確認可能。
                  </p>
                </div>
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-3">🚀 プロジェクト進捗</h3>
                  <p className="text-gray-400">
                    プロジェクト化された案件の進捗状況、予算執行率、チーム情報などを統合表示。
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">✨ 新UIの特徴</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>感情的でわかりやすい5段階の投票ボタン（😠😕😐😊😍）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>投票分布をリアルタイムで可視化するカラフルなプログレスバー</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>展開可能な詳細情報で、必要な時だけ詳しい情報を表示</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>モバイルフレンドリーなレスポンシブデザイン</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Projects tab content */}
        
        {activeMainTab === 'projects' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">プロジェクト</h2>
            <div className="space-y-4">
              {filteredPosts
                .filter(post => post.enhancedProjectStatus)
                .map((post) => (
                  <div key={post.id} className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                    <VotingSection
                      post={post}
                      currentUser={currentUser}
                      onVote={handleVote}
                    />
                  </div>
                ))}
              {filteredPosts.filter(post => post.enhancedProjectStatus).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  プロジェクト化された投稿はまだありません
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 他のタブ内容 */}
        {activeMainTab === 'improvement' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">アイデアボイス</h2>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <VotingSection
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onVote={handleVote}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  該当する投稿がありません
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeMainTab === 'community' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">コミュニティ</h2>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <VotingSection
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onVote={handleVote}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  該当する投稿がありません
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeMainTab === 'whistleblowing' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">コンプライアンス窓口</h2>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <VotingSection
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onVote={handleVote}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  該当する投稿がありません
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeMainTab === 'urgent' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">緊急</h2>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <VotingSection
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onVote={handleVote}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  緊急の投稿はありません
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'analytics' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">分析</h2>
            <p className="text-gray-400">統計と分析データがここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'authority' && (
          <div className="p-6">
            <AuthorityDashboard />
          </div>
        )}
        
        {/* 役職別ダッシュボード */}
        {currentPage === 'dashboard-personal' && <PersonalDashboard />}
        {currentPage === 'dashboard-team-leader' && <TeamLeaderDashboard />}
        {currentPage === 'dashboard-department' && <DepartmentDashboard />}
        {currentPage === 'dashboard-facility' && <FacilityDashboard />}
        {currentPage === 'dashboard-hr-management' && <HRManagementDashboard />}
        {currentPage === 'dashboard-strategic' && <StrategicDashboard />}
        {currentPage === 'dashboard-corporate' && <CorporateDashboard />}
        {currentPage === 'dashboard-executive' && <ExecutiveLevelDashboard />}
        
        {currentPage === 'notifications' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">通知</h2>
            <p className="text-gray-400">通知がここに表示されます</p>
          </div>
        )}
        
        {currentPage === 'profile' && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">プロフィール</h2>
            <p className="text-gray-400">プロフィール情報がここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;