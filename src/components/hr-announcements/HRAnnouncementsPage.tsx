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

  // モックデータ - 実際はAPIから取得
  useEffect(() => {
    const mockData: HRAnnouncement[] = [
      {
        id: '1',
        title: '本日の出勤について',
        content: '大雪の影響により、本日は在宅勤務を推奨します。\n出勤が必要な方は、安全を最優先に行動してください。\n詳細は各部署の管理者へお問い合わせください。',
        category: 'URGENT',
        priority: 'URGENT',
        authorId: 'hr001',
        authorName: '田中',
        authorDepartment: '人事部',
        publishAt: new Date(),
        isActive: true,
        requireResponse: true,
        responseType: 'acknowledged',
        responseText: '了解しました',
        responseRequired: false,
        targetAudience: { isGlobal: true },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          delivered: 1250,
          responses: 142,
          completions: 0
        }
      },
      {
        id: '2',
        title: '定期面談のご案内',
        content: '今期の定期面談を実施いたします。\n実施期間：1月15日（水）〜 1月31日（金）\n所要時間：30分程度\n面談内容：目標設定、キャリア相談、健康状態確認',
        category: 'MEETING',
        priority: 'NORMAL',
        authorId: 'hr002',
        authorName: '佐藤',
        authorDepartment: '人事部',
        publishAt: new Date(Date.now() - 30 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: true },
        actionButton: {
          text: '📅 面談予約する',
          url: '/booking/meeting',
          type: 'internal'
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        stats: {
          delivered: 1250,
          responses: 0,
          completions: 189
        }
      },
      {
        id: '3',
        title: '【実施期間】2025年度ストレスチェックのご案内',
        content: '労働安全衛生法に基づく、年1回のストレスチェックを実施いたします。\n実施期間：2025年1月15日（水）〜 1月31日（金）\n所要時間：約10分程度\n対象者：全従業員（パート・アルバイト含む）',
        category: 'HEALTH',
        priority: 'HIGH',
        authorId: 'hr003',
        authorName: '健康管理室',
        authorDepartment: '人事部',
        publishAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isActive: true,
        requireResponse: false,
        targetAudience: { isGlobal: true },
        actionButton: {
          text: '🔍 ストレスチェックを開始する',
          url: '/stress-check-demo',
          type: 'internal'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        stats: {
          delivered: 1250,
          responses: 0,
          completions: 156
        }
      },
      {
        id: '4',
        title: 'コンプライアンス研修のご案内',
        content: '下記の日程でコンプライアンス研修を実施します。\n日時：2025年1月20日（月）13:00-17:00\n場所：3F会議室A（オンライン参加可）\n対象：全正社員（必須）',
        category: 'TRAINING',
        priority: 'NORMAL',
        authorId: 'hr002',
        authorName: '鈴木',
        authorDepartment: '人事部',
        publishAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isActive: true,
        requireResponse: true,
        responseType: 'custom',
        responseText: '参加申込み完了',
        responseRequired: true,
        targetAudience: { isGlobal: false, roles: ['正社員'] },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        stats: {
          delivered: 890,
          responses: 89,
          completions: 0
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
            {unreadCount > 0 && (
              <span className="hr-title-badge">{unreadCount}</span>
            )}
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