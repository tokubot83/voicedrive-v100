/**
 * お知らせ配信管理パネル
 * 秘密情報配信機能を含む管理画面
 * @version 1.0.0
 * @date 2025-09-25
 */

import React, { useState, useEffect } from 'react';
import { Shield, Send, Lock, Clock, AlertTriangle, Check, X, Eye, EyeOff } from 'lucide-react';
import { secretDeliveryService } from '../../services/SecretDeliveryService';

// ==================== 型定義 ====================

interface SecretFormData {
  recipient: string;
  secrets: Record<string, string>;
  expiresIn: number;
  requiresMFA: boolean;
  ipRestrictions: string;
  notifyEmail: boolean;
  notifySlack: boolean;
  notifyTeams: boolean;
}

interface DeliveryHistory {
  deliveryId: string;
  recipient: string;
  createdAt: Date;
  expiresAt: Date;
  accessed: boolean;
  status: 'pending' | 'accessed' | 'expired';
}

// ==================== メインコンポーネント ====================

const NotificationDeliveryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deliver' | 'history'>('deliver');
  const [formData, setFormData] = useState<SecretFormData>({
    recipient: '',
    secrets: {},
    expiresIn: 86400,  // 24時間
    requiresMFA: true,
    ipRestrictions: '',
    notifyEmail: true,
    notifySlack: false,
    notifyTeams: false
  });
  const [secretKey, setSecretKey] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistory[]>([]);

  // ==================== イベントハンドラー ====================

  /**
   * 秘密情報の追加
   */
  const handleAddSecret = () => {
    if (secretKey && secretValue) {
      setFormData(prev => ({
        ...prev,
        secrets: {
          ...prev.secrets,
          [secretKey]: secretValue
        }
      }));
      setSecretKey('');
      setSecretValue('');
    }
  };

  /**
   * 秘密情報の削除
   */
  const handleRemoveSecret = (key: string) => {
    setFormData(prev => {
      const newSecrets = { ...prev.secrets };
      delete newSecrets[key];
      return {
        ...prev,
        secrets: newSecrets
      };
    });
  };

  /**
   * 配信実行
   */
  const handleDeliver = async () => {
    if (!formData.recipient || Object.keys(formData.secrets).length === 0) {
      alert('受信者と秘密情報を入力してください');
      return;
    }

    setIsDelivering(true);
    setDeliveryResult(null);

    try {
      // 配信オプションの構築
      const options = {
        expiresIn: formData.expiresIn,
        requiresMFA: formData.requiresMFA,
        ipRestrictions: formData.ipRestrictions ? formData.ipRestrictions.split(',').map(ip => ip.trim()) : undefined
      };

      // 通知オプションの構築
      const notification = {
        email: formData.notifyEmail ? `${formData.recipient}@medical-system.kosei-kai.jp` : undefined,
        slack: formData.notifySlack ? '#compliance-integration' : undefined,
        teams: formData.notifyTeams ? 'コンプライアンス通知' : undefined
      };

      // 配信実行
      const result = await secretDeliveryService.deliverSecrets(
        formData.recipient,
        formData.secrets,
        options,
        notification
      );

      setDeliveryResult(result);

      // 履歴に追加
      const historyItem: DeliveryHistory = {
        deliveryId: result.deliveryId,
        recipient: formData.recipient,
        createdAt: new Date(),
        expiresAt: result.expiresAt,
        accessed: false,
        status: 'pending'
      };
      setDeliveryHistory(prev => [historyItem, ...prev]);

      // フォームをリセット
      setFormData({
        recipient: '',
        secrets: {},
        expiresIn: 86400,
        requiresMFA: true,
        ipRestrictions: '',
        notifyEmail: true,
        notifySlack: false,
        notifyTeams: false
      });

    } catch (error) {
      console.error('配信エラー:', error);
      alert('配信に失敗しました');
    } finally {
      setIsDelivering(false);
    }
  };

  /**
   * 配信状態の更新（定期的にチェック）
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryHistory(prev => prev.map(item => {
        const status = secretDeliveryService.getDeliveryStatus(item.deliveryId);

        if (!status.exists) {
          return { ...item, status: 'expired' };
        }

        if (status.accessed) {
          return { ...item, accessed: true, status: 'accessed' };
        }

        if (status.expiresAt && new Date() > status.expiresAt) {
          return { ...item, status: 'expired' };
        }

        return item;
      }));
    }, 5000);  // 5秒ごとにチェック

    return () => clearInterval(interval);
  }, []);

  // ==================== レンダリング ====================

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          お知らせ配信システム - 秘密情報管理
        </h2>
        <p className="mt-2 text-gray-600">
          本番環境の秘密情報を安全に配信します
        </p>
      </div>

      {/* タブ */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('deliver')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'deliver'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          新規配信
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          配信履歴
        </button>
      </div>

      {/* 新規配信タブ */}
      {activeTab === 'deliver' && (
        <div className="space-y-6">
          {/* 受信者設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              受信者
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="voicedrive-team"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 秘密情報入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              秘密情報
            </label>

            {/* 追加フォーム */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="キー (例: DB_PASSWORD)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type={showSecrets ? 'text' : 'password'}
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="値"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                {showSecrets ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={handleAddSecret}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
            </div>

            {/* 追加済みの秘密情報 */}
            {Object.keys(formData.secrets).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(formData.secrets).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-mono text-sm">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">
                        {showSecrets ? value : '••••••••'}
                      </span>
                      <button
                        onClick={() => handleRemoveSecret(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* オプション設定 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 有効期限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                有効期限
              </label>
              <select
                value={formData.expiresIn}
                onChange={(e) => setFormData({ ...formData, expiresIn: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="3600">1時間</option>
                <option value="21600">6時間</option>
                <option value="43200">12時間</option>
                <option value="86400">24時間</option>
                <option value="172800">48時間</option>
              </select>
            </div>

            {/* IP制限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                IP制限（カンマ区切り）
              </label>
              <input
                type="text"
                value={formData.ipRestrictions}
                onChange={(e) => setFormData({ ...formData, ipRestrictions: e.target.value })}
                placeholder="203.0.113.0, 198.51.100.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* セキュリティオプション */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresMFA}
                onChange={(e) => setFormData({ ...formData, requiresMFA: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                MFA認証を必須にする
              </span>
            </label>
          </div>

          {/* 通知設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知方法
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyEmail}
                  onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifySlack}
                  onChange={(e) => setFormData({ ...formData, notifySlack: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Slack</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyTeams}
                  onChange={(e) => setFormData({ ...formData, notifyTeams: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Teams</span>
              </label>
            </div>
          </div>

          {/* 配信ボタン */}
          <div className="flex justify-end">
            <button
              onClick={handleDeliver}
              disabled={isDelivering || !formData.recipient || Object.keys(formData.secrets).length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDelivering ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  配信中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  秘密情報を配信
                </>
              )}
            </button>
          </div>

          {/* 配信結果 */}
          {deliveryResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" />
                配信完了
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>配信ID: <span className="font-mono">{deliveryResult.deliveryId}</span></p>
                <p>トークン: <span className="font-mono bg-green-100 px-2 py-1 rounded">{deliveryResult.token}</span></p>
                <p>有効期限: {new Date(deliveryResult.expiresAt).toLocaleString('ja-JP')}</p>
                <p>アクセスURL: <a href={deliveryResult.accessUrl} className="text-blue-600 underline">{deliveryResult.accessUrl}</a></p>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    このトークンは一度だけ使用可能です。
                    受信者に安全な方法で共有してください。
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 配信履歴タブ */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {deliveryHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">配信履歴がありません</p>
          ) : (
            deliveryHistory.map(item => (
              <div
                key={item.deliveryId}
                className={`p-4 border rounded-lg ${
                  item.status === 'accessed'
                    ? 'bg-green-50 border-green-200'
                    : item.status === 'expired'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.deliveryId}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      受信者: {item.recipient}
                    </p>
                    <p className="text-sm text-gray-600">
                      配信日時: {item.createdAt.toLocaleString('ja-JP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      有効期限: {item.expiresAt.toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.status === 'accessed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <Check className="w-4 h-4" />
                        取得済み
                      </span>
                    )}
                    {item.status === 'expired' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        期限切れ
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        配信中
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDeliveryPanel;