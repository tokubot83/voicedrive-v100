import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComposeForm from '../components/ComposeForm';
import { PostType } from '../types';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';

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
      description: '職場の声を形に。あなたのアイデアを聞かせてください',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderGradient: 'from-green-500/50 to-emerald-500/50'
    },
    community: {
      title: '💬 フリーボイス投稿',
      description: '厚生会職員の交流の場。雑談からイベント告知まで自由にお使いください。',
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
          <div>
            <h1 className="text-2xl font-bold text-white">{config.title}</h1>
            <p className="text-gray-400 text-sm">{config.description}</p>
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
      
      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default ComposePage;