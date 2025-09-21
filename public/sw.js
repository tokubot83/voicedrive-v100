// VoiceDrive面談予約システム Service Worker
// オフライン対応とプッシュ通知処理

const CACHE_NAME = 'voicedrive-interview-v1.2.0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24時間

// キャッシュ対象URL
const OFFLINE_CACHE_URLS = [
  '/',
  '/interview-station',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/interview-icon-192x192.png',
  '/icons/interview-icon-512x512.png',
  '/icons/offline-icon.png'
];

// 重要な面談関連エンドポイント
const INTERVIEW_API_PATTERNS = [
  '/api/interview-bookings/my-bookings',
  '/api/interview-bookings/upcoming',
  '/api/interview-schedule/available-slots',
  '/api/push-notifications/register'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('Service Worker インストール開始');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('重要リソースをキャッシュ中...');
        return cache.addAll(OFFLINE_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker インストール完了');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker インストールエラー:', error);
      })
  );
});

// Service Worker アクティベーション
self.addEventListener('activate', (event) => {
  console.log('Service Worker アクティベーション開始');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName.startsWith('voicedrive-interview');
            })
            .map((cacheName) => {
              console.log('古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker アクティベーション完了');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker アクティベーションエラー:', error);
      })
  );
});

// ネットワークリクエスト処理
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 面談予約関連APIの処理
  if (isInterviewApiRequest(requestUrl.pathname)) {
    event.respondWith(handleInterviewApiRequest(event.request));
    return;
  }

  // 静的リソースの処理
  if (event.request.method === 'GET') {
    event.respondWith(handleStaticResourceRequest(event.request));
    return;
  }
});

// プッシュ通知受信処理（優先度対応版）
self.addEventListener('push', (event) => {
  console.log('プッシュ通知受信:', event.data?.text());

  if (!event.data) {
    return;
  }

  try {
    const notificationData = event.data.json();
    // 優先度とカテゴリ情報を含む通知データ
    const enhancedData = {
      ...notificationData,
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'system'
    };
    event.waitUntil(showNotification(enhancedData));
  } catch (error) {
    console.error('プッシュ通知データ解析エラー:', error);
  }
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
  console.log('通知クリック:', event.notification.tag);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  event.waitUntil(handleNotificationClick(action, data));
});

// 通知閉じる処理
self.addEventListener('notificationclose', (event) => {
  console.log('通知閉じる:', event.notification.tag);

  // 通知統計を記録
  if (event.notification.data?.bookingId) {
    recordNotificationInteraction('closed', event.notification.data);
  }
});

// 面談API判定
function isInterviewApiRequest(pathname) {
  return INTERVIEW_API_PATTERNS.some(pattern => pathname.includes(pattern));
}

// 面談APIリクエスト処理（オフライン対応）
async function handleInterviewApiRequest(request) {
  const url = request.url;
  const method = request.method;

  try {
    // オンライン時はネットワークを優先
    if (navigator.onLine) {
      const response = await fetch(request);

      // 成功レスポンスをキャッシュ
      if (response.ok && method === 'GET') {
        const cache = await caches.open(CACHE_NAME);
        const responseClone = response.clone();

        // キャッシュメタデータ追加
        const cachedResponse = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'Cache-Timestamp': new Date().toISOString(),
            'Cache-Source': 'network'
          }
        });

        await cache.put(request, cachedResponse);
      }

      return response;
    } else {
      throw new Error('オフライン状態');
    }
  } catch (error) {
    console.log('ネットワークエラー、キャッシュから取得:', error.message);

    // オフライン時はキャッシュから取得
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // キャッシュの有効期限チェック
      const cacheTimestamp = cachedResponse.headers.get('Cache-Timestamp');
      if (cacheTimestamp) {
        const cacheAge = Date.now() - new Date(cacheTimestamp).getTime();
        if (cacheAge < CACHE_EXPIRY) {
          console.log('有効なキャッシュデータを返却');
          return cachedResponse;
        } else {
          console.log('キャッシュが期限切れ');
        }
      }
    }

    // 面談データのフォールバック処理
    return createOfflineFallbackResponse(request);
  }
}

