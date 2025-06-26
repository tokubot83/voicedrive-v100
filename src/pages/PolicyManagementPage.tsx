import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, Clock, Shield, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../components/ui/Card';
import { AuditService } from '../services/AuditService';

interface Policy {
  id: string;
  title: string;
  category: 'hr' | 'security' | 'compliance' | 'it' | 'finance' | 'general';
  description: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  effectiveDate: string;
  lastUpdated: string;
  updatedBy: string;
  approvedBy?: string;
  tags: string[];
}

const PolicyManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // ダミーデータの生成
  useEffect(() => {
    const dummyPolicies: Policy[] = [
      {
        id: '1',
        title: 'リモートワーク規定',
        category: 'hr',
        description: '在宅勤務およびリモートワークに関する規定と手順',
        version: '2.1',
        status: 'active',
        effectiveDate: '2024-01-01',
        lastUpdated: '2024-01-15',
        updatedBy: '山田 太郎',
        approvedBy: '佐藤 部長',
        tags: ['リモートワーク', '勤務規定', 'HR']
      },
      {
        id: '2',
        title: '情報セキュリティポリシー',
        category: 'security',
        description: '企業の情報資産を保護するためのセキュリティ方針',
        version: '3.0',
        status: 'active',
        effectiveDate: '2023-10-01',
        lastUpdated: '2023-12-20',
        updatedBy: '鈴木 花子',
        approvedBy: 'CTO',
        tags: ['セキュリティ', 'IT', 'コンプライアンス']
      },
      {
        id: '3',
        title: '経費精算規定',
        category: 'finance',
        description: '経費精算の手順と承認プロセス',
        version: '1.5',
        status: 'draft',
        effectiveDate: '2024-02-01',
        lastUpdated: '2024-01-20',
        updatedBy: '田中 次郎',
        tags: ['経費', '精算', '財務']
      },
      {
        id: '4',
        title: 'データ保護方針',
        category: 'compliance',
        description: '個人情報およびデータの取り扱いに関する方針',
        version: '2.0',
        status: 'active',
        effectiveDate: '2023-06-01',
        lastUpdated: '2023-11-15',
        updatedBy: '高橋 美咲',
        approvedBy: 'CEO',
        tags: ['GDPR', '個人情報', 'コンプライアンス']
      },
      {
        id: '5',
        title: 'IT機器管理規定',
        category: 'it',
        description: '社内IT機器の管理と利用に関する規定',
        version: '1.2',
        status: 'archived',
        effectiveDate: '2022-04-01',
        lastUpdated: '2023-03-31',
        updatedBy: '伊藤 健一',
        tags: ['IT', '機器管理', 'セキュリティ']
      }
    ];
    setPolicies(dummyPolicies);
  }, []);

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryConfig = {
    hr: { label: '人事', color: 'bg-blue-500/20 text-blue-400', icon: '👥' },
    security: { label: 'セキュリティ', color: 'bg-red-500/20 text-red-400', icon: '🔒' },
    compliance: { label: 'コンプライアンス', color: 'bg-purple-500/20 text-purple-400', icon: '⚖️' },
    it: { label: 'IT', color: 'bg-green-500/20 text-green-400', icon: '💻' },
    finance: { label: '財務', color: 'bg-yellow-500/20 text-yellow-400', icon: '💰' },
    general: { label: '一般', color: 'bg-gray-500/20 text-gray-400', icon: '📄' }
  };

  const getStatusBadge = (status: Policy['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            有効
          </span>
        );
      case 'draft':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            <Edit2 className="w-3 h-3" />
            下書き
          </span>
        );
      case 'archived':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            <XCircle className="w-3 h-3" />
            アーカイブ
          </span>
        );
    }
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    
    // 監査ログ記録
    AuditService.log({
      userId: user?.id || '',
      action: 'POLICY_VIEWED',
      targetId: policy.id,
      details: { policyTitle: policy.title }
    });
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm('このポリシーを削除してもよろしいですか？')) {
      setPolicies(policies.filter(p => p.id !== policyId));
      
      // 監査ログ記録
      AuditService.log({
        userId: user?.id || '',
        action: 'POLICY_DELETED',
        targetId: policyId,
        severity: 'high'
      });
    }
  };

  // 統計情報
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    draft: policies.filter(p => p.status === 'draft').length,
    categories: new Set(policies.map(p => p.category)).size
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full">
      <div className="w-full p-6">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-6 backdrop-blur-xl border border-emerald-500/20 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            ポリシー管理
          </h1>
          <p className="text-gray-300">
            組織のポリシーとガイドラインを管理
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">総ポリシー数</span>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">有効なポリシー</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.active}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">下書き</span>
              <Edit2 className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.draft}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">カテゴリー数</span>
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.categories}</div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ポリシー名、説明、タグで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのカテゴリー</option>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのステータス</option>
                <option value="active">有効</option>
                <option value="draft">下書き</option>
                <option value="archived">アーカイブ</option>
              </select>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                新規ポリシー
              </button>
            </div>
          </div>
        </div>

        {/* ポリシーリスト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPolicies.map(policy => {
            const category = categoryConfig[policy.category];
            return (
              <div
                key={policy.id}
                className="bg-gray-800/50 rounded-xl p-6 backdrop-blur border border-gray-700/50 hover:border-gray-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{policy.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{policy.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">カテゴリー:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${category.color}`}>
                      {category.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">バージョン:</span>
                    <span className="ml-2 text-white">v{policy.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">発効日:</span>
                    <span className="ml-2 text-white">{policy.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">更新者:</span>
                    <span className="ml-2 text-white">{policy.updatedBy}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {policy.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4" />
                    最終更新: {policy.lastUpdated}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewPolicy(policy)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="表示"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PolicyManagementPage;