import React, { useState } from 'react';
import { useDemoMode } from '../components/demo/DemoModeController';
import { MedicalProfile } from '../types/profile';
import { PermissionLevel } from '../permissions/types/PermissionTypes';
import Timeline from '../components/Timeline';
import { User, Calendar, Building2, Briefcase, Award, Activity, FileText, TrendingUp } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { currentUser } = useDemoMode();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'stats'>('profile');

  // Create medical profile from current user data
  const profile: MedicalProfile = {
    id: currentUser.id,
    employeeNumber: 'EMP-2024-' + currentUser.id.slice(-3),
    name: currentUser.name,
    furigana: 'ふりがな',
    facility: 'kohara_hospital',
    department: currentUser.department || 'rehabilitation_ward',
    profession: 'physical_therapist',
    position: currentUser.position || 'member',
    hireDate: '2018-04-01',
    experienceYears: 6,
    previousExperience: 3,
    totalExperience: 9,
    motto: '患者さまの笑顔が私の原動力',
    selfIntroduction: '理学療法士として9年間、患者さまの機能回復をサポートしてきました。',
    hobbies: ['running', 'reading', 'cooking'],
    skills: ['脳血管リハビリ', 'チーム医療', '患者指導'],
    profileImage: currentUser.avatar,
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    votingWeight: 2.5 + (currentUser.permissionLevel || 1) * 0.5,
    permissionLevel: currentUser.permissionLevel || PermissionLevel.LEVEL_1,
    approvalAuthority: currentUser.permissionLevel >= 3 ? 'medium' : 'none',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    lastProfileUpdate: '2024-06-01T00:00:00Z',
    profileCompleteRate: 85
  };

  // Mock stats for activity section
  const stats = {
    totalPosts: 24,
    improvementPosts: 15,
    communityPosts: 6,
    reportPosts: 3,
    totalLikes: 156,
    totalComments: 89,
    activeProjects: 5,
    completedProjects: 12
  };

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div 
        className="h-48 relative"
        style={{ background: profile.coverImage }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Profile Header */}
      <div className="px-6 pb-6 -mt-20 relative">
        <div className="flex items-end gap-6">
          <img
            src={profile.profileImage}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-700"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=128`;
            }}
          />
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-gray-400 mt-1">{profile.position} • {profile.department}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Lv.{profile.permissionLevel}
              </span>
              <span className="text-gray-400">
                投票力: {profile.votingWeight.toFixed(1)}
              </span>
              <span className="text-gray-400">
                経験年数: {profile.totalExperience}年
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'profile'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            プロフィール
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'posts'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            投稿履歴
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'stats'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            活動統計
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                基本情報
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">職員番号</p>
                  <p className="text-white">{profile.employeeNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">入職日</p>
                  <p className="text-white">{new Date(profile.hireDate).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">施設</p>
                  <p className="text-white">小原病院</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">職種</p>
                  <p className="text-white">理学療法士</p>
                </div>
              </div>
            </div>

            {/* Motto & Introduction */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                座右の銘・自己紹介
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">座右の銘</p>
                  <p className="text-white italic">"{profile.motto}"</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">自己紹介</p>
                  <p className="text-white">{profile.selfIntroduction}</p>
                </div>
              </div>
            </div>

            {/* Skills & Hobbies */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                スキル・趣味
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">スキル</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">趣味</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.hobbies.map((hobby, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {hobby === 'running' ? 'ランニング' :
                         hobby === 'reading' ? '読書' :
                         hobby === 'cooking' ? '料理' : hobby}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                投稿履歴
              </h2>
              <p className="text-gray-400 mt-1">これまでの投稿一覧</p>
            </div>
            <Timeline activeTab="all" filterByUser={currentUser.id} />
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              活動統計
            </h2>

            {/* Post Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総投稿数</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalPosts}</p>
                <p className="text-xs text-gray-500 mt-1">全期間</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">改善提案</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.improvementPosts}</p>
                <p className="text-xs text-gray-500 mt-1">全体の{Math.round(stats.improvementPosts / stats.totalPosts * 100)}%</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総いいね数</p>
                <p className="text-3xl font-bold text-pink-400 mt-2">{stats.totalLikes}</p>
                <p className="text-xs text-gray-500 mt-1">平均 {Math.round(stats.totalLikes / stats.totalPosts)}/投稿</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <p className="text-gray-400 text-sm">総コメント数</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.totalComments}</p>
                <p className="text-xs text-gray-500 mt-1">平均 {Math.round(stats.totalComments / stats.totalPosts)}/投稿</p>
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">プロジェクト参加状況</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">進行中のプロジェクト</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.activeProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm">完了済みプロジェクト</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{stats.completedProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Chart Placeholder */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">月別活動推移</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>活動推移グラフ（実装予定）</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;