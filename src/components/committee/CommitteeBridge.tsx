import React, { useState, useEffect } from 'react';
import { ProposalEscalationEngine } from '../../services/ProposalEscalationEngine';
import { useUserPermission } from '../../hooks/useUserPermission';
import {
  Building,
  Calendar,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  ChevronRight,
  Download,
  Edit3
} from 'lucide-react';

interface CommitteeProposal {
  id: string;
  title: string;
  currentScore: number;
  department: string;
  submittedAt: Date;
  targetCommittee: {
    name: string;
    schedule: string;
    requiredDocs: string[];
  };
  status: 'pending' | 'preparing' | 'submitted' | 'approved' | 'rejected';
}

export const CommitteeBridge: React.FC = () => {
  const permission = useUserPermission();
  const [proposals, setProposals] = useState<CommitteeProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<CommitteeProposal | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const escalationEngine = new ProposalEscalationEngine();

  useEffect(() => {
    // レベル7以上の権限で委員会提出可能な議題を取得
    if (permission.calculatedLevel >= 7) {
      loadCommitteeEligibleProposals();
    }
  }, [permission.calculatedLevel]);

  const loadCommitteeEligibleProposals = () => {
    // デモデータ
    const demoProposals: CommitteeProposal[] = [
      {
        id: '1',
        title: '病棟間連携システムの改善提案',
        currentScore: 125,
        department: '看護部',
        submittedAt: new Date('2024-03-10'),
        targetCommittee: {
          name: '小原病院運営委員会',
          schedule: '毎月第2火曜日',
          requiredDocs: ['議題提案書', '予算見積書', '実施計画書']
        },
        status: 'preparing'
      },
      {
        id: '2',
        title: '電子カルテシステムUI改善',
        currentScore: 185,
        department: '医療情報部',
        submittedAt: new Date('2024-03-05'),
        targetCommittee: {
          name: '情報システム委員会',
          schedule: '毎月第3水曜日',
          requiredDocs: ['議題提案書', '仕様書', 'セキュリティ評価書']
        },
        status: 'pending'
      },
      {
        id: '3',
        title: '新人教育プログラム改革',
        currentScore: 210,
        department: '教育委員会',
        submittedAt: new Date('2024-02-28'),
        targetCommittee: {
          name: '教育委員会',
          schedule: '毎月第1月曜日',
          requiredDocs: ['議題提案書', 'カリキュラム案', '効果測定計画']
        },
        status: 'submitted'
      }
    ];

    setProposals(demoProposals);
  };

  const handleGenerateDocument = async (proposal: CommitteeProposal, docType: string) => {
    setIsGeneratingDoc(true);

    try {
      // 書類生成処理
      await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション

      console.log(`Generating ${docType} for proposal ${proposal.id}`);

      // 実際の実装では、生成された書類をダウンロードまたは編集画面を開く
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleSubmitToCommittee = async (proposal: CommitteeProposal) => {
    // 委員会への正式提出処理
    console.log(`Submitting proposal ${proposal.id} to ${proposal.targetCommittee.name}`);

    // ステータス更新
    setProposals(prev => prev.map(p =>
      p.id === proposal.id ? { ...p, status: 'submitted' as const } : p
    ));
  };

  const getStatusBadge = (status: CommitteeProposal['status']) => {
    const configs = {
      pending: { color: 'bg-gray-500/20 text-gray-400', label: '準備待ち' },
      preparing: { color: 'bg-yellow-500/20 text-yellow-400', label: '準備中' },
      submitted: { color: 'bg-blue-500/20 text-blue-400', label: '提出済み' },
      approved: { color: 'bg-green-500/20 text-green-400', label: '承認済み' },
      rejected: { color: 'bg-red-500/20 text-red-400', label: '却下' }
    };

    const config = configs[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // レベル7未満は表示しない
  if (permission.calculatedLevel < 7) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Building className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">委員会ブリッジ</h2>
            <p className="text-sm text-gray-400">
              議題を委員会フォーマットに変換して提出
            </p>
          </div>
        </div>
      </div>

      {/* 議題リスト */}
      <div className="space-y-4">
        {proposals.map(proposal => (
          <div
            key={proposal.id}
            className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{proposal.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {proposal.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(proposal.submittedAt).toLocaleDateString('ja-JP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {proposal.targetCommittee.schedule}
                  </span>
                </div>
              </div>
              {getStatusBadge(proposal.status)}
            </div>

            {/* 提出先委員会 */}
            <div className="mb-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-400">
                  {proposal.targetCommittee.name}
                </span>
                <span className="text-xs text-gray-400">
                  スコア: {proposal.currentScore}点
                </span>
              </div>

              {/* 必要書類チェックリスト */}
              <div className="space-y-1">
                {proposal.targetCommittee.requiredDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-300">
                      <FileText className="w-3 h-3" />
                      {doc}
                    </span>
                    <button
                      onClick={() => handleGenerateDocument(proposal, doc)}
                      disabled={isGeneratingDoc}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      生成
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-2">
              {proposal.status === 'pending' && (
                <button
                  onClick={() => setSelectedProposal(proposal)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  書類準備
                </button>
              )}

              {proposal.status === 'preparing' && (
                <>
                  <button
                    onClick={() => handleSubmitToCommittee(proposal)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    委員会へ提出
                  </button>
                  <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

              {proposal.status === 'submitted' && (
                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  提出完了
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 権限レベル別の説明 */}
      <div className="mt-6 p-4 bg-gray-700/20 rounded-lg">
        <p className="text-xs text-gray-400">
          {permission.calculatedLevel === 7 && '🔧 副師長権限: 委員会への議題準備が可能です'}
          {permission.calculatedLevel === 8 && '🌉 師長権限: 委員会への正式提出が可能です'}
          {permission.calculatedLevel >= 9 && '🏛️ 上級管理職権限: 全委員会への直接提出が可能です'}
        </p>
      </div>
    </div>
  );
};