// 静的リソースリクエスト処理
async function handleStaticResourceRequest(request) {
  try {
    // キャッシュを先に確認
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // バックグラウンドでネットワーク更新を試行
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // ネットワークエラーは無視
        });

      return cachedResponse;
    }

    // キャッシュにない場合はネットワークから取得
    const response = await fetch(request);

    if (response.ok) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }

    return response;
  } catch (error) {
    console.error('リソース取得エラー:', error);

    // オフライン表示ページを返却
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') ||
             new Response('オフライン - インターネット接続を確認してください', {
               status: 503,
               headers: { 'Content-Type': 'text/plain; charset=utf-8' }
             });
    }

    return new Response('リソースが利用できません', { status: 503 });
  }
}

// オフライン時のフォールバック応答作成
function createOfflineFallbackResponse(request) {
  const url = new URL(request.url);

  // 予約一覧のオフラインデータ
  if (url.pathname.includes('my-bookings')) {
    const offlineBookings = getOfflineBookingData();
    return new Response(JSON.stringify({
      success: true,
      data: offlineBookings,
      isOffline: true,
      message: 'オフラインデータを表示中'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Source': 'offline-fallback'
      }
    });
  }

  // 利用可能枠のオフライン応答
  if (url.pathname.includes('available-slots')) {
    return new Response(JSON.stringify({
      success: false,
      message: 'オフライン中は予約枠の確認ができません。オンライン復帰後に再試行してください。',
      isOffline: true
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify({
    success: false,
    message: 'オフライン中はこの機能をご利用いただけません',
    isOffline: true
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// プッシュ通知表示（優先度対応版）
async function showNotification(data) {
  const { title, body, icon, badge, actions, requireInteraction, vibrate, tag, priority, category, data: notificationData } = data;

  const options = {
    body,
    icon: icon || '/icon-192x192.png',
    badge: badge || '/icon-72x72.png',
    data: {
      ...notificationData,
      priority: priority || 'medium',
      category: category || 'system'
    },
    requireInteraction: requireInteraction || (priority === 'critical' || priority === 'high'),
    vibrate: getVibrationPattern(priority || 'medium'),
    tag: tag || `voicedrive-${category}-${Date.now()}`,
    actions: actions || getActionsForCategory(category || 'system'),
    timestamp: Date.now(),
    silent: priority === 'low'
  };

  // 通知表示
  await self.registration.showNotification(title, options);

  // 表示統計記録
  if (notificationData?.bookingId) {
    recordNotificationInteraction('shown', notificationData);
  }
}

// 通知クリック処理（カテゴリ別対応）
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  let targetUrl = '/';

  // カテゴリとアクションに基づくURL決定
  if (data.category === 'interview') {
    switch (action) {
      case 'accept':
        targetUrl = `/interview/accept/${data.interviewId}`;
        break;
      case 'reschedule':
        targetUrl = `/interview/reschedule/${data.interviewId}`;
        break;
      case 'view':
        targetUrl = data.actionUrl || `/interview/details/${data.interviewId}`;
        break;
      default:
        targetUrl = '/interview-station';
    }
  } else if (data.category === 'evaluation') {
    targetUrl = action === 'view' ? '/evaluation' : '/';
  } else if (data.category === 'hr_announcement') {
    targetUrl = action === 'view' ? '/announcements' : '/';
  } else if (data.category === 'project') {
    targetUrl = action === 'view' ? `/project/${data.projectId}` : '/';
  } else {
    targetUrl = data.actionUrl || '/';
  }

  // 既存ウィンドウがある場合はフォーカス
  for (const client of clients) {
    if (client.url.includes(new URL(targetUrl, self.location).origin)) {
      await client.navigate(targetUrl);
      return client.focus();
    }
  }

  // 新しいウィンドウを開く
  return self.clients.openWindow(targetUrl);
}

// オフライン予約データ取得
function getOfflineBookingData() {
  try {
    const cached = self.localStorage?.getItem('cachedInterviewBookings');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);

      // 24時間以内のキャッシュのみ有効
      const cacheAge = Date.now() - new Date(timestamp).getTime();
      if (cacheAge < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (error) {
    console.error('オフラインデータ取得エラー:', error);
  }

  // フォールバックの空データ
  return [];
}

// カレンダー追加処理
async function addToCalendar(data) {
  try {
    // カレンダーイベント作成のためのデータ
    const eventData = {
      title: '面談予約',
      start: data.interviewDateTime,
      end: data.interviewEndTime,
      description: `VoiceDrive面談システムでの予約\n予約ID: ${data.bookingId}`,
      location: '面談室'
    };

    // Web Share API対応デバイスではカレンダー連携
    if ('share' in navigator) {
      await navigator.share({
        title: eventData.title,
        text: eventData.description,
        url: data.actionUrl
      });
    }
  } catch (error) {
    console.error('カレンダー追加エラー:', error);
  }
}

// 通知インタラクション記録
function recordNotificationInteraction(interaction, data) {
  try {
    // 統計データを記録（非同期）
    fetch('/api/push-notifications/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: data.bookingId,
        employeeId: data.employeeId,
        interaction,
        timestamp: new Date().toISOString(),
        notificationType: data.type
      })
    }).catch(error => {
      console.error('通知インタラクション記録エラー:', error);
    });
  } catch (error) {
    console.error('通知統計記録エラー:', error);
  }
}

// 優先度に応じた振動パターン
function getVibrationPattern(priority) {
  switch (priority) {
    case 'critical':
      return [200, 100, 200, 100, 200];
    case 'high':
      return [200, 100, 200];
    case 'medium':
      return [200];
    case 'low':
    default:
      return [];
  }
}

// カテゴリに応じたアクション定義
function getActionsForCategory(category) {
  switch (category) {
    case 'interview':
      return [
        { action: 'accept', title: '承諾' },
        { action: 'reschedule', title: '日程変更' }
      ];
    case 'evaluation':
      return [
        { action: 'view', title: '確認' },
        { action: 'dismiss', title: '後で' }
      ];
    case 'hr_announcement':
      return [
        { action: 'view', title: '詳細を見る' }
      ];
    case 'project':
      return [
        { action: 'view', title: '参加' },
        { action: 'dismiss', title: '後で確認' }
      ];
    case 'survey':
      return [
        { action: 'view', title: '回答する' },
        { action: 'dismiss', title: '後で' }
      ];
    case 'feedback':
      return [
        { action: 'view', title: '確認' }
      ];
    case 'shift':
      return [
        { action: 'view', title: '確認' },
        { action: 'accept', title: '承諾' }
      ];
    case 'training':
      return [
        { action: 'view', title: '詳細' },
        { action: 'register', title: '申し込む' }
      ];
    default:
      return [
        { action: 'view', title: '開く' },
        { action: 'dismiss', title: '閉じる' }
      ];
  }
}

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('バックグラウンド同期:', event.tag);

  if (event.tag === 'sync-interview-bookings') {
    event.waitUntil(syncInterviewBookings());
  }
});

// 面談予約データ同期
async function syncInterviewBookings() {
  try {
    console.log('面談予約データ同期開始');

    const response = await fetch('/api/interview-bookings/my-bookings');
    if (response.ok) {
      const bookings = await response.json();

      // ローカルストレージにキャッシュ保存
      if (self.localStorage) {
        self.localStorage.setItem('cachedInterviewBookings', JSON.stringify({
          data: bookings,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }));
      }

      console.log('面談予約データ同期完了:', bookings.length, '件');
    }
  } catch (error) {
    console.error('面談予約データ同期エラー:', error);
  }
}