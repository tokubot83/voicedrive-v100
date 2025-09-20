import React, { useState, useEffect } from 'react';
import { HRAnnouncement, CategoryConfig, HRAnnouncementFilter } from '../../types/hr-announcements';
import HRMessageBubble from './HRMessageBubble';
import HRCategoryFilter from './HRCategoryFilter';
import HRDateDivider from './HRDateDivider';

// カテゴリ設定
const categoryConfigs: CategoryConfig[] = [
  {
    key: 'URGENT',
    label: '緊急',
    icon: '🚨',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  {
    key: 'MEETING',
    label: '面談',
    icon: '🤝',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  {
    key: 'TRAINING',
    label: '研修',
    icon: '🎓',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  {
    key: 'HEALTH',
    label: '健康管理',
    icon: '🏥',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  {
    key: 'OTHER',
    label: 'その他',
    icon: '📢',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)'
  }
];

const HRAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>([]);
  const [filter, setFilter] = useState<HRAnnouncementFilter>({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // モックデータ - 医療チーム統合対応版
  useEffect(() => {
    const mockData: HRAnnouncement[] = [
      {
        id: '1',
        title: '【医療チーム連携】ストレスチェック結果に基づく面談のご案内',
        content: '医療チームのAI分析により、ストレスレベルが高い職員の方々に個別面談をご案内しております。\n\n📊 分析結果：中〜高ストレス状態\n🎯 推奨アクション：早期の面談実施\n⏰ 面談可能時間：平日10:00-18:00\n\n※医療チームと連携し、最適な面談日程を3パターンご提案します',
        category: 'URGENT',
        priority: 'URGENT', // 医療チームへは「high」として送信
        authorId: 'medical_ai',
        authorName: '医療チーム統合システム',
        authorDepartment: '健康管理センター × 人事部',
        publishAt: new Date(),
        isActive: true,
        requireResponse: true,
        responseType: 'acknowledged',
        responseText: '面談を予約する',
        responseRequired: false,
        targetAudience: { isGlobal: false, individuals: ['高ストレス対象者'] },
        actionButton: {
          text: '🏥 医療チーム面談予約',
          url: '/medical/booking',
          type: 'medical_system'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          delivered: 45,
          responses: 12,
          completions: 8
        }
      },
      {
        id: '2',
        title: '【統合通知】健康診断結果のフォローアップ面談',
        content: '年次健康診断の結果、要経過観察・要再検査の方へのフォローアップ面談を実施します。\n\n🔍 医療チームからの推奨事項：\n• 産業医との面談（30分）\n• 健康改善プログラムのご案内\n• メンタルヘルスサポート\n\n優先度：HIGH（医療チーム基準：high）',
        category: 'HEALTH',
        priority: 'HIGH', // 医療チームへは「high」として送信
        authorId: 'hr002',
        authorName: '産業保健チーム',
        authorDepartment: '健康管理センター',
        publishAt: new Date(Date.now() - 30 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: false, departments: ['要フォロー対象者'] },
        actionButton: {
          text: '📋 健康相談を予約',
          url: '/health/consultation',
          type: 'medical_system'
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        stats: {
          delivered: 230,
          responses: 0,
          completions: 89
        }
      },
      {
        id: '3',
        title: '【医療チーム推奨】定期メンタルヘルス面談の実施',
        content: '医療チームのデータ分析に基づき、定期的なメンタルヘルス面談を推奨します。\n\n🤖 AI分析による推奨対象者：\n• 残業時間が月45時間超の方\n• 前回面談から6ヶ月経過の方\n• ストレスチェック未実施の方\n\n優先度：NORMAL（医療チーム基準：medium）',
        category: 'MEETING',
        priority: 'NORMAL',
        authorId: 'medical_hr',
        authorName: '医療チーム×人事部',
        authorDepartment: '統合健康管理センター',
        publishAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: true },
        actionButton: {
          text: '🧠 メンタルヘルス面談予約',
          url: '/mental-health/booking',
          type: 'medical_system'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stats: {
          delivered: 380,
          responses: 45,
          completions: 156
        }
      },
      {
        id: '4',
        title: '【低優先度】健康増進プログラムのご案内',
        content: '医療チームと連携した健康増進プログラムを開始します。\n\n🏃 プログラム内容：\n• ウォーキングチャレンジ\n• 栄養改善セミナー\n• 睡眠改善ワークショップ\n\n優先度：LOW（医療チーム基準：low）\n※任意参加のプログラムです',
        category: 'HEALTH',
        priority: 'LOW', // 医療チームへは「low」として送信
        authorId: 'wellness',
        authorName: 'ウェルネスチーム',
        authorDepartment: '健康推進課',
        publishAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: true },
        actionButton: {
          text: '💪 プログラムに参加',
          url: '/wellness/program',
          type: 'medical_system'
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        stats: {
          delivered: 1250,
          responses: 234,
          completions: 67
        }
      },
      {
        id: '5',
        title: '【医療チーム×人事部】統合システムによる優先度管理の開始',
        content: '医療チームシステムとの統合により、お知らせの優先度管理が強化されました。\n\n🔄 優先度マッピング：\n• VoiceDrive: URGENT/HIGH → 医療チーム: high\n• VoiceDrive: NORMAL → 医療チーム: medium\n• VoiceDrive: LOW → 医療チーム: low\n\n✨ 統合のメリット：\n• 医療現場の実務に適した3段階管理\n• AIによる自動優先度判定\n• リアルタイム健康状態モニタリング',
        category: 'OTHER',
        priority: 'NORMAL',
        authorId: 'system',
        authorName: 'システム管理者',
        authorDepartment: 'IT統合推進室',
        publishAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: true },
        actionButton: {
          text: '📊 統合テストページへ',
          url: '/medical-integration-test',
          type: 'internal'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        stats: {
          delivered: 1250,
          responses: 0,
          completions: 450
        }
      }
    ];

    // 実際の実装ではAPIコール
    setTimeout(() => {
      setAnnouncements(mockData);
      setUnreadCount(mockData.length);
      setLoading(false);
    }, 500);
  }, []);

  const handleCategoryFilter = (categories: HRAnnouncement['category'][]) => {
    setFilter({ ...filter, categories });
  };

  const handleResponse = async (announcementId: string, responseType: string) => {
    // 実際の実装ではAPIコール
    console.log('Response:', { announcementId, responseType });

    // 楽観的UI更新
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === announcementId
          ? { ...ann, stats: { ...ann.stats!, responses: (ann.stats?.responses || 0) + 1 } }
          : ann
      )
    );
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter.categories && !filter.categories.includes(announcement.category)) {
      return false;
    }
    return true;
  });

  const groupedAnnouncements = groupAnnouncementsByDate(filteredAnnouncements);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hr-announcements-page">
      {/* タイトルヘッダー */}
      <div className="hr-title-header">
        <div className="hr-title-content">
          <div className="hr-title-icon">📢</div>
          <h1 className="hr-title-text">
            人事部からのお知らせ
          </h1>
        </div>
      </div>

      {/* カテゴリフィルター */}
      <HRCategoryFilter
        categories={categoryConfigs}
        onFilter={handleCategoryFilter}
      />

      {/* メッセージエリア */}
      <div className="hr-messages-container">
        {Object.entries(groupedAnnouncements).map(([date, dayAnnouncements]) => (
          <div key={date}>
            <HRDateDivider date={date} />
            {dayAnnouncements.map((announcement) => (
              <HRMessageBubble
                key={announcement.id}
                announcement={announcement}
                categoryConfig={categoryConfigs.find(c => c.key === announcement.category)!}
                onResponse={handleResponse}
              />
            ))}
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <span className="text-4xl mb-4 block">📭</span>
            <p>お知らせはありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 日付でグループ化
function groupAnnouncementsByDate(announcements: HRAnnouncement[]): Record<string, HRAnnouncement[]> {
  const grouped: Record<string, HRAnnouncement[]> = {};

  announcements.forEach(announcement => {
    const date = formatDateGroup(announcement.publishAt);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(announcement);
  });

  // 各日付内でソート（新しいものが上）
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => b.publishAt.getTime() - a.publishAt.getTime());
  });

  return grouped;
}

function formatDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return '今日';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return '昨日';
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`;
  }
}

export default HRAnnouncementsPage;