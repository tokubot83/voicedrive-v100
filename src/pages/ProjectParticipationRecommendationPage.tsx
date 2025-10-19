/**
 * プロジェクト参加推奨ページ（Level 15+：人事各部門長以上）
 *
 * 職員のスキル・経験に基づいたプロジェクト参加推奨
 * - 参加率が低い職員への推奨プロジェクト提案
 * - スキルマッチング分析
 * - チーム多様性向上のための推奨
 * - プロジェクト経験の偏り是正
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Target, AlertCircle, Lightbulb, Award } from 'lucide-react';

type TabType = 'low_participation' | 'skill_match' | 'diversity' | 'experience_gap';

interface StaffRecommendation {
  staffId: string;
  name: string;
  department: string;
  profession: string;
  currentProjects: number;
  recommendedProjects: RecommendedProject[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendedProject {
  projectId: string;
  projectName: string;
  matchScore: number; // 0-100
  reasons: string[];
}

const ProjectParticipationRecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('low_participation');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // デモデータ：参加率が低い職員
  const lowParticipationStaff: StaffRecommendation[] = [
    {
      staffId: 'S001',
      name: '田中 花子',
      department: '看護部',
      profession: '看護師',
      currentProjects: 0,
      recommendedProjects: [
        {
          projectId: 'P123',
          projectName: '夜勤シフト最適化プロジェクト',
          matchScore: 92,
          reasons: ['夜勤経験10年以上', '看護部所属', 'シフト管理の声を投稿済み']
        },
        {
          projectId: 'P145',
          projectName: '新人教育プログラム改善',
          matchScore: 85,
          reasons: ['プリセプター経験あり', '教育委員会メンバー']
        }
      ],
      reason: 'プロジェクト参加なし（6ヶ月）',
      priority: 'high'
    },
    {
      staffId: 'S002',
      name: '佐藤 太郎',
      department: 'リハビリ部',
      profession: '理学療法士',
      currentProjects: 1,
      recommendedProjects: [
        {
          projectId: 'P156',
          projectName: 'リハビリ機器更新プロジェクト',
          matchScore: 88,
          reasons: ['機器選定経験あり', 'リハビリ部所属', '関連する声を投稿済み']
        }
      ],
      reason: '参加数が部門平均以下',
      priority: 'medium'
    },
    {
      staffId: 'S003',
      name: '鈴木 美咲',
      department: '事務部',
      profession: '事務職員',
      currentProjects: 0,
      recommendedProjects: [
        {
          projectId: 'P178',
          projectName: '電子カルテ業務効率化',
          matchScore: 90,
          reasons: ['医療事務経験5年', 'システム操作に精通', '業務改善提案実績あり']
        }
      ],
      reason: 'プロジェクト参加なし（3ヶ月）',
      priority: 'high'
    }
  ];

  // デモデータ：スキルマッチング
  const skillMatchData = [
    {
      skill: 'システム・IT',
      availableStaff: 42,
      activeProjects: 8,
      recommendations: 15
    },
    {
      skill: '教育・研修',
      availableStaff: 67,
      activeProjects: 12,
      recommendations: 23
    },
    {
      skill: '医療安全',
      availableStaff: 35,
      activeProjects: 6,
      recommendations: 12
    },
    {
      skill: '業務改善',
      availableStaff: 89,
      activeProjects: 15,
      recommendations: 31
    }
  ];

  // デモデータ：多様性向上推奨
  const diversityRecommendations = [
    {
      projectName: '外来待ち時間改善プロジェクト',
      currentTeam: { nurses: 5, doctors: 2, admin: 1, others: 0 },
      recommendation: '薬剤師、医療技術職の参加推奨',
      diversityScore: 45,
      targetScore: 75
    },
    {
      projectName: '病棟環境改善プロジェクト',
      currentTeam: { nurses: 8, doctors: 0, admin: 0, others: 2 },
      recommendation: '医師、事務部門の視点追加推奨',
      diversityScore: 40,
      targetScore: 70
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '-';
    }
  };

  const renderLowParticipationTab = () => (
    <div className="space-y-4">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-slate-400">参加なし（6ヶ月）</span>
          </div>
          <div className="text-3xl font-bold text-white">28名</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-slate-400">参加率低（平均以下）</span>
          </div>
          <div className="text-3xl font-bold text-white">67名</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-400">推奨送信済み</span>
          </div>
          <div className="text-3xl font-bold text-white">42件</div>
        </div>
      </div>

      {/* 推奨リスト */}
      {lowParticipationStaff.map((staff) => (
        <div key={staff.staffId} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{staff.name.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(staff.priority)}`}>
                    優先度: {getPriorityLabel(staff.priority)}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  {staff.department} / {staff.profession} / 現在の参加数: {staff.currentProjects}
                </div>
                <div className="text-sm text-yellow-400 mt-1">{staff.reason}</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              推奨を送信
            </button>
          </div>

          {/* 推奨プロジェクト */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              推奨プロジェクト
            </div>
            {staff.recommendedProjects.map((project) => (
              <div key={project.projectId} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{project.projectName}</h4>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                        マッチ度: {project.matchScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.reasons.map((reason, idx) => (
                        <span key={idx} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* マッチ度バー */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${project.matchScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillMatchTab = () => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-400" />
        スキル別マッチング状況
      </h3>
      <div className="space-y-4">
        {skillMatchData.map((skill) => (
          <div key={skill.skill} className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">{skill.skill}</h4>
              <span className="text-sm text-blue-400">{skill.recommendations}件の推奨可能</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-400">保有者</div>
                <div className="text-white font-semibold">{skill.availableStaff}名</div>
              </div>
              <div>
                <div className="text-slate-400">関連プロジェクト</div>
                <div className="text-white font-semibold">{skill.activeProjects}件</div>
              </div>
              <div>
                <div className="text-slate-400">推奨数</div>
                <div className="text-green-400 font-semibold">{skill.recommendations}件</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDiversityTab = () => (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-blue-300 font-medium mb-1">チーム多様性向上のために</div>
            <div className="text-sm text-blue-200/80">
              多様な職種・世代・部門のメンバーが参加することで、多角的な視点と創造的な解決策が生まれます
            </div>
          </div>
        </div>
      </div>

      {diversityRecommendations.map((rec, idx) => (
        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{rec.projectName}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-slate-400">
                  現在の多様性スコア: <span className="text-yellow-400 font-medium">{rec.diversityScore}/100</span>
                </div>
                <div className="text-slate-400">
                  目標: <span className="text-green-400 font-medium">{rec.targetScore}/100</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
              推奨を実行
            </button>
          </div>

          {/* 現在のチーム構成 */}
          <div className="bg-slate-900/50 rounded-lg p-4 mb-3">
            <div className="text-sm font-medium text-slate-300 mb-2">現在のチーム構成</div>
            <div className="flex gap-4 text-sm">
              <div className="text-slate-400">看護師: <span className="text-white">{rec.currentTeam.nurses}名</span></div>
              <div className="text-slate-400">医師: <span className="text-white">{rec.currentTeam.doctors}名</span></div>
              <div className="text-slate-400">事務: <span className="text-white">{rec.currentTeam.admin}名</span></div>
              <div className="text-slate-400">その他: <span className="text-white">{rec.currentTeam.others}名</span></div>
            </div>
          </div>

          {/* 推奨内容 */}
          <div className="flex items-start gap-2 text-sm">
            <Target className="w-4 h-4 text-green-400 mt-0.5" />
            <div className="text-green-300">{rec.recommendation}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExperienceGapTab = () => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">経験の偏り分析</h3>
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>経験偏り分析（実装予定）</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-purple-400" />
                プロジェクト参加推奨
              </h1>
              <p className="text-sm text-slate-400">スキル・経験に基づいた最適なプロジェクト推奨</p>
            </div>
          </div>

          {/* 部門フィルター */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部門</option>
            <option value="nursing">看護部</option>
            <option value="medical">医療技術部</option>
            <option value="admin">事務部</option>
            <option value="rehab">リハビリ部</option>
          </select>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="p-6">
        {/* タブナビゲーション */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/50">
          {[
            { id: 'low_participation', label: '参加率低', icon: AlertCircle },
            { id: 'skill_match', label: 'スキルマッチ', icon: Award },
            { id: 'diversity', label: '多様性向上', icon: Users },
            { id: 'experience_gap', label: '経験偏り', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? 'text-purple-400 border-purple-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'low_participation' && renderLowParticipationTab()}
        {activeTab === 'skill_match' && renderSkillMatchTab()}
        {activeTab === 'diversity' && renderDiversityTab()}
        {activeTab === 'experience_gap' && renderExperienceGapTab()}
      </div>
    </div>
  );
};

export default ProjectParticipationRecommendationPage;
