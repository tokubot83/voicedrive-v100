/**
 * ガイドハブページ
 * ユーザーの権限レベルに応じて、適切なガイドを案内
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { MobileFooter } from '../components/layout/MobileFooter';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { Book, Users, Briefcase, Search, HelpCircle } from 'lucide-react';

const GuidesHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const permissionLevel = user?.permissionLevel || 1;

  // 権限レベルに応じた推奨ガイドを決定
  const getRecommendedGuide = () => {
    if (permissionLevel >= 1 && permissionLevel <= 4.5) {
      return {
        title: '一般職員向けガイド',
        description: '基本的な使い方を分かりやすく説明',
        link: '/role-guides/staff-basic',
        icon: '👋',
        color: 'blue'
      };
    } else if (permissionLevel >= 5 && permissionLevel <= 11) {
      return {
        title: '管理職向けガイド',
        description: '投稿管理・チーム運営の総合ガイド',
        link: '/role-guides/manager',
        icon: '🤝',
        color: 'purple'
      };
    } else if (permissionLevel >= 12 && permissionLevel <= 13) {
      return {
        title: '施設経営層向けガイド',
        description: 'ダッシュボード・経営分析機能',
        link: '/user-guide', // 今後実装
        icon: '📊',
        color: 'orange'
      };
    } else if (permissionLevel >= 14 && permissionLevel <= 17) {
      return {
        title: '人事部門向けガイド',
        description: '職員管理・権限設定・人事分析の専門ガイド',
        link: '/role-guides/hr',
        icon: '👥',
        color: 'green'
      };
    } else if (permissionLevel === 99) {
      return {
        title: 'システム管理者向けガイド',
        description: 'システム設定・セキュリティ・バックアップ管理',
        link: '/role-guides/system-admin',
        icon: '⚙️',
        color: 'red'
      };
    } else {
      return {
        title: '一般ガイド',
        description: '基本的な使い方',
        link: '/user-guide',
        icon: '📖',
        color: 'gray'
      };
    }
  };

  const recommendedGuide = getRecommendedGuide();

  // 機能別ガイド一覧
  const featureGuides = [
    {
      title: '面談予約',
      description: '上司との1on1面談の予約方法',
      link: '/interview-guide',
      icon: '📅',
      color: 'purple'
    },
    {
      title: 'フリーボイス',
      description: '自由な意見投稿の使い方',
      link: '/free-voice-guide',
      icon: '💬',
      color: 'green'
    },
    {
      title: 'アイデアボイス',
      description: '改善提案と投票システム',
      link: '/idea-voice-guide',
      icon: '💡',
      color: 'yellow'
    },
    {
      title: '投票システム',
      description: '公平な投票の仕組み',
      link: '/staff-voting-guide',
      icon: '🗳️',
      color: 'blue'
    },
    {
      title: 'コンプライアンス窓口',
      description: '安心して相談できる仕組み',
      link: '/compliance-guide',
      icon: '🛡️',
      color: 'red'
    }
  ];

  // 管理職向け追加ガイド
  const managerGuides = [
    {
      title: '投稿管理の詳細ガイド',
      description: '物語形式で学ぶ投稿管理',
      link: '/proposal-management-guide',
      icon: '📝',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 w-full flex flex-col">
      <div className="flex-1 w-full p-6 pb-20 lg:pb-16">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <Book className="w-12 h-12" />
            VoiceDrive 使い方ガイド
          </h1>
          <p className="text-xl text-gray-300">
            あなたに最適なガイドを見つけて、VoiceDriveを使いこなしましょう
          </p>
        </div>

        {/* あなたへのおすすめ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            あなたの役割に合わせたガイド
          </h2>
          <div
            onClick={() => navigate(recommendedGuide.link)}
            className={`bg-gradient-to-r from-${recommendedGuide.color}-900/30 to-${recommendedGuide.color}-800/30 rounded-2xl p-8 border border-${recommendedGuide.color}-500/30 hover:border-${recommendedGuide.color}-500/50 transition-all cursor-pointer transform hover:scale-102`}
          >
            <div className="flex items-start gap-6">
              <div className="text-6xl">{recommendedGuide.icon}</div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-3">{recommendedGuide.title}</h3>
                <p className="text-xl text-gray-300 mb-4">{recommendedGuide.description}</p>
                <button className={`px-6 py-3 bg-${recommendedGuide.color}-600 hover:bg-${recommendedGuide.color}-700 text-white rounded-lg font-semibold transition-colors`}>
                  このガイドを見る →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 機能別ガイド */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-8 h-8" />
            機能別ガイド
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureGuides.map((guide, index) => (
              <div
                key={index}
                onClick={() => navigate(guide.link)}
                className={`bg-${guide.color}-900/20 rounded-xl p-6 border border-${guide.color}-500/30 hover:border-${guide.color}-500/50 transition-all cursor-pointer`}
              >
                <div className="text-4xl mb-4">{guide.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{guide.title}</h3>
                <p className="text-gray-300 mb-4">{guide.description}</p>
                <span className={`text-sm text-${guide.color}-400 hover:text-${guide.color}-300`}>
                  詳しく見る →
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 管理職向け追加ガイド（権限レベル5以上のみ表示） */}
        {permissionLevel >= 5 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-8 h-8" />
              管理職向け専門ガイド
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managerGuides.map((guide, index) => (
                <div
                  key={index}
                  onClick={() => navigate(guide.link)}
                  className={`bg-${guide.color}-900/20 rounded-xl p-6 border border-${guide.color}-500/30 hover:border-${guide.color}-500/50 transition-all cursor-pointer`}
                >
                  <div className="text-4xl mb-4">{guide.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{guide.title}</h3>
                  <p className="text-gray-300 mb-4">{guide.description}</p>
                  <span className={`text-sm text-${guide.color}-400 hover:text-${guide.color}-300`}>
                    詳しく見る →
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* よくある質問 */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-8 h-8" />
            よくある質問・FAQ検索
          </h2>
          <div
            onClick={() => navigate('/user-guide')}
            className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 border border-cyan-500/30 hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="text-5xl">🔍</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">キーワードでFAQ検索</h3>
                <p className="text-lg text-gray-300 mb-4">
                  「ログイン」「面談」「投票」などのキーワードで、よくある質問を検索できます
                </p>
                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors">
                  FAQ検索ページへ →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 困ったときは */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🤝</span>
            ガイドで解決しない場合
          </h3>
          <div className="space-y-3 text-gray-300">
            <p className="text-lg">以下の方法でサポートを受けられます：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span>📞</span>
                  人事部門に連絡
                </h4>
                <p className="text-lg">内線: 1234</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span>💬</span>
                  直属の上司に相談
                </h4>
                <p className="text-lg">気軽にお声がけください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
};

export default GuidesHub;
