import React, { useState, useEffect } from 'react';
import { useUserPermission } from '../hooks/useUserPermission';
import { ProposalEscalationEngine } from '../services/ProposalEscalationEngine';
// import { AgendaDocumentEditor } from '../components/proposal/AgendaDocumentEditor';
// DB構築後に上記コメントを解除
import {
  FileText,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  Target
} from 'lucide-react';

interface ProposalData {
  id: string;
  title: string;
  department: string;
  currentScore: number;
  participantCount: number;
  submittedAt: Date;
  votes: {
    'strongly-support': number;
    'support': number;
    'neutral': number;
    'oppose': number;
    'strongly-oppose': number;
  };
  topComments: Array<{
    author: string;
    content: string;
    likes: number;
  }>;
}

export const ProposalGeneratorPage: React.FC = () => {
  const permission = useUserPermission();
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableProposals, setAvailableProposals] = useState<ProposalData[]>([]);
  const escalationEngine = new ProposalEscalationEngine();

  useEffect(() => {
    // デモ用の議題データをロード
    loadAvailableProposals();
  }, []);

  const loadAvailableProposals = () => {
    // デモデータ
    const proposals: ProposalData[] = [
      {
        id: '1',
        title: '看護部の夜勤シフト最適化提案',
        department: '看護部',
        currentScore: 85,
        participantCount: 45,
        submittedAt: new Date('2024-03-15'),
        votes: {
          'strongly-support': 12,
          'support': 18,
          'neutral': 8,
          'oppose': 5,
          'strongly-oppose': 2
        },
        topComments: [
          {
            author: '田中看護師長',
            content: '現場の負担軽減に直結する重要な提案です。早期実現を希望します。',
            likes: 23
          },
          {
            author: '佐藤主任',
            content: 'システム導入コストを考慮しても十分な効果が期待できます。',
            likes: 18
          }
        ]
      },
      {
        id: '2',
        title: '電子カルテUIの改善要望',
        department: '医療情報部',
        currentScore: 120,
        participantCount: 67,
        submittedAt: new Date('2024-03-10'),
        votes: {
          'strongly-support': 25,
          'support': 30,
          'neutral': 5,
          'oppose': 4,
          'strongly-oppose': 3
        },
        topComments: [
          {
            author: '山田医師',
            content: '日々の診療効率に直結します。ぜひ実現してください。',
            likes: 45
          },
          {
            author: '鈴木看護師',
            content: '入力時間が大幅に短縮できそうです。',
            likes: 32
          }
        ]
      },
      {
        id: '3',
        title: '職員満足度向上のための福利厚生改革',
        department: '人事部',
        currentScore: 280,
        participantCount: 156,
        submittedAt: new Date('2024-03-01'),
        votes: {
          'strongly-support': 65,
          'support': 70,
          'neutral': 10,
          'oppose': 8,
          'strongly-oppose': 3
        },
        topComments: [
          {
            author: '高橋事務長',
            content: '職員の定着率向上に寄与する重要な施策です。',
            likes: 89
          },
          {
            author: '伊藤主任',
            content: '子育て支援の充実は特に重要だと思います。',
            likes: 67
          }
        ]
      }
    ];

    setAvailableProposals(proposals);
  };

  const handleGenerateDocument = async () => {
    if (!selectedProposal) return;

    setIsGenerating(true);

    try {
      // 委員会を決定
      const committee = escalationEngine.determineTargetCommittee(
        selectedProposal.currentScore,
        '業務改善',
        '小原病院'
      );

      if (!committee) {
        console.error('適切な委員会が見つかりませんでした');
        setIsGenerating(false);
        return;
      }

      // ProposalEscalationEngineのgenerateAgendaDocumentメソッドを呼び出し
      const proposalData = {
        title: selectedProposal.title,
        department: selectedProposal.department,
        content: `投票スコア: ${selectedProposal.currentScore}点\n参加者: ${selectedProposal.participantCount}人`,
        votingScore: selectedProposal.currentScore,
        agreementRate: ((selectedProposal.votes['strongly-support'] + selectedProposal.votes['support']) / selectedProposal.participantCount) * 100,
        supportComments: selectedProposal.topComments.map(c => c.content),
        concerns: []
      };

      const document = await escalationEngine.generateAgendaDocument(
        selectedProposal.id,
        proposalData,
        committee
      );

      setGeneratedDocument(document);
    } catch (error) {
      console.error('Document generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  // レベル5未満は利用不可
  if (permission.calculatedLevel < 5) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">権限が不足しています</h2>
          <p className="text-gray-400">
            議題提案書作成機能は副主任（レベル5）以上の権限が必要です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              議題提案書ジェネレーター
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              投票データから自動的に議題提案書を生成します
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：議題選択パネル */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                議題を選択
              </h2>

              <div className="space-y-3">
                {availableProposals.map(proposal => (
                  <button
                    key={proposal.id}
                    onClick={() => setSelectedProposal(proposal)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedProposal?.id === proposal.id
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'bg-gray-700/30 hover:bg-gray-700/50 border border-transparent'
                    }`}
                  >
                    <div className="mb-2">
                      <h3 className="font-medium text-white line-clamp-2">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{proposal.department}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          {proposal.currentScore}点
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Users className="w-3 h-3" />
                          {proposal.participantCount}人
                        </span>
                      </div>
                      {proposal.currentScore >= 100 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                          閾値達成
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedProposal && (
                <button
                  onClick={handleGenerateDocument}
                  disabled={isGenerating}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      提案書を自動生成
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 選択した議題の詳細 */}
            {selectedProposal && (
              <div className="mt-4 bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">投票内訳</h3>
                <div className="space-y-2">
                  {Object.entries(selectedProposal.votes).map(([key, value]) => {
                    const labels = {
                      'strongly-support': '強く支持',
                      'support': '支持',
                      'neutral': '中立',
                      'oppose': '反対',
                      'strongly-oppose': '強く反対'
                    };
                    const colors = {
                      'strongly-support': 'bg-green-500',
                      'support': 'bg-blue-500',
                      'neutral': 'bg-gray-500',
                      'oppose': 'bg-orange-500',
                      'strongly-oppose': 'bg-red-500'
                    };

                    const percentage = (value / selectedProposal.participantCount) * 100;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>{labels[key as keyof typeof labels]}</span>
                          <span>{value}票</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[key as keyof typeof colors]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 右側：生成された提案書 */}
          <div className="lg:col-span-2">
            {generatedDocument ? (
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-yellow-400 mb-2">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">DB構築前の一時表示</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    AgendaDocumentEditorはDB構築後に有効化されます。現在は生成された提案書データを表示しています。
                  </p>
                </div>

                <div className="text-white space-y-4">
                  <h2 className="text-2xl font-bold">{generatedDocument.proposalTitle || '提案書'}</h2>
                  <div className="text-gray-400">
                    <p>提案ID: {generatedDocument.proposalId}</p>
                    <p>委員会: {generatedDocument.committeeId}</p>
                  </div>
                  <div className="mt-4 p-4 bg-gray-700/30 rounded">
                    <pre className="text-sm whitespace-pre-wrap">{generatedDocument.content || 'コンテンツが生成されました'}</pre>
                  </div>
                </div>
              </div>
              /* DB構築後に有効化
              <AgendaDocumentEditor
                documentId={generatedDocument.id || selectedProposal?.id || ''}
                userId={user?.id || 'demo-user'}
                userLevel={permission.calculatedLevel}
                onSaveSuccess={handleDocumentUpdate}
                onExportSuccess={(url) => console.log('Export URL:', url)}
              />
              */
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-12 backdrop-blur border border-gray-700/50 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  提案書が生成されます
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  左側から議題を選択し、「提案書を自動生成」ボタンをクリックすると、
                  投票データを基に提案書が自動的に作成されます。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};