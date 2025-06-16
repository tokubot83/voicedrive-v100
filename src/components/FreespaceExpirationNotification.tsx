import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { FreespaceExpirationService } from '../services/FreespaceExpirationService';

interface FreespaceExpirationNotificationProps {
  posts: Post[];
  currentUserId: string;
  onExtensionRequest?: (postId: string, reason: string) => void;
}

const FreespaceExpirationNotification = ({ 
  posts, 
  currentUserId, 
  onExtensionRequest 
}: FreespaceExpirationNotificationProps) => {
  const [userPostsExpiringSoon, setUserPostsExpiringSoon] = useState<Post[]>([]);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [extensionReason, setExtensionReason] = useState('');

  useEffect(() => {
    // ユーザーの投稿で期限切れ間近のものを取得
    const userPosts = posts.filter(post => 
      post.author.id === currentUserId && 
      post.type === 'community'
    );
    
    const expiringSoon = FreespaceExpirationService.getPostsExpiringSoon(userPosts);
    setUserPostsExpiringSoon(expiringSoon);
  }, [posts, currentUserId]);

  const handleExtensionRequest = () => {
    if (selectedPost && extensionReason.trim() && onExtensionRequest) {
      onExtensionRequest(selectedPost.id, extensionReason);
      setShowExtensionModal(false);
      setSelectedPost(null);
      setExtensionReason('');
    }
  };

  if (userPostsExpiringSoon.length === 0) {
    return null;
  }

  return (
    <>
      {/* 通知バナー */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-yellow-800">
              フリースペース投稿の期限切れ間近
            </h3>
            <div className="mt-2 space-y-2">
              {userPostsExpiringSoon.map(post => {
                const timeInfo = FreespaceExpirationService.getTimeUntilExpiration(post);
                return (
                  <div key={post.id} className="p-3 bg-white rounded-md border border-yellow-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {post.content.length > 50 ? `${post.content.substring(0, 50)}...` : post.content}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {post.freespaceCategory === 'idea_sharing' && '💡 アイデア共有'}
                            {post.freespaceCategory === 'casual_discussion' && '💬 雑談'}
                            {post.freespaceCategory === 'event_planning' && '🎉 イベント企画'}
                          </span>
                          {timeInfo && (
                            <span className="text-red-600 font-medium">
                              残り {timeInfo.days > 0 ? `${timeInfo.days}日` : `${timeInfo.hours}時間`}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowExtensionModal(true);
                        }}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        延長申請
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 延長申請モーダル */}
      {showExtensionModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">投稿期限の延長申請</h3>
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setSelectedPost(null);
                  setExtensionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">対象投稿</h4>
              <p className="text-sm text-gray-700">
                {selectedPost.content.length > 100 ? `${selectedPost.content.substring(0, 100)}...` : selectedPost.content}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                延長理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                placeholder="例: まだ議論が続いており、より多くの意見を集めたいため"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{extensionReason.length}/200</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">延長申請について</p>
                  <ul className="text-xs space-y-1">
                    <li>• 申請は自動的にHR部門に送信されます</li>
                    <li>• 承認されると最大30日間延長されます</li>
                    <li>• 延長は1回限りです</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setSelectedPost(null);
                  setExtensionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleExtensionRequest}
                disabled={!extensionReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                延長申請
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FreespaceExpirationNotification;