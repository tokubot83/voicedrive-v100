import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ComposeForm from '../components/ComposeForm';
import { PostType } from '../types';

const ComposePage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  // URLパラメータからPostTypeを決定
  const getPostType = (typeParam: string | undefined): PostType => {
    if (typeParam === 'improvement') return 'improvement';
    if (typeParam === 'community') return 'community';
    return 'improvement'; // デフォルト
  };

  const selectedType = getPostType(type);

  const typeConfig = {
    improvement: {
      title: '💡 アイデアボイス',
      description: '業務効率化・品質向上のアイデアを提案してください',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderGradient: 'from-green-500/50 to-emerald-500/50'
    },
    community: {
      title: '💬 フリーボイス投稿',
      description: '情報共有・相談・雑談でチームの絆を深めましょう',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      borderGradient: 'from-blue-500/50 to-blue-600/50'
    }
  };

  const config = typeConfig[selectedType];

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ホーム</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{config.title}</h1>
              <p className="text-gray-400 text-sm">{config.description}</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* 投稿タイプのバナー */}
          <div className={`p-6 rounded-xl border bg-gradient-to-r ${config.bgGradient} border-gradient-to-r ${config.borderGradient} mb-6`}>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{config.title}</h2>
                <p className="text-gray-300">{config.description}</p>
              </div>
            </div>
          </div>

          {/* 投稿フォーム */}
          <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-lg rounded-xl border border-gray-800/50">
            <ComposeForm 
              selectedType={selectedType}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposePage;