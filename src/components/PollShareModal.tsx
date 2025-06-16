import React, { useState } from 'react';
import { X, Copy, Share2, Download, ExternalLink } from 'lucide-react';
import { Poll, Post } from '../types';
import { PollShareService } from '../services/PollShareService';

interface PollShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  poll: Poll;
}

type ShareFormat = 'text' | 'visual' | 'link';

const PollShareModal = ({ isOpen, onClose, post, poll }: PollShareModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('text');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyToClipboard = async () => {
    const shareText = PollShareService.generateShareText(post, poll);
    const success = await PollShareService.copyToClipboard(shareText);
    
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleWebShare = async () => {
    const success = await PollShareService.shareViaWebAPI(post, poll);
    
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } else {
      // Web Share API が利用できない場合はクリップボードにコピー
      handleCopyToClipboard();
    }
  };

  const handleDownloadVisual = () => {
    const visualHtml = PollShareService.generateVisualShare(post, poll);
    const blob = new Blob([visualHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `投票結果_${poll.question || 'poll'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareText = PollShareService.generateShareText(post, poll);
  const shareUrl = PollShareService.generateShareUrl(post.id, poll.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">投票結果を共有</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 共有形式選択 */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">共有形式を選択</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedFormat('text')}
              className={`p-4 border rounded-lg transition-all ${
                selectedFormat === 'text'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <Copy className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">テキスト形式</div>
                <div className="text-sm text-gray-500">コピー&ペースト</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('visual')}
              className={`p-4 border rounded-lg transition-all ${
                selectedFormat === 'visual'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <Download className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">ビジュアル形式</div>
                <div className="text-sm text-gray-500">HTMLダウンロード</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('link')}
              className={`p-4 border rounded-lg transition-all ${
                selectedFormat === 'link'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <ExternalLink className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">リンク共有</div>
                <div className="text-sm text-gray-500">URL生成</div>
              </div>
            </button>
          </div>
        </div>

        {/* プレビュー */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">プレビュー</h3>
          
          {selectedFormat === 'text' && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {shareText}
              </pre>
            </div>
          )}

          {selectedFormat === 'visual' && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: PollShareService.generateVisualShare(post, poll) 
                }}
              />
            </div>
          )}

          {selectedFormat === 'link' && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-2">共有URL:</div>
                <code className="bg-white p-2 rounded border text-blue-600 break-all">
                  {shareUrl}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>

          <div className="flex space-x-3">
            {selectedFormat === 'text' && (
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  copySuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'コピー完了!' : 'コピー'}</span>
              </button>
            )}

            {selectedFormat === 'visual' && (
              <button
                onClick={handleDownloadVisual}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ダウンロード</span>
              </button>
            )}

            {selectedFormat === 'link' && (
              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  copySuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'コピー完了!' : 'URLをコピー'}</span>
              </button>
            )}

            {/* Web Share API対応 */}
            {navigator.share && (
              <button
                onClick={handleWebShare}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  shareSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>{shareSuccess ? '共有完了!' : '共有'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollShareModal;