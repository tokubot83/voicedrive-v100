import React, { useState } from 'react';
import { Comment, CommentPrivacyLevel, ProposalType, User } from '../types';
import { getCommentPrivacyLevel } from '../config/proposalTypes';

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
  const [customPrivacyLevel, setCustomPrivacyLevel] = useState<CommentPrivacyLevel | null>(null);

  const defaultPrivacyLevel = proposalType ? getCommentPrivacyLevel(proposalType) : 'partial';
  const effectivePrivacyLevel = customPrivacyLevel || defaultPrivacyLevel;

  const canSelectPrivacy = proposalType === 'innovation' || proposalType === 'strategic';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const visibleInfo = getVisibleInfo(effectivePrivacyLevel, currentUser);

    const comment: Omit<Comment, 'id' | 'timestamp'> = {
      postId,
      content: content.trim(),
      author: currentUser,
      anonymityLevel: mapPrivacyToAnonymity(effectivePrivacyLevel),
      privacyLevel: effectivePrivacyLevel,
      visibleInfo
    };

    onSubmit(comment);
    setContent('');
  };

  const getVisibleInfo = (privacy: CommentPrivacyLevel, user: User) => {
    switch (privacy) {
      case 'anonymous':
        return undefined;
      case 'partial':
        return {
          facility: user.department, // 簡略化：部署を施設として使用
          position: user.role,
          experienceYears: user.expertise || 0,
          isManagement: user.role.includes('管理') || user.role.includes('主任')
        };
      case 'selective':
        const isManagement = user.role.includes('管理') || user.role.includes('主任');
        return isManagement ? {
          facility: user.department,
          position: user.role,
          experienceYears: user.expertise || 0,
          isManagement: true
        } : {
          facility: user.department,
          position: user.role,
          experienceYears: user.expertise || 0,
          isManagement: false
        };
      case 'full':
        return {
          facility: user.department,
          position: user.role,
          experienceYears: user.expertise || 0,
          isManagement: user.role.includes('管理') || user.role.includes('主任')
        };
      default:
        return undefined;
    }
  };

  const mapPrivacyToAnonymity = (privacy: CommentPrivacyLevel): 'real' | 'department' | 'anonymous' => {
    switch (privacy) {
      case 'full': return 'real';
      case 'partial':
      case 'selective': return 'department';
      case 'anonymous': return 'anonymous';
      default: return 'anonymous';
    }
  };

  const getPrivacyDescription = (privacy: CommentPrivacyLevel) => {
    switch (privacy) {
      case 'anonymous':
        return '完全匿名 - 名前や所属は表示されません';
      case 'partial':
        return '部分匿名 - 施設・職種・経験年数のみ表示';
      case 'selective':
        return '段階的 - 管理職は実名、その他は部分匿名';
      case 'full':
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
          <strong>公開レベル:</strong> {getPrivacyDescription(effectivePrivacyLevel)}
        </div>
      </div>

      {canSelectPrivacy && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公開レベルを選択
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                checked={effectivePrivacyLevel === 'anonymous'}
                onChange={() => setCustomPrivacyLevel('anonymous')}
                className="mr-2"
              />
              <span className="text-sm">完全匿名</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                checked={effectivePrivacyLevel === 'partial'}
                onChange={() => setCustomPrivacyLevel('partial')}
                className="mr-2"
              />
              <span className="text-sm">部分匿名（推奨）</span>
            </label>
            {proposalType === 'strategic' && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  checked={effectivePrivacyLevel === 'selective'}
                  onChange={() => setCustomPrivacyLevel('selective')}
                  className="mr-2"
                />
                <span className="text-sm">段階的公開</span>
              </label>
            )}
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                checked={effectivePrivacyLevel === 'full'}
                onChange={() => setCustomPrivacyLevel('full')}
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