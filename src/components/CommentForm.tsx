import React, { useState } from 'react';
import { Comment, AnonymityLevel, ProposalType, User } from '../types';
import { FACILITIES } from '../data/medical/facilities';

interface CommentFormProps {
  postId: string;
  proposalType?: ProposalType;
  currentUser: User;
  onSubmit: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export default function CommentForm({ 
  postId, 
  proposalType, 
  currentUser, 
  onSubmit, 
  onCancel 
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [customAnonymityLevel, setCustomAnonymityLevel] = useState<AnonymityLevel | null>(null);

  const defaultAnonymityLevel: AnonymityLevel = proposalType === 'riskManagement' ? 'real_name' : 
                                                proposalType === 'communication' ? 'anonymous' : 'facility_department';
  const effectiveAnonymityLevel = customAnonymityLevel || defaultAnonymityLevel;

  const canSelectAnonymity = proposalType === 'innovation' || proposalType === 'strategic';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const visibleInfo = getVisibleInfo(effectiveAnonymityLevel, currentUser);

    const comment: Omit<Comment, 'id' | 'timestamp'> = {
      postId,
      content: content.trim(),
      author: currentUser,
      anonymityLevel: effectiveAnonymityLevel,
      visibleInfo
    };

    onSubmit(comment);
    setContent('');
  };

  const getVisibleInfo = (anonymity: AnonymityLevel, user: User) => {
    const facilityName = user.facility_id ? FACILITIES[user.facility_id as keyof typeof FACILITIES]?.name : '';
    
    switch (anonymity) {
      case 'anonymous':
        return undefined;
      case 'department_only':
      case 'facility_anonymous':
      case 'facility_department':
      case 'real_name':
        return {
          facility: facilityName,
          position: user.role,
          experienceYears: user.expertise || 0
        };
      default:
        return undefined;
    }
  };


  const getAnonymityDescription = (anonymity: AnonymityLevel) => {
    switch (anonymity) {
      case 'anonymous':
        return '完全匿名 - 名前や所属は表示されません';
      case 'department_only':
        return '部署名のみ - 部署名と経験年数のみ表示';
      case 'facility_anonymous':
        return '施設名＋匿名 - 施設名と経験年数のみ表示';
      case 'facility_department':
        return '施設名＋部署名 - 施設名、部署名、経験年数を表示';
      case 'real_name':
        return '実名制 - 氏名と所属が表示されます';
      default:
        return '';
    }
  };

  const getProposalTypeLabel = (type: ProposalType) => {
    const labels = {
      operational: '業務改善',
      strategic: '戦略提案',
      innovation: 'イノベーション',
      riskManagement: 'リスク管理',
      communication: 'コミュニケーション'
    };
    return labels[type];
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">
            コメント投稿
          </span>
          {proposalType && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {getProposalTypeLabel(proposalType)}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
          <strong>公開レベル:</strong> {getAnonymityDescription(effectiveAnonymityLevel)}
        </div>
      </div>

      {canSelectAnonymity && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公開レベルを選択
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="anonymity"
                checked={effectiveAnonymityLevel === 'anonymous'}
                onChange={() => setCustomAnonymityLevel('anonymous')}
                className="mr-2"
              />
              <span className="text-sm">完全匿名</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="anonymity"
                checked={effectiveAnonymityLevel === 'facility_department'}
                onChange={() => setCustomAnonymityLevel('facility_department')}
                className="mr-2"
              />
              <span className="text-sm">施設名＋部署名（推奨）</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="anonymity"
                checked={effectiveAnonymityLevel === 'facility_anonymous'}
                onChange={() => setCustomAnonymityLevel('facility_anonymous')}
                className="mr-2"
              />
              <span className="text-sm">施設名＋匿名</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="anonymity"
                checked={effectiveAnonymityLevel === 'real_name'}
                onChange={() => setCustomAnonymityLevel('real_name')}
                className="mr-2"
              />
              <span className="text-sm">実名制</span>
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力してください..."
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          required
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            投稿
          </button>
        </div>
      </form>
    </div>
  );
}