import React, { useState, useEffect } from 'react';
import { useUserPermission } from '../../hooks/useUserPermission';
import { ProposalEscalationEngine } from '../../services/ProposalEscalationEngine';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  ChevronRight,
  Target,
  Zap,
  Building,
  Globe
} from 'lucide-react';

interface AttentionItem {
  id: string;
  title: string;
  currentScore: number;
  threshold: number;
  progressPercentage: number;
  department: string;
  submittedAt: string;
  urgency: 'high' | 'medium' | 'low';
  impactLevel: 'department' | 'facility' | 'corporation';
  participantCount: number;
  recentActivity: string;
}

export const AttentionList: React.FC = () => {
  const permission = useUserPermission();
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'near-threshold'>('all');
  const escalationEngine = new ProposalEscalationEngine();

  useEffect(() => {
    // 管理職レベルに応じたアイテムを取得
    fetchAttentionItems();
  }, [permission.calculatedLevel]);

  const fetchAttentionItems = () => {
    // デモデータ生成
    const demoItems: AttentionItem[] = [];

    // レベル5-6（主任級）: 部署レベルの議題
    if (permission.calculatedLevel >= 5 && permission.calculatedLevel <= 6) {
      demoItems.push(
        {
          id: '1',
          title: '看護部の夜勤シフト最適化提案',
          currentScore: 42,
          threshold: 50,
          progressPercentage: 84,
          department: '看護部',
          submittedAt: '2日前',
          urgency: 'high',
          impactLevel: 'department',
          participantCount: 23,
          recentActivity: '3時間前に5票追加'
        },
        {
          id: '2',
          title: '新人教育プログラムの改善案',
          currentScore: 35,
          threshold: 50,
          progressPercentage: 70,
          department: '看護部',
          submittedAt: '1週間前',
          urgency: 'medium',
          impactLevel: 'department',
          participantCount: 18,
          recentActivity: '昨日2票追加'
        }
      );
    }

    // レベル7-8（師長級）: 複数部署に影響する議題
    if (permission.calculatedLevel >= 7 && permission.calculatedLevel <= 8) {
      demoItems.push(
        {
          id: '3',
          title: '病棟間の連携システム改善',
          currentScore: 85,
          threshold: 100,
          progressPercentage: 85,
          department: '全病棟',
          submittedAt: '3日前',
          urgency: 'high',
          impactLevel: 'facility',
          participantCount: 45,
          recentActivity: '1時間前に8票追加'
        },
        {
          id: '4',
          title: '電子カルテUIの改善要望',
          currentScore: 120,
          threshold: 100,
          progressPercentage: 120,
          department: '医療情報部',
          submittedAt: '5日前',
          urgency: 'high',
          impactLevel: 'facility',
          participantCount: 67,
          recentActivity: '委員会提出準備中'
        }
      );
    }

    // レベル9-11（部長級）: 施設全体・法人レベルの議題
    if (permission.calculatedLevel >= 9 && permission.calculatedLevel <= 11) {
      demoItems.push(
        {
          id: '5',
          title: '職員満足度向上のための福利厚生改革',
          currentScore: 280,
          threshold: 300,
          progressPercentage: 93,
          department: '人事部',
          submittedAt: '1週間前',
          urgency: 'high',
          impactLevel: 'corporation',
          participantCount: 156,
          recentActivity: '本日20票追加'
        },
        {
          id: '6',
          title: '地域連携強化プロジェクト',
          currentScore: 450,
          threshold: 600,
          progressPercentage: 75,
          department: '地域連携室',
          submittedAt: '2週間前',
          urgency: 'medium',
          impactLevel: 'corporation',
          participantCount: 203,
          recentActivity: '着実に票を獲得中'
        }
      );
    }

    setAttentionItems(demoItems);
  };

  const getFilteredItems = () => {
    switch (filter) {
      case 'urgent':
        return attentionItems.filter(item => item.urgency === 'high');
      case 'near-threshold':
        return attentionItems.filter(item => item.progressPercentage >= 80);
      default:
        return attentionItems;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'department': return <Building className="w-4 h-4" />;
      case 'facility': return <Users className="w-4 h-4" />;
      case 'corporation': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const filteredItems = getFilteredItems();

  // 管理職以外は表示しない
  if (permission.calculatedLevel < 5) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">注目議題リスト</h2>
            <p className="text-sm text-gray-400">
              あなたの管轄範囲で検討が必要な議題
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            全て ({attentionItems.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'urgent'
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            緊急
          </button>
          <button
            onClick={() => setFilter('near-threshold')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'near-threshold'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            閾値間近
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">現在、注目が必要な議題はありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getImpactIcon(item.impactLevel)}
                    <span className="text-xs text-gray-500">{item.department}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency === 'high' ? '緊急' : item.urgency === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>

              {/* 進捗バー */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    進捗: {item.currentScore} / {item.threshold}点
                  </span>
                  <span className="text-xs text-white font-medium">
                    {item.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(item.progressPercentage)}`}
                    style={{ width: `${Math.min(item.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* メタ情報 */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.submittedAt}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.participantCount}人参加
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {item.recentActivity}
                </div>
              </div>

              {/* 閾値突破時の特別表示 */}
              {item.progressPercentage >= 100 && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-xs text-red-400">
                    ⚠️ 閾値を突破しました。承認プロセスへの移行を検討してください。
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 権限レベル別の説明 */}
      <div className="mt-6 p-4 bg-gray-700/20 rounded-lg">
        <p className="text-xs text-gray-400">
          {permission.calculatedLevel <= 6 && '💡 部署内で検討が必要な議題を表示しています'}
          {permission.calculatedLevel >= 7 && permission.calculatedLevel <= 8 && '🏢 複数部署に影響する議題を表示しています'}
          {permission.calculatedLevel >= 9 && '🌐 施設全体・法人レベルの重要議題を表示しています'}
        </p>
      </div>
    </div>
  );
};