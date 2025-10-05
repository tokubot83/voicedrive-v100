/**
 * VoiceDriveデータ分析同意取得モーダル
 *
 * 職員カルテシステムとの連携における同意取得UI
 * 初回投稿時（議題モード・プロジェクト化モード共通）に表示
 */

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Shield, Eye, Lock, Settings } from 'lucide-react';

interface DataConsentModalProps {
  isOpen: boolean;
  onConsent: (consented: boolean) => void;
  onViewPolicy: () => void;
  onClose?: () => void;
}

export const DataConsentModal: React.FC<DataConsentModalProps> = ({
  isOpen,
  onConsent,
  onViewPolicy,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsent = async (consented: boolean) => {
    setIsSubmitting(true);
    try {
      await onConsent(consented);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/30">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 border-b border-blue-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📋 VoiceDriveデータの取り扱いについて
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  組織改善・キャリア支援のための同意確認
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 導入文 */}
          <div className="bg-blue-900/20 border-2 border-blue-500/30 rounded-lg p-5">
            <p className="text-white text-lg leading-relaxed">
              あなたの<strong className="text-blue-300">VoiceDrive活動データ</strong>
              （投稿・投票・コメント）を<br />
              組織改善とあなたのキャリア支援のため<br />
              職員カルテシステムで分析させていただきます。
            </p>
          </div>

          {/* 対象データ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-semibold">
              <Eye className="w-5 h-5" />
              <h3>対象データ：</h3>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>議題モードでの投稿・投票・コメント</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>プロジェクト化モードでの活動データ</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-200">
                  ※両モード共通で分析対象となります
                </span>
              </li>
            </ul>
          </div>

          {/* 分析の目的 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-semibold">
              <Shield className="w-5 h-5" />
              <h3>分析の目的：</h3>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>組織課題の早期発見（部署別・職種別傾向等）</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>世代間・階層間の傾向把握</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>あなたへの建設的フィードバック提供</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold">•</span>
                <span>キャリア面談での話題提供</span>
              </li>
            </ul>
          </div>

          {/* プライバシー保護 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-300 font-semibold">
              <Lock className="w-5 h-5" />
              <h3>プライバシー保護：</h3>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>匿名投稿は完全に匿名性を保持</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>個人を特定できない集団分析が基本</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong>人事評価への直接利用は一切ありません</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>投稿内容は外部送信せず完全ローカル処理</span>
              </li>
            </ul>
          </div>

          {/* あなたの権利 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <Settings className="w-5 h-5" />
              <h3>あなたの権利：</h3>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">✓</span>
                <span>いつでも同意を取り消せます</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">✓</span>
                <span>過去データの削除も可能です</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">✓</span>
                <span>設定画面から変更できます</span>
              </li>
            </ul>
          </div>

          {/* プライバシーポリシーリンク */}
          <div className="text-center pt-4">
            <button
              onClick={onViewPolicy}
              className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
              disabled={isSubmitting}
            >
              📄 プライバシーポリシーを確認する
            </button>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>※同意しなくても投稿は可能です。</strong><br />
              ただし、組織分析・個人フィードバックは提供されません。
            </p>
          </div>
        </div>

        {/* フッター（アクションボタン） */}
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-sm p-6 border-t border-slate-700/50">
          <div className="flex gap-4">
            <button
              onClick={() => handleConsent(true)}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                       bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500
                       text-white font-bold rounded-lg transition-all duration-150
                       shadow-lg hover:shadow-green-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? '処理中...' : '✅ 同意して投稿する'}
            </button>
            <button
              onClick={() => handleConsent(false)}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                       bg-slate-700 hover:bg-slate-600
                       text-white font-semibold rounded-lg transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              {isSubmitting ? '処理中...' : '❌ 同意せずに投稿する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataConsentModal;
